package adapter

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type GeminiAdapter struct {
	APIKey  string
	BaseURL string
	client  *http.Client
}

func NewGeminiAdapter(apiKey, baseURL string) *GeminiAdapter {
	if baseURL == "" {
		baseURL = "https://generativelanguage.googleapis.com/v1beta"
	}
	return &GeminiAdapter{
		APIKey:  apiKey,
		BaseURL: baseURL,
		client:  &http.Client{},
	}
}

type geminiContent struct {
	Role  string        `json:"role"`
	Parts []geminiPart  `json:"parts"`
}

type geminiPart struct {
	Text string `json:"text"`
}

type geminiRequest struct {
	Contents         []geminiContent  `json:"contents"`
	GenerationConfig *geminiGenConfig `json:"generationConfig,omitempty"`
}

type geminiGenConfig struct {
	MaxOutputTokens int     `json:"maxOutputTokens,omitempty"`
	Temperature     float64 `json:"temperature,omitempty"`
}

type geminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []geminiPart `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
	UsageMetadata struct {
		TotalTokenCount int `json:"totalTokenCount"`
	} `json:"usageMetadata"`
}

func (a *GeminiAdapter) buildContents(messages []Message) []geminiContent {
	out := make([]geminiContent, 0, len(messages))
	for _, m := range messages {
		role := m.Role
		if role == "assistant" {
			role = "model"
		}
		if role == "system" {
			continue
		}
		out = append(out, geminiContent{
			Role:  role,
			Parts: []geminiPart{{Text: m.Content}},
		})
	}
	return out
}

func (a *GeminiAdapter) ChatCompletion(ctx context.Context, model string, messages []Message, options ChatOptions) (ChatResponse, error) {
	reqBody := geminiRequest{
		Contents: a.buildContents(messages),
	}
	if options.MaxTokens > 0 {
		reqBody.GenerationConfig = &geminiGenConfig{MaxOutputTokens: options.MaxTokens}
	}

	body, err := json.Marshal(reqBody)
	if err != nil {
		return ChatResponse{}, err
	}

	url := fmt.Sprintf("%s/models/%s:generateContent?key=%s", a.BaseURL, model, a.APIKey)
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(body))
	if err != nil {
		return ChatResponse{}, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := a.client.Do(req)
	if err != nil {
		return ChatResponse{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return ChatResponse{}, fmt.Errorf("gemini error %d: %s", resp.StatusCode, string(b))
	}

	var result geminiResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return ChatResponse{}, err
	}

	content := ""
	if len(result.Candidates) > 0 && len(result.Candidates[0].Content.Parts) > 0 {
		content = result.Candidates[0].Content.Parts[0].Text
	}
	return ChatResponse{Content: content, TokenCount: result.UsageMetadata.TotalTokenCount}, nil
}

func (a *GeminiAdapter) ChatCompletionStream(ctx context.Context, model string, messages []Message, options ChatOptions) (<-chan ChatStreamChunk, error) {
	// Gemini streaming uses SSE with the streamGenerateContent endpoint
	reqBody := geminiRequest{
		Contents: a.buildContents(messages),
	}

	body, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	url := fmt.Sprintf("%s/models/%s:streamGenerateContent?key=%s&alt=sse", a.BaseURL, model, a.APIKey)
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := a.client.Do(req)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		return nil, fmt.Errorf("gemini error %d: %s", resp.StatusCode, string(b))
	}

	ch := make(chan ChatStreamChunk, 10)
	go func() {
		defer resp.Body.Close()
		defer close(ch)

		decoder := json.NewDecoder(resp.Body)
		for {
			var result geminiResponse
			if err := decoder.Decode(&result); err != nil {
				if err == io.EOF {
					ch <- ChatStreamChunk{Done: true}
				}
				return
			}

			if len(result.Candidates) > 0 && len(result.Candidates[0].Content.Parts) > 0 {
				content := result.Candidates[0].Content.Parts[0].Text
				if content != "" {
					select {
					case ch <- ChatStreamChunk{Content: content}:
					case <-ctx.Done():
						return
					}
				}
			}
		}
	}()

	return ch, nil
}

// GenerateImage implements ImageAdapter for Gemini Imagen
func (a *GeminiAdapter) GenerateImage(ctx context.Context, model string, prompt string, options ImageOptions) ([]string, error) {
	type imageRequest struct {
		Instances []struct {
			Prompt string `json:"prompt"`
		} `json:"instances"`
		Parameters struct {
			SampleCount int `json:"sampleCount"`
		} `json:"parameters"`
	}

	reqBody := imageRequest{}
	reqBody.Instances = []struct {
		Prompt string `json:"prompt"`
	}{{Prompt: prompt}}
	reqBody.Parameters.SampleCount = 1

	body, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	url := fmt.Sprintf("%s/models/%s:predict?key=%s", a.BaseURL, model, a.APIKey)
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := a.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("gemini image error %d: %s", resp.StatusCode, string(b))
	}

	var result struct {
		Predictions []struct {
			BytesBase64Encoded string `json:"bytesBase64Encoded"`
			MimeType           string `json:"mimeType"`
		} `json:"predictions"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	urls := make([]string, 0, len(result.Predictions))
	for _, p := range result.Predictions {
		urls = append(urls, "data:"+p.MimeType+";base64,"+p.BytesBase64Encoded)
	}
	return urls, nil
}

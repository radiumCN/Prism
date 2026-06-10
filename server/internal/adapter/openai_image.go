package adapter

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// OpenAIImageAdapter implements ImageAdapter for OpenAI DALL-E (/v1/images/generations).
// It also works with compatible gateways (new-api, one-api, etc.) that proxy DALL-E.
type OpenAIImageAdapter struct {
	apiKey  string
	baseURL string
	client  *http.Client
}

func NewOpenAIImageAdapter(apiKey, baseURL string) *OpenAIImageAdapter {
	if baseURL == "" {
		baseURL = "https://api.openai.com"
	}
	baseURL = strings.TrimRight(baseURL, "/")
	// If the caller already appended /v1 (common for OpenAI-compatible gateways),
	// strip it so we can append the full path uniformly below.
	baseURL = strings.TrimSuffix(baseURL, "/v1")
	return &OpenAIImageAdapter{
		apiKey:  apiKey,
		baseURL: baseURL,
		client:  &http.Client{Timeout: 120 * time.Second},
	}
}

type openAIImageRequest struct {
	Model          string `json:"model"`
	Prompt         string `json:"prompt"`
	N              int    `json:"n,omitempty"`
	Size           string `json:"size,omitempty"`
	Style          string `json:"style,omitempty"`  // vivid | natural
	Quality        string `json:"quality,omitempty"` // standard | hd
	ResponseFormat string `json:"response_format,omitempty"` // url | b64_json
}

type openAIImageResponse struct {
	Created int64 `json:"created"`
	Data    []struct {
		URL           string `json:"url"`
		B64JSON       string `json:"b64_json"`
		RevisedPrompt string `json:"revised_prompt"`
	} `json:"data"`
	Error *struct {
		Message string `json:"message"`
		Type    string `json:"type"`
	} `json:"error"`
}

// sizeFromOptions converts width/height to DALL-E accepted size string.
// DALL-E 2: 256x256, 512x512, 1024x1024
// DALL-E 3: 1024x1024, 1024x1792, 1792x1024
func sizeFromOptions(model string, opts ImageOptions) string {
	if opts.Width > 0 && opts.Height > 0 {
		return fmt.Sprintf("%dx%d", opts.Width, opts.Height)
	}
	if strings.Contains(model, "dall-e-3") || strings.Contains(model, "dalle-3") {
		return "1024x1024"
	}
	return "1024x1024"
}

func (a *OpenAIImageAdapter) GenerateImage(ctx context.Context, model string, prompt string, opts ImageOptions) ([]string, error) {
	n := opts.N
	if n <= 0 {
		n = 1
	}

	reqBody := openAIImageRequest{
		Model:          model,
		Prompt:         prompt,
		N:              n,
		Size:           sizeFromOptions(model, opts),
		ResponseFormat: "url",
	}
	if opts.Style != "" {
		reqBody.Style = opts.Style
	}
	if opts.Quality != "" {
		reqBody.Quality = opts.Quality
	}

	bodyBytes, _ := json.Marshal(reqBody)
	endpoint := a.baseURL + "/v1/images/generations"
	httpReq, err := http.NewRequestWithContext(ctx, "POST", endpoint, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+a.apiKey)

	resp, err := a.client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("image generation request failed: %w", err)
	}
	defer resp.Body.Close()

	raw, _ := io.ReadAll(resp.Body)
	var apiResp openAIImageResponse
	if err := json.Unmarshal(raw, &apiResp); err != nil {
		return nil, fmt.Errorf("failed to parse image response: %w", err)
	}
	if apiResp.Error != nil {
		return nil, fmt.Errorf("OpenAI image error: %s", apiResp.Error.Message)
	}
	if len(apiResp.Data) == 0 {
		return nil, fmt.Errorf("no image data returned (status %d): %s", resp.StatusCode, string(raw))
	}

	urls := make([]string, 0, len(apiResp.Data))
	for _, d := range apiResp.Data {
		if d.URL != "" {
			urls = append(urls, d.URL)
		}
	}
	return urls, nil
}

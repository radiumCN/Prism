package adapter

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

type OpenAIAdapter struct {
	APIKey  string
	BaseURL string
	client  *http.Client
}

func NewOpenAIAdapter(apiKey, baseURL string) *OpenAIAdapter {
	if baseURL == "" {
		baseURL = "https://api.openai.com/v1"
	}
	return &OpenAIAdapter{
		APIKey:  apiKey,
		BaseURL: baseURL,
		client:  &http.Client{},
	}
}

type openAIMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type openAIRequest struct {
	Model       string          `json:"model"`
	Messages    []openAIMessage `json:"messages"`
	MaxTokens   int             `json:"max_tokens,omitempty"`
	Temperature *float64        `json:"temperature,omitempty"`
	Stream      bool            `json:"stream"`
}

type openAIResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
		Delta struct {
			Content string `json:"content"`
		} `json:"delta"`
		FinishReason string `json:"finish_reason"`
	} `json:"choices"`
	Usage struct {
		TotalTokens int `json:"total_tokens"`
	} `json:"usage"`
}

func (a *OpenAIAdapter) buildMessages(messages []Message) []openAIMessage {
	out := make([]openAIMessage, 0, len(messages))
	for _, m := range messages {
		out = append(out, openAIMessage{Role: m.Role, Content: m.Content})
	}
	return out
}

func (a *OpenAIAdapter) ChatCompletion(ctx context.Context, model string, messages []Message, options ChatOptions) (ChatResponse, error) {
	reqBody := openAIRequest{
		Model:       model,
		Messages:    a.buildMessages(messages),
		Temperature: options.Temperature,
		MaxTokens:   options.MaxTokens,
		Stream:      false,
	}

	body, err := json.Marshal(reqBody)
	if err != nil {
		return ChatResponse{}, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", a.BaseURL+"/chat/completions", bytes.NewReader(body))
	if err != nil {
		return ChatResponse{}, err
	}
	req.Header.Set("Authorization", "Bearer "+a.APIKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := a.client.Do(req)
	if err != nil {
		return ChatResponse{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return ChatResponse{}, fmt.Errorf("openai error %d: %s", resp.StatusCode, string(b))
	}

	var result openAIResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return ChatResponse{}, err
	}

	content := ""
	if len(result.Choices) > 0 {
		content = result.Choices[0].Message.Content
	}
	return ChatResponse{Content: content, TokenCount: result.Usage.TotalTokens}, nil
}

func (a *OpenAIAdapter) ChatCompletionStream(ctx context.Context, model string, messages []Message, options ChatOptions) (<-chan ChatStreamChunk, error) {
	reqBody := openAIRequest{
		Model:       model,
		Messages:    a.buildMessages(messages),
		Temperature: options.Temperature,
		MaxTokens:   options.MaxTokens,
		Stream:      true,
	}

	body, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", a.BaseURL+"/chat/completions", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+a.APIKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := a.client.Do(req)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		return nil, fmt.Errorf("openai error %d: %s", resp.StatusCode, string(b))
	}

	ch := make(chan ChatStreamChunk, 10)
	go func() {
		defer resp.Body.Close()
		defer close(ch)

		scanner := bufio.NewScanner(resp.Body)
		for scanner.Scan() {
			line := scanner.Text()
			if !strings.HasPrefix(line, "data: ") {
				continue
			}
			data := strings.TrimPrefix(line, "data: ")
			if data == "[DONE]" {
				ch <- ChatStreamChunk{Done: true}
				return
			}

			var result openAIResponse
			if err := json.Unmarshal([]byte(data), &result); err != nil {
				continue
			}
			if len(result.Choices) > 0 {
				content := result.Choices[0].Delta.Content
				if content != "" {
					select {
					case ch <- ChatStreamChunk{Content: content}:
					case <-ctx.Done():
						return
					}
				}
				if result.Choices[0].FinishReason == "stop" {
					ch <- ChatStreamChunk{Done: true}
					return
				}
			}
		}
	}()

	return ch, nil
}

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

// --- internal wire types ---

type openAIToolCallDelta struct {
	Index    int    `json:"index"`
	ID       string `json:"id"`
	Type     string `json:"type"`
	Function struct {
		Name      string `json:"name"`
		Arguments string `json:"arguments"`
	} `json:"function"`
}

type openAIMessage struct {
	Role       string               `json:"role"`
	Content    interface{}          `json:"content"` // string or null
	ToolCalls  []openAIToolCallWire `json:"tool_calls,omitempty"`
	ToolCallID string               `json:"tool_call_id,omitempty"`
}

type openAIToolCallWire struct {
	ID       string `json:"id"`
	Type     string `json:"type"`
	Function struct {
		Name      string `json:"name"`
		Arguments string `json:"arguments"`
	} `json:"function"`
}

type openAIRequest struct {
	Model       string          `json:"model"`
	Messages    []openAIMessage `json:"messages"`
	MaxTokens   int             `json:"max_tokens,omitempty"`
	Temperature *float64        `json:"temperature,omitempty"`
	Stream      bool            `json:"stream"`
	Tools       []Tool          `json:"tools,omitempty"`
}

type openAIResponse struct {
	Choices []struct {
		Message struct {
			Content   interface{}          `json:"content"`
			ToolCalls []openAIToolCallWire `json:"tool_calls"`
		} `json:"message"`
		Delta struct {
			Content   string                `json:"content"`
			ToolCalls []openAIToolCallDelta `json:"tool_calls"`
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
		msg := openAIMessage{
			Role:       m.Role,
			Content:    m.Content,
			ToolCallID: m.ToolCallID,
		}
		if len(m.ToolCalls) > 0 {
			msg.Content = nil
			for _, tc := range m.ToolCalls {
				msg.ToolCalls = append(msg.ToolCalls, openAIToolCallWire{
					ID:   tc.ID,
					Type: tc.Type,
					Function: struct {
						Name      string `json:"name"`
						Arguments string `json:"arguments"`
					}{Name: tc.Function.Name, Arguments: tc.Function.Arguments},
				})
			}
		}
		out = append(out, msg)
	}
	return out
}

func wireToAdapterToolCalls(wire []openAIToolCallWire) []ToolCall {
	out := make([]ToolCall, 0, len(wire))
	for _, w := range wire {
		out = append(out, ToolCall{
			ID:   w.ID,
			Type: w.Type,
			Function: ToolCallFunc{
				Name:      w.Function.Name,
				Arguments: w.Function.Arguments,
			},
		})
	}
	return out
}

func (a *OpenAIAdapter) doRequest(ctx context.Context, reqBody openAIRequest) (*http.Response, error) {
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
	return a.client.Do(req)
}

func (a *OpenAIAdapter) ChatCompletion(ctx context.Context, model string, messages []Message, options ChatOptions) (ChatResponse, error) {
	reqBody := openAIRequest{
		Model:       model,
		Messages:    a.buildMessages(messages),
		Temperature: options.Temperature,
		MaxTokens:   options.MaxTokens,
		Stream:      false,
		Tools:       options.Tools,
	}

	resp, err := a.doRequest(ctx, reqBody)
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

	if len(result.Choices) == 0 {
		return ChatResponse{}, nil
	}

	choice := result.Choices[0]
	if choice.FinishReason == "tool_calls" {
		return ChatResponse{
			ToolCalls:  wireToAdapterToolCalls(choice.Message.ToolCalls),
			TokenCount: result.Usage.TotalTokens,
		}, nil
	}

	content := ""
	if s, ok := choice.Message.Content.(string); ok {
		content = s
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
		Tools:       options.Tools,
	}

	resp, err := a.doRequest(ctx, reqBody)
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

		// Accumulate tool call deltas by index
		type tcAccum struct {
			id        string
			typ       string
			name      string
			arguments strings.Builder
		}
		accum := map[int]*tcAccum{}

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
			if len(result.Choices) == 0 {
				continue
			}
			choice := result.Choices[0]

			// Accumulate tool call fragments
			for _, tc := range choice.Delta.ToolCalls {
				a, ok := accum[tc.Index]
				if !ok {
					a = &tcAccum{}
					accum[tc.Index] = a
				}
				if tc.ID != "" {
					a.id = tc.ID
				}
				if tc.Type != "" {
					a.typ = tc.Type
				}
				if tc.Function.Name != "" {
					a.name += tc.Function.Name
				}
				if tc.Function.Arguments != "" {
					a.arguments.WriteString(tc.Function.Arguments)
				}
			}

			// Stream content delta
			if choice.Delta.Content != "" {
				select {
				case ch <- ChatStreamChunk{Content: choice.Delta.Content}:
				case <-ctx.Done():
					return
				}
			}

			switch choice.FinishReason {
			case "stop":
				ch <- ChatStreamChunk{Done: true}
				return
			case "tool_calls":
				toolCalls := make([]ToolCall, 0, len(accum))
				for i := 0; i < len(accum); i++ {
					a := accum[i]
					toolCalls = append(toolCalls, ToolCall{
						ID:   a.id,
						Type: a.typ,
						Function: ToolCallFunc{
							Name:      a.name,
							Arguments: a.arguments.String(),
						},
					})
				}
				ch <- ChatStreamChunk{Done: true, ToolCalls: toolCalls}
				return
			}
		}
	}()

	return ch, nil
}

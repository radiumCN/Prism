package adapter

import "context"

type Message struct {
	Role      string `json:"role"`
	Content   string `json:"content"`
	ImageURLs []string `json:"image_urls,omitempty"`
}

type ChatOptions struct {
	Temperature *float64
	MaxTokens   int
	Stream      bool
}

type ChatResponse struct {
	Content    string
	TokenCount int
}

type ChatStreamChunk struct {
	Content string
	Done    bool
	Error   error
}

type ImageOptions struct {
	Width  int
	Height int
	Style  string
}

type VideoOptions struct {
	Duration int
}

type ChatAdapter interface {
	ChatCompletion(ctx context.Context, model string, messages []Message, options ChatOptions) (ChatResponse, error)
	ChatCompletionStream(ctx context.Context, model string, messages []Message, options ChatOptions) (<-chan ChatStreamChunk, error)
}

type ImageAdapter interface {
	GenerateImage(ctx context.Context, model string, prompt string, options ImageOptions) ([]string, error)
}

type VideoAdapter interface {
	GenerateVideo(ctx context.Context, model string, prompt string, options VideoOptions) (string, error)
}

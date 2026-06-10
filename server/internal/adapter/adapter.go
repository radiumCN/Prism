package adapter

import (
	"context"
	"encoding/json"
)

// --- Tool / function-calling types ---

type Tool struct {
	Type     string       `json:"type"` // always "function"
	Function ToolFunction `json:"function"`
}

type ToolFunction struct {
	Name        string          `json:"name"`
	Description string          `json:"description,omitempty"`
	Parameters  json.RawMessage `json:"parameters,omitempty"` // JSON Schema
}

type ToolCall struct {
	ID       string       `json:"id"`
	Type     string       `json:"type"` // always "function"
	Function ToolCallFunc `json:"function"`
}

type ToolCallFunc struct {
	Name      string `json:"name"`
	Arguments string `json:"arguments"` // JSON-encoded argument object
}

// --- Message types ---

type Message struct {
	Role       string     `json:"role"`
	Content    string     `json:"content"`
	ImageURLs  []string   `json:"image_urls,omitempty"`
	ToolCalls  []ToolCall `json:"tool_calls,omitempty"`  // set on role=assistant when AI calls tools
	ToolCallID string     `json:"tool_call_id,omitempty"` // set on role=tool messages
}

// --- Options / Response ---

type ChatOptions struct {
	Temperature *float64
	MaxTokens   int
	Stream      bool
	Tools       []Tool // optional; enables function calling
}

type ChatResponse struct {
	Content    string
	TokenCount int
	ToolCalls  []ToolCall // non-nil when AI wants to call tools (finish_reason=tool_calls)
}

type ChatStreamChunk struct {
	Content   string
	Done      bool
	Error     error
	ToolCalls []ToolCall // set in the final Done chunk when finish_reason=tool_calls
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

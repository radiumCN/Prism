package adapter

import "fmt"

// NewChatAdapter selects the right adapter based on the model's api_format.
//
// Supported values (see model.APIFormat* constants):
//   - "openai_chat"         → OpenAI Chat Completions (/v1/chat/completions)
//   - "openai_responses"    → OpenAI Responses API (/v1/responses) — uses OpenAI adapter for now
//   - "anthropic_messages"  → Anthropic Messages API (/v1/messages)
//   - "gemini_generate"     → Gemini generateContent
//   - ""                    → defaults to openai_chat
func NewChatAdapter(apiFormat, apiKey, baseURL string) (ChatAdapter, error) {
	switch apiFormat {
	case "openai_chat", "openai_responses", "":
		return NewOpenAIAdapter(apiKey, baseURL), nil
	case "anthropic_messages":
		return NewClaudeAdapter(apiKey, baseURL), nil
	case "gemini_generate":
		return NewGeminiAdapter(apiKey, baseURL), nil
	default:
		return nil, fmt.Errorf("unsupported api_format: %q", apiFormat)
	}
}

// NewImageAdapter selects the right image adapter.
// apiFormat takes precedence; if empty, falls back to providerName heuristic.
func NewImageAdapter(apiFormat, providerName, apiKey, baseURL string) (ImageAdapter, error) {
	switch apiFormat {
	case "openai_image":
		return NewOpenAIImageAdapter(apiKey, baseURL), nil
	case "gemini_image":
		return NewGeminiAdapter(apiKey, baseURL), nil
	}
	// Legacy: fall back to provider-name-based detection
	switch providerName {
	case "gemini", "google":
		return NewGeminiAdapter(apiKey, baseURL), nil
	default:
		// Default to OpenAI-compatible for unknown providers
		return NewOpenAIImageAdapter(apiKey, baseURL), nil
	}
}

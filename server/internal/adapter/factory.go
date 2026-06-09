package adapter

import "fmt"

func NewChatAdapter(providerName, apiKey, baseURL string) (ChatAdapter, error) {
	switch providerName {
	case "openai":
		return NewOpenAIAdapter(apiKey, baseURL), nil
	case "claude", "anthropic":
		return NewClaudeAdapter(apiKey, baseURL), nil
	case "gemini", "google":
		return NewGeminiAdapter(apiKey, baseURL), nil
	default:
		return nil, fmt.Errorf("unsupported chat provider: %s", providerName)
	}
}

func NewImageAdapter(providerName, apiKey, baseURL string) (ImageAdapter, error) {
	switch providerName {
	case "gemini", "google":
		return NewGeminiAdapter(apiKey, baseURL), nil
	default:
		return nil, fmt.Errorf("unsupported image provider: %s", providerName)
	}
}

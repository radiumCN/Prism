package dto

type UpsertProviderRequest struct {
	Name    string `json:"name" binding:"required,max=50"`
	APIKey  string `json:"api_key"`
	BaseURL string `json:"base_url"`
	Status  string `json:"status"`
}

// UpsertModelRequest no longer requires a ProviderID.
// Models are defined independently and associated with providers separately.
type UpsertModelRequest struct {
	ModelName        string `json:"model_name" binding:"required,max=100"`
	DisplayName      string `json:"display_name" binding:"required,max=200"`
	Type             string `json:"type" binding:"required,oneof=chat image video"`
	// APIFormat controls which HTTP endpoint/protocol is used for this model.
	// Valid values: openai_chat | openai_responses | anthropic_messages | gemini_generate
	APIFormat        string `json:"api_format"`
	MaxTokens        int    `json:"max_tokens"`
	SupportsStreaming bool   `json:"supports_streaming"`
	SupportsVision   bool   `json:"supports_vision"`
	ConfigJSON       string `json:"config_json"`
	Status           string `json:"status"`
}

// SetProviderModelsRequest sets the complete list of models associated with a provider.
type SetProviderModelsRequest struct {
	ModelIDs []uint `json:"model_ids" binding:"required"`
}

type UpdateSettingsRequest struct {
	Settings map[string]string `json:"settings" binding:"required"`
}

type UpsertSkillRequest struct {
	Name         string `json:"name" binding:"required,max=100"`
	Description  string `json:"description"`
	SystemPrompt string `json:"system_prompt" binding:"required"`
	Icon         string `json:"icon"`
	Status       string `json:"status"`
}

type UpsertMCPServerRequest struct {
	Name        string `json:"name" binding:"required,max=100"`
	Description string `json:"description"`
	URL         string `json:"url" binding:"required"`
	AuthHeader  string `json:"auth_header"` // raw Authorization value
	Status      string `json:"status"`
}

// MCPServerResponse exposes MCPServer data without the encrypted auth header.
type MCPServerResponse struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	URL         string `json:"url"`
	HasAuth     bool   `json:"has_auth"` // true when auth_header is configured
	Status      string `json:"status"`
}

// ModelInfo is the response shape for the public /api/models endpoint.
// It combines model metadata with provider context so the chat UI can
// display "GPT-4o (OpenAI)" style entries and send both IDs when creating a conversation.
type ModelInfo struct {
	ProviderID       uint   `json:"provider_id"`
	ProviderName     string `json:"provider_name"`
	ModelID          uint   `json:"model_id"`
	ModelName        string `json:"model_name"`
	DisplayName      string `json:"display_name"`
	Type             string `json:"type"`
	MaxTokens        int    `json:"max_tokens"`
	SupportsStreaming bool   `json:"supports_streaming"`
	SupportsVision   bool   `json:"supports_vision"`
}

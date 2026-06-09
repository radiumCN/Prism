package dto

type UpsertProviderRequest struct {
	Name    string `json:"name" binding:"required,max=50"`
	APIKey  string `json:"api_key"`
	BaseURL string `json:"base_url"`
	Status  string `json:"status"`
}

type UpsertModelRequest struct {
	ProviderID       uint   `json:"provider_id" binding:"required"`
	ModelName        string `json:"model_name" binding:"required,max=100"`
	DisplayName      string `json:"display_name" binding:"required,max=200"`
	Type             string `json:"type" binding:"required,oneof=chat image video"`
	MaxTokens        int    `json:"max_tokens"`
	SupportsStreaming bool   `json:"supports_streaming"`
	SupportsVision   bool   `json:"supports_vision"`
	ConfigJSON       string `json:"config_json"`
	Status           string `json:"status"`
}

type UpdateSettingsRequest struct {
	Settings map[string]string `json:"settings" binding:"required"`
}

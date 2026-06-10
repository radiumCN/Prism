package dto

type CreateConversationRequest struct {
	Title        string `json:"title"`
	ModelID      uint   `json:"model_id" binding:"required"`
	ProviderID   uint   `json:"provider_id"`    // optional; falls back to first active provider for the model
	SkillIDs     []uint `json:"skill_ids"`      // optional; one or more skill IDs whose system prompts are injected
	MCPServerIDs []uint `json:"mcp_server_ids"` // optional; list of MCP server IDs to enable
}

// UpdateConversationRequest supports partial updates; nil fields are left unchanged.
type UpdateConversationRequest struct {
	Title  *string `json:"title"`
	Pinned *bool   `json:"pinned"`
}

type SendMessageRequest struct {
	Content   string   `json:"content" binding:"required"`
	ModelID   uint     `json:"model_id"`
	Stream    bool     `json:"stream"`
	ImageURLs []string `json:"image_urls"`
}

type ConversationResponse struct {
	ID         uint   `json:"id"`
	Title      string `json:"title"`
	ModelID    uint   `json:"model_id"`
	ProviderID uint   `json:"provider_id"`
	CreatedAt  string `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`
}

type MessageResponse struct {
	ID        uint   `json:"id"`
	Role      string `json:"role"`
	Content   string `json:"content"`
	CreatedAt string `json:"created_at"`
}

type GenerateImageRequest struct {
	ModelID    uint   `json:"model_id" binding:"required"`
	ProviderID uint   `json:"provider_id"`
	Prompt     string `json:"prompt" binding:"required"`
	Width      int    `json:"width"`
	Height     int    `json:"height"`
	Style      string `json:"style"`
}

type GenerateVideoRequest struct {
	ModelID    uint   `json:"model_id" binding:"required"`
	ProviderID uint   `json:"provider_id"`
	Prompt     string `json:"prompt" binding:"required"`
	Duration   int    `json:"duration"`
}

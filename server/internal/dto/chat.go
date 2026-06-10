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
	ModelID        uint   `json:"model_id" binding:"required"`
	ProviderID     uint   `json:"provider_id"`
	Prompt         string `json:"prompt" binding:"required"`
	NegativePrompt string `json:"negative_prompt"`
	// DALL-E / generic
	Width   int    `json:"width"`
	Height  int    `json:"height"`
	Style   string `json:"style"`   // vivid | natural
	Quality string `json:"quality"` // standard | hd
	N       int    `json:"n"`       // number of images
	// Gemini
	AspectRatio string `json:"aspect_ratio"` // 1:1 16:9 9:16 etc.
	ImageSize   string `json:"image_size"`   // 1K 2K 4K
}

type GenerateVideoRequest struct {
	ModelID    uint   `json:"model_id" binding:"required"`
	ProviderID uint   `json:"provider_id"`
	Prompt     string `json:"prompt" binding:"required"`
	// Common parameters
	Resolution string `json:"resolution"` // 1080P | 720P
	Watermark  *bool  `json:"watermark"`  // default true per API; false = no watermark
	// t2v / r2v only
	Ratio    string `json:"ratio"`    // 16:9 | 9:16 | 1:1 | 4:3 | 3:4
	Duration int    `json:"duration"` // 3-15 seconds; 0 = default (5)
	// video-edit only
	AudioSetting string `json:"audio_setting"` // auto | origin
	// i2v: single first-frame image
	ImageURL string `json:"image_url"`
	// r2v (1-9 images) / video-edit (0-5 images)
	ReferenceImages []string `json:"reference_images"`
	// video-edit: source video
	VideoURL string `json:"video_url"`
}

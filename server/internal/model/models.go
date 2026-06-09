package model

import (
	"time"
)

type User struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Username     string    `gorm:"uniqueIndex;size:50;not null" json:"username"`
	Email        string    `gorm:"uniqueIndex;size:255;not null" json:"email"`
	PasswordHash string    `gorm:"size:255;not null" json:"-"`
	Role         string    `gorm:"size:20;default:'user'" json:"role"`
	Status       string    `gorm:"size:20;default:'active'" json:"status"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Setting struct {
	Key       string    `gorm:"primaryKey;size:100" json:"key"`
	Value     string    `gorm:"type:text" json:"value"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Provider struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name      string    `gorm:"uniqueIndex;size:50;not null" json:"name"`
	APIKey    string    `gorm:"size:500" json:"-"`
	BaseURL   string    `gorm:"size:500" json:"base_url"`
	Status    string    `gorm:"size:20;default:'active'" json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// APIFormat values for AIModel.APIFormat.
const (
	APIFormatOpenAIChat        = "openai_chat"         // POST /v1/chat/completions
	APIFormatOpenAIResponses   = "openai_responses"    // POST /v1/responses
	APIFormatAnthropicMessages = "anthropic_messages"  // POST /v1/messages
	APIFormatGeminiGenerate    = "gemini_generate"     // POST /v1beta/models/:model:generateContent
)

// AIModel holds the definition of a model, independent of any provider.
// One model can be associated with multiple providers via ProviderModel.
type AIModel struct {
	ID               uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	ModelName        string    `gorm:"uniqueIndex;size:100;not null" json:"model_name"`
	DisplayName      string    `gorm:"size:200" json:"display_name"`
	Type             string    `gorm:"size:20;default:'chat'" json:"type"`
	// APIFormat determines which HTTP endpoint format to use for this model.
	// Valid values: openai_chat | openai_responses | anthropic_messages | gemini_generate
	APIFormat        string    `gorm:"size:30;default:'openai_chat'" json:"api_format"`
	MaxTokens        int       `gorm:"default:4096" json:"max_tokens"`
	SupportsStreaming bool      `gorm:"default:true" json:"supports_streaming"`
	SupportsVision   bool      `gorm:"default:false" json:"supports_vision"`
	ConfigJSON       string    `gorm:"type:text" json:"config_json"`
	Status           string    `gorm:"size:20;default:'active'" json:"status"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// ProviderModel is the join table between Provider and AIModel.
// It allows the same model to be used by multiple providers,
// and also carries a per-provider enable/disable status.
type ProviderModel struct {
	ProviderID uint      `gorm:"primaryKey;index" json:"provider_id"`
	ModelID    uint      `gorm:"primaryKey;index" json:"model_id"`
	Status     string    `gorm:"size:20;default:'active'" json:"status"`
	CreatedAt  time.Time `json:"created_at"`
	Provider   *Provider `gorm:"foreignKey:ProviderID" json:"provider,omitempty"`
	AIModel    *AIModel  `gorm:"foreignKey:ModelID" json:"model,omitempty"`
}

type Conversation struct {
	ID         uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID     uint      `gorm:"not null;index" json:"user_id"`
	Title      string    `gorm:"size:500" json:"title"`
	ModelID    uint      `gorm:"index" json:"model_id"`
	ProviderID uint      `gorm:"index" json:"provider_id"`
	Model      *AIModel  `gorm:"foreignKey:ModelID" json:"model,omitempty"`
	Provider   *Provider `gorm:"foreignKey:ProviderID" json:"provider,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	Messages   []Message `gorm:"foreignKey:ConversationID" json:"messages,omitempty"`
}

type Message struct {
	ID             uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	ConversationID uint      `gorm:"not null;index" json:"conversation_id"`
	Role           string    `gorm:"size:20;not null" json:"role"`
	Content        string    `gorm:"type:text" json:"content"`
	ImageURLs      string    `gorm:"type:text" json:"image_urls"`
	Metadata       string    `gorm:"type:text" json:"metadata"`
	TokenCount     int       `json:"token_count"`
	CreatedAt      time.Time `json:"created_at"`
}

type Generation struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID       uint      `gorm:"not null;index" json:"user_id"`
	Type         string    `gorm:"size:20;not null" json:"type"`
	ModelID      uint      `gorm:"index" json:"model_id"`
	ProviderID   uint      `gorm:"index" json:"provider_id"`
	Prompt       string    `gorm:"type:text" json:"prompt"`
	Parameters   string    `gorm:"type:text" json:"parameters"`
	ResultURL    string    `gorm:"type:text" json:"result_url"`
	Status       string    `gorm:"size:20;default:'pending'" json:"status"`
	ErrorMessage string    `gorm:"type:text" json:"error_message"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

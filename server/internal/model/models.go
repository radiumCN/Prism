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
	Models    []AIModel `gorm:"foreignKey:ProviderID" json:"models,omitempty"`
}

type AIModel struct {
	ID                uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	ProviderID        uint      `gorm:"not null;index" json:"provider_id"`
	Provider          *Provider `gorm:"foreignKey:ProviderID" json:"provider,omitempty"`
	ModelName         string    `gorm:"size:100;not null" json:"model_name"`
	DisplayName       string    `gorm:"size:200" json:"display_name"`
	Type              string    `gorm:"size:20;default:'chat'" json:"type"`
	MaxTokens         int       `gorm:"default:4096" json:"max_tokens"`
	SupportsStreaming  bool      `gorm:"default:true" json:"supports_streaming"`
	SupportsVision    bool      `gorm:"default:false" json:"supports_vision"`
	ConfigJSON        string    `gorm:"type:text" json:"config_json"`
	Status            string    `gorm:"size:20;default:'active'" json:"status"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

type Conversation struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    uint      `gorm:"not null;index" json:"user_id"`
	Title     string    `gorm:"size:500" json:"title"`
	ModelID   uint      `gorm:"index" json:"model_id"`
	Model     *AIModel  `gorm:"foreignKey:ModelID" json:"model,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Messages  []Message `gorm:"foreignKey:ConversationID" json:"messages,omitempty"`
}

type Message struct {
	ID             uint         `gorm:"primaryKey;autoIncrement" json:"id"`
	ConversationID uint         `gorm:"not null;index" json:"conversation_id"`
	Role           string       `gorm:"size:20;not null" json:"role"`
	Content        string       `gorm:"type:text" json:"content"`
	ImageURLs      string       `gorm:"type:text" json:"image_urls"`
	Metadata       string       `gorm:"type:text" json:"metadata"`
	TokenCount     int          `json:"token_count"`
	CreatedAt      time.Time    `json:"created_at"`
}

type Generation struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID       uint      `gorm:"not null;index" json:"user_id"`
	Type         string    `gorm:"size:20;not null" json:"type"`
	ModelID      uint      `gorm:"index" json:"model_id"`
	Prompt       string    `gorm:"type:text" json:"prompt"`
	Parameters   string    `gorm:"type:text" json:"parameters"`
	ResultURL    string    `gorm:"type:text" json:"result_url"`
	Status       string    `gorm:"size:20;default:'pending'" json:"status"`
	ErrorMessage string    `gorm:"type:text" json:"error_message"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

package model

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"
)

// JSONStrings stores a []string as a JSON text column in PostgreSQL.
type JSONStrings []string

func (j JSONStrings) Value() (driver.Value, error) {
	if j == nil {
		return "[]", nil
	}
	b, err := json.Marshal(j)
	return string(b), err
}

func (j *JSONStrings) Scan(value interface{}) error {
	if value == nil {
		*j = []string{}
		return nil
	}
	var s string
	switch v := value.(type) {
	case string:
		s = v
	case []byte:
		s = string(v)
	default:
		return fmt.Errorf("JSONStrings: unsupported type %T", value)
	}
	return json.Unmarshal([]byte(s), j)
}

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
	UserID    uint      `gorm:"default:0;index;uniqueIndex:idx_provider_user_name" json:"user_id"`
	Name      string    `gorm:"size:50;not null;uniqueIndex:idx_provider_user_name" json:"name"`
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
	UserID           uint      `gorm:"default:0;index;uniqueIndex:idx_aimodel_user_name" json:"user_id"`
	ModelName        string    `gorm:"size:100;not null;uniqueIndex:idx_aimodel_user_name" json:"model_name"`
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

// Skill is a reusable system-prompt template that can be attached to a conversation.
type Skill struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID       uint      `gorm:"default:0;index;uniqueIndex:idx_skill_user_name" json:"user_id"`
	Name         string    `gorm:"size:100;not null;uniqueIndex:idx_skill_user_name" json:"name"`
	Description  string    `gorm:"size:500" json:"description"`
	SystemPrompt string    `gorm:"type:text;not null" json:"system_prompt"`
	Icon         string    `gorm:"size:50" json:"icon"` // emoji
	Status       string    `gorm:"size:20;default:'active'" json:"status"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// MCPServer holds the connection config for an MCP (Model Context Protocol) server.
type MCPServer struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID      uint      `gorm:"default:0;index;uniqueIndex:idx_mcpserver_user_name" json:"user_id"`
	Name        string    `gorm:"size:100;not null;uniqueIndex:idx_mcpserver_user_name" json:"name"`
	Description string    `gorm:"size:500" json:"description"`
	URL         string    `gorm:"size:500;not null" json:"url"` // HTTP/SSE endpoint
	AuthHeader  string    `gorm:"size:500" json:"-"`            // Authorization value (encrypted)
	Status      string    `gorm:"size:20;default:'active'" json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Conversation struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID       uint      `gorm:"not null;index" json:"user_id"`
	Title        string    `gorm:"size:500" json:"title"`
	ModelID      uint      `gorm:"index" json:"model_id"`
	ProviderID   uint      `gorm:"index" json:"provider_id"`
	Pinned       bool      `gorm:"default:false" json:"pinned"`
	SkillIDs     string    `gorm:"column:skill_ids;type:text" json:"skill_ids"`           // JSON array of uint IDs
	MCPServerIDs string    `gorm:"column:mcp_server_ids;type:text" json:"mcp_server_ids"` // JSON array of uint IDs
	Model        *AIModel  `gorm:"foreignKey:ModelID" json:"model,omitempty"`
	Provider     *Provider `gorm:"foreignKey:ProviderID" json:"provider,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	Messages     []Message `gorm:"foreignKey:ConversationID" json:"messages,omitempty"`
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

// UserOSSConfig stores per-user cloud object storage configuration.
type UserOSSConfig struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID      uint      `gorm:"uniqueIndex;not null" json:"user_id"`
	Provider    string    `gorm:"size:30;default:'none'" json:"provider"`  // none | tencent_cos | aliyun_oss
	SecretID    string    `gorm:"size:500" json:"-"`                        // encrypted
	SecretKey   string    `gorm:"size:500" json:"-"`                        // encrypted
	Bucket      string    `gorm:"size:200" json:"bucket"`
	Region      string    `gorm:"size:100" json:"region"`
	BaseURL     string    `gorm:"size:500" json:"base_url"`
	PathPrefix  string    `gorm:"size:200" json:"path_prefix"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Feedback holds user-submitted feedback entries.
type Feedback struct {
	ID        uint        `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    uint        `gorm:"not null;index" json:"user_id"`
	User      *User       `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Type      string      `gorm:"size:20;default:'general'" json:"type"` // general | bug | feature
	Content   string      `gorm:"type:text;not null" json:"content"`
	Images    JSONStrings `gorm:"type:text" json:"images"`
	Status    string      `gorm:"size:20;default:'pending'" json:"status"` // pending | reviewed | closed
	AdminNote string      `gorm:"type:text" json:"admin_note"`
	CreatedAt time.Time   `json:"created_at"`
	UpdatedAt time.Time   `json:"updated_at"`
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

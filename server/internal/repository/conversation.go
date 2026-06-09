package repository

import (
	"modelhub/server/internal/model"

	"gorm.io/gorm"
)

type ConversationRepository struct {
	db *gorm.DB
}

func NewConversationRepository(db *gorm.DB) *ConversationRepository {
	return &ConversationRepository{db: db}
}

func (r *ConversationRepository) Create(c *model.Conversation) error {
	return r.db.Create(c).Error
}

func (r *ConversationRepository) FindByUser(userID uint) ([]model.Conversation, error) {
	var conversations []model.Conversation
	err := r.db.Where("user_id = ?", userID).Order("pinned DESC, updated_at DESC").Find(&conversations).Error
	return conversations, err
}

func (r *ConversationRepository) FindByID(id, userID uint) (*model.Conversation, error) {
	var c model.Conversation
	query := r.db.Where("id = ?", id)
	if userID > 0 {
		query = query.Where("user_id = ?", userID)
	}
	if err := query.First(&c).Error; err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *ConversationRepository) UpdateTitle(id uint, title string) error {
	return r.db.Model(&model.Conversation{}).Where("id = ?", id).Update("title", title).Error
}

// Update applies a partial update (title, pinned, etc.) scoped to the owning user.
func (r *ConversationRepository) Update(id, userID uint, updates map[string]interface{}) error {
	return r.db.Model(&model.Conversation{}).
		Where("id = ? AND user_id = ?", id, userID).
		Updates(updates).Error
}

func (r *ConversationRepository) Delete(id, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&model.Conversation{}).Error
}

type MessageRepository struct {
	db *gorm.DB
}

func NewMessageRepository(db *gorm.DB) *MessageRepository {
	return &MessageRepository{db: db}
}

func (r *MessageRepository) Create(m *model.Message) error {
	return r.db.Create(m).Error
}

func (r *MessageRepository) FindByConversation(conversationID uint) ([]model.Message, error) {
	var messages []model.Message
	err := r.db.Where("conversation_id = ?", conversationID).Order("created_at ASC").Find(&messages).Error
	return messages, err
}

type SettingRepository struct {
	db *gorm.DB
}

func NewSettingRepository(db *gorm.DB) *SettingRepository {
	return &SettingRepository{db: db}
}

func (r *SettingRepository) Get(key string) (string, error) {
	var s model.Setting
	if err := r.db.Where("key = ?", key).First(&s).Error; err != nil {
		return "", err
	}
	return s.Value, nil
}

func (r *SettingRepository) Set(key, value string) error {
	return r.db.Save(&model.Setting{Key: key, Value: value}).Error
}

func (r *SettingRepository) GetAll() (map[string]string, error) {
	var settings []model.Setting
	if err := r.db.Find(&settings).Error; err != nil {
		return nil, err
	}
	result := make(map[string]string, len(settings))
	for _, s := range settings {
		result[s.Key] = s.Value
	}
	return result, nil
}

func (r *SettingRepository) SetMultiple(settings map[string]string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		for k, v := range settings {
			if err := tx.Save(&model.Setting{Key: k, Value: v}).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

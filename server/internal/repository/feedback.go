package repository

import (
	"modelhub/server/internal/model"

	"gorm.io/gorm"
)

type FeedbackRepository struct {
	db *gorm.DB
}

func NewFeedbackRepository(db *gorm.DB) *FeedbackRepository {
	return &FeedbackRepository{db: db}
}

func (r *FeedbackRepository) Create(f *model.Feedback) error {
	return r.db.Create(f).Error
}

func (r *FeedbackRepository) FindAll() ([]model.Feedback, error) {
	var list []model.Feedback
	err := r.db.Preload("User").Order("created_at DESC").Find(&list).Error
	return list, err
}

func (r *FeedbackRepository) FindByID(id uint) (*model.Feedback, error) {
	var f model.Feedback
	if err := r.db.Preload("User").First(&f, id).Error; err != nil {
		return nil, err
	}
	return &f, nil
}

func (r *FeedbackRepository) FindByUserID(userID uint) ([]model.Feedback, error) {
	var list []model.Feedback
	err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&list).Error
	return list, err
}

func (r *FeedbackRepository) UpdateStatus(id uint, status, adminNote string) error {
	return r.db.Model(&model.Feedback{}).Where("id = ?", id).
		Updates(map[string]interface{}{"status": status, "admin_note": adminNote}).Error
}

package repository

import (
	"errors"
	"modelhub/server/internal/model"

	"gorm.io/gorm"
)

type UserOSSConfigRepository struct {
	db *gorm.DB
}

func NewUserOSSConfigRepository(db *gorm.DB) *UserOSSConfigRepository {
	return &UserOSSConfigRepository{db: db}
}

func (r *UserOSSConfigRepository) FindByUserID(userID uint) (*model.UserOSSConfig, error) {
	var cfg model.UserOSSConfig
	err := r.db.Where("user_id = ?", userID).First(&cfg).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &cfg, err
}

func (r *UserOSSConfigRepository) Upsert(cfg *model.UserOSSConfig) error {
	return r.db.Save(cfg).Error
}

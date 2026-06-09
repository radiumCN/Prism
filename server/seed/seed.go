package seed

import (
	"log"
	"modelhub/server/internal/model"
	"modelhub/server/internal/utils"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func Run(db *gorm.DB) error {
	// Check if already initialized
	var setting model.Setting
	if err := db.Where("key = ?", "initialized").First(&setting).Error; err == nil {
		return nil
	}

	// Default settings
	defaults := []model.Setting{
		{Key: "site_name", Value: "ModelHub"},
		{Key: "registration_open", Value: "false"},
		{Key: "initialized", Value: "true"},
	}
	for _, s := range defaults {
		if err := db.Save(&s).Error; err != nil {
			return err
		}
	}

	// Create admin user
	var adminCount int64
	db.Model(&model.User{}).Where("role = ?", "admin").Count(&adminCount)
	if adminCount == 0 {
		password := utils.GenerateRandomPassword(12)
		hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}

		admin := &model.User{
			Username:     "admin",
			Email:        "admin@modelhub.local",
			PasswordHash: string(hash),
			Role:         "admin",
			Status:       "active",
		}
		if err := db.Create(admin).Error; err != nil {
			return err
		}

		log.Printf("=== Admin account created ===")
		log.Printf("Email: admin@modelhub.local")
		log.Printf("Password: %s", password)
		log.Printf("============================")
	}

	return nil
}

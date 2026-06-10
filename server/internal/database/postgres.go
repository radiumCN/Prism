package database

import (
	"modelhub/server/internal/config"
	"modelhub/server/internal/model"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func NewDB(cfg *config.Config) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(cfg.Database.DSN), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)

	return db, nil
}

func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&model.User{},
		&model.Setting{},
		&model.Provider{},
		&model.AIModel{},
		&model.ProviderModel{},
		&model.Skill{},
		&model.MCPServer{},
		&model.Conversation{},
		&model.Message{},
		&model.Generation{},
	)
}

// RunCustomMigrations applies one-time DDL changes that AutoMigrate cannot handle,
// such as dropping old NOT NULL constraints from columns that are no longer part of the model.
func RunCustomMigrations(db *gorm.DB) error {
	// ai_models.provider_id was required in the old schema but is no longer used.
	// Drop the column if it still exists so inserts without a provider_id succeed.
	if db.Migrator().HasColumn(&model.AIModel{}, "provider_id") {
		if err := db.Exec(`ALTER TABLE ai_models DROP COLUMN IF EXISTS provider_id`).Error; err != nil {
			return err
		}
	}
	return nil
}

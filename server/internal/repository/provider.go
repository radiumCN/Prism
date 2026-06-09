package repository

import (
	"modelhub/server/internal/model"

	"gorm.io/gorm"
)

type ProviderRepository struct {
	db *gorm.DB
}

func NewProviderRepository(db *gorm.DB) *ProviderRepository {
	return &ProviderRepository{db: db}
}

func (r *ProviderRepository) Create(p *model.Provider) error {
	return r.db.Create(p).Error
}

func (r *ProviderRepository) FindAll() ([]model.Provider, error) {
	var providers []model.Provider
	err := r.db.Find(&providers).Error
	return providers, err
}

func (r *ProviderRepository) FindByID(id uint) (*model.Provider, error) {
	var p model.Provider
	if err := r.db.First(&p, id).Error; err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *ProviderRepository) FindByName(name string) (*model.Provider, error) {
	var p model.Provider
	if err := r.db.Where("name = ?", name).First(&p).Error; err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *ProviderRepository) Update(p *model.Provider) error {
	return r.db.Save(p).Error
}

func (r *ProviderRepository) Delete(id uint) error {
	return r.db.Delete(&model.Provider{}, id).Error
}

type ModelRepository struct {
	db *gorm.DB
}

func NewModelRepository(db *gorm.DB) *ModelRepository {
	return &ModelRepository{db: db}
}

func (r *ModelRepository) Create(m *model.AIModel) error {
	return r.db.Create(m).Error
}

func (r *ModelRepository) FindAll(modelType string) ([]model.AIModel, error) {
	var models []model.AIModel
	q := r.db.Preload("Provider")
	if modelType != "" {
		q = q.Where("type = ?", modelType)
	}
	err := q.Find(&models).Error
	return models, err
}

func (r *ModelRepository) FindActive(modelType string) ([]model.AIModel, error) {
	var models []model.AIModel
	q := r.db.Preload("Provider").Where("status = ?", "active")
	if modelType != "" {
		q = q.Where("type = ?", modelType)
	}
	err := q.Find(&models).Error
	return models, err
}

func (r *ModelRepository) FindByID(id uint) (*model.AIModel, error) {
	var m model.AIModel
	if err := r.db.Preload("Provider").First(&m, id).Error; err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *ModelRepository) Update(m *model.AIModel) error {
	return r.db.Save(m).Error
}

func (r *ModelRepository) Delete(id uint) error {
	return r.db.Delete(&model.AIModel{}, id).Error
}

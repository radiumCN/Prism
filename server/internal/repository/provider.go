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

func (r *ProviderRepository) FindAll(userID uint) ([]model.Provider, error) {
	var providers []model.Provider
	err := r.db.Where("user_id = ?", userID).Find(&providers).Error
	return providers, err
}

func (r *ProviderRepository) FindByID(id, userID uint) (*model.Provider, error) {
	var p model.Provider
	if err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&p).Error; err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *ProviderRepository) FindByName(name string, userID uint) (*model.Provider, error) {
	var p model.Provider
	if err := r.db.Where("name = ? AND user_id = ?", name, userID).First(&p).Error; err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *ProviderRepository) Update(p *model.Provider) error {
	return r.db.Save(p).Error
}

func (r *ProviderRepository) Delete(id, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&model.Provider{}).Error
}

// ModelRepository manages AIModel definitions (no provider coupling).
type ModelRepository struct {
	db *gorm.DB
}

func NewModelRepository(db *gorm.DB) *ModelRepository {
	return &ModelRepository{db: db}
}

func (r *ModelRepository) Create(m *model.AIModel) error {
	return r.db.Create(m).Error
}

func (r *ModelRepository) FindAll(userID uint, modelType string) ([]model.AIModel, error) {
	var models []model.AIModel
	q := r.db.Where("user_id = ?", userID)
	if modelType != "" {
		q = q.Where("type = ?", modelType)
	}
	err := q.Find(&models).Error
	return models, err
}

func (r *ModelRepository) FindActive(userID uint, modelType string) ([]model.AIModel, error) {
	var models []model.AIModel
	q := r.db.Where("user_id = ? AND status = ?", userID, "active")
	if modelType != "" {
		q = q.Where("type = ?", modelType)
	}
	err := q.Find(&models).Error
	return models, err
}

func (r *ModelRepository) FindByID(id uint) (*model.AIModel, error) {
	var m model.AIModel
	if err := r.db.First(&m, id).Error; err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *ModelRepository) FindByIDAndUser(id, userID uint) (*model.AIModel, error) {
	var m model.AIModel
	if err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&m).Error; err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *ModelRepository) Update(m *model.AIModel) error {
	return r.db.Save(m).Error
}

func (r *ModelRepository) Delete(id, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&model.AIModel{}).Error
}

// ProviderModelRepository manages the many-to-many between Provider and AIModel.
type ProviderModelRepository struct {
	db *gorm.DB
}

func NewProviderModelRepository(db *gorm.DB) *ProviderModelRepository {
	return &ProviderModelRepository{db: db}
}

// GetByProvider returns all ProviderModel rows for a given provider, with model info preloaded.
func (r *ProviderModelRepository) GetByProvider(providerID uint) ([]model.ProviderModel, error) {
	var pms []model.ProviderModel
	err := r.db.Preload("AIModel").Where("provider_id = ?", providerID).Find(&pms).Error
	return pms, err
}

// GetModelIDsByProvider returns the model IDs associated with a provider.
func (r *ProviderModelRepository) GetModelIDsByProvider(providerID uint) ([]uint, error) {
	var pms []model.ProviderModel
	if err := r.db.Where("provider_id = ?", providerID).Find(&pms).Error; err != nil {
		return nil, err
	}
	ids := make([]uint, 0, len(pms))
	for _, pm := range pms {
		ids = append(ids, pm.ModelID)
	}
	return ids, nil
}

// SetProviderModels replaces the full model list for a provider in a transaction.
func (r *ProviderModelRepository) SetProviderModels(providerID uint, modelIDs []uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("provider_id = ?", providerID).Delete(&model.ProviderModel{}).Error; err != nil {
			return err
		}
		for _, mid := range modelIDs {
			pm := model.ProviderModel{
				ProviderID: providerID,
				ModelID:    mid,
				Status:     "active",
			}
			if err := tx.Create(&pm).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

// FindFirstActiveProviderForModel finds the first active provider for a given model belonging to a user.
func (r *ProviderModelRepository) FindFirstActiveProviderForModel(modelID, userID uint) (*model.Provider, error) {
	var pm model.ProviderModel
	err := r.db.Preload("Provider").
		Joins("JOIN providers ON providers.id = provider_models.provider_id AND providers.user_id = ?", userID).
		Where("provider_models.model_id = ? AND provider_models.status = ?", modelID, "active").
		First(&pm).Error
	if err != nil {
		return nil, err
	}
	return pm.Provider, nil
}

// GetActiveModelsByProvider returns active AIModels for a given provider (for chat use).
func (r *ProviderModelRepository) GetActiveModelsByProvider(providerID uint) ([]model.AIModel, error) {
	var pms []model.ProviderModel
	err := r.db.Preload("AIModel").
		Where("provider_id = ? AND status = ?", providerID, "active").
		Find(&pms).Error
	if err != nil {
		return nil, err
	}
	models := make([]model.AIModel, 0, len(pms))
	for _, pm := range pms {
		if pm.AIModel != nil {
			models = append(models, *pm.AIModel)
		}
	}
	return models, nil
}

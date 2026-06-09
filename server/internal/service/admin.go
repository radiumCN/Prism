package service

import (
	"modelhub/server/internal/config"
	"modelhub/server/internal/dto"
	"modelhub/server/internal/model"
	"modelhub/server/internal/repository"
	"modelhub/server/internal/utils"
)

type AdminService struct {
	providerRepo *repository.ProviderRepository
	modelRepo    *repository.ModelRepository
	settingRepo  *repository.SettingRepository
	cfg          *config.Config
}

func NewAdminService(
	providerRepo *repository.ProviderRepository,
	modelRepo *repository.ModelRepository,
	settingRepo *repository.SettingRepository,
	cfg *config.Config,
) *AdminService {
	return &AdminService{
		providerRepo: providerRepo,
		modelRepo:    modelRepo,
		settingRepo:  settingRepo,
		cfg:          cfg,
	}
}

func (s *AdminService) ListProviders() ([]model.Provider, error) {
	return s.providerRepo.FindAll()
}

func (s *AdminService) CreateProvider(req dto.UpsertProviderRequest) (*model.Provider, error) {
	p := &model.Provider{
		Name:    req.Name,
		BaseURL: req.BaseURL,
		Status:  req.Status,
	}
	if p.Status == "" {
		p.Status = "active"
	}

	if req.APIKey != "" {
		encrypted, err := utils.EncryptAES(s.cfg.AES.Key, req.APIKey)
		if err != nil {
			return nil, err
		}
		p.APIKey = encrypted
	}

	if err := s.providerRepo.Create(p); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *AdminService) UpdateProvider(id uint, req dto.UpsertProviderRequest) (*model.Provider, error) {
	p, err := s.providerRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	p.Name = req.Name
	p.BaseURL = req.BaseURL
	if req.Status != "" {
		p.Status = req.Status
	}

	if req.APIKey != "" {
		encrypted, err := utils.EncryptAES(s.cfg.AES.Key, req.APIKey)
		if err != nil {
			return nil, err
		}
		p.APIKey = encrypted
	}

	if err := s.providerRepo.Update(p); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *AdminService) DeleteProvider(id uint) error {
	return s.providerRepo.Delete(id)
}

func (s *AdminService) ListModels(modelType string) ([]model.AIModel, error) {
	return s.modelRepo.FindAll(modelType)
}

func (s *AdminService) CreateModel(req dto.UpsertModelRequest) (*model.AIModel, error) {
	m := &model.AIModel{
		ProviderID:       req.ProviderID,
		ModelName:        req.ModelName,
		DisplayName:      req.DisplayName,
		Type:             req.Type,
		MaxTokens:        req.MaxTokens,
		SupportsStreaming: req.SupportsStreaming,
		SupportsVision:   req.SupportsVision,
		ConfigJSON:       req.ConfigJSON,
		Status:           req.Status,
	}
	if m.MaxTokens == 0 {
		m.MaxTokens = 4096
	}
	if m.Status == "" {
		m.Status = "active"
	}

	if err := s.modelRepo.Create(m); err != nil {
		return nil, err
	}
	return m, nil
}

func (s *AdminService) UpdateModel(id uint, req dto.UpsertModelRequest) (*model.AIModel, error) {
	m, err := s.modelRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	m.ProviderID = req.ProviderID
	m.ModelName = req.ModelName
	m.DisplayName = req.DisplayName
	m.Type = req.Type
	m.SupportsStreaming = req.SupportsStreaming
	m.SupportsVision = req.SupportsVision
	m.ConfigJSON = req.ConfigJSON
	if req.MaxTokens > 0 {
		m.MaxTokens = req.MaxTokens
	}
	if req.Status != "" {
		m.Status = req.Status
	}

	if err := s.modelRepo.Update(m); err != nil {
		return nil, err
	}
	return m, nil
}

func (s *AdminService) DeleteModel(id uint) error {
	return s.modelRepo.Delete(id)
}

func (s *AdminService) GetSettings() (map[string]string, error) {
	return s.settingRepo.GetAll()
}

func (s *AdminService) UpdateSettings(req dto.UpdateSettingsRequest) error {
	return s.settingRepo.SetMultiple(req.Settings)
}

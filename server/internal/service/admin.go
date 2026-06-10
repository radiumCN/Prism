package service

import (
	"modelhub/server/internal/config"
	"modelhub/server/internal/dto"
	"modelhub/server/internal/model"
	"modelhub/server/internal/repository"
	"modelhub/server/internal/utils"
)

type AdminService struct {
	providerRepo      *repository.ProviderRepository
	modelRepo         *repository.ModelRepository
	providerModelRepo *repository.ProviderModelRepository
	settingRepo       *repository.SettingRepository
	skillRepo         *repository.SkillRepository
	mcpRepo           *repository.MCPServerRepository
	cfg               *config.Config
}

func NewAdminService(
	providerRepo *repository.ProviderRepository,
	modelRepo *repository.ModelRepository,
	providerModelRepo *repository.ProviderModelRepository,
	settingRepo *repository.SettingRepository,
	skillRepo *repository.SkillRepository,
	mcpRepo *repository.MCPServerRepository,
	cfg *config.Config,
) *AdminService {
	return &AdminService{
		providerRepo:      providerRepo,
		modelRepo:         modelRepo,
		providerModelRepo: providerModelRepo,
		settingRepo:       settingRepo,
		skillRepo:         skillRepo,
		mcpRepo:           mcpRepo,
		cfg:               cfg,
	}
}

func (s *AdminService) ListProviders() ([]model.Provider, error) {
	return s.providerRepo.FindAll()
}

// ListProvidersWithModelCounts returns all providers together with a map of
// providerID → number of associated active models.
func (s *AdminService) ListProvidersWithModelCounts() ([]model.Provider, map[uint]int, error) {
	providers, err := s.providerRepo.FindAll()
	if err != nil {
		return nil, nil, err
	}
	counts := make(map[uint]int, len(providers))
	for _, p := range providers {
		pms, err := s.providerModelRepo.GetByProvider(p.ID)
		if err == nil {
			counts[p.ID] = len(pms)
		}
	}
	return providers, counts, nil
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

// --- Model management (no provider coupling) ---

func (s *AdminService) ListModels(modelType string) ([]model.AIModel, error) {
	return s.modelRepo.FindAll(modelType)
}

func (s *AdminService) CreateModel(req dto.UpsertModelRequest) (*model.AIModel, error) {
	m := &model.AIModel{
		ModelName:        req.ModelName,
		DisplayName:      req.DisplayName,
		Type:             req.Type,
		APIFormat:        req.APIFormat,
		MaxTokens:        req.MaxTokens,
		SupportsStreaming: req.SupportsStreaming,
		SupportsVision:   req.SupportsVision,
		ConfigJSON:       req.ConfigJSON,
		Status:           req.Status,
	}
	if m.APIFormat == "" {
		m.APIFormat = "openai_chat"
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

	m.ModelName = req.ModelName
	m.DisplayName = req.DisplayName
	m.Type = req.Type
	if req.APIFormat != "" {
		m.APIFormat = req.APIFormat
	}
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

// --- Provider-model association ---

// GetProviderModels returns all models currently associated with a provider.
func (s *AdminService) GetProviderModels(providerID uint) ([]model.ProviderModel, error) {
	return s.providerModelRepo.GetByProvider(providerID)
}

// SetProviderModels replaces the model list for a provider.
func (s *AdminService) SetProviderModels(providerID uint, req dto.SetProviderModelsRequest) error {
	return s.providerModelRepo.SetProviderModels(providerID, req.ModelIDs)
}

// --- Settings ---

func (s *AdminService) GetSettings() (map[string]string, error) {
	return s.settingRepo.GetAll()
}

func (s *AdminService) UpdateSettings(req dto.UpdateSettingsRequest) error {
	return s.settingRepo.SetMultiple(req.Settings)
}

// --- Skills ---

func (s *AdminService) ListSkills() ([]model.Skill, error)        { return s.skillRepo.FindAll() }
func (s *AdminService) ListActiveSkills() ([]model.Skill, error)  { return s.skillRepo.FindActive() }

func (s *AdminService) CreateSkill(req dto.UpsertSkillRequest) (*model.Skill, error) {
	sk := &model.Skill{
		Name:         req.Name,
		Description:  req.Description,
		SystemPrompt: req.SystemPrompt,
		Icon:         req.Icon,
		Status:       req.Status,
	}
	if sk.Status == "" {
		sk.Status = "active"
	}
	return sk, s.skillRepo.Create(sk)
}

func (s *AdminService) UpdateSkill(id uint, req dto.UpsertSkillRequest) (*model.Skill, error) {
	sk, err := s.skillRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	sk.Name = req.Name
	sk.Description = req.Description
	sk.SystemPrompt = req.SystemPrompt
	sk.Icon = req.Icon
	if req.Status != "" {
		sk.Status = req.Status
	}
	return sk, s.skillRepo.Update(sk)
}

func (s *AdminService) DeleteSkill(id uint) error { return s.skillRepo.Delete(id) }

// BulkCreateSkills creates multiple skills, skipping duplicates or invalid entries.
// Returns the number created and a list of error messages for the failed ones.
func (s *AdminService) BulkCreateSkills(reqs []dto.UpsertSkillRequest) (int, []string) {
	created := 0
	var errs []string
	for _, req := range reqs {
		if req.Name == "" || req.SystemPrompt == "" {
			errs = append(errs, "跳过：name 或 system_prompt 为空")
			continue
		}
		sk := &model.Skill{
			Name:         req.Name,
			Description:  req.Description,
			SystemPrompt: req.SystemPrompt,
			Icon:         req.Icon,
			Status:       req.Status,
		}
		if sk.Status == "" {
			sk.Status = "active"
		}
		if err := s.skillRepo.Create(sk); err != nil {
			errs = append(errs, req.Name+": "+err.Error())
		} else {
			created++
		}
	}
	return created, errs
}

// --- MCP Servers ---

func (s *AdminService) ListMCPServers() ([]dto.MCPServerResponse, error) {
	servers, err := s.mcpRepo.FindAll()
	if err != nil {
		return nil, err
	}
	resp := make([]dto.MCPServerResponse, 0, len(servers))
	for _, sv := range servers {
		resp = append(resp, dto.MCPServerResponse{
			ID:          sv.ID,
			Name:        sv.Name,
			Description: sv.Description,
			URL:         sv.URL,
			HasAuth:     sv.AuthHeader != "",
			Status:      sv.Status,
		})
	}
	return resp, nil
}

func (s *AdminService) ListActiveMCPServers() ([]dto.MCPServerResponse, error) {
	servers, err := s.mcpRepo.FindActive()
	if err != nil {
		return nil, err
	}
	resp := make([]dto.MCPServerResponse, 0, len(servers))
	for _, sv := range servers {
		resp = append(resp, dto.MCPServerResponse{
			ID:          sv.ID,
			Name:        sv.Name,
			Description: sv.Description,
			URL:         sv.URL,
			HasAuth:     sv.AuthHeader != "",
			Status:      sv.Status,
		})
	}
	return resp, nil
}

func (s *AdminService) CreateMCPServer(req dto.UpsertMCPServerRequest) (*dto.MCPServerResponse, error) {
	sv := &model.MCPServer{
		Name:        req.Name,
		Description: req.Description,
		URL:         req.URL,
		AuthHeader:  req.AuthHeader,
		Status:      req.Status,
	}
	if sv.Status == "" {
		sv.Status = "active"
	}
	if err := s.mcpRepo.Create(sv); err != nil {
		return nil, err
	}
	return &dto.MCPServerResponse{
		ID: sv.ID, Name: sv.Name, Description: sv.Description,
		URL: sv.URL, HasAuth: sv.AuthHeader != "", Status: sv.Status,
	}, nil
}

func (s *AdminService) UpdateMCPServer(id uint, req dto.UpsertMCPServerRequest) (*dto.MCPServerResponse, error) {
	sv, err := s.mcpRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	sv.Name = req.Name
	sv.Description = req.Description
	sv.URL = req.URL
	if req.AuthHeader != "" {
		sv.AuthHeader = req.AuthHeader
	}
	if req.Status != "" {
		sv.Status = req.Status
	}
	if err := s.mcpRepo.Update(sv); err != nil {
		return nil, err
	}
	return &dto.MCPServerResponse{
		ID: sv.ID, Name: sv.Name, Description: sv.Description,
		URL: sv.URL, HasAuth: sv.AuthHeader != "", Status: sv.Status,
	}, nil
}

func (s *AdminService) DeleteMCPServer(id uint) error { return s.mcpRepo.Delete(id) }

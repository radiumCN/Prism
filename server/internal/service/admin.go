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
	userRepo          *repository.UserRepository
	feedbackRepo      *repository.FeedbackRepository
	cfg               *config.Config
}

func NewAdminService(
	providerRepo *repository.ProviderRepository,
	modelRepo *repository.ModelRepository,
	providerModelRepo *repository.ProviderModelRepository,
	settingRepo *repository.SettingRepository,
	skillRepo *repository.SkillRepository,
	mcpRepo *repository.MCPServerRepository,
	userRepo *repository.UserRepository,
	feedbackRepo *repository.FeedbackRepository,
	cfg *config.Config,
) *AdminService {
	return &AdminService{
		providerRepo:      providerRepo,
		modelRepo:         modelRepo,
		providerModelRepo: providerModelRepo,
		settingRepo:       settingRepo,
		skillRepo:         skillRepo,
		mcpRepo:           mcpRepo,
		userRepo:          userRepo,
		feedbackRepo:      feedbackRepo,
		cfg:               cfg,
	}
}

// ListProvidersWithModelCounts returns the calling user's providers with associated model counts.
func (s *AdminService) ListProvidersWithModelCounts(userID uint) ([]model.Provider, map[uint]int, error) {
	providers, err := s.providerRepo.FindAll(userID)
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

func (s *AdminService) CreateProvider(userID uint, req dto.UpsertProviderRequest) (*model.Provider, error) {
	p := &model.Provider{
		UserID:  userID,
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

func (s *AdminService) UpdateProvider(userID, id uint, req dto.UpsertProviderRequest) (*model.Provider, error) {
	p, err := s.providerRepo.FindByID(id, userID)
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

func (s *AdminService) DeleteProvider(userID, id uint) error {
	return s.providerRepo.Delete(id, userID)
}

// --- Model management ---

func (s *AdminService) ListModels(userID uint, modelType string) ([]model.AIModel, error) {
	return s.modelRepo.FindAll(userID, modelType)
}

func (s *AdminService) CreateModel(userID uint, req dto.UpsertModelRequest) (*model.AIModel, error) {
	m := &model.AIModel{
		UserID:           userID,
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

func (s *AdminService) UpdateModel(userID, id uint, req dto.UpsertModelRequest) (*model.AIModel, error) {
	m, err := s.modelRepo.FindByIDAndUser(id, userID)
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

func (s *AdminService) DeleteModel(userID, id uint) error {
	return s.modelRepo.Delete(id, userID)
}

// --- Provider-model association ---

func (s *AdminService) GetProviderModels(userID, providerID uint) ([]model.ProviderModel, error) {
	if _, err := s.providerRepo.FindByID(providerID, userID); err != nil {
		return nil, err
	}
	return s.providerModelRepo.GetByProvider(providerID)
}

func (s *AdminService) SetProviderModels(userID, providerID uint, req dto.SetProviderModelsRequest) error {
	if _, err := s.providerRepo.FindByID(providerID, userID); err != nil {
		return err
	}
	return s.providerModelRepo.SetProviderModels(providerID, req.ModelIDs)
}

// --- Settings (system-wide, admin only) ---

func (s *AdminService) GetSettings() (map[string]string, error) {
	return s.settingRepo.GetAll()
}

func (s *AdminService) UpdateSettings(req dto.UpdateSettingsRequest) error {
	return s.settingRepo.SetMultiple(req.Settings)
}

// --- Skills ---

func (s *AdminService) ListSkills(userID uint) ([]model.Skill, error) {
	return s.skillRepo.FindAll(userID)
}

func (s *AdminService) ListActiveSkills(userID uint) ([]model.Skill, error) {
	return s.skillRepo.FindActive(userID)
}

func (s *AdminService) CreateSkill(userID uint, req dto.UpsertSkillRequest) (*model.Skill, error) {
	sk := &model.Skill{
		UserID:       userID,
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

func (s *AdminService) UpdateSkill(userID, id uint, req dto.UpsertSkillRequest) (*model.Skill, error) {
	sk, err := s.skillRepo.FindByID(id, userID)
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

func (s *AdminService) DeleteSkill(userID, id uint) error {
	return s.skillRepo.Delete(id, userID)
}

// BulkCreateSkills creates multiple skills for a user, skipping duplicates or invalid entries.
func (s *AdminService) BulkCreateSkills(userID uint, reqs []dto.UpsertSkillRequest) (int, []string) {
	created := 0
	var errs []string
	for _, req := range reqs {
		if req.Name == "" || req.SystemPrompt == "" {
			errs = append(errs, "跳过：name 或 system_prompt 为空")
			continue
		}
		sk := &model.Skill{
			UserID:       userID,
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

func (s *AdminService) ListMCPServers(userID uint) ([]dto.MCPServerResponse, error) {
	servers, err := s.mcpRepo.FindAll(userID)
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

func (s *AdminService) ListActiveMCPServers(userID uint) ([]dto.MCPServerResponse, error) {
	servers, err := s.mcpRepo.FindActive(userID)
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

func (s *AdminService) CreateMCPServer(userID uint, req dto.UpsertMCPServerRequest) (*dto.MCPServerResponse, error) {
	sv := &model.MCPServer{
		UserID:      userID,
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

func (s *AdminService) UpdateMCPServer(userID, id uint, req dto.UpsertMCPServerRequest) (*dto.MCPServerResponse, error) {
	sv, err := s.mcpRepo.FindByID(id, userID)
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

func (s *AdminService) DeleteMCPServer(userID, id uint) error {
	return s.mcpRepo.Delete(id, userID)
}

// ---- User Management (admin only) ----

func (s *AdminService) ListUsers() ([]model.User, error) {
	return s.userRepo.FindAll()
}

func (s *AdminService) UpdateUser(id uint, req dto.UpdateUserRequest) error {
	return s.userRepo.UpdateRoleAndStatus(id, req.Role, req.Status)
}

// ---- Feedback ----

func (s *AdminService) SubmitFeedback(userID uint, req dto.SubmitFeedbackRequest) (*model.Feedback, error) {
	ft := req.Type
	if ft == "" {
		ft = "general"
	}
	f := &model.Feedback{
		UserID:  userID,
		Type:    ft,
		Content: req.Content,
		Images:  model.JSONStrings(req.Images),
		Status:  "pending",
	}
	if err := s.feedbackRepo.Create(f); err != nil {
		return nil, err
	}
	return f, nil
}

func (s *AdminService) ListFeedback() ([]model.Feedback, error) {
	return s.feedbackRepo.FindAll()
}

func (s *AdminService) ListMyFeedback(userID uint) ([]model.Feedback, error) {
	return s.feedbackRepo.FindByUserID(userID)
}

func (s *AdminService) UpdateFeedback(id uint, req dto.UpdateFeedbackRequest) error {
	return s.feedbackRepo.UpdateStatus(id, req.Status, req.AdminNote)
}

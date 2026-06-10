package handler

import (
	"modelhub/server/internal/adapter"
	"modelhub/server/internal/config"
	"modelhub/server/internal/dto"
	"modelhub/server/internal/middleware"
	"modelhub/server/internal/model"
	"modelhub/server/internal/repository"
	"modelhub/server/internal/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type GenerationHandler struct {
	modelRepo         *repository.ModelRepository
	providerRepo      *repository.ProviderRepository
	providerModelRepo *repository.ProviderModelRepository
	db                *gorm.DB
	cfg               *config.Config
}

func NewGenerationHandler(
	modelRepo *repository.ModelRepository,
	providerRepo *repository.ProviderRepository,
	providerModelRepo *repository.ProviderModelRepository,
	db *gorm.DB,
	cfg *config.Config,
) *GenerationHandler {
	return &GenerationHandler{
		modelRepo:         modelRepo,
		providerRepo:      providerRepo,
		providerModelRepo: providerModelRepo,
		db:                db,
		cfg:               cfg,
	}
}

func (h *GenerationHandler) GenerateImage(c *gin.Context) {
	var req dto.GenerateImageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := middleware.GetUserID(c)
	aiModel, err := h.modelRepo.FindByID(req.ModelID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "model not found"})
		return
	}

	if aiModel.Status != "active" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "model is not available"})
		return
	}

	// Resolve which provider to use
	var provider *model.Provider
	if req.ProviderID > 0 {
		provider, err = h.providerRepo.FindByID(req.ProviderID)
	} else {
		provider, err = h.providerModelRepo.FindFirstActiveProviderForModel(req.ModelID)
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no active provider found for this model"})
		return
	}

	apiKey, err := utils.DecryptAES(h.cfg.AES.Key, provider.APIKey)
	if err != nil {
		apiKey = provider.APIKey
	}

	imgAdapter, err := adapter.NewImageAdapter(aiModel.APIFormat, provider.Name, apiKey, provider.BaseURL)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	gen := &model.Generation{
		UserID:     userID,
		Type:       "image",
		ModelID:    req.ModelID,
		ProviderID: provider.ID,
		Prompt:     req.Prompt,
		Status:     "processing",
	}
	if err := h.db.Create(gen).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	urls, err := imgAdapter.GenerateImage(c.Request.Context(), aiModel.ModelName, req.Prompt, adapter.ImageOptions{
		Width:          req.Width,
		Height:         req.Height,
		Style:          req.Style,
		Quality:        req.Quality,
		N:              req.N,
		NegativePrompt: req.NegativePrompt,
		AspectRatio:    req.AspectRatio,
		ImageSize:      req.ImageSize,
	})
	if err != nil {
		h.db.Model(gen).Updates(map[string]interface{}{"status": "error", "error_message": err.Error()})
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	resultURL := strings.Join(urls, "\n")
	h.db.Model(gen).Updates(map[string]interface{}{"status": "completed", "result_url": resultURL})

	c.JSON(http.StatusOK, gin.H{
		"id":         gen.ID,
		"result_url": resultURL,
		"prompt":     req.Prompt,
		"urls":       urls,
	})
}

func (h *GenerationHandler) GenerateVideo(c *gin.Context) {
	var req dto.GenerateVideoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := middleware.GetUserID(c)
	aiModel, err := h.modelRepo.FindByID(req.ModelID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "model not found"})
		return
	}
	if aiModel.Status != "active" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "model is not available"})
		return
	}

	var provider *model.Provider
	if req.ProviderID > 0 {
		provider, err = h.providerRepo.FindByID(req.ProviderID)
	} else {
		provider, err = h.providerModelRepo.FindFirstActiveProviderForModel(req.ModelID)
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no active provider found for this model"})
		return
	}

	apiKey, err := utils.DecryptAES(h.cfg.AES.Key, provider.APIKey)
	if err != nil {
		apiKey = provider.APIKey
	}

	videoAdapter, err := adapter.NewVideoAdapter(aiModel.APIFormat, apiKey, provider.BaseURL)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	gen := &model.Generation{
		UserID:     userID,
		Type:       "video",
		ModelID:    req.ModelID,
		ProviderID: provider.ID,
		Prompt:     req.Prompt,
		Status:     "processing",
	}
	if err := h.db.Create(gen).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Use extended options to pass all happyhorse-specific params
	var videoURL string
	if hh, ok := videoAdapter.(*adapter.HappyhorseAdapter); ok {
		videoURL, err = hh.GenerateVideoExt(c.Request.Context(), aiModel.ModelName, req.Prompt, adapter.VideoOptionsExt{
			Resolution:      req.Resolution,
			Watermark:       req.Watermark,
			Ratio:           req.Ratio,
			Duration:        req.Duration,
			AudioSetting:    req.AudioSetting,
			ImageURL:        req.ImageURL,
			VideoURL:        req.VideoURL,
			ReferenceImages: req.ReferenceImages,
		})
	} else {
		videoURL, err = videoAdapter.GenerateVideo(c.Request.Context(), aiModel.ModelName, req.Prompt, adapter.VideoOptions{})
	}
	if err != nil {
		h.db.Model(gen).Updates(map[string]interface{}{"status": "error", "error_message": err.Error()})
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	h.db.Model(gen).Updates(map[string]interface{}{"status": "completed", "result_url": videoURL})
	c.JSON(http.StatusOK, gin.H{
		"id":        gen.ID,
		"video_url": videoURL,
		"prompt":    req.Prompt,
	})
}

func (h *GenerationHandler) ListVideoHistory(c *gin.Context) {
	userID := middleware.GetUserID(c)
	var gens []model.Generation
	if err := h.db.
		Where("user_id = ? AND type = ?", userID, "video").
		Order("created_at DESC").
		Limit(50).
		Find(&gens).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	type item struct {
		ID           uint   `json:"id"`
		Prompt       string `json:"prompt"`
		VideoURL     string `json:"video_url,omitempty"`
		Status       string `json:"status"`
		ErrorMessage string `json:"error_message,omitempty"`
		CreatedAt    string `json:"created_at"`
	}
	result := make([]item, 0, len(gens))
	for _, g := range gens {
		result = append(result, item{
			ID:           g.ID,
			Prompt:       g.Prompt,
			VideoURL:     g.ResultURL,
			Status:       g.Status,
			ErrorMessage: g.ErrorMessage,
			CreatedAt:    g.CreatedAt.Format("2006-01-02 15:04"),
		})
	}
	c.JSON(http.StatusOK, result)
}

func (h *GenerationHandler) ListImageHistory(c *gin.Context) {
	userID := middleware.GetUserID(c)
	var gens []model.Generation
	if err := h.db.
		Where("user_id = ? AND type = ?", userID, "image").
		Order("created_at DESC").
		Limit(50).
		Find(&gens).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	type item struct {
		ID           uint     `json:"id"`
		Prompt       string   `json:"prompt"`
		URLs         []string `json:"urls"`
		Status       string   `json:"status"`
		ErrorMessage string   `json:"error_message,omitempty"`
		CreatedAt    string   `json:"created_at"`
	}
	result := make([]item, 0, len(gens))
	for _, g := range gens {
		var urls []string
		if g.Status == "completed" && g.ResultURL != "" {
			for _, u := range strings.Split(g.ResultURL, "\n") {
				if u != "" {
					urls = append(urls, u)
				}
			}
		}
		result = append(result, item{
			ID:           g.ID,
			Prompt:       g.Prompt,
			URLs:         urls,
			Status:       g.Status,
			ErrorMessage: g.ErrorMessage,
			CreatedAt:    g.CreatedAt.Format("2006-01-02 15:04"),
		})
	}
	c.JSON(http.StatusOK, result)
}

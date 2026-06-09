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

	imgAdapter, err := adapter.NewImageAdapter(provider.Name, apiKey, provider.BaseURL)
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
		Width:  req.Width,
		Height: req.Height,
		Style:  req.Style,
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

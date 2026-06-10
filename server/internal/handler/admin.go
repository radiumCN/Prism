package handler

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"io"
	"modelhub/server/internal/dto"
	"modelhub/server/internal/service"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"gopkg.in/yaml.v3"
)

type AdminHandler struct {
	adminSvc *service.AdminService
}

func NewAdminHandler(adminSvc *service.AdminService) *AdminHandler {
	return &AdminHandler{adminSvc: adminSvc}
}

func (h *AdminHandler) ListProviders(c *gin.Context) {
	providers, counts, err := h.adminSvc.ListProvidersWithModelCounts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	type providerWithCount struct {
		ID         uint   `json:"id"`
		Name       string `json:"name"`
		BaseURL    string `json:"base_url"`
		Status     string `json:"status"`
		ModelCount int    `json:"model_count"`
	}
	result := make([]providerWithCount, 0, len(providers))
	for _, p := range providers {
		result = append(result, providerWithCount{
			ID:         p.ID,
			Name:       p.Name,
			BaseURL:    p.BaseURL,
			Status:     p.Status,
			ModelCount: counts[p.ID],
		})
	}
	c.JSON(http.StatusOK, result)
}

func (h *AdminHandler) CreateProvider(c *gin.Context) {
	var req dto.UpsertProviderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	p, err := h.adminSvc.CreateProvider(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, p)
}

func (h *AdminHandler) UpdateProvider(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req dto.UpsertProviderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	p, err := h.adminSvc.UpdateProvider(uint(id), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *AdminHandler) DeleteProvider(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if err := h.adminSvc.DeleteProvider(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}

func (h *AdminHandler) ListModels(c *gin.Context) {
	modelType := c.Query("type")
	models, err := h.adminSvc.ListModels(modelType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, models)
}

func (h *AdminHandler) CreateModel(c *gin.Context) {
	var req dto.UpsertModelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	m, err := h.adminSvc.CreateModel(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, m)
}

func (h *AdminHandler) UpdateModel(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req dto.UpsertModelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	m, err := h.adminSvc.UpdateModel(uint(id), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, m)
}

func (h *AdminHandler) DeleteModel(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if err := h.adminSvc.DeleteModel(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}

// GetProviderModels returns the model list associated with a provider.
func (h *AdminHandler) GetProviderModels(c *gin.Context) {
	providerID, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	pms, err := h.adminSvc.GetProviderModels(uint(providerID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, pms)
}

// SetProviderModels replaces the model list for a provider (full replace).
func (h *AdminHandler) SetProviderModels(c *gin.Context) {
	providerID, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req dto.SetProviderModelsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.adminSvc.SetProviderModels(uint(providerID), req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "provider models updated"})
}

func (h *AdminHandler) GetSettings(c *gin.Context) {
	settings, err := h.adminSvc.GetSettings()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, settings)
}

func (h *AdminHandler) UpdateSettings(c *gin.Context) {
	var req dto.UpdateSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.adminSvc.UpdateSettings(req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "settings updated"})
}

// --- Skills ---

func (h *AdminHandler) ListSkills(c *gin.Context) {
	skills, err := h.adminSvc.ListSkills()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, skills)
}

func (h *AdminHandler) CreateSkill(c *gin.Context) {
	var req dto.UpsertSkillRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	sk, err := h.adminSvc.CreateSkill(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, sk)
}

func (h *AdminHandler) UpdateSkill(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req dto.UpsertSkillRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	sk, err := h.adminSvc.UpdateSkill(uint(id), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, sk)
}

func (h *AdminHandler) DeleteSkill(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if err := h.adminSvc.DeleteSkill(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}

// skillFrontmatter is the YAML block at the top of a SKILL.md file.
type skillFrontmatter struct {
	Name        string `yaml:"name"`
	Description string `yaml:"description"`
	License     string `yaml:"license"`
}

// parseSkillMD parses a SKILL.md-style Markdown file.
// Format:
//
//	---
//	name: my-skill
//	description: What this skill does.
//	---
//	# Body content (becomes the system_prompt)
func parseSkillMD(data []byte) (dto.UpsertSkillRequest, bool) {
	content := strings.TrimSpace(string(data))
	if !strings.HasPrefix(content, "---") {
		// No frontmatter — treat entire file as system_prompt, use filename as name later
		return dto.UpsertSkillRequest{SystemPrompt: content}, true
	}

	// Find closing ---
	rest := content[3:]
	idx := strings.Index(rest, "\n---")
	if idx < 0 {
		return dto.UpsertSkillRequest{}, false
	}
	fmRaw := strings.TrimSpace(rest[:idx])
	body := strings.TrimSpace(rest[idx+4:]) // skip \n---

	var fm skillFrontmatter
	if err := yaml.Unmarshal([]byte(fmRaw), &fm); err != nil {
		return dto.UpsertSkillRequest{}, false
	}

	return dto.UpsertSkillRequest{
		Name:         fm.Name,
		Description:  fm.Description,
		SystemPrompt: body,
		Status:       "active",
	}, true
}

// parseFileToSkills converts raw file bytes into a slice of UpsertSkillRequest.
// Supports .md (SKILL.md format), .json (array or single object).
func parseFileToSkills(filename string, data []byte) []dto.UpsertSkillRequest {
	lname := strings.ToLower(filename)
	switch {
	case strings.HasSuffix(lname, ".md"):
		req, ok := parseSkillMD(data)
		if !ok || (req.Name == "" && req.SystemPrompt == "") {
			return nil
		}
		// If name missing, derive from filename
		if req.Name == "" {
			req.Name = strings.TrimSuffix(strings.TrimSuffix(filename, ".md"), ".SKILL")
			req.Name = strings.ReplaceAll(req.Name, "-", " ")
		}
		return []dto.UpsertSkillRequest{req}

	case strings.HasSuffix(lname, ".json"):
		var arr []dto.UpsertSkillRequest
		if err := json.Unmarshal(data, &arr); err == nil {
			return arr
		}
		var single dto.UpsertSkillRequest
		if err := json.Unmarshal(data, &single); err == nil {
			return []dto.UpsertSkillRequest{single}
		}
	}
	return nil
}

// ImportSkills accepts a multipart upload (.md, .json, .zip) and bulk-creates skills.
//   - .md  — SKILL.md format with YAML frontmatter (name, description) + Markdown body as system_prompt
//   - .json — array or single object with name/description/system_prompt/icon/status fields
//   - .zip  — archive containing any combination of .md and .json files
func (h *AdminHandler) ImportSkills(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请上传文件（字段名 file）"})
		return
	}
	defer file.Close()

	raw, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "读取文件失败"})
		return
	}

	var reqs []dto.UpsertSkillRequest
	lname := strings.ToLower(header.Filename)

	if strings.HasSuffix(lname, ".zip") {
		zr, err := zip.NewReader(bytes.NewReader(raw), int64(len(raw)))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "无法解析 ZIP 文件"})
			return
		}
		for _, f := range zr.File {
			fl := strings.ToLower(f.Name)
			if !strings.HasSuffix(fl, ".md") && !strings.HasSuffix(fl, ".json") {
				continue
			}
			rc, err := f.Open()
			if err != nil {
				continue
			}
			data, _ := io.ReadAll(rc)
			rc.Close()
			baseName := f.Name[strings.LastIndex(f.Name, "/")+1:] // basename only
			reqs = append(reqs, parseFileToSkills(baseName, data)...)
		}
	} else {
		reqs = parseFileToSkills(header.Filename, raw)
		if reqs == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "仅支持 .md、.json 或 .zip 文件"})
			return
		}
	}

	if len(reqs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "文件中未找到任何 Skill"})
		return
	}

	created, failed := h.adminSvc.BulkCreateSkills(reqs)
	c.JSON(http.StatusOK, gin.H{
		"created": created,
		"failed":  failed,
		"total":   len(reqs),
	})
}

// --- MCP Servers ---

func (h *AdminHandler) ListMCPServers(c *gin.Context) {
	servers, err := h.adminSvc.ListMCPServers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, servers)
}

func (h *AdminHandler) CreateMCPServer(c *gin.Context) {
	var req dto.UpsertMCPServerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	sv, err := h.adminSvc.CreateMCPServer(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, sv)
}

func (h *AdminHandler) UpdateMCPServer(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req dto.UpsertMCPServerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	sv, err := h.adminSvc.UpdateMCPServer(uint(id), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, sv)
}

func (h *AdminHandler) DeleteMCPServer(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if err := h.adminSvc.DeleteMCPServer(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}

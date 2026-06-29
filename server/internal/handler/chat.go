package handler

import (
	"io"
	"log"
	"modelhub/server/internal/dto"
	"modelhub/server/internal/middleware"
	"modelhub/server/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ChatHandler struct {
	chatSvc *service.ChatService
}

func NewChatHandler(chatSvc *service.ChatService) *ChatHandler {
	return &ChatHandler{chatSvc: chatSvc}
}

// ListSkills returns active skills belonging to the authenticated user.
func (h *ChatHandler) ListSkills(c *gin.Context) {
	userID := middleware.GetUserID(c)
	skills, err := h.chatSvc.ListSkills(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, skills)
}

// ListMCPServers returns active MCP server configs belonging to the authenticated user.
func (h *ChatHandler) ListMCPServers(c *gin.Context) {
	userID := middleware.GetUserID(c)
	servers, err := h.chatSvc.ListMCPServers(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// Strip auth headers before returning
	type safe struct {
		ID          uint   `json:"id"`
		Name        string `json:"name"`
		Description string `json:"description"`
		Status      string `json:"status"`
	}
	out := make([]safe, 0, len(servers))
	for _, s := range servers {
		out = append(out, safe{ID: s.ID, Name: s.Name, Description: s.Description, Status: s.Status})
	}
	c.JSON(http.StatusOK, out)
}

// ListModels returns all (provider, model) combinations available to the authenticated user for chat.
func (h *ChatHandler) ListModels(c *gin.Context) {
	userID := middleware.GetUserID(c)
	modelType := c.Query("type")
	models, err := h.chatSvc.ListAvailableModels(userID, modelType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, models)
}

func (h *ChatHandler) CreateConversation(c *gin.Context) {
	var req dto.CreateConversationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := middleware.GetUserID(c)
	conv, err := h.chatSvc.CreateConversation(userID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, conv)
}

func (h *ChatHandler) ListConversations(c *gin.Context) {
	userID := middleware.GetUserID(c)
	convs, err := h.chatSvc.ListConversations(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, convs)
}

func (h *ChatHandler) UpdateConversation(c *gin.Context) {
	var req dto.UpdateConversationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID := middleware.GetUserID(c)
	convID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid conversation id"})
		return
	}
	conv, err := h.chatSvc.UpdateConversation(userID, uint(convID), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, conv)
}

func (h *ChatHandler) DeleteConversation(c *gin.Context) {
	userID := middleware.GetUserID(c)
	convID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid conversation id"})
		return
	}
	if err := h.chatSvc.DeleteConversation(userID, uint(convID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}

// GetConversationInfo returns conversation metadata (including skill_ids, mcp_server_ids).
func (h *ChatHandler) GetConversationInfo(c *gin.Context) {
	userID := middleware.GetUserID(c)
	convID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid conversation id"})
		return
	}
	conv, err := h.chatSvc.GetConversationInfo(userID, uint(convID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, conv)
}

func (h *ChatHandler) GetMessages(c *gin.Context) {
	userID := middleware.GetUserID(c)
	convID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid conversation id"})
		return
	}

	messages, err := h.chatSvc.GetMessages(userID, uint(convID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, messages)
}

func (h *ChatHandler) SendMessage(c *gin.Context) {
	var req dto.SendMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := middleware.GetUserID(c)
	convID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid conversation id"})
		return
	}

	if req.Stream {
		h.sendMessageStream(c, userID, uint(convID), req)
		return
	}

	msg, err := h.chatSvc.SendMessage(c.Request.Context(), userID, uint(convID), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, msg)
}

func (h *ChatHandler) sendMessageStream(c *gin.Context, userID, convID uint, req dto.SendMessageRequest) {
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("X-Accel-Buffering", "no")

	streamCh, err := h.chatSvc.SendMessageStream(c.Request.Context(), userID, convID, req)
	if err != nil {
		// #region agent log
		log.Printf("[SSE ERROR] convID=%d userID=%d err=%v", convID, userID, err)
		// #endregion
		c.SSEvent("error", gin.H{"error": err.Error()})
		return
	}

	c.Stream(func(w io.Writer) bool {
		if chunk, ok := <-streamCh; ok {
			if len(chunk) > 7 && chunk[:7] == "[ERROR]" {
				c.SSEvent("error", gin.H{"error": chunk[8:]})
				return false
			}
			c.SSEvent("message", gin.H{"content": chunk})
			return true
		}
		c.SSEvent("done", gin.H{})
		return false
	})
}

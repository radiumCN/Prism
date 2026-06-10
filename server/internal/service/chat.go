package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"modelhub/server/internal/adapter"
	"modelhub/server/internal/config"
	"modelhub/server/internal/dto"
	"modelhub/server/internal/model"
	"modelhub/server/internal/repository"
	"modelhub/server/internal/utils"
	"strings"
)

type ChatService struct {
	convRepo          *repository.ConversationRepository
	msgRepo           *repository.MessageRepository
	modelRepo         *repository.ModelRepository
	providerRepo      *repository.ProviderRepository
	providerModelRepo *repository.ProviderModelRepository
	skillRepo         *repository.SkillRepository
	mcpRepo           *repository.MCPServerRepository
	cfg               *config.Config
}

func NewChatService(
	convRepo *repository.ConversationRepository,
	msgRepo *repository.MessageRepository,
	modelRepo *repository.ModelRepository,
	providerRepo *repository.ProviderRepository,
	providerModelRepo *repository.ProviderModelRepository,
	skillRepo *repository.SkillRepository,
	mcpRepo *repository.MCPServerRepository,
	cfg *config.Config,
) *ChatService {
	return &ChatService{
		convRepo:          convRepo,
		msgRepo:           msgRepo,
		modelRepo:         modelRepo,
		providerRepo:      providerRepo,
		providerModelRepo: providerModelRepo,
		skillRepo:         skillRepo,
		mcpRepo:           mcpRepo,
		cfg:               cfg,
	}
}

func (s *ChatService) CreateConversation(userID uint, req dto.CreateConversationRequest) (*model.Conversation, error) {
	providerID := req.ProviderID
	if providerID == 0 {
		p, err := s.providerModelRepo.FindFirstActiveProviderForModel(req.ModelID)
		if err != nil {
			return nil, errors.New("no active provider found for this model")
		}
		providerID = p.ID
	}

	skillIDs := "[]"
	if len(req.SkillIDs) > 0 {
		b, _ := json.Marshal(req.SkillIDs)
		skillIDs = string(b)
	}
	mcpIDs := "[]"
	if len(req.MCPServerIDs) > 0 {
		b, _ := json.Marshal(req.MCPServerIDs)
		mcpIDs = string(b)
	}

	conv := &model.Conversation{
		UserID:       userID,
		Title:        req.Title,
		ModelID:      req.ModelID,
		ProviderID:   providerID,
		SkillIDs:     skillIDs,
		MCPServerIDs: mcpIDs,
	}
	if conv.Title == "" {
		conv.Title = "New Conversation"
	}
	if err := s.convRepo.Create(conv); err != nil {
		return nil, err
	}
	return conv, nil
}

// ListSkills returns active skills for the chat UI.
func (s *ChatService) ListSkills() ([]model.Skill, error) { return s.skillRepo.FindActive() }

// ListMCPServers returns active MCP server configs for the chat UI.
func (s *ChatService) ListMCPServers() ([]model.MCPServer, error) { return s.mcpRepo.FindActive() }

func (s *ChatService) ListConversations(userID uint) ([]model.Conversation, error) {
	return s.convRepo.FindByUser(userID)
}

func (s *ChatService) UpdateConversation(userID, convID uint, req dto.UpdateConversationRequest) (*model.Conversation, error) {
	updates := make(map[string]interface{})
	if req.Title != nil {
		t := strings.TrimSpace(*req.Title)
		if t == "" {
			return nil, errors.New("title cannot be empty")
		}
		updates["title"] = t
	}
	if req.Pinned != nil {
		updates["pinned"] = *req.Pinned
	}
	if len(updates) == 0 {
		return nil, errors.New("nothing to update")
	}
	if err := s.convRepo.Update(convID, userID, updates); err != nil {
		return nil, err
	}
	return s.convRepo.FindByID(convID, userID)
}

func (s *ChatService) DeleteConversation(userID, convID uint) error {
	return s.convRepo.Delete(convID, userID)
}

func (s *ChatService) GetMessages(userID, convID uint) ([]model.Message, error) {
	conv, err := s.convRepo.FindByID(convID, userID)
	if err != nil {
		return nil, errors.New("conversation not found")
	}
	_ = conv
	return s.msgRepo.FindByConversation(convID)
}

// resolveProvider returns the Provider to use for a given (modelID, providerID) pair.
// If providerID is 0, it finds the first active provider for the model.
func (s *ChatService) resolveProvider(modelID, providerID uint) (*model.Provider, error) {
	if providerID > 0 {
		return s.providerRepo.FindByID(providerID)
	}
	return s.providerModelRepo.FindFirstActiveProviderForModel(modelID)
}

// getAdapter creates a ChatAdapter using the model's declared api_format and the
// provider's credentials. apiFormat is model.APIFormat (e.g. "openai_chat").
func (s *ChatService) getAdapter(apiFormat string, provider *model.Provider) (adapter.ChatAdapter, error) {
	apiKey, err := utils.DecryptAES(s.cfg.AES.Key, provider.APIKey)
	if err != nil {
		apiKey = provider.APIKey
	}
	return adapter.NewChatAdapter(apiFormat, apiKey, provider.BaseURL)
}

func (s *ChatService) buildAdapterMessages(history []model.Message, newContent string, imageURLs []string, systemPrompt string) []adapter.Message {
	msgs := make([]adapter.Message, 0, len(history)+2)
	if systemPrompt != "" {
		msgs = append(msgs, adapter.Message{Role: "system", Content: systemPrompt})
	}
	for _, m := range history {
		msgs = append(msgs, adapter.Message{
			Role:       m.Role,
			Content:    m.Content,
			ToolCallID: m.Metadata, // Metadata stores tool_call_id for role=tool messages
		})
	}
	msgs = append(msgs, adapter.Message{
		Role:      "user",
		Content:   newContent,
		ImageURLs: imageURLs,
	})
	return msgs
}

// loadMCPTools fetches tool definitions from all MCP servers associated with a conversation.
func (s *ChatService) loadMCPTools(ctx context.Context, mcpServerIDs string) ([]adapter.Tool, []*adapter.MCPClient) {
	var ids []uint
	if mcpServerIDs != "" && mcpServerIDs != "[]" {
		_ = json.Unmarshal([]byte(mcpServerIDs), &ids)
	}
	if len(ids) == 0 {
		return nil, nil
	}
	servers, err := s.mcpRepo.FindByIDs(ids)
	if err != nil {
		return nil, nil
	}

	var tools []adapter.Tool
	var clients []*adapter.MCPClient
	for _, sv := range servers {
		client := adapter.NewMCPClient(sv.URL, sv.AuthHeader)
		mcpTools, err := client.ListTools(ctx)
		if err != nil {
			continue
		}
		for _, t := range mcpTools {
			tools = append(tools, t.ToAdapterTool())
		}
		clients = append(clients, client)
	}
	return tools, clients
}

// executeMCPToolCalls runs tool calls against the registered MCP clients and returns
// the assistant message (with tool_calls) + tool result messages to append.
func (s *ChatService) executeMCPToolCalls(ctx context.Context, toolCalls []adapter.ToolCall, clients []*adapter.MCPClient) []adapter.Message {
	msgs := []adapter.Message{{Role: "assistant", Content: "", ToolCalls: toolCalls}}
	for _, tc := range toolCalls {
		var args map[string]interface{}
		_ = json.Unmarshal([]byte(tc.Function.Arguments), &args)

		result := fmt.Sprintf("Tool %q not found on any MCP server", tc.Function.Name)
		for _, c := range clients {
			res, err := c.CallTool(ctx, tc.Function.Name, args)
			if err == nil {
				result = res
				break
			}
		}
		msgs = append(msgs, adapter.Message{
			Role:       "tool",
			Content:    result,
			ToolCallID: tc.ID,
		})
	}
	return msgs
}

// getSystemPrompts concatenates the system prompts from all skills attached to a conversation.
// Multiple prompts are separated by a blank line.
func (s *ChatService) getSystemPrompts(conv *model.Conversation) string {
	if conv.SkillIDs == "" || conv.SkillIDs == "[]" {
		return ""
	}
	var ids []uint
	if err := json.Unmarshal([]byte(conv.SkillIDs), &ids); err != nil || len(ids) == 0 {
		return ""
	}
	skills, err := s.skillRepo.FindByIDs(ids)
	if err != nil || len(skills) == 0 {
		return ""
	}
	parts := make([]string, 0, len(skills))
	for _, sk := range skills {
		if sk.SystemPrompt != "" {
			parts = append(parts, sk.SystemPrompt)
		}
	}
	return strings.Join(parts, "\n\n")
}

// ListAvailableModels returns all (provider, model) pairs that are active and usable for chat.
func (s *ChatService) ListAvailableModels(modelType string) ([]dto.ModelInfo, error) {
	providers, err := s.providerRepo.FindAll()
	if err != nil {
		return nil, err
	}

	result := make([]dto.ModelInfo, 0)
	for _, p := range providers {
		if p.Status != "active" {
			continue
		}
		pms, err := s.providerModelRepo.GetByProvider(p.ID)
		if err != nil {
			continue
		}
		for _, pm := range pms {
			if pm.Status != "active" || pm.AIModel == nil {
				continue
			}
			m := pm.AIModel
			if m.Status != "active" {
				continue
			}
			if modelType != "" && m.Type != modelType {
				continue
			}
			result = append(result, dto.ModelInfo{
				ProviderID:       p.ID,
				ProviderName:     p.Name,
				ModelID:          m.ID,
				ModelName:        m.ModelName,
				DisplayName:      m.DisplayName,
				Type:             m.Type,
				MaxTokens:        m.MaxTokens,
				SupportsStreaming: m.SupportsStreaming,
				SupportsVision:   m.SupportsVision,
			})
		}
	}
	return result, nil
}

func (s *ChatService) SendMessageStream(ctx context.Context, userID, convID uint, req dto.SendMessageRequest) (<-chan string, error) {
	conv, err := s.convRepo.FindByID(convID, userID)
	if err != nil {
		return nil, errors.New("conversation not found")
	}

	modelID := req.ModelID
	if modelID == 0 {
		modelID = conv.ModelID
	}

	aiModel, err := s.modelRepo.FindByID(modelID)
	if err != nil {
		return nil, errors.New("model not found")
	}
	if aiModel.Status != "active" {
		return nil, errors.New("model is not available")
	}

	provider, err := s.resolveProvider(modelID, conv.ProviderID)
	if err != nil {
		return nil, fmt.Errorf("no provider available for this model: %w", err)
	}

	chatAdapter, err := s.getAdapter(aiModel.APIFormat, provider)
	if err != nil {
		return nil, fmt.Errorf("adapter error: %w", err)
	}

	history, err := s.msgRepo.FindByConversation(convID)
	if err != nil {
		return nil, err
	}

	userMsg := &model.Message{
		ConversationID: convID,
		Role:           "user",
		Content:        req.Content,
	}
	if len(req.ImageURLs) > 0 {
		b, _ := json.Marshal(req.ImageURLs)
		userMsg.ImageURLs = string(b)
	}
	if err := s.msgRepo.Create(userMsg); err != nil {
		return nil, err
	}

	systemPrompt := s.getSystemPrompts(conv)
	tools, mcpClients := s.loadMCPTools(ctx, conv.MCPServerIDs)
	baseOpts := adapter.ChatOptions{MaxTokens: aiModel.MaxTokens, Tools: tools}

	adapterMsgs := s.buildAdapterMessages(history, req.Content, req.ImageURLs, systemPrompt)

	// Tool-call loop: use non-streaming rounds until AI gives a text response,
	// then stream the final answer.
	const maxToolRounds = 5
	for round := 0; round < maxToolRounds && len(tools) > 0; round++ {
		syncResp, err := chatAdapter.ChatCompletion(ctx, aiModel.ModelName, adapterMsgs, baseOpts)
		if err != nil {
			return nil, err
		}
		if len(syncResp.ToolCalls) == 0 {
			// Final text answer — stream it as a single chunk
			finalText := syncResp.Content
			outCh := make(chan string, 2)
			go func() {
				defer close(outCh)
				if finalText != "" {
					outCh <- finalText
				}
				if len(history) == 0 && finalText != "" {
					title := finalText
					if len(title) > 50 {
						title = title[:50] + "..."
					}
					_ = s.convRepo.UpdateTitle(convID, title)
				}
				assistantMsg := &model.Message{ConversationID: convID, Role: "assistant", Content: finalText}
				_ = s.msgRepo.Create(assistantMsg)
			}()
			return outCh, nil
		}
		// Execute tool calls and add results to message history
		toolMsgs := s.executeMCPToolCalls(ctx, syncResp.ToolCalls, mcpClients)
		adapterMsgs = append(adapterMsgs, toolMsgs...)
	}

	// No tools (or exhausted rounds) — fall through to normal streaming
	streamCh, err := chatAdapter.ChatCompletionStream(ctx, aiModel.ModelName, adapterMsgs, adapter.ChatOptions{
		MaxTokens: aiModel.MaxTokens,
		Stream:    true,
	})
	if err != nil {
		return nil, err
	}

	outCh := make(chan string, 20)
	go func() {
		defer close(outCh)
		var fullContent strings.Builder

		for chunk := range streamCh {
			if chunk.Error != nil {
				outCh <- fmt.Sprintf("[ERROR] %s", chunk.Error.Error())
				return
			}
			if chunk.Done {
				break
			}
			fullContent.WriteString(chunk.Content)
			select {
			case outCh <- chunk.Content:
			case <-ctx.Done():
				return
			}
		}

		if len(history) == 0 && fullContent.Len() > 0 {
			title := fullContent.String()
			if len(title) > 50 {
				title = title[:50] + "..."
			}
			_ = s.convRepo.UpdateTitle(convID, title)
		}

		assistantMsg := &model.Message{
			ConversationID: convID,
			Role:           "assistant",
			Content:        fullContent.String(),
		}
		_ = s.msgRepo.Create(assistantMsg)
	}()

	return outCh, nil
}

func (s *ChatService) SendMessage(ctx context.Context, userID, convID uint, req dto.SendMessageRequest) (*model.Message, error) {
	conv, err := s.convRepo.FindByID(convID, userID)
	if err != nil {
		return nil, errors.New("conversation not found")
	}

	modelID := req.ModelID
	if modelID == 0 {
		modelID = conv.ModelID
	}

	aiModel, err := s.modelRepo.FindByID(modelID)
	if err != nil {
		return nil, errors.New("model not found")
	}

	provider, err := s.resolveProvider(modelID, conv.ProviderID)
	if err != nil {
		return nil, fmt.Errorf("no provider available for this model: %w", err)
	}

	chatAdapter, err := s.getAdapter(aiModel.APIFormat, provider)
	if err != nil {
		return nil, fmt.Errorf("adapter error: %w", err)
	}

	history, err := s.msgRepo.FindByConversation(convID)
	if err != nil {
		return nil, err
	}

	userMsg := &model.Message{
		ConversationID: convID,
		Role:           "user",
		Content:        req.Content,
	}
	if err := s.msgRepo.Create(userMsg); err != nil {
		return nil, err
	}

	systemPrompt := s.getSystemPrompts(conv)
	tools, mcpClients := s.loadMCPTools(ctx, conv.MCPServerIDs)
	adapterMsgs := s.buildAdapterMessages(history, req.Content, req.ImageURLs, systemPrompt)

	const maxRounds = 5
	var resp adapter.ChatResponse
	for round := 0; round < maxRounds; round++ {
		opts := adapter.ChatOptions{MaxTokens: aiModel.MaxTokens, Tools: tools}
		resp, err = chatAdapter.ChatCompletion(ctx, aiModel.ModelName, adapterMsgs, opts)
		if err != nil {
			return nil, err
		}
		if len(resp.ToolCalls) == 0 {
			break
		}
		toolMsgs := s.executeMCPToolCalls(ctx, resp.ToolCalls, mcpClients)
		adapterMsgs = append(adapterMsgs, toolMsgs...)
		tools = nil // after first tool round, don't offer tools again to avoid infinite loop
	}

	assistantMsg := &model.Message{
		ConversationID: convID,
		Role:           "assistant",
		Content:        resp.Content,
		TokenCount:     resp.TokenCount,
	}
	if err := s.msgRepo.Create(assistantMsg); err != nil {
		return nil, err
	}

	return assistantMsg, nil
}

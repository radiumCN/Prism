package service

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"modelhub/server/internal/adapter"
	"modelhub/server/internal/config"
	"modelhub/server/internal/dto"
	"modelhub/server/internal/model"
	"modelhub/server/internal/repository"
	"modelhub/server/internal/utils"
	"net"
	"net/smtp"
	"strconv"
	"strings"
	"time"
)

type ChatService struct {
	convRepo          *repository.ConversationRepository
	msgRepo           *repository.MessageRepository
	modelRepo         *repository.ModelRepository
	providerRepo      *repository.ProviderRepository
	providerModelRepo *repository.ProviderModelRepository
	skillRepo         *repository.SkillRepository
	mcpRepo           *repository.MCPServerRepository
	settingRepo       *repository.SettingRepository
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
	settingRepo *repository.SettingRepository,
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
		settingRepo:       settingRepo,
		cfg:               cfg,
	}
}

func (s *ChatService) CreateConversation(userID uint, req dto.CreateConversationRequest) (*model.Conversation, error) {
	providerID := req.ProviderID
	if providerID == 0 {
		p, err := s.providerModelRepo.FindFirstActiveProviderForModel(req.ModelID, userID)
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

// ListSkills returns active skills belonging to the given user.
func (s *ChatService) ListSkills(userID uint) ([]model.Skill, error) {
	return s.skillRepo.FindActive(userID)
}

// ListMCPServers returns active MCP server configs belonging to the given user.
func (s *ChatService) ListMCPServers(userID uint) ([]model.MCPServer, error) {
	return s.mcpRepo.FindActive(userID)
}

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

func (s *ChatService) GetConversationInfo(userID, convID uint) (*model.Conversation, error) {
	conv, err := s.convRepo.FindByID(convID, userID)
	if err != nil {
		return nil, errors.New("conversation not found")
	}
	return conv, nil
}

func (s *ChatService) GetMessages(userID, convID uint) ([]model.Message, error) {
	conv, err := s.convRepo.FindByID(convID, userID)
	if err != nil {
		return nil, errors.New("conversation not found")
	}
	_ = conv
	return s.msgRepo.FindByConversation(convID)
}

// resolveProvider returns the Provider to use for a given (modelID, providerID, userID) tuple.
// If providerID is 0, it finds the first active provider for the model belonging to the user.
func (s *ChatService) resolveProvider(modelID, providerID, userID uint) (*model.Provider, error) {
	if providerID > 0 {
		return s.providerRepo.FindByID(providerID, userID)
	}
	return s.providerModelRepo.FindFirstActiveProviderForModel(modelID, userID)
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

// builtinEmailTool is the OpenAI-compatible function schema for sending email via SMTP.
var builtinEmailTool = adapter.Tool{
	Type: "function",
	Function: adapter.ToolFunction{
		Name:        "send_email",
		Description: "通过 SMTP 发送电子邮件",
		Parameters: json.RawMessage(`{
			"type": "object",
			"properties": {
				"to":      {"type": "string", "description": "收件人邮箱地址，多个地址用逗号分隔"},
				"subject":{"type": "string", "description": "邮件主题"},
				"body":   {"type": "string", "description": "邮件正文（纯文本）"}
			},
			"required": ["to", "subject", "body"]
		}`),
	},
}

// sendEmailBuiltin sends an email using system SMTP settings.
func (s *ChatService) sendEmailBuiltin(to, subject, body string) (string, error) {
	host, _ := s.settingRepo.Get("smtp_host")
	portStr, _ := s.settingRepo.Get("smtp_port")
	user, _ := s.settingRepo.Get("smtp_user")
	pass, _ := s.settingRepo.Get("smtp_pass")

	if host == "" || user == "" {
		return "", fmt.Errorf("SMTP 未配置，请在管理后台 → 系统设置中填写 SMTP 信息")
	}
	port := 587
	if p, err := strconv.Atoi(portStr); err == nil && p > 0 {
		port = p
	}

	addr := fmt.Sprintf("%s:%d", host, port)
	msg := []byte("From: " + user + "\r\n" +
		"To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/plain; charset=UTF-8\r\n" +
		"\r\n" + body + "\r\n")

	// Try STARTTLS first; fall back to plain if port is 465 (implicit TLS)
	if port == 465 {
		tlsCfg := &tls.Config{ServerName: host}
		conn, err := tls.Dial("tcp", addr, tlsCfg)
		if err != nil {
			return "", fmt.Errorf("SMTP TLS 连接失败: %w", err)
		}
		c, err := smtp.NewClient(conn, host)
		if err != nil {
			return "", fmt.Errorf("SMTP 客户端初始化失败: %w", err)
		}
		defer c.Quit()
		if pass != "" {
			if err := c.Auth(smtp.PlainAuth("", user, pass, host)); err != nil {
				return "", fmt.Errorf("SMTP 认证失败: %w", err)
			}
		}
		if err := c.Mail(user); err != nil {
			return "", err
		}
		for _, r := range strings.Split(to, ",") {
			if err := c.Rcpt(strings.TrimSpace(r)); err != nil {
				return "", fmt.Errorf("收件人 %s 无效: %w", r, err)
			}
		}
		w, err := c.Data()
		if err != nil {
			return "", err
		}
		if _, err = w.Write(msg); err != nil {
			return "", err
		}
		w.Close()
	} else {
		// STARTTLS
		auth := smtp.PlainAuth("", user, pass, host)
		netConn, err := net.DialTimeout("tcp", addr, 10*time.Second)
		if err != nil {
			return "", fmt.Errorf("SMTP 连接失败: %w", err)
		}
		c, err := smtp.NewClient(netConn, host)
		if err != nil {
			return "", fmt.Errorf("SMTP 客户端初始化失败: %w", err)
		}
		defer c.Quit()
		if ok, _ := c.Extension("STARTTLS"); ok {
			tlsCfg := &tls.Config{ServerName: host}
			if err := c.StartTLS(tlsCfg); err != nil {
				return "", fmt.Errorf("STARTTLS 失败: %w", err)
			}
		}
		if pass != "" {
			if err := c.Auth(auth); err != nil {
				return "", fmt.Errorf("SMTP 认证失败: %w", err)
			}
		}
		if err := c.Mail(user); err != nil {
			return "", err
		}
		for _, r := range strings.Split(to, ",") {
			if err := c.Rcpt(strings.TrimSpace(r)); err != nil {
				return "", fmt.Errorf("收件人 %s 无效: %w", r, err)
			}
		}
		w, err := c.Data()
		if err != nil {
			return "", err
		}
		if _, err = w.Write(msg); err != nil {
			return "", err
		}
		w.Close()
	}
	return fmt.Sprintf("邮件已成功发送至 %s", to), nil
}

// loadMCPTools fetches tool definitions from all MCP servers associated with a conversation.
// For servers named "Email (SMTP/IMAP)" (or any name containing "email"/"mail"), it injects
// a built-in send_email tool that uses system SMTP settings instead of requiring an external server.
// Returns empty if the global mcp_enabled setting is "false".
func (s *ChatService) loadMCPTools(ctx context.Context, mcpServerIDs string, userID uint) ([]adapter.Tool, []*adapter.MCPClient) {
	// Respect the global MCP on/off switch from system settings
	if enabled, err := s.settingRepo.Get("mcp_enabled"); err == nil && enabled == "false" {
		log.Printf("[MCP] globally disabled, skipping tool load")
		return nil, nil
	}
	var ids []uint
	if mcpServerIDs != "" && mcpServerIDs != "[]" {
		_ = json.Unmarshal([]byte(mcpServerIDs), &ids)
	}
	if len(ids) == 0 {
		return nil, nil
	}
	servers, err := s.mcpRepo.FindByIDs(ids, userID)
	if err != nil {
		log.Printf("[MCP] FindByIDs(%v) error: %v", ids, err)
		return nil, nil
	}

	var tools []adapter.Tool
	var clients []*adapter.MCPClient
	hasBuiltinEmail := false

	for _, sv := range servers {
		nameLower := strings.ToLower(sv.Name)
		// Built-in: Email MCP — use system SMTP instead of an external server
		if strings.Contains(nameLower, "email") || strings.Contains(nameLower, "mail") ||
			strings.Contains(nameLower, "smtp") || strings.Contains(nameLower, "imap") {
			log.Printf("[MCP] server %q mapped to built-in email tool", sv.Name)
			hasBuiltinEmail = true
			continue
		}

		client := adapter.NewMCPClient(sv.URL, sv.AuthHeader)
		// Initialize handshake (non-fatal if server doesn't require it)
		_ = client.Initialize(ctx)

		mcpTools, err := client.ListTools(ctx)
		if err != nil {
			log.Printf("[MCP] server %q (%s) list tools failed: %v", sv.Name, sv.URL, err)
			continue
		}
		log.Printf("[MCP] server %q loaded %d tools", sv.Name, len(mcpTools))
		for _, t := range mcpTools {
			tools = append(tools, t.ToAdapterTool())
		}
		clients = append(clients, client)
	}

	if hasBuiltinEmail {
		tools = append(tools, builtinEmailTool)
	}

	return tools, clients
}

// executeMCPToolCalls runs tool calls against the registered MCP clients (or built-in handlers)
// and returns the assistant message (with tool_calls) + tool result messages to append.
func (s *ChatService) executeMCPToolCalls(ctx context.Context, toolCalls []adapter.ToolCall, clients []*adapter.MCPClient) []adapter.Message {
	msgs := []adapter.Message{{Role: "assistant", Content: "", ToolCalls: toolCalls}}
	for _, tc := range toolCalls {
		var args map[string]interface{}
		_ = json.Unmarshal([]byte(tc.Function.Arguments), &args)

		var result string

		// Handle built-in tools first
		switch tc.Function.Name {
		case "send_email":
			to, _ := args["to"].(string)
			subject, _ := args["subject"].(string)
			body, _ := args["body"].(string)
			log.Printf("[MCP:email] sending to=%q subject=%q", to, subject)
			res, err := s.sendEmailBuiltin(to, subject, body)
			if err != nil {
				result = fmt.Sprintf("邮件发送失败: %s", err.Error())
				log.Printf("[MCP:email] error: %v", err)
			} else {
				result = res
				log.Printf("[MCP:email] success: %s", result)
			}
		default:
			result = fmt.Sprintf("Tool %q not found on any MCP server", tc.Function.Name)
			for _, c := range clients {
				res, err := c.CallTool(ctx, tc.Function.Name, args)
				if err != nil {
					log.Printf("[MCP] call tool %q on %s error: %v", tc.Function.Name, c.URL, err)
					continue
				}
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
// Returns empty if the global skill_enabled setting is "false".
func (s *ChatService) getSystemPrompts(conv *model.Conversation, userID uint) string {
	if enabled, err := s.settingRepo.Get("skill_enabled"); err == nil && enabled == "false" {
		log.Printf("[SKILL] globally disabled, skipping system prompt injection")
		return ""
	}
	log.Printf("[SKILL] convID=%d skill_ids=%q", conv.ID, conv.SkillIDs)
	if conv.SkillIDs == "" || conv.SkillIDs == "[]" {
		return ""
	}
	var ids []uint
	if err := json.Unmarshal([]byte(conv.SkillIDs), &ids); err != nil || len(ids) == 0 {
		log.Printf("[SKILL] unmarshal error or empty ids: %v", conv.SkillIDs)
		return ""
	}
	skills, err := s.skillRepo.FindByIDs(ids, userID)
	if err != nil || len(skills) == 0 {
		log.Printf("[SKILL] FindByIDs(%v) returned no skills: err=%v", ids, err)
		return ""
	}
	parts := make([]string, 0, len(skills))
	for _, sk := range skills {
		if sk.SystemPrompt != "" {
			parts = append(parts, sk.SystemPrompt)
		}
	}
	result := strings.Join(parts, "\n\n")
	log.Printf("[SKILL] injecting system prompt len=%d from %d skills", len(result), len(skills))
	return result
}

// ListAvailableModels returns all (provider, model) pairs for the user that are active and usable for chat.
func (s *ChatService) ListAvailableModels(userID uint, modelType string) ([]dto.ModelInfo, error) {
	providers, err := s.providerRepo.FindAll(userID)
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

	provider, err := s.resolveProvider(modelID, conv.ProviderID, userID)
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

	systemPrompt := s.getSystemPrompts(conv, userID)
	tools, mcpClients := s.loadMCPTools(ctx, conv.MCPServerIDs, userID)
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

	provider, err := s.resolveProvider(modelID, conv.ProviderID, userID)
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

	systemPrompt := s.getSystemPrompts(conv, userID)
	tools, mcpClients := s.loadMCPTools(ctx, conv.MCPServerIDs, userID)
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

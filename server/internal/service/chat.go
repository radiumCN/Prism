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
	cfg               *config.Config
}

func NewChatService(
	convRepo *repository.ConversationRepository,
	msgRepo *repository.MessageRepository,
	modelRepo *repository.ModelRepository,
	providerRepo *repository.ProviderRepository,
	providerModelRepo *repository.ProviderModelRepository,
	cfg *config.Config,
) *ChatService {
	return &ChatService{
		convRepo:          convRepo,
		msgRepo:           msgRepo,
		modelRepo:         modelRepo,
		providerRepo:      providerRepo,
		providerModelRepo: providerModelRepo,
		cfg:               cfg,
	}
}

func (s *ChatService) CreateConversation(userID uint, req dto.CreateConversationRequest) (*model.Conversation, error) {
	providerID := req.ProviderID
	if providerID == 0 {
		// Fall back to the first active provider supporting this model
		p, err := s.providerModelRepo.FindFirstActiveProviderForModel(req.ModelID)
		if err != nil {
			return nil, errors.New("no active provider found for this model")
		}
		providerID = p.ID
	}

	conv := &model.Conversation{
		UserID:     userID,
		Title:      req.Title,
		ModelID:    req.ModelID,
		ProviderID: providerID,
	}
	if conv.Title == "" {
		conv.Title = "New Conversation"
	}
	if err := s.convRepo.Create(conv); err != nil {
		return nil, err
	}
	return conv, nil
}

func (s *ChatService) ListConversations(userID uint) ([]model.Conversation, error) {
	return s.convRepo.FindByUser(userID)
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

func (s *ChatService) getAdapterForProvider(provider *model.Provider) (adapter.ChatAdapter, error) {
	apiKey, err := utils.DecryptAES(s.cfg.AES.Key, provider.APIKey)
	if err != nil {
		apiKey = provider.APIKey
	}
	return adapter.NewChatAdapter(provider.Name, apiKey, provider.BaseURL)
}

func (s *ChatService) buildAdapterMessages(history []model.Message, newContent string, imageURLs []string) []adapter.Message {
	msgs := make([]adapter.Message, 0, len(history)+1)
	for _, m := range history {
		msgs = append(msgs, adapter.Message{Role: m.Role, Content: m.Content})
	}
	msgs = append(msgs, adapter.Message{
		Role:      "user",
		Content:   newContent,
		ImageURLs: imageURLs,
	})
	return msgs
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

	chatAdapter, err := s.getAdapterForProvider(provider)
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

	adapterMsgs := s.buildAdapterMessages(history, req.Content, req.ImageURLs)
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

	chatAdapter, err := s.getAdapterForProvider(provider)
	if err != nil {
		return nil, err
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

	adapterMsgs := s.buildAdapterMessages(history, req.Content, req.ImageURLs)
	resp, err := chatAdapter.ChatCompletion(ctx, aiModel.ModelName, adapterMsgs, adapter.ChatOptions{
		MaxTokens: aiModel.MaxTokens,
	})
	if err != nil {
		return nil, err
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

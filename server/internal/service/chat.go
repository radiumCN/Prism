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
	convRepo     *repository.ConversationRepository
	msgRepo      *repository.MessageRepository
	modelRepo    *repository.ModelRepository
	providerRepo *repository.ProviderRepository
	cfg          *config.Config
}

func NewChatService(
	convRepo *repository.ConversationRepository,
	msgRepo *repository.MessageRepository,
	modelRepo *repository.ModelRepository,
	providerRepo *repository.ProviderRepository,
	cfg *config.Config,
) *ChatService {
	return &ChatService{
		convRepo:     convRepo,
		msgRepo:      msgRepo,
		modelRepo:    modelRepo,
		providerRepo: providerRepo,
		cfg:          cfg,
	}
}

func (s *ChatService) CreateConversation(userID uint, req dto.CreateConversationRequest) (*model.Conversation, error) {
	conv := &model.Conversation{
		UserID:  userID,
		Title:   req.Title,
		ModelID: req.ModelID,
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

func (s *ChatService) getAdapter(aiModel *model.AIModel) (adapter.ChatAdapter, error) {
	if aiModel.Provider == nil {
		return nil, errors.New("provider not loaded")
	}

	apiKey, err := utils.DecryptAES(s.cfg.AES.Key, aiModel.Provider.APIKey)
	if err != nil {
		apiKey = aiModel.Provider.APIKey
	}

	return adapter.NewChatAdapter(aiModel.Provider.Name, apiKey, aiModel.Provider.BaseURL)
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

	chatAdapter, err := s.getAdapter(aiModel)
	if err != nil {
		return nil, fmt.Errorf("adapter error: %w", err)
	}

	history, err := s.msgRepo.FindByConversation(convID)
	if err != nil {
		return nil, err
	}

	// Save user message
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

		// Update conversation title on first message
		if len(history) == 0 && fullContent.Len() > 0 {
			title := fullContent.String()
			if len(title) > 50 {
				title = title[:50] + "..."
			}
			_ = s.convRepo.UpdateTitle(convID, title)
		}

		// Save assistant message
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

	chatAdapter, err := s.getAdapter(aiModel)
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

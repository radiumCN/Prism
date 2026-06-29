package service

import (
	"context"
	"errors"
	"fmt"
	"math/rand"
	"strings"
	"time"

	"modelhub/server/internal/config"
	"modelhub/server/internal/dto"
	"modelhub/server/internal/model"
	"modelhub/server/internal/repository"
	"modelhub/server/internal/utils"

	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"
)

const codeKeyPrefix = "verify:code:"
const cooldownKeyPrefix = "verify:cooldown:"

type AuthService struct {
	userRepo   *repository.UserRepository
	ossRepo    *repository.UserOSSConfigRepository
	rdb        *redis.Client
	cfg        *config.Config
}

func NewAuthService(
	userRepo *repository.UserRepository,
	ossRepo *repository.UserOSSConfigRepository,
	rdb *redis.Client,
	cfg *config.Config,
) *AuthService {
	return &AuthService{userRepo: userRepo, ossRepo: ossRepo, rdb: rdb, cfg: cfg}
}

// SendVerificationCode 生成 6 位验证码，存入 Redis 并发送邮件。
// 同一邮箱 60 秒内只允许发一次。
func (s *AuthService) SendVerificationCode(email string) error {
	ctx := context.Background()

	// 冷却检查
	cooldownKey := cooldownKeyPrefix + email
	if s.rdb != nil {
		exists, err := s.rdb.Exists(ctx, cooldownKey).Result()
		if err == nil && exists > 0 {
			return errors.New("请稍后再试，60 秒内只能发送一次验证码")
		}
	}

	code := fmt.Sprintf("%06d", rand.New(rand.NewSource(time.Now().UnixNano())).Intn(1000000))

	// 写入 Redis
	if s.rdb != nil {
		ttl := time.Duration(s.cfg.SMTP.CodeTTL) * time.Second
		if err := s.rdb.Set(ctx, codeKeyPrefix+email, code, ttl).Err(); err != nil {
			return fmt.Errorf("存储验证码失败: %w", err)
		}
		// 60 秒冷却
		_ = s.rdb.Set(ctx, cooldownKey, "1", 60*time.Second).Err()
	}

	return utils.SendVerificationEmail(utils.EmailConfig{
		Host:     s.cfg.SMTP.Host,
		Port:     s.cfg.SMTP.Port,
		User:     s.cfg.SMTP.User,
		Password: s.cfg.SMTP.Password,
		From:     s.cfg.SMTP.From,
	}, email, code)
}

// verifyCode 检查验证码是否正确，验证通过后删除（一次性使用）。
func (s *AuthService) verifyCode(email, code string) error {
	if s.rdb == nil {
		// Redis 不可用时跳过验证（仅用于无 Redis 的开发环境）
		return nil
	}
	ctx := context.Background()
	key := codeKeyPrefix + email
	stored, err := s.rdb.Get(ctx, key).Result()
	if err == redis.Nil {
		return errors.New("验证码已过期或不存在，请重新获取")
	}
	if err != nil {
		return fmt.Errorf("验证码查询失败: %w", err)
	}
	if stored != code {
		return errors.New("验证码错误")
	}
	_ = s.rdb.Del(ctx, key).Err()
	return nil
}

func (s *AuthService) Register(req dto.RegisterRequest) (*dto.AuthResponse, error) {
	if err := s.verifyCode(req.Email, req.Code); err != nil {
		return nil, err
	}

	emailExists, err := s.userRepo.ExistsByEmail(req.Email)
	if err != nil {
		return nil, err
	}
	if emailExists {
		return nil, errors.New("该邮箱已注册")
	}

	usernameExists, err := s.userRepo.ExistsByUsername(req.Username)
	if err != nil {
		return nil, err
	}
	if usernameExists {
		return nil, errors.New("用户名已被占用")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &model.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: string(hash),
		Role:         "user",
		Status:       "active",
	}
	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	return s.generateTokenPair(user)
}

func (s *AuthService) Login(req dto.LoginRequest) (*dto.AuthResponse, error) {
	var user *model.User
	var err error

	if strings.Contains(req.Account, "@") {
		user, err = s.userRepo.FindByEmail(req.Account)
	} else {
		user, err = s.userRepo.FindByUsername(req.Account)
	}
	if err != nil {
		return nil, errors.New("账号或密码错误")
	}
	if user.Status != "active" {
		return nil, errors.New("账号已被禁用")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("账号或密码错误")
	}
	return s.generateTokenPair(user)
}

func (s *AuthService) Refresh(refreshToken string) (*dto.AuthResponse, error) {
	claims, err := utils.ParseToken(refreshToken, s.cfg.JWT.RefreshSecret)
	if err != nil {
		return nil, errors.New("refresh token 无效")
	}
	if claims.Type != "refresh" {
		return nil, errors.New("token 类型错误")
	}
	user, err := s.userRepo.FindByID(claims.UserID)
	if err != nil {
		return nil, errors.New("用户不存在")
	}
	if user.Status != "active" {
		return nil, errors.New("账号已被禁用")
	}
	return s.generateTokenPair(user)
}

func (s *AuthService) GetProfile(userID uint) (*dto.UserInfo, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, err
	}
	return &dto.UserInfo{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.Email,
		Role:     user.Role,
	}, nil
}

func (s *AuthService) UpdateProfile(userID uint, req dto.UpdateProfileRequest) (*dto.UserInfo, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, errors.New("用户不存在")
	}

	// Update username if provided
	if req.Username != "" && req.Username != user.Username {
		exists, err := s.userRepo.ExistsByUsername(req.Username)
		if err != nil {
			return nil, err
		}
		if exists {
			return nil, errors.New("用户名已被占用")
		}
		user.Username = req.Username
	}

	// Update password if provided
	if req.NewPassword != "" {
		if req.OldPassword == "" {
			return nil, errors.New("请输入当前密码")
		}
		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.OldPassword)); err != nil {
			return nil, errors.New("当前密码错误")
		}
		hash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
		if err != nil {
			return nil, err
		}
		user.PasswordHash = string(hash)
	}

	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}
	return &dto.UserInfo{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.Email,
		Role:     user.Role,
	}, nil
}

func (s *AuthService) generateTokenPair(user *model.User) (*dto.AuthResponse, error) {
	accessToken, err := utils.GenerateAccessToken(user.ID, user.Role, s.cfg.JWT.AccessSecret, s.cfg.JWT.AccessExpiry)
	if err != nil {
		return nil, err
	}
	refreshToken, err := utils.GenerateRefreshToken(user.ID, user.Role, s.cfg.JWT.RefreshSecret, s.cfg.JWT.RefreshExpiry)
	if err != nil {
		return nil, err
	}
	return &dto.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User: dto.UserInfo{
			ID:       user.ID,
			Username: user.Username,
			Email:    user.Email,
			Role:     user.Role,
		},
	}, nil
}

// ---- Per-user OSS configuration ----

type OSSConfigResponse struct {
	Provider   string `json:"provider"`
	SecretID   string `json:"secret_id"`   // masked on read
	SecretKey  string `json:"secret_key"`  // masked on read
	Bucket     string `json:"bucket"`
	Region     string `json:"region"`
	BaseURL    string `json:"base_url"`
	PathPrefix string `json:"path_prefix"`
}

type UpsertOSSConfigRequest struct {
	Provider   string `json:"provider"`
	SecretID   string `json:"secret_id"`
	SecretKey  string `json:"secret_key"`
	Bucket     string `json:"bucket"`
	Region     string `json:"region"`
	BaseURL    string `json:"base_url"`
	PathPrefix string `json:"path_prefix"`
}

func (s *AuthService) GetOSSConfig(userID uint) (*OSSConfigResponse, error) {
	cfg, err := s.ossRepo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}
	if cfg == nil {
		return &OSSConfigResponse{Provider: "none"}, nil
	}
	resp := &OSSConfigResponse{
		Provider:   cfg.Provider,
		Bucket:     cfg.Bucket,
		Region:     cfg.Region,
		BaseURL:    cfg.BaseURL,
		PathPrefix: cfg.PathPrefix,
	}
	// Mask stored credentials: show only whether they are set
	if cfg.SecretID != "" {
		resp.SecretID = "••••••••"
	}
	if cfg.SecretKey != "" {
		resp.SecretKey = "••••••••"
	}
	return resp, nil
}

func (s *AuthService) UpsertOSSConfig(userID uint, req UpsertOSSConfigRequest) error {
	existing, err := s.ossRepo.FindByUserID(userID)
	if err != nil {
		return err
	}

	cfg := &model.UserOSSConfig{
		UserID:     userID,
		Provider:   req.Provider,
		Bucket:     req.Bucket,
		Region:     req.Region,
		BaseURL:    req.BaseURL,
		PathPrefix: req.PathPrefix,
	}
	if existing != nil {
		cfg.ID = existing.ID
		cfg.CreatedAt = existing.CreatedAt
	}

	// Only update credentials if the user sent non-masked values
	encryptOrKeep := func(newVal, existingEncrypted string) string {
		if newVal == "" || newVal == "••••••••" {
			return existingEncrypted
		}
		enc, err := utils.EncryptAES(s.cfg.AES.Key, newVal)
		if err != nil {
			return newVal
		}
		return enc
	}

	existingSecretID := ""
	existingSecretKey := ""
	if existing != nil {
		existingSecretID = existing.SecretID
		existingSecretKey = existing.SecretKey
	}
	cfg.SecretID = encryptOrKeep(req.SecretID, existingSecretID)
	cfg.SecretKey = encryptOrKeep(req.SecretKey, existingSecretKey)

	return s.ossRepo.Upsert(cfg)
}

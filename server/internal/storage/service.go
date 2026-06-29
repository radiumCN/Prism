package storage

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"log"
	"modelhub/server/internal/model"
	"modelhub/server/internal/repository"
	"modelhub/server/internal/utils"
	"strings"
)

// Service wraps cloud/local storage and exposes helpers used by generation handlers.
type Service struct {
	ossRepo       *repository.UserOSSConfigRepository
	aesKey        string
	localFallback *LocalProvider
}

func NewService(ossRepo *repository.UserOSSConfigRepository, aesKey, localBaseURL string) *Service {
	return &Service{
		ossRepo:       ossRepo,
		aesKey:        aesKey,
		localFallback: NewLocalProvider("./uploads", localBaseURL, "generations"),
	}
}

// provider builds the configured Provider for the given user on demand.
func (s *Service) provider(ctx context.Context, userID uint) Provider {
	cfg, err := s.ossRepo.FindByUserID(userID)
	if err != nil || cfg == nil {
		return s.localFallback
	}
	return s.providerFromConfig(cfg)
}

func (s *Service) providerFromConfig(cfg *model.UserOSSConfig) Provider {
	secretID, _ := utils.DecryptAES(s.aesKey, cfg.SecretID)
	if secretID == "" {
		secretID = cfg.SecretID
	}
	secretKey, _ := utils.DecryptAES(s.aesKey, cfg.SecretKey)
	if secretKey == "" {
		secretKey = cfg.SecretKey
	}

	switch cfg.Provider {
	case "tencent_cos":
		if secretID != "" && secretKey != "" && cfg.Bucket != "" && cfg.Region != "" {
			return NewCOSProvider(secretID, secretKey, cfg.Bucket, cfg.Region, cfg.BaseURL, cfg.PathPrefix)
		}
	case "aliyun_oss":
		if secretID != "" && secretKey != "" && cfg.Bucket != "" && cfg.Region != "" {
			p, err := NewOSSProvider(secretID, secretKey, cfg.Bucket, cfg.Region, cfg.BaseURL, cfg.PathPrefix)
			if err != nil {
				log.Printf("[storage] aliyun OSS init error: %v", err)
				break
			}
			return p
		}
	}
	return s.localFallback
}

// ProcessURL converts a base64 data URI to a persistent storage URL.
// If the URL is already an http/https URL it is returned unchanged.
// On any error the original URL is returned so generation is not blocked.
func (s *Service) ProcessURL(ctx context.Context, userID uint, dataURL string) string {
	if !strings.HasPrefix(dataURL, "data:") {
		return dataURL
	}

	rest := strings.TrimPrefix(dataURL, "data:")
	semi := strings.Index(rest, ";")
	if semi < 0 {
		return dataURL
	}
	mimeType := rest[:semi]
	rest = rest[semi+1:]
	if !strings.HasPrefix(rest, "base64,") {
		return dataURL
	}

	data, err := base64.StdEncoding.DecodeString(rest[len("base64,"):])
	if err != nil {
		log.Printf("[storage] base64 decode error: %v", err)
		return dataURL
	}

	ext := mimeToExt(mimeType)
	key := randomKey() + ext

	prov := s.provider(ctx, userID)
	url, err := prov.Upload(ctx, key, data, mimeType)
	if err != nil {
		log.Printf("[storage] upload error: %v", err)
		return dataURL
	}
	return url
}

// ProcessURLs calls ProcessURL on each element of a slice.
func (s *Service) ProcessURLs(ctx context.Context, userID uint, urls []string) []string {
	out := make([]string, len(urls))
	for i, u := range urls {
		out[i] = s.ProcessURL(ctx, userID, u)
	}
	return out
}

func randomKey() string {
	buf := make([]byte, 16)
	_, _ = rand.Read(buf)
	return hex.EncodeToString(buf)
}

func mimeToExt(mime string) string {
	switch mime {
	case "image/png":
		return ".png"
	case "image/jpeg", "image/jpg":
		return ".jpg"
	case "image/gif":
		return ".gif"
	case "image/webp":
		return ".webp"
	case "video/mp4":
		return ".mp4"
	case "video/webm":
		return ".webm"
	default:
		parts := strings.Split(mime, "/")
		if len(parts) == 2 {
			return fmt.Sprintf(".%s", parts[1])
		}
		return ".bin"
	}
}

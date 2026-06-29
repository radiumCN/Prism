package storage

import (
	"context"
	"fmt"
	"mime"
	"os"
	"path/filepath"
	"time"
)

// LocalProvider saves files to the local uploads directory (fallback when OSS is disabled).
type LocalProvider struct {
	dir     string // e.g. "./uploads"
	baseURL string // e.g. "http://localhost:8080"
	prefix  string // subdir inside dir, e.g. "generations"
}

func NewLocalProvider(dir, baseURL, prefix string) *LocalProvider {
	return &LocalProvider{dir: dir, baseURL: baseURL, prefix: prefix}
}

func (p *LocalProvider) Enabled() bool { return true }

func (p *LocalProvider) Upload(_ context.Context, key string, data []byte, contentType string) (string, error) {
	// Derive extension from content-type if key has none
	ext := filepath.Ext(key)
	if ext == "" {
		exts, _ := mime.ExtensionsByType(contentType)
		if len(exts) > 0 {
			ext = exts[0]
			key = key + ext
		}
	}

	dateDir := time.Now().Format("20060102")
	savePath := filepath.Join(p.dir, p.prefix, dateDir)
	if err := os.MkdirAll(savePath, 0755); err != nil {
		return "", fmt.Errorf("local storage mkdir failed: %w", err)
	}

	fullPath := filepath.Join(savePath, key)
	if err := os.WriteFile(fullPath, data, 0644); err != nil {
		return "", fmt.Errorf("local storage write failed: %w", err)
	}

	// Return URL relative to server root
	urlPath := fmt.Sprintf("/uploads/%s/%s/%s", p.prefix, dateDir, key)
	if p.baseURL != "" {
		return p.baseURL + urlPath, nil
	}
	return urlPath, nil
}

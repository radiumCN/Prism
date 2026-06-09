package config

import (
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Redis    RedisConfig
	JWT      JWTConfig
	AES      AESConfig
	SMTP     SMTPConfig
}

type SMTPConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	From     string
	// CodeTTL: 验证码有效期（秒）
	CodeTTL int
}

type ServerConfig struct {
	Port        string
	Mode        string
	CORSOrigins []string
}

type DatabaseConfig struct {
	DSN string
}

type RedisConfig struct {
	Addr     string
	Password string
	DB       int
}

type JWTConfig struct {
	AccessSecret  string
	RefreshSecret string
	AccessExpiry  int // minutes
	RefreshExpiry int // days
}

type AESConfig struct {
	Key string
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// parseCORSOrigins 将逗号分隔的字符串解析为切片，忽略空项
func parseCORSOrigins(raw string) []string {
	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if s := strings.TrimSpace(p); s != "" {
			out = append(out, s)
		}
	}
	return out
}

func getEnvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return fallback
}

func Load() (*Config, error) {
	// Load .env file if present; silently ignore if missing (env vars already set)
	_ = godotenv.Load()

	return &Config{
		Server: ServerConfig{
			Port:        getEnv("SERVER_PORT", "8080"),
			Mode:        getEnv("SERVER_MODE", "debug"),
			CORSOrigins: parseCORSOrigins(getEnv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001")),
		},
		Database: DatabaseConfig{
			DSN: getEnv("DATABASE_DSN", "host=localhost user=postgres password=postgres dbname=modelhub port=5432 sslmode=disable"),
		},
		Redis: RedisConfig{
			Addr:     getEnv("REDIS_ADDR", "localhost:6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       getEnvInt("REDIS_DB", 0),
		},
		JWT: JWTConfig{
			AccessSecret:  getEnv("JWT_ACCESS_SECRET", "modelhub-access-secret-change-in-prod"),
			RefreshSecret: getEnv("JWT_REFRESH_SECRET", "modelhub-refresh-secret-change-in-prod"),
			AccessExpiry:  getEnvInt("JWT_ACCESS_EXPIRY", 15),
			RefreshExpiry: getEnvInt("JWT_REFRESH_EXPIRY", 7),
		},
		AES: AESConfig{
			Key: getEnv("AES_KEY", "modelhub-aes-key-32byteslong!!"),
		},
		SMTP: SMTPConfig{
			Host:     getEnv("SMTP_HOST", ""),
			Port:     getEnvInt("SMTP_PORT", 587),
			User:     getEnv("SMTP_USER", ""),
			Password: getEnv("SMTP_PASSWORD", ""),
			From:     getEnv("SMTP_FROM", "noreply@modelhub.local"),
			CodeTTL:  getEnvInt("SMTP_CODE_TTL", 300),
		},
	}, nil
}

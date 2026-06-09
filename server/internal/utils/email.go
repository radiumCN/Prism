package utils

import (
	"encoding/base64"
	"fmt"
	"net/smtp"
	"strings"
)

type EmailConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	From     string
}

// SendVerificationEmail 发送验证码邮件。
// 若 SMTP 未配置（Host 为空），将验证码打印到标准输出（开发模式）。
func SendVerificationEmail(cfg EmailConfig, to, code string) error {
	if cfg.Host == "" {
		fmt.Printf("[DEV] verification code for %s: %s\n", to, code)
		return nil
	}

	auth := smtp.PlainAuth("", cfg.User, cfg.Password, cfg.Host)
	body := buildHTMLEmail(cfg.From, to, code)
	addr := fmt.Sprintf("%s:%d", cfg.Host, cfg.Port)

	return smtp.SendMail(addr, auth, cfg.From, []string{to}, []byte(body))
}

func buildHTMLEmail(from, to, code string) string {
	subject := base64.StdEncoding.EncodeToString([]byte("【ModelHub】邮箱验证码"))

	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("From: ModelHub <%s>\r\n", from))
	sb.WriteString(fmt.Sprintf("To: %s\r\n", to))
	sb.WriteString(fmt.Sprintf("Subject: =?UTF-8?B?%s?=\r\n", subject))
	sb.WriteString("MIME-Version: 1.0\r\n")
	sb.WriteString("Content-Type: text/html; charset=UTF-8\r\n")
	sb.WriteString("\r\n")
	sb.WriteString(fmt.Sprintf(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#09071a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:480px;margin:40px auto;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:20px;padding:40px;text-align:center">
    <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 8px">ModelHub 邮箱验证</h1>
    <p style="color:rgba(255,255,255,0.5);font-size:14px;margin:0 0 32px">您正在注册 ModelHub 账号，请使用以下验证码完成验证</p>
    <div style="background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.4);border-radius:14px;padding:24px;margin-bottom:28px">
      <span style="font-size:38px;font-weight:800;letter-spacing:12px;color:#a78bfa">%s</span>
    </div>
    <p style="color:rgba(255,255,255,0.35);font-size:13px;margin:0">验证码 <strong style="color:rgba(255,255,255,0.55)">5 分钟</strong>内有效，请勿泄露给他人</p>
  </div>
</body>
</html>`, code))
	return sb.String()
}

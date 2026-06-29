package handler

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	uploadDir     = "./uploads"
	maxUploadSize = 5 << 20 // 5 MB
)

var allowedExts = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".gif":  true,
	".webp": true,
}

// UploadImage accepts a multipart file field named "file", saves it under
// ./uploads/<date>/<uuid><ext>, and returns {"url": "/uploads/..."}.
func UploadImage(c *gin.Context) {
	if err := c.Request.ParseMultipartForm(maxUploadSize); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "文件过大（最大 5 MB）"})
		return
	}

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "未找到上传文件"})
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedExts[ext] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "仅支持 jpg / png / gif / webp"})
		return
	}

	// Organise by date to avoid huge flat directories.
	dateDir := time.Now().Format("20060102")
	savePath := filepath.Join(uploadDir, dateDir)
	if err := os.MkdirAll(savePath, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "无法创建目录"})
		return
	}

	buf := make([]byte, 16)
	_, _ = rand.Read(buf)
	filename := fmt.Sprintf("%s%s", hex.EncodeToString(buf), ext)
	fullPath := filepath.Join(savePath, filename)

	if err := c.SaveUploadedFile(header, fullPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "文件保存失败"})
		return
	}

	url := fmt.Sprintf("/uploads/%s/%s", dateDir, filename)
	c.JSON(http.StatusOK, gin.H{"url": url})
}

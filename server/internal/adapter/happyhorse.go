package adapter

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// HappyhorseAdapter implements VideoAdapter for Alibaba Bailian happyhorse video models.
// It uses an async task pattern:
//  1. POST /alibailian/api/v1/services/aigc/video-generation/video-synthesis  → task_id
//  2. GET  /alibailian/api/v1/tasks/{task_id}  → poll until SUCCEEDED/FAILED
type HappyhorseAdapter struct {
	APIKey  string
	BaseURL string // bare root, e.g. https://yunwu.ai
	client  *http.Client
}

func NewHappyhorseAdapter(apiKey, baseURL string) *HappyhorseAdapter {
	if baseURL == "" {
		baseURL = "https://dashscope.aliyuncs.com"
	}
	// Normalize: strip trailing /v1 or /v1beta so we can append /alibailian/api/v1/...
	baseURL = strings.TrimRight(baseURL, "/")
	baseURL = strings.TrimSuffix(baseURL, "/v1beta")
	baseURL = strings.TrimSuffix(baseURL, "/v1")
	return &HappyhorseAdapter{
		APIKey:  apiKey,
		BaseURL: baseURL,
		client:  &http.Client{Timeout: 60 * time.Second},
	}
}

func (a *HappyhorseAdapter) newRequest(ctx context.Context, method, path string, body []byte) (*http.Request, error) {
	url := a.BaseURL + path
	var bodyReader io.Reader
	if body != nil {
		bodyReader = bytes.NewReader(body)
	}
	req, err := http.NewRequestWithContext(ctx, method, url, bodyReader)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+a.APIKey)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	return req, nil
}

// --- Request / response structs ---

type hhSubmitRequest struct {
	Model  string      `json:"model"`
	Input  hhInput     `json:"input"`
	Params *hhParams   `json:"parameters,omitempty"`
}

type hhInput struct {
	Prompt string    `json:"prompt"`
	Media  []hhMedia `json:"media,omitempty"`
}

type hhMedia struct {
	Type string `json:"type"` // "video" | "reference_image"
	URL  string `json:"url"`
}

type hhParams struct {
	Resolution   string `json:"resolution,omitempty"`    // 1080P | 720P
	Ratio        string `json:"ratio,omitempty"`         // 16:9 | 9:16 | 1:1 | 4:3 | 3:4  (t2v, r2v)
	Duration     int    `json:"duration,omitempty"`      // 3-15 (t2v, i2v, r2v)
	Watermark    *bool  `json:"watermark,omitempty"`
	AudioSetting string `json:"audio_setting,omitempty"` // auto | origin (video-edit)
}

type hhTaskResponse struct {
	RequestID string `json:"request_id"`
	Output    struct {
		TaskID     string `json:"task_id"`
		TaskStatus string `json:"task_status"` // PENDING RUNNING SUCCEEDED FAILED
		VideoURL   string `json:"video_url,omitempty"`
		Message    string `json:"message,omitempty"`
	} `json:"output"`
	Code    string `json:"code,omitempty"`
	Message string `json:"message,omitempty"`
}

// HappyhorseVideoOptions extends VideoOptions with happyhorse-specific params.
type HappyhorseVideoOptions struct {
	VideoOptions
	Resolution   string // 1080P | 720P
	Watermark    *bool
	AudioSetting string // auto | origin
	// For video editing: optional reference media
	VideoURL        string
	ReferenceImages []string
}

// happyhorseModelKind returns the model variant from the model name.
// t2v  → text-to-video
// i2v  → image-to-video
// r2v  → reference-to-video
// edit → video-edit
func happyhorseModelKind(model string) string {
	m := strings.ToLower(model)
	switch {
	case strings.Contains(m, "video-edit"):
		return "edit"
	case strings.Contains(m, "i2v"):
		return "i2v"
	case strings.Contains(m, "r2v"):
		return "r2v"
	default:
		return "t2v"
	}
}

// VideoOptionsExt carries extended happyhorse options.
type VideoOptionsExt struct {
	Resolution      string   // 1080P | 720P (all models)
	Watermark       *bool    // all models; nil = omit (API default = true)
	Ratio           string   // t2v, r2v: 16:9 | 9:16 | 1:1 | 4:3 | 3:4
	Duration        int      // t2v, i2v, r2v: 3-15s; 0 = omit (API default = 5)
	AudioSetting    string   // video-edit only: auto | origin
	ImageURL        string   // i2v: first_frame image URL
	VideoURL        string   // video-edit: source video URL
	ReferenceImages []string // r2v (1-9) / video-edit (0-5)
}

func (a *HappyhorseAdapter) GenerateVideo(ctx context.Context, model, prompt string, opts VideoOptions) (string, error) {
	return a.GenerateVideoExt(ctx, model, prompt, VideoOptionsExt{Resolution: "1080P"})
}

func (a *HappyhorseAdapter) GenerateVideoExt(ctx context.Context, model, prompt string, ext VideoOptionsExt) (string, error) {
	kind := happyhorseModelKind(model)

	// Build media array per model spec
	var media []hhMedia
	switch kind {
	case "i2v":
		// API requires type="first_frame" (not "image")
		if ext.ImageURL != "" {
			media = append(media, hhMedia{Type: "first_frame", URL: ext.ImageURL})
		}
	case "r2v":
		// 1-9 reference images
		for _, u := range ext.ReferenceImages {
			if u != "" {
				media = append(media, hhMedia{Type: "reference_image", URL: u})
			}
		}
	case "edit":
		// 1 video (required) + 0-5 reference images
		if ext.VideoURL != "" {
			media = append(media, hhMedia{Type: "video", URL: ext.VideoURL})
		}
		for _, u := range ext.ReferenceImages {
			if u != "" {
				media = append(media, hhMedia{Type: "reference_image", URL: u})
			}
		}
	// t2v: no media
	}

	resolution := ext.Resolution
	if resolution == "" {
		resolution = "1080P"
	}
	params := &hhParams{
		Resolution: resolution,
		Watermark:  ext.Watermark,
	}
	// ratio: t2v and r2v only
	if (kind == "t2v" || kind == "r2v") && ext.Ratio != "" {
		params.Ratio = ext.Ratio
	}
	// duration: t2v, i2v, r2v (not video-edit)
	if kind != "edit" && ext.Duration > 0 {
		params.Duration = ext.Duration
	}
	// audio_setting: video-edit only
	if kind == "edit" && ext.AudioSetting != "" {
		params.AudioSetting = ext.AudioSetting
	}

	submitReq := hhSubmitRequest{
		Model:  model,
		Input:  hhInput{Prompt: prompt, Media: media},
		Params: params,
	}

	body, err := json.Marshal(submitReq)
	if err != nil {
		return "", err
	}

	// Submit task
	submitPath := "/alibailian/api/v1/services/aigc/video-generation/video-synthesis"
	req, err := a.newRequest(ctx, "POST", submitPath, body)
	if err != nil {
		return "", err
	}

	resp, err := a.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("happyhorse submit failed: %w", err)
	}
	defer resp.Body.Close()

	raw, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("happyhorse submit error %d: %s", resp.StatusCode, string(raw))
	}

	var submitResp hhTaskResponse
	if err := json.Unmarshal(raw, &submitResp); err != nil {
		return "", fmt.Errorf("happyhorse submit decode: %w", err)
	}
	if submitResp.Code != "" && submitResp.Code != "200" {
		return "", fmt.Errorf("happyhorse error %s: %s", submitResp.Code, submitResp.Message)
	}

	taskID := submitResp.Output.TaskID
	if taskID == "" {
		return "", fmt.Errorf("happyhorse: no task_id in response: %s", string(raw))
	}

	// Poll for completion (max 10 minutes, poll every 5 seconds)
	pollCtx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	for {
		select {
		case <-pollCtx.Done():
			return "", fmt.Errorf("happyhorse: timeout waiting for task %s", taskID)
		case <-time.After(5 * time.Second):
		}

		pollReq, err := a.newRequest(pollCtx, "GET", "/alibailian/api/v1/tasks/"+taskID, nil)
		if err != nil {
			return "", err
		}

		pollResp, err := a.client.Do(pollReq)
		if err != nil {
			continue // transient error, retry
		}

		pollRaw, _ := io.ReadAll(pollResp.Body)
		pollResp.Body.Close()

		var taskResp hhTaskResponse
		if err := json.Unmarshal(pollRaw, &taskResp); err != nil {
			continue
		}

		switch taskResp.Output.TaskStatus {
		case "SUCCEEDED":
			videoURL := taskResp.Output.VideoURL
			if videoURL == "" {
				return "", fmt.Errorf("happyhorse: SUCCEEDED but no video_url")
			}
			return videoURL, nil
		case "FAILED":
			msg := taskResp.Output.Message
			if msg == "" {
				msg = taskResp.Message
			}
			return "", fmt.Errorf("happyhorse: task failed: %s", msg)
		// PENDING, RUNNING, UNKNOWN → keep polling
		}
	}
}

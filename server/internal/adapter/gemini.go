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

type GeminiAdapter struct {
	APIKey  string
	BaseURL string
	client  *http.Client
}

func NewGeminiAdapter(apiKey, baseURL string) *GeminiAdapter {
	if baseURL == "" {
		baseURL = "https://generativelanguage.googleapis.com"
	}
	// Normalize: strip any trailing version suffix so we append /v1beta uniformly.
	// This handles configs like https://yunwu.ai/v1 or
	// https://generativelanguage.googleapis.com/v1beta.
	baseURL = strings.TrimRight(baseURL, "/")
	baseURL = strings.TrimSuffix(baseURL, "/v1beta")
	baseURL = strings.TrimSuffix(baseURL, "/v1")
	return &GeminiAdapter{
		APIKey:  apiKey,
		BaseURL: baseURL, // always bare root, e.g. https://yunwu.ai
		client:  &http.Client{Timeout: 120 * time.Second},
	}
}

// isNativeGoogle returns true when talking directly to Google's API.
// Native Google uses ?key= auth; third-party gateways use Authorization: Bearer.
func (a *GeminiAdapter) isNativeGoogle() bool {
	return strings.Contains(a.BaseURL, "googleapis.com")
}

// geminiURL builds the full endpoint URL.
// path should be like "models/{model}:generateContent".
func (a *GeminiAdapter) geminiURL(path string) string {
	if a.isNativeGoogle() {
		return fmt.Sprintf("%s/v1beta/%s?key=%s", a.BaseURL, path, a.APIKey)
	}
	return fmt.Sprintf("%s/v1beta/%s", a.BaseURL, path)
}

// geminiRequest creates an authenticated HTTP request.
func (a *GeminiAdapter) newHTTPRequest(ctx context.Context, method, url string, body []byte) (*http.Request, error) {
	req, err := http.NewRequestWithContext(ctx, method, url, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	if !a.isNativeGoogle() {
		req.Header.Set("Authorization", "Bearer "+a.APIKey)
	}
	return req, nil
}

type geminiInlineData struct {
	MimeType string `json:"mimeType"`
	Data     string `json:"data"` // base64
}

type geminiPart struct {
	Text       string             `json:"text,omitempty"`
	InlineData *geminiInlineData `json:"inlineData,omitempty"`
}

type geminiContent struct {
	Role  string       `json:"role"`
	Parts []geminiPart `json:"parts"`
}

type geminiImageConfig struct {
	AspectRatio string `json:"aspectRatio,omitempty"` // 1:1 16:9 etc.
	ImageSize   string `json:"imageSize,omitempty"`   // 1K 2K 4K
}

type geminiGenConfig struct {
	MaxOutputTokens    int                `json:"maxOutputTokens,omitempty"`
	Temperature        float64            `json:"temperature,omitempty"`
	ResponseModalities []string           `json:"responseModalities,omitempty"`
	ImageConfig        *geminiImageConfig `json:"imageConfig,omitempty"`
}

type geminiRequest struct {
	Contents         []geminiContent  `json:"contents"`
	GenerationConfig *geminiGenConfig `json:"generationConfig,omitempty"`
}

type geminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []geminiPart `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
	UsageMetadata struct {
		TotalTokenCount int `json:"totalTokenCount"`
	} `json:"usageMetadata"`
	Error *struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
	} `json:"error"`
}

func (a *GeminiAdapter) buildContents(messages []Message) []geminiContent {
	out := make([]geminiContent, 0, len(messages))
	for _, m := range messages {
		role := m.Role
		if role == "assistant" {
			role = "model"
		}
		if role == "system" {
			continue
		}
		out = append(out, geminiContent{
			Role:  role,
			Parts: []geminiPart{{Text: m.Content}},
		})
	}
	return out
}

func (a *GeminiAdapter) ChatCompletion(ctx context.Context, model string, messages []Message, options ChatOptions) (ChatResponse, error) {
	reqBody := geminiRequest{
		Contents: a.buildContents(messages),
	}
	if options.MaxTokens > 0 {
		reqBody.GenerationConfig = &geminiGenConfig{MaxOutputTokens: options.MaxTokens}
	}

	body, err := json.Marshal(reqBody)
	if err != nil {
		return ChatResponse{}, err
	}

	endpoint := a.geminiURL(fmt.Sprintf("models/%s:generateContent", model))
	req, err := a.newHTTPRequest(ctx, "POST", endpoint, body)
	if err != nil {
		return ChatResponse{}, err
	}

	resp, err := a.client.Do(req)
	if err != nil {
		return ChatResponse{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return ChatResponse{}, fmt.Errorf("gemini error %d: %s", resp.StatusCode, string(b))
	}

	var result geminiResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return ChatResponse{}, err
	}

	content := ""
	if len(result.Candidates) > 0 && len(result.Candidates[0].Content.Parts) > 0 {
		content = result.Candidates[0].Content.Parts[0].Text
	}
	return ChatResponse{Content: content, TokenCount: result.UsageMetadata.TotalTokenCount}, nil
}

func (a *GeminiAdapter) ChatCompletionStream(ctx context.Context, model string, messages []Message, options ChatOptions) (<-chan ChatStreamChunk, error) {
	// Gemini streaming uses SSE with the streamGenerateContent endpoint
	reqBody := geminiRequest{
		Contents: a.buildContents(messages),
	}

	body, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	// For native Google, alt=sse is required for SSE streaming.
	// Third-party gateways (yunwu.ai etc.) handle SSE without it.
	streamPath := fmt.Sprintf("models/%s:streamGenerateContent", model)
	streamURL := a.geminiURL(streamPath)
	if a.isNativeGoogle() {
		// geminiURL already appended ?key=..., so use & to add alt=sse
		streamURL += "&alt=sse"
	}
	req, err := a.newHTTPRequest(ctx, "POST", streamURL, body)
	if err != nil {
		return nil, err
	}

	resp, err := a.client.Do(req)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		return nil, fmt.Errorf("gemini error %d: %s", resp.StatusCode, string(b))
	}

	ch := make(chan ChatStreamChunk, 10)
	go func() {
		defer resp.Body.Close()
		defer close(ch)

		decoder := json.NewDecoder(resp.Body)
		for {
			var result geminiResponse
			if err := decoder.Decode(&result); err != nil {
				if err == io.EOF {
					ch <- ChatStreamChunk{Done: true}
				}
				return
			}

			if len(result.Candidates) > 0 && len(result.Candidates[0].Content.Parts) > 0 {
				content := result.Candidates[0].Content.Parts[0].Text
				if content != "" {
					select {
					case ch <- ChatStreamChunk{Content: content}:
					case <-ctx.Done():
						return
					}
				}
			}
		}
	}()

	return ch, nil
}

// isGeminiImageModel returns true for models that use the :generateContent endpoint
// for image generation (as opposed to Imagen models that use :predict).
func isGeminiImageModel(model string) bool {
	lower := strings.ToLower(model)
	return (strings.Contains(lower, "gemini") &&
		(strings.Contains(lower, "image") || strings.Contains(lower, "imagen") ||
			strings.Contains(lower, "exp-image"))) ||
		strings.Contains(lower, "gemini-2.0-flash-exp-image")
}

// aspectRatioFromOptions derives a Gemini aspect-ratio string from either an
// explicit AspectRatio value or, as a fallback, from Width/Height pixels.
func aspectRatioFromOptions(opts ImageOptions) string {
	if opts.AspectRatio != "" {
		return opts.AspectRatio
	}
	// Derive from pixel dimensions when caller used the DALL-E-style fields
	if opts.Width > 0 && opts.Height > 0 {
		ratios := [][3]int{
			{1, 1, 0}, {16, 9, 0}, {9, 16, 0}, {3, 2, 0}, {2, 3, 0},
			{4, 3, 0}, {3, 4, 0}, {4, 5, 0}, {5, 4, 0},
		}
		bestKey := "1:1"
		bestErr := 1.0e9
		for _, r := range ratios {
			target := float64(r[0]) / float64(r[1])
			actual := float64(opts.Width) / float64(opts.Height)
			diff := target - actual
			if diff < 0 {
				diff = -diff
			}
			if diff < bestErr {
				bestErr = diff
				bestKey = fmt.Sprintf("%d:%d", r[0], r[1])
			}
		}
		return bestKey
	}
	return "1:1"
}

// imageSizeFromOptions returns the Gemini imageSize string.
// Valid values: 0.5K (Gemini 3.1 only / 512), 1K (default), 2K, 4K
func imageSizeFromOptions(opts ImageOptions) string {
	if opts.ImageSize != "" {
		return opts.ImageSize
	}
	// Map DALL-E quality: hd → 2K, standard → 1K
	if opts.Quality == "hd" {
		return "2K"
	}
	return "1K"
}

// GenerateImage implements ImageAdapter for all Gemini image generation models.
//
// Routing logic:
//   - "gemini-*-image*" / "gemini-*-exp-image*"  → :generateContent + responseModalities:["IMAGE"]
//   - "imagen-*"                                  → :predict (Vertex AI Imagen style)
func (a *GeminiAdapter) GenerateImage(ctx context.Context, model string, prompt string, opts ImageOptions) ([]string, error) {
	lower := strings.ToLower(model)
	if strings.HasPrefix(lower, "imagen") || strings.Contains(lower, "imagen-4") {
		return a.generateImageViaPredict(ctx, model, prompt, opts)
	}
	return a.generateImageViaGenerateContent(ctx, model, prompt, opts)
}

// generateImageViaGenerateContent handles gemini-*-image* models.
func (a *GeminiAdapter) generateImageViaGenerateContent(ctx context.Context, model, prompt string, opts ImageOptions) ([]string, error) {
	n := opts.N
	if n <= 0 {
		n = 1
	}

	imgCfg := &geminiImageConfig{
		AspectRatio: aspectRatioFromOptions(opts),
		ImageSize:   imageSizeFromOptions(opts),
	}

	reqBody := geminiRequest{
		Contents: []geminiContent{
			{
				Role:  "user",
				Parts: []geminiPart{{Text: prompt}},
			},
		},
		GenerationConfig: &geminiGenConfig{
			ResponseModalities: []string{"IMAGE"},
			ImageConfig:        imgCfg,
		},
	}

	body, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	endpoint := a.geminiURL(fmt.Sprintf("models/%s:generateContent", model))
	httpReq, err := a.newHTTPRequest(ctx, "POST", endpoint, body)
	if err != nil {
		return nil, err
	}

	resp, err := a.client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("gemini image request failed: %w", err)
	}
	defer resp.Body.Close()

	raw, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("gemini image error %d: %s", resp.StatusCode, string(raw))
	}

	var result geminiResponse
	if err := json.Unmarshal(raw, &result); err != nil {
		return nil, fmt.Errorf("gemini image decode error: %w", err)
	}
	if result.Error != nil {
		return nil, fmt.Errorf("gemini image api error %d: %s", result.Error.Code, result.Error.Message)
	}

	var urls []string
	for _, cand := range result.Candidates {
		for _, part := range cand.Content.Parts {
			if part.InlineData != nil && part.InlineData.Data != "" {
				mime := part.InlineData.MimeType
				if mime == "" {
					mime = "image/png"
				}
				urls = append(urls, "data:"+mime+";base64,"+part.InlineData.Data)
			}
		}
	}
	if len(urls) == 0 {
		return nil, fmt.Errorf("gemini returned no image data (response: %s)", string(raw))
	}
	return urls, nil
}

// generateImageViaPredict handles Imagen models (imagen-4.0-*, etc.).
func (a *GeminiAdapter) generateImageViaPredict(ctx context.Context, model, prompt string, opts ImageOptions) ([]string, error) {
	n := opts.N
	if n <= 0 {
		n = 1
	}

	type predictRequest struct {
		Instances []struct {
			Prompt string `json:"prompt"`
		} `json:"instances"`
		Parameters struct {
			SampleCount     int    `json:"sampleCount"`
			AspectRatio     string `json:"aspectRatio,omitempty"`
			NegativePrompt  string `json:"negativePrompt,omitempty"`
		} `json:"parameters"`
	}

	reqBody := predictRequest{}
	reqBody.Instances = []struct {
		Prompt string `json:"prompt"`
	}{{Prompt: prompt}}
	reqBody.Parameters.SampleCount = n
	reqBody.Parameters.AspectRatio = aspectRatioFromOptions(opts)
	if opts.NegativePrompt != "" {
		reqBody.Parameters.NegativePrompt = opts.NegativePrompt
	}

	body, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	endpoint := a.geminiURL(fmt.Sprintf("models/%s:predict", model))
	httpReq, err := a.newHTTPRequest(ctx, "POST", endpoint, body)
	if err != nil {
		return nil, err
	}

	resp, err := a.client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("imagen predict request failed: %w", err)
	}
	defer resp.Body.Close()

	raw, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("imagen predict error %d: %s", resp.StatusCode, string(raw))
	}

	var result struct {
		Predictions []struct {
			BytesBase64Encoded string `json:"bytesBase64Encoded"`
			MimeType           string `json:"mimeType"`
		} `json:"predictions"`
		Error *struct {
			Code    int    `json:"code"`
			Message string `json:"message"`
		} `json:"error"`
	}
	if err := json.Unmarshal(raw, &result); err != nil {
		return nil, fmt.Errorf("imagen predict decode error: %w", err)
	}
	if result.Error != nil {
		return nil, fmt.Errorf("imagen api error %d: %s", result.Error.Code, result.Error.Message)
	}

	urls := make([]string, 0, len(result.Predictions))
	for _, p := range result.Predictions {
		mime := p.MimeType
		if mime == "" {
			mime = "image/png"
		}
		urls = append(urls, "data:"+mime+";base64,"+p.BytesBase64Encoded)
	}
	if len(urls) == 0 {
		return nil, fmt.Errorf("imagen returned no image data")
	}
	return urls, nil
}

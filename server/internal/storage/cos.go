package storage

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"github.com/tencentyun/cos-go-sdk-v5"
)

// COSProvider uploads to Tencent Cloud Object Storage.
type COSProvider struct {
	client  *cos.Client
	bucket  string
	region  string
	baseURL string // custom CDN domain, e.g. https://cdn.example.com
	prefix  string // optional key prefix, e.g. "generations/"
}

func NewCOSProvider(secretID, secretKey, bucket, region, baseURL, prefix string) *COSProvider {
	bucketURL, _ := url.Parse(fmt.Sprintf("https://%s.cos.%s.myqcloud.com", bucket, region))
	client := cos.NewClient(&cos.BaseURL{BucketURL: bucketURL}, &http.Client{
		Transport: &cos.AuthorizationTransport{
			SecretID:  secretID,
			SecretKey: secretKey,
		},
	})
	return &COSProvider{
		client:  client,
		bucket:  bucket,
		region:  region,
		baseURL: strings.TrimRight(baseURL, "/"),
		prefix:  prefix,
	}
}

func (p *COSProvider) Enabled() bool { return p.client != nil }

func (p *COSProvider) Upload(ctx context.Context, key string, data []byte, contentType string) (string, error) {
	fullKey := p.prefix + key
	opt := &cos.ObjectPutOptions{
		ObjectPutHeaderOptions: &cos.ObjectPutHeaderOptions{
			ContentType: contentType,
		},
	}
	_, err := p.client.Object.Put(ctx, fullKey, bytes.NewReader(data), opt)
	if err != nil {
		return "", fmt.Errorf("COS upload failed: %w", err)
	}

	if p.baseURL != "" {
		return p.baseURL + "/" + fullKey, nil
	}
	return fmt.Sprintf("https://%s.cos.%s.myqcloud.com/%s", p.bucket, p.region, fullKey), nil
}

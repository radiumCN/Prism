package storage

import (
	"bytes"
	"context"
	"fmt"
	"strings"

	"github.com/aliyun/aliyun-oss-go-sdk/oss"
)

// OSSProvider uploads to Alibaba Cloud OSS.
type OSSProvider struct {
	bucket  *oss.Bucket
	name    string
	endpoint string
	baseURL string
	prefix  string
}

func NewOSSProvider(accessKeyID, accessKeySecret, bucket, region, baseURL, prefix string) (*OSSProvider, error) {
	// endpoint format: oss-cn-hangzhou.aliyuncs.com
	endpoint := region
	if !strings.Contains(region, ".aliyuncs.com") {
		endpoint = region + ".aliyuncs.com"
	}

	client, err := oss.New(endpoint, accessKeyID, accessKeySecret)
	if err != nil {
		return nil, fmt.Errorf("OSS client init failed: %w", err)
	}
	b, err := client.Bucket(bucket)
	if err != nil {
		return nil, fmt.Errorf("OSS bucket init failed: %w", err)
	}
	return &OSSProvider{
		bucket:   b,
		name:     bucket,
		endpoint: endpoint,
		baseURL:  strings.TrimRight(baseURL, "/"),
		prefix:   prefix,
	}, nil
}

func (p *OSSProvider) Enabled() bool { return p.bucket != nil }

func (p *OSSProvider) Upload(ctx context.Context, key string, data []byte, contentType string) (string, error) {
	fullKey := p.prefix + key
	err := p.bucket.PutObject(fullKey, bytes.NewReader(data),
		oss.ContentType(contentType),
	)
	if err != nil {
		return "", fmt.Errorf("OSS upload failed: %w", err)
	}

	if p.baseURL != "" {
		return p.baseURL + "/" + fullKey, nil
	}
	return fmt.Sprintf("https://%s.%s/%s", p.name, p.endpoint, fullKey), nil
}

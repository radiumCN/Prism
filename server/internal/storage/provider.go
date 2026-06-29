package storage

import "context"

// Provider is the common interface for cloud object storage backends.
type Provider interface {
	// Upload stores data under the given key and returns the public URL.
	Upload(ctx context.Context, key string, data []byte, contentType string) (url string, err error)
	// Enabled reports whether the provider is properly configured.
	Enabled() bool
}

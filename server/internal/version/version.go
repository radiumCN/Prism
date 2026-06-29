// Package version holds build-time metadata injected via ldflags:
//
//	go build -ldflags="-X modelhub/server/internal/version.Version=1.2.0 \
//	                    -X modelhub/server/internal/version.GitCommit=abc1234 \
//	                    -X modelhub/server/internal/version.BuildTime=2026-06-29T16:00:00Z"
package version

// Defaults are used when the binary is built without ldflags (e.g. `go run`).
var (
	Version   = "dev"
	GitCommit = "unknown"
	BuildTime = "unknown"
)

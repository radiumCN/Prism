# ──────────────────────────────────────────────────────
#  ModelHub — Build & Release Makefile
# ──────────────────────────────────────────────────────

# Read version from VERSION file (trim whitespace)
VERSION   := $(shell cat VERSION | tr -d '[:space:]')
GIT_COMMIT := $(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BUILD_TIME := $(shell date -u +"%Y-%m-%dT%H:%M:%SZ")

# ldflags that inject version info into the Go binary
LDFLAGS := -X modelhub/server/internal/version.Version=$(VERSION) \
           -X modelhub/server/internal/version.GitCommit=$(GIT_COMMIT) \
           -X modelhub/server/internal/version.BuildTime=$(BUILD_TIME)

SERVER_OUT := dist/modelhub-server
WEB_OUT    := web/.next

.PHONY: all build build-server build-web run dev clean release tag help

## ── Default ────────────────────────────────────────────
all: build

## ── Build ──────────────────────────────────────────────

# Build everything (server + web)
build: build-server build-web

# Build Go server binary with version info embedded
build-server:
	@echo "▸ Building server  version=$(VERSION)  commit=$(GIT_COMMIT)"
	@mkdir -p dist
	cd server && go build -ldflags="$(LDFLAGS)" -o ../$(SERVER_OUT) ./main.go
	@echo "  → $(SERVER_OUT)"

# Build Next.js frontend (production)
build-web:
	@echo "▸ Building web  version=$(VERSION)"
	cd web && npm run build
	@echo "  → $(WEB_OUT)"

## ── Dev / Run ──────────────────────────────────────────

# Run server for development (no ldflags; version will show "dev")
run:
	cd server && go run ./main.go

# Run web dev server
dev-web:
	cd web && npm run dev

## ── Release ────────────────────────────────────────────

# Create and push a git tag matching VERSION
tag:
	@echo "▸ Tagging  v$(VERSION)"
	git tag -a "v$(VERSION)" -m "Release v$(VERSION)"
	git push origin "v$(VERSION)"
	@echo "  Tag v$(VERSION) pushed."

# Full release: build then tag
release: build tag
	@echo "✓ Released v$(VERSION)"

## ── Utilities ──────────────────────────────────────────

# Print current version
version:
	@echo $(VERSION)

# Remove build artifacts
clean:
	rm -rf dist web/.next

# Show help
help:
	@echo ""
	@echo "  ModelHub Build Commands"
	@echo "  ───────────────────────────────────"
	@echo "  make build          Build server + web"
	@echo "  make build-server   Build Go binary only"
	@echo "  make build-web      Build Next.js only"
	@echo "  make run            Run server (dev mode, no ldflags)"
	@echo "  make dev-web        Run Next.js dev server"
	@echo "  make version        Print current VERSION"
	@echo "  make tag            Tag current commit as v\$(VERSION)"
	@echo "  make release        Build + tag"
	@echo "  make clean          Remove build artifacts"
	@echo ""
	@echo "  To bump version: edit VERSION file, then run 'make release'"
	@echo ""

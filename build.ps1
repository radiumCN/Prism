#!/usr/bin/env pwsh
# ModelHub Build Script (Windows PowerShell)
# Usage:
#   .\build.ps1            # build server binary
#   .\build.ps1 -Release   # build + git tag

param(
    [switch]$Release,
    [switch]$WebOnly,
    [switch]$ServerOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ── Read version ────────────────────────────────────────
$Version   = (Get-Content "$PSScriptRoot\VERSION" -Raw).Trim()
$BuildTime = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
try {
    $GitCommit = (git rev-parse --short HEAD 2>$null)
} catch {
    $GitCommit = "unknown"
}

$LdFlags = "-X modelhub/server/internal/version.Version=$Version " +
           "-X modelhub/server/internal/version.GitCommit=$GitCommit " +
           "-X modelhub/server/internal/version.BuildTime=$BuildTime"

Write-Host ""
Write-Host "  ModelHub Build" -ForegroundColor Cyan
Write-Host "  Version   : $Version"
Write-Host "  Commit    : $GitCommit"
Write-Host "  BuildTime : $BuildTime"
Write-Host ""

# ── Build server ────────────────────────────────────────
function Build-Server {
    Write-Host "▸ Building server..." -ForegroundColor Yellow
    if (-not (Test-Path "$PSScriptRoot\dist")) {
        New-Item -ItemType Directory -Path "$PSScriptRoot\dist" | Out-Null
    }
    Push-Location "$PSScriptRoot\server"
    try {
        go build -ldflags $LdFlags -o "..\dist\modelhub-server.exe" .\main.go
        Write-Host "  → dist\modelhub-server.exe" -ForegroundColor Green
    } finally {
        Pop-Location
    }
}

# ── Build web ───────────────────────────────────────────
function Build-Web {
    Write-Host "▸ Building web..." -ForegroundColor Yellow
    Push-Location "$PSScriptRoot\web"
    try {
        npm run build
        Write-Host "  → web\.next" -ForegroundColor Green
    } finally {
        Pop-Location
    }
}

# ── Git tag ─────────────────────────────────────────────
function Tag-Release {
    Write-Host "▸ Tagging v$Version..." -ForegroundColor Yellow
    git tag -a "v$Version" -m "Release v$Version"
    git push origin "v$Version"
    Write-Host "  Tag v$Version pushed." -ForegroundColor Green
}

# ── Main ────────────────────────────────────────────────
if ($WebOnly) {
    Build-Web
} elseif ($ServerOnly) {
    Build-Server
} else {
    Build-Server
    Build-Web
}

if ($Release) {
    Tag-Release
    Write-Host ""
    Write-Host "✓ Released v$Version" -ForegroundColor Green
}

Write-Host ""

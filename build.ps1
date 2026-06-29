#!/usr/bin/env pwsh
# Prism Build Script (Windows PowerShell)
#
# Usage:
#   .\build.ps1                  # build server + web
#   .\build.ps1 1.2.0            # specify version
#   .\build.ps1 1.2.0 -Release   # build + create git tag
#   .\build.ps1 -ServerOnly      # build Go server only
#   .\build.ps1 -WebOnly         # build Next.js only

param(
    [string]$InputVersion = "",
    [switch]$Release,
    [switch]$WebOnly,
    [switch]$ServerOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ScriptDir  = $PSScriptRoot
$VersionFile = "$ScriptDir\VERSION"
$DistDir     = "$ScriptDir\dist"

# ── Determine version ──────────────────────────────────────────
if ($InputVersion -ne "") {
    $Version = $InputVersion.Trim()
    Set-Content -Path $VersionFile -Value $Version -Encoding UTF8
    Write-Host "  -> VERSION file updated to $Version"
} elseif (Test-Path $VersionFile) {
    $Version = (Get-Content $VersionFile -Raw -Encoding UTF8).Trim()
} else {
    Write-Error "No version specified and VERSION file not found."
    exit 1
}

# ── Build metadata ─────────────────────────────────────────────
$BuildTime = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
try {
    $GitCommit = (git rev-parse --short HEAD 2>$null).Trim()
} catch {
    $GitCommit = "unknown"
}

$LdFlags = "-s -w " +
           "-X modelhub/server/internal/version.Version=$Version " +
           "-X modelhub/server/internal/version.GitCommit=$GitCommit " +
           "-X modelhub/server/internal/version.BuildTime=$BuildTime"

Write-Host ""
Write-Host "  Prism Build" -ForegroundColor Cyan
Write-Host "  Version   : $Version"
Write-Host "  Commit    : $GitCommit"
Write-Host "  BuildTime : $BuildTime"
Write-Host ""

if (-not (Test-Path $DistDir)) {
    New-Item -ItemType Directory -Path $DistDir | Out-Null
}

# ── Build server ───────────────────────────────────────────────
function Build-Server {
    Write-Host ">> Building Go server..." -ForegroundColor Yellow
    Push-Location "$ScriptDir\server"
    try {
        go build -ldflags $LdFlags -o "$DistDir\prism-server.exe" .\main.go
        Write-Host "  -> $DistDir\prism-server.exe" -ForegroundColor Green
    } finally {
        Pop-Location
    }
}

# ── Build web ──────────────────────────────────────────────────
function Build-Web {
    Write-Host ">> Building Next.js frontend..." -ForegroundColor Yellow
    Push-Location "$ScriptDir\web"
    try {
        npm run build
        Write-Host "  -> web\.next" -ForegroundColor Green
    } finally {
        Pop-Location
    }
}

# ── Git tag ────────────────────────────────────────────────────
function Tag-Release {
    Write-Host ">> Tagging v$Version..." -ForegroundColor Yellow
    git tag -a "v$Version" -m "Release v$Version"
    git push origin "v$Version"
    Write-Host "  -> tag v$Version pushed." -ForegroundColor Green
}

# ── Main ───────────────────────────────────────────────────────
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
}

Write-Host ""
Write-Host "  Build complete: v$Version" -ForegroundColor Cyan
Write-Host ""
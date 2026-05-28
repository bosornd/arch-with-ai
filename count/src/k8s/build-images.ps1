# Docker 이미지 빌드 스크립트 (PowerShell)
# 루트 디렉토리에서 실행해야 합니다 (빌드 컨텍스트가 루트)

$ErrorActionPreference = "Stop"

$REGISTRY = if ($env:REGISTRY) { $env:REGISTRY } else { "agentk.count" }
$VERSION = if ($env:VERSION) { $env:VERSION } else { "latest" }

Write-Host "=== Docker 이미지 빌드 시작 ===" -ForegroundColor Green
Write-Host "Registry: $REGISTRY"
Write-Host "Version: $VERSION"
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Split-Path -Parent $scriptPath
Set-Location $rootPath

# Count 저장 서비스
Write-Host "Building count-write-service..." -ForegroundColor Yellow
docker build -f count-write-service/Dockerfile -t "$REGISTRY/count-write-service:$VERSION" -t "count-write-service:$VERSION" .
if ($LASTEXITCODE -ne 0) { 
    Write-Error "Failed to build count-write-service"
    exit 1
}

# Count 조회 서비스
Write-Host "Building count-read-service..." -ForegroundColor Yellow
docker build -f count-read-service/Dockerfile -t "$REGISTRY/count-read-service:$VERSION" -t "count-read-service:$VERSION" .
if ($LASTEXITCODE -ne 0) { 
    Write-Error "Failed to build count-read-service"
    exit 1
}

# Count 관리 서비스
Write-Host "Building count-management-service..." -ForegroundColor Yellow
docker build -f count-management-service/Dockerfile -t "$REGISTRY/count-management-service:$VERSION" -t "count-management-service:$VERSION" .
if ($LASTEXITCODE -ne 0) { 
    Write-Error "Failed to build count-management-service"
    exit 1
}

# Count 분석 서비스
Write-Host "Building count-analysis-service..." -ForegroundColor Yellow
docker build -f count-analysis-service/Dockerfile -t "$REGISTRY/count-analysis-service:$VERSION" -t "count-analysis-service:$VERSION" .
if ($LASTEXITCODE -ne 0) { 
    Write-Error "Failed to build count-analysis-service"
    exit 1
}

# 대시보드 제공 서비스
Write-Host "Building dashboard-provision-service..." -ForegroundColor Yellow
docker build -f dashboard-provision-service/Dockerfile -t "$REGISTRY/dashboard-provision-service:$VERSION" -t "dashboard-provision-service:$VERSION" .
if ($LASTEXITCODE -ne 0) { 
    Write-Error "Failed to build dashboard-provision-service"
    exit 1
}

# 대시보드 갱신 서비스
Write-Host "Building dashboard-update-service..." -ForegroundColor Yellow
docker build -f dashboard-update-service/Dockerfile -t "$REGISTRY/dashboard-update-service:$VERSION" -t "dashboard-update-service:$VERSION" .
if ($LASTEXITCODE -ne 0) { 
    Write-Error "Failed to build dashboard-update-service"
    exit 1
}

Write-Host ""
Write-Host "=== 이미지 빌드 완료 ===" -ForegroundColor Green

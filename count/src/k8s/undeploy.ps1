# Count 통합 관리 시스템 Kubernetes 배포 제거 스크립트 (PowerShell)

$ErrorActionPreference = "Stop"

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== Count 통합 관리 시스템 배포 제거 시작 ===" -ForegroundColor Yellow

# 애플리케이션 서비스 제거
Write-Host "1. 애플리케이션 서비스 제거..." -ForegroundColor Yellow
kubectl delete -f (Join-Path $scriptPath "deployments") --ignore-not-found=true
kubectl delete -f (Join-Path $scriptPath "services") --ignore-not-found=true

# Job 제거
Write-Host "1-1. 초기화 Job 제거..." -ForegroundColor Yellow
kubectl delete -f (Join-Path $scriptPath "jobs") --ignore-not-found=true

# Ingress 제거
Write-Host "2. Ingress 제거..." -ForegroundColor Yellow
kubectl delete -f (Join-Path $scriptPath "ingress") --ignore-not-found=true

# 인프라 컴포넌트 제거
Write-Host "3. 인프라 컴포넌트 제거..." -ForegroundColor Yellow
kubectl delete -f (Join-Path $scriptPath "deployments\kafka.yaml") --ignore-not-found=true
kubectl delete -f (Join-Path $scriptPath "services\kafka-service.yaml") --ignore-not-found=true
kubectl delete -f (Join-Path $scriptPath "deployments\zookeeper.yaml") --ignore-not-found=true
kubectl delete -f (Join-Path $scriptPath "services\zookeeper-service.yaml") --ignore-not-found=true
kubectl delete -f (Join-Path $scriptPath "statefulsets") --ignore-not-found=true
kubectl delete -f (Join-Path $scriptPath "services\postgresql-service.yaml") --ignore-not-found=true
kubectl delete -f (Join-Path $scriptPath "services\redis-service.yaml") --ignore-not-found=true
kubectl delete -f (Join-Path $scriptPath "services\redis-replica-service.yaml") --ignore-not-found=true
kubectl delete -f (Join-Path $scriptPath "services\redis-cache-service.yaml") --ignore-not-found=true

# PVC 제거 (주의: 데이터가 삭제됩니다)
if ($args -contains "--delete-pvc") {
    Write-Host "4. PersistentVolumeClaim 제거..." -ForegroundColor Yellow
    kubectl delete -f (Join-Path $scriptPath "persistentvolumeclaims") --ignore-not-found=true
}

# ConfigMap 및 Secret 제거
Write-Host "5. ConfigMap 및 Secret 제거..." -ForegroundColor Yellow
kubectl delete -f (Join-Path $scriptPath "configmap") --ignore-not-found=true
kubectl delete -f (Join-Path $scriptPath "secret") --ignore-not-found=true

# 네임스페이스 제거 (선택사항)
if ($args -contains "--delete-namespace") {
    Write-Host "6. 네임스페이스 제거..." -ForegroundColor Yellow
    kubectl delete namespace count-system --ignore-not-found=true
}

Write-Host ""
Write-Host "=== 배포 제거 완료 ===" -ForegroundColor Green

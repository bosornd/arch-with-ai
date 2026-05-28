# Count 통합 관리 시스템 Kubernetes 배포 스크립트 (PowerShell)

$ErrorActionPreference = "Stop"

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== Count 통합 관리 시스템 배포 시작 ===" -ForegroundColor Green

# 네임스페이스 생성
Write-Host "1. 네임스페이스 생성..." -ForegroundColor Yellow
kubectl apply -f (Join-Path $scriptPath "namespace.yaml")
if ($LASTEXITCODE -ne 0) { throw "Failed to create namespace" }

# ConfigMap 및 Secret 생성
Write-Host "2. ConfigMap 및 Secret 생성..." -ForegroundColor Yellow
kubectl apply -f (Join-Path $scriptPath "configmap")
if ($LASTEXITCODE -ne 0) { throw "Failed to create ConfigMap" }
kubectl apply -f (Join-Path $scriptPath "secret")
if ($LASTEXITCODE -ne 0) { throw "Failed to create Secret" }

# PVC 생성
Write-Host "3. PersistentVolumeClaim 생성..." -ForegroundColor Yellow
kubectl apply -f (Join-Path $scriptPath "persistentvolumeclaims")
if ($LASTEXITCODE -ne 0) { throw "Failed to create PVC" }

# 인프라 컴포넌트 배포
Write-Host "4. 인프라 컴포넌트 배포..." -ForegroundColor Yellow

# PostgreSQL
Write-Host "4.1. PostgreSQL 배포..." -ForegroundColor Cyan
kubectl apply -f (Join-Path $scriptPath "statefulsets\postgresql.yaml")
if ($LASTEXITCODE -ne 0) { throw "Failed to deploy PostgreSQL StatefulSet" }
kubectl apply -f (Join-Path $scriptPath "services\postgresql-service.yaml")
if ($LASTEXITCODE -ne 0) { throw "Failed to deploy PostgreSQL Service" }

# Redis
Write-Host "4.2. Redis 배포..." -ForegroundColor Cyan
kubectl apply -f (Join-Path $scriptPath "statefulsets\redis-value.yaml")
if ($LASTEXITCODE -ne 0) { throw "Failed to deploy Redis Value StatefulSet" }
kubectl apply -f (Join-Path $scriptPath "services\redis-service.yaml")
if ($LASTEXITCODE -ne 0) { throw "Failed to deploy Redis Service" }
kubectl apply -f (Join-Path $scriptPath "statefulsets\redis-replica.yaml")
if ($LASTEXITCODE -ne 0) { throw "Failed to deploy Redis Replica StatefulSet" }
kubectl apply -f (Join-Path $scriptPath "services\redis-replica-service.yaml")
if ($LASTEXITCODE -ne 0) { throw "Failed to deploy Redis Replica Service" }
kubectl apply -f (Join-Path $scriptPath "statefulsets\redis-cache.yaml")
if ($LASTEXITCODE -ne 0) { throw "Failed to deploy Redis Cache StatefulSet" }
kubectl apply -f (Join-Path $scriptPath "services\redis-cache-service.yaml")
if ($LASTEXITCODE -ne 0) { throw "Failed to deploy Redis Cache Service" }

# Zookeeper
Write-Host "4.3. Zookeeper 배포..." -ForegroundColor Cyan
kubectl apply -f (Join-Path $scriptPath "deployments\zookeeper.yaml")
if ($LASTEXITCODE -ne 0) { throw "Failed to deploy Zookeeper" }
kubectl apply -f (Join-Path $scriptPath "services\zookeeper-service.yaml")
if ($LASTEXITCODE -ne 0) { throw "Failed to deploy Zookeeper Service" }

# Kafka
Write-Host "4.4. Kafka 배포..." -ForegroundColor Cyan
kubectl apply -f (Join-Path $scriptPath "deployments\kafka.yaml")
if ($LASTEXITCODE -ne 0) { throw "Failed to deploy Kafka" }
kubectl apply -f (Join-Path $scriptPath "services\kafka-service.yaml")
if ($LASTEXITCODE -ne 0) { throw "Failed to deploy Kafka Service" }

# 인프라 컴포넌트 준비 대기
Write-Host "5. 인프라 컴포넌트 준비 대기..." -ForegroundColor Yellow
Write-Host "  PostgreSQL 준비 대기..." -ForegroundColor Cyan
kubectl wait --for=condition=ready pod -l app=postgresql -n count-system --timeout=300s
if ($LASTEXITCODE -ne 0) { Write-Warning "PostgreSQL ready check timeout or failed" }

# PostgreSQL 데이터베이스 초기화 Job 실행
Write-Host "5.1. PostgreSQL 데이터베이스 초기화..." -ForegroundColor Cyan
kubectl delete job init-postgresql-databases -n count-system --ignore-not-found=true
kubectl apply -f (Join-Path $scriptPath "jobs\init-postgresql-databases.yaml")
if ($LASTEXITCODE -ne 0) { Write-Warning "Failed to create PostgreSQL init job" }
Write-Host "  데이터베이스 초기화 Job 시작됨 (백그라운드 실행)" -ForegroundColor Gray

Write-Host "  Redis Value 준비 대기..." -ForegroundColor Cyan
kubectl wait --for=condition=ready pod -l app=redis-value -n count-system --timeout=300s
if ($LASTEXITCODE -ne 0) { Write-Warning "Redis Value ready check timeout or failed" }

Write-Host "  Zookeeper 준비 대기..." -ForegroundColor Cyan
kubectl wait --for=condition=ready pod -l app=zookeeper -n count-system --timeout=300s
if ($LASTEXITCODE -ne 0) { Write-Warning "Zookeeper ready check timeout or failed" }

Write-Host "  Kafka 준비 대기..." -ForegroundColor Cyan
kubectl wait --for=condition=ready pod -l app=kafka -n count-system --timeout=300s
if ($LASTEXITCODE -ne 0) { Write-Warning "Kafka ready check timeout or failed" }

# 애플리케이션 서비스 배포
Write-Host "6. 애플리케이션 서비스 배포..." -ForegroundColor Yellow

# Services
Write-Host "6.1. Services 생성..." -ForegroundColor Cyan
kubectl apply -f (Join-Path $scriptPath "services\count-write-service.yaml")
kubectl apply -f (Join-Path $scriptPath "services\count-read-service.yaml")
kubectl apply -f (Join-Path $scriptPath "services\count-management-service.yaml")
kubectl apply -f (Join-Path $scriptPath "services\count-analysis-service.yaml")
kubectl apply -f (Join-Path $scriptPath "services\dashboard-provision-service.yaml")
kubectl apply -f (Join-Path $scriptPath "services\dashboard-update-service.yaml")

# Deployments
Write-Host "6.2. Deployments 생성..." -ForegroundColor Cyan
kubectl apply -f (Join-Path $scriptPath "deployments\count-write-service.yaml")
kubectl apply -f (Join-Path $scriptPath "deployments\count-read-service.yaml")
kubectl apply -f (Join-Path $scriptPath "deployments\count-management-service.yaml")
kubectl apply -f (Join-Path $scriptPath "deployments\count-analysis-service.yaml")
kubectl apply -f (Join-Path $scriptPath "deployments\dashboard-provision-service.yaml")
kubectl apply -f (Join-Path $scriptPath "deployments\dashboard-update-service.yaml")

# Ingress 배포 (선택사항)
if ($args -contains "--with-ingress") {
    Write-Host "7. Ingress 배포..." -ForegroundColor Yellow
    kubectl apply -f (Join-Path $scriptPath "ingress\ingress.yaml")
    if ($LASTEXITCODE -ne 0) { throw "Failed to deploy Ingress" }
}

Write-Host ""
Write-Host "=== 배포 완료 ===" -ForegroundColor Green
Write-Host ""
Write-Host "배포 상태 확인:" -ForegroundColor Cyan
Write-Host "  kubectl get pods -n count-system"
Write-Host "  kubectl get services -n count-system"
Write-Host ""
Write-Host "로그 확인:" -ForegroundColor Cyan
Write-Host "  kubectl logs -f <pod-name> -n count-system"

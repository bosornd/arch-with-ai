#!/bin/bash

# Count 통합 관리 시스템 Kubernetes 배포 스크립트

set -e

echo "=== Count 통합 관리 시스템 배포 시작 ==="

# 네임스페이스 생성
echo "1. 네임스페이스 생성..."
kubectl apply -f namespace.yaml

# ConfigMap 및 Secret 생성
echo "2. ConfigMap 및 Secret 생성..."
kubectl apply -f configmap/
kubectl apply -f secret/

# PVC 생성
echo "3. PersistentVolumeClaim 생성..."
kubectl apply -f persistentvolumeclaims/

# 인프라 컴포넌트 배포
echo "4. 인프라 컴포넌트 배포..."

# PostgreSQL
echo "4.1. PostgreSQL 배포..."
kubectl apply -f statefulsets/postgresql.yaml
kubectl apply -f services/postgresql-service.yaml

# Redis
echo "4.2. Redis 배포..."
kubectl apply -f statefulsets/redis-value.yaml
kubectl apply -f services/redis-service.yaml
kubectl apply -f statefulsets/redis-replica.yaml
kubectl apply -f services/redis-replica-service.yaml
kubectl apply -f statefulsets/redis-cache.yaml
kubectl apply -f services/redis-cache-service.yaml

# Zookeeper
echo "4.3. Zookeeper 배포..."
kubectl apply -f deployments/zookeeper.yaml
kubectl apply -f services/zookeeper-service.yaml

# Kafka
echo "4.4. Kafka 배포..."
kubectl apply -f deployments/kafka.yaml
kubectl apply -f services/kafka-service.yaml

# 인프라 컴포넌트 준비 대기
echo "5. 인프라 컴포넌트 준비 대기..."
kubectl wait --for=condition=ready pod -l app=postgresql -n count-system --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis-value -n count-system --timeout=300s
kubectl wait --for=condition=ready pod -l app=zookeeper -n count-system --timeout=300s
kubectl wait --for=condition=ready pod -l app=kafka -n count-system --timeout=300s

# PostgreSQL 데이터베이스 초기화 Job 실행
echo "5.1. PostgreSQL 데이터베이스 초기화..."
kubectl delete job init-postgresql-databases -n count-system --ignore-not-found=true
kubectl apply -f jobs/init-postgresql-databases.yaml
echo "  데이터베이스 초기화 Job 시작됨 (백그라운드 실행)"

# 애플리케이션 서비스 배포
echo "6. 애플리케이션 서비스 배포..."

# Services
echo "6.1. Services 생성..."
kubectl apply -f services/count-write-service.yaml
kubectl apply -f services/count-read-service.yaml
kubectl apply -f services/count-management-service.yaml
kubectl apply -f services/count-analysis-service.yaml
kubectl apply -f services/dashboard-provision-service.yaml
kubectl apply -f services/dashboard-update-service.yaml

# Deployments
echo "6.2. Deployments 생성..."
kubectl apply -f deployments/count-write-service.yaml
kubectl apply -f deployments/count-read-service.yaml
kubectl apply -f deployments/count-management-service.yaml
kubectl apply -f deployments/count-analysis-service.yaml
kubectl apply -f deployments/dashboard-provision-service.yaml
kubectl apply -f deployments/dashboard-update-service.yaml

# Ingress 배포 (선택사항)
if [ "$1" == "--with-ingress" ]; then
  echo "7. Ingress 배포..."
  kubectl apply -f ingress/ingress.yaml
fi

echo "=== 배포 완료 ==="
echo ""
echo "배포 상태 확인:"
echo "  kubectl get pods -n count-system"
echo "  kubectl get services -n count-system"
echo ""
echo "로그 확인:"
echo "  kubectl logs -f <pod-name> -n count-system"

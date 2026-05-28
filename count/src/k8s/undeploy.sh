#!/bin/bash

# Count 통합 관리 시스템 Kubernetes 배포 제거 스크립트

set -e

echo "=== Count 통합 관리 시스템 배포 제거 시작 ==="

# 애플리케이션 서비스 제거
echo "1. 애플리케이션 서비스 제거..."
kubectl delete -f deployments/ --ignore-not-found=true
kubectl delete -f services/ --ignore-not-found=true

# Job 제거
echo "1-1. 초기화 Job 제거..."
kubectl delete -f jobs/ --ignore-not-found=true

# Ingress 제거
echo "2. Ingress 제거..."
kubectl delete -f ingress/ --ignore-not-found=true

# 인프라 컴포넌트 제거
echo "3. 인프라 컴포넌트 제거..."
kubectl delete -f deployments/kafka.yaml --ignore-not-found=true
kubectl delete -f services/kafka-service.yaml --ignore-not-found=true
kubectl delete -f deployments/zookeeper.yaml --ignore-not-found=true
kubectl delete -f services/zookeeper-service.yaml --ignore-not-found=true
kubectl delete -f statefulsets/ --ignore-not-found=true
kubectl delete -f services/postgresql-service.yaml --ignore-not-found=true
kubectl delete -f services/redis-service.yaml --ignore-not-found=true
kubectl delete -f services/redis-replica-service.yaml --ignore-not-found=true
kubectl delete -f services/redis-cache-service.yaml --ignore-not-found=true

# PVC 제거 (주의: 데이터가 삭제됩니다)
if [ "$1" == "--delete-pvc" ]; then
  echo "4. PersistentVolumeClaim 제거..."
  kubectl delete -f persistentvolumeclaims/ --ignore-not-found=true
fi

# ConfigMap 및 Secret 제거
echo "5. ConfigMap 및 Secret 제거..."
kubectl delete -f configmap/ --ignore-not-found=true
kubectl delete -f secret/ --ignore-not-found=true

# 네임스페이스 제거 (선택사항)
if [ "$1" == "--delete-namespace" ]; then
  echo "6. 네임스페이스 제거..."
  kubectl delete namespace count-system --ignore-not-found=true
fi

echo "=== 배포 제거 완료 ==="

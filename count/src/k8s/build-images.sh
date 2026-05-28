#!/bin/bash

# Docker 이미지 빌드 스크립트
# 루트 디렉토리에서 실행해야 합니다 (빌드 컨텍스트가 루트)

set -e

REGISTRY=${REGISTRY:-"agentk.count""}
VERSION=${VERSION:-"latest"}

echo "=== Docker 이미지 빌드 시작 ==="
echo "Registry: $REGISTRY"
echo "Version: $VERSION"
echo ""

# 루트 디렉토리로 이동
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$ROOT_DIR"

# Count 저장 서비스
echo "Building count-write-service..."
docker build -f count-write-service/Dockerfile -t $REGISTRY/count-write-service:$VERSION .
if [ $? -ne 0 ]; then
    echo "Failed to build count-write-service"
    exit 1
fi

# Count 조회 서비스
echo "Building count-read-service..."
docker build -f count-read-service/Dockerfile -t $REGISTRY/count-read-service:$VERSION .
if [ $? -ne 0 ]; then
    echo "Failed to build count-read-service"
    exit 1
fi

# Count 관리 서비스
echo "Building count-management-service..."
docker build -f count-management-service/Dockerfile -t $REGISTRY/count-management-service:$VERSION .
if [ $? -ne 0 ]; then
    echo "Failed to build count-management-service"
    exit 1
fi

# Count 분석 서비스
echo "Building count-analysis-service..."
docker build -f count-analysis-service/Dockerfile -t $REGISTRY/count-analysis-service:$VERSION .
if [ $? -ne 0 ]; then
    echo "Failed to build count-analysis-service"
    exit 1
fi

# 대시보드 제공 서비스
echo "Building dashboard-provision-service..."
docker build -f dashboard-provision-service/Dockerfile -t $REGISTRY/dashboard-provision-service:$VERSION .
if [ $? -ne 0 ]; then
    echo "Failed to build dashboard-provision-service"
    exit 1
fi

# 대시보드 갱신 서비스
echo "Building dashboard-update-service..."
docker build -f dashboard-update-service/Dockerfile -t $REGISTRY/dashboard-update-service:$VERSION .
if [ $? -ne 0 ]; then
    echo "Failed to build dashboard-update-service"
    exit 1
fi

echo ""
echo "=== 이미지 빌드 완료 ==="
echo ""
echo "이미지 푸시 (선택사항):"
echo "  docker push $REGISTRY/count-write-service:$VERSION"
echo "  docker push $REGISTRY/count-read-service:$VERSION"
echo "  docker push $REGISTRY/count-management-service:$VERSION"
echo "  docker push $REGISTRY/count-analysis-service:$VERSION"
echo "  docker push $REGISTRY/dashboard-provision-service:$VERSION"
echo "  docker push $REGISTRY/dashboard-update-service:$VERSION"

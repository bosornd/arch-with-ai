#!/bin/bash
# Count API 테스트 스크립트
# Usage: ./test-count-api.sh

BASE_URL="http://localhost/api/v1/counts"
TEST_COUNT_ID="test-count-$(date +%Y%m%d-%H%M%S)"

echo "========================================"
echo "Count API 테스트 시작"
echo "Test Count ID: $TEST_COUNT_ID"
echo "========================================"
echo ""

# 1. Count 생성 (값 설정)
echo "[1] Count 생성 (PUT /api/v1/counts/:id)"
response=$(curl -s -X PUT "$BASE_URL/$TEST_COUNT_ID" \
  -H "Content-Type: application/json" \
  -d '{"value": 100, "description": "테스트 Count"}')

if [ $? -eq 0 ]; then
  echo "✓ 생성 성공:"
  echo "$response" | jq '.'
else
  echo "✗ 생성 실패"
  exit 1
fi
echo ""

# 2. Count 조회
echo "[2] Count 조회 (GET /api/v1/counts/:id)"
response=$(curl -s -X GET "$BASE_URL/$TEST_COUNT_ID")
echo "✓ 조회 성공:"
echo "$response" | jq '.'
echo ""

# 3. Count 증가
echo "[3] Count 증가 (POST /api/v1/counts/:id/increment)"
response=$(curl -s -X POST "$BASE_URL/$TEST_COUNT_ID/increment" \
  -H "Content-Type: application/json" \
  -d '{"amount": 5}')
echo "✓ 증가 성공 (100 + 5 = 105):"
echo "$response" | jq '.value'
echo ""

# 4. Count 감소
echo "[4] Count 감소 (POST /api/v1/counts/:id/decrement)"
response=$(curl -s -X POST "$BASE_URL/$TEST_COUNT_ID/decrement" \
  -H "Content-Type: application/json" \
  -d '{"amount": 3}')
echo "✓ 감소 성공 (105 - 3 = 102):"
echo "$response" | jq '.value'
echo ""

# 5. 최종 상태 확인
echo "[5] 최종 상태 확인 (GET /api/v1/counts/:id)"
response=$(curl -s -X GET "$BASE_URL/$TEST_COUNT_ID")
echo "✓ 최종 상태:"
echo "$response" | jq '.'

value=$(echo "$response" | jq '.value')
if [ "$value" -eq 102 ]; then
  echo "✓ 값이 올바릅니다!"
else
  echo "✗ 값이 올바르지 않습니다. 기대값: 102, 실제값: $value"
fi
echo ""

# 6. 값 직접 설정 테스트
echo "[6] Count 값 직접 설정 (PUT /api/v1/counts/:id)"
response=$(curl -s -X PUT "$BASE_URL/$TEST_COUNT_ID" \
  -H "Content-Type: application/json" \
  -d '{"value": 999, "description": "값 변경됨"}')
echo "✓ 값 설정 성공 (기대값: 999):"
echo "$response" | jq '.value'
echo ""

echo "========================================"
echo "테스트 완료!"
echo "테스트 Count ID: $TEST_COUNT_ID"
echo "========================================"

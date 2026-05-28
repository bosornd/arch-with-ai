# CA-602B3: ioredis Redis 클라이언트 선택

## 개요

**후보 구조 ID**: CA-602B3  
**후보 구조 제목**: ioredis Redis 클라이언트 선택  
**설계 관점**: 개발 프레임워크 선택 관점 (ORM 프레임워크)  
**부모 후보 구조**: CA-602B (NestJS 애플리케이션 프레임워크 선택)  
**종속 후보 구조**: 없음

## 후보 구조 명세

### Redis 클라이언트 선택 결정

NestJS 기반으로 ioredis를 Redis 접근을 위한 클라이언트로 선택한다.

**선택 버전**: ioredis 5.x

## 설계 근거

### 품질 요구사항 분석

`qualities.md`를 분석한 결과:

**성능 요구사항**:
- NFR-001: Count 저장 응답 시간 < 100ms
- NFR-002: Count 조회 응답 시간 < 100ms

**ioredis 선택 근거**:
- 높은 성능: ioredis의 비동기 처리 및 파이프라인 지원
- Redis 캐싱 및 데이터 저장 지원

### 후보 구조 분석

`candidate/candidates.md`를 분석한 결과:

**캐싱 요구사항**:
- CA-007: CountInfoDB 캐싱
- CA-008: CountValueDB Write-Through 캐싱
- CA-009: CountValueDB Write-Behind 캐싱

**ioredis 선택 근거**:
- NestJS의 @nestjs/cache-manager와 통합 가능
- Redis 캐싱 및 데이터 저장 지원

### 도메인 모델 분석

`domain/model.md`를 분석한 결과:

**데이터베이스 요구사항**:
- Redis: CountValueDB, 캐싱

**ioredis 선택 근거**:
- Redis 완벽 지원
- 비동기 처리 지원

## 프레임워크 조합

- NestJS + @nestjs/cache-manager + ioredis + Redis

## 장점

- **높은 성능**: 비동기 처리 및 파이프라인 지원으로 높은 성능
- **NestJS 통합**: @nestjs/cache-manager와 통합하여 캐싱 용이
- **비동기 지원**: Promise 기반 비동기 처리
- **클러스터 지원**: Redis Cluster 지원

## 단점 및 트레이드오프

- **Redis 의존성**: Redis에 특화되어 다른 캐시로 전환 어려움
- **ORM 부재**: ORM이 아닌 클라이언트 라이브러리로 직접 쿼리 작성 필요

## 호환성 검증

### NestJS 버전 호환성

- @nestjs/cache-manager는 NestJS 10.x와 호환
- ioredis 5.x 사용

### Redis 버전 호환성

- Redis 6.0 이상 권장
- Redis 5.0 이상 지원

## 결론

ioredis는 NestJS와의 통합 지원과 높은 성능으로 Redis 접근을 위한 최적의 선택입니다.

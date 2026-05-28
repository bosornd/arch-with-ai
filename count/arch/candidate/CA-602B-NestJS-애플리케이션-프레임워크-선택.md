# CA-602B: NestJS 애플리케이션 프레임워크 선택

## 개요

**후보 구조 ID**: CA-602B  
**후보 구조 제목**: NestJS 애플리케이션 프레임워크 선택  
**설계 관점**: 개발 프레임워크 선택 관점 (애플리케이션 프레임워크)  
**부모 후보 구조**: CA-602 (JavaScript/TypeScript 프로그래밍 언어 선택)  
**종속 후보 구조**: CA-602B1, CA-602B2, CA-602B3, CA-602B4, CA-602B5, CA-602B6

## 후보 구조 명세

### 애플리케이션 프레임워크 선택 결정

JavaScript/TypeScript 기반으로 NestJS를 애플리케이션 프레임워크로 선택한다.

**선택 버전**: NestJS 10.x 이상 (Node.js 18+ 필요)

## 설계 근거

### 품질 요구사항 분석

`qualities.md`를 분석한 결과:

**성능 요구사항**:
- NFR-001: Count 저장 응답 시간 < 100ms
- NFR-002: Count 조회 응답 시간 < 100ms
- NFR-003: 동시 요청 처리량 >= 1000 RPS

**NestJS 선택 근거**:
- 높은 성능: Node.js 비동기 I/O 기반으로 높은 성능 제공
- 높은 처리량: 비동기 처리로 높은 동시성 처리 능력
- 구조화된 개발: Spring Boot와 유사한 구조로 구조화된 개발

### 후보 구조 분석

`candidate/candidates.md`를 분석한 결과:

**MSA 아키텍처 요구사항**:
- CA-001~CA-005: 서비스별 독립적 배포 및 운영
- NestJS의 모듈 기반 아키텍처로 마이크로서비스 지원

**헥사고날/클린 아키텍처 요구사항**:
- CA-520, CA-521: 포트 앤 어댑터 패턴, 레이어 분리
- NestJS의 의존성 주입 및 모듈 시스템으로 아키텍처 패턴 지원

**리포지토리 패턴 요구사항**:
- CA-543: 리포지토리 패턴 적용
- NestJS의 Provider 패턴으로 리포지토리 패턴 쉽게 구현

**API 게이트웨이 패턴 요구사항**:
- CA-539: API 게이트웨이 패턴
- NestJS의 Guard, Interceptor로 API 게이트웨이 기능 구현 가능

**NestJS 선택 근거**:
- 모든 아키텍처 패턴을 NestJS로 지원 가능
- Spring Boot와 유사한 구조로 Java 개발자에게 친숙

### 도메인 모델 분석

`domain/model.md`를 분석한 결과:

**컴포넌트 요구사항**:
- REST API: NestJS Controller
- 웹 UI: NestJS Controller + 템플릿 엔진 또는 React
- 비동기 처리: NestJS의 비동기 처리 지원
- 메시징: NestJS Microservice Transport (Kafka)

**NestJS 선택 근거**:
- 모든 컴포넌트 요구사항을 NestJS로 지원 가능

## 프레임워크 조합 가이드

### 권장 패키지

**핵심 패키지**:
- `@nestjs/core`: NestJS 핵심 프레임워크
- `@nestjs/common`: 공통 유틸리티
- `@nestjs/platform-express`: Express.js 플랫폼 어댑터
- `@nestjs/typeorm`: TypeORM 통합 (PostgreSQL)
- `@nestjs/mongoose`: Mongoose 통합 (MongoDB)
- `@nestjs/microservices`: 마이크로서비스 지원 (Kafka)
- `@nestjs/config`: 설정 관리
- `@nestjs/cache-manager`: 캐싱 지원
- `ioredis`: Redis 클라이언트
- `@nestjs/testing`: 테스트 유틸리티
- `jest`: 테스트 프레임워크

**추가 의존성**:
- `pg`: PostgreSQL 드라이버
- `mongoose`: MongoDB ODM
- `kafkajs`: Kafka 클라이언트

### 의존성 그래프

```
NestJS 10.x
  ├─> Node.js 18+ (필수)
  ├─> TypeScript 5.x (권장)
  ├─> @nestjs/platform-express
  │    └─> express
  ├─> @nestjs/typeorm
  │    ├─> typeorm
  │    └─> pg (PostgreSQL 드라이버)
  ├─> @nestjs/mongoose
  │    └─> mongoose
  ├─> @nestjs/microservices
  │    └─> kafkajs
  ├─> @nestjs/cache-manager
  │    └─> cache-manager
  │    └─> ioredis
  └─> @nestjs/testing
       └─> jest
```

## 장점

- **구조화된 개발**: Spring Boot와 유사한 구조로 구조화된 개발
- **의존성 주입**: 의존성 주입 패턴으로 느슨한 결합
- **모듈 시스템**: 모듈 기반 아키텍처로 마이크로서비스 지원
- **TypeScript**: 타입 안정성 제공
- **비동기 처리**: Node.js 비동기 I/O로 높은 동시성
- **테스트 지원**: Jest 통합으로 테스트 용이
- **변경 용이성**: 모듈 및 Provider 패턴으로 변경 용이성 향상

## 단점 및 트레이드오프

- **복잡도**: Express.js에 비해 복잡도 증가
- **학습 곡선**: NestJS 특화 기능 학습 필요
- **생태계**: Spring Boot에 비해 상대적으로 작은 생태계
- **성능**: Java/Spring Boot에 비해 상대적으로 낮은 성능

## 종속 후보 구조

### ORM 프레임워크 선택

- **CA-602B1**: TypeORM ORM 프레임워크 선택 (PostgreSQL)
- **CA-602B2**: Mongoose ORM 프레임워크 선택 (MongoDB, 선택적)
- **CA-602B3**: ioredis Redis 클라이언트 선택 (Redis)

### 테스트 프레임워크 선택

- **CA-602B4**: Jest 테스트 프레임워크 선택

### 비동기 프레임워크 선택

- **CA-602B5**: NestJS Microservice Transport 비동기 프레임워크 선택 (Kafka 메시징)
- **CA-602B6**: Node.js 비동기 I/O 선택 (SSE, 비동기 처리)

## 호환성 검증

### Node.js 버전 호환성

- **NestJS 10.x**: Node.js 18 이상 필수
- **NestJS 9.x**: Node.js 16 이상 (권장하지 않음)

### TypeScript 버전 호환성

- NestJS 10.x는 TypeScript 5.x 권장
- TypeScript 4.x도 지원하지만 일부 기능 제한

### 프레임워크 버전 호환성

- TypeORM 0.3.x 사용
- Mongoose 7.x 사용
- kafkajs 2.x 사용

### 외부 솔루션 통합 호환성

- PostgreSQL: pg 8.x
- MongoDB: mongoose 7.x
- Redis: ioredis 5.x
- Kafka: kafkajs 2.x

## 결론

NestJS는 JavaScript/TypeScript 기반으로 Spring Boot와 유사한 구조를 제공하면서도 Node.js의 비동기 I/O를 활용하여 높은 성능을 제공하는 프레임워크입니다. TypeScript의 타입 안정성과 구조화된 개발 방식으로 MSA, 헥사고날/클린 아키텍처, 리포지토리 패턴 등을 지원할 수 있습니다.

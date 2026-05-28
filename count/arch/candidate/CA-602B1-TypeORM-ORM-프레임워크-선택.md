# CA-602B1: TypeORM ORM 프레임워크 선택

## 개요

**후보 구조 ID**: CA-602B1  
**후보 구조 제목**: TypeORM ORM 프레임워크 선택  
**설계 관점**: 개발 프레임워크 선택 관점 (ORM 프레임워크)  
**부모 후보 구조**: CA-602B (NestJS 애플리케이션 프레임워크 선택)  
**종속 후보 구조**: 없음

## 후보 구조 명세

### ORM 프레임워크 선택 결정

NestJS 기반으로 TypeORM을 PostgreSQL 접근을 위한 ORM 프레임워크로 선택한다.

**선택 버전**: TypeORM 0.3.x

## 설계 근거

### 품질 요구사항 분석

`qualities.md`를 분석한 결과:

**성능 요구사항**:
- NFR-001: Count 저장 응답 시간 < 100ms
- NFR-002: Count 조회 응답 시간 < 100ms

**TypeORM 선택 근거**:
- 높은 성능: TypeORM의 쿼리 최적화 및 캐싱 지원
- 리포지토리 패턴: TypeORM Repository 패턴으로 리포지토리 패턴 쉽게 구현

### 후보 구조 분석

`candidate/candidates.md`를 분석한 결과:

**리포지토리 패턴 요구사항**:
- CA-543: 리포지토리 패턴 적용
- TypeORM Repository로 리포지토리 패턴 구현

**ORM 매핑 분리 요구사항**:
- CA-546: ORM 매핑 분리 구조
- TypeORM Entity와 매핑 설정 분리 가능

**TypeORM 선택 근거**:
- NestJS와의 통합 지원 (@nestjs/typeorm)
- 리포지토리 패턴 및 ORM 매핑 분리 지원

### 도메인 모델 분석

`domain/model.md`를 분석한 결과:

**데이터베이스 요구사항**:
- PostgreSQL: CountInfoDB, DashboardConfigDB

**TypeORM 선택 근거**:
- PostgreSQL 완벽 지원
- TypeScript 타입 안정성 제공

## 프레임워크 조합

- NestJS + @nestjs/typeorm + TypeORM + PostgreSQL

## 장점

- **NestJS 통합**: @nestjs/typeorm으로 NestJS와 원활한 통합
- **TypeScript 지원**: TypeScript 타입 안정성 제공
- **리포지토리 패턴**: TypeORM Repository로 리포지토리 패턴 쉽게 구현
- **스키마 변경 용이**: TypeORM 마이그레이션으로 스키마 변경 용이
- **성능 최적화**: TypeORM의 쿼리 최적화 및 캐싱 지원

## 단점 및 트레이드오프

- **학습 곡선**: TypeORM 학습 필요
- **성능 오버헤드**: ORM 계층으로 인한 성능 오버헤드 가능
- **PostgreSQL 의존성**: PostgreSQL에 특화되어 다른 데이터베이스로 전환 어려움

## 호환성 검증

### NestJS 버전 호환성

- @nestjs/typeorm은 NestJS 10.x와 호환
- TypeORM 0.3.x 사용

### PostgreSQL 버전 호환성

- PostgreSQL 12 이상 권장
- pg 드라이버 8.x 사용

## 결론

TypeORM은 NestJS와의 통합 지원과 TypeScript 타입 안정성으로 PostgreSQL 접근을 위한 최적의 선택입니다.

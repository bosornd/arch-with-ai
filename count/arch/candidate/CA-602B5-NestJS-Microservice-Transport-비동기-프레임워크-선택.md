# CA-602B5: NestJS Microservice Transport 비동기 프레임워크 선택

## 개요

**후보 구조 ID**: CA-602B5  
**후보 구조 제목**: NestJS Microservice Transport 비동기 프레임워크 선택  
**설계 관점**: 개발 프레임워크 선택 관점 (비동기 프레임워크)  
**부모 후보 구조**: CA-602B (NestJS 애플리케이션 프레임워크 선택)  
**종속 후보 구조**: 없음

## 후보 구조 명세

### 비동기 프레임워크 선택 결정

NestJS 기반으로 NestJS Microservice Transport를 Kafka 메시징을 위한 비동기 프레임워크로 선택한다.

**선택 버전**: @nestjs/microservices (Kafka Transport)

## 설계 근거

### 품질 요구사항 분석

`qualities.md`를 분석한 결과:

**비동기 처리 요구사항**:
- Kafka 메시징 지원 필요
- 이벤트 기반 아키텍처 지원 필요

**NestJS Microservice Transport 선택 근거**:
- NestJS와의 통합 지원
- Kafka Transport 지원

### 후보 구조 분석

`candidate/candidates.md`를 분석한 결과:

**메시징 시스템 요구사항**:
- CA-710: Kafka for 메시징
- 이벤트 기반 아키텍처 지원

**NestJS Microservice Transport 선택 근거**:
- @nestjs/microservices로 Kafka 통합 지원
- 이벤트 기반 아키텍처 구현 용이

### 도메인 모델 분석

`domain/model.md`를 분석한 결과:

**외부 시스템 연동 요구사항**:
- Kafka: 이벤트 기반 메시징

**NestJS Microservice Transport 선택 근거**:
- Kafka 완벽 지원
- NestJS와의 통합 지원

## 프레임워크 조합

- NestJS + @nestjs/microservices + kafkajs + Kafka

## 장점

- **NestJS 통합**: NestJS와 완벽한 통합
- **Kafka 지원**: Kafka Transport 지원
- **이벤트 기반**: 이벤트 기반 아키텍처 구현 용이
- **마이크로서비스**: 마이크로서비스 간 통신 지원

## 단점 및 트레이드오프

- **Kafka 의존성**: Kafka에 특화되어 다른 메시징 시스템으로 전환 어려움
- **복잡도**: 마이크로서비스 아키텍처로 인한 복잡도 증가

## 호환성 검증

### NestJS 버전 호환성

- @nestjs/microservices는 NestJS 10.x와 호환
- kafkajs 2.x 사용

### Kafka 버전 호환성

- Kafka 2.8 이상 권장
- Kafka 2.0 이상 지원

## 결론

NestJS Microservice Transport는 NestJS와의 통합 지원과 Kafka 메시징으로 이벤트 기반 아키텍처를 구현하기 위한 최적의 선택입니다.

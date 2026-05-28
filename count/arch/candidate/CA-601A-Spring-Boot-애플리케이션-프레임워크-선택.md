# CA-601A: Spring Boot 애플리케이션 프레임워크 선택

## 개요

**후보 구조 ID**: CA-601A  
**후보 구조 제목**: Spring Boot 애플리케이션 프레임워크 선택  
**설계 관점**: 개발 프레임워크 선택 관점 (애플리케이션 프레임워크)  
**부모 후보 구조**: CA-601 (Java 프로그래밍 언어 선택)  
**종속 후보 구조**: CA-601A1, CA-601A2, CA-601A3, CA-601A4, CA-601A5, CA-601A6

## 후보 구조 명세

### 애플리케이션 프레임워크 선택 결정

Java 기반으로 Spring Boot를 애플리케이션 프레임워크로 선택한다.

**선택 버전**: Spring Boot 3.x (Java 17+ 필요)

## 설계 근거

### 품질 요구사항 분석

`qualities.md`를 분석한 결과:

**성능 요구사항**:
- NFR-001: Count 저장 응답 시간 < 100ms
- NFR-002: Count 조회 응답 시간 < 100ms
- NFR-003: 동시 요청 처리량 >= 1000 RPS

**Spring Boot 선택 근거**:
- 높은 성능: Spring Boot의 최적화된 성능
- 높은 처리량: 멀티스레딩 및 비동기 처리 지원
- 자동 설정: Auto Configuration으로 빠른 개발

### 후보 구조 분석

`candidate/candidates.md`를 분석한 결과:

**MSA 아키텍처 요구사항**:
- CA-001~CA-005: 서비스별 독립적 배포 및 운영
- Spring Cloud를 통한 마이크로서비스 지원

**헥사고날/클린 아키텍처 요구사항**:
- CA-520, CA-521: 포트 앤 어댑터 패턴, 레이어 분리
- Spring의 의존성 주입 및 인터페이스 기반 설계 지원

**리포지토리 패턴 요구사항**:
- CA-543: 리포지토리 패턴 적용
- Spring Data JPA로 리포지토리 패턴 쉽게 구현

**API 게이트웨이 패턴 요구사항**:
- CA-539: API 게이트웨이 패턴
- Spring Cloud Gateway 지원

**Spring Boot 선택 근거**:
- 모든 아키텍처 패턴을 Spring 생태계로 지원 가능

### 도메인 모델 분석

`domain/model.md`를 분석한 결과:

**컴포넌트 요구사항**:
- REST API: Spring MVC
- 웹 UI: Spring MVC + Thymeleaf/React
- 비동기 처리: Spring WebFlux
- 메시징: Spring Kafka

**Spring Boot 선택 근거**:
- 모든 컴포넌트 요구사항을 Spring Boot로 지원 가능

## 프레임워크 조합 가이드

### 권장 Starter 패키지

**핵심 Starter**:
- `spring-boot-starter-web`: REST API 개발
- `spring-boot-starter-webflux`: 비동기 처리, SSE (선택적)
- `spring-boot-starter-data-jpa`: PostgreSQL 접근
- `spring-boot-starter-data-redis`: Redis 접근
- `spring-boot-starter-data-mongodb`: MongoDB 접근 (선택적)
- `spring-boot-starter-kafka`: Kafka 메시징
- `spring-boot-starter-test`: 테스트 프레임워크

**추가 의존성**:
- `postgresql`: PostgreSQL JDBC 드라이버
- `spring-boot-starter-cache`: 캐싱 지원

### 의존성 그래프

```
Spring Boot 3.x
  ├─> Java 17+ (필수)
  ├─> spring-boot-starter-web
  │    ├─> spring-web
  │    ├─> spring-webmvc
  │    └─> embedded-tomcat
  ├─> spring-boot-starter-webflux (선택적)
  │    ├─> spring-webflux
  │    └─> project-reactor
  ├─> spring-boot-starter-data-jpa
  │    ├─> spring-data-jpa
  │    ├─> hibernate-core
  │    └─> postgresql (직접 의존성 필요)
  ├─> spring-boot-starter-data-redis
  │    ├─> spring-data-redis
  │    └─> lettuce-core
  ├─> spring-boot-starter-data-mongodb (선택적)
  │    ├─> spring-data-mongodb
  │    └─> mongodb-driver
  ├─> spring-boot-starter-kafka
  │    ├─> spring-kafka
  │    └─> kafka-clients
  └─> spring-boot-starter-test
       ├─> junit-jupiter
       ├─> mockito-core
       └─> spring-boot-test
```

## 장점

- **MSA 지원**: Spring Cloud를 통한 마이크로서비스 개발 지원
- **다중 데이터베이스 지원**: JPA, Spring Data Redis, Spring Data MongoDB 동시 사용 가능
- **자동 설정**: Auto Configuration으로 빠른 개발
- **생태계**: 풍부한 Spring 생태계 및 커뮤니티
- **테스트 지원**: Spring Boot Test로 통합 테스트 용이
- **변경 용이성**: 리포지토리 패턴, API 어댑터 패턴 등 변경 용이성 향상 구조 지원
- **성능**: 높은 성능 및 처리량 지원

## 단점 및 트레이드오프

- **복잡도**: 많은 기능으로 인한 학습 곡선
- **메모리 사용량**: Spring 프레임워크로 인한 메모리 사용량 증가
- **시작 시간**: Spring Boot 애플리케이션 시작 시간

## 종속 후보 구조

### ORM 프레임워크 선택

- **CA-601A1**: JPA/Hibernate ORM 프레임워크 선택 (PostgreSQL)
- **CA-601A2**: Spring Data MongoDB ORM 프레임워크 선택 (MongoDB, 선택적)
- **CA-601A3**: Spring Data Redis ORM 프레임워크 선택 (Redis)

### 테스트 프레임워크 선택

- **CA-601A4**: JUnit 5 테스트 프레임워크 선택

### 비동기 프레임워크 선택

- **CA-601A5**: Spring WebFlux 비동기 프레임워크 선택 (SSE, 비동기 처리)
- **CA-601A6**: Spring Kafka 비동기 프레임워크 선택 (Kafka 메시징)

## 호환성 검증

### Java 버전 호환성

- **Spring Boot 3.x**: Java 17 이상 필수
- **Spring Boot 2.x**: Java 8 이상 (권장하지 않음)

### 프레임워크 버전 호환성

- Spring Boot 3.x는 Jakarta EE 9+ 사용
- Hibernate 6.x 사용
- Spring Data 3.x 사용

### 외부 솔루션 통합 호환성

- PostgreSQL: PostgreSQL JDBC Driver 42.x
- Redis: Lettuce 6.x
- MongoDB: MongoDB Java Driver 4.x
- Kafka: Spring Kafka 3.x, Kafka Clients 3.x

## 결론

Spring Boot는 Java 기반으로 MSA, 다중 데이터베이스, 비동기 처리 등 모든 요구사항을 만족하면서도 풍부한 생태계와 자동 설정 기능을 제공하는 최적의 선택입니다.

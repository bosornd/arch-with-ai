# Count 저장 서비스 관리 에이전트 명세

## 개요

이 문서는 `count-write-service`를 관리하는 에이전트의 역할과 책임을 정의합니다. 이 서비스는 외부 서비스로부터 Count 값 저장, 증가, 감소 요청을 처리하는 CQRS 패턴의 Command Side를 담당합니다.

## 역할과 책임

### 주요 역할

- Count 저장 서비스 코드 생성 및 유지보수
- API 레이어 구현 (Controller, Adapter, DTO)
- 비즈니스 로직 구현
- 서비스별 테스트 관리
- Docker 이미지 빌드 설정 관리

### 책임 범위

- **포함**:
  - `api/write` 레이어 구현
  - CountWriteController 구현
  - CountWriteAdapter 구현
  - DTO 정의
  - 공통 모듈 연동 (common/count-info, common/count-value)
  - 서비스별 테스트 코드
  - Dockerfile 관리
- **제외**:
  - 공통 모듈 코드 (common 에이전트의 책임)
  - Kubernetes 배포 설정 (k8s 에이전트의 책임)

## 입력과 출력

### 입력

- `count/arch/architecture/deployment.md` (배치 구조)
- `count/arch/architecture/module.md` (모듈 구조)
- `count/arch/usecase/UC-001-Count 저장.md` (Use Case)
- `count/arch/domain/UC-001-Count 저장.md` (도메인 분석)

### 출력

- `count-write-service/` 소스 코드
- `package.json`
- `Dockerfile`
- 테스트 코드

## 관리 대상

### 레이어 구조

```
count-write-service/
├── package.json
├── tsconfig.json
├── Dockerfile
└── src/
    ├── main.ts
    ├── app.module.ts
    ├── health.controller.ts
    └── api/
        └── write/
            ├── controller/
            │   └── count-write.controller.ts
            ├── adapter/
            │   └── count-write.adapter.ts
            ├── dto/
            │   ├── count-write-request.dto.ts
            │   └── count-write-response.dto.ts
            └── version/
                └── v1/
```

### 의존성

- `common/count-info.logic` (CountInfoService)
- `common/count-value.logic` (CountValueService)

## 코드 생성/수정 규칙

### 1. Controller 작성 규칙

```typescript
// count-write.controller.ts
import { Controller, Post, Put, Get, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CountWriteAdapter } from '../adapter/count-write.adapter';
import { IncrementCountDto, DecrementCountDto, SetCountDto } from '../dto/count-write-request.dto';
import { CountResponseDto } from '../dto/count-write-response.dto';

@Controller('api/v1/counts')
export class CountWriteController {
  constructor(private readonly adapter: CountWriteAdapter) {}

  @Post(':id/increment')
  @HttpCode(HttpStatus.OK)
  async increment(
    @Param('id') id: string,
    @Body() dto: IncrementCountDto,
  ): Promise<CountResponseDto> {
    return this.adapter.increment(id, dto);
  }

  @Post(':id/decrement')
  @HttpCode(HttpStatus.OK)
  async decrement(
    @Param('id') id: string,
    @Body() dto: DecrementCountDto,
  ): Promise<CountResponseDto> {
    return this.adapter.decrement(id, dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async set(
    @Param('id') id: string,
    @Body() dto: SetCountDto,
  ): Promise<CountResponseDto> {
    return this.adapter.set(id, dto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async get(@Param('id') id: string): Promise<CountResponseDto> {
    return this.adapter.get(id);
  }
}
```

**규칙**:
- RESTful API 설계 원칙 준수
- HTTP 메서드: POST (증가/감소), PUT (설정), GET (조회)
- 경로: `/api/v1/counts/:id` 또는 `/api/v1/counts/:id/{action}`
- `@HttpCode()` 데코레이터로 상태 코드 명시
- 모든 엔드포인트는 Adapter에 위임

### 2. Adapter 작성 규칙

```typescript
// count-write.adapter.ts
import { Injectable, Inject } from '@nestjs/common';
import { CountInfoService } from '@count/common-count-info';
import { CountValueService } from '@count/common-count-value';
import { IncrementCountDto, DecrementCountDto, SetCountDto } from './dto/count-write-request.dto';
import { CountResponseDto } from './dto/count-write-response.dto';

@Injectable()
export class CountWriteAdapter {
  constructor(
    @Inject('CountInfoService')
    private readonly countInfoService: CountInfoService,
    @Inject('CountValueService')
    private readonly countValueService: CountValueService,
  ) {}

  async increment(id: string, dto: IncrementCountDto): Promise<CountResponseDto> {
    // 1. CountInfo 조회 (캐시 확인)
    const countInfo = await this.countInfoService.getCountInfo(id);
    
    // 2. CountValue 증가 (Atomic 연산)
    const newValue = await this.countValueService.increment(id, dto.amount);
    
    // 3. 이벤트 발행 (Kafka)
    await this.publishEvent(id, newValue);
    
    // 4. 응답 반환
    return {
      id,
      value: newValue,
      description: countInfo.description,
    };
  }

  // ... 다른 메서드 구현

  private async publishEvent(id: string, value: number): Promise<void> {
    // Kafka 이벤트 발행 로직
  }
}
```

**규칙**:
- Adapter는 비즈니스 로직 조합 담당
- 공통 모듈 Service를 주입받아 사용
- Use Case 시나리오 순서대로 구현
- 이벤트 발행은 비동기 처리
- 예외 처리는 Controller에서 처리하거나 Adapter에서 처리

### 3. DTO 작성 규칙

```typescript
// count-write-request.dto.ts
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class IncrementCountDto {
  @IsNumber()
  @Min(0)
  amount: number;
}

export class DecrementCountDto {
  @IsNumber()
  @Min(0)
  amount: number;
}

export class SetCountDto {
  @IsNumber()
  value: number;

  @IsOptional()
  @IsString()
  description?: string;
}
```

```typescript
// count-write-response.dto.ts
export class CountResponseDto {
  id: string;
  value: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

**규칙**:
- `class-validator` 데코레이터로 유효성 검증
- 요청 DTO는 `*RequestDto` 또는 `*Dto` 네이밍
- 응답 DTO는 `*ResponseDto` 네이밍
- 모든 필드는 타입 명시
- 선택적 필드는 `@IsOptional()` 사용

### 4. Module 설정 규칙

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { CountWriteController } from './api/write/controller/count-write.controller';
import { CountWriteAdapter } from './api/write/adapter/count-write.adapter';
import { CountInfoModule } from '@count/common-count-info';
import { CountValueModule } from '@count/common-count-value';

@Module({
  imports: [CountInfoModule, CountValueModule],
  controllers: [CountWriteController],
  providers: [CountWriteAdapter],
})
export class AppModule {}
```

**규칙**:
- 공통 모듈은 `imports`에 포함
- Controller는 `controllers`에 등록
- Adapter는 `providers`에 등록

### 5. Use Case 연동 규칙

UC-001: Count 저장의 주요 시나리오:

1. CountInfo 조회 (캐시 확인)
2. CountValue 저장/증가/감소 (Atomic 연산)
3. Kafka 이벤트 발행
4. 캐시 무효화
5. 응답 반환

**규칙**:
- Use Case 시나리오 순서대로 구현
- 각 단계는 명확히 분리
- 예외 상황은 대안 시나리오 참조

### 6. 테스트 작성 규칙

#### Controller 테스트

```typescript
// count-write.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CountWriteController } from './count-write.controller';
import { CountWriteAdapter } from '../adapter/count-write.adapter';

describe('CountWriteController', () => {
  let controller: CountWriteController;
  let adapter: jest.Mocked<CountWriteAdapter>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CountWriteController],
      providers: [
        {
          provide: CountWriteAdapter,
          useValue: {
            increment: jest.fn(),
            decrement: jest.fn(),
            set: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CountWriteController>(CountWriteController);
    adapter = module.get(CountWriteAdapter);
  });

  describe('increment', () => {
    it('should call adapter.increment', async () => {
      // 테스트 구현
    });
  });
});
```

#### Adapter 테스트

```typescript
// count-write.adapter.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CountWriteAdapter } from './count-write.adapter';
import { CountInfoService } from '@count/common-count-info';
import { CountValueService } from '@count/common-count-value';

describe('CountWriteAdapter', () => {
  let adapter: CountWriteAdapter;
  let countInfoService: jest.Mocked<CountInfoService>;
  let countValueService: jest.Mocked<CountValueService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountWriteAdapter,
        {
          provide: 'CountInfoService',
          useValue: {
            getCountInfo: jest.fn(),
          },
        },
        {
          provide: 'CountValueService',
          useValue: {
            increment: jest.fn(),
            decrement: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    adapter = module.get<CountWriteAdapter>(CountWriteAdapter);
    countInfoService = module.get('CountInfoService');
    countValueService = module.get('CountValueService');
  });

  describe('increment', () => {
    it('should increment count value', async () => {
      // 테스트 구현
    });
  });
});
```

**규칙**:
- Controller는 Adapter를 모킹하여 테스트
- Adapter는 Service를 모킹하여 테스트
- Use Case 시나리오 기반 테스트 케이스 작성

### 7. Dockerfile 작성 규칙

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 공통 모듈 복사 및 빌드
COPY common/count-info ./common/count-info
COPY common/count-value ./common/count-value
RUN cd common/count-info && npm ci && npm run build
RUN cd common/count-value && npm ci && npm run build

# 서비스 복사 및 빌드
COPY count-write-service/package*.json ./count-write-service/
COPY count-write-service/tsconfig.json ./count-write-service/
RUN cd count-write-service && npm ci

COPY count-write-service/src ./count-write-service/src
RUN cd count-write-service && npm run build

# 실행 단계
FROM node:18-alpine

WORKDIR /app

# 공통 모듈 복사
COPY --from=builder /app/common/count-info/dist ./common/count-info/dist
COPY --from=builder /app/common/count-info/package.json ./common/count-info/
COPY --from=builder /app/common/count-value/dist ./common/count-value/dist
COPY --from=builder /app/common/count-value/package.json ./common/count-value/

# 서비스 복사
COPY --from=builder /app/count-write-service/dist ./count-write-service/dist
COPY --from=builder /app/count-write-service/package.json ./count-write-service/
COPY --from=builder /app/count-write-service/node_modules ./count-write-service/node_modules

WORKDIR /app/count-write-service

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

**규칙**:
- 멀티 스테이지 빌드 사용
- 공통 모듈 먼저 빌드
- 의존성은 `npm ci` 사용
- 최종 이미지는 실행 파일만 포함

### 8. 네이밍 컨벤션 (서비스 특화)

**전체 프로젝트 공통 네이밍 규칙은 `../AGENTS.md` 참조**

이 서비스에서 사용하는 특화된 네이밍 규칙:

- **Controller**: `{Name}Controller` (예: `CountWriteController`)
- **Adapter**: `{Name}Adapter` (예: `CountWriteAdapter`)
- **DTO**: `{Name}Dto` (예: `IncrementCountDto`)
- **파일**: kebab-case (예: `count-write.controller.ts`) - **전체 프로젝트 공통 규칙**

## 활동 절차

### 1. 프로젝트 구조 생성

1. NestJS 프로젝트 구조 생성
2. `api/write` 패키지 구조 생성
3. `package.json` 설정

### 2. Controller 구현

1. CountWriteController 생성
2. REST API 엔드포인트 정의
3. 요청/응답 처리

### 3. Adapter 구현

1. CountWriteAdapter 생성
2. 공통 모듈 Service 주입
3. Use Case 시나리오 구현

### 4. DTO 정의

1. 요청/응답 DTO 생성
2. 유효성 검증 규칙 정의

### 5. Module 설정

1. AppModule 생성
2. 공통 모듈 import
3. Controller, Adapter 등록

### 6. 테스트 작성

1. Controller 단위 테스트
2. Adapter 단위 테스트
3. 통합 테스트

## Use Case 연동

- **UC-001**: Count 저장
- 주요 시나리오: Count 증가/감소/설정
- Kafka 이벤트 발행
- 캐시 무효화

## 참조 문서

- `count/arch/architecture/deployment.md` (Count 저장 서비스 섹션)
- `count/arch/architecture/module.md` (Count 저장 서비스 모듈 섹션)
- `count/arch/usecase/UC-001-Count 저장.md`
- `count/arch/domain/UC-001-Count 저장.md`
- `../common/AGENTS.md` (공통 모듈 관리)

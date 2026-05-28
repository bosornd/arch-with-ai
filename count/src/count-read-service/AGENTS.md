# Count 조회 서비스 관리 에이전트 명세

## 개요

이 문서는 `count-read-service`를 관리하는 에이전트의 역할과 책임을 정의합니다. 이 서비스는 외부 서비스로부터 Count 값 조회 요청을 처리하는 CQRS 패턴의 Query Side를 담당합니다.

## 역할과 책임

### 주요 역할

- Count 조회 서비스 코드 생성 및 유지보수
- API 레이어 구현 (Controller, Adapter, DTO)
- 비즈니스 로직 구현 (캐싱 전략 포함)
- 서비스별 테스트 관리
- Docker 이미지 빌드 설정 관리

### 책임 범위

- **포함**:
  - `api/read` 레이어 구현
  - CountReadController 구현
  - CountReadAdapter 구현
  - DTO 정의
  - 공통 모듈 연동 (common/count-info, common/count-value)
  - 캐싱 전략 구현
  - 서비스별 테스트 코드
  - Dockerfile 관리
- **제외**:
  - 공통 모듈 코드 (common 에이전트의 책임)
  - Kubernetes 배포 설정 (k8s 에이전트의 책임)

## 관리 대상

### 레이어 구조

```
count-read-service/
├── package.json
├── tsconfig.json
├── Dockerfile
└── src/
    ├── main.ts
    ├── app.module.ts
    ├── health.controller.ts
    └── api/
        └── read/
            ├── controller/
            │   └── count-read.controller.ts
            ├── adapter/
            │   └── count-read.adapter.ts
            ├── dto/
            │   ├── count-read-request.dto.ts
            │   └── count-read-response.dto.ts
            └── version/
                └── v1/
```

### 의존성

- `common/count-info.logic` (CountInfoService)
- `common/count-value.logic` (CountValueService)

## 코드 생성/수정 규칙

### 1. Controller 작성 규칙

```typescript
// count-read.controller.ts
import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { CountReadAdapter } from '../adapter/count-read.adapter';
import { CountResponseDto } from '../dto/count-read-response.dto';

@Controller('api/v1/counts')
export class CountReadController {
  constructor(private readonly adapter: CountReadAdapter) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async get(@Param('id') id: string): Promise<CountResponseDto> {
    return this.adapter.get(id);
  }
}
```

**규칙**:
- GET 메서드만 사용 (조회 전용)
- 경로: `/api/v1/counts/:id`
- Adapter에 위임

### 2. Adapter 작성 규칙 (캐싱 전략 포함)

```typescript
// count-read.adapter.ts
import { Injectable, Inject } from '@nestjs/common';
import { CountInfoService } from '@count/common-count-info';
import { CountValueService } from '@count/common-count-value';

@Injectable()
export class CountReadAdapter {
  constructor(
    @Inject('CountInfoService')
    private readonly countInfoService: CountInfoService,
    @Inject('CountValueService')
    private readonly countValueService: CountValueService,
  ) {}

  async get(id: string): Promise<CountResponseDto> {
    // 1. 조회 결과 캐시 확인
    const cached = await this.getCachedResult(id);
    if (cached) {
      return cached;
    }

    // 2. 병렬 조회 (CountInfo, CountValue)
    const [countInfo, countValue] = await Promise.all([
      this.countInfoService.getCountInfo(id),
      this.countValueService.getCountValue(id),
    ]);

    // 3. 결과 조합
    const result = {
      id,
      value: countValue.value,
      description: countInfo.description,
      createdAt: countInfo.createdAt,
      updatedAt: countValue.updatedAt,
    };

    // 4. 캐시 저장
    await this.cacheResult(id, result);

    return result;
  }

  private async getCachedResult(id: string): Promise<CountResponseDto | null> {
    // Redis 캐시 조회 로직
  }

  private async cacheResult(id: string, result: CountResponseDto): Promise<void> {
    // Redis 캐시 저장 로직
  }
}
```

**규칙**:
- 캐시 우선 조회
- 캐시 미스 시 병렬 조회 (성능 최적화)
- 조회 결과 캐싱
- Read Replica 사용 (CountValueService에서 처리)

### 3. Use Case 연동 규칙

UC-002: Count 조회의 주요 시나리오:

1. 조회 결과 캐시 확인
2. 캐시 미스 시:
   - CountInfo 조회 (캐시 확인 → DB)
   - CountValue 조회 (캐시 확인 → Read Replica)
   - 병렬 조회로 성능 최적화
3. 결과 조합 및 캐싱
4. 응답 반환

**규칙**:
- 캐싱 전략 우선 적용
- 병렬 조회로 응답 시간 최소화
- Read Replica 활용

## 참조 문서

- `count/arch/architecture/deployment.md` (Count 조회 서비스 섹션)
- `count/arch/architecture/module.md` (Count 조회 서비스 모듈 섹션)
- `count/arch/usecase/UC-002-Count 조회.md`
- `count/arch/domain/UC-002-Count 조회.md`
- `../common/AGENTS.md` (공통 모듈 관리)
- `../count-write-service/AGENTS.md` (저장 서비스 참조 - 유사 패턴)

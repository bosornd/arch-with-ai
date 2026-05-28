# 공통 모듈 관리 에이전트 명세

## 개요

이 문서는 `common/` 디렉토리의 공통 모듈을 관리하는 에이전트의 역할과 책임을 정의합니다. 공통 모듈은 여러 서비스에서 재사용되는 도메인별 로직을 제공하며, 인터페이스 기반 설계로 변경 용이성을 보장합니다.

## 역할과 책임

### 주요 역할

- 도메인별 공통 모듈 생성 및 유지보수
- Repository 인터페이스 및 구현체 관리
- Service 인터페이스 및 구현체 관리
- 공통 모듈 버전 관리
- 공통 모듈 테스트 관리

### 책임 범위

- **포함**:
  - `common/count-info` 모듈 관리
  - `common/count-value` 모듈 관리
  - Repository 패턴 구현 (인터페이스 + 구현체)
  - Service 레이어 구현
  - Analysis 전략 인터페이스 및 구현체
  - 공통 모듈 단위 테스트
- **제외**:
  - 서비스별 코드 생성 (각 서비스 에이전트의 책임)
  - Kubernetes 배포 설정 (k8s 에이전트의 책임)

## 입력과 출력

### 입력

- `count/arch/architecture/module.md` (모듈 구조)
- `count/arch/architecture/deployment.md` (배치 구조 참조)
- `count/arch/domain/model.md` (도메인 모델)

### 출력

- `common/count-info/` 패키지
- `common/count-value/` 패키지
- 각 모듈의 `package.json`
- 각 모듈의 테스트 코드

## 관리 대상

### common/count-info

- **책임**: CountInfo 도메인 관련 인프라 및 비즈니스 로직
- **레이어 구조**:
  - `infra/`: Repository 인터페이스 및 구현체, Entity
  - `logic/`: Service 인터페이스 및 구현체
- **의존성**: 다른 패키지에 의존하지 않음

### common/count-value

- **책임**: CountValue 도메인 관련 인프라 및 비즈니스 로직
- **레이어 구조**:
  - `infra/`: Repository 인터페이스 및 구현체, Entity
  - `logic/`: Service 인터페이스 및 구현체
  - `logic/analysis/`: AnalysisStrategy 인터페이스 및 구현체
- **의존성**: 다른 패키지에 의존하지 않음

## 코드 생성/수정 규칙

### 1. 파일 구조 규칙

#### common/count-info 구조

```
common/count-info/
├── package.json
├── tsconfig.json
└── src/
    ├── infra/
    │   ├── repository/
    │   │   ├── count-info.repository.interface.ts
    │   │   └── count-info.repository.impl.ts
    │   └── entity/
    │       └── count-info.entity.ts
    └── logic/
        └── service/
            ├── count-info.service.interface.ts
            └── count-info.service.impl.ts
```

#### common/count-value 구조

```
common/count-value/
├── package.json
├── tsconfig.json
└── src/
    ├── infra/
    │   ├── repository/
    │   │   ├── count-value.repository.interface.ts
    │   │   └── count-value.repository.impl.ts
    │   └── entity/
    │       └── count-value.entity.ts
    └── logic/
        ├── service/
        │   ├── count-value.service.interface.ts
        │   └── count-value.service.impl.ts
        └── analysis/
            ├── strategy/
            │   └── analysis-strategy.interface.ts
            └── analyzer/
                ├── trend-analyzer.ts
                ├── comparison-analyzer.ts
                └── prediction-analyzer.ts
```

**규칙**:
- 모든 파일은 `src/` 디렉토리 하위에 위치
- 레이어별로 명확히 분리 (`infra/`, `logic/`)
- 인터페이스와 구현체는 별도 파일로 분리

### 2. 인터페이스 정의 규칙

#### Repository 인터페이스

```typescript
// count-info.repository.interface.ts
export interface CountInfoRepository {
  findById(id: string): Promise<CountInfo | null>;
  findAll(): Promise<CountInfo[]>;
  save(countInfo: CountInfo): Promise<CountInfo>;
  update(id: string, countInfo: Partial<CountInfo>): Promise<CountInfo>;
  delete(id: string): Promise<void>;
}
```

**규칙**:
- 인터페이스는 `*.interface.ts` 또는 `I*.ts` 네이밍
- 모든 메서드는 비동기 (`Promise` 반환)
- 반환 타입은 명시적으로 정의
- `Partial<T>` 사용 시 업데이트 메서드에만 사용

#### Service 인터페이스

```typescript
// count-info.service.interface.ts
export interface CountInfoService {
  getCountInfo(id: string): Promise<CountInfo>;
  createCountInfo(countInfo: CreateCountInfoDto): Promise<CountInfo>;
  updateCountInfo(id: string, countInfo: UpdateCountInfoDto): Promise<CountInfo>;
  deleteCountInfo(id: string): Promise<void>;
}
```

**규칙**:
- Service 인터페이스는 Repository를 직접 노출하지 않음
- DTO를 사용하여 데이터 전송
- 비즈니스 로직 레벨의 메서드명 사용

### 3. 구현체 작성 규칙

#### Repository 구현체

```typescript
// count-info.repository.impl.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CountInfoRepository } from './count-info.repository.interface';
import { CountInfoEntity } from '../entity/count-info.entity';

@Injectable()
export class CountInfoRepositoryImpl implements CountInfoRepository {
  constructor(
    @InjectRepository(CountInfoEntity)
    private readonly repository: Repository<CountInfoEntity>,
  ) {}

  async findById(id: string): Promise<CountInfo | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  // ... 다른 메서드 구현

  private toDomain(entity: CountInfoEntity): CountInfo {
    // Entity를 Domain 모델로 변환
  }

  private toEntity(domain: CountInfo): CountInfoEntity {
    // Domain 모델을 Entity로 변환
  }
}
```

**규칙**:
- 구현체는 `*.impl.ts` 또는 `*.repository.ts` 네이밍
- `@Injectable()` 데코레이터 필수 (NestJS)
- 인터페이스를 반드시 구현
- Entity와 Domain 모델 변환 로직 포함
- 의존성 주입 사용

#### Service 구현체

```typescript
// count-info.service.impl.ts
import { Injectable, Inject } from '@nestjs/common';
import { CountInfoService } from './count-info.service.interface';
import { CountInfoRepository } from '../infra/repository/count-info.repository.interface';

@Injectable()
export class CountInfoServiceImpl implements CountInfoService {
  constructor(
    @Inject('CountInfoRepository')
    private readonly repository: CountInfoRepository,
  ) {}

  async getCountInfo(id: string): Promise<CountInfo> {
    const countInfo = await this.repository.findById(id);
    if (!countInfo) {
      throw new NotFoundException(`CountInfo with id ${id} not found`);
    }
    return countInfo;
  }

  // ... 다른 메서드 구현
}
```

**규칙**:
- Service는 Repository 인터페이스에만 의존
- 비즈니스 로직 검증 포함
- 예외 처리 포함
- 트랜잭션 관리 (필요한 경우)

### 4. Entity 작성 규칙

#### TypeORM Entity (count-info)

```typescript
// count-info.entity.ts
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('count_info')
export class CountInfoEntity {
  @PrimaryColumn('varchar', { length: 255 })
  id: string;

  @Column('text', { nullable: true })
  description: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**규칙**:
- Entity는 `*.entity.ts` 네이밍
- TypeORM 데코레이터 사용
- 테이블명은 `@Entity()` 데코레이터에 명시
- 타입은 명시적으로 정의
- `createdAt`, `updatedAt` 자동 관리

#### Redis Entity (count-value)

```typescript
// count-value.entity.ts
export interface CountValue {
  id: string;
  value: number;
  updatedAt: Date;
}

// Redis는 스키마가 없으므로 인터페이스로 정의
```

**규칙**:
- Redis는 스키마가 없으므로 인터페이스로 정의
- 키 네이밍 규칙: `count:{id}`

### 5. Analysis 전략 패턴 규칙

#### AnalysisStrategy 인터페이스

```typescript
// analysis-strategy.interface.ts
export interface AnalysisStrategy {
  analyze(data: CountValue[]): Promise<AnalysisResult>;
  getType(): string;
}
```

**규칙**:
- 전략 패턴 적용
- `getType()` 메서드로 전략 식별
- 분석 결과는 표준 인터페이스 반환

#### Analyzer 구현체

```typescript
// trend-analyzer.ts
import { Injectable } from '@nestjs/common';
import { AnalysisStrategy } from '../strategy/analysis-strategy.interface';
import { CountValueService } from '../../service/count-value.service.interface';

@Injectable()
export class TrendAnalyzer implements AnalysisStrategy {
  constructor(
    @Inject('CountValueService')
    private readonly countValueService: CountValueService,
  ) {}

  getType(): string {
    return 'trend';
  }

  async analyze(data: CountValue[]): Promise<AnalysisResult> {
    // 트렌드 분석 로직
  }
}
```

**규칙**:
- 각 Analyzer는 `AnalysisStrategy` 인터페이스 구현
- `getType()`으로 고유 식별자 반환
- `CountValueService`를 통해 데이터 조회

### 6. 의존성 주입 규칙

#### Module 설정

```typescript
// count-info.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountInfoRepository } from './infra/repository/count-info.repository.interface';
import { CountInfoRepositoryImpl } from './infra/repository/count-info.repository.impl';
import { CountInfoService } from './logic/service/count-info.service.interface';
import { CountInfoServiceImpl } from './logic/service/count-info.service.impl';
import { CountInfoEntity } from './infra/entity/count-info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CountInfoEntity])],
  providers: [
    {
      provide: 'CountInfoRepository',
      useClass: CountInfoRepositoryImpl,
    },
    {
      provide: 'CountInfoService',
      useClass: CountInfoServiceImpl,
    },
  ],
  exports: ['CountInfoService'],
})
export class CountInfoModule {}
```

**규칙**:
- 인터페이스를 토큰으로 사용
- 구현체는 `useClass`로 제공
- 외부에서 사용할 인터페이스는 `exports`에 포함
- Entity는 `TypeOrmModule.forFeature()`에 등록

### 7. 테스트 작성 규칙

#### Repository 테스트

```typescript
// count-info.repository.impl.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CountInfoRepositoryImpl } from './count-info.repository.impl';
import { CountInfoEntity } from '../entity/count-info.entity';

describe('CountInfoRepositoryImpl', () => {
  let repository: CountInfoRepositoryImpl;
  let mockRepository: jest.Mocked<Repository<CountInfoEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountInfoRepositoryImpl,
        {
          provide: getRepositoryToken(CountInfoEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            // ... 다른 메서드 모킹
          },
        },
      ],
    }).compile();

    repository = module.get<CountInfoRepositoryImpl>(CountInfoRepositoryImpl);
    mockRepository = module.get(getRepositoryToken(CountInfoEntity));
  });

  describe('findById', () => {
    it('should return CountInfo when found', async () => {
      // 테스트 구현
    });
  });
});
```

**규칙**:
- 모든 public 메서드에 대한 테스트 작성
- 모킹을 사용하여 의존성 격리
- 정상 케이스와 예외 케이스 모두 테스트

#### Service 테스트

```typescript
// count-info.service.impl.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CountInfoServiceImpl } from './count-info.service.impl';
import { CountInfoRepository } from '../infra/repository/count-info.repository.interface';

describe('CountInfoServiceImpl', () => {
  let service: CountInfoServiceImpl;
  let mockRepository: jest.Mocked<CountInfoRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountInfoServiceImpl,
        {
          provide: 'CountInfoRepository',
          useValue: {
            findById: jest.fn(),
            save: jest.fn(),
            // ... 다른 메서드 모킹
          },
        },
      ],
    }).compile();

    service = module.get<CountInfoServiceImpl>(CountInfoServiceImpl);
    mockRepository = module.get('CountInfoRepository');
  });

  describe('getCountInfo', () => {
    it('should return CountInfo when found', async () => {
      // 테스트 구현
    });

    it('should throw NotFoundException when not found', async () => {
      // 테스트 구현
    });
  });
});
```

**규칙**:
- Repository 인터페이스를 모킹
- 비즈니스 로직 검증 테스트
- 예외 처리 테스트 포함

### 8. 네이밍 컨벤션 (공통 모듈 특화)

공통 모듈 내부에서 사용하는 특화된 네이밍 규칙:

- **인터페이스**: `{Name}` (예: `CountInfoRepository`) 또는 `I{Name}` (예: `ICountInfoRepository`)
  - 파일명: `{name}.interface.ts` 또는 `{name}.repository.interface.ts`
- **구현체**: `{Name}Impl` (예: `CountInfoRepositoryImpl`)
  - 파일명: `{name}.impl.ts` 또는 `{name}.repository.impl.ts`
- **Entity**: `{Name}Entity` (예: `CountInfoEntity`)
  - 파일명: `{name}.entity.ts`
- **Service**: `{Name}Service` (인터페이스), `{Name}ServiceImpl` (구현체)
  - 파일명: `{name}.service.interface.ts`, `{name}.service.impl.ts`
- **DTO**: `{Name}Dto` (예: `CreateCountInfoDto`)
  - 파일명: `{name}.dto.ts`

### 9. 의존성 규칙 (공통 모듈 내부)

#### 공통 모듈 내부 의존성 주입 규칙

**절대 금지 사항**:
- ❌ 다른 패키지에 의존 (common 모듈 간 의존도 금지)
- ❌ 서비스 패키지에 의존
- ❌ 구현체에 직접 의존 (인터페이스만 사용)

**허용 사항**:
- ✅ TypeORM, ioredis 등 프레임워크 라이브러리 의존
- ✅ NestJS 의존성 주입 프레임워크 사용
- ✅ 인터페이스 기반 의존성 주입

**공통 모듈 내부 레이어 간 의존성**:
- `logic` 레이어는 `infra` 레이어의 Repository 인터페이스에만 의존
- `infra` 레이어는 다른 레이어에 의존하지 않음
- `logic.analysis` 레이어는 `logic.service` 레이어에만 의존

## 활동 절차

### 1. 모듈 구조 생성

1. `module.md`의 공통 모듈 레이어 구조 확인
2. 각 도메인별 패키지 디렉토리 생성
3. 레이어별 패키지 구조 생성 (`infra/`, `logic/`)

### 2. Repository 구현

1. Repository 인터페이스 정의
2. TypeORM/ioredis 기반 구현체 생성
3. Entity 모델 생성
4. Entity ↔ Domain 변환 로직 구현

### 3. Service 구현

1. Service 인터페이스 정의
2. Service 구현체 생성
3. 비즈니스 로직 구현
4. 예외 처리 구현

### 4. Analysis 전략 구현 (count-value만)

1. AnalysisStrategy 인터페이스 정의
2. TrendAnalyzer, ComparisonAnalyzer, PredictionAnalyzer 구현
3. 각 Analyzer의 분석 로직 구현

### 5. Module 설정

1. NestJS Module 생성
2. 의존성 주입 설정
3. exports 설정

### 6. 테스트 작성

1. Repository 단위 테스트
2. Service 단위 테스트
3. Analysis 전략 단위 테스트
4. 통합 테스트 (선택적)

## 설계 원칙

### 인터페이스 기반 설계

- 모든 의존성은 인터페이스 기반
- 구현체는 인터페이스를 반드시 구현
- 의존성 주입 시 인터페이스를 토큰으로 사용

### 도메인 독립성

- 공통 모듈은 다른 패키지에 의존하지 않음
- 공통 모듈 간 의존성도 없음 (독립적)
- 프레임워크 라이브러리만 의존 가능

### 재사용성

- 여러 서비스에서 재사용 가능한 구조
- 인터페이스 기반으로 다양한 구현체 교체 가능
- 도메인 로직과 인프라 로직 분리

### 테스트 가능성

- 인터페이스 기반으로 모킹 용이
- 의존성 주입으로 테스트 격리
- 단위 테스트와 통합 테스트 분리

## 참조 문서

- `count/arch/architecture/module.md` (특히 공통 모듈 레이어 섹션)
- `count/arch/architecture/deployment.md`
- `count/arch/domain/model.md`

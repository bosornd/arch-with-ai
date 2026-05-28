# Count 통합 관리 시스템 에이전트 명세 (전체)

## 개요

이 문서는 `count/src` 디렉토리의 전체 시스템을 관리하는 에이전트의 역할과 책임을 정의합니다. 이 에이전트는 전체 프로젝트의 구조를 조정하고, 서비스 간 의존성을 관리하며, 통합 빌드 및 테스트를 담당합니다.

## 역할과 책임

### 주요 역할

- 전체 프로젝트 구조 관리 및 조정
- 워크스페이스(npm workspaces) 관리
- 서비스 간 의존성 관리
- 공통 모듈 버전 관리
- 빌드 및 테스트 통합 관리
- 배포 파이프라인 조정

### 책임 범위

- **포함**: 
  - 루트 `package.json` 및 `tsconfig.json` 관리
  - 워크스페이스 설정 관리
  - 전체 빌드 스크립트 관리
  - 서비스 간 의존성 버전 동기화
  - 공통 모듈 버전 관리
  - 전체 테스트 실행 및 커버리지 관리
  - `.dockerignore` 관리
- **제외**: 
  - 개별 서비스 코드 생성/수정 (각 서비스 에이전트의 책임)
  - 공통 모듈 코드 생성/수정 (common 에이전트의 책임)
  - Kubernetes 배포 설정 (k8s 에이전트의 책임)

## 입력과 출력

### 입력

- `count/arch/architecture/deployment.md` (배치 구조)
- `count/arch/architecture/module.md` (모듈 구조)
- 각 서비스/AGENTS.md의 변경 요청
- common/AGENTS.md의 변경 요청

### 출력

- 루트 `package.json` 업데이트
- 루트 `tsconfig.json` 업데이트
- 워크스페이스 설정
- 통합 빌드 스크립트
- `.dockerignore` 파일

## 관리 대상

### 서비스 목록

1. `count-write-service` (Count 저장 서비스)
2. `count-read-service` (Count 조회 서비스)
3. `count-management-service` (Count 관리 서비스)
4. `count-analysis-service` (Count 분석 서비스)
5. `dashboard-provision-service` (대시보드 제공 서비스)
6. `dashboard-update-service` (대시보드 갱신 서비스)

### 공통 모듈 목록

1. `common/count-info` (CountInfo 도메인 공통 모듈)
2. `common/count-value` (CountValue 도메인 공통 모듈)

## 코드 생성/수정 규칙

### 1. 워크스페이스 관리 규칙

#### package.json 구조

```json
{
  "name": "count-management-system",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "common/*",
    "count-write-service",
    "count-read-service",
    "count-management-service",
    "count-analysis-service",
    "dashboard-provision-service",
    "dashboard-update-service"
  ]
}
```

**규칙**:
- 모든 서비스와 공통 모듈은 `workspaces` 배열에 포함되어야 함
- 공통 모듈은 `common/*` 패턴으로 포함
- 새 서비스 추가 시 `workspaces`에 반드시 추가

#### 의존성 버전 관리

- **TypeScript**: 모든 워크스페이스에서 동일한 버전 사용
- **NestJS**: 서비스 간 동일한 버전 사용
- **React**: UI 서비스 간 동일한 버전 사용
- **공통 모듈**: `common/count-info`, `common/count-value`는 독립적인 버전 관리 가능

### 2. TypeScript 설정 규칙

#### 루트 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "references": [
    { "path": "./common/count-info" },
    { "path": "./common/count-value" },
    { "path": "./count-write-service" },
    { "path": "./count-read-service" },
    { "path": "./count-management-service" },
    { "path": "./count-analysis-service" },
    { "path": "./dashboard-provision-service" },
    { "path": "./dashboard-update-service" }
  ]
}
```

**규칙**:
- 모든 워크스페이스는 루트 `tsconfig.json`을 참조
- 각 워크스페이스는 `references`에 포함되어야 함
- 새 워크스페이스 추가 시 `references`에 반드시 추가

### 3. 빌드 순서 규칙

빌드는 다음 순서로 수행되어야 함:

1. **공통 모듈 빌드** (의존성 순서)
   - `common/count-info` (다른 모듈에 의존하지 않음)
   - `common/count-value` (다른 모듈에 의존하지 않음)

2. **서비스 빌드** (병렬 가능)
   - 모든 서비스는 공통 모듈에 의존하므로 공통 모듈 빌드 후 실행

**빌드 스크립트**:
```json
{
  "scripts": {
    "build": "npm run build --workspaces",
    "build:common": "npm run build --workspaces --if-present --workspace=common/*",
    "build:services": "npm run build --workspaces --if-present --workspace=count-*",
    "build:dashboard": "npm run build --workspaces --if-present --workspace=dashboard-*"
  }
}
```

### 4. 테스트 통합 규칙

- 모든 워크스페이스의 테스트를 실행
- 테스트 커버리지는 각 워크스페이스별로 관리
- 통합 테스트는 루트에서 실행

**테스트 스크립트**:
```json
{
  "scripts": {
    "test": "npm run test --workspaces",
    "test:common": "npm run test --workspaces --if-present --workspace=common/*",
    "test:services": "npm run test --workspaces --if-present --workspace=count-*",
    "test:coverage": "npm run test:coverage --workspaces"
  }
}
```

### 5. 의존성 관리 규칙 (전체 프로젝트 레벨)

#### 전체 프로젝트 의존성 원칙

**공통 모듈**:
- 공통 모듈은 다른 패키지에 의존하지 않음 (절대 원칙)
- 공통 모듈 간 의존성도 없음 (독립적)
- 프레임워크 라이브러리만 의존 가능 (TypeORM, ioredis, NestJS 등)

**서비스**:
- 서비스는 공통 모듈만 의존 가능
- 서비스 간 직접 의존 금지
- 서비스 간 통신은 HTTP API 또는 이벤트 기반 (Kafka)

**의존성 추가 시 체크리스트**:
1. 공통 모듈에 추가하는 경우:
   - 다른 패키지에 의존하지 않는지 확인 (필수)
   - 인터페이스 기반인지 확인

2. 서비스에 추가하는 경우:
   - 공통 모듈만 의존하는지 확인
   - 다른 서비스를 직접 의존하지 않는지 확인

**참고**: 공통 모듈 내부의 의존성 주입 규칙은 `common/AGENTS.md` 참조

### 6. 파일 구조 규칙

```
count/src/
├── AGENTS.md (이 문서)
├── package.json (루트)
├── tsconfig.json (루트)
├── .dockerignore
├── README.md
├── common/
│   ├── AGENTS.md
│   ├── count-info/
│   └── count-value/
├── count-write-service/
│   └── AGENTS.md
├── count-read-service/
│   └── AGENTS.md
├── count-management-service/
│   └── AGENTS.md
├── count-analysis-service/
│   └── AGENTS.md
├── dashboard-provision-service/
│   └── AGENTS.md
├── dashboard-update-service/
│   └── AGENTS.md
└── k8s/
    └── AGENTS.md
```

**규칙**:
- 각 서비스와 공통 모듈은 독립적인 디렉토리
- 각 디렉토리에는 `AGENTS.md` 포함 (선택적이지만 권장)
- 루트에는 통합 관리 파일만 포함

### 7. 네이밍 컨벤션 (전체 프로젝트 공통)

**전체 프로젝트에서 공통으로 적용되는 네이밍 규칙**:

- **디렉토리**: kebab-case (예: `count-write-service`, `common/count-info`)
- **파일**: kebab-case (예: `count-write.controller.ts`)
- **클래스**: PascalCase (예: `CountWriteController`)
- **함수/변수**: camelCase (예: `getCountValue`)

**참고**: 각 레이어별 상세 네이밍 규칙은 해당 레이어의 AGENTS.md 참조
- 공통 모듈: `common/AGENTS.md`의 네이밍 컨벤션 섹션
- 서비스: 각 서비스/AGENTS.md의 네이밍 컨벤션 섹션

## 활동 절차

### 1. 프로젝트 구조 초기화

1. 워크스페이스 설정 확인
2. 각 서비스 및 공통 모듈 디렉토리 구조 확인
3. 루트 `package.json` 및 `tsconfig.json` 확인

### 2. 의존성 관리

1. 공통 모듈 버전 동기화
2. 서비스 간 의존성 버전 확인
3. 외부 라이브러리 버전 통일

### 3. 빌드 통합

1. 공통 모듈 빌드 실행
2. 서비스 빌드 실행
3. 빌드 오류 확인 및 수정

### 4. 테스트 통합

1. 전체 테스트 실행
2. 테스트 커버리지 집계
3. 실패한 테스트 확인 및 수정

### 5. 새 서비스/모듈 추가 시

1. `package.json`의 `workspaces`에 추가
2. `tsconfig.json`의 `references`에 추가
3. 해당 디렉토리에 `AGENTS.md` 생성 (선택적)
4. 빌드 및 테스트 확인

## 참조 문서

- `count/arch/architecture/deployment.md` (배치 구조)
- `count/arch/architecture/module.md` (모듈 구조)
- `common/AGENTS.md` (공통 모듈 관리)
- `count-write-service/AGENTS.md` (저장 서비스 관리)
- `count-read-service/AGENTS.md` (조회 서비스 관리)
- `count-management-service/AGENTS.md` (관리 서비스 관리)
- `count-analysis-service/AGENTS.md` (분석 서비스 관리)
- `dashboard-provision-service/AGENTS.md` (대시보드 제공 서비스 관리)
- `dashboard-update-service/AGENTS.md` (대시보드 갱신 서비스 관리)
- `k8s/AGENTS.md` (Kubernetes 배포 관리)

## 에이전트 행동 원칙

### 활동 집중의 원칙

- 전체 프로젝트 구조 조정에만 집중
- 개별 서비스 코드 생성/수정은 각 서비스 에이전트에게 위임
- 공통 모듈 코드 생성/수정은 common 에이전트에게 위임

### 문서 참조의 원칙

- `count/arch/architecture/deployment.md`를 반드시 참조하여 배치 단위 확인
- `count/arch/architecture/module.md`를 반드시 참조하여 모듈 구조 확인
- 각 서비스/AGENTS.md를 참조하여 서비스별 구조 확인

### 일관성 유지의 원칙

- 모든 워크스페이스에서 동일한 TypeScript 버전 사용
- 모든 워크스페이스에서 동일한 빌드 도구 사용
- 모든 워크스페이스에서 동일한 테스트 프레임워크 사용

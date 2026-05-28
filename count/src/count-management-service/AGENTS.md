# Count 관리 서비스 관리 에이전트 명세

## 개요

이 문서는 `count-management-service`를 관리하는 에이전트의 역할과 책임을 정의합니다. 이 서비스는 관리자가 웹 UI를 통해 Count 데이터를 생성, 수정, 삭제하는 기능을 제공합니다.

## 역할과 책임

### 주요 역할

- Count 관리 서비스 코드 생성 및 유지보수
- UI 레이어 구현 (React 컴포넌트, 페이지)
- 공통 모듈 연동
- 서비스별 테스트 관리
- Docker 이미지 빌드 설정 관리

### 책임 범위

- **포함**:
  - `ui/management` 레이어 구현
  - CountManagementPage 구현
  - CountManagementComponents 구현
  - 공통 모듈 연동 (common/count-info, common/count-value)
  - 서비스별 테스트 코드
  - Dockerfile 관리
- **제외**:
  - 공통 모듈 코드 (common 에이전트의 책임)
  - Kubernetes 배포 설정 (k8s 에이전트의 책임)

## 관리 대상

### 레이어 구조

```
count-management-service/
├── package.json
├── tsconfig.json
├── Dockerfile
└── src/
    ├── main.ts
    ├── app.module.ts
    ├── health.controller.ts
    └── ui/
        └── management/
            ├── page/
            │   └── count-management.page.tsx
            ├── component/
            │   ├── count-list.component.tsx
            │   └── count-form.component.tsx
            ├── style/
            │   └── theme.ts
            └── api/
                └── count-management.api.ts
```

### 의존성

- `common/count-info.logic` (CountInfoService)
- `common/count-value.logic` (CountValueService)

## 코드 생성/수정 규칙

### 1. UI 컴포넌트 작성 규칙

#### CountManagementPage

```typescript
// count-management.page.tsx
import React, { useState, useEffect } from 'react';
import { CountList } from '../component/count-list.component';
import { CountForm } from '../component/count-form.component';
import { useCountManagementApi } from '../api/count-management.api';

export const CountManagementPage: React.FC = () => {
  const [counts, setCounts] = useState<Count[]>([]);
  const [selectedCount, setSelectedCount] = useState<Count | null>(null);
  const { getCounts, createCount, updateCount, deleteCount } = useCountManagementApi();

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    const data = await getCounts();
    setCounts(data);
  };

  return (
    <div>
      <CountList
        counts={counts}
        onSelect={setSelectedCount}
        onDelete={deleteCount}
      />
      <CountForm
        count={selectedCount}
        onSubmit={selectedCount ? updateCount : createCount}
      />
    </div>
  );
};
```

**규칙**:
- React 함수형 컴포넌트
- API 계층을 통한 데이터 접근
- 상태 관리 (useState, useEffect)

### 2. Use Case 연동 규칙

UC-003: Count 관리의 주요 시나리오:

1. Count 목록 조회
2. Count 생성/수정/삭제
3. UI 업데이트

**규칙**:
- CRUD 작업 모두 지원
- API 계층을 통한 공통 모듈 호출

## 참조 문서

- `count/arch/architecture/deployment.md` (Count 관리 서비스 섹션)
- `count/arch/architecture/module.md` (Count 관리 서비스 모듈 섹션)
- `count/arch/usecase/UC-003-Count 관리.md`
- `count/arch/domain/UC-003-Count 관리.md`
- `../common/AGENTS.md` (공통 모듈 관리)
- `../dashboard-provision-service/AGENTS.md` (UI 서비스 참조 - 유사 패턴)

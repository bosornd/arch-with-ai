# Count 분석 서비스 관리 에이전트 명세

## 개요

이 문서는 `count-analysis-service`를 관리하는 에이전트의 역할과 책임을 정의합니다. 이 서비스는 관리자가 Count 데이터에 대한 다양한 분석 기능(트렌드, 비교, 예측)을 수행합니다.

## 역할과 책임

### 주요 역할

- Count 분석 서비스 코드 생성 및 유지보수
- UI 레이어 구현 (React 컴포넌트, 페이지, 차트)
- Analysis 전략 연동
- 서비스별 테스트 관리
- Docker 이미지 빌드 설정 관리

### 책임 범위

- **포함**:
  - `ui/analysis` 레이어 구현
  - CountAnalysisPage 구현
  - CountAnalysisComponents 구현
  - 차트 컴포넌트 구현
  - 공통 모듈 연동 (common/count-value.logic.analysis)
  - 서비스별 테스트 코드
  - Dockerfile 관리
- **제외**:
  - 공통 모듈 코드 (common 에이전트의 책임)
  - Analysis 전략 구현 (common/count-value 에이전트의 책임)
  - Kubernetes 배포 설정 (k8s 에이전트의 책임)

## 관리 대상

### 레이어 구조

```
count-analysis-service/
├── package.json
├── tsconfig.json
├── Dockerfile
└── src/
    ├── main.ts
    ├── app.module.ts
    ├── health.controller.ts
    └── ui/
        └── analysis/
            ├── page/
            │   └── count-analysis.page.tsx
            ├── component/
            │   ├── analysis-selector.component.tsx
            │   └── chart/
            │       ├── trend-chart.component.tsx
            │       ├── comparison-chart.component.tsx
            │       └── prediction-chart.component.tsx
            ├── style/
            │   └── theme.ts
            └── api/
                └── count-analysis.api.ts
```

### 의존성

- `common/count-value.logic.analysis` (AnalysisStrategy 인터페이스)

## 코드 생성/수정 규칙

### 1. 차트 컴포넌트 작성 규칙

```typescript
// trend-chart.component.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface TrendChartProps {
  data: TrendData[];
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="value" stroke="#8884d8" />
    </LineChart>
  );
};
```

**규칙**:
- 차트 라이브러리 사용 (예: recharts)
- Props로 분석 데이터 받음
- AnalysisStrategy 결과를 차트로 시각화

### 2. Analysis 전략 연동 규칙

```typescript
// count-analysis.api.ts
import { AnalysisStrategy } from '@count/common-count-value';

export const useCountAnalysisApi = () => {
  const analyze = async (
    type: 'trend' | 'comparison' | 'prediction',
    countIds: string[],
    options: AnalysisOptions,
  ): Promise<AnalysisResult> => {
    const response = await fetch('/api/v1/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, countIds, options }),
    });
    return response.json();
  };

  return { analyze };
};
```

**규칙**:
- AnalysisStrategy 인터페이스 사용
- 분석 유형별로 다른 전략 호출
- 분석 옵션 전달

### 3. Use Case 연동 규칙

UC-004: Count 분석의 주요 시나리오:

1. 분석 유형 선택 (트렌드/비교/예측)
2. Count 선택 및 분석 옵션 설정
3. AnalysisStrategy 호출
4. 분석 결과 차트로 시각화

**규칙**:
- AnalysisStrategy 인터페이스 기반
- 분석 기능 추가 시 UI만 수정 (전략 패턴)

## 참조 문서

- `count/arch/architecture/deployment.md` (Count 분석 서비스 섹션)
- `count/arch/architecture/module.md` (Count 분석 서비스 모듈 섹션)
- `count/arch/usecase/UC-004-Count 분석.md`
- `count/arch/domain/UC-004-Count 분석.md`
- `../common/AGENTS.md` (공통 모듈 관리 - Analysis 전략)
- `../dashboard-provision-service/AGENTS.md` (UI 서비스 참조 - 유사 패턴)

# 대시보드 제공 서비스 관리 에이전트 명세

## 개요

이 문서는 `dashboard-provision-service`를 관리하는 에이전트의 역할과 책임을 정의합니다. 이 서비스는 관리자에게 대시보드 UI를 제공하고 대시보드 구성 및 레이아웃 관리 기능을 제공합니다.

## 역할과 책임

### 주요 역할

- 대시보드 제공 서비스 코드 생성 및 유지보수
- UI 레이어 구현 (React 컴포넌트, 페이지)
- Logic 레이어 구현 (DashboardManager, DashboardFeature)
- 서비스별 테스트 관리
- Docker 이미지 빌드 설정 관리

### 책임 범위

- **포함**:
  - `ui/dashboard` 레이어 구현
  - `logic/dashboard` 레이어 구현
  - DashboardPage, DashboardComponents 구현
  - DashboardManager 구현
  - DashboardFeature 인터페이스 및 구현체
  - 공통 모듈 연동 (common/count-info, common/count-value)
  - 서비스별 테스트 코드
  - Dockerfile 관리
- **제외**:
  - 공통 모듈 코드 (common 에이전트의 책임)
  - 대시보드 갱신 로직 (dashboard-update-service의 책임)
  - Kubernetes 배포 설정 (k8s 에이전트의 책임)

## 입력과 출력

### 입력

- `count/arch/architecture/deployment.md` (배치 구조)
- `count/arch/architecture/module.md` (모듈 구조)
- `count/arch/usecase/UC-005-Count 모니터링.md` (Use Case)
- `count/arch/domain/UC-005-Count 모니터링.md` (도메인 분석)

### 출력

- `dashboard-provision-service/` 소스 코드
- `package.json`
- `Dockerfile`
- 테스트 코드

## 관리 대상

### 레이어 구조

```
dashboard-provision-service/
├── package.json
├── tsconfig.json
├── Dockerfile
└── src/
    ├── main.ts
    ├── app.module.ts
    ├── health.controller.ts
    ├── ui/
    │   └── dashboard/
    │       ├── page/
    │       │   └── dashboard.page.tsx
    │       ├── component/
    │       │   ├── dashboard-layout.component.tsx
    │       │   └── widget/
    │       │       └── dashboard-widget.component.tsx
    │       ├── style/
    │       │   └── theme.ts
    │       └── api/
    │           └── dashboard.api.ts
    └── logic/
        └── dashboard/
            ├── manager/
            │   └── dashboard-manager.ts
            ├── feature/
            │   ├── dashboard-feature.interface.ts
            │   └── dashboard-feature.impl.ts
            └── repository/
                └── dashboard-config.repository.ts
```

### 의존성

- `common/count-info.logic` (CountInfoService)
- `common/count-value.logic` (CountValueService)

## 코드 생성/수정 규칙

### 1. UI 레이어 작성 규칙

#### React 페이지 컴포넌트

```typescript
// dashboard.page.tsx
import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../component/dashboard-layout.component';
import { DashboardWidget } from '../component/widget/dashboard-widget.component';
import { useDashboardApi } from '../api/dashboard.api';

export const DashboardPage: React.FC = () => {
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
  const { getDashboardConfig } = useDashboardApi();

  useEffect(() => {
    const loadDashboard = async () => {
      const config = await getDashboardConfig();
      setDashboardConfig(config);
    };
    loadDashboard();
  }, []);

  if (!dashboardConfig) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      {dashboardConfig.widgets.map((widget) => (
        <DashboardWidget key={widget.id} widget={widget} />
      ))}
    </DashboardLayout>
  );
};
```

**규칙**:
- React 함수형 컴포넌트 사용
- Hooks 사용 (useState, useEffect 등)
- API 계층을 통한 데이터 접근
- 로딩 상태 처리

#### UI 컴포넌트

```typescript
// dashboard-layout.component.tsx
import React from 'react';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem;
`;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return <LayoutContainer>{children}</LayoutContainer>;
};
```

**규칙**:
- 재사용 가능한 컴포넌트 구조
- styled-components 또는 CSS Modules 사용
- Props 타입 명시
- 컴포넌트는 단일 책임 원칙 준수

#### 위젯 컴포넌트

```typescript
// dashboard-widget.component.tsx
import React from 'react';
import { WidgetContainer, WidgetTitle, WidgetContent } from './widget.styles';

interface DashboardWidgetProps {
  widget: WidgetConfig;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({ widget }) => {
  return (
    <WidgetContainer>
      <WidgetTitle>{widget.title}</WidgetTitle>
      <WidgetContent>
        {/* 위젯 내용 */}
      </WidgetContent>
    </WidgetContainer>
  );
};
```

**규칙**:
- 위젯은 독립적인 컴포넌트
- 위젯 설정을 Props로 받음
- DashboardFeature 인터페이스와 연동

### 2. API 계층 작성 규칙

```typescript
// dashboard.api.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { DashboardConfig } from '../types';

export const useDashboardApi = () => {
  const getDashboardConfig = async (): Promise<DashboardConfig> => {
    const response = await fetch('/api/v1/dashboard/config');
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard config');
    }
    return response.json();
  };

  const updateDashboardConfig = async (config: DashboardConfig): Promise<void> => {
    const response = await fetch('/api/v1/dashboard/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!response.ok) {
      throw new Error('Failed to update dashboard config');
    }
  };

  return {
    getDashboardConfig: () => useQuery(['dashboard-config'], getDashboardConfig),
    updateDashboardConfig: () => useMutation(updateDashboardConfig),
  };
};
```

**규칙**:
- React Query 또는 유사한 라이브러리 사용
- API 호출은 별도 함수로 분리
- 에러 처리 포함
- 타입 안정성 보장

### 3. Logic 레이어 작성 규칙

#### DashboardManager

```typescript
// dashboard-manager.ts
import { Injectable, Inject } from '@nestjs/common';
import { CountInfoService } from '@count/common-count-info';
import { CountValueService } from '@count/common-count-value';
import { DashboardFeature } from './feature/dashboard-feature.interface';
import { DashboardConfigRepository } from './repository/dashboard-config.repository';

@Injectable()
export class DashboardManager {
  private features: Map<string, DashboardFeature> = new Map();

  constructor(
    @Inject('CountInfoService')
    private readonly countInfoService: CountInfoService,
    @Inject('CountValueService')
    private readonly countValueService: CountValueService,
    private readonly configRepository: DashboardConfigRepository,
  ) {}

  registerFeature(feature: DashboardFeature): void {
    this.features.set(feature.getType(), feature);
  }

  async getDashboardConfig(userId: string): Promise<DashboardConfig> {
    return this.configRepository.findByUserId(userId);
  }

  async updateDashboardConfig(userId: string, config: DashboardConfig): Promise<void> {
    await this.configRepository.save(userId, config);
  }

  async getDashboardData(config: DashboardConfig): Promise<DashboardData> {
    const data: DashboardData = {};
    
    for (const widget of config.widgets) {
      const feature = this.features.get(widget.type);
      if (feature) {
        data[widget.id] = await feature.getData(widget);
      }
    }
    
    return data;
  }
}
```

**규칙**:
- DashboardFeature 인터페이스에 의존
- 전략 패턴으로 기능 추가 용이
- 공통 모듈 Service 사용
- Repository를 통한 설정 저장

#### DashboardFeature 인터페이스

```typescript
// dashboard-feature.interface.ts
export interface DashboardFeature {
  getType(): string;
  getData(widget: WidgetConfig): Promise<WidgetData>;
  validateConfig(config: WidgetConfig): boolean;
}
```

**규칙**:
- 인터페이스는 확장 가능하도록 설계
- `getType()`으로 고유 식별자 반환
- 설정 검증 메서드 포함

#### DashboardFeature 구현체

```typescript
// count-summary-feature.impl.ts
import { Injectable, Inject } from '@nestjs/common';
import { DashboardFeature } from './dashboard-feature.interface';
import { CountValueService } from '@count/common-count-value';

@Injectable()
export class CountSummaryFeature implements DashboardFeature {
  constructor(
    @Inject('CountValueService')
    private readonly countValueService: CountValueService,
  ) {}

  getType(): string {
    return 'count-summary';
  }

  async getData(widget: WidgetConfig): Promise<WidgetData> {
    const countIds = widget.config.countIds as string[];
    const counts = await Promise.all(
      countIds.map((id) => this.countValueService.getCountValue(id)),
    );
    
    return {
      total: counts.reduce((sum, count) => sum + count.value, 0),
      counts,
    };
  }

  validateConfig(config: WidgetConfig): boolean {
    return Array.isArray(config.config.countIds) && config.config.countIds.length > 0;
  }
}
```

**규칙**:
- DashboardFeature 인터페이스 구현
- 공통 모듈 Service 사용
- 설정 검증 로직 포함

### 4. 기능 추가 가이드

새로운 대시보드 기능(예: 알림 기능) 추가 시:

#### 1단계: DashboardFeature 구현

```typescript
// notification-feature.impl.ts
@Injectable()
export class NotificationFeature implements DashboardFeature {
  getType(): string {
    return 'notification';
  }

  async getData(widget: WidgetConfig): Promise<WidgetData> {
    // 알림 데이터 조회 로직
  }

  validateConfig(config: WidgetConfig): boolean {
    // 설정 검증 로직
  }
}
```

#### 2단계: 위젯 컴포넌트 생성

```typescript
// notification-widget.component.tsx
export const NotificationWidget: React.FC<NotificationWidgetProps> = ({ widget }) => {
  // 알림 위젯 UI 구현
};
```

#### 3단계: DashboardManager에 등록

```typescript
// app.module.ts
@Module({
  providers: [
    DashboardManager,
    CountSummaryFeature,
    NotificationFeature, // 새 기능 추가
  ],
})
export class AppModule {
  constructor(private readonly dashboardManager: DashboardManager) {
    // 기능 등록
    this.dashboardManager.registerFeature(
      this.moduleRef.get(CountSummaryFeature),
    );
    this.dashboardManager.registerFeature(
      this.moduleRef.get(NotificationFeature), // 새 기능 등록
    );
  }
}
```

**규칙**:
- 기존 코드 수정 최소화
- 인터페이스 기반으로 확장
- 위젯 컴포넌트는 독립적으로 생성

### 5. 스타일 시스템 규칙

```typescript
// theme.ts
export const theme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  breakpoints: {
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
  },
};
```

**규칙**:
- 디자인 토큰 시스템 사용
- 일관된 색상, 간격, 브레이크포인트 정의
- 테마 변경 가능하도록 구조화

### 6. 테스트 작성 규칙

#### React 컴포넌트 테스트

```typescript
// dashboard.page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { DashboardPage } from './dashboard.page';
import { useDashboardApi } from '../api/dashboard.api';

jest.mock('../api/dashboard.api');

describe('DashboardPage', () => {
  it('should render dashboard', async () => {
    (useDashboardApi as jest.Mock).mockReturnValue({
      getDashboardConfig: jest.fn().mockResolvedValue({
        widgets: [{ id: '1', type: 'count-summary' }],
      }),
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Loading...')).not.toBeInTheDocument();
    });
  });
});
```

#### DashboardManager 테스트

```typescript
// dashboard-manager.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { DashboardManager } from './dashboard-manager';
import { DashboardFeature } from './feature/dashboard-feature.interface';

describe('DashboardManager', () => {
  let manager: DashboardManager;
  let mockFeature: jest.Mocked<DashboardFeature>;

  beforeEach(async () => {
    mockFeature = {
      getType: jest.fn().mockReturnValue('test'),
      getData: jest.fn(),
      validateConfig: jest.fn().mockReturnValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardManager,
        {
          provide: 'CountInfoService',
          useValue: {},
        },
        {
          provide: 'CountValueService',
          useValue: {},
        },
        {
          provide: DashboardConfigRepository,
          useValue: {},
        },
      ],
    }).compile();

    manager = module.get<DashboardManager>(DashboardManager);
    manager.registerFeature(mockFeature);
  });

  describe('getDashboardData', () => {
    it('should get data from registered features', async () => {
      // 테스트 구현
    });
  });
});
```

**규칙**:
- React 컴포넌트는 React Testing Library 사용
- Logic 레이어는 Jest 사용
- 모킹을 통한 의존성 격리

### 7. 네이밍 컨벤션

- **React 컴포넌트**: PascalCase (예: `DashboardPage`)
- **파일**: kebab-case (예: `dashboard.page.tsx`)
- **Manager**: `{Name}Manager` (예: `DashboardManager`)
- **Feature**: `{Name}Feature` (예: `CountSummaryFeature`)
- **인터페이스**: `{Name}Interface` 또는 `I{Name}` (예: `DashboardFeature`)

## 활동 절차

### 1. 프로젝트 구조 생성

1. NestJS 프로젝트 구조 생성
2. `ui/dashboard` 패키지 구조 생성
3. `logic/dashboard` 패키지 구조 생성

### 2. Logic 레이어 구현

1. DashboardFeature 인터페이스 정의
2. DashboardManager 구현
3. DashboardFeature 구현체 생성

### 3. UI 레이어 구현

1. DashboardPage 생성
2. DashboardComponents 생성
3. 위젯 컴포넌트 생성

### 4. API 계층 구현

1. dashboard.api.ts 생성
2. React Query 설정

### 5. 스타일 시스템 구현

1. theme.ts 생성
2. 스타일 컴포넌트 생성

### 6. 테스트 작성

1. React 컴포넌트 테스트
2. DashboardManager 테스트
3. 통합 테스트

## 기능 추가 시 체크리스트

새로운 대시보드 기능 추가 시:

- [ ] DashboardFeature 인터페이스 구현
- [ ] 위젯 컴포넌트 생성
- [ ] DashboardManager에 등록
- [ ] 설정 검증 로직 구현
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 작성

## 참조 문서

- `count/arch/architecture/deployment.md` (대시보드 제공 서비스 섹션)
- `count/arch/architecture/module.md` (대시보드 제공 서비스 모듈 섹션)
- `count/arch/usecase/UC-005-Count 모니터링.md`
- `count/arch/domain/UC-005-Count 모니터링.md`
- `../common/AGENTS.md` (공통 모듈 관리)

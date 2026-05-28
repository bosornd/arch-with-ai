# 대시보드 갱신 서비스 관리 에이전트 명세

## 개요

이 문서는 `dashboard-update-service`를 관리하는 에이전트의 역할과 책임을 정의합니다. 이 서비스는 대시보드 데이터의 실시간 갱신 로직을 처리하고 SSE를 통한 실시간 갱신을 제공합니다.

## 역할과 책임

### 주요 역할

- 대시보드 갱신 서비스 코드 생성 및 유지보수
- Logic 레이어 구현 (DashboardUpdater, SSEHandler)
- 이벤트 처리 모듈 구현
- 서비스별 테스트 관리
- Docker 이미지 빌드 설정 관리

### 책임 범위

- **포함**:
  - `logic/dashboard` 레이어 구현
  - DashboardUpdater 구현
  - SSEHandler 구현
  - 이벤트 처리 모듈
  - 공통 모듈 연동 (common/count-value)
  - 서비스별 테스트 코드
  - Dockerfile 관리
- **제외**:
  - 공통 모듈 코드 (common 에이전트의 책임)
  - 대시보드 UI 제공 (dashboard-provision-service의 책임)
  - Kubernetes 배포 설정 (k8s 에이전트의 책임)

## 관리 대상

### 레이어 구조

```
dashboard-update-service/
├── package.json
├── tsconfig.json
├── Dockerfile
└── src/
    ├── main.ts
    ├── app.module.ts
    ├── health.controller.ts
    └── logic/
        └── dashboard/
            ├── updater/
            │   └── dashboard-updater.ts
            ├── sse/
            │   └── sse-handler.ts
            └── event/
                └── dashboard-event-handler.ts
```

### 의존성

- `common/count-value.logic` (CountValueService)

## 코드 생성/수정 규칙

### 1. DashboardUpdater 작성 규칙

```typescript
// dashboard-updater.ts
import { Injectable, Inject } from '@nestjs/common';
import { CountValueService } from '@count/common-count-value';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class DashboardUpdater {
  constructor(
    @Inject('CountValueService')
    private readonly countValueService: CountValueService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async updateDashboard(config: DashboardConfig): Promise<DashboardData> {
    // 1. 대시보드 데이터 조회
    const data = await this.getDashboardData(config);

    // 2. 캐시 저장
    await this.cacheDashboardData(config.id, data);

    // 3. SSE로 전송
    this.eventEmitter.emit('dashboard.update', {
      dashboardId: config.id,
      data,
    });

    return data;
  }

  private async getDashboardData(config: DashboardConfig): Promise<DashboardData> {
    const data: DashboardData = {};
    
    for (const widget of config.widgets) {
      const countValue = await this.countValueService.getCountValue(widget.countId);
      data[widget.id] = countValue;
    }
    
    return data;
  }

  private async cacheDashboardData(dashboardId: string, data: DashboardData): Promise<void> {
    // Redis 캐시 저장
  }
}
```

**규칙**:
- 이벤트 기반 갱신
- 캐싱 전략 적용
- Delta 업데이트 지원

### 2. SSEHandler 작성 규칙

```typescript
// sse-handler.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Response } from 'express';

@Injectable()
export class SSEHandler {
  private clients: Map<string, Response> = new Map();

  registerClient(dashboardId: string, response: Response): void {
    this.clients.set(dashboardId, response);
    
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
  }

  @OnEvent('dashboard.update')
  handleDashboardUpdate(payload: { dashboardId: string; data: DashboardData }): void {
    const client = this.clients.get(payload.dashboardId);
    if (client) {
      client.write(`data: ${JSON.stringify(payload.data)}\n\n`);
    }
  }
}
```

**규칙**:
- SSE 연결 관리
- 이벤트 기반 데이터 전송
- 연결 유지

### 3. 이벤트 처리 규칙

```typescript
// dashboard-event-handler.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DashboardUpdater } from '../updater/dashboard-updater';

@Injectable()
export class DashboardEventHandler {
  constructor(private readonly updater: DashboardUpdater) {}

  @OnEvent('count.updated')
  async handleCountUpdated(event: CountUpdatedEvent): Promise<void> {
    // Count 변경 시 대시보드 갱신
    const affectedDashboards = await this.getAffectedDashboards(event.countId);
    
    for (const dashboard of affectedDashboards) {
      await this.updater.updateDashboard(dashboard);
    }
  }
}
```

**규칙**:
- Kafka 이벤트 구독
- 변경된 Count에 영향받는 대시보드만 갱신
- Delta 업데이트 적용

### 4. Use Case 연동 규칙

UC-005: Count 모니터링의 주요 시나리오:

1. SSE 연결 수립
2. 초기 대시보드 데이터 전송
3. Count 변경 이벤트 수신
4. Delta 업데이트 전송
5. SSE 연결 유지

**규칙**:
- 이벤트 기반 갱신
- Delta 업데이트로 네트워크 부하 최소화
- 캐싱으로 조회 성능 향상

## 참조 문서

- `count/arch/architecture/deployment.md` (대시보드 갱신 서비스 섹션)
- `count/arch/architecture/module.md` (대시보드 갱신 서비스 모듈 섹션)
- `count/arch/usecase/UC-005-Count 모니터링.md`
- `count/arch/domain/UC-005-Count 모니터링.md`
- `../common/AGENTS.md` (공통 모듈 관리)
- `../dashboard-provision-service/AGENTS.md` (대시보드 제공 서비스 참조)

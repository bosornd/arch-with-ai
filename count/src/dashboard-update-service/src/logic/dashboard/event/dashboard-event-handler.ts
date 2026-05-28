import { Injectable, Inject } from '@nestjs/common';
import { ICountValueService } from '@count/common-count-value';
import { SSEHandler } from '../sse/sse-handler';

export interface CountUpdateEvent {
  countId: string;
  newValue: number;
  timestamp: Date;
}

@Injectable()
export class DashboardEventHandler {
  constructor(
    @Inject('ICountValueService')
    private readonly countValueService: ICountValueService,
    private readonly sseHandler: SSEHandler,
  ) {}

  async handleCountUpdate(event: CountUpdateEvent): Promise<void> {
    console.log(`[Event Handler] Received count update: ${event.countId} = ${event.newValue}`);
    
    // Delta 업데이트 데이터 생성 (브라우저가 리스닝하는 타입: count_updated)
    const updateData = {
      type: 'count_updated',
      countId: event.countId,
      value: event.newValue,
      timestamp: event.timestamp,
    };

    // 모든 클라이언트에게 전송
    this.sseHandler.sendToAll(updateData);
    console.log(`[Event Handler] Broadcasted update to ${this.sseHandler.getClientCount()} clients`);
  }

  async handleDashboardRefresh(dashboardId: string): Promise<void> {
    // 대시보드 전체 데이터 갱신
    const refreshData = {
      type: 'dashboard_refresh',
      dashboardId,
      timestamp: new Date(),
    };

    this.sseHandler.sendToAll(refreshData);
  }
}

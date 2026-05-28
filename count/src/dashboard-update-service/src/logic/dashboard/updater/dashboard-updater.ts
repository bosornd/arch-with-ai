import { Injectable, Inject } from '@nestjs/common';
import { ICountValueService } from '@count/common-count-value';
import { SSEHandler } from '../sse/sse-handler';
import { DashboardEventHandler } from '../event/dashboard-event-handler';

@Injectable()
export class DashboardUpdater {
  constructor(
    @Inject('ICountValueService')
    private readonly countValueService: ICountValueService,
    private readonly sseHandler: SSEHandler,
    private readonly eventHandler: DashboardEventHandler,
  ) {}

  async initializeDashboard(clientId: string, dashboardConfig: any): Promise<void> {
    // 초기 대시보드 데이터 조회
    const dashboardData = await this.getDashboardData(dashboardConfig);
    
    // 초기 데이터 전송
    this.sseHandler.sendUpdate(clientId, {
      type: 'initial',
      data: dashboardData,
    });
  }

  async getDashboardData(dashboardConfig: any): Promise<any> {
    const { countIds } = dashboardConfig;
    
    const countData = await Promise.all(
      countIds.map(async (id: string) => {
        const countValue = await this.countValueService.findById(id);
        return {
          id,
          value: countValue?.value || 0,
          updatedAt: countValue?.updatedAt,
        };
      })
    );

    return {
      counts: countData,
      timestamp: new Date(),
    };
  }

  async subscribeToUpdates(clientId: string, dashboardConfig: any): Promise<void> {
    // Kafka 이벤트 구독은 별도로 구현
    // 여기서는 기본 구조만 제공
  }
}

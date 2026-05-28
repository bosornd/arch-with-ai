import { Controller, Get, Res, Query } from '@nestjs/common';
import { Response } from 'express';
import { SSEHandler } from '../sse/sse-handler';
import { DashboardUpdater } from '../updater/dashboard-updater';

@Controller('dashboard/events')
export class DashboardSSEController {
  constructor(
    private readonly sseHandler: SSEHandler,
    private readonly dashboardUpdater: DashboardUpdater,
  ) {}

  @Get()
  async streamEvents(
    @Res() response: Response,
    @Query('clientId') clientId?: string,
    @Query('countIds') countIds?: string,
  ): Promise<void> {
    const finalClientId = clientId || `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // SSE 연결 설정
    this.sseHandler.addClient(finalClientId, response);

    // 초기 데이터 전송 (countIds가 있는 경우)
    if (countIds) {
      const countIdArray = countIds.split(',').map(id => id.trim());
      await this.dashboardUpdater.initializeDashboard(finalClientId, {
        countIds: countIdArray,
      });
    } else {
      // countIds가 없으면 빈 초기 데이터
      this.sseHandler.sendUpdate(finalClientId, {
        type: 'connected',
        clientId: finalClientId,
        timestamp: new Date(),
      });
    }
  }
}

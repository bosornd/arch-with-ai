import { Injectable } from '@nestjs/common';
import { ICountInfoService } from '@count/common-count-info';
import { ICountValueService } from '@count/common-count-value';
import { DashboardConfigRepository } from '../repository/dashboard-config.repository';
import { DashboardConfigEntity } from '../repository/dashboard-config.entity';

@Injectable()
export class DashboardManager {
  constructor(
    private readonly countInfoService: ICountInfoService,
    private readonly countValueService: ICountValueService,
    private readonly dashboardConfigRepository: DashboardConfigRepository,
  ) {}

  async getDashboardConfig(id: string): Promise<DashboardConfigEntity | null> {
    return this.dashboardConfigRepository.findById(id);
  }

  async saveDashboardConfig(config: DashboardConfigEntity): Promise<DashboardConfigEntity> {
    return this.dashboardConfigRepository.save(config);
  }

  async getDashboardData(configId: string): Promise<any> {
    const config = await this.getDashboardConfig(configId);
    if (!config) {
      throw new Error(`Dashboard config not found: ${configId}`);
    }

    // Count 데이터 조회
    const countData = await Promise.all(
      config.countIds.map(async (id) => {
        const [countInfo, countValue] = await Promise.all([
          this.countInfoService.findById(id),
          this.countValueService.findById(id),
        ]);

        return {
          id,
          description: countInfo?.description,
          value: countValue?.value || 0,
          updatedAt: countValue?.updatedAt,
        };
      })
    );

    return {
      config,
      counts: countData,
    };
  }
}

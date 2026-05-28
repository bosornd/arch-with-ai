import { Injectable } from '@nestjs/common';
import { IAnalysisStrategy, AnalysisRequest, AnalysisResult } from '../strategy/analysis-strategy.interface';
import { ICountValueService } from '../../service/count-value.service.interface';

@Injectable()
export class TrendAnalyzer implements IAnalysisStrategy {
  constructor(
    private readonly countValueService: ICountValueService,
  ) {}

  getType(): string {
    return 'trend';
  }

  async analyze(request: AnalysisRequest): Promise<AnalysisResult> {
    const { countIds, startTime, endTime } = request;
    
    const trends = await Promise.all(
      countIds.map(async (id) => {
        const history = await this.countValueService.findHistory(id, startTime, endTime);
        
        if (history.length === 0) {
          return {
            id,
            trend: 'no_data',
            data: [],
          };
        }

        const values = history.map(h => h.value);
        const timestamps = history.map(h => h.timestamp);
        
        // 트렌드 계산
        const trend = this.calculateTrend(values);
        
        return {
          id,
          trend,
          data: history.map(h => ({
            timestamp: h.timestamp,
            value: h.value,
          })),
          statistics: {
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            change: values[values.length - 1] - values[0],
            changeRate: values[0] !== 0 ? ((values[values.length - 1] - values[0]) / values[0]) * 100 : 0,
          },
        };
      })
    );

    return {
      type: this.getType(),
      data: trends,
      metadata: {
        startTime,
        endTime,
        countIds,
      },
    };
  }

  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' | 'volatile' {
    if (values.length < 2) {
      return 'stable';
    }

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const change = secondAvg - firstAvg;
    const threshold = firstAvg * 0.1; // 10% 변화 임계값
    
    if (Math.abs(change) < threshold) {
      // 변동성 체크
      const variance = this.calculateVariance(values);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const coefficientOfVariation = Math.sqrt(variance) / avg;
      
      return coefficientOfVariation > 0.2 ? 'volatile' : 'stable';
    }
    
    return change > 0 ? 'increasing' : 'decreasing';
  }

  private calculateVariance(values: number[]): number {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }
}

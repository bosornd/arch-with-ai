import { Injectable } from '@nestjs/common';
import { IAnalysisStrategy, AnalysisRequest, AnalysisResult } from '../strategy/analysis-strategy.interface';
import { ICountValueService } from '../../service/count-value.service.interface';

@Injectable()
export class ComparisonAnalyzer implements IAnalysisStrategy {
  constructor(
    private readonly countValueService: ICountValueService,
  ) {}

  getType(): string {
    return 'comparison';
  }

  async analyze(request: AnalysisRequest): Promise<AnalysisResult> {
    const { countIds, startTime, endTime } = request;
    
    if (countIds.length < 2) {
      throw new Error('Comparison analysis requires at least 2 count IDs');
    }

    const comparisons = await Promise.all(
      countIds.map(async (id) => {
        const history = await this.countValueService.findHistory(id, startTime, endTime);
        const current = await this.countValueService.findById(id);
        
        return {
          id,
          current: current?.value || 0,
          history: history.map(h => ({
            timestamp: h.timestamp,
            value: h.value,
          })),
        };
      })
    );

    // 비교 분석 수행
    const comparisonData = this.performComparison(comparisons);

    return {
      type: this.getType(),
      data: {
        counts: comparisons,
        comparison: comparisonData,
      },
      metadata: {
        startTime,
        endTime,
        countIds,
      },
    };
  }

  private performComparison(comparisons: Array<{ id: string; current: number; history: Array<{ timestamp: Date; value: number }> }>) {
    const currentValues = comparisons.map(c => c.current);
    const maxValue = Math.max(...currentValues);
    const minValue = Math.min(...currentValues);
    const avgValue = currentValues.reduce((a, b) => a + b, 0) / currentValues.length;

    const relativeComparisons = comparisons.map(c => ({
      id: c.id,
      current: c.current,
      relativeToMax: (c.current / maxValue) * 100,
      relativeToMin: (c.current / minValue) * 100,
      relativeToAvg: ((c.current - avgValue) / avgValue) * 100,
    }));

    return {
      max: maxValue,
      min: minValue,
      avg: avgValue,
      relativeComparisons,
    };
  }
}

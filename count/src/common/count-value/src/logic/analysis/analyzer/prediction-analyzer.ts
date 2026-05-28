import { Injectable } from '@nestjs/common';
import { IAnalysisStrategy, AnalysisRequest, AnalysisResult } from '../strategy/analysis-strategy.interface';
import { ICountValueService } from '../../service/count-value.service.interface';

@Injectable()
export class PredictionAnalyzer implements IAnalysisStrategy {
  constructor(
    private readonly countValueService: ICountValueService,
  ) {}

  getType(): string {
    return 'prediction';
  }

  async analyze(request: AnalysisRequest): Promise<AnalysisResult> {
    const { countIds, startTime, endTime, options } = request;
    const predictionDays = options?.predictionDays || 7;
    
    const predictions = await Promise.all(
      countIds.map(async (id) => {
        const history = await this.countValueService.findHistory(id, startTime, endTime);
        const current = await this.countValueService.findById(id);
        
        if (history.length < 2) {
          return {
            id,
            prediction: 'insufficient_data',
            data: [],
          };
        }

        const values = history.map(h => h.value);
        const timestamps = history.map(h => h.timestamp.getTime());
        
        // 선형 회귀를 사용한 예측
        const prediction = this.linearRegressionPrediction(values, timestamps, predictionDays);
        
        return {
          id,
          current: current?.value || 0,
          prediction: prediction.values,
          trend: prediction.trend,
          confidence: prediction.confidence,
        };
      })
    );

    return {
      type: this.getType(),
      data: predictions,
      metadata: {
        startTime,
        endTime,
        countIds,
        predictionDays,
      },
    };
  }

  private linearRegressionPrediction(
    values: number[],
    timestamps: number[],
    days: number
  ): { values: Array<{ date: Date; value: number }>; trend: number; confidence: number } {
    const n = values.length;
    const sumX = timestamps.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = timestamps.reduce((sum, x, i) => sum + x * values[i], 0);
    const sumX2 = timestamps.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // 예측 값 생성
    const lastTimestamp = timestamps[timestamps.length - 1];
    const dayInMs = 24 * 60 * 60 * 1000;
    const predictions: Array<{ date: Date; value: number }> = [];

    for (let i = 1; i <= days; i++) {
      const futureTimestamp = lastTimestamp + i * dayInMs;
      const predictedValue = slope * futureTimestamp + intercept;
      predictions.push({
        date: new Date(futureTimestamp),
        value: Math.max(0, Math.round(predictedValue)), // 음수 방지
      });
    }

    // 신뢰도 계산 (R-squared)
    const yMean = sumY / n;
    const ssRes = values.reduce((sum, y, i) => {
      const predicted = slope * timestamps[i] + intercept;
      return sum + Math.pow(y - predicted, 2);
    }, 0);
    const ssTot = values.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const rSquared = 1 - ssRes / ssTot;
    const confidence = Math.max(0, Math.min(100, rSquared * 100));

    return {
      values: predictions,
      trend: slope,
      confidence,
    };
  }
}

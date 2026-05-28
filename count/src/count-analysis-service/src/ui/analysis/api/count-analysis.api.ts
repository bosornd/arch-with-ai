// API 계층 - 서비스 API 호출
export interface AnalysisRequest {
  type: 'trend' | 'comparison' | 'prediction';
  countIds: string[];
  startTime?: Date;
  endTime?: Date;
  options?: Record<string, any>;
}

export interface AnalysisResponse {
  type: string;
  data: any;
  metadata?: Record<string, any>;
}

const API_BASE_URL = '/api/v1/counts';

export class CountAnalysisApi {
  /**
   * Count 조회 (분석용)
   */
  static async getCount(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Count를 찾을 수 없습니다: ${id}`);
      }
      throw new Error(`Count 조회 실패: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * 여러 Count 조회 (비교 분석용)
   */
  static async getCounts(ids: string[]): Promise<any[]> {
    const results = await Promise.allSettled(
      ids.map(id => this.getCount(id))
    );
    
    return results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);
  }

  /**
   * 분석 수행
   */
  static async analyze(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      // 현재는 Count Read API만 사용하여 기본 분석 수행
      const counts = await this.getCounts(request.countIds);
      
      if (counts.length === 0) {
        throw new Error('분석할 Count를 찾을 수 없습니다.');
      }

      switch (request.type) {
        case 'comparison':
          return {
            type: 'comparison',
            data: {
              counts: counts.map(c => ({
                id: c.id,
                description: c.description,
                value: c.value,
              })),
              total: counts.reduce((sum, c) => sum + c.value, 0),
              average: counts.reduce((sum, c) => sum + c.value, 0) / counts.length,
              max: Math.max(...counts.map(c => c.value)),
              min: Math.min(...counts.map(c => c.value)),
            },
          };

        case 'trend':
          // 실제 트렌드 데이터가 없으므로 현재 값만 반환
          return {
            type: 'trend',
            data: {
              countId: request.countIds[0],
              currentValue: counts[0]?.value || 0,
              description: counts[0]?.description,
              message: '트렌드 분석을 위해서는 시간별 데이터가 필요합니다.',
            },
          };

        case 'prediction':
          // 간단한 예측 (현재 값 기반)
          const currentValue = counts[0]?.value || 0;
          return {
            type: 'prediction',
            data: {
              countId: request.countIds[0],
              currentValue,
              predictedValue: Math.round(currentValue * 1.1), // 10% 증가 가정
              confidence: 0.7,
              message: '예측은 현재 값 기반으로 계산되었습니다.',
            },
          };

        default:
          throw new Error(`알 수 없는 분석 유형: ${request.type}`);
      }
    } catch (error: any) {
      throw new Error(`분석 실패: ${error.message}`);
    }
  }
}

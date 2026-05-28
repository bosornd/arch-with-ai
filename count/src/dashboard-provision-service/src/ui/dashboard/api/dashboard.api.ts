// API 계층 - 서비스 API 호출
const API_BASE_URL = '/api/v1/counts';

export class DashboardApi {
  /**
   * Count 조회
   */
  static async getCount(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Count가 없으면 null 반환
      }
      throw new Error(`Count 조회 실패: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * 여러 Count 조회
   */
  static async getCounts(ids: string[]): Promise<any[]> {
    const results = await Promise.allSettled(
      ids.map(id => this.getCount(id))
    );
    
    return results
      .filter((result): result is PromiseFulfilledResult<any> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
  }

  /**
   * 대시보드 데이터 조회
   * 기본적으로 여러 Count ID를 받아서 위젯으로 표시
   */
  static async getDashboardData(countIds: string[]): Promise<any> {
    if (countIds.length === 0) {
      // 기본 Count ID들 사용
      countIds = ['1', '2', '3'];
    }

    const counts = await this.getCounts(countIds);
    
    // 위젯 데이터 생성 (countId 추가)
    const widgets = counts.map((count, index) => ({
      id: `widget-${count.id}`,
      title: count.description || `Count ${count.id}`,
      type: 'metric' as const,
      countId: count.id, // 실시간 업데이트를 위한 Count ID
      data: {
        value: count.value,
        change: index % 2 === 0 ? '+12%' : '+5%', // 임시 데이터
      },
    }));

    // 추가 통계 위젯
    if (counts.length > 0) {
      const total = counts.reduce((sum, c) => sum + c.value, 0);
      widgets.push({
        id: 'widget-total',
        title: '전체 합계',
        type: 'metric' as const,
        data: {
          value: total,
          change: '+8%',
        },
      });
    }

    return { widgets };
  }
}

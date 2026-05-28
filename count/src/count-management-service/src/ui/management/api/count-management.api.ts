// API 계층 - 서비스 API 호출
export interface Count {
  id: string;
  description?: string;
  value: number;
  updatedAt?: Date;
  createdAt?: Date;
}

const API_BASE_URL = '/api/v1/counts';

export class CountManagementApi {
  /**
   * Count 조회
   */
  static async getCount(id: string): Promise<Count> {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Count를 찾을 수 없습니다: ${id}`);
      }
      throw new Error(`Count 조회 실패: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      id: data.id,
      description: data.description,
      value: data.value,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    };
  }

  /**
   * Count 생성/수정 (값 설정)
   */
  static async setCount(id: string, value: number, description?: string): Promise<Count> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value, description }),
    });
    if (!response.ok) {
      throw new Error(`Count 저장 실패: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      id: data.id,
      description: description || data.description,
      value: data.value,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    };
  }

  /**
   * Count 증가
   */
  static async incrementCount(id: string, amount: number = 1): Promise<Count> {
    const response = await fetch(`${API_BASE_URL}/${id}/increment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });
    if (!response.ok) {
      throw new Error(`Count 증가 실패: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      id: data.id,
      description: data.description,
      value: data.value,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    };
  }

  /**
   * Count 감소
   */
  static async decrementCount(id: string, amount: number = 1): Promise<Count> {
    const response = await fetch(`${API_BASE_URL}/${id}/decrement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });
    if (!response.ok) {
      throw new Error(`Count 감소 실패: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      id: data.id,
      description: data.description,
      value: data.value,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    };
  }
}

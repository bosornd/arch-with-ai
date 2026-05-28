import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayoutComponent } from '../component/dashboard-layout.component';
import { DashboardApi } from '../api/dashboard.api';

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'count' | 'chart' | 'metric';
  data: any;
  countId?: string; // Count ID 추적용
}

export const DashboardPage: React.FC = () => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countIds, setCountIds] = useState<string>('');
  const [sseConnected, setSseConnected] = useState(false);
  const [sseError, setSseError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchDashboard = async (ids: string[] = []) => {
    setLoading(true);
    setError(null);
    try {
      const data = await DashboardApi.getDashboardData(ids);
      setWidgets(data.widgets || []);
    } catch (err: any) {
      setError(err.message || '대시보드 데이터를 불러오는데 실패했습니다.');
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // SSE 연결 설정
  const connectSSE = (ids: string[]) => {
    // 기존 연결 종료
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setSseError(null);
    
    // Count IDs를 쿼리 파라미터로 전달
    const queryParams = ids.length > 0 ? `?countIds=${ids.join(',')}` : '';
    const sseUrl = `/dashboard/events${queryParams}`;
    
    console.log('[SSE] 연결 시도:', sseUrl);
    const eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
      console.log('[SSE] 연결 성공');
      setSseConnected(true);
      setSseError(null);
    };

    eventSource.onerror = (error) => {
      console.error('[SSE] 연결 오류:', error);
      setSseConnected(false);
      setSseError('실시간 연결 오류');
    };

    // 연결 이벤트
    eventSource.addEventListener('connected', (event: any) => {
      console.log('[SSE] 연결 확인:', event.data);
    });

    // Count 업데이트 이벤트
    eventSource.addEventListener('count_updated', (event: any) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] Count 업데이트 수신:', data);
        
        setWidgets(prevWidgets => {
          // 1단계: Count 위젯 업데이트
          const updatedWidgets = prevWidgets.map(widget => {
            if (widget.countId === data.countId) {
              return {
                ...widget,
                data: {
                  ...widget.data,
                  value: data.value,
                },
              };
            }
            return widget;
          });
          
          // 2단계: 전체 위젯 값 합산
          const totalValue = updatedWidgets
            .filter(w => w.countId && w.id !== 'widget-total')  // Count 위젯만 선택 (전체 합계 제외)
            .reduce((sum, w) => sum + (w.data.value || 0), 0);
          
          console.log('[SSE] 전체 합계 재계산:', totalValue);
          
          // 3단계: 전체 합계 위젯 업데이트
          return updatedWidgets.map(widget => {
            if (widget.id === 'widget-total') {
              return {
                ...widget,
                data: {
                  ...widget.data,
                  value: totalValue,
                },
              };
            }
            return widget;
          });
        });
      } catch (err) {
        console.error('[SSE] 이벤트 파싱 오류:', err);
      }
    });

    eventSourceRef.current = eventSource;
  };

  useEffect(() => {
    fetchDashboard();
    // 초기 SSE 연결 (기본 Count IDs)
    connectSSE(['1', '2', '3']);

    // 컴포넌트 언마운트 시 SSE 연결 종료
    return () => {
      if (eventSourceRef.current) {
        console.log('[SSE] 연결 종료');
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleRefresh = () => {
    const ids = countIds.split(',').map(id => id.trim()).filter(id => id);
    const targetIds = ids.length > 0 ? ids : [];
    fetchDashboard(targetIds);
    // SSE 연결도 새로운 IDs로 다시 설정
    connectSSE(targetIds.length > 0 ? targetIds : ['1', '2', '3']);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h1 style={{ margin: 0 }}>대시보드</h1>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '6px 12px',
            backgroundColor: sseConnected ? '#d4edda' : '#f8d7da',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '500',
            color: sseConnected ? '#155724' : '#721c24'
          }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: sseConnected ? '#28a745' : '#dc3545',
              display: 'inline-block'
            }} />
            {sseConnected ? '실시간 연결됨' : '연결 끊김'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            value={countIds}
            onChange={(e) => setCountIds(e.target.value)}
            placeholder="Count ID (쉼표로 구분, 비우면 기본값)"
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              width: '300px'
            }}
          />
          <button
            onClick={handleRefresh}
            disabled={loading}
            style={{
              padding: '8px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '로딩 중...' : '새로고침'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {sseError && (
        <div style={{
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: '#fff3cd',
          color: '#856404',
          borderRadius: '4px',
          border: '1px solid #ffeeba'
        }}>
          {sseError} (데이터는 수동 새로고침으로 확인 가능)
        </div>
      )}

      {loading && widgets.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>대시보드 로딩 중...</div>
      ) : (
        <DashboardLayoutComponent widgets={widgets} />
      )}
    </div>
  );
};

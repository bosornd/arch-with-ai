import React from 'react';
import { DashboardWidget } from '../../page/dashboard.page';

interface DashboardWidgetComponentProps {
  widget: DashboardWidget;
}

export const DashboardWidgetComponent: React.FC<DashboardWidgetComponentProps> = ({
  widget,
}) => {
  const renderContent = () => {
    switch (widget.type) {
      case 'metric':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#007bff', marginBottom: '10px' }}>
              {widget.data.value.toLocaleString()}
            </div>
            <div style={{ fontSize: '14px', color: widget.data.change.startsWith('+') ? '#28a745' : '#dc3545' }}>
              {widget.data.change} 전월 대비
            </div>
          </div>
        );

      case 'chart':
        return (
          <div style={{ height: '200px', backgroundColor: '#f8f9fa', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            <div>
              <div style={{ marginBottom: '10px' }}>차트 데이터:</div>
              <div style={{ fontSize: '12px' }}>
                {widget.data.labels.map((label: string, idx: number) => (
                  <div key={idx} style={{ marginBottom: '5px' }}>
                    {label}: {widget.data.values[idx]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'count':
        return (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#333' }}>
              {widget.data.count || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              {widget.data.description || ''}
            </div>
          </div>
        );

      default:
        return <div>알 수 없는 위젯 타입</div>;
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #dee2e6',
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
        {widget.title}
      </h3>
      {renderContent()}
    </div>
  );
};

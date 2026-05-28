import React from 'react';
import { DashboardWidget } from '../page/dashboard.page';
import { DashboardWidgetComponent } from './widget/dashboard-widget.component';

interface DashboardLayoutComponentProps {
  widgets: DashboardWidget[];
}

export const DashboardLayoutComponent: React.FC<DashboardLayoutComponentProps> = ({
  widgets,
}) => {
  if (widgets.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666', backgroundColor: 'white', borderRadius: '8px' }}>
        대시보드 위젯이 없습니다.
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
      }}
    >
      {widgets.map((widget) => (
        <DashboardWidgetComponent key={widget.id} widget={widget} />
      ))}
    </div>
  );
};

import React from 'react';
import { DashboardPage } from '../page/dashboard.page';

const App: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <DashboardPage />
    </div>
  );
};

export default App;

import React from 'react';
import { CountManagementPage } from '../page/count-management.page';

const App: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <CountManagementPage />
    </div>
  );
};

export default App;

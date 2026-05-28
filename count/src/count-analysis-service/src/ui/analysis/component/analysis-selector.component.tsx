import React from 'react';
import { AnalysisType } from '../page/count-analysis.page';

interface AnalysisSelectorComponentProps {
  selectedType: AnalysisType | null;
  onSelectType: (type: AnalysisType) => void;
}

export const AnalysisSelectorComponent: React.FC<AnalysisSelectorComponentProps> = ({
  selectedType,
  onSelectType,
}) => {
  const analysisTypes: { type: AnalysisType; label: string; description: string }[] = [
    {
      type: 'trend',
      label: '트렌드 분석',
      description: '시간에 따른 변화 추이 분석',
    },
    {
      type: 'comparison',
      label: '비교 분석',
      description: '여러 Count 값 비교',
    },
    {
      type: 'prediction',
      label: '예측 분석',
      description: '미래 값 예측',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
      {analysisTypes.map((item) => (
        <div
          key={item.type}
          onClick={() => onSelectType(item.type)}
          style={{
            padding: '20px',
            backgroundColor: selectedType === item.type ? '#007bff' : 'white',
            color: selectedType === item.type ? 'white' : '#333',
            borderRadius: '8px',
            cursor: 'pointer',
            border: selectedType === item.type ? 'none' : '2px solid #dee2e6',
            boxShadow: selectedType === item.type ? '0 4px 6px rgba(0,123,255,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (selectedType !== item.type) {
              e.currentTarget.style.borderColor = '#007bff';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedType !== item.type) {
              e.currentTarget.style.borderColor = '#dee2e6';
            }
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '10px' }}>{item.label}</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>{item.description}</p>
        </div>
      ))}
    </div>
  );
};

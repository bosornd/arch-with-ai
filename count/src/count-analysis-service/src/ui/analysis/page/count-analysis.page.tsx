import React, { useState } from 'react';
import { AnalysisSelectorComponent } from '../component/analysis-selector.component';
import { CountAnalysisApi } from '../api/count-analysis.api';

export type AnalysisType = 'trend' | 'comparison' | 'prediction';

export const CountAnalysisPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<AnalysisType | null>(null);
  const [countIds, setCountIds] = useState<string>('');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!selectedType) {
      setError('분석 유형을 선택해주세요.');
      return;
    }

    const ids = countIds.split(',').map(id => id.trim()).filter(id => id);
    if (ids.length === 0) {
      setError('Count ID를 입력해주세요. (쉼표로 구분)');
      return;
    }

    if (selectedType === 'trend' && ids.length > 1) {
      setError('트렌드 분석은 하나의 Count ID만 입력해주세요.');
      return;
    }

    if (selectedType === 'prediction' && ids.length > 1) {
      setError('예측 분석은 하나의 Count ID만 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await CountAnalysisApi.analyze({
        type: selectedType,
        countIds: ids,
      });
      setAnalysisData(result.data);
    } catch (err: any) {
      setError(err.message || '분석에 실패했습니다.');
      setAnalysisData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px' }}>Count 분석</h1>
      
      <AnalysisSelectorComponent
        selectedType={selectedType}
        onSelectType={(type) => {
          setSelectedType(type);
          setAnalysisData(null);
          setError(null);
        }}
      />

      {selectedType && (
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>
              Count ID {selectedType === 'comparison' ? '(쉼표로 구분)' : ''}
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={countIds}
                onChange={(e) => setCountIds(e.target.value)}
                placeholder={selectedType === 'comparison' ? '예: count1, count2, count3' : '예: count1'}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <button
                onClick={handleAnalyze}
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
                {loading ? '분석 중...' : '분석'}
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

          {analysisData && (
            <div>
              {selectedType === 'trend' && (
                <div>
                  <h2>트렌드 분석 결과</h2>
                  <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Count ID:</strong> {analysisData.countId}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>설명:</strong> {analysisData.description || '-'}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>현재 값:</strong> {analysisData.currentValue.toLocaleString()}
                    </div>
                    <div style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
                      {analysisData.message}
                    </div>
                  </div>
                </div>
              )}
              
              {selectedType === 'comparison' && (
                <div>
                  <h2>비교 분석 결과</h2>
                  <div style={{ marginTop: '20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                          <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>설명</th>
                          <th style={{ padding: '12px', textAlign: 'right' }}>값</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysisData.counts.map((count: any) => (
                          <tr key={count.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                            <td style={{ padding: '12px' }}>{count.id}</td>
                            <td style={{ padding: '12px' }}>{count.description || '-'}</td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: '500' }}>
                              {count.value.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
                      <div><strong>합계:</strong> {analysisData.total.toLocaleString()}</div>
                      <div style={{ marginTop: '5px' }}><strong>평균:</strong> {Math.round(analysisData.average).toLocaleString()}</div>
                      <div style={{ marginTop: '5px' }}><strong>최대값:</strong> {analysisData.max.toLocaleString()}</div>
                      <div style={{ marginTop: '5px' }}><strong>최소값:</strong> {analysisData.min.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedType === 'prediction' && (
                <div>
                  <h2>예측 분석 결과</h2>
                  <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Count ID:</strong> {analysisData.countId}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>현재 값:</strong> {analysisData.currentValue.toLocaleString()}
                    </div>
                    <div style={{ marginBottom: '10px', fontSize: '18px', color: '#007bff', fontWeight: '600' }}>
                      <strong>예측 값:</strong> {analysisData.predictedValue.toLocaleString()}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>신뢰도:</strong> {Math.round(analysisData.confidence * 100)}%
                    </div>
                    <div style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
                      {analysisData.message}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!analysisData && !loading && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              Count ID를 입력하고 분석 버튼을 클릭하세요.
            </div>
          )}
        </div>
      )}

      {!selectedType && (
        <div style={{ marginTop: '30px', padding: '40px', textAlign: 'center', color: '#666', backgroundColor: 'white', borderRadius: '8px' }}>
          분석 유형을 선택해주세요.
        </div>
      )}
    </div>
  );
};

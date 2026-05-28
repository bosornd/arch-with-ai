import React from 'react';
import { Count } from '../api/count-management.api';

interface CountListComponentProps {
  counts: Count[];
  onEdit: (count: Count) => void;
  onDelete: (id: string) => void;
  onRefresh?: (id: string) => void;
}

export const CountListComponent: React.FC<CountListComponentProps> = ({
  counts,
  onEdit,
  onDelete,
  onRefresh,
}) => {
  if (counts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        등록된 Count가 없습니다.
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>ID</th>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>설명</th>
            <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>값</th>
            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>생성일</th>
            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>작업</th>
          </tr>
        </thead>
        <tbody>
          {counts.map((count) => (
            <tr key={count.id} style={{ borderBottom: '1px solid #dee2e6' }}>
              <td style={{ padding: '12px' }}>{count.id}</td>
              <td style={{ padding: '12px' }}>{count.description || '-'}</td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: '500' }}>
                {count.value.toLocaleString()}
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
                {count.createdAt ? new Date(count.createdAt).toLocaleDateString('ko-KR') : '-'}
              </td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                <button
                  onClick={() => onEdit(count)}
                  style={{
                    padding: '6px 12px',
                    marginRight: '8px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  수정
                </button>
                <button
                  onClick={() => onDelete(count.id)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

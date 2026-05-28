import React, { useState, useEffect } from 'react';
import { CountListComponent } from '../component/count-list.component';
import { CountFormComponent } from '../component/count-form.component';
import { CountManagementApi, Count } from '../api/count-management.api';

export const CountManagementPage: React.FC = () => {
  const [counts, setCounts] = useState<Count[]>([]);
  const [selectedCount, setSelectedCount] = useState<Count | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchId, setSearchId] = useState('');

  const fetchCount = async (id: string) => {
    if (!id.trim()) {
      setError('ID를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const count = await CountManagementApi.getCount(id);
      // 이미 목록에 있는지 확인
      const existingIndex = counts.findIndex(c => c.id === count.id);
      if (existingIndex >= 0) {
        // 업데이트
        setCounts(counts.map((c, idx) => idx === existingIndex ? count : c));
      } else {
        // 추가
        setCounts([...counts, count]);
      }
      setSearchId('');
    } catch (err: any) {
      setError(err.message || 'Count 조회에 실패했습니다.');
      console.error('Failed to fetch count:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCount(searchId);
  };

  const handleCreate = () => {
    setSelectedCount(null);
    setIsFormOpen(true);
  };

  const handleEdit = (count: Count) => {
    setSelectedCount(count);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말 목록에서 제거하시겠습니까? (실제 Count는 삭제되지 않습니다)')) {
      setCounts(counts.filter(c => c.id !== id));
    }
  };

  const handleFormSubmit = async (count: Count) => {
    setLoading(true);
    setError(null);
    try {
      const savedCount = await CountManagementApi.setCount(
        count.id,
        count.value,
        count.description
      );
      
      // 목록 업데이트
      const existingIndex = counts.findIndex(c => c.id === savedCount.id);
      if (existingIndex >= 0) {
        setCounts(counts.map((c, idx) => idx === existingIndex ? savedCount : c));
      } else {
        setCounts([...counts, savedCount]);
      }
      
      setIsFormOpen(false);
      setSelectedCount(null);
    } catch (err: any) {
      setError(err.message || 'Count 저장에 실패했습니다.');
      console.error('Failed to save count:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (id: string) => {
    await fetchCount(id);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Count 관리</h1>
        <button
          onClick={handleCreate}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          + 새 Count 추가
        </button>
      </div>

      {/* Count 검색 */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Count ID로 검색..."
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '8px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '조회 중...' : '조회'}
          </button>
        </form>
      </div>

      {/* 에러 메시지 */}
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

      {/* Count 목록 */}
      {loading && counts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
      ) : (
        <CountListComponent
          counts={counts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={handleRefresh}
        />
      )}

      {/* 폼 모달 */}
      {isFormOpen && (
        <CountFormComponent
          count={selectedCount}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedCount(null);
            setError(null);
          }}
          loading={loading}
        />
      )}
    </div>
  );
};

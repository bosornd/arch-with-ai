# UC-005-Count 모니터링 도메인 분석

## 개요

### Use Case ID
UC-005

### 제목
Count 모니터링

## 시퀀스 다이어그램

### 주요 시나리오

```mermaid
sequenceDiagram
  %% primary actor
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant DashboardUI@{ "type" : "boundary" }
    participant DashboardManager@{ "type" : "control" }
    participant CountReader@{ "type" : "control" }
    participant CountAnalyzer@{ "type" : "control" }
    participant CountInfoDB@{ "type" : "entity" }
    participant CountValueDB@{ "type" : "entity" }
    participant DashboardConfigDB@{ "type" : "entity" }
  end

  Admin->>DashboardUI: 대시보드 화면 이동
  DashboardUI->>DashboardConfigDB: 대시보드 구성 조회
  DashboardConfigDB-->>DashboardUI: 대시보드 구성 반환
  DashboardUI->>DashboardManager: 대시보드 데이터 조회 요청
  DashboardManager->>CountReader: Count 목록 조회 요청
  CountReader->>CountInfoDB: Count 정보 목록 조회
  CountInfoDB-->>CountReader: Count 정보 목록 반환
  CountReader-->>DashboardManager: Count 목록 반환
  DashboardManager->>CountReader: 각 Count의 현재 값 조회 요청
  CountReader->>CountValueDB: Count 값 조회
  CountValueDB-->>CountReader: Count 값 반환
  CountReader-->>DashboardManager: Count 데이터 반환
  DashboardManager->>DashboardManager: Count 데이터 통계 정보 계산 (총 Count 수, 평균 값 등)
  DashboardManager->>CountReader: Count 데이터 변화 추이 조회 요청 (최근 기간)
  CountReader->>CountValueDB: Count 값 목록 조회 (기간별)
  CountValueDB-->>CountReader: Count 값 목록 반환
  CountReader-->>DashboardManager: Count 변화 추이 데이터 반환
  DashboardManager->>CountAnalyzer: 분석 데이터 조회 요청 (있는 경우)
  CountAnalyzer-->>DashboardManager: 분석 데이터 반환
  DashboardManager-->>DashboardUI: 대시보드 데이터 반환
  DashboardUI-->>Admin: 대시보드 표시 (Count 모니터링 정보, 통계, 변화 추이 차트, 분석 결과)
```

### 대안 시나리오

#### 2a. 특정 Count 모니터링
```mermaid
sequenceDiagram
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant DashboardUI@{ "type" : "boundary" }
    participant DashboardManager@{ "type" : "control" }
    participant CountReader@{ "type" : "control" }
    participant CountInfoDB@{ "type" : "entity" }
    participant CountValueDB@{ "type" : "entity" }
  end

  Admin->>DashboardUI: 특정 Count 선택
  DashboardUI->>DashboardManager: 특정 Count 상세 모니터링 요청
  DashboardManager->>CountReader: 선택된 Count 데이터 조회 요청
  CountReader->>CountInfoDB: Count 정보 조회
  CountInfoDB-->>CountReader: Count 정보 반환
  CountReader->>CountValueDB: Count 값 조회
  CountValueDB-->>CountReader: Count 값 반환
  CountReader-->>DashboardManager: Count 데이터 반환
  DashboardManager->>CountReader: Count 변화 추이 조회 요청
  CountReader->>CountValueDB: Count 값 목록 조회
  CountValueDB-->>CountReader: Count 값 목록 반환
  CountReader-->>DashboardManager: Count 변화 추이 데이터 반환
  DashboardManager-->>DashboardUI: Count 상세 모니터링 데이터 반환
  DashboardUI-->>Admin: Count 상세 정보 표시
```

#### 4a. 실시간 업데이트
```mermaid
sequenceDiagram
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant DashboardUI@{ "type" : "boundary" }
    participant DashboardManager@{ "type" : "control" }
    participant CountReader@{ "type" : "control" }
    participant CountValueDB@{ "type" : "entity" }
  end

  Admin->>DashboardUI: 실시간 업데이트 옵션 활성화
  DashboardUI->>DashboardManager: 실시간 업데이트 시작 요청
  loop 주기적 업데이트
    DashboardManager->>CountReader: Count 값 조회 요청
    CountReader->>CountValueDB: Count 값 조회
    CountValueDB-->>CountReader: Count 값 반환
    CountReader-->>DashboardManager: Count 데이터 반환
    DashboardManager-->>DashboardUI: 업데이트된 Count 데이터 반환
    DashboardUI-->>Admin: 대시보드 업데이트
  end
```

#### 8a. 대시보드 편집 모드
```mermaid
sequenceDiagram
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant DashboardUI@{ "type" : "boundary" }
    participant DashboardManager@{ "type" : "control" }
    participant DashboardConfigDB@{ "type" : "entity" }
  end

  Admin->>DashboardUI: 편집 모드로 전환
  DashboardUI->>DashboardUI: 대시보드 편집 화면 표시
  Admin->>DashboardUI: 표시할 Count 또는 분석 데이터 선택
  Admin->>DashboardUI: 요소 표시 옵션 설정 (차트 유형, 기간, 집계 단위 등)
  Admin->>DashboardUI: 편집 내용 저장
  DashboardUI->>DashboardManager: 대시보드 구성 저장 요청
  DashboardManager->>DashboardConfigDB: 대시보드 구성 저장
  DashboardConfigDB-->>DashboardManager: 저장 완료
  DashboardManager-->>DashboardUI: 저장 완료
  DashboardUI->>DashboardManager: 편집된 대시보드 데이터 조회 요청
  DashboardManager-->>DashboardUI: 대시보드 데이터 반환
  DashboardUI-->>Admin: 편집된 대시보드 표시
```

#### 8b. 대시보드 레이아웃 조정
```mermaid
sequenceDiagram
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant DashboardUI@{ "type" : "boundary" }
    participant DashboardManager@{ "type" : "control" }
    participant DashboardConfigDB@{ "type" : "entity" }
  end

  Admin->>DashboardUI: 레이아웃 편집 모드로 전환
  DashboardUI->>DashboardUI: 대시보드 레이아웃 편집 화면 표시
  Admin->>DashboardUI: 요소 위치 드래그 앤 드롭으로 이동
  Admin->>DashboardUI: 요소 크기 조정
  Admin->>DashboardUI: 레이아웃 조정 내용 저장
  DashboardUI->>DashboardManager: 레이아웃 구성 저장 요청
  DashboardManager->>DashboardConfigDB: 레이아웃 구성 저장
  DashboardConfigDB-->>DashboardManager: 저장 완료
  DashboardManager-->>DashboardUI: 저장 완료
  DashboardUI->>DashboardManager: 조정된 대시보드 데이터 조회 요청
  DashboardManager-->>DashboardUI: 대시보드 데이터 반환
  DashboardUI-->>Admin: 조정된 레이아웃으로 대시보드 표시
```

#### 8c. 대시보드 요소 추가
```mermaid
sequenceDiagram
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant DashboardUI@{ "type" : "boundary" }
    participant DashboardManager@{ "type" : "control" }
    participant DashboardConfigDB@{ "type" : "entity" }
  end

  Admin->>DashboardUI: 요소 추가 버튼 클릭
  DashboardUI->>DashboardUI: 추가 가능한 요소 목록 표시
  Admin->>DashboardUI: 추가할 요소 선택 (Count 모니터링, 통계 정보, 분석 차트 등)
  Admin->>DashboardUI: 요소 설정 구성 (Count ID, 차트 유형, 기간 등)
  Admin->>DashboardUI: 요소 추가 확인
  DashboardUI->>DashboardManager: 대시보드 요소 추가 요청
  DashboardManager->>DashboardConfigDB: 대시보드 구성 업데이트 (요소 추가)
  DashboardConfigDB-->>DashboardManager: 업데이트 완료
  DashboardManager-->>DashboardUI: 추가 완료
  DashboardUI->>DashboardManager: 업데이트된 대시보드 데이터 조회 요청
  DashboardManager-->>DashboardUI: 대시보드 데이터 반환
  DashboardUI-->>Admin: 업데이트된 대시보드 표시
```

#### 8d. 대시보드 요소 제거
```mermaid
sequenceDiagram
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant DashboardUI@{ "type" : "boundary" }
    participant DashboardManager@{ "type" : "control" }
    participant DashboardConfigDB@{ "type" : "entity" }
  end

  Admin->>DashboardUI: 제거할 요소 선택
  Admin->>DashboardUI: 요소 제거 버튼 클릭
  DashboardUI->>DashboardUI: 제거 확인 요청 표시
  Admin->>DashboardUI: 제거 확인
  DashboardUI->>DashboardManager: 대시보드 요소 제거 요청
  DashboardManager->>DashboardConfigDB: 대시보드 구성 업데이트 (요소 제거)
  DashboardConfigDB-->>DashboardManager: 업데이트 완료
  DashboardManager-->>DashboardUI: 제거 완료
  DashboardUI->>DashboardManager: 업데이트된 대시보드 데이터 조회 요청
  DashboardManager-->>DashboardUI: 대시보드 데이터 반환
  DashboardUI-->>Admin: 업데이트된 대시보드 표시
```

### 예외 시나리오

#### E1. 인증 실패
```mermaid
sequenceDiagram
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant DashboardUI@{ "type" : "boundary" }
  end

  Admin->>DashboardUI: 대시보드 요청 (로그인 안 됨)
  DashboardUI->>DashboardUI: 인증 정보 확인 실패
  DashboardUI-->>Admin: 로그인 화면으로 리다이렉트
```

#### E2. Count 데이터 없음
```mermaid
sequenceDiagram
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant DashboardUI@{ "type" : "boundary" }
    participant DashboardManager@{ "type" : "control" }
    participant CountReader@{ "type" : "control" }
    participant CountInfoDB@{ "type" : "entity" }
  end

  Admin->>DashboardUI: 대시보드 화면 이동
  DashboardUI->>DashboardManager: 대시보드 데이터 조회 요청
  DashboardManager->>CountReader: Count 목록 조회 요청
  CountReader->>CountInfoDB: Count 정보 목록 조회
  CountInfoDB-->>CountReader: Count 정보 없음
  CountReader-->>DashboardManager: Count 목록 없음
  DashboardManager-->>DashboardUI: Count 데이터 없음
  DashboardUI-->>Admin: Count 데이터 없음 표시 및 Count 생성 안내
```

#### E3. 시스템 오류
```mermaid
sequenceDiagram
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant DashboardUI@{ "type" : "boundary" }
    participant DashboardManager@{ "type" : "control" }
  end

  Admin->>DashboardUI: 대시보드 요청
  DashboardUI->>DashboardManager: 대시보드 데이터 조회 요청
  DashboardManager->>DashboardManager: 시스템 내부 오류 발생
  DashboardManager->>DashboardManager: 내부 오류 기록
  DashboardManager-->>DashboardUI: 시스템 오류
  DashboardUI-->>Admin: 시스템 오류 메시지 표시
```

#### E4. 데이터 조회 실패
```mermaid
sequenceDiagram
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant DashboardUI@{ "type" : "boundary" }
    participant DashboardManager@{ "type" : "control" }
    participant CountReader@{ "type" : "control" }
    participant CountValueDB@{ "type" : "entity" }
  end

  Admin->>DashboardUI: 대시보드 요청
  DashboardUI->>DashboardManager: 대시보드 데이터 조회 요청
  DashboardManager->>CountReader: Count 데이터 조회 요청
  CountReader->>CountValueDB: Count 값 조회
  CountValueDB-->>CountReader: 조회 오류 발생
  CountReader->>CountReader: 조회 오류 기록
  CountReader-->>DashboardManager: 조회 오류
  DashboardManager-->>DashboardUI: 조회 오류
  DashboardUI-->>Admin: 오류 메시지 표시 및 재시도 옵션 제공
```

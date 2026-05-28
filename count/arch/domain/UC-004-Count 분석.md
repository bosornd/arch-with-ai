# UC-004-Count 분석 도메인 분석

## 개요

### Use Case ID
UC-004

### 제목
Count 분석

## 시퀀스 다이어그램

### 주요 시나리오

```mermaid
sequenceDiagram
  %% primary actor
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant CountAnalysisUI@{ "type" : "boundary" }
    participant CountAnalyzer@{ "type" : "control" }
    participant TrendAnalyzer@{ "type" : "control" }
    participant ComparisonAnalyzer@{ "type" : "control" }
    participant PredictionAnalyzer@{ "type" : "control" }
  end

  Admin->>CountAnalysisUI: Count 분석 화면 이동
  Admin->>CountAnalysisUI: 분석 유형 선택 (트렌드/비교/예측)
  Admin->>CountAnalysisUI: 분석할 Count 선택
  Admin->>CountAnalysisUI: 분석 기간 및 조건 설정
  Admin->>CountAnalysisUI: 분석 요청 제출
  CountAnalysisUI->>CountAnalyzer: 분석 요청 전달

  alt 트렌드 분석
    CountAnalyzer->>TrendAnalyzer: 트렌드 분석 요청
    TrendAnalyzer-->>CountAnalyzer: 트렌드 분석 결과 반환
  else 비교 분석
    CountAnalyzer->>ComparisonAnalyzer: 비교 분석 요청
    ComparisonAnalyzer-->>CountAnalyzer: 비교 분석 결과 반환
  else 예측 분석
    CountAnalyzer->>PredictionAnalyzer: 예측 분석 요청
    PredictionAnalyzer-->>CountAnalyzer: 예측 분석 결과 반환
  end
  CountAnalyzer->>CountAnalyzer: 분석 결과 조합 (통계, 그래프 데이터, 인사이트)
  CountAnalyzer-->>CountAnalysisUI: 분석 결과 반환
  CountAnalysisUI-->>Admin: 분석 결과 표시 (차트, 테이블, 요약 정보)
```

### 대안 시나리오

#### 2a. 트렌드 분석
```mermaid
sequenceDiagram
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant CountAnalysisUI@{ "type" : "boundary" }
    participant CountAnalyzer@{ "type" : "control" }
    participant TrendAnalyzer@{ "type" : "control" }
    participant CountValueDB@{ "type" : "entity" }
  end

  Admin->>CountAnalysisUI: 트렌드 분석 선택
  Admin->>CountAnalysisUI: 분석할 Count들 선택
  Admin->>CountAnalysisUI: 분석 기간 설정
  Admin->>CountAnalysisUI: 분석 요청 제출
  CountAnalysisUI->>CountAnalyzer: 트렌드 분석 요청
  CountAnalyzer->>TrendAnalyzer: 트렌드 분석 요청


  TrendAnalyzer->>TrendAnalyzer: 요청 검증 (Count ID, 기간 유효성)
  TrendAnalyzer->>CountValueDB: Count 값 조회 (시간순)
  CountValueDB-->>TrendAnalyzer: Count 값 목록 반환
  TrendAnalyzer->>TrendAnalyzer: 시간에 따른 Count 값 변화 추이 분석
  TrendAnalyzer->>TrendAnalyzer: 트렌드 차트 데이터 및 통계 정보 생성
  TrendAnalyzer-->>CountAnalyzer: 트렌드 분석 결과 반환
  CountAnalyzer-->>CountAnalysisUI: 트렌드 분석 결과 반환
  CountAnalysisUI-->>Admin: 트렌드 차트 및 통계 정보 표시
```

#### 2b. 비교 분석
```mermaid
sequenceDiagram
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant CountAnalysisUI@{ "type" : "boundary" }
    participant CountAnalyzer@{ "type" : "control" }
    participant ComparisonAnalyzer@{ "type" : "control" }
    participant CountValueDB@{ "type" : "entity" }
  end

  Admin->>CountAnalysisUI: 비교 분석 선택
  Admin->>CountAnalysisUI: 비교할 Count들 선택
  Admin->>CountAnalysisUI: 분석 기간 설정
  Admin->>CountAnalysisUI: 분석 요청 제출
  CountAnalysisUI->>CountAnalyzer: 비교 분석 요청
  CountAnalyzer->>ComparisonAnalyzer: 비교 분석 요청


  ComparisonAnalyzer->>ComparisonAnalyzer: 요청 검증 (Count ID, 기간 유효성)
  ComparisonAnalyzer->>CountValueDB: Count 값 조회
  CountValueDB-->>ComparisonAnalyzer: Count 값 목록 반환
  ComparisonAnalyzer->>ComparisonAnalyzer: 선택된 Count들 간의 값 비교 분석
  ComparisonAnalyzer->>ComparisonAnalyzer: 비교 차트 데이터 및 차이점 정보 생성
  ComparisonAnalyzer-->>CountAnalyzer: 비교 분석 결과 반환
  CountAnalyzer-->>CountAnalysisUI: 비교 분석 결과 반환
  CountAnalysisUI-->>Admin: 비교 차트 및 차이점 정보 표시
```

#### 2c. 예측 분석
```mermaid
sequenceDiagram
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant CountAnalysisUI@{ "type" : "boundary" }
    participant CountAnalyzer@{ "type" : "control" }
    participant PredictionAnalyzer@{ "type" : "control" }
    participant CountValueDB@{ "type" : "entity" }
  end

  Admin->>CountAnalysisUI: 예측 분석 선택
  Admin->>CountAnalysisUI: 분석할 Count들 선택
  Admin->>CountAnalysisUI: 예측 기간 설정
  Admin->>CountAnalysisUI: 분석 요청 제출
  CountAnalysisUI->>CountAnalyzer: 예측 분석 요청
  CountAnalyzer->>PredictionAnalyzer: 예측 분석 요청
  
  PredictionAnalyzer->>PredictionAnalyzer: 요청 검증 (Count ID, 기간 유효성)
  PredictionAnalyzer->>CountValueDB: Count 값 조회 (과거 데이터)
  CountValueDB-->>PredictionAnalyzer: Count 값 목록 반환
  PredictionAnalyzer->>PredictionAnalyzer: 과거 데이터 기반 Count 값 미래 추이 예측
  PredictionAnalyzer->>PredictionAnalyzer: 예측 차트 데이터 및 예측 값 정보 생성
  PredictionAnalyzer-->>CountAnalyzer: 예측 분석 결과 반환
  CountAnalyzer-->>CountAnalysisUI: 예측 분석 결과 반환
  CountAnalysisUI-->>Admin: 예측 차트 및 예측 값 정보 표시
```

### 예외 시나리오

#### E1. 인증 실패
```mermaid
sequenceDiagram
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant CountAnalysisUI@{ "type" : "boundary" }
  end

  Admin->>CountAnalysisUI: Count 분석 요청 (로그인 안 됨)
  CountAnalysisUI->>CountAnalysisUI: 인증 정보 확인 실패
  CountAnalysisUI-->>Admin: 로그인 화면으로 리다이렉트
```

#### E2. Count 데이터 없음
```mermaid
sequenceDiagram
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant CountAnalysisUI@{ "type" : "boundary" }
    participant CountAnalyzer@{ "type" : "control" }
    participant CountReader@{ "type" : "control" }
    participant CountInfoDB@{ "type" : "entity" }
  end

  Admin->>CountAnalysisUI: Count 분석 요청 (존재하지 않는 Count ID)
  CountAnalysisUI->>CountAnalyzer: 분석 요청 전달
  CountAnalyzer->>CountReader: Count 데이터 조회 요청
  CountReader->>CountInfoDB: Count ID로 Count 정보 조회
  CountInfoDB-->>CountReader: Count 정보 없음
  CountReader-->>CountAnalyzer: Count를 찾을 수 없음 오류
  CountAnalyzer-->>CountAnalysisUI: Count를 찾을 수 없음 오류
  CountAnalysisUI-->>Admin: Count를 찾을 수 없음 오류 표시
```

#### E3. 분석 기간 오류
```mermaid
sequenceDiagram
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant CountAnalysisUI@{ "type" : "boundary" }
    participant CountAnalyzer@{ "type" : "control" }
  end

  Admin->>CountAnalysisUI: Count 분석 요청 (유효하지 않은 기간)
  CountAnalysisUI->>CountAnalyzer: 분석 요청 전달
  CountAnalyzer->>CountAnalyzer: 분석 기간 유효성 검증 실패
  CountAnalyzer-->>CountAnalysisUI: 분석 기간 오류
  CountAnalysisUI-->>Admin: 분석 기간 오류 표시 및 유효한 기간 설정 안내
```

#### E4. 데이터 부족
```mermaid
sequenceDiagram
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant CountAnalysisUI@{ "type" : "boundary" }
    participant CountAnalyzer@{ "type" : "control" }
    participant TrendAnalyzer@{ "type" : "control" }
    participant CountReader@{ "type" : "control" }
    participant CountValueDB@{ "type" : "entity" }
  end

  Admin->>CountAnalysisUI: Count 분석 요청
  CountAnalysisUI->>CountAnalyzer: 분석 요청 전달
  CountAnalyzer->>CountReader: Count 데이터 조회 요청
  CountReader->>CountValueDB: Count 값 조회
  CountValueDB-->>CountReader: Count 값 목록 반환 (데이터 부족)
  CountReader-->>CountAnalyzer: Count 데이터 반환
  CountAnalyzer->>CountAnalyzer: 분석에 필요한 충분한 데이터 확인 실패
  alt 트렌드 분석인 경우
    CountAnalyzer->>TrendAnalyzer: 트렌드 분석 요청
    TrendAnalyzer->>TrendAnalyzer: 데이터 부족 확인
    TrendAnalyzer-->>CountAnalyzer: 데이터 부족 오류
  end
  CountAnalyzer-->>CountAnalysisUI: 데이터 부족 오류
  CountAnalysisUI-->>Admin: 데이터 부족 오류 표시 및 더 넓은 기간 선택 안내
```

#### E5. 시스템 오류
```mermaid
sequenceDiagram
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant CountAnalysisUI@{ "type" : "boundary" }
    participant CountAnalyzer@{ "type" : "control" }
  end

  Admin->>CountAnalysisUI: Count 분석 요청
  CountAnalysisUI->>CountAnalyzer: 분석 요청 전달
  CountAnalyzer->>CountAnalyzer: 시스템 내부 오류 발생
  CountAnalyzer->>CountAnalyzer: 내부 오류 기록
  CountAnalyzer-->>CountAnalysisUI: 시스템 오류
  CountAnalysisUI-->>Admin: 시스템 오류 메시지 표시
```

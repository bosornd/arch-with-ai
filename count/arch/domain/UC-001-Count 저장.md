# UC-001-Count 저장 도메인 분석

## 개요

### Use Case ID
UC-001

### 제목
Count 저장

## 시퀀스 다이어그램

### 주요 시나리오

```mermaid
sequenceDiagram
  %% primary actor
  actor ExternalService as 외부 서비스

  box Count 통합 관리 시스템
    participant CountAPI@{ "type" : "boundary" }
    participant CountWriter@{ "type" : "control" }
    participant CountInfoDB@{ "type" : "entity" }
    participant CountValueDB@{ "type" : "entity" }
  end

  ExternalService->>CountAPI: Count 저장 요청 (Count ID, 값)
  CountAPI->>CountWriter: 저장 요청 전달
  CountWriter->>CountInfoDB: Count ID 존재 여부 확인
  CountInfoDB-->>CountWriter: Count 정보 반환
  CountWriter->>CountValueDB: Count ID로 기존 Count 값 조회
  CountValueDB-->>CountWriter: Count 값 반환
  CountWriter->>CountWriter: Count 값 업데이트 (증가/감소/설정)
  CountWriter->>CountValueDB: 업데이트된 Count 값 저장
  CountValueDB-->>CountWriter: 저장 완료
  CountWriter-->>CountAPI: 저장 결과 반환
  CountAPI-->>ExternalService: 저장 결과 반환
```

### 대안 시나리오

#### 4a. Count 값 증가
```mermaid
sequenceDiagram
  actor ExternalService as 외부 서비스

  box Count 통합 관리 시스템
    participant CountAPI@{ "type" : "boundary" }
    participant CountWriter@{ "type" : "control" }
    participant CountInfoDB@{ "type" : "entity" }
    participant CountValueDB@{ "type" : "entity" }
  end

  ExternalService->>CountAPI: Count 증가 요청 (Count ID, 증가 값)
  CountAPI->>CountWriter: 증가 요청 전달
  CountWriter->>CountInfoDB: Count ID 존재 여부 확인
  CountInfoDB-->>CountWriter: Count 정보 반환
  CountWriter->>CountValueDB: Count ID로 기존 Count 값 조회
  CountValueDB-->>CountWriter: Count 값 반환
  CountWriter->>CountWriter: 기존 값 + 증가 값 계산
  CountWriter->>CountValueDB: 업데이트된 Count 값 저장
  CountValueDB-->>CountWriter: 저장 완료
  CountWriter-->>CountAPI: 저장 결과 반환
  CountAPI-->>ExternalService: 저장 결과 반환
```

#### 4b. Count 값 감소
```mermaid
sequenceDiagram
  actor ExternalService as 외부 서비스

  box Count 통합 관리 시스템
    participant CountAPI@{ "type" : "boundary" }
    participant CountWriter@{ "type" : "control" }
    participant CountInfoDB@{ "type" : "entity" }
    participant CountValueDB@{ "type" : "entity" }
  end

  ExternalService->>CountAPI: Count 감소 요청 (Count ID, 감소 값)
  CountAPI->>CountWriter: 감소 요청 전달
  CountWriter->>CountInfoDB: Count ID 존재 여부 확인
  CountInfoDB-->>CountWriter: Count 정보 반환
  CountWriter->>CountValueDB: Count ID로 기존 Count 값 조회
  CountValueDB-->>CountWriter: Count 값 반환
  CountWriter->>CountWriter: 기존 값 - 감소 값 계산
  CountWriter->>CountValueDB: 업데이트된 Count 값 저장
  CountValueDB-->>CountWriter: 저장 완료
  CountWriter-->>CountAPI: 저장 결과 반환
  CountAPI-->>ExternalService: 저장 결과 반환
```

#### 4c. Count 값 설정
```mermaid
sequenceDiagram
  actor ExternalService as 외부 서비스

  box Count 통합 관리 시스템
    participant CountAPI@{ "type" : "boundary" }
    participant CountWriter@{ "type" : "control" }
    participant CountInfoDB@{ "type" : "entity" }
    participant CountValueDB@{ "type" : "entity" }
  end

  ExternalService->>CountAPI: Count 설정 요청 (Count ID, 설정 값)
  CountAPI->>CountWriter: 설정 요청 전달
  CountWriter->>CountInfoDB: Count ID 존재 여부 확인
  CountInfoDB-->>CountWriter: Count 정보 반환
  CountWriter->>CountValueDB: Count ID로 기존 Count 값 조회
  CountValueDB-->>CountWriter: Count 값 반환
  CountWriter->>CountWriter: Count 값을 요청 값으로 설정
  CountWriter->>CountValueDB: 업데이트된 Count 값 저장
  CountValueDB-->>CountWriter: 저장 완료
  CountWriter-->>CountAPI: 저장 결과 반환
  CountAPI-->>ExternalService: 저장 결과 반환
```

### 예외 시나리오

#### E1. 인증 실패
```mermaid
sequenceDiagram
  actor ExternalService as 외부 서비스

  box Count 통합 관리 시스템
    participant CountAPI@{ "type" : "boundary" }
  end

  ExternalService->>CountAPI: Count 저장 요청 (잘못된 인증 정보)
  CountAPI->>CountAPI: 인증 정보 검증 실패
  CountAPI-->>ExternalService: 인증 오류 반환
```

#### E2. Count ID 없음
```mermaid
sequenceDiagram
  actor ExternalService as 외부 서비스

  box Count 통합 관리 시스템
    participant CountAPI@{ "type" : "boundary" }
    participant CountWriter@{ "type" : "control" }
    participant CountInfoDB@{ "type" : "entity" }
  end

  ExternalService->>CountAPI: Count 저장 요청 (존재하지 않는 Count ID)
  CountAPI->>CountWriter: 저장 요청 전달
  CountWriter->>CountInfoDB: Count ID 존재 여부 확인
  CountInfoDB-->>CountWriter: Count 정보 없음
  CountWriter-->>CountAPI: Count를 찾을 수 없음 오류
  CountAPI-->>ExternalService: Count를 찾을 수 없음 오류 반환
```

#### E3. 요청 형식 오류
```mermaid
sequenceDiagram
  actor ExternalService as 외부 서비스

  box Count 통합 관리 시스템
    participant CountAPI@{ "type" : "boundary" }
  end

  ExternalService->>CountAPI: Count 저장 요청 (잘못된 형식)
  CountAPI->>CountAPI: 요청 형식 검증 실패
  CountAPI-->>ExternalService: 요청 형식 오류 반환
```

#### E4. Count 값 유효성 검증 실패
```mermaid
sequenceDiagram
  actor ExternalService as 외부 서비스

  box Count 통합 관리 시스템
    participant CountAPI@{ "type" : "boundary" }
    participant CountWriter@{ "type" : "control" }
  end

  ExternalService->>CountAPI: Count 저장 요청 (유효하지 않은 값)
  CountAPI->>CountWriter: 저장 요청 전달
  CountWriter->>CountWriter: Count 값 유효성 검증 실패
  CountWriter-->>CountAPI: 유효성 검증 오류
  CountAPI-->>ExternalService: 유효성 검증 오류 반환
```

# UC-003-Count 관리 도메인 분석

## 개요

### Use Case ID
UC-003

### 제목
Count 관리

## 시퀀스 다이어그램

### 주요 시나리오

#### 시나리오 1: Count 생성
```mermaid
sequenceDiagram
  %% primary actor
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant CountManagementUI@{ "type" : "boundary" }
    participant CountManager@{ "type" : "control" }
    participant CountInfoDB@{ "type" : "entity" }
    participant CountValueDB@{ "type" : "entity" }
  end

  Admin->>CountManagementUI: Count 생성 화면 이동
  Admin->>CountManagementUI: Count 정보 입력 (Count ID, 초기 값)
  Admin->>CountManagementUI: 생성 요청 제출
  CountManagementUI->>CountManager: Count 생성 요청
  CountManager->>CountInfoDB: Count ID 중복 확인
  CountInfoDB-->>CountManager: 중복 여부 반환
  CountManager->>CountManager: Count 값 유효성 검증
  CountManager->>CountInfoDB: 새로운 Count 정보 생성 및 저장
  CountInfoDB-->>CountManager: Count 정보 저장 완료
  CountManager->>CountValueDB: 새로운 Count 값 생성 및 저장
  CountValueDB-->>CountManager: Count 값 저장 완료
  CountManager-->>CountManagementUI: 생성 완료
  CountManagementUI-->>Admin: 생성 완료 메시지 표시
```

#### 시나리오 2: Count 수정
```mermaid
sequenceDiagram
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant CountManagementUI@{ "type" : "boundary" }
    participant CountManager@{ "type" : "control" }
    participant CountInfoDB@{ "type" : "entity" }
    participant CountValueDB@{ "type" : "entity" }
  end

  Admin->>CountManagementUI: Count 목록 조회
  CountManagementUI->>CountManager: Count 목록 조회 요청
  CountManager->>CountInfoDB: Count 목록 조회
  CountInfoDB-->>CountManager: Count 정보 목록 반환
  CountManager-->>CountManagementUI: Count 목록 반환
  CountManagementUI-->>Admin: Count 목록 표시
  Admin->>CountManagementUI: 수정할 Count 선택
  Admin->>CountManagementUI: Count 정보 수정 (Count 값 등)
  Admin->>CountManagementUI: 수정 요청 제출
  CountManagementUI->>CountManager: Count 수정 요청
  CountManager->>CountInfoDB: Count ID로 Count 정보 조회
  CountInfoDB-->>CountManager: Count 정보 반환
  CountManager->>CountValueDB: Count ID로 Count 값 조회
  CountValueDB-->>CountManager: Count 값 반환
  CountManager->>CountManager: Count 값 유효성 검증
  CountManager->>CountValueDB: Count 값 업데이트 및 저장
  CountValueDB-->>CountManager: 저장 완료
  CountManager-->>CountManagementUI: 수정 완료
  CountManagementUI-->>Admin: 수정 완료 메시지 표시
```

#### 시나리오 3: Count 삭제
```mermaid
sequenceDiagram
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant CountManagementUI@{ "type" : "boundary" }
    participant CountManager@{ "type" : "control" }
    participant CountInfoDB@{ "type" : "entity" }
    participant CountValueDB@{ "type" : "entity" }
  end

  Admin->>CountManagementUI: Count 목록 조회
  CountManagementUI->>CountManager: Count 목록 조회 요청
  CountManager->>CountInfoDB: Count 목록 조회
  CountInfoDB-->>CountManager: Count 정보 목록 반환
  CountManager-->>CountManagementUI: Count 목록 반환
  CountManagementUI-->>Admin: Count 목록 표시
  Admin->>CountManagementUI: 삭제할 Count 선택
  Admin->>CountManagementUI: 삭제 요청 제출
  CountManagementUI->>CountManager: Count 삭제 요청
  CountManager-->>CountManagementUI: 삭제 확인 요청
  CountManagementUI-->>Admin: 삭제 확인 요청 표시
  Admin->>CountManagementUI: 삭제 확인
  CountManagementUI->>CountManager: 삭제 확인
  CountManager->>CountInfoDB: Count 정보 삭제
  CountInfoDB-->>CountManager: Count 정보 삭제 완료
  CountManager->>CountValueDB: Count 값 삭제
  CountValueDB-->>CountManager: Count 값 삭제 완료
  CountManager-->>CountManagementUI: 삭제 완료
  CountManagementUI-->>Admin: 삭제 완료 메시지 표시
```

### 대안 시나리오

#### 4a. Count ID 중복
```mermaid
sequenceDiagram
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant CountManagementUI@{ "type" : "boundary" }
    participant CountManager@{ "type" : "control" }
    participant CountInfoDB@{ "type" : "entity" }
    participant CountValueDB@{ "type" : "entity" }
  end

  Admin->>CountManagementUI: Count 생성 요청 (중복된 Count ID)
  CountManagementUI->>CountManager: Count 생성 요청
  CountManager->>CountInfoDB: Count ID 중복 확인
  CountInfoDB-->>CountManager: Count ID 중복
  CountManager-->>CountManagementUI: Count ID 중복 오류
  CountManagementUI-->>Admin: Count ID 중복 오류 표시 및 다른 ID 사용 안내
  Admin->>CountManagementUI: 다른 Count ID 입력 및 재제출
  CountManagementUI->>CountManager: Count 생성 요청 (새로운 Count ID)
  CountManager->>CountInfoDB: Count ID 중복 확인
  CountInfoDB-->>CountManager: Count ID 사용 가능
  CountManager->>CountInfoDB: 새로운 Count 정보 생성 및 저장
  CountInfoDB-->>CountManager: Count 정보 저장 완료
  CountManager->>CountValueDB: 새로운 Count 값 생성 및 저장
  CountValueDB-->>CountManager: Count 값 저장 완료
  CountManager-->>CountManagementUI: 생성 완료
  CountManagementUI-->>Admin: 생성 완료 메시지 표시
```

### 예외 시나리오

#### E1. 인증 실패
```mermaid
sequenceDiagram
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant CountManagementUI@{ "type" : "boundary" }
  end

  Admin->>CountManagementUI: Count 관리 요청 (로그인 안 됨)
  CountManagementUI->>CountManagementUI: 인증 정보 확인 실패
  CountManagementUI-->>Admin: 로그인 화면으로 리다이렉트
```

#### E2. 권한 부족
```mermaid
sequenceDiagram
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant CountManagementUI@{ "type" : "boundary" }
    participant CountManager@{ "type" : "control" }
  end

  Admin->>CountManagementUI: Count 관리 요청
  CountManagementUI->>CountManager: Count 관리 요청
  CountManager->>CountManager: 권한 확인 실패
  CountManager-->>CountManagementUI: 권한 부족 오류
  CountManagementUI-->>Admin: 권한 부족 오류 표시
```

#### E3. 요청 형식 오류
```mermaid
sequenceDiagram
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant CountManagementUI@{ "type" : "boundary" }
  end

  Admin->>CountManagementUI: Count 관리 요청 (잘못된 형식)
  CountManagementUI->>CountManagementUI: 요청 형식 검증 실패
  CountManagementUI-->>Admin: 입력 오류 표시 및 올바른 형식 안내
```

#### E4. Count 값 유효성 검증 실패
```mermaid
sequenceDiagram
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant CountManagementUI@{ "type" : "boundary" }
    participant CountManager@{ "type" : "control" }
  end

  Admin->>CountManagementUI: Count 관리 요청 (유효하지 않은 값)
  CountManagementUI->>CountManager: Count 관리 요청
  CountManager->>CountManager: Count 값 유효성 검증 실패
  CountManager-->>CountManagementUI: 유효성 검증 오류
  CountManagementUI-->>Admin: 유효성 검증 오류 표시 및 유효한 값 입력 안내
```

#### E5. Count 데이터 없음
```mermaid
sequenceDiagram
  actor Admin as 관리자

  box Count 통합 관리 시스템
    participant CountManagementUI@{ "type" : "boundary" }
    participant CountManager@{ "type" : "control" }
    participant CountInfoDB@{ "type" : "entity" }
  end

  Admin->>CountManagementUI: Count 수정/삭제 요청 (존재하지 않는 Count ID)
  CountManagementUI->>CountManager: Count 수정/삭제 요청
  CountManager->>CountInfoDB: Count ID로 Count 정보 조회
  CountInfoDB-->>CountManager: Count 정보 없음
  CountManager-->>CountManagementUI: Count를 찾을 수 없음 오류
  CountManagementUI-->>Admin: Count를 찾을 수 없음 오류 표시
```

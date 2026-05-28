# QS-002-Count-조회-응답-시간

## 개요

### Quality Scenario ID
QS-002

### 제목
Count 조회 응답 시간

### 설명
외부 서비스나 관리자가 Count 값을 조회할 때의 응답 시간

### 품질 속성
성능 (응답 시간)

## 환경

### 시스템 상태
- 시스템이 정상 가동 중
- Count 통합 관리 시스템이 Kubernetes 환경에서 MSA로 배포되어 있음
- 데이터베이스가 정상 동작 중

### 초기 조건
- 외부 서비스 또는 관리자가 Count 통합 관리 시스템에 접근 가능한 상태
- CountInfoDB와 CountValueDB가 정상 동작 중
- 네트워크 연결이 정상 상태
- 인증 및 권한 검증이 완료된 상태
- 조회 대상 Count 데이터가 데이터베이스에 존재

### 부하 조건
- 시스템이 정상 부하 상태에서 동작 중
- 다른 서비스의 요청이 동시에 처리되고 있을 수 있음
- 데이터베이스에 다수의 Count 데이터가 존재할 수 있음

### 관련 컴포넌트
- CountAPI (Boundary) - 외부 서비스 조회 시
- CountManagementUI (Boundary) - 관리자 조회 시
- CountReader (Control)
- CountInfoDB (Entity)
- CountValueDB (Entity)

## 동작

### 외부 서비스 조회 시나리오
1. 외부 서비스가 Count 조회 API 요청을 CountAPI로 전송
   - 요청 데이터: Count ID, 조회 조건 (기간 등)
2. CountAPI가 요청 데이터 형식 검증 및 인증 정보 검증 수행
3. CountAPI가 CountReader로 Count 조회 요청 전달
4. CountReader가 CountInfoDB에서 Count ID 존재 여부 확인
5. CountReader가 CountValueDB에서 Count 값 조회
6. CountReader가 Count 정보와 Count 값을 조합하여 반환
7. CountAPI가 응답 데이터를 형식 변환하여 외부 서비스로 반환

### 관리자 조회 시나리오
1. 관리자가 CountManagementUI를 통해 Count 조회 요청
2. CountManagementUI가 사용자 입력 데이터 형식 검증 및 인증 확인
3. CountManagementUI가 CountReader로 Count 조회 요청 전달
4. CountReader가 CountInfoDB에서 Count ID 존재 여부 확인
5. CountReader가 CountValueDB에서 Count 값 조회
6. CountReader가 Count 정보와 Count 값을 조합하여 반환
7. CountManagementUI가 처리 결과를 관리자에게 표시

## 측정

### 측정 항목
Count 조회 응답 시간 (Response Time)

### 측정 공식
```
응답 시간 = T_response - T_request
```

여기서:
- **외부 서비스 조회 시**:
  - `T_request`: 외부 서비스가 Count 조회 API 요청을 CountAPI로 전송한 시각
  - `T_response`: 외부 서비스가 CountAPI로부터 응답을 받은 시각
- **관리자 조회 시**:
  - `T_request`: 관리자가 CountManagementUI를 통해 조회 요청을 수행한 시각
  - `T_response`: 관리자가 CountManagementUI에서 조회 결과를 확인한 시각

### 측정 방법
- 외부 서비스 조회: HTTP 요청 전송 시각과 응답 수신 시각을 기록 (밀리초 단위)
- 관리자 조회: UI 요청 시각과 결과 표시 시각을 기록 (밀리초 단위)
- 측정은 네트워크 지연을 포함한 전체 응답 시간을 포함

## 관련 문서

- UC-002-Count 조회

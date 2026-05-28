# QS-001-Count-저장-응답-시간

## 개요

### Quality Scenario ID
QS-001

### 제목
Count 저장 응답 시간

### 설명
외부 서비스가 Count 값을 저장하거나 증가/감소시킬 때의 응답 시간

### 품질 속성
성능 (응답 시간)

## 환경

### 시스템 상태
- 시스템이 정상 가동 중
- Count 통합 관리 시스템이 Kubernetes 환경에서 MSA로 배포되어 있음
- 데이터베이스가 정상 동작 중

### 초기 조건
- 외부 서비스가 Count 통합 관리 시스템에 접근 가능한 상태
- CountInfoDB와 CountValueDB가 정상 동작 중
- 네트워크 연결이 정상 상태
- 인증 및 권한 검증이 완료된 상태

### 부하 조건
- 시스템이 정상 부하 상태에서 동작 중
- 다른 외부 서비스의 요청이 동시에 처리되고 있을 수 있음
- 데이터베이스에 기존 Count 데이터가 존재할 수 있음

### 관련 컴포넌트
- CountAPI (Boundary)
- CountWriter (Control)
- CountInfoDB (Entity)
- CountValueDB (Entity)

## 동작

1. 외부 서비스가 Count 저장 API 요청을 CountAPI로 전송
   - 요청 유형: Count 값 저장, 증가, 감소, 설정 중 하나
   - 요청 데이터: Count ID, Count 값 또는 증감량
2. CountAPI가 요청 데이터 형식 검증 및 인증 정보 검증 수행
3. CountAPI가 CountWriter로 Count 저장 요청 전달
4. CountWriter가 CountInfoDB에서 Count ID 존재 여부 확인
5. CountWriter가 CountValueDB에서 기존 Count 값 조회 (있는 경우)
6. CountWriter가 요청 유형에 따라 Count 값 증가/감소/설정 처리
7. CountWriter가 업데이트된 Count 값을 CountValueDB에 저장
8. CountWriter가 처리 결과를 CountAPI로 반환
9. CountAPI가 응답 데이터를 형식 변환하여 외부 서비스로 반환

## 측정

### 측정 항목
Count 저장 응답 시간 (Response Time)

### 측정 공식
```
응답 시간 = T_response - T_request
```

여기서:
- `T_request`: 외부 서비스가 Count 저장 API 요청을 CountAPI로 전송한 시각
- `T_response`: 외부 서비스가 CountAPI로부터 응답을 받은 시각

### 측정 방법
- 외부 서비스 측에서 HTTP 요청 전송 시각과 응답 수신 시각을 기록
- 응답 시간은 밀리초(ms) 단위로 측정
- 측정은 네트워크 지연을 포함한 전체 응답 시간을 포함

## 관련 문서

- UC-001-Count 저장

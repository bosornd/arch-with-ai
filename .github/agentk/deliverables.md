# 산출물 명세 (Deliverables)

구조 설계 활동에서 생성되는 모든 산출물의 목적, 내용, 위치를 정의합니다.

## 산출물 디렉토리 구조

```
/                                # 작업 디렉토리
├── system.md                    # 시스템 정의
├── business.md                  # 비즈니스 요구사항
├── usecases.md                  # Use Case 목록
├── qualities.md                 # 선정된 품질 요구사항 목록
├── architecture.md              # 최종 아키텍처 문서
├── usecase/                     # Use Case 상세 명세
│   ├── UC-001-{title}.md
│   ├── UC-002-{title}.md
│   └── ...
├── domain/                      # 도메인 모델
│   ├── model.md                 # 통합 도메인 모델
│   ├── UC-001-{title}.md        # UC별 도메인 분석
│   ├── UC-002-{title}.md
│   └── ...
├── quality/                     # 품질 요구사항
│   ├── scenarios.md             # 품질 시나리오 목록
│   ├── evaluations.md           # 품질 시나리오 평가
│   ├── QS-001-{title}.md        # 개별 품질 시나리오 명세
│   ├── QS-002-{title}.md
│   └── ...
├── candidate/                   # 후보 아키텍처
│   ├── candidates.md            # 후보 아키텍처 목록
│   ├── CA-001-{title}.md        # 개별 후보 아키텍처 설계
│   ├── CA-002-{title}.md
│   └── ...
├── decision/                    # 설계 결정
│   ├── decisions.md             # 설계 결정 목록
│   ├── CA-001-{title}.md        # 개별 후보 아키텍처 평가 결과
│   ├── CA-002-{title}.md
│   └── ...
├── architecture/                # 최종 아키텍처
│   ├── deployment.md            # 배치 아키텍처
│   ├── module.md                # 모듈 아키텍처
│   └── ...
└── evaluation/                  # 아키텍처 평가
    ├── decisions.md             # 명세된 설계 결정 목록
    └── evaluation.md            # 최종 평가 보고서
```

## 1. 시스템 정의 단계

### system.md
**목적**: 시스템의 전체적인 정의와 범위

**파일**:`system.md`

**포함 내용**:
- 시스템 목적 및 비전
- 주요 기능 개요
- 시스템 경계 (범위 내/외 구분)
- 기술적/비즈니스적 제약사항

**생성 에이전트**: system-definer

---

### business.md
**목적**: 비즈니스 관점의 요구사항과 드라이버

**파일**:`business.md`

**포함 내용**:
- 비즈니스 목표 및 전략
- 주요 이해관계자 (Stakeholders)
- 비즈니스 제약사항

**생성 에이전트**: business-analyzer

---

## 2. 기능 명세 단계

### usecases.md
**목적**: 시스템의 모든 Use Case 목록

**파일**:`usecases.md`

**포함 내용**:
- Use Case ID
- Use Case 이름
- 간단한 설명 (1-2문장)

**생성 에이전트**: usecase-extractor

---

### usecase/UC-nnn-title.md
**목적**: 개별 Use Case의 상세 명세

**파일**:`usecase/UC-{번호}-{제목}.md`

**명명 규칙**: 
- `UC-001-사용자-등록.md`
- `UC-002-주문-처리.md`

**포함 내용**:
- Use Case 이름 및 ID
- 상세 설명
- 액터 (Actor)
- 사전조건 (Preconditions)
- 사후조건 (Postconditions)
- 주요 시나리오 (Main Flow)
- 대안 시나리오 (Alternative Flows)
- 예외 처리

**생성 에이전트**: usecase-specifier

---

## 3. 도메인 모델 정립 단계

### domain/UC-nnn-title.md
**목적**: Use Case별 도메인 분석 결과

**파일**:`domain/UC-{번호}-{제목}.md`

**포함 내용**:
- Use Case 관련 도메인 개념
- 개념 간 관계 (연관, 집합, 일반화 등)
- 책임 분석 (각 개념의 역할과 책임)
- 후보 엔티티/값 객체 식별

**생성 에이전트**: domain-modeler

---

### domain/model.md
**목적**: 통합된 도메인 모델

**파일**:`domain/model.md`

**포함 내용**:
- 핵심 도메인 컴포넌트 목록

**생성 에이전트**: domain-modeler

---

## 4. 품질 요구사항 선정 단계

### quality/scenarios.md
**목적**: 품질 시나리오 목록

**파일**:`quality/scenarios.md`

**포함 내용**:
- 품질 시나리오 ID
- 품질 분류 (Performance, Modifiability, Security 등)
- 간단한 설명

**생성 에이전트**: quality-elicitor

---

### quality/QS-nnn-title.md
**목적**: 개별 품질 시나리오의 상세 명세

**파일**:`quality/QS-{번호}-{제목}.md`

**명명 규칙**:
- `QS-001-사용자-등록-처리-시간.md`
- `QS-002-결재-시스템-변경-용이성.md`

**포함 내용**:
- 구체적인 품질 시나리오 명세

**생성 에이전트**: quality-specifier

---

### quality/evaluations.md
**목적**: 품질 시나리오 평가 결과

**파일**:`quality/evaluations.md`

**포함 내용**:
- 각 시나리오의 중요도 (High/Medium/Low)
- 난이도 평가
- 비즈니스 영향도
- 우선순위 산정 근거

**생성 에이전트**: quality-evaluator

---

### qualities.md
**목적**: 최종 선정된 주요 품질 요구사항 목록

**파일**:`qualities.md`

**포함 내용**:
- 선정된 품질 요구사항 목록
- NFR과 QA 구분
- 각 품질 속성에 해당하는 품질 시나리오 참조 (QS-nnn)

**생성 에이전트**: quality-selector

---

## 5. 후보 구조 설계 단계

### candidate/candidates.md
**목적**: 모든 후보 아키텍처 목록

**파일**:`candidate/candidates.md`

**포함 내용**:
- 후보 아키텍처 ID
- 이름
- 설계 관점 (성능/변경용이성/보안/MSA/모듈 등)
- 주요 특징 (1-2문장)
- 대응하는 품질 시나리오 참조 (QS-nnn)

**생성 에이전트**: performance-architect, modifiability-architect 등

---

### candidate/CA-nnn-title.md
**목적**: 개별 후보 아키텍처의 상세 설계

**파일**:`candidate/CA-{번호}-{제목}.md`

**명명 규칙**:
- `CA-001-사용자-등록-서비스-분할.md`
- `CA-002-결재-시스템-추상화.md`

**포함 내용**:
- 후보 아키텍처 이름 및 ID
- 목적 및 배경
- 아키텍처 다이어그램 (컴포넌트, 커넥터)
- 주요 컴포넌트 설명
- 커넥터 및 상호작용 방식
- 적용된 설계 패턴
- 품질 속성 대응 전략
- 예상 장점
- 예상 단점 및 리스크

**생성 에이전트**: performance-architect, modifiability-architect 등

---

## 6. 최종 구조 설계 단계

### decision/decisions.md
**목적**: 아키텍처 설계 결정 목록

**파일**:`decision/decisions.md`

**포함 내용**:
- 채택된 후보 아키텍처 목록 (CA-nnn)
- 기각된 후보 아키텍처 목록
- 각 결정의 근거
- 트레이드오프 분석 요약
- 상충하는 후보 간 선택 이유

**생성 에이전트**: candidate-evaluator

---

### decision/CA-nnn-title.md
**목적**: 개별 후보 아키텍처 평가 결과

**파일**:`decision/CA-{번호}-{제목}.md`

**포함 내용**:
- 평가 기준 (품질 속성별)
- 장점 분석
- 단점 분석
- 품질 속성 만족도 (각 QA별 점수/평가)
- 다른 후보와의 비교 (해당시)
- 최종 결정 (채택/기각)
- 결정 사유

**생성 에이전트**: candidate-evaluator

---

### architecture/deployment.md
**목적**: 실행 동작 측면의 최종 구조 설계

**파일**:`architecture/deployment.md`

**포함 내용**:
- 런타임 컴포넌트 구성
- 실행 프로세스 구조
- 노드 (서버/컨테이너) 배치
- 네트워크 구성
- 배포 다이어그램

**생성 에이전트**: system-architect

---

### architecture/module.md
**목적**: 개발 측면의 최종 구조 설계

**파일**:`architecture/module.md`

**포함 내용**:
- 모듈 구성 (패키지, 라이브러리)
- 레이어 구조
- 모듈 간 의존성
- 코드 조직화 원칙
- 모듈 다이어그램

**생성 에이전트**: module-architect

---

## 7. 구조 명세 단계

### architecture.md
**목적**: 최종 소프트웨어 아키텍처 종합 문서

**파일**:`architecture.md`

**포함 내용**:
- 시스템 개요 (system.md 참조)
- 비즈니스 요구사항 (business.md 참조)
- 기능적 요구사항 (usecase.md 참조)
- 품질 요구사항 (qualities.md 참조)
- 최종 구조 설명
  - 실행 동작 구조 (deployment.md 참조)
  - 모듈 구조 (module.md 참조)
- 부록

**생성 에이전트**: architecture-specifier

---

## 8. 아키텍처 평가 단계

### evaluation/decisions.md
**목적**: 명세된 최종 구조에 포함된 설계 결정 목록

**파일**:`evaluation/decisions.md`

**포함 내용**:
- 명세된 구조적 의사결정 목록
- 각 결정이 영향을 미치는 품질 속성
- 평가 대상 품질 시나리오 매핑
- 분석 방법 (시나리오 워크스루, 프로토타입 등)

**생성 에이전트**: architecture-analyzer

---

### evaluation/evaluation.md
**목적**: 최종 아키텍처 평가 보고서

**파일**:`evaluation/evaluation.md`

**포함 내용**:
- 평가 개요 및 방법론
- 품질 요구사항별 평가 결과
  - NFR 충족 여부
  - QA 만족도
- 위험 요소 (Risk) 식별
  - 높음/중간/낮음 위험도 분류
  - 완화 전략
- 트레이드오프 분석 결과
- 개선 권고사항
- 종합 평가 및 결론

**생성 에이전트**: architecture-evaluator

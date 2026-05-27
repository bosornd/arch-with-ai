# 구조 설계 워크플로우 (Workflow)

구조 설계 활동의 전체 작업 흐름과 에이전트 간 협업 방식을 정의합니다.

## 워크플로우 개요

구조 설계 활동은 8개의 순차적 Phase로 구성되며, 각 Phase 내에서 일부 활동은 병렬로 수행 가능합니다.

```
Phase 1: 시스템 정의
    ↓
Phase 2: 기능 명세
    ↓
Phase 3: 도메인 모델 정립
    ↓
Phase 4: 품질 요구사항 선정
    ↓
Phase 5: 후보 구조 설계
    ↓
Phase 6: 최종 구조 설계
    ↓
Phase 7: 구조 명세
    ↓
Phase 8: 구조 평가
```

## Phase 1: 시스템 정의

**목적**: 시스템과 비즈니스 드라이버의 정의

**에이전트 실행 순서**:

### 1.1 system-definer
- **입력**: 사용자 요구사항
- **출력**: `system.md`
- **활동**: 
  - 시스템 목적 및 범위 정의
  - 시스템 경계 설정
  - 제약사항 식별

### 1.2 business-analyzer
- **입력**: `system.md`, 사용자 요구사항
- **출력**: `business.md`
- **활동**:
  - 비즈니스 목표 및 드라이버 식별
  - 주요 이해관계자 분석

**체크포인트**:
- [ ] system.md 작성 완료
- [ ] business.md 작성 완료
- [ ] 시스템 범위와 비즈니스 목표의 일관성 확인

---

## Phase 2: 기능 명세

**목적**: 시스템의 기능적 요구사항 도출 및 명세

**에이전트 실행 순서**:

### 2.1 usecase-extractor
- **입력**: `system.md`, `business.md`
- **출력**: `usecases.md`
- **활동**:
  - 주요 Use Case 목록 추출

### 2.2 usecase-specifier (Use Case별 반복)
- **입력**: `usecases.md`
- **출력**: `usecase/UC-nnn.md`
- **활동**:
  - 각 Use Case 상세 명세
  - 액터, 사전/사후조건 정의
  - 주요 및 대안 시나리오 작성

**병렬 실행**: 여러 Use Case에 대해 병렬 수행 가능

**체크포인트**:
- [ ] usecases.md 작성 완료
- [ ] 모든 주요 기능이 Use Case로 표현됨
- [ ] 모든 주요 Use Case가 상세히 명세됨
- [ ] Use Case 간 일관성 확인

---

## Phase 3: 도메인 모델 정립

**목적**: 기능적 요구사항으로부터 도메인 컴포넌트 식별 및 통합

**에이전트 실행 순서**:

### 3.1 domain-modeler (Use Case별 반복)
- **입력**: `usecase/UC-nnn.md`
- **출력**: `domain/UC-nnn.md`
- **활동**:
  - Use Case별 도메인 컴포넌트 식별
  - Use Case별 시스템 내부 동작 명세
  - 컴포넌트 책임 분석

**병렬 실행**: 여러 Use Case에 대해 병렬 수행 가능

### 3.2 domain-modeler (통합)
- **입력**: `domain/UC-nnn.md`
- **출력**: `domain/model.md`
- **활동**:
  - 도메인 컴포넌트 통합
  - 중복 컴포넌트 제거
  - 통합 도메인 모델 작성

**병렬 실행**: 3.1 완료 후 순차 실행 또는 여러 Use Case에 대해 3.1과 3.2를 순차적으로 병렬 수행 가능

**체크포인트**:
- [ ] domain/model.md 작성 완료
- [ ] 모든 주요 Use Case가 도메인 분석됨
- [ ] 도메인 모델 컴포넌트의 명확한 구분

---

## Phase 4: 품질 요구사항 선정

**목적**: 품질 요구사항 도출, 명세, 평가 및 선정

**에이전트 실행 순서**:

### 4.1 quality-elicitor
- **입력**: `system.md`, `business.md`, `usecases.md`
- **출력**: `quality/scenarios.md`
- **활동**:
  - 품질 시나리오 생성

### 4.2 quality-specifier (품질 시나리오별 반복)
- **입력**: `quality/scenarios.md`
- **출력**: `quality/QS-001.md`, `quality/QS-002.md`, ...
- **활동**:
  - 각 품질 시나리오 상세 명세

**병렬 실행**: 여러 품질 시나리오에 대해 병렬 수행 가능

### 4.3 quality-evaluator (품질 시나리오별 반복)
- **입력**: `quality/QS-nnn.md`
- **출력**: `quality/evaluations.md`
- **활동**:
  - 중요도 평가
  - 난이도 평가
  - 비즈니스 영향도 분석

**병렬 실행**: 여러 품질 시나리오에 대해 병렬 수행 가능

### 4.4 quality-selector
- **입력**: `quality/evaluations.md`
- **출력**: `qualities.md`
- **활동**:
  - 주요 품질 요구사항 선정
  - NFR과 QA 구분
  - 우선순위 설정

**병렬 실행**: 4.3 완료 후 실행

**체크포인트**:
- [ ] qualities.md 작성 완료
- [ ] NFR 허용치가 명확함
- [ ] QA 우선 순위가 명확함

---

## Phase 5: 후보 구조 설계

**목적**: 후보 구조 설계

**에이전트 실행 순서**:

### 5.1 품질 속성별 아키텍트

#### performance-architect
- **입력**: `qualities.md`, `domain/model.md`, `quality/QS-nnn.md` (성능 관련)
- **출력**: `candidate/QS-nnn.md` (성능 관련 후보)
- **활동**:
  - 성능 요구사항 분석
  - 성능 최적화 후보 구조 설계
  - 성능 대응 전략 명세

**병렬 실행**: 여러 성능 시나리오에 대해 병렬 수행 가능

#### modifiability-architect
- **입력**: `qualities.md`, `domain/model.md`, `quality/QS-nnn.md` (변경 용이성 관련)
- **출력**: `candidate/QS-nnn.md` (변경 용이성 관련 후보)
- **활동**:
  - 변경 시나리오 분석
  - 변경 영향도 최소화 후보 구조 설계
  - 변경 대응 전략 명세

**병렬 실행**: 여러 변경 용이성 시나리오에 대해 병렬 수행 가능

#### (기타 품질 속성별 아키텍트)
- 사용성, 가용성, 보안, 확장성 등 주요 품질 속성별로 아키텍트 실행
- 각 아키텍트는 독립적으로 후보 구조 설계

### (구조적 관심사 또는 스타일 적용 아키텍트)
- MSA(Micro Service Architecture), Layered Architecture 등 기술 별로 아키텍트 실행
- 각 아키텍트는 독립적으로 후보 구조 설계

**병렬 실행**: 모든 아키텍트는 병렬 실행 가능

### 5.2 후보 통합 (각 아키텍트)
- **입력**: 각 아키텍트가 생성한 `candidate/QS-nnn.md`
- **출력**: `candidate/candidates.md` (통합 목록)
- **활동**:
  - 모든 후보 구조 목록화
  - 상충 가능성 있는 후보 식별

**병렬 실행**: 모든 후보 구조 설계 완료 후 순차 실행 또는 여러 속성에 대해 5.1과 5.2를 순차적으로 병렬 수행 가능

**체크포인트**:
- [ ] 모든 주요 품질 속성에 대한 후보 구조 설계 완료
- [ ] 후보 구조 목록 작성 완료
- [ ] 상충 후보 식별 완료

---

## Phase 6: 최종 구조 설계

**목적**: 후보 구조 평가 및 최종 구조 통합

**에이전트 실행 순서**:

### 6.1 candidate-evaluator (후보 구조별 반복)
- **입력**: `candidate/candidates.md`, `candidate/QS-nnn.md`, `qualities.md`
- **출력**: `decision/evaluations.md`
- **활동**:
  - 각 후보 평가
  - 장단점 분석
  - 품질 속성 만족도 평가
  - 상충 후보 비교
  - 채택/기각 결정

**병렬 실행**: 여러 후보에 대해 병렬 평가 가능 (단, 상충 후보는 함께 비교)

### 6.2 candidate-evaluator (통합)
- **입력**: `decision/evaluations.md` (모든 평가 결과)
- **출력**: `decision/decisions.md`
- **활동**:
  - 채택된 후보 구조 목록
  - 기각된 후보 구조 목록

**병렬 실행**: 모든 후보 구조 평가 후 순차 실행 또는 여러 후보에 대해 6.1과 6.2를 순차적으로 병렬 수행 가능

### 6.3 system-architect
- **입력**: `decision/decisions.md`, `domain/model.md`
- **출력**: `architecture/deployment.md`
- **활동**:
  - 동작 구조 설계
  - 배치 구조 정의

### 6.4 module-architect
- **입력**: `decision/decisions.md`, `domain/model.md`
- **출력**: `architecture/module.md`
- **활동**:
  - 개발 구조 설계
  - 모듈 및 레이어 정의
  - 의존성 관계 정의

**병렬 실행**: 일반적으로 동작 측면의 구조 설계 활동을 마무리 하고, 개발 측면의 설계를 진행하는 것이 적절함.

**체크포인트**:
- [ ] 모든 후보 평가 완료
- [ ] 채택/기각 결정 완료
- [ ] 동작 구조 설계 완료
- [ ] 모듈 구조 설계 완료

---

## Phase 7: 구조 명세

**목적**: 최종 구조 종합 문서 작성

**에이전트 실행 순서**:

### 7.1 architecture-specifier
- **입력**: 
  - `system.md`, `business.md`
  - `usecases.md`, `usecase/UC-nnn.md`
  - `qualities.md`, `quality/scenarios.md`, `quality/evaluations.md`, `quality/QS-nnn.md`
  - `domain/model.md`, `domain/UC-nnn.md`
  - `candidate/candidates.md`, `candidate/CA-nnn.md`, `candidate/QS-nnn.md`
  - `decision/decisions.md`, `decision/evaluations.md`
  - `architecture/deployment.md`, `architecture/module.md`
- **출력**: `architecture.md`
- **활동**:
  - 시스템 개요 작성
  - 요구사항 요약
  - 최종 구조 명세
  - 주요 구조도 작성
  - 설계 원칙 및 제약사항 문서화

**체크포인트**:
- [ ] 모든 관련 문서가 통합됨
- [ ] 구조도가 완전함
- [ ] 최종 구조 설계서 작성 완료

---

## Phase 8: 구조 평가

**목적**: 최종 구조의 품질 요구사항 만족도 평가

**에이전트 실행 순서**:

### 8.1 architecture-analyzer
- **입력**: `architecture.md`
- **출력**: `evaluation/decisions.md`
- **활동**:
  - 명세된 구조적 의사결정 식별

### 8.2 architecture-evaluator
- **입력**: `evaluation/decisions.md`, `qualities.md`, `quality/QS-nnn.md`
- **출력**: `evaluation/evaluation.md`
- **활동**:
  - 명세된 구조적 의사결정과 채택된 후보 구조의 비교 분석
  - NFR 충족 여부 검증
  - QA 만족도 평가
  - 위험 요소 식별

### 8.3 architecture-evaluator
- **입력**: `evaluation/decisions.md`, `evaluation/evaluation.md`
- **출력**: `architecture.md`
- **활동**:
  - 최종 구조 설계서에 구조 평가 항목 추가

**체크포인트**:
- [ ] 모든 구조적 의사결정 식별됨
- [ ] NFR 충족 여부 확인됨
- [ ] 위험 요소가 식별되고 완화 전략 제시됨
- [ ] 최종 평가 보고서 작성 완료

## 산출물 명세 (Deliverables)

```
/                                # 작업 디렉토리
├── system.md                    # 시스템 정의
├── business.md                  # 비즈니스 요구사항
├── usecases.md                  # Use Case 목록
├── qualities.md                 # 선정된 품질 요구사항 목록
├── architecture.md              # 최종 구조 문서
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
├── candidate/                   # 후보 구조
│   ├── candidates.md            # 후보 구조 목록
│   ├── {concern}.md             # 개별 관심사 후보 구조 설계
│   ├── {concern}.md
│   └── ...
├── decision/                    # 설계 결정
│   ├── decisions.md             # 채택된 후보 구조 목록
│   ├── evaluations.md           # 후보 구조 평가 결과
│   └── ...
├── architecture/                # 최종 구조
│   ├── deployment.md            # 배치 구조
│   ├── module.md                # 모듈 구조
│   └── ...
└── evaluation/                  # 구조 평가
    ├── decisions.md             # 명세된 설계 결정 목록
    └── evaluation.md            # 최종 평가 보고서
```

# AgentK - 구조 설계 활동 지원 시스템

## 프로젝트 개요

AgentK는 소프트웨어 아키텍처 구조 설계 활동을 지원하는 에이전트 기반 시스템입니다. 이 프로젝트는 [`.cursor/agents/doc/workflow.md`](.cursor/agents/doc/workflow.md)에 명세된 구조 설계 워크플로우를 따라 체계적으로 아키텍처를 설계하고 소스 코드를 생성할 수 있도록 도와줍니다.

### 주요 기능

- **8단계 구조 설계 워크플로우**: 시스템 정의부터 구조 평가까지 체계적인 설계 프로세스
- **에이전트 기반 자동화**: 각 단계별로 특화된 에이전트가 작업 수행
- **자동 코드 생성**: 설계된 아키텍처를 기반으로 소스 코드 자동 생성
- **문서 기반 설계**: 모든 설계 결정과 구조가 문서로 명확히 기록됨

## 빠른 시작

### 1. 프로젝트 디렉토리 설정

`.vscode/settings.json` 파일에 프로젝트 디렉토리를 설정합니다:

```json
{
  "architectureDirectory": "count/arch",
  "sourceDirectory": "count/src"
}
```

**설정 항목 설명**:

- `architectureDirectory`: 구조 설계 문서가 저장될 디렉토리 (예: `count/arch`)
- `sourceDirectory`: 생성된 소스 코드가 저장될 디렉토리 (예: `count/src`)

### 2. 구조 설계 활동 수행

`.cursor/agents/` 디렉토리에 있는 명령어를 사용하여 구조 설계 활동을 수행합니다.

#### 주요 명령어

**Phase 1: 시스템 정의**

- `system-definer`: 시스템 정의 (`system.md` 생성)
- `business-analyzer`: 비즈니스 분석 (`business.md` 생성)

**Phase 2: 기능 명세**

- `usecase-extractor`: Use Case 추출 (`usecases.md` 생성)
- `usecase-specifier`: Use Case 상세 명세 (`usecase/UC-nnn.md` 생성)

**Phase 3: 도메인 모델 정립**

- `domain-modeler`: 도메인 모델 설계 (`domain/model.md` 생성)

**Phase 4: 품질 요구사항 선정**

- `quality-elicitor`: 품질 시나리오 도출 (`quality/scenarios.md` 생성)
- `quality-specifier`: 품질 시나리오 상세 명세 (`quality/QS-nnn.md` 생성)
- `quality-evaluator`: 품질 시나리오 평가 (`quality/evaluations.md` 생성)
- `quality-selector`: 품질 요구사항 선정 (`qualities.md` 생성)

**Phase 5: 후보 구조 설계** (`candidate/candidates.md` 생성)

- `performance-architect`: 성능 관련 후보 구조 설계 (`candidate/QS-nnn-{title}.md` 생성)
- `modifiability-architect`: 변경 용이성 관련 후보 구조 설계 (`candidate/QS-nnn-{title}.md` 생성)
- `msa-architect`: 마이크로서비스 아키텍처 후보 설계 (`candidate/msa.md` 생성)
- `package-architect`: 패키지/레이어 후보 구조 설계 (`candidate/packages.md` 생성)
- `solution-architect`: 솔루션 후보 구조 설계 (`candidate/solutions.md` 생성)
- `framework-architect`: 프레임워크 후보 구조 설계 (`candidate/frameworks.md` 생성)

**Phase 6: 최종 구조 설계**

- `candidate-evaluator`: 후보 구조 평가 (`decision/evaluations.md` 생성)
- `system-architect`: 배치 구조 통합 (`architecture/deployment.md` 생성)
- `module-architect`: 모듈 구조 통합 (`architecture/module.md` 생성)

**Phase 7: 구조 명세**

- `architecture-specifier`: 최종 구조 명세 (`architecture.md` 생성)

**Phase 8: 구조 평가**

- `architecture-analyzer`: 구조적 의사결정 식별 (`evaluation/decisions.md` 생성)
- `architecture-evaluator`: 구조 평가 (`evaluation/evaluation.md` 생성)

**Phase 9: 코드 생성**

- `work-assigner`: 소스 코드 구조 및 AGENTS.md 생성
- `code-generator`: 소스 코드 생성

## Count 통합 관리 시스템 사례

이 프로젝트는 **Count 통합 관리 시스템**을 사례로 사용하여 구조 설계 활동의 전체 과정을 보여줍니다.

### 사례 개요

Count 통합 관리 시스템은 다양한 서비스에서 발생하는 Count 데이터를 중앙에서 통합 관리하는 마이크로서비스 기반 시스템입니다.

**주요 특징**:

- 마이크로서비스 아키텍처
- CQRS 패턴 (Command와 Query 분리)
- 이벤트 기반 통신 (Kafka)
- 컨테이너 기반 배포 (Docker, Kubernetes)
- 실시간 대시보드 (SSE)

### 설계 산출물

Count 통합 관리 시스템의 설계 산출물은 `count/arch/` 디렉토리에 저장되어 있습니다:

```
count/arch/
├── system.md                    # 시스템 정의
├── business.md                  # 비즈니스 요구사항
├── usecases.md                  # Use Case 목록
├── qualities.md                 # 선정된 품질 요구사항
├── architecture.md              # 최종 구조 문서
├── usecase/                     # Use Case 상세 명세
│   ├── UC-001-Count 저장.md
│   ├── UC-002-Count 조회.md
│   ├── UC-003-Count 관리.md
│   ├── UC-004-Count 분석.md
│   └── UC-005-Count 모니터링.md
├── domain/                      # 도메인 모델
│   ├── model.md                 # 통합 도메인 모델
│   └── UC-*.md                  # UC별 도메인 분석
├── quality/                     # 품질 요구사항
│   ├── scenarios.md             # 품질 시나리오 목록
│   ├── evaluations.md           # 품질 시나리오 평가
│   └── QS-*.md                  # 개별 품질 시나리오
├── candidate/                   # 후보 구조
│   ├── candidates.md            # 후보 구조 목록
│   └── *.md                     # 개별 후보 구조
├── decision/                    # 설계 결정
│   ├── decisions.md             # 채택된 후보 구조
│   └── evaluations.md           # 후보 구조 평가 결과
├── architecture/                # 최종 구조
│   ├── deployment.md            # 배치 구조
│   └── module.md                # 모듈 구조
└── evaluation/                  # 구조 평가
    ├── decisions.md             # 명세된 설계 결정 목록
    └── evaluation.md            # 최종 평가 보고서
```

### 생성된 소스 코드

생성된 소스 코드는 `count/src/` 디렉토리에 저장되어 있습니다:

```
count/src/
├── AGENTS.md                    # 전체 프로젝트 관리
├── package.json                 # 루트 패키지 설정
├── tsconfig.json                # TypeScript 설정
├── README.md                    # 프로젝트 문서
├── common/                      # 공통 모듈
│   ├── AGENTS.md
│   ├── count-info/              # CountInfo 도메인 공통 모듈
│   └── count-value/             # CountValue 도메인 공통 모듈
├── count-write-service/         # Count 저장 서비스
├── count-read-service/          # Count 조회 서비스
├── count-management-service/    # Count 관리 서비스
├── count-analysis-service/      # Count 분석 서비스
├── dashboard-provision-service/ # 대시보드 제공 서비스
├── dashboard-update-service/     # 대시보드 갱신 서비스
└── k8s/                         # Kubernetes 배포 파일
```

**자세한 내용은 [`count/src/README.md`](count/src/README.md)를 참조하세요.**

### 설계 프로세스 예시

Count 통합 관리 시스템의 설계는 다음과 같은 순서로 진행되었습니다:

1. **시스템 정의**: Count 통합 관리 시스템의 목적과 범위 정의
2. **기능 명세**: 5개의 주요 Use Case 추출 및 상세 명세
3. **도메인 모델 정립**: CountInfo, CountValue 등 도메인 컴포넌트 식별
4. **품질 요구사항 선정**: 성능, 변경 용이성, 가용성 등 19개 품질 시나리오 도출 및 평가
5. **후보 구조 설계**: 성능 최적화, 변경 용이성, MSA 등 다양한 후보 구조 설계
6. **최종 구조 설계**: CQRS 패턴, 마이크로서비스 아키텍처 채택
7. **구조 명세**: 최종 아키텍처 문서 작성
8. **구조 평가**: 품질 요구사항 만족도 평가

## 워크플로우 상세

구조 설계 활동의 전체 워크플로우는 [`.cursor/agents/doc/workflow.md`](.cursor/agents/doc/workflow.md)에 상세히 명세되어 있습니다.

1. **Phase 1: 시스템 정의** - 시스템과 비즈니스 드라이버 정의

    ```
    /system-definer 서비스에서 발생하는 count를 통합 관리하는 시스템을 개발하는 과제를 정의해줘.
    /business-analyzer 핵심 비즈니스 드라이버를 식별해줘.
    ```

2. **Phase 2: 기능 명세** - Use Case 추출 및 상세 명세

    ```
    /usecase-extractor 중요한 Use Case를 식별해줘.
    /usecase-specifier UC-001의 상세 명세를 작성해줘.
    ```

3. **Phase 3: 도메인 모델 정립** - 도메인 컴포넌트 식별 및 통합

    ```
    /domain-modeler Use Case를 분석해서 도메인 모델을 정립해줘.
    ```

4. **Phase 4: 품질 요구사항 선정** - 품질 시나리오 도출, 평가, 선정

    ```
    /quality-elicitor 품질 시나리오를 생성해줘.
    /quality-specifier QS-001의 상세 명세를 작성해줘.
    /quality-evaluator 품질 시나리오를 평가해줘.
    /quality-selector 품질 요구사항을 선정해줘.
    ```

5. **Phase 5: 후보 구조 설계[동작 측면]** - 채택 가능한 후보 구조 설계

    ```
    /msa-architect msa 관점에서 후보 구조를 설계해줘.
    /performance-architect QS-001을 분석하고 후보 구조를 설계해줘.
    /solution-architect 후보 구조를 분석하고 채택 가능한 솔루션 후보 구조를 설계해줘.
    ```

6. **Phase 6: 최종 구조 설계[동작 측면]** - 후보 평가 및 최종 구조 통합

    ```
    /candidate-evaluator 동작 측면의 후보 구조를 평가하고 채택 여부를 결정해줘
    /system-architect 채택된 후보 구조를 근거로 동작 측면의 최종 구조를 설계해줘
    ```

7. **Phase 5: 후보 구조 설계[개발 측면]** - 채택 가능한 후보 구조 설계

    ```
    /package-architect 패키지/레이어 구성에 관한 후보 구조를 설계해줘.
    /modifiability-architect QS-008을 분석하고 후보 구조를 설계해줘.
    /framework-architect 후보 구조를 분석하고 개발을 위한 프레임워크 후보 구조를 설계해줘.
    ```

8. **Phase 6: 최종 구조 설계[개발 측면]** - 후보 평가 및 최종 구조 통합

    ```
    /candidate-evaluator 개발 측면의 후보 구조를 평가하고 채택 여부를 결정해줘
    /module-architect 채택된 후보 구조를 근거로 개발 측면의 최종 구조를 설계해줘
    ```

9. **Phase 7: 구조 명세** - 최종 구조 종합 문서 작성

    ```
    /architecture-specifier 설계된 구조의 통합 명세서를 작성해줘.
    ```

10. **Phase 8: 구조 평가** - 최종 구조의 품질 요구사항 만족도 평가

    ```
    /architecture-analyzer 명세된 구조를 분석하고 구조적 의사결정을 식별해줘.
    /architecture-evaluator 명세된 구조를 평가해줘.
    ```

11. **Phase 9: 코드 생성** - 설계된 구조를 기반으로 소스 코드 생성

    ```
    /work-assigner 설계된 구조를 기반으로 소스 구조와 AGENTS.md 파일을 생성해줘.
    /code-generator 설계된 구조를 기반으로 코드를 생성해줘.
    ```

## 참고 자료

- [구조 설계 워크플로우](.cursor/agents/doc/workflow.md) - 전체 워크플로우 상세 명세

## 라이선스

이 프로젝트는 Apache License 2.0 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

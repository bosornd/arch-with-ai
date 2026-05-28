# Kubernetes 배포 관리 에이전트 명세

## 개요

이 문서는 `k8s/` 디렉토리의 Kubernetes 배포 설정을 관리하는 에이전트의 역할과 책임을 정의합니다. 이 에이전트는 인프라 컴포넌트와 애플리케이션 서비스의 Kubernetes 매니페스트를 생성하고 관리합니다.

## 역할과 책임

### 주요 역할

- Kubernetes 배포 매니페스트 생성 및 관리
- 인프라 컴포넌트 배포 설정 (PostgreSQL, Redis, Kafka)
- 서비스 배포 설정 관리
- ConfigMap 및 Secret 관리
- 배포 스크립트 관리

### 책임 범위

- **포함**:
  - Deployment/StatefulSet YAML 생성
  - Service YAML 생성
  - ConfigMap 및 Secret 생성
  - PVC 생성
  - Ingress 설정
  - 배포/제거 스크립트
  - 데이터베이스 초기화 Job
- **제외**:
  - 서비스 코드 생성 (각 서비스 에이전트의 책임)
  - Dockerfile 생성 (각 서비스 에이전트의 책임)

## 입력과 출력

### 입력

- `count/arch/architecture/deployment.md` (배치 구조)
- 각 서비스의 Dockerfile
- 환경 설정 요구사항

### 출력

- `namespace.yaml`
- `configmap/` 디렉토리
- `secret/` 디렉토리
- `persistentvolumeclaims/` 디렉토리
- `statefulsets/` 디렉토리
- `deployments/` 디렉토리
- `services/` 디렉토리
- `ingress/` 디렉토리
- `jobs/` 디렉토리 (데이터베이스 초기화)
- `deploy.sh`, `deploy.ps1`
- `undeploy.sh`, `undeploy.ps1`
- `build-images.sh`, `build-images.ps1`

## 관리 대상

### 인프라 컴포넌트

1. PostgreSQL (CountInfoDB, DashboardConfigDB)
2. Redis Value (CountValueDB)
3. Redis Replica (Read Replica)
4. Redis Cache (캐싱 레이어)
5. Zookeeper
6. Kafka

### 애플리케이션 서비스

1. count-write-service
2. count-read-service
3. count-management-service
4. count-analysis-service
5. dashboard-provision-service
6. dashboard-update-service

## 코드 생성/수정 규칙

### 1. 네임스페이스 규칙

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: count-system
  labels:
    app: count-system
    environment: production
```

**규칙**:
- 네임스페이스명: `count-system`
- 모든 리소스는 이 네임스페이스에 배포
- 라벨로 환경 구분 가능하도록 설정

### 2. Deployment 작성 규칙

```yaml
# deployments/count-write-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: count-write-service
  namespace: count-system
  labels:
    app: count-write-service
    service: api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: count-write-service
  template:
    metadata:
      labels:
        app: count-write-service
    spec:
      containers:
      - name: count-write-service
        image: count-write-service:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: database.url
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: redis.url
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
```

**규칙**:
- 모든 Deployment는 `count-system` 네임스페이스에 배포
- 레이블은 `app: {service-name}` 형식
- 리소스 제한 설정 필수
- 헬스체크 설정 필수 (`/health`, `/ready`)
- 환경 변수는 ConfigMap 또는 Secret 사용
- 이미지 태그는 버전 관리 가능하도록 설정

### 3. StatefulSet 작성 규칙

```yaml
# statefulsets/postgresql.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgresql
  namespace: count-system
spec:
  serviceName: postgresql
  replicas: 1
  selector:
    matchLabels:
      app: postgresql
  template:
    metadata:
      labels:
        app: postgresql
    spec:
      containers:
      - name: postgresql
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: postgresql-secret
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgresql-secret
              key: password
        volumeMounts:
        - name: postgresql-data
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgresql-data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 10Gi
```

**규칙**:
- StatefulSet은 데이터베이스에만 사용
- `volumeClaimTemplates` 사용
- `serviceName` 필수
- PVC는 `persistentvolumeclaims/` 디렉토리에 별도 정의 가능

### 4. Service 작성 규칙

```yaml
# services/count-write-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: count-write-service
  namespace: count-system
  labels:
    app: count-write-service
spec:
  type: ClusterIP
  ports:
  - port: 3000
    targetPort: 3000
    protocol: TCP
    name: http
  selector:
    app: count-write-service
```

**규칙**:
- Service 이름은 Deployment 이름과 동일
- `ClusterIP` 타입 사용 (내부 통신)
- 포트는 서비스별로 고유
- Selector는 Deployment의 레이블과 일치

### 5. ConfigMap 작성 규칙

```yaml
# configmap/app-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: count-system
data:
  database.url: "postgresql://postgresql:5432/countinfo"
  redis.url: "redis://redis-value:6379"
  redis.replica.url: "redis://redis-replica:6379"
  redis.cache.url: "redis://redis-cache:6379"
  kafka.brokers: "kafka:9092"
```

**규칙**:
- 민감하지 않은 설정만 포함
- 키는 점(.)으로 구분된 계층 구조
- 값은 문자열로 저장
- 서비스별 ConfigMap 분리 가능

### 6. Secret 작성 규칙

```yaml
# secret/postgresql-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgresql-secret
  namespace: count-system
type: Opaque
stringData:
  username: countuser
  password: countpassword
```

**규칙**:
- 민감한 정보만 포함
- `stringData` 사용 (base64 인코딩 불필요)
- 실제 운영 환경에서는 외부 시크릿 관리 시스템 사용 권장
- 템플릿으로 제공하고 실제 값은 배포 시 주입

### 7. PVC 작성 규칙

```yaml
# persistentvolumeclaims/postgresql-pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgresql-data
  namespace: count-system
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: standard
```

**규칙**:
- StatefulSet과 함께 사용
- `accessModes`는 데이터베이스 특성에 맞게 설정
- `storageClassName` 명시
- 용량은 적절히 설정

### 8. Ingress 작성 규칙

```yaml
# ingress/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: count-system-ingress
  namespace: count-system
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: count-system.local
    http:
      paths:
      - path: /api/v1/counts
        pathType: Prefix
        backend:
          service:
            name: count-write-service
            port:
              number: 3000
      - path: /api/v1/counts
        pathType: Prefix
        backend:
          service:
            name: count-read-service
            port:
              number: 3001
      - path: /management
        pathType: Prefix
        backend:
          service:
            name: count-management-service
            port:
              number: 3002
```

**규칙**:
- 호스트 기반 라우팅
- 경로 기반 라우팅
- 서비스별 경로 매핑
- Ingress Controller 어노테이션 사용

### 9. Job 작성 규칙

```yaml
# jobs/postgresql-init.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: postgresql-init
  namespace: count-system
spec:
  template:
    spec:
      containers:
      - name: postgresql-init
        image: postgres:15-alpine
        command:
        - /bin/sh
        - -c
        - |
          psql -h postgresql -U $POSTGRES_USER -d postgres <<EOF
          CREATE DATABASE IF NOT EXISTS countinfo;
          CREATE DATABASE IF NOT EXISTS dashboardconfig;
          EOF
        env:
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: postgresql-secret
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgresql-secret
              key: password
      restartPolicy: OnFailure
```

**규칙**:
- 데이터베이스 초기화에 사용
- `restartPolicy: OnFailure` 설정
- 완료 후 자동 삭제되지 않도록 설정 가능

### 10. 배포 스크립트 규칙

#### deploy.sh / deploy.ps1

```bash
#!/bin/bash
# deploy.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Count 통합 관리 시스템 배포 시작 ==="

# 1. 네임스페이스 생성
kubectl apply -f "${SCRIPT_DIR}/namespace.yaml"

# 2. ConfigMap 및 Secret 생성
kubectl apply -f "${SCRIPT_DIR}/configmap"
kubectl apply -f "${SCRIPT_DIR}/secret"

# 3. PVC 생성
kubectl apply -f "${SCRIPT_DIR}/persistentvolumeclaims"

# 4. 인프라 컴포넌트 배포
kubectl apply -f "${SCRIPT_DIR}/statefulsets/postgresql.yaml"
kubectl apply -f "${SCRIPT_DIR}/services/postgresql-service.yaml"
# ... 다른 인프라 컴포넌트

# 5. 데이터베이스 초기화 Job 실행
kubectl apply -f "${SCRIPT_DIR}/jobs/postgresql-init.yaml"
kubectl wait --for=condition=complete job/postgresql-init -n count-system --timeout=300s

# 6. 애플리케이션 서비스 배포
kubectl apply -f "${SCRIPT_DIR}/deployments"
kubectl apply -f "${SCRIPT_DIR}/services"

# 7. Ingress 배포 (선택적)
if [ "$1" == "--with-ingress" ]; then
  kubectl apply -f "${SCRIPT_DIR}/ingress"
fi

echo "=== 배포 완료 ==="
```

**규칙**:
- 순차적 배포 순서 준수
- 에러 발생 시 중단 (`set -e`)
- 각 단계별 확인 메시지
- 옵션으로 Ingress 포함 가능

#### build-images.sh / build-images.ps1

```bash
#!/bin/bash
# build-images.sh

set -e

REGISTRY=${REGISTRY:-""}
VERSION=${VERSION:-"latest"}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "${SCRIPT_DIR}")"

build_image() {
  local service=$1
  local image_name="${REGISTRY}${service}:${VERSION}"
  
  echo "Building ${image_name}..."
  docker build -f "${ROOT_DIR}/${service}/Dockerfile" -t "${image_name}" "${ROOT_DIR}"
}

# 공통 모듈 먼저 빌드 (의존성)
# 서비스 빌드
build_image "count-write-service"
build_image "count-read-service"
# ... 다른 서비스
```

**규칙**:
- 루트 디렉토리를 빌드 컨텍스트로 사용
- 공통 모듈 의존성 고려
- 레지스트리 및 버전 지정 가능
- 각 이미지 빌드 로그 출력

### 11. 네이밍 컨벤션

- **파일명**: kebab-case (예: `count-write-service.yaml`)
- **리소스명**: kebab-case (예: `count-write-service`)
- **레이블**: `app: {service-name}`
- **네임스페이스**: `count-system`

### 12. 리소스 제한 규칙

#### 서비스별 리소스 제한 가이드

| 서비스 | Requests | Limits |
|--------|----------|--------|
| count-write-service | CPU: 100m, Memory: 256Mi | CPU: 500m, Memory: 512Mi |
| count-read-service | CPU: 100m, Memory: 256Mi | CPU: 500m, Memory: 512Mi |
| count-management-service | CPU: 100m, Memory: 256Mi | CPU: 500m, Memory: 512Mi |
| count-analysis-service | CPU: 200m, Memory: 512Mi | CPU: 1000m, Memory: 1Gi |
| dashboard-provision-service | CPU: 100m, Memory: 256Mi | CPU: 500m, Memory: 512Mi |
| dashboard-update-service | CPU: 100m, Memory: 256Mi | CPU: 500m, Memory: 512Mi |

**규칙**:
- 모든 서비스에 리소스 제한 설정
- Requests는 최소 보장 리소스
- Limits는 최대 사용 가능 리소스
- 분석 서비스는 더 많은 리소스 할당

## 활동 절차

### 1. 네임스페이스 설정

1. `namespace.yaml` 생성
2. 라벨 설정

### 2. ConfigMap 및 Secret 생성

1. 애플리케이션 설정 ConfigMap 생성
2. 데이터베이스 연결 정보 Secret 생성
3. Kafka 설정 ConfigMap 생성

### 3. PVC 생성

1. PostgreSQL PVC 생성
2. Redis PVC 생성

### 4. 인프라 컴포넌트 배포 설정

1. PostgreSQL StatefulSet 및 Service 생성
2. Redis StatefulSet 및 Service 생성 (Value, Replica, Cache)
3. Zookeeper Deployment 및 Service 생성
4. Kafka Deployment 및 Service 생성

### 5. 데이터베이스 초기화 Job

1. PostgreSQL 데이터베이스 생성 Job 생성
2. 초기화 스크립트 작성

### 6. 애플리케이션 서비스 배포 설정

1. 각 서비스별 Deployment 생성
2. 각 서비스별 Service 생성
3. 리소스 제한 설정
4. 헬스체크 설정

### 7. Ingress 설정

1. Ingress 규칙 정의
2. 라우팅 설정

### 8. 배포 스크립트 생성

1. `deploy.sh`/`deploy.ps1` 생성
2. `undeploy.sh`/`undeploy.ps1` 생성
3. `build-images.sh`/`build-images.ps1` 생성

## 배포 순서

1. 네임스페이스 생성
2. ConfigMap 및 Secret 생성
3. PVC 생성
4. 인프라 컴포넌트 배포 (PostgreSQL, Redis, Zookeeper, Kafka)
5. 데이터베이스 초기화 Job 실행 및 완료 대기
6. 애플리케이션 서비스 배포

## 참조 문서

- `count/arch/architecture/deployment.md` (배치 구조, 커넥터 정의)
- `count/src/README.md` (배포 가이드)
- 각 서비스/AGENTS.md (서비스별 구조 확인)

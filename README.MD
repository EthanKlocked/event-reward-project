# 이벤트/보상 관리 플랫폼

NestJS와 MongoDB 기반의 마이크로서비스 아키텍처로 구현된 이벤트/보상 관리 플랫폼입니다. 사용자 이벤트 조건 달성 확인 및 보상 자동화 시스템을 제공합니다.

## 프로젝트 구조

```
event-reward-project/
├── docker-compose.yml
├── gateway-server/
│   ├── Dockerfile
│   ├── src/
│   └── ...
├── auth-server/
│   ├── Dockerfile
│   ├── src/
│   └── ...
└── event-server/
    ├── Dockerfile
    ├── src/
    └── ...
```

## 아키텍처 설계

본 프로젝트는 MSA(Microservice Architecture) 패턴에 따라 3개의 독립적인 서버로 구성되어 있습니다:

1. **Gateway Server (포트: 3000)**

   - 모든 API 요청의 진입점
   - 인증 및 권한 검사
   - 적절한 서비스로 요청 라우팅
   - API 문서화 (Swagger)
   - 통합 로깅 시스템 (Winston)

2. **Auth Server (포트: 3001)**

   - 사용자 관리 (등록, 조회)
   - 인증 (로그인, 토큰 발급)
   - 역할 관리 (USER, OPERATOR, AUDITOR, ADMIN)
   - 포트 미노출

3. **Event Server (포트: 3002)**
   - 이벤트 관리 (등록, 조회, 수정)
   - 보상 관리 (등록, 조회)
   - 보상 요청 처리 (검증, 승인, 거절)
   - 보상 지급 이력 관리
   - 포트 미노출

각 서버는 독립적인 MongoDB 데이터베이스에 연결되어 있으며, HTTP를 통해 통신합니다.

## 주요 기능

### 1. 사용자 인증 및 권한 관리

- JWT 기반 인증
- 역할 기반 접근 제어 (RBAC)
- 역할별 권한:
  - **USER**: 보상 요청 가능
  - **OPERATOR**: 이벤트/보상 등록 및 보상 요청 처리
  - **AUDITOR**: 보상 이력 조회만 가능
  - **ADMIN**: 모든 기능 접근 가능

### 2. 이벤트 관리

- 이벤트 생성, 조회, 수정
- 이벤트 조건 및 기간 설정
- 자동/수동 검증 유형 지정

### 3. 보상 관리

- 이벤트별 보상 정의
- 다양한 보상 유형 지원 (포인트, 아이템, 쿠폰)
- 보상별 수량 설정

### 4. 보상 요청 및 검증

- 사용자의 보상 요청 처리
- 이벤트 조건 달성 자동/수동 검증
- 중복 요청 방지

### 5. 보상 이력 관리

- 보상 지급 이력 기록
- 역할별 이력 조회 권한 관리

## 기술 스택

- **Backend**: Node.js 18, NestJS
- **Database**: MongoDB
- **인증**: JWT
- **API 문서화**: Swagger
- **로깅**: Winston
- **컨테이너화**: Docker, Docker Compose
- **테스트**: Jest
- **언어**: TypeScript

## 설치 및 실행 방법

### Docker Compose를 사용한 실행 (권장)

1. 레포지토리 클론

```bash
git clone https://github.com/EthanKlocked/event-reward-project.git
cd event-reward-project
```

2. Docker Compose로 실행

```bash
docker-compose up -d
```

3. 서비스 접속

   - Gateway API 및 Swagger 문서: http://localhost:3000/api/docs

   > 참고: Auth Server와 Event Server는 Docker Compose 설정에서 외부로 포트가 노출되지 않아 직접 접근할 수 없습니다. Gateway Server를 통해 모든 API에 접근하세요.

### 로컬 개발 환경 설정

각 서버를 개별적으로 실행하여 개발하는 방법입니다.

1. MongoDB 설치 및 실행

```bash
# MongoDB가 설치되어 있지 않은 경우 설치 필요
# 또는 Docker로 MongoDB 실행
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

2. 환경 변수 설정

```bash
# 각 서버 디렉토리에서 .env.sample 파일을 복사하여 .env.dev 생성
cp auth-server/.env.sample auth-server/.env.dev
cp event-server/.env.sample event-server/.env.dev
cp gateway-server/.env.sample gateway-server/.env.dev

# 각 .env.dev 파일을 열어 MongoDB 연결 정보 등 실제 환경에 맞게 수정
```

3. 각 서버 설치 및 실행

```bash
# Auth Server
cd auth-server
npm install
npm run start:dev:env  # .env.dev 환경 변수 사용

# 새 터미널에서 Event Server
cd event-server
npm install
npm run start:dev:env

# 새 터미널에서 Gateway Server
cd gateway-server
npm install
npm run start:dev:env
```

## 테스트 실행

프로젝트에는 주요 기능에 대한 테스트가 구현되어 있습니다.

### 구현된 테스트 실행

```bash
# Gateway 서버 인증 통합 테스트
cd gateway-server
npx jest test/auth.integration.spec.ts

# Event 서버 이벤트 서비스 단위 테스트
cd event-server
npx jest events/events.service.spec.ts
```

## API 문서 및 테스트

본 프로젝트는 Swagger를 통해 모든 API 엔드포인트가 문서화되어 있습니다. Swagger UI를 통해 직접 API를 테스트할 수 있습니다.

### Swagger 문서 접속 방법

- **Gateway API 문서**: http://localhost:3000/api/docs
  - 모든 서비스의 통합 API 문서
  - 실제 서비스 테스트를 위한 메인 엔드포인트
  - 인증 토큰 설정 및 모든 API 테스트 가능

### Swagger를 이용한 API 테스트 방법

1. Gateway API 문서 (http://localhost:3000/api/docs)에 접속
2. `/auth/register`에서 사용자 계정 생성
3. `/auth/login`에서 로그인 후 JWT 토큰 획득
4. 화면 상단의 'Authorize' 버튼 클릭
5. JWT 토큰 입력 (Bearer 제외: `YOUR_JWT_TOKEN`)
6. 이후 모든 API 엔드포인트를 권한에 맞게 테스트 가능

### API 사용 시나리오 예시

1. OPERATOR 계정으로 로그인하여 이벤트 및 보상 등록
2. USER 계정으로 로그인하여 보상 요청
3. OPERATOR 계정으로 보상 요청 처리 (수동 검증 이벤트의 경우) (자동 검증 이벤트는 요청 즉시 COMPLETE 처리됩니다. / 구체적인 검증 로직은 validator 내부 구현 예정입니다.)
4. AUDITOR 계정으로 로그인하여 보상 이력 조회

## 데이터베이스 초기화 방법

개발 중 데이터베이스를 초기화해야 할 경우, Docker의 볼륨을 삭제하는 방법을 사용할 수 있습니다.

```bash
# 먼저 컨테이너 중지
docker-compose down

# MongoDB 볼륨 삭제
docker volume rm event-reward-project_mongo_data

# 다시 시작
docker-compose up -d
```

## 설계 고려사항 및 결정

### 1. 마이크로서비스 아키텍처 선택

- 각 서비스의 독립적인 개발, 배포, 확장이 가능하도록 MSA 채택
- API Gateway 패턴을 통한 중앙화된 인증 및 라우팅
- 서비스 간 HTTP 통신으로 단순성 유지

### 2. 이벤트 조건 검증 시스템

- Factory 패턴을 활용한 확장 가능한 검증 시스템 구현
- 현재 지원하는 이벤트 조건 유형:
  - `LOGIN_DAYS`: 연속 로그인 일수
  - `INVITE_FRIENDS`: 친구 초대 수
- 새로운 조건 유형을 쉽게 추가할 수 있는 구조

### 3. 보상 처리 흐름

- 자동 검증(`AUTO`) / 수동 검증(`MANUAL`) 옵션 제공
- 중복 요청 방지 및 조건 충족 여부 검증
- 요청 상태 관리 (`PENDING`, `APPROVED`, `REJECTED`, `COMPLETED`)

### 4. 확장 가능성

- 이벤트 및 보상 유형은 쉽게 확장 가능
- 실제 보상 지급 로직은 향후 확장될 수 있도록 설계
- 외부 시스템 연동 포인트 마련

## 추가 개발 예정 사항

1. 실제 이벤트 조건 검증 로직 구현 (현재는 샘플 구현)
2. 보상 지급 후 실제 리소스 반영 로직 구현
3. 이벤트 및 보상 삭제 기능 추가
4. 대시보드 및 모니터링 시스템 구현
5. 더 광범위한 테스트 케이스 추가
6. 태스크 큐를 통한 내부 컨테이너 간 통신구현
7. Redis 등 인메모리 캐시 컨테이너 활용하여 서비스 개선
8. 내부 CertBot 컨테이너 세팅하여 외부 볼륨마운트를 통해 자동 인증서 갱신

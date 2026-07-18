# AutoForge Robotics

현재 구현 범위와 실제 엔진·로봇 연동의 경계는 [완성도 감사](docs/COMPLETION_AUDIT.md)에 정리되어 있습니다.

브라우저 검증은 `npm run test:browser`로 실행합니다. 최초 실행 환경에서는 `npx playwright install --with-deps chromium`이 필요하며 CI가 이를 자동 설치합니다.

요구사항 입력부터 차량 콘셉트, 파라메트릭 설계, 시뮬레이션, 최적화, 로봇 검증, BOM과 승인 게이트까지 연결하는 자율형 자동차 개발 플랫폼 MVP입니다.

## 실행

```bash
npm install
npm run build
npm start
```

`http://localhost:4174`에서 프로덕션 앱과 API가 함께 실행됩니다. UI를 개발할 때는 별도 터미널에서 아래 두 명령을 실행합니다.

```bash
npm run api
npm run dev
```

## 검증

```bash
npm test
npm run build
```

## 구현 범위

- 프로젝트 스튜디오와 자연어 요구사항 입력
- 설계 그래프: Requirement → Design → Simulation → Change → Approval
- 콘셉트 랩의 차량 파라미터 및 CMF 편집
- 차량 시스템 아키텍처의 드래그 가능한 블록 편집기
- 결정론적 중량·주행거리·원가·공력 추정 엔진
- 공력·열·구조·주행 시뮬레이션 실행 계약
- 다목적 최적화와 파레토 후보 UI
- 로봇 제작·시험 셀 모니터
- 디지털 트윈 텔레메트리
- BOM·원가·공급 위험 관리
- 에이전트 실행, 승인 게이트, 변경 이력, 보고서 API

## API

| Method | Endpoint | 역할 |
|---|---|---|
| GET | `/api/projects/:id/graph` | 프로젝트 설계 그래프 |
| POST | `/api/designs/estimate` | 차량 성능 추정 |
| POST | `/api/designs` | 설계 버전 생성 |
| POST | `/api/runs` | 자율 설계 루프 시작 |
| GET | `/api/runs/:id` | 설계 루프 진행 |
| POST | `/api/simulations` | 시뮬레이션 실행 |
| POST/PATCH | `/api/approvals` | 승인 게이트 처리 |
| GET | `/api/reports/:projectId` | 개발 보고서 내보내기 |

`server/engines.js`의 실행 계약은 이후 FreeCAD/OpenCascade, OpenFOAM, CalculiX, CARLA와 연결할 수 있고, 에이전트/로봇 실행 계약은 MCP Gateway 및 ROS 2 Action 어댑터로 대체할 수 있습니다.

## 데이터와 권한

- 런타임 데이터는 기본적으로 `data/autoforge.json`에 원자적으로 저장됩니다.
- 저장 위치는 `AUTOFORGE_DATA_DIR` 환경 변수로 변경할 수 있습니다.
- 모든 API 호출은 사용자, 역할, 경로, 결과 코드와 요청 ID를 감사 로그에 기록합니다.
- 로컬 개발은 `admin` 역할이 기본이며, 운영에서는 `AUTOFORGE_REQUIRE_AUTH=true`로 익명 쓰기를 차단합니다.
- 연동 클라이언트는 `x-autoforge-user`, `x-autoforge-role` 헤더를 사용합니다.
- 역할: `viewer`, `designer`, `reviewer`, `safety_officer`, `site_manager`, `admin`.
- 승인 요청 생성자는 자신의 요청을 직접 승인할 수 없습니다.

자연어 요구사항은 `/api/requirements/refine`에서 정량 목표, 검증 방법, 신뢰도로 구조화되며 `/api/requirements/conflicts`에서 절대 충돌과 성능·원가 상충 위험을 탐지합니다.

## 비동기 오케스트레이션

`POST /api/runs`는 다음 의존성 그래프를 영속 작업 큐에 등록합니다.

```text
요구사항 정제 → 설계 생성 → CAD 생성 → 제조 규칙 검사
→ 저비용 근사 해석 → 공력 해석 → 제조 가능성 검토
```

- 동시 실행 수 제한, 우선순위, 최대 재시도와 수동 재실행을 지원합니다.
- 서버 중단 당시 `running` 작업은 재시작 시 `queued` 상태로 복구됩니다.
- 실패·차단·취소된 상위 작업은 종속 작업을 자동 차단합니다.
- `/api/jobs`, `/api/runs/:id/events`에서 작업과 증거 이벤트를 조회할 수 있습니다.
- CAD, 시뮬레이션, 제조, ROS 2는 `server/adapters.js`의 공통 실행 계약을 사용합니다.
- 로봇 어댑터는 S4 승인과 비상정지·셀 안전 인터록 없이는 명령을 거부합니다.

## 실시간 추적성과 모델 보정

- `/api/runs/:id/stream`: 작업 상태와 결과를 전달하는 SSE 스트림
- `/api/projects/:id/knowledge-graph`: 프로젝트의 요구사항·목표·설계·해석·증거·변경·승인 그래프
- `/api/projects/:id/impact/:nodeId`: 특정 요구사항이나 설계 변경의 다단계 영향 분석
- `/api/calibrations`: 가상 예측과 실측 결과의 오차 분류 및 모델 보정
- `/api/models`: 보정 계수, 버전과 신뢰도를 포함한 모델 레지스트리
- `/api/metrics`: 큐 성공률, 평균 작업 시간, 실행·증거·감사 메트릭
- `/api/ready`: 프로젝트, 모델 레지스트리와 장기 실행 작업을 확인하는 준비 상태 진단

Sim-to-Real 보정은 오차 수준에 따라 `trusted`, `calibrate`, `additional_test`, `investigate`로 분류하고 보정 전후 파라미터와 시험 계보를 영속 저장합니다.

## 운영 인증과 멀티테넌시

운영 인증을 활성화하려면 다음 환경 변수를 사용합니다.

```bash
AUTOFORGE_REQUIRE_AUTH=true npm start
```

초기 개발 계정은 `lead@autoforge.local`이며 기본 비밀번호는 `autoforge-demo`입니다. 배포 환경에서는 `AUTOFORGE_DEMO_PASSWORD`로 반드시 교체해야 합니다. 비밀번호는 PBKDF2로, 세션 토큰은 SHA-256으로 저장됩니다. 인증된 사용자의 역할은 조직 멤버십에서 결정되고 다른 조직의 프로젝트는 존재 여부도 노출하지 않습니다.

## 아티팩트와 외부 엔진

- `/api/artifacts`: CAD, 메시, 보고서와 센서 파일을 SHA-256 콘텐츠 주소 방식으로 저장
- 다운로드 전 파일 해시를 다시 계산해 무결성 검증
- `AUTOFORGE_ARTIFACT_DIR`: 아티팩트 저장 위치 변경
- `/api/sandbox/run`: 등록된 실행 파일만 `shell:false` 격리 작업 디렉터리에서 실행
- 실행 시간과 출력 크기 제한, NUL 인자 및 미등록 명령 차단
- `AUTOFORGE_FREECAD_BIN`, `AUTOFORGE_OPENFOAM_BIN`: 설치된 엔진의 절대 경로 등록

## 배포

```bash
cp .env.example .env
# AUTOFORGE_DEMO_PASSWORD를 안전한 값으로 변경
docker compose up --build -d
```

컨테이너는 비루트 사용자, 모든 Linux capability 제거, 읽기 전용 루트 파일시스템으로 실행됩니다. 데이터와 아티팩트만 `/var/lib/autoforge` 볼륨에 기록합니다. `/api/health`는 프로세스 상태, `/api/ready`는 프로젝트·모델·작업 큐 준비 상태를 확인합니다. 종료 신호를 받으면 큐를 중지하고 데이터를 저장한 뒤 연결을 종료합니다.

API 계약은 [openapi.yaml](./openapi.yaml)에 정의되어 있으며 실행 중인 서버의 `/api/openapi.yaml`에서도 동일한 OpenAPI 3.1 문서를 받을 수 있습니다. 요구사항 수명주기 계약은 초안 생성, 독립 승인, 개정, 해시 기준선, 증거 기반 검증과 재검증 작업을 포함합니다.

## 백업과 복원

```bash
AUTOFORGE_DATA_DIR=./data npm run backup:create -- ./backups/backup-001
npm run backup:verify -- ./backups/backup-001
AUTOFORGE_DATA_DIR=./restored npm run backup:restore -- ./backups/backup-001
```

백업은 데이터베이스와 아티팩트별 크기·SHA-256 manifest를 포함합니다. 복원 전에 모든 체크섬을 검증하고, 대상 디렉터리가 비어 있지 않으면 중단합니다. 의도적인 덮어쓰기만 `--force`를 사용할 수 있습니다.

데이터 시작 시 스키마를 현재 버전으로 순차 마이그레이션합니다. 이미 적용된 마이그레이션은 다시 실행되지 않으며 서버보다 새로운 스키마는 기동을 거부합니다.

파일 저장은 임시 파일 기록과 `fsync`, 원자적 rename, SHA-256 sidecar를 사용합니다. 저장 전 세대는 `autoforge.json.previous`로 유지되며 현재 세대가 부분 기록되거나 체크섬이 다르면 시작 시 자동 복구합니다. 두 세대가 모두 손상된 경우에는 잘못된 기본값으로 시작하지 않고 기동을 중단합니다. `/api/health`에서 `persistence.state`, `verified`, `recovered`를 확인할 수 있습니다.

## 센서 데이터와 ROS 2 Gateway

- `/api/telemetry/ingest`: 교정 정보가 포함된 센서 샘플 배치 수집
- `/api/telemetry/query`: 시간 범위 조회와 최대 포인트 기반 다운샘플링
- `/api/telemetry/latest`: 디지털 트윈용 신호별 최신값
- `/api/physical-tests`: 물리시험 결과 등록과 Sim-to-Real 모델 보정
- `/api/robot/cells`, `/api/robot/commands`: 접근 가능한 물리 셀과 명령·ACK 이력 조회
- `/api/robot/actions`: 해당 셀에 승인된 S4 게이트로 제작·시험·검사 명령 제출
- `/api/robot/commands/:id/ack`: ROS 또는 현장 작업자의 종결 ACK 기록
- `/api/robot/cells/:id/interlocks`, `/api/robot/cells/:id/emergency-stop`: 허용된 인터록 복구와 멱등 비상정지
- `/api/robot/commands/:id/ack`: ROS 2 실행 결과 확인
- `/api/robot/cells/:id/emergency-stop`: 실행 명령 취소 및 셀 비상정지

센서 샘플은 프로젝트·차량·신호·날짜 단위 NDJSON으로 분할 저장됩니다. 만료된 교정, 미래 시각, 비수치 값과 중복 샘플은 거부하고 원본 품질·불확실성 플래그를 보존합니다.

로봇 명령에는 정확한 대상 셀에 저장된 S4 승인, 현장 책임자 권한, 모든 물리 인터록과 멱등 키가 필요합니다. 다른 셀의 승인 재사용과 알 수 없는 인터록 필드는 거부되며, 비상정지 후에는 인터록이 모두 복구되기 전까지 다음 작업을 실행할 수 없습니다. 현재 Gateway transport는 안전한 결정론적 전송 계약이며 실제 ROS 2 Action bridge에서 동일 명령·acknowledgement 구조를 사용합니다.

## MCP Engineering Gateway

`POST /mcp`는 MCP `2025-11-25` Streamable HTTP JSON-RPC 엔드포인트입니다. Bearer 인증 후 `initialize` 응답의 `Mcp-Session-Id`를 `notifications/initialized`, `tools/list`, `tools/call` 요청에 전달하며 `DELETE /mcp`로 세션을 종료합니다.

도구는 사용자 RBAC에 따라 필터링됩니다. 프로젝트 조회, 요구사항 정제, 차량 산정, 자율 워크플로 시작, 실행 조회, 지식 그래프와 릴리스 평가를 제공하며 로봇 명령은 `robot.execute` 권한과 저장된 S4 승인·인터록을 모두 요구합니다. 모든 호출은 감사 로그에 사용자·역할·도구·요청 ID와 함께 기록됩니다. 브라우저 Origin은 동일 호스트 또는 `AUTOFORGE_MCP_ORIGINS` 목록만 허용됩니다.

```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"engineering-agent","version":"1.0"}}}
```

## 통합 완성 판정과 상태 동기화

`GET /api/projects/:id/completion`은 릴리스 게이트와 동일한 증거 판정기를 사용합니다. 필수 요구사항, 안전, 4개 필수 시뮬레이션, 제조 가능성, 물리 시험, 완전 추적성, S5 승인을 설계 버전별로 평가하고 실제 준비도 점수와 증거 ID를 반환합니다. 설계 ID를 생략하면 릴리스된 설계를 우선하고, 없으면 가장 많은 검증 증거를 가진 후보를 선택합니다.

시뮬레이션·제조 평가·물리 시험·승인·릴리스가 등록될 때 프로젝트 상태는 순차 상태만 거쳐 자동 진행합니다. 각 자동 전환에는 실행자, 시각, 설계와 시험 증거가 기록되며 최종 릴리스 생성 후에만 `released` 상태가 됩니다.

## 파라메트릭 3D CAD 산출물

`POST /api/designs/:designId/cad`는 격리된 내장 CAD worker를 실행해 차량 치수 기반 OpenSCAD 원본과 표준 OBJ 삼각 메시를 생성합니다. 전장·전폭·전고·휠베이스·휠 크기는 안전 범위로 정규화되고, 메시 정점·삼각형 수와 위상 검증 결과가 실행 메트릭에 기록됩니다.

생성 파일은 SHA-256 콘텐츠 주소 아티팩트로 저장되고 일반 아티팩트 다운로드 API와 최종 릴리스 ZIP에서 함께 제공됩니다. Concept Lab의 `CAD 생성`은 현재 슬라이더 값을 설계 버전으로 저장한 후 두 형상을 생성합니다. 외부 에이전트는 MCP `autoforge_cad_generate` 도구로 같은 실행 경로를 사용할 수 있습니다.

## Reduced-order 다물리 시뮬레이션

`POST /api/simulations`는 설계별 격리 worker에서 다음 재현 가능한 물리 모델을 실행합니다.

- 공력: 속도별 항력과 공력 소요 동력
- 열: 180 kW 급속 충전 중 배터리 팩 과도 온도
- 구조: 등가 차체 보의 비틀림 강성과 하중별 축약 응력
- 주행거리: 합성 도심·고속 사이클의 전력, 누적 에너지와 주행거리

각 결과는 `reduced_order_physics` 충실도, 모델 버전, 가정, 신뢰도와 불확실성을 명시합니다. 원시 스윕/시계열 CSV와 결과 JSON은 해시 아티팩트로 저장되고 릴리스 패키지에 포함됩니다. Simulation Hub에서 4종 해석을 실행하고 증거 수와 불확실성을 확인할 수 있으며 MCP `autoforge_simulation_run`도 같은 worker를 사용합니다. 이는 외부 CFD/FEA의 대체 주장이 아니라 저비용 후보 압축 단계이며 고정밀 게이트는 외부 OpenFOAM·CalculiX 어댑터로 확장합니다.

## 다목적 최적화와 설계 계보

`POST /api/optimizations`는 Halton 저불일치 수열로 최대 1,000개의 재현 가능한 차량 조합을 생성합니다. 전장·휠베이스·전고·전폭·휠·배터리 용량을 탐색하고 주행거리, 원가, 중량, Cd의 필수 제약을 먼저 적용한 후 비지배 Pareto 전선을 계산합니다. 시드, 알고리즘 버전, 목적함수 가중치, 모든 후보와 탈락 사유를 저장합니다.

Optimization Center는 실제 후보를 원가–주행거리 평면에 표시하고 Pareto·실현 가능성·설계 철학을 구분합니다. 추천 또는 선택 후보는 새 설계 버전으로 승격할 수 있으며 부모 설계, 최적화 실행, 후보 ID가 지식 그래프의 `derived_into`, `optimized_by`, `promoted_to` 관계로 남습니다. 최적화된 설계를 릴리스하면 `optimization-provenance.json`이 ZIP에 포함됩니다. 외부 에이전트는 MCP `autoforge_optimize`를 사용할 수 있습니다.

## 제조·공급망과 승인 운영

- `/api/manufacturing/evaluate`: BOM 직접비·간접비·조립 노동비, DFM과 공급망 위험 통합 평가
- `/api/suppliers`: 공급사 리드타임·품질·위험 데이터
- `/api/approvals`: S0–S5 등급별 승인 요청과 진행 상태
- `/api/notifications`: 사용자·역할·조직별 운영 알림

승인 정책은 다음 정족수를 강제합니다.

| 등급 | 정책 |
|---|---|
| S0–S1 | 안전한 범위에서 자동 승인 |
| S2 | 설계 전문가 1명 |
| S3 | 2명, 안전 담당자 필수 |
| S4 | 현장 책임자 필수 |
| S5 | 3명, 안전 담당자와 현장 책임자 필수 |

요청자는 자신의 변경을 승인할 수 없고 같은 사용자의 중복 결정도 거부됩니다. 한 명이라도 반려하면 요청은 즉시 종료되며 모든 결정과 의견은 감사 추적에 보존됩니다.

## 플랫폼 자기개선

플랫폼 변경은 운영 파일을 직접 수정하지 않고 `code_patch` 아티팩트로 등록됩니다.

```text
격리 변경 → 독립 리뷰 → 자동 테스트 → 기준 벤치마크
→ 보안 검사 → 위험 등급 승인 → 최대 10% 카나리 → 전체 배포
```

- 문서, UI 문구, 테스트 전용 변경만 전체 게이트 통과 후 제한적으로 자동 승인됩니다.
- 성능·설계 알고리즘·안전 규칙·로봇 제어·배포 정책은 S2–S5 승인이 필요합니다.
- 작성자는 자신의 패치를 리뷰할 수 없습니다.
- 테스트 실패, p95 지연·성공률·비용 회귀 또는 high 이상 보안 이슈는 파이프라인을 중단합니다.
- 카나리 오류율이 기준보다 2%p 증가하거나 지연이 10% 이상 증가하면 자동 롤백합니다.
- 건강한 관측값 3개가 누적돼야 전체 배포 상태로 전환됩니다.

관련 API는 `/api/improvements`, `/api/improvements/:id/advance`, `/canary`, `/observe`, `/rollback`과 `/api/platform/releases`입니다.

## 외부 엔진과 설계 릴리스

외부 CAD·CFD·CAE wrapper는 `autoforge-engine` 프로토콜 1.0을 사용합니다. 모든 요청에는 엔진, 작업, 프로젝트·설계 ID, 입력과 아티팩트 ID가 포함되고 응답은 동일 요청 ID, 상태, 메트릭, 로그와 base64 결과 아티팩트를 반환해야 합니다. 버전이나 요청 ID가 일치하지 않는 결과는 폐기됩니다.

- `/api/engines/execute`: 격리된 wrapper 실행과 결과 아티팩트 편입
- `/api/designs/:id/preview`: 차량 치수 기반 SVG 패키징 미리보기
- `/api/projects/:id/report.pdf`: 인쇄 가능한 엔지니어링 PDF 보고서
- `/api/projects/:id/release-assessment`: 릴리스 게이트 사전 확인
- `/api/projects/:id/releases`: 최종 ZIP 릴리스 생성

릴리스 ZIP에는 다음 파일이 포함됩니다.

```text
report.pdf
design-spec.json
bom.csv
traceability.json
artifacts/*
manifest.json
```

Manifest는 각 파일의 크기와 SHA-256을 기록합니다. 필수 요구사항 100%, 공력·열·구조·주행 시뮬레이션, 제조 가능성, 물리시험, 추적성 100%, 안전 위반 0건과 S5 승인이 모두 충족되지 않으면 패키지를 생성하지 않습니다.

# 크툴루 보안 Agent · 새 환경 재현 기록과 버전 기록 (22단계)

이 문서는 학생이 작성한 재현 기록입니다. 재현 결과는 **학생 진술**입니다. ALEPH 서버가 새 환경에서 실행해 확인했다는 뜻이 아니며, AI 원문 검토 통과는 실행 성공 증명이 아닙니다.
비밀 값(열쇠·토큰·비밀번호)은 이 문서와 저장소에 넣지 않았습니다.

## 1. 버전과 상태

| 항목 | 값 |
|---|---|
| 버전 표기 | **검증 중인 버전**(v1.0 아님). 19단계 실집행·실제 SDP·앱 AI 연결이 미완료이기 때문 |
| 시작 틀 | 내 보안 Agent 시작 틀 0.2.21 (`on-client/README.md`, `package.json` 의 `version` 0.2.21) |
| 저장소 | `https://github.com/ddonni/kutulu` (공개) |
| 브랜치 | `master` |
| 재현한 커밋(40자리) | `b94f9d7da7493224f1fc207f6c86b1d263e8d4fe` (트리 `cd63fc1acd32147a8cfeee5d06e4f3845f88fd1b`) |
| 이 기록을 담은 커밋 | 재현한 커밋 위에 학생 문서(이 문서, `STUDENT_RUNBOOK.md` 안내 한 줄, `README.md` 안내)만 더한 다음 커밋. 코드·실행 진입점·설정 견본·`package.json` 은 재현한 커밋과 같음 |

서로 다른 커밋의 결과를 합쳐 "최종 버전 전체 성공"으로 적지 않습니다. 아래 결과는 모두 위 재현한 커밋 하나를 기준으로 합니다.

## 2. 재현 환경

| 항목 | 값 |
|---|---|
| 운영체제 | Windows 11 Pro 10.0.26200 |
| Node.js | v24.22.1 (수업 기준 24.19.0 에서는 확인하지 않음) |
| npm | 11.19.1 |
| PowerShell | Windows PowerShell 5.1.26100 |
| Git | 2.56.0.windows.1 (`core.autocrlf=true`) |
| 브라우저 | PC 브라우저(종류·버전은 기록하지 않음) |
| 새 폴더 | `%USERPROFILE%\kutulu-repro-20261120` (원래 작업 폴더 밖, 새 빈 폴더) |
| 원래 작업 폴더 | `%LOCALAPPDATA%\ALEPH\Workbench\projects\크툴루-방어전` (그대로 보존) |

## 3. 재현 절차

원래 작업 폴더는 건드리지 않았고, 인증·설정 파일(`.env`, 계정 연결 설정 등)은 복사하지 않았습니다.

```powershell
# 1) 새 빈 폴더에 공개 저장소를 받고 재현할 커밋으로 고정
git clone https://github.com/ddonni/kutulu.git "$env:USERPROFILE\kutulu-repro-20261120"
cd "$env:USERPROFILE\kutulu-repro-20261120"
git checkout b94f9d7da7493224f1fc207f6c86b1d263e8d4fe
git rev-parse HEAD          # b94f9d7da7493224f1fc207f6c86b1d263e8d4fe 확인

# 2) 런타임 확인과 설치(외부 의존성 없음 → npm install 불필요)
cd on-client
node -v
npm.cmd -v
npm.cmd run check           # node --check student/extension.mjs

# 3) 실행 → 브라우저 확인 → 종료(Ctrl+C) → 다시 실행
npm.cmd run demo            # 시작 신호: 케셰브 예제: http://127.0.0.1:5189
# 브라우저: http://127.0.0.1:5189
```

## 4. 관찰 결과

### 4-1. 확인 방식 구분

| 표기 | 뜻 |
|---|---|
| 명령 확인 | 코딩 도구(AI)가 새 폴더에서 명령을 실행해 응답을 본 것. 2026-11-20 03:47 UTC(12:47 KST) |
| 학생 화면 확인 | 학생이 새 폴더에서 `npm.cmd run demo` 로 켠 화면을 직접 보고 원래 폴더와 같다고 확인한 것. 2026-11-20 04:30 UTC(13:30 KST) 무렵. 학생 진술 |
| 원래 폴더 화면 확인 | 13~21단계 진행 중 원래 작업 폴더에서 학생이 화면으로 확인한 것(2026-11-19~20). 학생 진술 |
| 모의 점검 | 가짜 DOM·모의 입력으로 표시만 점검한 것. 실제 시스템 연결 성공이 아님 |
| 원문 확인 | 서버의 AI가 커밋 원문을 읽고 판정하는 것. 실행 검증이 아님 |

### 4-2. 새 폴더에서의 공통 결과(명령 확인)

| 확인 | 결과 |
|---|---|
| clone 뒤 HEAD | 재현한 커밋과 일치. 트리 해시가 원래 폴더와 같음 |
| 파일 내용 | 줄바꿈(LF/CRLF) 차이만 있고 내용은 같음(`core.autocrlf=true` 로 받음) |
| 비밀·설정 파일 | 새 폴더에 `.env`·`native.json` 없음. 커밋된 설정 파일은 `.env.example` 견본뿐. 비밀 값 패턴 검사 0건 |
| `npm.cmd run check` | 통과 |
| demo 실행 1 → 종료 → 실행 2 (`ON_PORT=5199` 로 포트만 바꿈) | 두 번 모두 시작 신호 `케셰브 예제`, `GET /` 200, `/student/extension.mjs` 200, `/api/me`·`/api/apps`(3건)·`/api/events`(1건)·`/api/devices`·`/api/sessions`·`/api/diagnostics` ok, `/api/vulnerabilities` `not_configured`, `POST /api/access` library `allow`. 종료 뒤 응답 없음 |
| 기본 실행(start) | 시작 신호 `케셰브 연결 확인`, 계정·기록·판정 API 는 `ENGINE_NOT_CONNECTED`(연결 없음), 진단·패키지 조회만 응답 |

서버는 `node src/server.mjs --demo` / `node src/server.mjs` 로 켰습니다. `npm run demo` / `npm start` 가 실행하는 명령과 같습니다. 학생 화면 확인은 기본 포트 5189 에서 `npm.cmd run demo` 로 했습니다.

### 4-3. 단계별 결과(재현한 커밋 기준)

결과 값: 재현됨 / 재현 안 됨 / 연결 없음 / 확인 불가

| 단계 | 확인한 기능 | 결과 | 확인 시각 | 근거 | 비고·미확인 원인 |
|---|---|---|---|---|---|
| 13 | 사용자·기기·세션 표시, 다시 불러오기, 연결 실패 시 이전 이름 제거, 세 메뉴 이동 | 재현됨(demo) | 명령 03:47Z · 학생 화면 04:30Z | `/api/me`·`/api/devices`·`/api/sessions` ok, 학생 화면 확인 | 실제 SDP 사용자·기기는 연결 없음 |
| 14 | 업무 앱 판정·이유·시각, 요청 실패 구분 | 재현됨(demo) | 명령 03:47Z · 학생 화면 04:30Z | `POST /api/access` library `allow`, 학생 화면 확인 | deny·challenge 는 원래 폴더 화면 확인, unknown 은 모의 점검만 |
| 15 | 기록 목록·필터·상세 | 재현됨(demo) | 명령 03:47Z · 학생 화면 04:30Z | `/api/events` 1건, 학생 화면에서 event-01 상세 확인 | 여러 기록 필터·XDR 경보·빈 목록은 모의 점검만 |
| 16 | 기기·세션·알림·도움정보, 실패 안내 | 재현됨(demo) | 명령 03:47Z · 학생 화면 04:30Z | `/api/diagnostics` ok, 학생 화면 확인 | 미지원 조치 버튼은 모의 점검만, 네트워크 탭 자동 재요청 없음은 확인 불가 |
| 17 | AI 연결 점검 상태 | 연결 없음 | 원래 폴더 화면(2026-11-20) | 원래 폴더에서 "권한 준비 중" 확인 | 운영 측 앱 권한 발급 전. test/verified·취소는 확인 불가 |
| 18 | 근거에 연결된 AI 설명 | 연결 없음 | 원래 폴더 화면(2026-11-20) | 실패 화면과 AI 실패 중 기록·판정 유지 확인 | 실제 AI 설명 성공은 확인 불가(AI 권한 준비 중) |
| 19 | 조치 상태 구분 | 연결 없음 | 학생 화면 04:30Z | 조치 칸 "아직 미실행(idle)", 조치 준비 버튼 없음 | 연동 시스템 실집행 미준비. prepared 이후 상태는 모의 점검만 |
| 20 | 설치 패키지·OSV 조회 표시 | 연결 없음 | 명령 03:47Z · 학생 화면 04:30Z | `/api/vulnerabilities` `not_configured` | 조회 대상 프로젝트·허용 패키지 미설정(운영자 준비). 실제 OSV 결과·버전 대조는 확인 불가 |
| 21 | 설명서대로 실행·종료·다시 실행 | 재현됨 | 명령 03:47Z · 학생 화면 04:30Z | `STUDENT_RUNBOOK.md` 4장 절차로 새 폴더에서 실행 | `tools\start-alekov.ps1` 은 실행하지 않음(확인 불가) |

## 5. 이동 가능한 구성

- 필요한 파일은 모두 저장소 안에 있습니다. 외부 npm 의존성이 없어 `npm install` 이 필요 없습니다(`package.json` 의 `dependencies` 없음, lock 파일 없음).
- 설정은 실행 환경 변수로만 읽습니다(`ON_PORT` 등, `.env.example` 은 견본). 서버는 `.env` 파일을 자동으로 읽지 않습니다.
- 학생 코드·문서에는 로컬 절대경로가 없습니다. 문서의 경로는 `%LOCALAPPDATA%`·`%USERPROFILE%` 같은 환경 변수로 적었습니다.
- 계정 연결 설정·AI 앱 자격·SDP 설정은 저장소 밖(Windows 사용자 폴더 등)에 두며 다른 PC로 복사하지 않습니다. 새 환경에서는 그 환경에서 다시 연결합니다.

## 6. 데이터 보존 계획

| 데이터 | 위치 | 보존·백업 | 복원 | 제한 |
|---|---|---|---|---|
| 학생 코드·문서 | 저장소(`on-client/student/`, `on-client/docs/STUDENT_*.md`, `README.md`) | 단계마다 커밋하고 GitHub `origin` 에 push. 작업 폴더는 지우지 않음 | `git clone` 후 필요한 커밋으로 `git checkout` (이 기록의 3장 절차) | push 하지 않은 변경은 백업되지 않음 |
| Git 기록 | `크툴루-방어전\.git`, GitHub | 강제 push·이력 재작성을 하지 않음 | 위와 같음 | GitHub 계정 접근이 필요 |
| 계정 연결 설정 | `%USERPROFILE%\.aleph-keshev-<프로젝트별 해시>` (`tools\start-alekov.ps1` 을 demo 없이 실행할 때만 생성) | 저장소·제출물에 넣지 않음. 이 PC에는 아직 없음 | 새 환경에서 화면의 계정 연결을 다시 진행 | 다른 PC로 복사하지 않음 |
| 조치 기록 DB | 명시한 기존 SQLite 경로에서만 사용(`src/actions/store.mjs`) | 이 과정에서는 사용하지 않음 | 해당 없음 | 운영 연결 시 담당자 안내를 따름 |
| 재현 폴더 | `%USERPROFILE%\kutulu-repro-20261120` | 원래 작업 폴더와 별개. 지워도 원래 작업은 남음 | 3장 절차로 다시 만들 수 있음 | 이 폴더에서 고친 내용은 원래 저장소에 반영되지 않음 |

## 7. 지원 범위와 미해결 사항

- **확인함**: 같은 커밋의 새 폴더 clone, 문법 검사, demo 실행·종료·다시 실행, 기본 실행의 연결 없음 표시, 13~16·21 단계 화면(demo).
- **미해결·기다림(UNV)**
  - 실제 기존 접근 제어·XDR 시스템(SDP) 연결과 실제 사용자·기기·판정·기록
  - 앱 AI 연결 완료(test/verified), 실제 모델 응답과 AI 사건 설명 성공
  - 19단계 조치 실집행: 연동 시스템 집행기가 아직 준비되지 않음. 실제 학생 계정의 조치 결과는 기다림(UNV)
  - 실제 OSV 조회 결과와 `package-lock.json` 버전 대조
  - 점검·조회 중 취소, 네트워크 탭의 자동 재요청 없음
  - `tools\start-alekov.ps1`, Node.js 24.19.0, 다른 운영체제, 설치형 전체 앱(`npm run package-app`)
- 22단계 통과는 원문 검토 기준의 수료이며, 실제 운영 인증이나 v1.0 자동 인증이 아닙니다.

# 크툴루 보안 Agent (학생 프로젝트)

이 파일은 학생이 작성한 프로젝트 README입니다. 앱 폴더의 제공 문서 `on-client/README.md`는 고치지 않았습니다.
자세한 실행 절차·구성도·장애 안내·지원 범위는 [on-client/docs/STUDENT_RUNBOOK.md](on-client/docs/STUDENT_RUNBOOK.md)에 있습니다.

## 목적

직원이 자기 계정·기기·세션, 업무 앱 접근 판정, 최근 접속 기록과 XDR 경보, 앱 안 AI 설명, 조치 요청 상태, 설치 패키지 취약점 조회 결과를 한 화면에서 확인하는 보안 Agent(화면 이름 "케셰브")입니다. 본인 범위의 정보만 다룹니다.

## 기능(학생 구현: `on-client/student/extension.mjs`)

| 단계 | 함수 | 기능 |
|---|---|---|
| 13 | `renderIdentity` | 로그인 사용자·기기·세션 표시 |
| 14 | `renderDecision` | 업무 앱 접근 판정·이유·시각, 요청 실패 구분 |
| 15 | `renderEvents` | 접속 기록·XDR 경보 목록, 필터, 상세 |
| 16 | `renderStatus` | 빈 상태·오류·알림·도움정보, 미지원 조치 안내 |
| 17 | `renderAiConnection` | 앱 내부 AI 연결 점검 결과와 실패 원인 |
| 18 | `renderExplanation` | 근거·규칙·상태에 연결된 AI 설명 |
| 19 | `renderAction` | 조치 제안·사람 확인·접수·실제 효과 구분 |
| 20 | `renderVulnerabilities` | 설치 패키지 정확한 버전과 OSV 조회 결과 |

화면 틀·서버·연결 코드(`on-client/public`, `on-client/src`, `on-client/vendor`, `on-client/tools`)는 제공 코드이며 고치지 않았습니다.

## 구성

브라우저(`http://127.0.0.1:5189`) → 로컬 앱 서버(`on-client/src/server.mjs`) → 기존 접근 제어·XDR 시스템(`src/engine.mjs`, 기본 실행은 연결 없음) / CLCO 수업용 AI 게이트(`vendor/clco-http.mjs`) / OSV(`src/vulnerabilities/osv.mjs`). 구성도는 설명서 5장에 있습니다.

## 지원 환경과 버전

- 이 PC에서 확인: Windows 11 Pro, Node.js v24.22.1, npm 11.19.1, Windows PowerShell 5.1, Git 2.56.0
- 수업 기준(제공 문서): Node.js 24.19.0(22~24 지원). 외부 npm 의존성 없음, `npm install` 불필요
- 실행(확인함): 앱 폴더 `on-client`에서 `npm.cmd run demo`(예제 자료) 또는 `npm.cmd start`(연결 없는 기본 실행) → 브라우저 `http://127.0.0.1:5189`

실제 SDP 연결, AI 사건 설명 성공, 조치 집행, 실제 OSV 조회는 아직 확인하지 못했습니다. 목록은 설명서 8장 "기다림(UNV)"에 있습니다. 비밀 값은 저장소에 두지 않습니다.

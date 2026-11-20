// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.

// ---------- 13단계: 로그인 사용자·기기·세션 표시 (renderIdentity) ----------
// 기기 보안 상태 표시는 서버가 알려 준 값을 옮겨 적을 뿐이며 악성코드 검사·치료 기능이 아닙니다.
const DEVICE_STATUS_TEXT = { compliant: '보안 기준 충족', noncompliant: '보안 기준 미충족', unknown: '확인 불가' };
const SESSION_STATUS_TEXT = { active: '활성', expired: '만료', revoked: '철회됨', unknown: '확인 불가' };
// 정상으로 보이면 안 되는 값: 상태 문구에 더해 경고 색 클래스를 붙인다(색만으로 구분하지 않음).
const DEVICE_NORMAL = new Set(['compliant']);
const SESSION_NORMAL = new Set(['active']);
const MODE_TEXT = { demo: '예제 자료', disconnected: '연결 없음', unknown: '확인 불가' };

function make(tag, { className, text, state } = {}, children = []) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = String(text);
  if (state) node.dataset.state = state;
  for (const child of children) if (child) node.append(child);
  return node;
}

const textOf = (value, fallback = '이름 정보 없음') => (typeof value === 'string' && value ? value : fallback);
const knownOr = (map, value) => (typeof value === 'string' && Object.hasOwn(map, value) ? value : 'unknown');

// 자료의 mode 안내. loading·error 상태여도 전달받은 demo·disconnected·unknown 이면 함께 보여 준다.
function modeNotice(resource) {
  const mode = resource && typeof resource.mode === 'string' ? resource.mode : null;
  if (!mode || !Object.hasOwn(MODE_TEXT, mode)) return null;
  return make('p', { className: mode === 'demo' ? 'tag tag-demo' : 'state state-empty', text: `자료 상태: ${MODE_TEXT[mode]}`, state: mode });
}

// status 공통 처리: loading / error / ok 외(알 수 없는 상태 포함)는 확인 불가로 둔다.
function statusBox(resource, label) {
  const status = resource && typeof resource.status === 'string' ? resource.status : 'unknown';
  if (status === 'loading') return make('p', { className: 'state state-loading', text: `${label}: 불러오는 중`, state: 'loading' });
  if (status === 'error') {
    const message = textOf(resource.error && resource.error.message, '서버 메시지 없음');
    const prefix = resource.mode === 'unknown' ? '확인 불가' : '연결 실패';
    return make('p', { className: 'state state-error', text: `${label} ${prefix}: ${message}`, state: 'error' });
  }
  if (status !== 'ok') return make('p', { className: 'state state-empty', text: `${label}: 확인 불가`, state: 'unknown' });
  return null;
}

function deviceStatusLine(status) {
  const key = knownOr(DEVICE_STATUS_TEXT, status);
  const normal = DEVICE_NORMAL.has(key);
  return make('span', { className: normal ? 'state state-ok' : (key === 'unknown' ? 'state state-empty' : 'state state-error'),
    text: `기기 보안 상태: ${DEVICE_STATUS_TEXT[key]}`, state: key });
}

function sessionStatusLine(status) {
  const key = knownOr(SESSION_STATUS_TEXT, status);
  const normal = SESSION_NORMAL.has(key);
  return make('span', { className: normal ? 'state state-ok' : (key === 'unknown' ? 'state state-empty' : 'state state-error'),
    text: `세션 상태: ${SESSION_STATUS_TEXT[key]}`, state: key });
}

const idText = value => (typeof value === 'string' && value ? `ID ${value}` : 'ID 정보 없음');

// 현재 로그인한 계정·기기·세션(me). 오류·로딩이면 사용자 이름을 그리지 않는다.
function renderMe(me) {
  const section = make('section', { className: 'identity-me' }, [make('h3', { text: '현재 계정' }), modeNotice(me)]);
  const box = statusBox(me, '로그인 정보');
  if (box) { section.append(box); return section; }
  const data = me.data && typeof me.data === 'object' ? me.data : {};
  const user = data.user || {};
  const device = data.device || {};
  const session = data.session || {};
  section.append(make('dl', {}, [
    make('dt', { text: '사용자' }), make('dd', { text: `${textOf(user.label)} (${idText(user.id)})` }),
    make('dt', { text: '현재 기기' }), make('dd', {}, [make('span', { text: `${textOf(device.label)} (${idText(device.id)}) ` }), deviceStatusLine(device.status)]),
    make('dt', { text: '현재 세션' }), make('dd', {}, [make('span', { text: `${idText(session.id)} ` }), sessionStatusLine(session.status)]),
  ]));
  return section;
}

function renderList(resource, { title, label, empty, line }) {
  const section = make('section', {}, [make('h3', { text: title }), modeNotice(resource)]);
  const box = statusBox(resource, label);
  if (box) { section.append(box); return section; }
  const items = Array.isArray(resource.data) ? resource.data : [];
  if (!items.length) { section.append(make('p', { className: 'state state-empty', text: empty })); return section; }
  section.append(make('ul', {}, items.map(item => make('li', {}, line(item || {})))));
  return section;
}

function renderIdentityView({ me, devices, sessions } = {}) {
  const root = make('div', { className: 'identity-view' });
  root.append(
    renderMe(me),
    renderList(devices, { title: '내 기기 목록', label: '기기 목록', empty: '등록된 기기가 없습니다.',
      line: d => [make('span', { text: `${textOf(d.label)} (${idText(d.id)}) ` }), deviceStatusLine(d.status)] }),
    renderList(sessions, { title: '내 세션 목록', label: '세션 목록', empty: '표시할 세션이 없습니다.',
      line: s => [make('span', { text: `${idText(s.id)} ` }), sessionStatusLine(s.status)] }),
  );
  return root;
}

export function createStudentView() {
  return {
    // 앱은 다시 불러오기마다 이 칸을 통째로 교체한다. 매번 새 DOM 을 만들어 이전 값을 재사용하지 않는다.
    renderIdentity(input) { return renderIdentityView(input); },
    renderDecision() { return '학생 구현 대기: 서버의 판정과 이유를 연결하세요.'; },
    renderEvents() { return '학생 구현 대기: 본인 접속·XDR 기록을 연결하세요.'; },
    renderStatus() { return '학생 구현 대기: 기기·세션·알림과 연결 점검 상태를 구분하세요.'; },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}

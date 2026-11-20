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

// ---------- 14단계: 업무 앱 접근 요청 결과 표시 (renderDecision) ----------
// allow 는 정책상 접근 허용이며 실제 앱 접속 성공을 보장하지 않습니다. challenge 의 확인 절차를 이 화면이 대신하지 않습니다.
const DECISION_TEXT = {
  allow: { label: '허용(allow)', note: '정책상 접근이 허용되었습니다. 실제 앱 접속 성공을 보장하지는 않습니다.' },
  deny: { label: '거부(deny)', note: '정책에 따라 접근이 거부되었습니다.' },
  challenge: { label: '추가 확인 필요(challenge)', note: '접근하려면 추가 확인이 필요합니다. 이 앱은 확인 절차를 대신 수행하지 않습니다.' },
  unknown: { label: '확인 불가(unknown)', note: '판정을 확인할 수 없습니다. 접근이 허용되지 않은 것으로 다루세요.' },
};

function timeText(value) {
  if (typeof value !== 'string' || !value) return '시각 정보 없음';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? `확인 불가(${value})` : `${date.toLocaleString('ko-KR')} (${value})`;
}

function renderDecisionView(input = {}) {
  const root = make('div', { className: 'decision-view' });
  const status = typeof input.status === 'string' ? input.status : 'unknown';
  const appId = typeof input.appId === 'string' && input.appId ? input.appId : null;
  const notice = modeNotice(input);
  // null 은 실제 DOM 에서 "null" 글자가 되므로 걸러서 넣는다.
  const add = (...nodes) => root.append(...nodes.filter(Boolean));

  if (status === 'idle') {
    add(make('p', { className: 'state state-empty', text: '앱을 골라 접속을 요청하세요.', state: 'idle' }));
    return root;
  }
  if (status === 'loading') {
    add(make('p', { className: 'state state-loading', text: `판정 확인 중${appId ? ` · 대상 앱 ${appId}` : ''}`, state: 'loading' }), notice);
    return root;
  }
  if (status === 'error') {
    const message = textOf(input.error && input.error.message, '서버 메시지 없음');
    add(
      make('p', { className: 'decision decision-failed', text: `요청 실패: ${message}`, state: 'request-failed' }),
      make('p', { text: '서버에서 판정을 받지 못했습니다. 이 결과는 거부 판정이 아니며, 접근이 허용된 것도 아닙니다.' }),
      appId ? make('p', { text: `대상 앱: ${appId}` }) : null,
      notice,
    );
    return root;
  }
  if (status !== 'ok') {
    add(make('p', { className: 'decision decision-unknown', text: DECISION_TEXT.unknown.label, state: 'unknown' }),
      make('p', { text: DECISION_TEXT.unknown.note }), notice);
    return root;
  }

  const data = input.data && typeof input.data === 'object' ? input.data : {};
  // 네 값이 아니면 허용으로 보이지 않게 확인 불가(unknown)로 처리합니다.
  const key = typeof data.decision === 'string' && Object.hasOwn(DECISION_TEXT, data.decision) ? data.decision : 'unknown';
  const info = DECISION_TEXT[key];
  add(
    make('p', { className: `decision decision-${key}`, text: `판정: ${info.label}`, state: key }),
    make('p', { text: info.note }),
    make('dl', {}, [
      make('dt', { text: '대상 앱' }), make('dd', { text: textOf(data.appId, appId ?? 'ID 정보 없음') }),
      make('dt', { text: '판정 이유' }), make('dd', { text: textOf(data.reason, '이유 정보 없음') }),
      make('dt', { text: '판정 시각' }), make('dd', { text: timeText(data.checkedAt) }),
    ]),
    notice,
  );
  return root;
}

// ---------- 15단계: 접속 기록·XDR 경보 목록과 상세 보기 (renderEvents) ----------
// 서버가 준 본인 기록(최근 40건까지)만 다룹니다. 전체 로그·다른 직원 기록·실시간 탐지가 아닙니다.
// 필터는 받은 배열 안에서만 거르며 서버에 다시 묻지 않습니다. 조치 버튼은 만들지 않습니다.
const KIND_TEXT = { access: '접속 기록', xdr: 'XDR 경보' };
const ACCESS_STATE_TEXT = { allowed: '허용됨', denied: '거부됨', unknown: '확인 불가' };

const withCode = (map, value) => {
  if (typeof value === 'string' && Object.hasOwn(map, value)) return `${map[value]}(${value})`;
  return `확인 불가(${typeof value === 'string' && value ? value : 'unknown'})`;
};
const timeOf = value => { const t = Date.parse(value); return Number.isNaN(t) ? -Infinity : t; };
const appText = appId => (typeof appId === 'string' && appId ? appId : '앱 확인 불가(appId 없음)');

function eventDetail(event) {
  const detail = make('section', { className: 'event-detail' });
  detail.dataset.studentEventDetail = event.id;
  const rows = (items, empty) => {
    const list = Array.isArray(items) ? items : [];
    if (!list.length) return make('p', { className: 'state state-empty', text: empty });
    return make('ul', {}, list.map(item => make('li', { text: `${textOf(item && item.id, 'ID 정보 없음')}: ${textOf(item && item.text, '내용 없음')}` })));
  };
  const state = event.state && typeof event.state === 'object' ? event.state : {};
  detail.append(
    make('h3', { text: `${event.id} 상세` }),
    make('dl', {}, [
      make('dt', { text: '사건 ID' }), make('dd', { text: event.id }),
      make('dt', { text: '업무 앱' }), make('dd', { text: appText(event.appId) }),
    ]),
    make('h4', { text: '근거(evidence)' }), rows(event.evidence, '근거 정보가 없습니다.'),
    make('h4', { text: '규칙(rules)' }), rows(event.rules, '규칙 정보가 없습니다.'),
    make('h4', { text: '상태(state)' }),
    make('dl', {}, [
      make('dt', { text: '접속 상태(access)' }), make('dd', { text: withCode(ACCESS_STATE_TEXT, state.access), state: knownOr(ACCESS_STATE_TEXT, state.access) }),
      make('dt', { text: '세션 상태(session)' }), make('dd', { text: withCode(SESSION_STATUS_TEXT, state.session), state: knownOr(SESSION_STATUS_TEXT, state.session) }),
      make('dt', { text: '기기 상태(device)' }), make('dd', { text: withCode(DEVICE_STATUS_TEXT, state.device), state: knownOr(DEVICE_STATUS_TEXT, state.device) }),
    ]),
  );
  // 16단계: 연결되지 않은 조치가 넘어온 경우에만 비활성 안내 버튼을 둡니다. 클릭 처리·요청 전송은 없습니다.
  const actions = Array.isArray(event.supportedActions) ? event.supportedActions.filter(a => typeof a === 'string' && a) : [];
  if (actions.length) {
    const buttons = actions.map(action => {
      const button = make('button', { text: `${action} 미지원` });
      button.type = 'button';
      button.disabled = true;
      return button;
    });
    detail.append(
      make('h4', { text: '조치(supportedActions)' }),
      make('p', { className: 'state state-empty', text: '아직 지원하지 않는 조치입니다. 조치 실행 연결은 준비 중이며, 이 버튼은 요청을 보내지 않습니다.', state: 'unsupported' }),
      make('div', { className: 'event-actions' }, buttons),
    );
  }
  return detail;
}

function filterSelect(name, values, describe, onChange) {
  const select = make('select');
  select.append(make('option', { text: '전체' }));
  select.lastChild.value = 'all';
  for (const value of values) {
    const option = make('option', { text: describe(value) });
    option.value = value;
    select.append(option);
  }
  select.value = 'all';
  select.addEventListener('change', onChange);
  return { select, label: make('label', { text: `${name} ` }, [select]) };
}

function renderEventsView(input = {}) {
  const root = make('div', { className: 'events-view' });
  const status = typeof input.status === 'string' ? input.status : 'unknown';
  const notice = modeNotice(input);
  const add = (...nodes) => root.append(...nodes.filter(Boolean));

  if (status === 'loading') { add(make('p', { className: 'state state-loading', text: '기록 불러오는 중', state: 'loading' }), notice); return root; }
  if (status === 'error') {
    const code = input.error && input.error.code;
    const message = textOf(input.error && input.error.message, '서버 메시지 없음');
    // 계약과 다른 응답은 일부만 믿지 않고 확인 불가로 둡니다. 이전 목록은 새 DOM 이라 남지 않습니다.
    add(make('p', { className: 'state state-error', state: code === 'CONTRACT_MISMATCH' ? 'unknown' : 'error',
      text: code === 'CONTRACT_MISMATCH' ? `기록을 불러오지 못했습니다: 확인 불가(${message})` : `기록을 불러오지 못했습니다: ${message}` }), notice);
    return root;
  }
  if (status !== 'ok') { add(make('p', { className: 'state state-empty', text: '기록 상태 확인 불가(unknown)', state: 'unknown' }), notice); return root; }

  // 받은 배열은 그대로 두고 복사본만 최신순으로 정렬합니다.
  const events = (Array.isArray(input.data) ? input.data.slice() : [])
    .filter(e => e && typeof e === 'object' && typeof e.id === 'string')
    .sort((a, b) => timeOf(b.at) - timeOf(a.at));
  if (!events.length) { add(make('p', { className: 'state state-empty', text: '표시할 기록이 없습니다.', state: 'empty' }), notice); return root; }

  const unique = pick => [...new Set(events.map(pick).filter(v => typeof v === 'string' && v))];
  const count = make('p', { className: 'muted' });
  const list = make('ul', { className: 'records' });
  const detailArea = make('div');
  let selectedId = null;

  const kind = filterSelect('기록 종류', unique(e => e.kind), v => withCode(KIND_TEXT, v), () => draw());
  const app = filterSelect('업무 앱', unique(e => e.appId), v => v, () => draw());
  const access = filterSelect('접속 상태', unique(e => e.state && e.state.access), v => withCode(ACCESS_STATE_TEXT, v), () => draw());

  function showDetail(event) {
    selectedId = event ? event.id : null;
    detailArea.replaceChildren(...(event ? [eventDetail(event)] : []));
  }

  function draw() {
    const shown = events.filter(e => (kind.select.value === 'all' || e.kind === kind.select.value)
      && (app.select.value === 'all' || e.appId === app.select.value)
      && (access.select.value === 'all' || (e.state && e.state.access) === access.select.value));
    count.textContent = `표시 ${shown.length}건 / 받은 기록 ${events.length}건`;
    list.replaceChildren(...shown.map(event => {
      const button = make('button', { text: `${event.id} 상세` });
      button.type = 'button';
      button.addEventListener('click', () => showDetail(event));
      const row = make('li', {}, [
        make('span', { text: `${event.id} · ${timeText(event.at)} · ${withCode(KIND_TEXT, event.kind)} · 앱 ${appText(event.appId)} · ${textOf(event.summary, '요약 없음')} ` }),
        button,
      ]);
      row.dataset.studentEventId = event.id;
      return row;
    }));
    if (!shown.length) list.append(make('li', { className: 'state state-empty', text: '필터에 맞는 기록이 없습니다.' }));
    // 필터로 가려진 기록의 상세는 남기지 않습니다.
    if (selectedId && !shown.some(e => e.id === selectedId)) showDetail(null);
  }

  add(notice, make('div', { className: 'event-filters' }, [kind.label, app.label, access.label]), count, list, detailArea);
  draw();
  return root;
}

// ---------- 16단계: 알림·빈 상태·오류·진단 정보 (renderStatus) ----------
// 다시 시도는 사용자가 위쪽 「다시 불러오기」를 직접 누를 때만 일어납니다. 학생 코드는 자동 재요청·직접 조회를 하지 않습니다.
const RETRY_TEXT = '다시 시도는 위쪽 다시 불러오기 버튼을 직접 누르세요.';
const TIMEOUT_CODES = new Set(['TIMEOUT', 'REQUEST_TIMEOUT', 'ENGINE_TIMEOUT']);
const SAFE_CODE = /^[A-Za-z0-9_.:-]{1,80}$/;
const safeCode = code => (typeof code === 'string' && SAFE_CODE.test(code) ? code : '코드 확인 불가');
// 진단 값이 열쇠·토큰처럼 보이면 화면과 복사본 모두에서 가립니다.
const SECRET_LIKE = /(?:eyJ[A-Za-z0-9_-]{8,}|\bsk-[A-Za-z0-9_-]{8,}|\bBearer\s|-----BEGIN|sb_secret_|ghp_|github_pat_)/i;
const safeValue = value => {
  if (typeof value !== 'string' || !value) return '확인 불가';
  if (SECRET_LIKE.test(value) || value.length > 200) return '[가림]';
  return value;
};

// 받침에 맞춰 을/를을 붙입니다(예: 기기 목록을, 세션 정보를).
const objectOf = word => {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return `${word}${code >= 0 && code <= 11171 && code % 28 !== 0 ? '을' : '를'}`;
};

function failureLines(name, resource) {
  const code = resource.error && resource.error.code;
  const message = textOf(resource.error && resource.error.message, '서버 메시지 없음');
  const timeout = TIMEOUT_CODES.has(code);
  return [
    make('p', { className: 'state state-error', state: timeout ? 'timeout' : 'error',
      text: `${objectOf(name)} 불러오지 못했습니다${timeout ? '(시간 초과)' : ''}: ${message}` }),
    make('p', { text: RETRY_TEXT }),
  ];
}

function statusSection(title, resource, { name, empty, note, line }) {
  const section = make('section', {}, [make('h3', { text: title })]);
  if (note) section.append(make('p', { className: 'muted', text: note }));
  const notice = modeNotice(resource);
  if (notice) section.append(notice);
  const status = resource && typeof resource.status === 'string' ? resource.status : 'unknown';
  if (status === 'loading') { section.append(make('p', { className: 'state state-loading', text: `${name} 불러오는 중`, state: 'loading' })); return section; }
  if (status === 'error') { section.append(...failureLines(name, resource)); return section; }
  if (status !== 'ok') { section.append(make('p', { className: 'state state-empty', text: `${name} 확인 불가(unknown)`, state: 'unknown' })); return section; }
  const items = Array.isArray(resource.data) ? resource.data : [];
  if (!items.length) { section.append(make('p', { className: 'state state-empty', text: empty, state: 'empty' })); return section; }
  section.append(make('ul', {}, items.map(item => make('li', {}, line(item || {})))));
  return section;
}

function createStatusRenderer() {
  // 「도움정보 복사」 결과 안내. 다른 자료 때문에 다시 그려져도 같은 진단 결과에는 유지하고, 결과가 바뀌면 지웁니다.
  let copyFor = null;
  let copyMessage = '';

  return function renderStatusView(input = {}) {
    const root = make('div', { className: 'status-view' });
    const add = (...nodes) => root.append(...nodes.filter(Boolean));
    const topMode = typeof input.mode === 'string' && Object.hasOwn(MODE_TEXT, input.mode)
      ? make('p', { className: input.mode === 'demo' ? 'tag tag-demo' : 'state state-empty', text: `화면 자료 상태: ${MODE_TEXT[input.mode]}`, state: input.mode }) : null;

    const devices = statusSection('등록 기기', input.devices, {
      name: '기기 목록', empty: '등록된 기기가 없습니다.',
      line: d => [make('span', { text: `${textOf(d.label)} (${idText(d.id)}) · ` }), make('span', { text: withCode(DEVICE_STATUS_TEXT, d.status), state: knownOr(DEVICE_STATUS_TEXT, d.status) })],
    });
    const sessions = statusSection('현재 세션', input.sessions, {
      name: '세션 정보', empty: '현재 연결 없음',
      note: '현재 검증된 연결 하나만 표시합니다. 지난 세션 목록이 아닙니다.',
      line: s => [make('span', { text: `${idText(s.id)} · ` }), make('span', { text: withCode(SESSION_STATUS_TEXT, s.status), state: knownOr(SESSION_STATUS_TEXT, s.status) })],
    });

    const list = Array.isArray(input.notifications) ? input.notifications : [];
    const notifications = make('section', {}, [make('h3', { text: '알림' })]);
    if (!list.length) notifications.append(make('p', { className: 'state state-ok', text: '주의할 알림이 없습니다.', state: 'none' }));
    else notifications.append(make('ul', {}, list.map(n => make('li', {
      text: `자료 ${textOf(n && n.resource, '확인 불가')} · 코드 ${safeCode(n && n.code)} · ${textOf(n && n.message, '메시지 없음')}` }))));

    // 도움정보: 제공 화면이 조회해 넘긴 결과에서 여섯 항목만 보여 주고 복사합니다.
    const diag = input.diagnostics || {};
    const help = make('section', {}, [make('h3', { text: '도움정보' }),
      make('p', { className: 'muted', text: '도움을 요청할 때 전달할 수 있도록 아래 여섯 항목만 복사합니다. 버튼을 누를 때만 복사합니다.' })]);
    let safe = null;
    if (diag.status === 'ok' && diag.data && typeof diag.data === 'object') {
      const engine = diag.data.engine && typeof diag.data.engine === 'object' ? diag.data.engine : {};
      safe = { requestId: safeValue(diag.data.requestId), component: safeValue(diag.data.component), version: safeValue(diag.data.version),
        checkedAt: safeValue(diag.data.checkedAt), 'engine.mode': safeValue(engine.mode), 'engine.code': safeValue(engine.code) };
      help.append(make('dl', {}, Object.entries(safe).flatMap(([k, v]) => [make('dt', { text: k }), make('dd', { text: v })])));
    } else if (diag.status === 'loading') {
      help.append(make('p', { className: 'state state-loading', text: '도움정보 불러오는 중', state: 'loading' }));
    } else if (diag.status === 'error') {
      const code = diag.error && diag.error.code;
      help.append(make('p', { className: 'state state-error', state: TIMEOUT_CODES.has(code) ? 'timeout' : 'error',
        text: `도움정보를 불러오지 못했습니다${TIMEOUT_CODES.has(code) ? '(시간 초과)' : ''}: ${textOf(diag.error && diag.error.message, '서버 메시지 없음')}` }),
        make('p', { text: '다시 시도는 위쪽 「도움정보 불러오기」 버튼을 직접 누르세요.' }));
    } else {
      help.append(make('p', { className: 'state state-empty', text: '도움정보를 아직 불러오지 않았습니다. 위쪽 「도움정보 불러오기」 버튼을 직접 누르세요.', state: 'idle' }));
    }
    const key = safe ? JSON.stringify(safe) : null;
    if (key !== copyFor) { copyFor = key; copyMessage = ''; }
    const copyButton = make('button', { text: '도움정보 복사' });
    copyButton.type = 'button';
    copyButton.disabled = !safe;
    const copyStatus = make('p', { className: 'muted', text: copyMessage || (safe ? '' : '도움정보를 불러온 뒤 복사할 수 있습니다.') });
    copyButton.addEventListener('click', async () => {
      if (!safe) return;
      const text = JSON.stringify(safe, null, 2);
      try {
        await navigator.clipboard.writeText(text);
        copyMessage = '도움정보 여섯 항목을 클립보드에 복사했습니다.';
      } catch {
        copyMessage = '복사하지 못했습니다. 브라우저가 클립보드 접근을 허용하지 않았습니다. 위 값을 직접 선택해 복사하세요.';
      }
      copyStatus.textContent = copyMessage;
    });
    help.append(copyButton, copyStatus);

    add(topMode, devices, sessions, notifications, help);
    return root;
  };
}

export function createStudentView() {
  const renderStatusView = createStatusRenderer();
  return {
    // 앱은 다시 불러오기마다 이 칸을 통째로 교체한다. 매번 새 DOM 을 만들어 이전 값을 재사용하지 않는다.
    renderIdentity(input) { return renderIdentityView(input); },
    // 요청할 때마다 새 DOM 을 만들어, 앞서 고른 앱의 판정이 남지 않게 한다.
    renderDecision(input) { return renderDecisionView(input); },
    // 새 자료가 올 때마다 새 DOM 을 만들어 이전 목록·필터·상세 선택을 모두 지운다.
    renderEvents(input) { return renderEventsView(input); },
    // 기기·세션·알림·도움정보를 매번 현재 값으로 새로 그린다. 다시 불러와 성공하면 이전 실패 안내는 남지 않는다.
    renderStatus(input) { return renderStatusView(input); },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}

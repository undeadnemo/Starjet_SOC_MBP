const readiness = [
  ['飞机 Aircraft', 100, '✓', 'ready'], ['机组 Crew', 100, '✓', 'ready'],
  ['旅客 Passenger', 78, '!', 'warning'], ['地面保障 Handling', 100, '✓', 'ready'],
  ['燃油 Fuel', 100, '✓', 'ready'], ['许可 Permit', 62, '✕', 'blocking'],
  ['时刻 Slot', 100, '✓', 'ready'], ['文件 Documents', 75, '!', 'warning']
];

const tripLegs = [
  {
    dep:'ZBAA', depName:'北京首都 · PEK', depDate:'20 AUG', depIso:'2026-08-20', depLocal:'06:00', depUtc:'22:00', depBeijing:'06:00',
    arr:'RJTT', arrName:'东京羽田 · HND', arrDate:'20 AUG', arrIso:'2026-08-20', arrLocal:'10:20', arrUtc:'01:20', arrBeijing:'09:20',
    duration:'3H 20M', distance:'4,621 KM · IFR', taskType:'CHARTER', aircraft:'B-8263', movementState:'arrived', movementUpdatedAt:'10:33:04',
    estimatedDep:{ lt:'06:10', utc:'22:10', beijing:'06:10' }, estimatedArr:{ lt:'10:28', utc:'01:28', beijing:'09:28' },
    actualDep:{ lt:'06:08', utc:'22:08', beijing:'06:08' }, actualArr:{ lt:'10:31', utc:'01:31', beijing:'09:31' },
  },
  {
    dep:'RJTT', depName:'东京羽田 · HND', depDate:'20 AUG', depIso:'2026-08-20', depLocal:'14:20', depUtc:'05:20', depBeijing:'13:20',
    arr:'WSSS', arrName:'新加坡樟宜 · SIN', arrDate:'20 AUG', arrIso:'2026-08-20', arrLocal:'20:35', arrUtc:'12:35', arrBeijing:'20:35',
    duration:'7H 15M', distance:'5,315 KM · IFR', taskType:'CHARTER', aircraft:'B-8263', movementState:'departed', movementUpdatedAt:'14:39:26',
    estimatedDep:{ lt:'14:35', utc:'05:35', beijing:'13:35' }, estimatedArr:{ lt:'20:48', utc:'12:48', beijing:'20:48' },
    actualDep:{ lt:'14:37', utc:'05:37', beijing:'13:37' }, actualArr:null,
  },
  {
    dep:'WSSS', depName:'新加坡樟宜 · SIN', depDate:'22 AUG', depIso:'2026-08-22', depLocal:'09:00', depUtc:'01:00', depBeijing:'09:00',
    arr:'ZBAA', arrName:'北京首都 · PEK', arrDate:'22 AUG', arrIso:'2026-08-22', arrLocal:'15:10', arrUtc:'07:10', arrBeijing:'15:10',
    duration:'6H 10M', distance:'4,460 KM · IFR', taskType:'FERRY', aircraft:'B-9811', movementState:'planned', movementUpdatedAt:'10:32:18',
    estimatedDep:{ lt:'09:00', utc:'01:00', beijing:'09:00' }, estimatedArr:{ lt:'15:10', utc:'07:10', beijing:'15:10' },
    actualDep:null, actualArr:null,
  }
];
let activeLeg = 1;
let timeBasis = 'lt';

const aircraftProfiles = {
  'B-8263': { model: 'G450', parkingAirport: 'ZSSS', parkingTime: '2026-08-22 19:51' },
  'B-602M': { model: 'Legacy 650', parkingAirport: 'ZGSZ', parkingTime: '2026-08-22 10:40' },
  'B-9308': { model: 'G450', parkingAirport: 'ZSPD', parkingTime: '2026-08-21 16:20' },
  'B-9811': { model: 'G650ER', parkingAirport: 'ZBAA', parkingTime: '2026-08-22 17:10' },
  'B-801Q': { model: 'G650ER', parkingAirport: 'ZUUU', parkingTime: '2026-08-20 12:00' },
};

const airportProfiles = {
  RJTT: '东京羽田 · HND',
  VHHH: '香港国际 · HKG',
  WSSS: '新加坡樟宜 · SIN',
  ZBAA: '北京首都 · PEK',
  ZGGG: '广州白云 · CAN',
  ZGSZ: '深圳宝安 · SZX',
  ZSPD: '上海浦东 · PVG',
  ZSSS: '上海虹桥 · SHA',
  ZUUU: '成都双流 · CTU',
};

const detailParams = new URLSearchParams(window.location.search);
const detailTheme = detailParams.get('theme') === 'light' ? 'light' : 'dark';
document.documentElement.classList.toggle('light', detailTheme === 'light');
document.documentElement.classList.toggle('dark', detailTheme === 'dark');
const billTemplateStorageKey = 'starjet-flight-bill-templates';
const baseBillTemplates = [
  { code: 'PAX', label: '客运包机', types: [
    { id: 1, name: '航油账单', owner: 'flight' }, { id: 2, name: '地面代理费', owner: 'flight' }, { id: 3, name: '机场费用', owner: 'flight' }, { id: 4, name: '餐食费用', owner: 'trip' }, { id: 5, name: '旅客服务费', owner: 'trip' },
  ] },
  { code: 'FERRY', label: '调机', types: [
    { id: 6, name: '航油账单', owner: 'flight' }, { id: 7, name: '地面代理费', owner: 'flight' }, { id: 8, name: '机场费用', owner: 'flight' },
  ] },
  { code: 'MX', label: '维修', types: [
    { id: 9, name: '维修航材费', owner: 'flight' }, { id: 10, name: '维修工时费', owner: 'flight' }, { id: 11, name: '停场费', owner: 'trip' },
  ] },
  { code: 'AOG', label: 'AOG', types: [
    { id: 12, name: '航材采购费', owner: 'flight' }, { id: 13, name: '紧急物流费', owner: 'flight' }, { id: 14, name: '维修服务费', owner: 'trip' },
  ] },
];
const billRouteScopes = [
  { label: '国内', value: 'domestic' },
  { label: '跨境', value: 'crossBorder' },
  { label: '国际', value: 'international' },
];
const defaultBillTemplates = baseBillTemplates.flatMap((template) => billRouteScopes.map((scope, scopeIndex) => ({
  ...template,
  scope: scope.value,
  scopeLabel: scope.label,
  types: template.types.map((item) => ({ ...item, id: item.id + scopeIndex * 100 })),
})));
const completedPaymentApplications = [
  { amount: '付款 CNY 28,600', billType: '地面代理费', flightType: 'PAX', id: 'FK-20260823-006', routeScope: 'domestic', title: '广州地面保障费用', updatedAt: '2026-08-24 11:08' },
  { amount: '付款 HKD 46,200', billType: '地面代理费', flightType: 'FERRY', id: 'FK-20260818-007', routeScope: 'crossBorder', title: '香港航段落地服务费用', updatedAt: '2026-08-21 10:02' },
];

function readBillTemplates() {
  try {
    const saved = JSON.parse(localStorage.getItem(billTemplateStorageKey) || 'null');
    if (!Array.isArray(saved) || !saved.some((item) => item?.code && Array.isArray(item.types))) return defaultBillTemplates;
    if (saved.every((item) => item.scope)) return saved;
    return saved.flatMap((template) => billRouteScopes.map((scope, scopeIndex) => ({
      ...template,
      scope: scope.value,
      scopeLabel: scope.label,
      types: template.types.map((item) => ({ ...item, id: item.id + scopeIndex * 100 })),
    })));
  } catch {
    return defaultBillTemplates;
  }
}

function normalizeBillFlightType(taskType) {
  const value = String(taskType || '').toUpperCase();
  if (['CHARTER', 'PAX', 'PASSENGER'].includes(value)) return 'PAX';
  if (['FERRY', 'MX', 'AOG'].includes(value)) return value;
  return 'PAX';
}

function resolveBillRouteScope(departure, arrival) {
  const airports = [departure, arrival].map((airport) => String(airport || '').toUpperCase());
  const isMainland = (airport) => /^Z[A-Z]{3}$/.test(airport);
  const isCrossBorder = (airport) => airport === 'VHHH' || airport === 'VMMC' || /^RC[A-Z]{2}$/.test(airport);
  if (airports.every(isMainland)) return 'domestic';
  if (airports.every((airport) => isMainland(airport) || isCrossBorder(airport)) && airports.some(isCrossBorder)) return 'crossBorder';
  return 'international';
}

function paymentApplicationHref(applicationId) {
  let routePrefix = '/preview';
  try {
    const parentPath = window.parent.location.pathname;
    routePrefix = parentPath.startsWith('/demo/') ? '/demo' : parentPath.startsWith('/preview/') ? '/preview' : '/finance';
  } catch { /* iframe may run independently */ }
  const base = routePrefix === '/finance' ? '/finance/payment-application' : `${routePrefix}/payment-application`;
  return `${base}?applicationId=${encodeURIComponent(applicationId)}`;
}

function renderBilling(leg) {
  const flightType = normalizeBillFlightType(leg?.taskType);
  const routeScope = resolveBillRouteScope(leg?.dep, leg?.arr);
  const scopeLabel = billRouteScopes.find((item) => item.value === routeScope)?.label || '国内';
  const templates = readBillTemplates();
  const template = templates.find((item) => item.code === flightType && item.scope === routeScope)
    || templates.find((item) => item.code === flightType)
    || defaultBillTemplates[0];
  const flightNo = detailParams.get('flightNo') || `航班 ${activeLeg + 1}`;
  const records = template.types.map((item, index) => {
    const payment = completedPaymentApplications.find((application) => application.flightType === flightType && application.routeScope === routeScope && application.billType === item.name);
    const state = payment ? 'paid' : index === 0 || index % 3 === 1 ? 'received' : 'missing';
    return { ...item, payment, state };
  });
  const counts = {
    missing: records.filter((item) => item.state === 'missing').length,
    paid: records.filter((item) => item.state === 'paid').length,
    received: records.filter((item) => item.state === 'received').length,
  };
  document.querySelector('#billingTemplateLabel').textContent = `${template.label} · ${scopeLabel} · ${flightNo}`;
  document.querySelector('#billingTotal').textContent = records.length;
  document.querySelector('#billingMissing').textContent = counts.missing;
  document.querySelector('#billingReceived').textContent = counts.received;
  document.querySelector('#billingPaid').textContent = counts.paid;
  const tabStatus = document.querySelector('#billingTabStatus');
  tabStatus.className = `tab-module-status ${counts.missing ? 'warning' : 'ready'}`;
  tabStatus.querySelector('span').textContent = counts.missing || records.length;
  tabStatus.setAttribute('aria-label', counts.missing ? `${counts.missing} 项账单待上传` : '账单已齐');
  tabStatus.title = tabStatus.getAttribute('aria-label');
  const table = document.querySelector('#billingTable');
  table.innerHTML = `<div class="billing-row billing-head"><span>账单类型</span><span>归属对象</span><span>账单状态</span><span>财务联动</span><span>最近更新</span></div>${records.map((item) => {
    const stateLabel = item.state === 'paid' ? '已付款' : item.state === 'received' ? '已上传' : '待上传';
    const financeLink = item.payment
      ? `<a href="${paymentApplicationHref(item.payment.id)}" target="_top"><b>${escapeHtml(item.payment.id)}</b><small>${escapeHtml(item.payment.amount)}</small></a>`
      : '<span class="billing-no-link">暂无付款申请</span>';
    const updatedAt = item.payment?.updatedAt || (item.state === 'received' ? '2026-08-27 09:18' : '—');
    return `<div class="billing-row"><span><b>${escapeHtml(item.name)}</b><small>${escapeHtml(template.label)} · ${scopeLabel}预配置</small></span><span>${item.owner === 'trip' ? '行程' : '航班'}</span><span><em class="billing-state is-${item.state}"><i></i>${stateLabel}</em></span><span>${financeLink}</span><time>${updatedAt}</time></div>`;
  }).join('')}`;
}
const movementStateMeta = {
  planned: { label: '计划', code: 'PLAN', summary: '航班按计划准备，尚未起飞' },
  departed: { label: '已起飞', code: 'AIR', summary: '航班已离港，持续更新预计到达时间' },
  arrived: { label: '已到达', code: 'ARR', summary: '航班已到达，实际起降时间已记录' },
};
const movementStateAliases = { plan: 'planned', planning: 'planned', airborne: 'departed', inair: 'departed', landed: 'arrived' };
const timeLabel = value => value && value.length === 4 ? `${value.slice(0, 2)}:${value.slice(2)}` : value;
const dateLabel = value => {
  if (!value) return '';
  const [year, month, day] = value.split('-').map(Number);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return year && month && day ? `${String(day).padStart(2, '0')} ${months[month - 1]}` : value;
};

const todoStatusMeta = {
  completed: { label: '完成', className: 'completed' },
  pending: { label: '待处理', className: 'pending' },
  blocked: { label: '阻碍', className: 'blocked' },
};

const fallbackTodos = [
  { content: '机务窗口 已确认', status: 'completed' },
  { content: '加油不适用', status: 'pending' },
];

const defaultAnnouncements = [
  { author: '张园', content: '变更日期 8.23 → 8.22', createdAt: '8.20 18:17' },
  { author: '李悦', content: '时间提前一天至 8.21，21:41 起飞', createdAt: '8.20 21:41' },
];

const announcementKey = `starjet-flight-announcements:${detailParams.get('flightId') || 'default'}`;

function readAnnouncements() {
  try {
    const saved = JSON.parse(localStorage.getItem(announcementKey) || 'null');
    return Array.isArray(saved) ? saved : defaultAnnouncements;
  } catch {
    return defaultAnnouncements;
  }
}

let announcements = readAnnouncements();

function renderAnnouncements() {
  const list = document.querySelector('#announcementList');
  document.querySelector('#announcementCount').textContent = announcements.length;
  list.innerHTML = announcements.map((announcement) => `<article class="announcement-item">
    <p>${escapeHtml(announcement.content)}</p>
    <footer><span>${escapeHtml(announcement.author)}</span><time>${escapeHtml(announcement.createdAt)}</time></footer>
  </article>`).join('');
}

function formatAnnouncementTime(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}.${day} ${hours}:${minutes}`;
}

const escapeHtml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

function parseDetailTodos() {
  const encodedTodos = detailParams.get('todos');
  if (!encodedTodos) return fallbackTodos;
  try {
    const todos = JSON.parse(encodedTodos);
    if (!Array.isArray(todos)) return fallbackTodos;
    return todos
      .filter(todo => todo && typeof todo.content === 'string' && todoStatusMeta[todo.status])
      .map(todo => ({ content: todo.content.trim(), status: todo.status }))
      .filter(todo => todo.content);
  } catch {
    return fallbackTodos;
  }
}

let detailTodos = parseDetailTodos();

function renderDetailTodos() {
  const counts = { completed: 0, pending: 0, blocked: 0 };
  detailTodos.forEach(todo => { counts[todo.status] += 1; });
  document.querySelector('#todoCount').textContent = detailTodos.length;
  document.querySelector('#completedTodoCount').textContent = counts.completed;
  document.querySelector('#pendingTodoCount').textContent = counts.pending;
  document.querySelector('#blockedTodoCount').textContent = counts.blocked;
  const list = document.querySelector('#detailTodoList');
  if (!detailTodos.length) {
    list.innerHTML = '<p class="todo-empty">当前航班暂无待办事项</p>';
    return;
  }
  list.innerHTML = detailTodos.map((todo, index) => `<article class="detail-todo">
      <input aria-label="待办内容" data-todo-content="${index}" value="${escapeHtml(todo.content)}" />
      <div class="detail-todo-status" role="radiogroup" aria-label="待办状态：${todoStatusMeta[todo.status].label}">
        ${Object.entries(todoStatusMeta).map(([value, status]) => `<button class="status-${status.className}${todo.status === value ? ' is-active' : ''}" data-todo-status="${value}" data-todo-index="${index}" type="button" role="radio" aria-checked="${todo.status === value}" aria-label="设为${status.label}" title="${status.label}"><i aria-hidden="true"></i></button>`).join('')}
      </div>
      <button class="detail-todo-delete" data-todo-delete="${index}" type="button" aria-label="删除待办：${escapeHtml(todo.content)}">×</button>
    </article>`).join('');
}

if (detailParams.get('from') && detailParams.get('to')) {
  const flightSequence = { 'FP-208': 0, 'FP-209': 1, 'FP-211': 2 };
  const selectedLegIndex = flightSequence[detailParams.get('flightId')] ?? 1;
  const selectedLeg = tripLegs[selectedLegIndex];
  activeLeg = selectedLegIndex;
  selectedLeg.dep = detailParams.get('from');
  selectedLeg.arr = detailParams.get('to');
  selectedLeg.depName = detailParams.get('fromName') || airportProfiles[selectedLeg.dep] || `${selectedLeg.dep} 机场`;
  selectedLeg.arrName = detailParams.get('toName') || airportProfiles[selectedLeg.arr] || `${selectedLeg.arr} 机场`;
  selectedLeg.depIso = detailParams.get('date') || selectedLeg.depIso;
  selectedLeg.arrIso = selectedLeg.depIso;
  selectedLeg.depDate = dateLabel(detailParams.get('date'));
  selectedLeg.arrDate = selectedLeg.depDate;
  selectedLeg.depLocal = timeLabel(detailParams.get('std'));
  selectedLeg.arrLocal = timeLabel(detailParams.get('sta'));
  selectedLeg.depUtc = selectedLeg.depLocal;
  selectedLeg.arrUtc = selectedLeg.arrLocal;
  selectedLeg.depBeijing = selectedLeg.depLocal;
  selectedLeg.arrBeijing = selectedLeg.arrLocal;
  const requestedState = detailParams.get('status')?.toLowerCase();
  selectedLeg.movementState = movementStateMeta[requestedState] ? requestedState : movementStateAliases[requestedState] || selectedLeg.movementState;
  selectedLeg.estimatedDep = {
    lt: timeLabel(detailParams.get('etd')) || selectedLeg.depLocal,
    utc: timeLabel(detailParams.get('etdUtc')) || selectedLeg.depUtc,
    beijing: timeLabel(detailParams.get('etdBeijing')) || selectedLeg.depBeijing,
  };
  selectedLeg.estimatedArr = {
    lt: timeLabel(detailParams.get('eta')) || selectedLeg.arrLocal,
    utc: timeLabel(detailParams.get('etaUtc')) || selectedLeg.arrUtc,
    beijing: timeLabel(detailParams.get('etaBeijing')) || selectedLeg.arrBeijing,
  };
  const actualDeparture = timeLabel(detailParams.get('atd'));
  const actualArrival = timeLabel(detailParams.get('ata'));
  if (actualDeparture) selectedLeg.actualDep = { lt: actualDeparture, utc: timeLabel(detailParams.get('atdUtc')) || actualDeparture, beijing: timeLabel(detailParams.get('atdBeijing')) || actualDeparture };
  if (actualArrival) selectedLeg.actualArr = { lt: actualArrival, utc: timeLabel(detailParams.get('ataUtc')) || actualArrival, beijing: timeLabel(detailParams.get('ataBeijing')) || actualArrival };

  const flightId = detailParams.get('flightId');
  const flightNo = detailParams.get('flightNo');
  const aircraft = detailParams.get('aircraft');
  const type = detailParams.get('type');
  if (type) selectedLeg.taskType = type.toUpperCase();
  if (aircraft && aircraftProfiles[aircraft]) selectedLeg.aircraft = aircraft;
  const activeLegCard = document.querySelector(`.leg-card[data-leg="${selectedLegIndex}"]`);
  if (activeLegCard) {
    activeLegCard.querySelector('b').textContent = `${selectedLeg.dep} → ${selectedLeg.arr}`;
    activeLegCard.querySelector('span').textContent = `${selectedLeg.depDate} · ${selectedLeg.depLocal}–${selectedLeg.arrLocal}`;
  }
  if (flightId) document.querySelector('.crumbs strong').textContent = flightId;
  if (flightNo) document.querySelector('#crumbLeg').textContent = flightNo;
  if (detailParams.get('tripId')) {
    const summary = document.querySelector('.trip-summary small');
    summary.textContent = summary.textContent.replace('TRIP-20260820-001', detailParams.get('tripId'));
  }
}

const flightEditKey = `starjet-flight-edits:${detailParams.get('flightId') || 'default'}`;
let savedFlightEdits = {};
try {
  savedFlightEdits = JSON.parse(localStorage.getItem(flightEditKey) || '{}') || {};
} catch {
  savedFlightEdits = {};
}
Object.entries(savedFlightEdits).forEach(([index, edit]) => {
  if (tripLegs[Number(index)] && edit && typeof edit === 'object') Object.assign(tripLegs[Number(index)], edit);
});

function renderAircraft(registration) {
  const profile = aircraftProfiles[registration] || aircraftProfiles['B-8263'];
  document.querySelector('#aircraftRegistration').textContent = registration;
  document.querySelector('#aircraftModel').textContent = profile.model;
  document.querySelector('#aircraftParkingAirport').textContent = profile.parkingAirport;
  document.querySelector('#aircraftParkingTime').textContent = profile.parkingTime;
  document.querySelector('#aircraftDetailRegistration').textContent = registration;
  document.querySelector('#aircraftDetailModel').textContent = profile.model;
  document.querySelector('#overviewAircraft').textContent = `${registration} · ${profile.model}`;
  document.querySelector('#aircraftCurrentPosition').textContent = `${profile.parkingAirport} · ${airportProfiles[profile.parkingAirport] || '当前位置'}`;
  document.querySelector('#aircraftPositionTime').textContent = `定位时间 ${profile.parkingTime} BJ`;
  const nextLeg = tripLegs.slice(activeLeg + 1).find(leg => leg.aircraft === registration);
  const nextLegInfo = document.querySelector('#nextLegInfo');
  nextLegInfo.hidden = !nextLeg;
  if (nextLeg) {
    document.querySelector('#aircraftNextLeg').textContent = `${nextLeg.dep} → ${nextLeg.arr}`;
    document.querySelector('#aircraftNextLegTime').textContent = `${nextLeg.depDate} · ${nextLeg.depLocal}–${nextLeg.arrLocal} BJ`;
  }
}

function renderMovement(leg, depField, arrField, basisLabel) {
  const meta = movementStateMeta[leg.movementState] || movementStateMeta.planned;
  const basisKey = timeBasis === 'beijing' ? 'beijing' : timeBasis;
  const value = (timeSet, fallback = '—') => timeSet?.[basisKey] || fallback;
  const setTime = (selector, time, empty = false) => {
    const element = document.querySelector(selector);
    element.textContent = time === '—' ? time : `${time} ${basisLabel}`;
    element.classList.toggle('is-empty', empty || time === '—');
  };

  const status = document.querySelector('#movementStatus');
  status.className = `movement-status is-${leg.movementState || 'planned'}`;
  status.querySelector('span').textContent = meta.label;
  document.querySelector('#movementSummary').textContent = meta.summary;
  document.querySelector('#movementUpdatedAt').textContent = `最后同步 ${leg.movementUpdatedAt || '刚刚'}`;
  document.querySelector('.plane-mark').textContent = meta.code;

  setTime('#scheduledDeparture', leg[depField]);
  setTime('#scheduledArrival', leg[arrField]);
  setTime('#estimatedDeparture', value(leg.estimatedDep, leg[depField]));
  setTime('#estimatedArrival', value(leg.estimatedArr, leg[arrField]));
  setTime('#actualDeparture', value(leg.actualDep), !leg.actualDep);
  setTime('#actualArrival', value(leg.actualArr), !leg.actualArr);
}

function renderLeg(index) {
  activeLeg = index;
  const leg = tripLegs[index];
  document.querySelector('#depCode').textContent = leg.dep;
  document.querySelector('#depName').textContent = leg.depName;
  document.querySelector('#arrCode').textContent = leg.arr;
  document.querySelector('#arrName').textContent = leg.arrName;
  document.querySelector('#flightDuration').textContent = leg.duration;
  document.querySelector('#flightDistance').textContent = leg.distance;
  document.querySelector('.trip-type').textContent = leg.taskType;
  document.querySelector('#flightTaskType').textContent = leg.taskType;
  renderBilling(leg);
  document.querySelector('#timelineDepTime').textContent = leg.depLocal;
  document.querySelector('#timelineArrTime').textContent = leg.arrLocal;
  document.querySelector('#serviceDepartureAirport').textContent = `${leg.dep} · ${leg.depName.split(' · ')[0]}`;
  document.querySelector('#serviceArrivalAirport').textContent = `${leg.arr} · ${leg.arrName.split(' · ')[0]}`;
  renderAircraft(leg.aircraft);
  const timeFields = {
    beijing: ['depBeijing', 'arrBeijing', 'BJ'],
    lt: ['depLocal', 'arrLocal', 'LT'],
    utc: ['depUtc', 'arrUtc', 'UTC'],
  };
  const [depField, arrField, basisLabel] = timeFields[timeBasis];
  document.querySelector('#depTime').innerHTML = `${leg.depDate}&nbsp; ${leg[depField]} <small>${basisLabel}</small>`;
  document.querySelector('#arrTime').innerHTML = `${leg.arrDate}&nbsp; ${leg[arrField]} <small>${basisLabel}</small>`;
  renderMovement(leg, depField, arrField, basisLabel);
  document.querySelector('#crumbLeg').textContent = `航班 ${index + 1}`;
  document.querySelector('#legNumber').textContent = index + 1;
  document.querySelectorAll('.leg-card').forEach((card, cardIndex) => {
    const cardLeg = tripLegs[cardIndex];
    const cardMovement = movementStateMeta[cardLeg.movementState] || movementStateMeta.planned;
    card.querySelector('small').textContent = `航班 ${cardIndex + 1} · ${cardMovement.label}`;
    card.querySelector('b').textContent = `${cardLeg.dep} → ${cardLeg.arr}`;
    card.querySelector('span').textContent = `${cardLeg.depDate} · ${cardLeg.depLocal}–${cardLeg.arrLocal}`;
    card.classList.toggle('completed', cardLeg.movementState === 'arrived');
    card.classList.toggle('active', cardIndex === index);
    if (cardIndex === index) card.setAttribute('aria-current', 'true'); else card.removeAttribute('aria-current');
  });
  document.querySelector('#prevLeg').disabled = index === 0;
  document.querySelector('#nextLeg').disabled = index === tripLegs.length - 1;
}

document.querySelectorAll('.leg-card').forEach(card => card.addEventListener('click', () => renderLeg(Number(card.dataset.leg))));
document.querySelector('#prevLeg').addEventListener('click', () => renderLeg(activeLeg - 1));
document.querySelector('#nextLeg').addEventListener('click', () => renderLeg(activeLeg + 1));
document.querySelector('.back-btn').addEventListener('click', () => {
  if (window.parent !== window) window.parent.postMessage('flight-detail:back', window.location.origin);
  else window.history.back();
});

renderDetailTodos();
renderAnnouncements();

const detailTodoList = document.querySelector('#detailTodoList');
detailTodoList.addEventListener('input', event => {
  const input = event.target.closest('[data-todo-content]');
  if (!input) return;
  const index = Number(input.dataset.todoContent);
  if (detailTodos[index]) detailTodos[index].content = input.value;
});
detailTodoList.addEventListener('click', event => {
  const statusButton = event.target.closest('[data-todo-status]');
  if (statusButton) {
    const index = Number(statusButton.dataset.todoIndex);
    if (detailTodos[index] && todoStatusMeta[statusButton.dataset.todoStatus]) {
      detailTodos[index].status = statusButton.dataset.todoStatus;
      renderDetailTodos();
    }
    return;
  }
  const deleteButton = event.target.closest('[data-todo-delete]');
  if (!deleteButton) return;
  detailTodos.splice(Number(deleteButton.dataset.todoDelete), 1);
  renderDetailTodos();
});

const detailTodoInput = document.querySelector('#detailTodoInput');
const addDetailTodo = () => {
  const content = detailTodoInput.value.trim();
  if (!content) return;
  detailTodos.push({ content, status: 'pending' });
  detailTodoInput.value = '';
  renderDetailTodos();
  detailTodoInput.focus();
};
document.querySelector('#addDetailTodo').addEventListener('click', addDetailTodo);
detailTodoInput.addEventListener('keydown', event => {
  if (event.key !== 'Enter' || event.shiftKey) return;
  event.preventDefault();
  addDetailTodo();
});

const announcementForm = document.querySelector('#announcementForm');
document.querySelector('#addAnnouncement').addEventListener('click', () => {
  announcementForm.hidden = false;
  document.querySelector('#announcementContent').focus();
});
document.querySelector('#cancelAnnouncement').addEventListener('click', () => {
  announcementForm.hidden = true;
  announcementForm.reset();
  document.querySelector('#announcementAuthor').value = '张园';
});
announcementForm.addEventListener('submit', event => {
  event.preventDefault();
  const content = document.querySelector('#announcementContent').value.trim();
  const author = document.querySelector('#announcementAuthor').value.trim();
  if (!content || !author) return;
  announcements.unshift({ author, content, createdAt: formatAnnouncementTime(new Date()) });
  localStorage.setItem(announcementKey, JSON.stringify(announcements));
  renderAnnouncements();
  announcementForm.hidden = true;
  announcementForm.reset();
  document.querySelector('#announcementAuthor').value = author;
  showToast('航班公告已发布');
});

document.querySelector('#readinessList').innerHTML = readiness.map(([name, pct, icon, state]) =>
  `<div class="readiness-row ${state}"><b>${name}</b><span><i style="width:${pct}%"></i></span><em>${icon}</em></div>`
).join('');

let navigationTarget = '';

function setActiveTab(id) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === id));
}

function switchTab(id) {
  navigationTarget = id;
  setActiveTab(id);
  const target = document.querySelector(`#${id}`);
  if (target) target.scrollIntoView({behavior:'smooth', block:'start'});
  window.setTimeout(() => {
    setActiveTab(id);
  }, 700);
}

document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.tab)));
document.querySelectorAll('[data-jump]').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.jump)));

const sectionObserver = new IntersectionObserver(entries => {
  if (navigationTarget) return;
  const visibleSection = entries
    .filter(entry => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visibleSection) return;
  setActiveTab(visibleSection.target.id);
}, { rootMargin: '-74px 0px -58% 0px', threshold: [0.05, 0.2, 0.5] });

document.querySelectorAll('.tab-panel:not(.retired-overview)').forEach(panel => sectionObserver.observe(panel));

const resumeScrollTracking = () => { navigationTarget = ''; };
window.addEventListener('wheel', resumeScrollTracking, { passive: true });
window.addEventListener('touchstart', resumeScrollTracking, { passive: true });
window.addEventListener('keydown', event => {
  if (['ArrowDown', 'ArrowUp', 'End', 'Home', 'PageDown', 'PageUp', ' '].includes(event.key)) resumeScrollTracking();
});

const timeToggle = document.querySelector('#timeToggle');
timeToggle.addEventListener('click', event => {
  const button = event.target.closest('[data-time-basis]');
  if (!button) return;
  timeBasis = button.dataset.timeBasis;
  timeToggle.querySelectorAll('[data-time-basis]').forEach(option => {
    const selected = option === button;
    option.classList.toggle('active', selected);
    option.setAttribute('aria-pressed', String(selected));
  });
  renderLeg(activeLeg);
});

renderLeg(activeLeg);

const changeRecordList = document.querySelector('#changeRecordList');
const selectChangeRecord = (record, notify = false) => {
  if (!record) return;
  document.querySelectorAll('[data-change-record]').forEach(item => {
    const active = item === record;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
    item.querySelector('em').textContent = active ? '生效' : '设为生效';
  });
  if (notify) showToast('已更新当前生效的航班变更记录');
};
changeRecordList?.addEventListener('click', event => {
  selectChangeRecord(event.target.closest('[data-change-record]'), true);
});
const newestChangeRecord = [...(changeRecordList?.querySelectorAll('[data-change-record]') || [])]
  .sort((a, b) => new Date(b.dataset.recordTime) - new Date(a.dataset.recordTime))[0];
selectChangeRecord(newestChangeRecord);

document.querySelector('#passengerDocumentUpload')?.addEventListener('change', event => {
  const [file] = event.target.files;
  if (!file) return;
  const status = document.querySelector('#passengerOcrStatus');
  status.hidden = false;
  status.innerHTML = `<b>${escapeHtml(file.name)}</b><span>模拟 OCR 识别完成，请复核姓名、证件号、签发国和有效期。</span>`;
  showToast('证件已上传，模拟 OCR 识别完成');
});

const fuelInputs = ['#fuelBeforeDeparture', '#fuelAfterDeparture', '#fuelBeforeRefuel', '#fuelUplift']
  .map(selector => document.querySelector(selector));
const fuelTotalInputs = fuelInputs.slice(2);
const fuelUnit = document.querySelector('#fuelUnit');
const updateFuelTotal = () => {
  const total = fuelTotalInputs.reduce((sum, input) => sum + (Number(input?.value) || 0), 0);
  document.querySelector('#fuelAfterRefuel').textContent = total.toLocaleString('zh-CN');
};
fuelInputs.forEach(input => input?.addEventListener('input', updateFuelTotal));
fuelUnit?.addEventListener('change', event => {
  const nextUnit = event.target.value;
  const previousUnit = event.target.dataset.previousUnit || 'lb';
  const factor = previousUnit === nextUnit ? 1 : nextUnit === 'kg' ? 1 / 2.20462 : 2.20462;
  fuelInputs.forEach(input => {
    input.value = String(Math.round((Number(input.value) || 0) * factor));
    input.step = nextUnit === 'kg' ? '5' : '10';
  });
  document.querySelectorAll('.fuel-unit-label').forEach(label => { label.textContent = nextUnit; });
  event.target.dataset.previousUnit = nextUnit;
  updateFuelTotal();
  showToast(`油量单位已切换为 ${nextUnit}`);
});
if (fuelUnit) fuelUnit.dataset.previousUnit = fuelUnit.value;
document.querySelector('#saveFuelRecords')?.addEventListener('click', () => showToast(`关键节点油量记录已按 ${fuelUnit?.value || 'lb'} 保存`));

const permitTable = document.querySelector('#permitTable');
const applyPermitStatusColor = select => {
  if (select) select.dataset.status = select.value;
};
const updatePermitSummary = () => {
  const selects = [...permitTable.querySelectorAll('.permit-status')];
  selects.forEach(applyPermitStatusColor);
  const statuses = selects.map(select => select.value);
  const available = statuses.filter(status => status === '已批准' || status === '不适用').length;
  document.querySelector('#permitSummary').textContent = `${available}/${statuses.length} 可用`;
};
permitTable?.addEventListener('change', event => {
  if (event.target.matches('.permit-status')) {
    updatePermitSummary();
    showToast('许可状态已更新');
  }
  if (event.target.matches('.permit-type')) showToast('许可类型已更新');
});
permitTable?.addEventListener('click', event => {
  const deleteButton = event.target.closest('.permit-delete');
  if (!deleteButton) return;
  deleteButton.closest('.permit-row')?.remove();
  updatePermitSummary();
  showToast('许可或时刻记录已删除');
});
document.querySelector('#addPermit')?.addEventListener('click', () => {
  const row = document.createElement('div');
  row.className = 'permit-row';
  row.innerHTML = '<select class="permit-type" aria-label="新许可类型"><option selected>Permit</option><option>Slot</option><option>PPR</option><option>Parking</option></select><span contenteditable="true">新许可</span><span contenteditable="true">待填写</span><span contenteditable="true">待填写</span><select class="permit-status" aria-label="新许可状态"><option selected>待申请</option><option>处理中</option><option>已批准</option><option>不适用</option></select><button class="permit-delete" type="button" aria-label="删除新许可">删除</button>';
  permitTable.append(row);
  updatePermitSummary();
  row.querySelector('[contenteditable]')?.focus();
});
updatePermitSummary();

const flightEditDialog = document.querySelector('#flightEditDialog');
const flightEditForm = document.querySelector('#flightEditForm');
const flightEditError = document.querySelector('#flightEditError');

function showFlightEditError(message = '') {
  flightEditError.textContent = message;
  flightEditError.hidden = !message;
}

function openFlightEdit() {
  const leg = tripLegs[activeLeg];
  document.querySelector('#editDeparture').value = leg.dep;
  document.querySelector('#editArrival').value = leg.arr;
  document.querySelector('#editDepartureDate').value = leg.depIso;
  document.querySelector('#editDepartureTime').value = leg.depLocal;
  document.querySelector('#editArrivalDate').value = leg.arrIso;
  document.querySelector('#editArrivalTime').value = leg.arrLocal;
  document.querySelector('#editTaskType').value = leg.taskType;
  document.querySelector('#editAircraft').value = leg.aircraft;
  showFlightEditError();
  flightEditDialog.showModal();
  document.querySelector('#editDeparture').focus();
}

function closeFlightEdit() {
  showFlightEditError();
  flightEditDialog.close();
}

function calculateDuration(departureDate, departureTime, arrivalDate, arrivalTime) {
  const departure = new Date(`${departureDate}T${departureTime}:00`);
  const arrival = new Date(`${arrivalDate}T${arrivalTime}:00`);
  const minutes = Math.round((arrival.getTime() - departure.getTime()) / 60000);
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  return `${Math.floor(minutes / 60)}H ${String(minutes % 60).padStart(2, '0')}M`;
}

flightEditForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!flightEditForm.reportValidity()) return;
  const departure = document.querySelector('#editDeparture').value.trim().toUpperCase();
  const arrival = document.querySelector('#editArrival').value.trim().toUpperCase();
  const departureDate = document.querySelector('#editDepartureDate').value;
  const departureTime = document.querySelector('#editDepartureTime').value;
  const arrivalDate = document.querySelector('#editArrivalDate').value;
  const arrivalTime = document.querySelector('#editArrivalTime').value;
  if (!/^[A-Z]{4}$/.test(departure) || !/^[A-Z]{4}$/.test(arrival)) {
    showFlightEditError('起降机场请输入四位 ICAO 代码');
    return;
  }
  if (departure === arrival) {
    showFlightEditError('起飞机场和到达机场不能相同');
    return;
  }
  const duration = calculateDuration(departureDate, departureTime, arrivalDate, arrivalTime);
  if (!duration) {
    showFlightEditError('到达日期时间必须晚于起飞日期时间');
    return;
  }
  const taskType = document.querySelector('#editTaskType').value;
  const aircraft = document.querySelector('#editAircraft').value;
  const leg = tripLegs[activeLeg];
  Object.assign(leg, {
    dep: departure,
    depName: airportProfiles[departure] || `${departure} 机场`,
    depDate: dateLabel(departureDate),
    depIso: departureDate,
    depLocal: departureTime,
    depUtc: departureTime,
    depBeijing: departureTime,
    arr: arrival,
    arrName: airportProfiles[arrival] || `${arrival} 机场`,
    arrDate: dateLabel(arrivalDate),
    arrIso: arrivalDate,
    arrLocal: arrivalTime,
    arrUtc: arrivalTime,
    arrBeijing: arrivalTime,
    duration,
    taskType,
    aircraft,
  });
  savedFlightEdits[activeLeg] = {
    dep: leg.dep, depName: leg.depName, depDate: leg.depDate, depIso: leg.depIso, depLocal: leg.depLocal, depUtc: leg.depUtc, depBeijing: leg.depBeijing,
    arr: leg.arr, arrName: leg.arrName, arrDate: leg.arrDate, arrIso: leg.arrIso, arrLocal: leg.arrLocal, arrUtc: leg.arrUtc, arrBeijing: leg.arrBeijing,
    duration: leg.duration, taskType: leg.taskType, aircraft: leg.aircraft,
  };
  localStorage.setItem(flightEditKey, JSON.stringify(savedFlightEdits));
  renderLeg(activeLeg);
  closeFlightEdit();
  showToast('航段信息已更新');
});

document.querySelectorAll('#editFlightHead, #editFlightSection').forEach(button => button.addEventListener('click', openFlightEdit));
document.querySelector('#closeFlightEdit').addEventListener('click', closeFlightEdit);
document.querySelector('#cancelFlightEdit').addEventListener('click', closeFlightEdit);
document.querySelectorAll('#editDeparture, #editArrival').forEach(input => input.addEventListener('input', () => {
  input.value = input.value.toUpperCase();
  showFlightEditError();
}));
const exportMaterials = {
  'crew-trip-sheet': '机组行程清单',
  'passenger-itinerary': '乘客行程清单',
  'ciq-package': '三关文件',
  'flight-assignment': '飞行任务书',
  'dispatch-package': '航班放行资料包',
  'handling-sheet': '保障任务单',
};

function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

function exportMaterial(key) {
  const title = exportMaterials[key];
  if (!title) return;
  const activeFlight = tripLegs[activeLeg];
  const content = [
    title,
    `航段：${activeFlight.dep} - ${activeFlight.arr}`,
    `日期：${activeFlight.depDate}`,
    `时间：${activeFlight.depLocal} - ${activeFlight.arrLocal}`,
    'Starjet SOC 航班运行中心生成',
  ].join('\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title}-${activeFlight.dep}-${activeFlight.arr}.txt`;
  document.body.append(link);
  link.click();
  setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 1000);
  showToast(`${title}已生成并开始下载`);
}

document.querySelectorAll('[data-export]').forEach(button => {
  button.addEventListener('click', () => exportMaterial(button.dataset.export));
});

document.querySelectorAll('[data-preview]').forEach(button => {
  button.addEventListener('click', () => {
    const title = exportMaterials[button.dataset.preview];
    if (title) showToast(`正在预览：${title}`);
  });
});

document.querySelector('[data-export-all]')?.addEventListener('click', () => {
  const keys = Object.keys(exportMaterials);
  keys.forEach((key, index) => setTimeout(() => exportMaterial(key), index * 120));
  showToast('全部物料已生成并开始下载');
});

document.querySelectorAll('.filters button').forEach(button => button.addEventListener('click', () => {
  button.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  button.classList.add('active');
}));

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { createIconifyIcon } from '@vben/icons';

defineOptions({ name: 'OperationsWorkbench' });

const AlertIcon = createIconifyIcon('lucide:triangle-alert');
const ArrowIcon = createIconifyIcon('lucide:arrow-right');
const CheckIcon = createIconifyIcon('lucide:check');
const CrewScheduleIcon = createIconifyIcon('lucide:users-round');
const FlightPlanIcon = createIconifyIcon('lucide:calendar-range');
const FlightReleaseIcon = createIconifyIcon('lucide:badge-check');
const PaymentIcon = createIconifyIcon('lucide:receipt-text');
const PlusIcon = createIconifyIcon('lucide:plus');
const ServiceProgressIcon = createIconifyIcon('lucide:list-checks');
const SettingsIcon = createIconifyIcon('lucide:settings-2');
const TrashIcon = createIconifyIcon('lucide:trash-2');
const TripIcon = createIconifyIcon('lucide:route');

type FlightState = 'airborne' | 'attention' | 'blocked' | 'complete' | 'ready';
type OverviewFlightState = 'approval' | 'arrived' | 'delayed' | 'departed' | 'planned';

interface WorkbenchFlight {
  actualArrival?: string;
  actualDeparture?: string;
  aircraft: string;
  date: string;
  destination: string;
  eta: string;
  etd: string;
  flightNo: string;
  id: string;
  nextNode: string;
  nextNodeAt: string;
  origin: string;
  progress: number;
  registration: string;
  state: FlightState;
  stateLabel: string;
  station?: string;
}

interface WorkbenchAlert {
  deadline: string;
  flightId?: string;
  id: string;
  level: 'critical' | 'warning';
  module: 'crew-info' | 'flight-plan' | 'flight-release' | 'service-progress';
  owner: string;
  source: string;
  title: string;
}

interface WorkbenchApproval {
  amountLabel: string;
  id: string;
  module: 'flight-plan' | 'flight-release' | 'payment-application' | 'trips';
  scope: 'initiated' | 'pending';
  status: string;
  submittedAt: string;
  title: string;
}

type PersonalTodoState = 'complete' | 'pending';

interface PersonalTodo {
  content: string;
  id: string;
  state: PersonalTodoState;
}

interface WorkbenchNotice {
  id: string;
  module: 'crew-info' | 'flight-plan' | 'service-progress';
  publishedAt: string;
  title: string;
}

const route = useRoute();
const router = useRouter();
const selectedDate = '2026-08-27';

const flights: WorkbenchFlight[] = [
  { id: 'WB-24A', date: '2026-08-24', flightNo: 'SJX612', registration: 'B-3266', aircraft: 'CL605', origin: 'ZSSS', destination: 'ZYCC', etd: '0210Z', eta: '0440Z', progress: 100, nextNode: '航班归档', nextNodeAt: '已完成', state: 'complete', stateLabel: '已到达' },
  { id: 'WB-24B', date: '2026-08-24', flightNo: 'SJX615', registration: 'B-801Q', aircraft: 'G550', origin: 'ZUUU', destination: 'ZSPD', etd: '0900Z', eta: '1200Z', progress: 100, nextNode: '航班归档', nextNodeAt: '已完成', state: 'complete', stateLabel: '已到达' },
  { id: 'WB-24C', date: '2026-08-24', flightNo: 'SJX618', registration: 'B-9308', aircraft: 'G450', origin: 'ZSPD', destination: 'ZGGG', etd: '1320Z', eta: '1600Z', progress: 100, nextNode: '航班归档', nextNodeAt: '已完成', state: 'complete', stateLabel: '已到达' },
  { id: 'WB-01', date: '2026-08-25', flightNo: 'SJX621', registration: 'B-602M', aircraft: 'G650ER', origin: 'ZBAA', destination: 'RJTT', etd: '0140Z', eta: '0500Z', progress: 100, nextNode: '航班归档', nextNodeAt: '已完成', state: 'complete', stateLabel: '已到达' },
  { id: 'WB-02', date: '2026-08-25', flightNo: 'SJX625', registration: 'B-8254', aircraft: 'G450', origin: 'ZGGG', destination: 'ZGSZ', etd: '0820Z', eta: '1040Z', progress: 68, nextNode: '到达保障', nextNodeAt: '10:40Z', state: 'airborne', stateLabel: '飞行中' },
  { id: 'WB-03', date: '2026-08-25', flightNo: 'SJX628', registration: 'B-9308', aircraft: 'G450', origin: 'ZSPD', destination: 'ZGGG', etd: '1330Z', eta: '1620Z', progress: 42, nextNode: '确认放行', nextNodeAt: '12:55Z', state: 'attention', stateLabel: '需关注' },
  { id: 'WB-04', date: '2026-08-25', flightNo: 'SJX631', registration: 'B-9811', aircraft: 'G650ER', origin: 'ZBAA', destination: 'ZGSZ', etd: '1420Z', eta: '1710Z', progress: 30, nextNode: '取得落地许可', nextNodeAt: '11:20Z', state: 'blocked', stateLabel: '受阻' },
  { id: 'WB-05', date: '2026-08-25', flightNo: 'SJX633', registration: 'B-801Q', aircraft: 'G550', origin: 'ZUUU', destination: 'ZSPD', etd: '1520Z', eta: '1800Z', progress: 36, nextNode: '确认特殊配餐', nextNodeAt: '13:00Z', state: 'attention', stateLabel: '需关注' },
  { id: 'WB-06', date: '2026-08-25', flightNo: 'SJX636', registration: 'B-3266', aircraft: 'CL605', origin: 'ZSSS', destination: 'ZYCC', etd: '1910Z', eta: '2140Z', progress: 55, nextNode: '机组签到', nextNodeAt: '18:10Z', state: 'ready', stateLabel: '准备正常' },
  { id: 'WB-07', date: '2026-08-26', flightNo: 'SJX639', registration: 'B-9308', aircraft: 'G450', origin: 'ZGGG', destination: 'ZSPD', etd: '0410Z', eta: '0530Z', progress: 18, nextNode: '任务交接', nextNodeAt: '01:10Z', state: 'ready', stateLabel: '准备正常' },
  { id: 'WB-08', date: '2026-08-26', flightNo: 'SJX642', registration: 'B-9811', aircraft: 'G650ER', origin: 'ZBAA', destination: 'VHHH', etd: '0720Z', eta: '1050Z', progress: 12, nextNode: '许可确认', nextNodeAt: '04:50Z', state: 'attention', stateLabel: '需关注' },
  { id: 'WB-09', date: '2026-08-26', flightNo: 'SJX643', registration: 'B-602M', aircraft: 'G650ER', origin: 'ZSPD', destination: 'WSSS', etd: '1030Z', eta: '1550Z', progress: 24, nextNode: '地服确认', nextNodeAt: '08:30Z', state: 'ready', stateLabel: '准备正常' },
  { id: 'WB-10', date: '2026-08-26', flightNo: 'SJX644', registration: 'B-7715', aircraft: 'G550', origin: 'ZLIC', destination: 'ZLZW', etd: '1640Z', eta: '1810Z', progress: 16, nextNode: '机组签到', nextNodeAt: '15:40Z', state: 'blocked', stateLabel: '受阻' },
  { id: 'WB-11', date: '2026-08-27', flightNo: 'SJX645', registration: 'B-602M', aircraft: 'G650ER', origin: 'WSSS', destination: 'VTBS', station: 'ZBAA', etd: '0110Z', eta: '0330Z', actualDeparture: '0116Z', actualArrival: '0342Z', progress: 100, nextNode: '航班归档', nextNodeAt: '已完成', state: 'complete', stateLabel: '已到达' },
  { id: 'WB-12', date: '2026-08-27', flightNo: 'SJX648', registration: 'B-9811', aircraft: 'G650ER', origin: 'ZBAA', destination: 'RJTT', station: 'ZSPD', etd: '0430Z', eta: '0750Z', actualDeparture: '0437Z', actualArrival: '0745Z', progress: 100, nextNode: '航班归档', nextNodeAt: '已完成', state: 'complete', stateLabel: '已到达' },
  { id: 'WB-13', date: '2026-08-27', flightNo: 'SJX651', registration: 'B-9308', aircraft: 'G450', origin: 'ZGGG', destination: 'ZSPD', station: 'ZGGG', etd: '0820Z', eta: '1100Z', actualDeparture: '0828Z', progress: 48, nextNode: '到达保障', nextNodeAt: '11:00Z', state: 'airborne', stateLabel: '飞行中' },
  { id: 'WB-14', date: '2026-08-27', flightNo: 'SJX653', registration: 'B-801Q', aircraft: 'G550', origin: 'ZUUU', destination: 'ZGSZ', station: 'ZUUU', etd: '1130Z', eta: '1400Z', progress: 30, nextNode: '取得时刻批复', nextNodeAt: '08:30Z', state: 'blocked', stateLabel: '受阻' },
  { id: 'WB-15', date: '2026-08-27', flightNo: 'SJX656', registration: 'B-3266', aircraft: 'CL605', origin: 'ZSSS', destination: 'ZBAA', station: 'ZSSS', etd: '1510Z', eta: '1720Z', progress: 45, nextNode: '燃油确认', nextNodeAt: '13:40Z', state: 'ready', stateLabel: '准备正常' },
  { id: 'WB-16', date: '2026-08-27', flightNo: 'SJX658', registration: 'B-7715', aircraft: 'G550', origin: 'ZLIC', destination: 'ZLZW', station: 'ZLIC', etd: '1940Z', eta: '2110Z', progress: 28, nextNode: '任务交接', nextNodeAt: '16:40Z', state: 'attention', stateLabel: '需关注' },
  { id: 'WB-17', date: '2026-08-28', flightNo: 'SJX661', registration: 'B-602M', aircraft: 'G650ER', origin: 'VTBS', destination: 'WSSS', etd: '0240Z', eta: '0500Z', progress: 18, nextNode: '许可确认', nextNodeAt: '00:10Z', state: 'attention', stateLabel: '需关注' },
  { id: 'WB-18', date: '2026-08-28', flightNo: 'SJX663', registration: 'B-9308', aircraft: 'G450', origin: 'ZSPD', destination: 'ZGGG', etd: '0610Z', eta: '0850Z', progress: 34, nextNode: '地服确认', nextNodeAt: '04:10Z', state: 'ready', stateLabel: '准备正常' },
  { id: 'WB-19', date: '2026-08-28', flightNo: 'SJX666', registration: 'B-9811', aircraft: 'G650ER', origin: 'RJTT', destination: 'ZBAA', etd: '0920Z', eta: '1250Z', progress: 22, nextNode: '航行通告复核', nextNodeAt: '07:20Z', state: 'blocked', stateLabel: '受阻' },
  { id: 'WB-20', date: '2026-08-28', flightNo: 'SJX668', registration: 'B-3266', aircraft: 'CL605', origin: 'ZBAA', destination: 'ZSSS', etd: '1420Z', eta: '1630Z', progress: 38, nextNode: '配餐确认', nextNodeAt: '13:05Z', state: 'ready', stateLabel: '准备正常' },
  { id: 'WB-21', date: '2026-08-28', flightNo: 'SJX670', registration: 'B-801Q', aircraft: 'G550', origin: 'ZGSZ', destination: 'ZUUU', etd: '1810Z', eta: '2040Z', progress: 14, nextNode: '任务交接', nextNodeAt: '15:10Z', state: 'ready', stateLabel: '准备正常' },
  { id: 'WB-22', date: '2026-08-29', flightNo: 'SJX672', registration: 'B-7715', aircraft: 'G550', origin: 'ZLZW', destination: 'ZLIC', etd: '0350Z', eta: '0520Z', progress: 20, nextNode: '机组签到', nextNodeAt: '02:50Z', state: 'ready', stateLabel: '准备正常' },
  { id: 'WB-23', date: '2026-08-29', flightNo: 'SJX675', registration: 'B-602M', aircraft: 'G650ER', origin: 'WSSS', destination: 'ZSPD', etd: '0810Z', eta: '1330Z', progress: 26, nextNode: '许可确认', nextNodeAt: '05:40Z', state: 'attention', stateLabel: '需关注' },
  { id: 'WB-24', date: '2026-08-29', flightNo: 'SJX678', registration: 'B-9308', aircraft: 'G450', origin: 'ZGGG', destination: 'ZGSZ', etd: '1530Z', eta: '1650Z', progress: 12, nextNode: '任务交接', nextNodeAt: '12:30Z', state: 'ready', stateLabel: '准备正常' },
  { id: 'WB-25', date: '2026-08-30', flightNo: 'SJX681', registration: 'B-9811', aircraft: 'G650ER', origin: 'ZBAA', destination: 'VHHH', etd: '0410Z', eta: '0750Z', progress: 10, nextNode: '许可确认', nextNodeAt: '01:40Z', state: 'ready', stateLabel: '准备正常' },
  { id: 'WB-26', date: '2026-08-30', flightNo: 'SJX683', registration: 'B-3266', aircraft: 'CL605', origin: 'ZSSS', destination: 'ZYCC', etd: '1210Z', eta: '1440Z', progress: 8, nextNode: '任务交接', nextNodeAt: '09:10Z', state: 'attention', stateLabel: '需关注' },
];

const alerts: WorkbenchAlert[] = [
  { id: 'AL-01', flightId: 'WB-04', level: 'critical', title: '日本落地许可未取得', deadline: '11:20Z', owner: '签派 · 张园', source: '飞行放行', module: 'flight-release' },
  { id: 'AL-02', flightId: 'WB-03', level: 'warning', title: '机长执勤裕度偏低', deadline: '12:40Z', owner: '机组 · 李悦', source: '机组排班', module: 'flight-release' },
  { id: 'AL-03', flightId: 'WB-05', level: 'warning', title: '特殊餐食尚未确认', deadline: '13:00Z', owner: '保障 · 周宁', source: '保障进程', module: 'service-progress' },
  { id: 'AL-04', flightId: 'WB-13', level: 'warning', title: '目的地雷雨绕飞风险', deadline: '07:30Z', owner: '签派 · 王晨', source: '飞行放行', module: 'flight-release' },
  { id: 'AL-05', flightId: 'WB-14', level: 'critical', title: '起飞时刻批复未取得', deadline: '08:30Z', owner: '签派 · 张园', source: '批复记录', module: 'flight-release' },
  { id: 'AL-06', flightId: 'WB-15', level: 'warning', title: '加油单等待供应商确认', deadline: '13:40Z', owner: '保障 · 周宁', source: '保障进程', module: 'service-progress' },
  { id: 'CERT-01', level: 'critical', title: '陈晨 · A320 机型执照已过期', deadline: '03/31', owner: '技术执照', source: '机组证件', module: 'crew-info' },
  { id: 'CERT-02', level: 'critical', title: '陈晨 · 签证即将失效', deadline: '04/25', owner: '008634701', source: '机组证件', module: 'crew-info' },
  { id: 'CERT-03', level: 'critical', title: '陈晨 · 体检合格证即将失效', deadline: '06/17', owner: '510681197909221319', source: '机组证件', module: 'crew-info' },
  { id: 'CERT-04', level: 'warning', title: '林安 · 乘务员训练合格证即将失效', deadline: '08/25', owner: '证照编号 01', source: '机组证件', module: 'crew-info' },
  { id: 'CERT-05', level: 'warning', title: 'MARRISON · 签证即将失效', deadline: '08/31', owner: '103400826', source: '旅客证件', module: 'crew-info' },
  { id: 'CERT-06', level: 'warning', title: 'VP-CYW · 电台执照即将失效', deadline: '09/11', owner: 'Aircraft Station License', source: '飞机证件', module: 'flight-plan' },
];

const approvals: WorkbenchApproval[] = [
  { id: 'AP-01', title: 'Jeppesen 数据库年费付款申请', amountLabel: '付款 · USD 37,404', submittedAt: '10:18', status: '待审批', scope: 'pending', module: 'payment-application' },
  { id: 'AP-02', title: 'SJX653 起飞时间变更申请', amountLabel: '无款', submittedAt: '09:42', status: '加急', scope: 'pending', module: 'flight-plan' },
  { id: 'AP-03', title: '日本落地许可放行复核', amountLabel: '无款', submittedAt: '09:31', status: '待处理', scope: 'pending', module: 'flight-release' },
  { id: 'AP-04', title: '行程 SJ260827 客户确认', amountLabel: '无款', submittedAt: '08:55', status: '待处理', scope: 'pending', module: 'trips' },
  { id: 'AP-05', title: 'B-602M 航油费用付款申请', amountLabel: '付款 · SGD 18,600', submittedAt: '昨天', status: '审批中', scope: 'initiated', module: 'payment-application' },
  { id: 'AP-06', title: 'SJX651 航班时刻变更', amountLabel: '无款', submittedAt: '昨天', status: '已通过', scope: 'initiated', module: 'flight-plan' },
  { id: 'AP-07', title: '东京羽田地服费用确认', amountLabel: '无款', submittedAt: '08/25', status: '待审批', scope: 'initiated', module: 'payment-application' },
];

const personalTodos = ref<PersonalTodo[]>([
  { id: 'TODO-01', content: '复核明日东京航班落地许可', state: 'pending' },
  { id: 'TODO-02', content: '确认 B-3266 航班燃油订单', state: 'pending' },
  { id: 'TODO-03', content: '向机组同步 ZGGG 雷雨绕飞方案', state: 'pending' },
  { id: 'TODO-04', content: '完成本周运行数据交接', state: 'complete' },
]);
const newTodoContent = ref('');
const approvalScope = ref<'initiated' | 'pending'>('pending');

const notices: WorkbenchNotice[] = [
  { id: 'NT-01', title: '华东区域雷雨运行提示', publishedAt: '10:26', module: 'flight-plan' },
  { id: 'NT-02', title: '东京羽田公务机坪使用调整', publishedAt: '09:48', module: 'flight-plan' },
  { id: 'NT-03', title: '航油供应商夜间联系人变更', publishedAt: '09:16', module: 'service-progress' },
  { id: 'NT-04', title: '机组证件复核工作提醒', publishedAt: '08:35', module: 'crew-info' },
  { id: 'NT-05', title: '本周运行数据归档通知', publishedAt: '08:10', module: 'flight-plan' },
];

const quickActionOptions = [
  { id: 'flight-plan', icon: FlightPlanIcon, label: '航班计划', module: 'flight-plan' },
  { id: 'flight-release', icon: FlightReleaseIcon, label: '飞行放行', module: 'flight-release' },
  { id: 'service-progress', icon: ServiceProgressIcon, label: '保障进程', module: 'service-progress' },
  { id: 'trips', icon: TripIcon, label: '行程管理', module: 'trips' },
  { id: 'crew-schedule', icon: CrewScheduleIcon, label: '机组排班', module: 'crew-schedule' },
  { id: 'payment-application', icon: PaymentIcon, label: '付款申请', module: 'payment-application' },
] as const;

const quickConfigOpen = ref(false);
const enabledQuickActionIds = ref<string[]>([
  'flight-plan',
  'flight-release',
  'service-progress',
  'trips',
]);
const visibleQuickActions = computed(() => quickActionOptions.filter((item) => (
  enabledQuickActionIds.value.includes(item.id)
)));

const dateFlights = computed(() => flights
  .filter((flight) => flight.date === selectedDate)
  .toSorted((left, right) => left.etd.localeCompare(right.etd)));
const visibleApprovals = computed(() => approvals.filter((item) => item.scope === approvalScope.value));
const todayAlerts = computed(() => {
  const flightIds = new Set(dateFlights.value.map((flight) => flight.id));
  return alerts.filter((alert) => !alert.flightId || flightIds.has(alert.flightId));
});

const shortDateLabel = computed(() => {
  const date = new Date(`${selectedDate}T00:00:00`);
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long', day: 'numeric',
  }).format(date);
});

function displayCompactTime(value?: string) {
  if (!value) return '—';
  return value.replace(/[^0-9]/g, '').padStart(4, '0');
}

function displayVariance(planned?: string, actual?: string) {
  if (!planned || !actual) return '';
  const toMinutes = (value: string) => {
    const compact = displayCompactTime(value);
    return Number(compact.slice(0, 2)) * 60 + Number(compact.slice(2, 4));
  };
  let delta = toMinutes(actual) - toMinutes(planned);
  if (delta > 720) delta -= 1440;
  if (delta < -720) delta += 1440;
  if (delta === 0) return '准点';
  return delta > 0 ? `延误${delta}min` : `提前${Math.abs(delta)}min`;
}

function overviewState(flight: WorkbenchFlight): { key: OverviewFlightState; label: string } {
  const states: Record<FlightState, { key: OverviewFlightState; label: string }> = {
    airborne: { key: 'departed', label: '起飞' },
    attention: { key: 'delayed', label: '延误' },
    blocked: { key: 'approval', label: '待批复' },
    complete: { key: 'arrived', label: '到达' },
    ready: { key: 'planned', label: '计划' },
  };
  return states[flight.state];
}

function prefixPath(path: string) {
  if (route.path.startsWith('/demo/')) return `/demo/${path}`;
  if (route.path.startsWith('/preview/')) return `/preview/${path}`;
  return `/operations/${path}`;
}

function openFlight(flight: WorkbenchFlight) {
  const prefix = route.path.startsWith('/demo/')
    ? '/demo'
    : (route.path.startsWith('/preview/') ? '/preview' : '/operations');
  void router.push({
    path: `${prefix}/flight-detail/${flight.id}`,
    query: {
      aircraft: flight.aircraft,
      destination: flight.destination,
      flightNo: flight.flightNo,
      origin: flight.origin,
      registration: flight.registration,
    },
  });
}

function openModule(module: string) {
  void router.push(prefixPath(module));
}

function toggleQuickAction(id: string) {
  enabledQuickActionIds.value = enabledQuickActionIds.value.includes(id)
    ? enabledQuickActionIds.value.filter((item) => item !== id)
    : [...enabledQuickActionIds.value, id];
}

function addPersonalTodo() {
  const content = newTodoContent.value.trim();
  if (!content) return;
  personalTodos.value.push({ id: `TODO-${Date.now()}`, content, state: 'pending' });
  newTodoContent.value = '';
}

function removePersonalTodo(id: string) {
  personalTodos.value = personalTodos.value.filter((item) => item.id !== id);
}

function toggleTodoComplete(item: PersonalTodo) {
  item.state = item.state === 'complete' ? 'pending' : 'complete';
}
</script>

<template>
  <main class="workbench-page sj-mission-control" data-starjet-theme="mission-control-dark">
    <section class="dashboard-grid">
      <section class="module-card quick-module">
        <header class="module-header quick-header">
          <h1>常用功能</h1>
          <div class="quick-action-row">
            <button
              v-for="item in visibleQuickActions"
              :key="item.id"
              type="button"
              @click="openModule(item.module)"
            >
              <component :is="item.icon" />
              <span>{{ item.label }}</span>
            </button>
            <span v-if="visibleQuickActions.length === 0" class="quick-empty">暂无快捷入口</span>
          </div>
          <button
            :aria-expanded="quickConfigOpen"
            class="configure-button"
            type="button"
            @click="quickConfigOpen = !quickConfigOpen"
          >
            <SettingsIcon />配置
          </button>
        </header>
        <div v-if="quickConfigOpen" class="quick-config" aria-label="常用功能配置">
          <label v-for="item in quickActionOptions" :key="item.id">
            <input
              :checked="enabledQuickActionIds.includes(item.id)"
              type="checkbox"
              @change="toggleQuickAction(item.id)"
            />
            <span>{{ item.label }}</span>
          </label>
        </div>
      </section>

      <div class="workbench-content">
      <section class="module-card flight-overview">
        <header class="module-header">
          <div><h1>航班概览</h1></div>
          <div class="overview-meta">
            <span><i>UTC时间</i>{{ shortDateLabel }} 07:45</span>
            <span><i>北京时间</i>{{ shortDateLabel }} 15:45</span>
          </div>
        </header>

        <div class="queue-table-wrap">
          <table class="queue-table">
            <thead><tr><th>状态</th><th>航班</th><th>飞机</th><th>飞机定位</th><th>航段</th><th>计划起降</th><th>实际起降</th></tr></thead>
            <tbody>
              <tr
                v-for="flight in dateFlights"
                :key="flight.id"
                tabindex="0"
                @click="openFlight(flight)"
                @keydown.enter="openFlight(flight)"
              >
                <td><span class="state-chip" :class="overviewState(flight).key">{{ overviewState(flight).label }}</span></td>
                <td><strong class="flight-number sj-data">{{ flight.flightNo }}</strong></td>
                <td><strong class="aircraft-registration sj-data">{{ flight.registration }}</strong><small>{{ flight.aircraft }}</small></td>
                <td><strong class="station-code sj-data">{{ flight.station ?? flight.origin }}</strong></td>
                <td><span class="route-code">{{ flight.origin }} <ArrowIcon /> {{ flight.destination }}</span></td>
                <td><span class="movement-time"><time>{{ displayCompactTime(flight.etd) }}</time><ArrowIcon /><time>{{ displayCompactTime(flight.eta) }}</time></span></td>
                <td>
                  <span v-if="flight.actualDeparture || flight.actualArrival" class="actual-movement">
                    <span><time>{{ displayCompactTime(flight.actualDeparture) }}</time><small>{{ displayVariance(flight.etd, flight.actualDeparture) }}</small></span>
                    <ArrowIcon />
                    <span><time>{{ displayCompactTime(flight.actualArrival) }}</time><small>{{ displayVariance(flight.eta, flight.actualArrival) }}</small></span>
                  </span>
                  <span v-else class="no-actual">—</span>
                </td>
              </tr>
              <tr v-if="dateFlights.length === 0"><td class="empty-state" colspan="7">当日暂无航班</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <aside class="side-modules" aria-label="运行协同信息">
      <section class="module-card compact-module todo-module">
        <header class="module-header">
          <div><h2>待办事项</h2></div>
          <strong>{{ personalTodos.length }}</strong>
        </header>
        <div class="todo-workspace">
          <div class="module-scroll personal-todo-list">
            <div v-for="item in personalTodos" :key="item.id" class="personal-todo-item" :class="item.state">
              <button
                :aria-checked="item.state === 'complete'"
                :aria-label="`标记完成：${item.content}`"
                class="todo-check"
                :class="{ checked: item.state === 'complete' }"
                role="checkbox"
                type="button"
                @click="toggleTodoComplete(item)"
              ><CheckIcon /></button>
              <input v-model="item.content" aria-label="待办事项内容" maxlength="60" />
              <button :aria-label="`删除：${item.content}`" class="todo-delete" type="button" @click="removePersonalTodo(item.id)"><TrashIcon /></button>
            </div>
          </div>
          <form class="todo-create" @submit.prevent="addPersonalTodo">
            <input v-model="newTodoContent" aria-label="新增待办事项" maxlength="60" placeholder="填写待办事项" />
            <button :disabled="!newTodoContent.trim()" aria-label="添加待办" type="submit"><PlusIcon /></button>
          </form>
        </div>
      </section>

      <section class="module-card compact-module approval-module">
        <header class="module-header">
          <div><h2>审批</h2></div>
          <strong>{{ visibleApprovals.length }}</strong>
        </header>
        <div class="approval-workspace">
          <div class="approval-scope" role="tablist" aria-label="审批范围">
            <button :class="{ active: approvalScope === 'pending' }" role="tab" type="button" @click="approvalScope = 'pending'">待我处理 <span>{{ approvals.filter((item) => item.scope === 'pending').length }}</span></button>
            <button :class="{ active: approvalScope === 'initiated' }" role="tab" type="button" @click="approvalScope = 'initiated'">我发起的 <span>{{ approvals.filter((item) => item.scope === 'initiated').length }}</span></button>
          </div>
          <div class="module-scroll approval-panel-list">
          <button v-for="item in visibleApprovals" :key="item.id" class="panel-item approval-record" type="button" @click="openModule(item.module)">
            <i></i>
            <div><strong>{{ item.title }}</strong><span>{{ item.amountLabel }}</span></div>
            <div class="approval-meta"><em>{{ item.status }}</em><time>{{ item.submittedAt }}</time></div>
          </button>
          </div>
        </div>
      </section>

      <section class="module-card compact-module alert-module">
        <header class="module-header">
          <div><h2>告警</h2></div>
          <strong>{{ todayAlerts.length }}</strong>
        </header>
        <div class="module-scroll risk-list">
          <button v-for="item in todayAlerts" :key="item.id" class="panel-item" :class="item.level" type="button" @click="openModule(item.module)">
            <AlertIcon />
            <div><strong>{{ item.title }}</strong></div>
            <span class="alert-source">{{ item.source }}</span>
            <time>{{ item.deadline }}</time>
          </button>
          <div v-if="todayAlerts.length === 0" class="clear-state"><span>✓</span><strong>当日暂无风险提醒</strong></div>
        </div>
      </section>

      <section class="module-card compact-module notice-module">
        <header class="module-header">
          <div><h2>通告</h2></div>
          <strong>{{ notices.length }}</strong>
        </header>
        <div class="module-scroll notice-list">
          <button v-for="item in notices" :key="item.id" class="notice-item" type="button" @click="openModule(item.module)">
            <strong>{{ item.title }}</strong>
            <time>{{ item.publishedAt }}</time>
          </button>
        </div>
      </section>
      </aside>
      </div>
    </section>
  </main>
</template>

<style scoped>
.workbench-page { display: grid; height: var(--vben-content-height, 100dvh); min-height: 0; overflow: hidden; grid-template-rows: auto auto minmax(0, 1fr); color: var(--sj-text-1); background: var(--sj-canvas); font-family: var(--sj-font-ui); }
button { color: inherit; font: inherit; }
.command-bar { display: grid; min-height: 64px; padding: var(--sj-space-3) var(--sj-space-5); align-items: center; grid-template-columns: minmax(160px, 1fr) auto minmax(320px, 1fr); gap: var(--sj-space-4); border-bottom: 1px solid var(--sj-border); background: var(--sj-surface-1); }
.workbench-title { display: flex; align-items: baseline; gap: var(--sj-space-3); }.workbench-title span { color: var(--sj-blue); font-size: 11px; font-weight: 700; }.workbench-title h1 { margin: 0; font-size: 18px; }
.date-controller { display: grid; height: var(--sj-control-default); grid-template-columns: var(--sj-control-default) minmax(176px, auto) var(--sj-control-default); border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); overflow: hidden; background: var(--sj-surface-2); }.date-controller > button, .icon-button { display: grid; width: var(--sj-control-default); min-height: var(--sj-control-default); padding: 0; place-items: center; border: 0; background: transparent; cursor: pointer; }.date-controller > button:first-child { border-right: 1px solid var(--sj-border); }.date-controller > button:last-child { border-left: 1px solid var(--sj-border); }.date-controller svg, .icon-button svg { width: 15px; }.date-controller label { position: relative; display: grid; place-items: center; cursor: pointer; }.date-controller label span { font-size: 12px; font-weight: 650; }.date-controller input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.command-actions { display: flex; min-width: 0; align-items: center; justify-content: flex-end; gap: var(--sj-space-3); }.time-base, .queue-filter { display: flex; height: var(--sj-control-dense); border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); overflow: hidden; }.time-base button, .queue-filter button { min-width: 48px; padding: 0 var(--sj-space-3); border: 0; color: var(--sj-text-3); background: var(--sj-surface-1); cursor: pointer; }.time-base button.active, .queue-filter button.active { color: var(--sj-text-1); background: var(--sj-surface-3); box-shadow: inset 0 -2px var(--sj-blue); }.sync-time { color: var(--sj-text-3); font-size: 10px; white-space: nowrap; }.sync-time time { color: var(--sj-text-2); }.icon-button { border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); background: var(--sj-surface-2); }
.status-strip { display: grid; min-height: 68px; grid-template-columns: repeat(6, minmax(0, 1fr)); border-bottom: 1px solid var(--sj-border); background: var(--sj-surface-1); }.status-strip button { display: flex; min-width: 0; padding: 0 var(--sj-space-5); align-items: center; gap: var(--sj-space-2); border: 0; border-right: 1px solid var(--sj-border); background: transparent; cursor: pointer; }.status-strip button:hover, .status-strip button.active { background: var(--sj-surface-3); }.status-strip button.active { box-shadow: inset 0 -2px var(--sj-blue); }.status-strip strong { font: 750 22px var(--sj-font-data); }.status-strip span { overflow: hidden; color: var(--sj-text-2); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }.status-strip i, .action-dot { width: 7px; height: 7px; flex: 0 0 7px; border-radius: 50%; background: var(--sj-text-3); }.status-strip i.airborne, .action-dot.blue { background: var(--sj-blue); }.status-strip i.attention { background: var(--sj-amber); }.status-strip i.blocked { background: var(--sj-red); }.status-strip i.ready, .action-dot.lime { background: var(--sj-lime); }.status-strip i.complete { background: var(--sj-teal); }
.workbench-canvas { display: grid; min-width: 0; min-height: 0; grid-template-columns: minmax(0, 1fr) 360px; overflow: hidden; }.flight-queue { display: grid; min-width: 0; min-height: 0; grid-template-rows: 56px minmax(0, 1fr); border-right: 1px solid var(--sj-border); }.section-header { display: flex; padding: 0 var(--sj-space-5); align-items: center; justify-content: space-between; border-bottom: 1px solid var(--sj-border); background: var(--sj-surface-1); }.section-header > div:first-child { display: flex; align-items: baseline; gap: var(--sj-space-3); }.section-header h2 { margin: 0; font-size: 14px; }.section-header span { color: var(--sj-text-3); font-size: 10px; }.queue-table-wrap { min-width: 0; min-height: 0; overflow: auto; }.queue-table { width: 100%; min-width: 860px; border-collapse: collapse; table-layout: fixed; }.queue-table th { position: sticky; z-index: 4; top: 0; height: 40px; padding: 0 var(--sj-space-3); color: var(--sj-text-3); background: var(--sj-surface-2); font-size: 10px; font-weight: 600; text-align: left; }.queue-table th:nth-child(1) { width: 100px; }.queue-table th:nth-child(2) { width: 150px; }.queue-table th:nth-child(3) { width: 150px; }.queue-table th:nth-child(4) { width: 150px; }.queue-table th:nth-child(5) { width: 160px; }.queue-table th:nth-child(6) { width: 100px; }.queue-table td { height: 72px; padding: var(--sj-space-2) var(--sj-space-3); border-top: 1px solid var(--sj-grid); vertical-align: middle; }.queue-table tbody tr { background: var(--sj-canvas); cursor: pointer; transition: background var(--sj-duration-fast); }.queue-table tbody tr:hover { background: var(--sj-surface-2); }.queue-table tbody tr.selected { background: var(--sj-blue-soft); box-shadow: inset 2px 0 var(--sj-blue); }.queue-table td > strong, .queue-table td > small, .queue-table td > time { display: block; }.queue-table td > time, .route-code { color: var(--sj-text-1); font: 650 12px var(--sj-font-data); }.queue-table td > small { margin-top: var(--sj-space-1); color: var(--sj-text-3); font-size: 10px; }.route-code { display: inline-flex; align-items: center; white-space: nowrap; }.route-code svg { width: 13px; margin: 0 var(--sj-space-1); color: var(--sj-blue); vertical-align: -2px; }.progress-track { height: 4px; overflow: hidden; border-radius: var(--sj-radius-tag); background: var(--sj-grid); }.progress-track i { display: block; height: 100%; background: var(--sj-lime); }.progress-track i.attention { background: var(--sj-amber); }.progress-track i.blocked { background: var(--sj-red); }.progress-track i.airborne { background: var(--sj-blue); }.progress-track i.complete { background: var(--sj-teal); }.state-chip { display: inline-flex; min-height: 22px; padding: 0 var(--sj-space-2); align-items: center; border-radius: var(--sj-radius-tag); color: var(--sj-text-2); background: var(--sj-surface-3); font-size: 10px; font-weight: 650; white-space: nowrap; }.state-chip.airborne { color: var(--sj-blue); background: var(--sj-blue-soft); }.state-chip.attention { color: var(--sj-amber); background: var(--sj-amber-soft); }.state-chip.blocked { color: var(--sj-red); background: var(--sj-red-soft); }.state-chip.ready { color: var(--sj-lime); background: var(--sj-lime-soft); }.state-chip.complete { color: var(--sj-teal); background: var(--sj-teal-soft); }.empty-state { height: 180px !important; color: var(--sj-text-3); text-align: center; cursor: default; }
.flight-inspector { min-width: 0; min-height: 0; overflow-y: auto; background: var(--sj-surface-1); }.inspector-flight { display: grid; padding: var(--sj-space-5); grid-template-columns: 1fr var(--sj-control-default); gap: var(--sj-space-3); border-bottom: 1px solid var(--sj-border); }.inspector-flight > div { display: flex; align-items: center; gap: var(--sj-space-2); }.inspector-flight > div > strong { font-size: 14px; }.inspector-flight > button { display: grid; width: var(--sj-control-default); height: var(--sj-control-default); padding: 0; place-items: center; border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); background: var(--sj-surface-2); cursor: pointer; }.inspector-flight > button svg { width: 15px; }.inspector-flight h2, .inspector-flight p { grid-column: 1 / -1; margin: 0; }.inspector-flight h2 { font-size: 24px; }.inspector-flight p { color: var(--sj-text-3); font-size: 10px; }.next-node { display: grid; padding: var(--sj-space-4) var(--sj-space-5); grid-template-columns: 1fr auto; gap: var(--sj-space-1); border-bottom: 1px solid var(--sj-border); }.next-node span { grid-column: 1 / -1; color: var(--sj-text-3); font-size: 10px; }.next-node strong { font-size: 13px; }.next-node time { color: var(--sj-blue); font: 700 12px var(--sj-font-data); }.alert-list { padding: var(--sj-space-4) var(--sj-space-5); border-bottom: 1px solid var(--sj-border); }.alert-list > header { display: flex; margin-bottom: var(--sj-space-3); align-items: center; justify-content: space-between; }.alert-list h3, .quick-actions h3 { margin: 0; font-size: 12px; }.alert-list > header span { display: grid; width: 22px; height: 22px; place-items: center; border-radius: var(--sj-radius-tag); color: var(--sj-text-2); background: var(--sj-surface-3); font: 700 10px var(--sj-font-data); }.alert-list article { display: grid; padding: var(--sj-space-3) 0; grid-template-columns: 18px 1fr auto; gap: var(--sj-space-2); border-top: 1px solid var(--sj-grid); }.alert-list article > svg { width: 14px; color: var(--sj-amber); }.alert-list article.critical > svg, .alert-list article.critical > time { color: var(--sj-red); }.alert-list article > div { display: grid; gap: var(--sj-space-1); }.alert-list article strong { font-size: 11px; }.alert-list article span { color: var(--sj-text-3); font-size: 9px; }.alert-list article > time { color: var(--sj-amber); font: 650 10px var(--sj-font-data); }.alert-list article > button { grid-column: 2 / -1; display: inline-flex; padding: 0; align-items: center; justify-self: start; gap: var(--sj-space-1); border: 0; color: var(--sj-blue); background: transparent; font-size: 10px; cursor: pointer; }.alert-list article > button svg { width: 12px; }.clear-state { display: flex; min-height: 74px; align-items: center; justify-content: center; gap: var(--sj-space-2); color: var(--sj-lime); }.clear-state span { font: 750 13px var(--sj-font-data); }.clear-state strong { font-size: 11px; }.quick-actions { padding: var(--sj-space-4) var(--sj-space-5); }.quick-actions > div { display: grid; margin-top: var(--sj-space-3); grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sj-space-2); }.quick-actions button { display: flex; min-height: var(--sj-control-primary); padding: 0 var(--sj-space-3); align-items: center; gap: var(--sj-space-2); border: 1px solid var(--sj-border); border-radius: var(--sj-radius-control); background: var(--sj-surface-2); font-size: 10px; cursor: pointer; }.quick-actions button:hover { border-color: var(--sj-border-strong); background: var(--sj-surface-3); }.quick-actions button svg { width: 14px; color: var(--sj-blue); }.inspector-empty { display: grid; height: 100%; place-items: center; color: var(--sj-text-3); font-size: 11px; }
.approval-list { padding: var(--sj-space-4) var(--sj-space-5); border-bottom: 1px solid var(--sj-border); }.approval-list > header { display: flex; margin-bottom: var(--sj-space-3); align-items: center; justify-content: space-between; }.approval-list h3 { margin: 0; font-size: 12px; }.approval-list > header span { display: grid; width: 22px; height: 22px; place-items: center; border-radius: var(--sj-radius-tag); color: var(--sj-amber); background: var(--sj-amber-soft); font: 700 10px var(--sj-font-data); }.approval-list article { display: grid; padding: var(--sj-space-3) 0; align-items: center; grid-template-columns: minmax(0, 1fr) auto; gap: var(--sj-space-1) var(--sj-space-2); border-top: 1px solid var(--sj-grid); }.approval-list article > div { display: grid; min-width: 0; gap: 2px; }.approval-list article strong { font-size: 11px; }.approval-list article > div span { overflow: hidden; color: var(--sj-text-3); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }.approval-list article > time { color: var(--sj-text-3); font: 600 9px var(--sj-font-data); }.approval-list article > p { margin: 0; color: var(--sj-text-2); font-size: 9px; }.approval-list article > button { display: inline-flex; padding: 0; align-items: center; justify-self: end; gap: var(--sj-space-1); border: 0; color: var(--sj-blue); background: transparent; font-size: 10px; cursor: pointer; }.approval-list article > button svg { width: 12px; }.approval-list article.urgent { box-shadow: inset 2px 0 var(--sj-amber); }.approval-list article.urgent strong { color: var(--sj-amber); }
@media (max-width: 1279px) { .command-bar { grid-template-columns: minmax(130px, 1fr) auto minmax(260px, 1fr); padding-inline: var(--sj-space-4); }.sync-time { display: none; }.workbench-canvas { grid-template-columns: minmax(0, 1fr) 320px; }.status-strip button { padding-inline: var(--sj-space-3); }.queue-table { min-width: 780px; } }
@media (max-width: 1199px) { .workbench-page { overflow: auto; grid-template-rows: auto auto auto; }.command-bar { grid-template-columns: 1fr auto; }.date-controller { grid-row: 2; grid-column: 1 / -1; justify-self: stretch; }.command-actions { grid-column: 2; grid-row: 1; }.workbench-canvas { display: block; overflow: visible; }.flight-queue { min-height: 520px; border-right: 0; }.flight-inspector { border-top: 1px solid var(--sj-border-strong); }.status-strip { grid-template-columns: repeat(3, minmax(0, 1fr)); }.status-strip button { min-height: 56px; border-bottom: 1px solid var(--sj-border); }.flight-inspector { max-height: none; }.inspector-flight, .next-node, .alert-list, .approval-list, .quick-actions { padding-inline: var(--sj-space-4); } }
@media (max-width: 699px) { .command-bar { display: flex; align-items: stretch; flex-direction: column; }.workbench-title { justify-content: space-between; }.command-actions { justify-content: space-between; }.date-controller { width: 100%; }.status-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }.section-header { padding-inline: var(--sj-space-3); }.workbench-canvas { min-width: 0; }.flight-queue { min-height: 480px; }.queue-table-wrap { overflow-x: auto; }.quick-actions > div { grid-template-columns: 1fr; } }

.workbench-page { display: block; height: var(--vben-content-height, 100dvh); min-height: 0; overflow: hidden; }
.dashboard-grid { display: grid; width: 100%; height: 100%; min-width: 0; min-height: 0; padding: var(--sj-space-4); grid-template-rows: auto minmax(0, 1fr); gap: var(--sj-space-4); }
.module-card { min-width: 0; overflow: hidden; border: 1px solid var(--sj-border); border-radius: var(--sj-radius-panel); background: var(--sj-surface-1); }
.module-header { display: flex; min-height: 58px; padding: 0 var(--sj-space-4); align-items: center; justify-content: space-between; gap: var(--sj-space-3); border-bottom: 1px solid var(--sj-border); }
.module-header > div { display: grid; gap: 2px; }
.module-header h1, .module-header h2 { margin: 0; font-size: 14px; }
.module-header span { color: var(--sj-text-3); font-size: 10px; }
.module-header > strong { color: var(--sj-text-2); font: 700 11px var(--sj-font-data); }
.overview-meta { justify-items: end; gap: var(--sj-space-1) !important; text-align: right; }
.overview-meta span { display: flex; align-items: baseline; gap: var(--sj-space-2); color: var(--sj-text-1); font: 650 10px var(--sj-font-data); }
.overview-meta i { color: var(--sj-text-3); font-style: normal; font-weight: 500; }
.quick-module { position: relative; overflow: visible; }
.quick-header { min-height: 64px; justify-content: flex-start; }
.quick-header > h1 { flex: 0 0 auto; }
.configure-button { display: inline-flex; min-height: var(--sj-control-dense); margin-left: auto; padding: 0 var(--sj-space-3); align-items: center; flex: 0 0 auto; gap: var(--sj-space-2); border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); background: var(--sj-surface-2); font-size: 10px; cursor: pointer; }
.configure-button:hover { background: var(--sj-surface-3); }
.configure-button svg { width: 13px; color: var(--sj-blue); }
.quick-config { position: absolute; z-index: 10; top: 58px; right: var(--sj-space-4); display: grid; width: 220px; padding: var(--sj-space-3); grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sj-space-2); border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-panel); background: var(--sj-surface-2); }
.quick-config label { display: flex; min-height: 30px; align-items: center; gap: var(--sj-space-2); color: var(--sj-text-2); font-size: 10px; cursor: pointer; }
.quick-config input { width: 14px; height: 14px; accent-color: var(--sj-lime); }
.module-header > .quick-action-row { display: flex; min-width: 0; padding: 0; align-items: center; flex: 1 1 auto; gap: var(--sj-space-2); overflow-x: auto; }
.quick-action-row > button { display: inline-flex; min-width: auto; min-height: var(--sj-control-dense); padding: 0 var(--sj-space-3); align-items: center; flex: 0 0 auto; gap: var(--sj-space-2); border: 1px solid var(--sj-border); border-radius: var(--sj-radius-control); color: var(--sj-text-1); background: var(--sj-surface-2); cursor: pointer; }
.quick-action-row > button:hover { border-color: var(--sj-border-strong); background: var(--sj-surface-3); }
.quick-action-row > button > svg:first-child { width: 14px; color: var(--sj-text-2); }
.quick-action-row > button > svg:last-child { width: 12px; margin-left: auto; color: var(--sj-text-3); }
.quick-action-row button > span { color: var(--sj-text-1); font-size: 11px; font-weight: 650; opacity: 1; white-space: nowrap; }
.quick-empty { color: var(--sj-text-3); font-size: 10px; }
.workbench-content { display: grid; min-width: 0; min-height: 0; grid-template-columns: minmax(0, 1fr) minmax(520px, 44%); align-items: stretch; gap: var(--sj-space-4); }
.flight-overview { --overview-font-header: 10px; --overview-font-primary: 11px; --overview-font-secondary: 9px; display: grid; min-height: 0; grid-template-rows: auto minmax(0, 1fr); }
.flight-overview .module-header h1 { font-size: 14px; font-weight: 700; }
.flight-overview .overview-meta span { font-size: var(--overview-font-header); }
.flight-overview .queue-table-wrap { min-height: 0; }
.flight-overview .queue-table { min-width: 840px; }
.flight-overview .queue-table th { font-size: var(--overview-font-header); font-weight: 600; }
.flight-overview .queue-table td { font-size: var(--overview-font-primary); }
.flight-overview .queue-table th:nth-child(1) { width: 82px; }
.flight-overview .queue-table th:nth-child(2) { width: 76px; }
.flight-overview .queue-table th:nth-child(3) { width: 94px; }
.flight-overview .queue-table th:nth-child(4) { width: 82px; }
.flight-overview .queue-table th:nth-child(5) { width: 126px; }
.flight-overview .queue-table th:nth-child(6) { width: 122px; }
.flight-overview .queue-table th:nth-child(7) { width: 158px; }
.flight-overview .queue-table tbody tr:focus-visible { outline: 2px solid var(--sj-blue); outline-offset: -2px; }
.flight-overview .state-chip.approval { color: var(--sj-amber); background: var(--sj-amber-soft); }
.flight-overview .state-chip.planned { color: var(--sj-blue); background: var(--sj-blue-soft); }
.flight-overview .state-chip.delayed { color: var(--sj-red); background: var(--sj-red-soft); }
.flight-overview .state-chip.departed { color: var(--sj-blue); background: var(--sj-blue-soft); }
.flight-overview .state-chip.arrived { color: var(--sj-teal); background: var(--sj-teal-soft); }
.flight-overview .state-chip { font-size: var(--overview-font-header); font-weight: 650; }
.flight-overview .flight-number, .flight-overview .aircraft-registration, .flight-overview .station-code { font-size: var(--overview-font-primary); line-height: 1.35; }
.flight-overview .flight-number, .flight-overview .aircraft-registration { font-weight: 700; }
.flight-overview .station-code { font-weight: 650; }
.flight-overview .queue-table td > small { margin-top: 2px; font-size: var(--overview-font-secondary); line-height: 1.3; }
.flight-overview .route-code { font-size: var(--overview-font-primary); font-weight: 650; line-height: 1.35; }
.movement-time, .actual-movement { display: inline-flex; align-items: flex-start; gap: var(--sj-space-1); color: var(--sj-text-1); font: 650 var(--overview-font-primary) var(--sj-font-data); line-height: 1.35; white-space: nowrap; }
.movement-time svg, .actual-movement > svg { width: 12px; margin-top: 1px; color: var(--sj-blue); }
.actual-movement > span { display: grid; min-width: 44px; gap: 2px; text-align: center; }
.actual-movement time { color: var(--sj-text-1); }
.actual-movement small { color: var(--sj-text-3); font: 500 var(--overview-font-secondary) var(--sj-font-data); line-height: 1.3; }
.no-actual { color: var(--sj-text-3); font: 600 var(--overview-font-primary) var(--sj-font-data); }
.side-modules { display: grid; height: 100%; min-width: 0; min-height: 0; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: repeat(2, minmax(0, 1fr)); gap: var(--sj-space-4); }
.compact-module { display: grid; min-height: 0; grid-template-rows: auto minmax(0, 1fr); }
.compact-module .module-header { min-height: 52px; }
.module-scroll { min-height: 0; padding: 0 var(--sj-space-3); overflow-y: auto; overscroll-behavior: contain; }
.panel-item { display: grid; width: 100%; min-width: 0; padding: var(--sj-space-3) 0; align-items: center; grid-template-columns: 10px minmax(0, 1fr) auto; gap: var(--sj-space-2); border: 0; border-top: 1px solid var(--sj-grid); color: inherit; text-align: left; background: transparent; cursor: pointer; }
.panel-item:first-child { border-top: 0; }
.panel-item:hover { background: var(--sj-surface-2); }
.panel-item > i { width: 7px; height: 7px; border-radius: 50%; background: var(--sj-lime); }
.todo-list .panel-item.attention > i, .approval-panel-list .panel-item > i { background: var(--sj-amber); }
.approval-panel-list .panel-item.urgent > i, .todo-list .panel-item.blocked > i { background: var(--sj-red); }
.todo-list .panel-item.airborne > i { background: var(--sj-blue); }
.panel-item > div { display: grid; min-width: 0; gap: 2px; }
.panel-item strong { overflow: hidden; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.panel-item span { overflow: hidden; color: var(--sj-text-3); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.panel-item time, .notice-list time { color: var(--sj-text-3); font: 650 9px var(--sj-font-data); }
.todo-workspace, .approval-workspace { display: grid; min-height: 0; grid-template-rows: minmax(0, 1fr) auto; }
.approval-workspace { grid-template-rows: auto minmax(0, 1fr); }
.personal-todo-list { padding-block: var(--sj-space-1); }
.personal-todo-item { display: grid; min-height: 42px; align-items: center; grid-template-columns: 22px minmax(0, 1fr) 28px; gap: var(--sj-space-1); border-top: 1px solid var(--sj-grid); }
.personal-todo-item:first-child { border-top: 0; }
.personal-todo-item input, .todo-create input { width: 100%; min-width: 0; border: 1px solid transparent; color: var(--sj-text-1); outline: 0; background: transparent; font-size: 10px; }
.personal-todo-item input:focus { border-color: var(--sj-border-strong); background: var(--sj-surface-2); }
.personal-todo-item.complete input { color: var(--sj-text-3); text-decoration: line-through; }
.todo-check, .todo-delete, .todo-create button { display: grid; padding: 0; place-items: center; background: transparent; cursor: pointer; }
.todo-check { width: 16px; height: 16px; margin-left: var(--sj-space-1); border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-tag); color: transparent; }
.todo-check svg { width: 11px; }
.todo-check.checked { border-color: var(--sj-lime); color: var(--sj-canvas); background: var(--sj-lime); }
.todo-check:focus-visible { outline: 2px solid var(--sj-blue); outline-offset: 2px; }
.todo-delete, .todo-create button { border: 0; }
.todo-delete { width: 28px; height: 28px; color: var(--sj-text-3); opacity: 0; pointer-events: none; transition: opacity var(--sj-duration-fast), color var(--sj-duration-fast); }
.personal-todo-item:hover .todo-delete, .personal-todo-item:focus-within .todo-delete { opacity: 1; pointer-events: auto; }
.todo-delete:hover { color: var(--sj-red); }
.todo-delete svg, .todo-create button svg { width: 13px; }
.todo-create { display: grid; min-height: 44px; padding: var(--sj-space-2) var(--sj-space-3); grid-template-columns: minmax(0, 1fr) 32px; gap: var(--sj-space-2); border-top: 1px solid var(--sj-border); background: var(--sj-surface-2); }
.todo-create input { padding: 0 var(--sj-space-2); border-color: var(--sj-border); border-radius: var(--sj-radius-control); background: var(--sj-surface-1); }
.todo-create button { border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); color: var(--sj-text-2); background: var(--sj-surface-3); }
.todo-create button:disabled { opacity: .4; cursor: not-allowed; }
.approval-scope { display: grid; padding: var(--sj-space-2) var(--sj-space-3); grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sj-space-1); border-bottom: 1px solid var(--sj-border); }
.approval-scope button { min-height: 30px; border: 1px solid transparent; border-radius: var(--sj-radius-control); color: var(--sj-text-3); background: transparent; font-size: 10px; cursor: pointer; }
.approval-scope button.active { border-color: var(--sj-border-strong); color: var(--sj-text-1); background: var(--sj-surface-3); box-shadow: inset 0 -2px var(--sj-blue); }
.approval-scope span { margin-left: var(--sj-space-1); font: 700 9px var(--sj-font-data); }
.approval-record { grid-template-columns: 7px minmax(0, 1fr) auto; }
.approval-record > i { background: var(--sj-amber); }
.approval-record .approval-meta { align-items: end; text-align: right; }
.approval-meta em { color: var(--sj-amber); font-size: 9px; font-style: normal; }
.risk-list .panel-item { grid-template-columns: 18px minmax(0, 1fr) auto auto; }
.risk-list .panel-item > svg { width: 14px; color: var(--sj-amber); }
.risk-list .panel-item.critical > svg, .risk-list .panel-item.critical time { color: var(--sj-red); }
.alert-source { padding: 3px var(--sj-space-2); border: 1px solid var(--sj-border); border-radius: var(--sj-radius-tag); color: var(--sj-text-2) !important; background: var(--sj-surface-2); }
.notice-item { display: grid; width: 100%; min-width: 0; padding: var(--sj-space-3) 0; align-items: center; grid-template-columns: minmax(0, 1fr) auto; gap: var(--sj-space-2); border: 0; border-top: 1px solid var(--sj-grid); color: inherit; text-align: left; background: transparent; cursor: pointer; }
.notice-item:first-child { border-top: 0; }
.notice-item:hover { background: var(--sj-surface-2); }
.notice-list strong { overflow: hidden; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.configure-button:focus-visible, .quick-action-row button:focus-visible, .panel-item:focus-visible, .notice-item:focus-visible { outline: 2px solid var(--sj-blue); outline-offset: 2px; }

/* Keep dense work areas scrollable without drawing persistent heavy tracks. */
:is(.module-scroll, .queue-table-wrap, .quick-action-row) {
  scrollbar-color: transparent transparent;
  scrollbar-width: thin;
}
:is(.module-scroll, .queue-table-wrap, .quick-action-row):is(:hover, :focus-within) {
  scrollbar-color: var(--sj-border-strong) transparent;
}
:is(.module-scroll, .queue-table-wrap, .quick-action-row)::-webkit-scrollbar {
  width: var(--sj-space-1);
  height: var(--sj-space-1);
}
:is(.module-scroll, .queue-table-wrap, .quick-action-row)::-webkit-scrollbar-track {
  background: transparent;
}
:is(.module-scroll, .queue-table-wrap, .quick-action-row)::-webkit-scrollbar-thumb {
  border-radius: var(--sj-radius-tag);
  background: transparent;
}
:is(.module-scroll, .queue-table-wrap, .quick-action-row):is(:hover, :focus-within)::-webkit-scrollbar-thumb {
  background: var(--sj-border-strong);
}

@media (max-width: 1279px) {
  .dashboard-grid, .workbench-content, .side-modules { gap: var(--sj-space-3); }
  .workbench-content { grid-template-columns: minmax(0, 1fr) minmax(500px, 46%); }
}
@media (max-width: 1199px) {
  .workbench-page { overflow: auto; }
  .dashboard-grid { height: auto; min-height: 100%; grid-template-rows: auto auto; }
  .workbench-content { grid-template-columns: minmax(0, 1fr); }
  .flight-overview { height: 520px; }
  .side-modules { grid-template-rows: repeat(2, 260px); }
  .compact-module { height: 260px; }
}
@media (hover: none) { .todo-delete { opacity: 1; pointer-events: auto; } }
@media (max-width: 699px) {
  .dashboard-grid { padding: var(--sj-space-3); }
  .side-modules { grid-template-columns: minmax(0, 1fr); grid-template-rows: none; }
  .quick-header { align-items: flex-start; flex-wrap: wrap; }
  .module-header > .quick-action-row { order: 3; width: 100%; flex-basis: 100%; }
  .quick-config { right: var(--sj-space-3); left: var(--sj-space-3); width: auto; }
}
</style>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { createIconifyIcon } from '@vben/icons';

defineOptions({ name: 'OperationsWorkbench' });

const AlertIcon = createIconifyIcon('lucide:triangle-alert');
const ArrowIcon = createIconifyIcon('lucide:arrow-right');
const ClockIcon = createIconifyIcon('lucide:clock-3');
const PlaneIcon = createIconifyIcon('lucide:plane-takeoff');

type FlightState = 'airborne' | 'attention' | 'blocked' | 'complete' | 'ready';

interface WorkbenchFlight {
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
}

interface WorkbenchAlert {
  action: string;
  deadline: string;
  flightId: string;
  id: string;
  level: 'critical' | 'warning';
  module: 'flight-release' | 'service-progress';
  owner: string;
  title: string;
}

interface WorkbenchApproval {
  applicant: string;
  id: string;
  module: 'flight-plan' | 'flight-release' | 'trips';
  reference: string;
  submittedAt: string;
  title: string;
  urgent: boolean;
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
  { id: 'WB-11', date: '2026-08-27', flightNo: 'SJX645', registration: 'B-602M', aircraft: 'G650ER', origin: 'WSSS', destination: 'VTBS', etd: '0110Z', eta: '0330Z', progress: 100, nextNode: '航班归档', nextNodeAt: '已完成', state: 'complete', stateLabel: '已到达' },
  { id: 'WB-12', date: '2026-08-27', flightNo: 'SJX648', registration: 'B-9811', aircraft: 'G650ER', origin: 'ZBAA', destination: 'RJTT', etd: '0430Z', eta: '0750Z', progress: 76, nextNode: '到达保障', nextNodeAt: '07:50Z', state: 'airborne', stateLabel: '飞行中' },
  { id: 'WB-13', date: '2026-08-27', flightNo: 'SJX651', registration: 'B-9308', aircraft: 'G450', origin: 'ZGGG', destination: 'ZSPD', etd: '0820Z', eta: '1100Z', progress: 48, nextNode: '确认放行', nextNodeAt: '07:50Z', state: 'attention', stateLabel: '需关注' },
  { id: 'WB-14', date: '2026-08-27', flightNo: 'SJX653', registration: 'B-801Q', aircraft: 'G550', origin: 'ZUUU', destination: 'ZGSZ', etd: '1130Z', eta: '1400Z', progress: 30, nextNode: '取得时刻批复', nextNodeAt: '08:30Z', state: 'blocked', stateLabel: '受阻' },
  { id: 'WB-15', date: '2026-08-27', flightNo: 'SJX656', registration: 'B-3266', aircraft: 'CL605', origin: 'ZSSS', destination: 'ZBAA', etd: '1510Z', eta: '1720Z', progress: 45, nextNode: '燃油确认', nextNodeAt: '13:40Z', state: 'ready', stateLabel: '准备正常' },
  { id: 'WB-16', date: '2026-08-27', flightNo: 'SJX658', registration: 'B-7715', aircraft: 'G550', origin: 'ZLIC', destination: 'ZLZW', etd: '1940Z', eta: '2110Z', progress: 28, nextNode: '任务交接', nextNodeAt: '16:40Z', state: 'ready', stateLabel: '准备正常' },
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
  { id: 'AL-01', flightId: 'WB-04', level: 'critical', title: '日本落地许可未取得', deadline: '11:20Z', owner: '签派 · 张园', action: '处理放行', module: 'flight-release' },
  { id: 'AL-02', flightId: 'WB-03', level: 'warning', title: '机长执勤裕度偏低', deadline: '12:40Z', owner: '机组 · 李悦', action: '查看航班', module: 'flight-release' },
  { id: 'AL-03', flightId: 'WB-05', level: 'warning', title: '特殊餐食尚未确认', deadline: '13:00Z', owner: '保障 · 周宁', action: '处理保障', module: 'service-progress' },
  { id: 'AL-04', flightId: 'WB-13', level: 'warning', title: '目的地雷雨绕飞风险', deadline: '07:30Z', owner: '签派 · 王晨', action: '复核放行', module: 'flight-release' },
  { id: 'AL-05', flightId: 'WB-14', level: 'critical', title: '起飞时刻批复未取得', deadline: '08:30Z', owner: '签派 · 张园', action: '处理放行', module: 'flight-release' },
  { id: 'AL-06', flightId: 'WB-15', level: 'warning', title: '加油单等待供应商确认', deadline: '13:40Z', owner: '保障 · 周宁', action: '处理保障', module: 'service-progress' },
];

const approvals: WorkbenchApproval[] = [
  { id: 'AP-01', title: '行程确认', reference: 'SJ260827 · 远航科技', applicant: '李悦', submittedAt: '10:18', urgent: false, module: 'trips' },
  { id: 'AP-02', title: '航班变更', reference: 'SJX653 · 起飞时间变更', applicant: '张园', submittedAt: '09:42', urgent: true, module: 'flight-plan' },
  { id: 'AP-03', title: '放行申请', reference: 'SJX651 · ZGGG → ZSPD', applicant: '王晨', submittedAt: '09:31', urgent: false, module: 'flight-release' },
];

const dateFlights = computed(() => flights.filter((flight) => flight.date === selectedDate));
const operationalTodos = computed(() => dateFlights.value.filter((flight) => flight.state !== 'complete'));
const todayAlerts = computed(() => {
  const flightIds = new Set(dateFlights.value.map((flight) => flight.id));
  return alerts.filter((alert) => flightIds.has(alert.flightId));
});

const dateLabel = computed(() => {
  const date = new Date(`${selectedDate}T00:00:00`);
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long', day: 'numeric', weekday: 'short',
  }).format(date);
});

function displayTime(value: string) {
  return value;
}

function prefixPath(path: string) {
  if (route.path.startsWith('/demo/')) return `/demo/${path}`;
  if (route.path.startsWith('/preview/')) return `/preview/${path}`;
  return `/operations/${path}`;
}

function openFlight(flight: WorkbenchFlight) {
  const prefix = route.path.startsWith('/demo/') ? '/demo' : route.path.startsWith('/preview/') ? '/preview' : '/operations';
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
</script>

<template>
  <main class="workbench-page sj-mission-control" data-starjet-theme="mission-control-dark">
    <section class="dashboard-grid">
      <section class="module-card flight-overview">
        <header class="module-header">
          <div><h1>航班概览</h1><span>{{ dateLabel }} · UTC</span></div>
          <strong>{{ dateFlights.length }} 个航班</strong>
        </header>

        <div class="queue-table-wrap">
          <table class="queue-table">
            <thead><tr><th>时间</th><th>航班 / 飞机</th><th>航段</th><th>运行进度</th><th>下一节点</th><th>状态</th></tr></thead>
            <tbody>
              <tr
                v-for="flight in dateFlights"
                :key="flight.id"
                tabindex="0"
                @click="openFlight(flight)"
                @keydown.enter="openFlight(flight)"
              >
                <td><time>{{ displayTime(flight.etd) }}</time><small>{{ displayTime(flight.eta) }}</small></td>
                <td><strong class="sj-data">{{ flight.flightNo }}</strong><small class="sj-data">{{ flight.registration }} · {{ flight.aircraft }}</small></td>
                <td class="route-code">{{ flight.origin }} <ArrowIcon /> {{ flight.destination }}</td>
                <td><div class="progress-track"><i :class="flight.state" :style="{ width: `${flight.progress}%` }"></i></div><small>{{ flight.progress }}%</small></td>
                <td><strong>{{ flight.nextNode }}</strong><small>{{ displayTime(flight.nextNodeAt) }}</small></td>
                <td><span :class="['state-chip', flight.state]">{{ flight.stateLabel }}</span></td>
              </tr>
              <tr v-if="dateFlights.length === 0"><td class="empty-state" colspan="6">当日暂无航班</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="module-card todo-module">
        <header class="module-header">
          <div><h2>待办事项</h2><span>运行任务与审批</span></div>
          <strong>{{ operationalTodos.length + approvals.length }}</strong>
        </header>
        <div class="todo-list">
          <article v-for="flight in operationalTodos" :key="flight.id" :class="flight.state">
            <i></i>
            <div><strong>{{ flight.nextNode }}</strong><span class="sj-data">{{ flight.flightNo }} · {{ flight.origin }} → {{ flight.destination }}</span></div>
            <time>{{ displayTime(flight.nextNodeAt) }}</time>
            <button type="button" @click="openFlight(flight)">查看<ArrowIcon /></button>
          </article>
          <article v-for="item in approvals" :key="item.id" :class="{ urgent: item.urgent }">
            <i></i>
            <div><strong>{{ item.title }}</strong><span class="sj-data">{{ item.reference }} · {{ item.applicant }}</span></div>
            <time>{{ item.submittedAt }}</time>
            <button type="button" @click="openModule(item.module)">审批<ArrowIcon /></button>
          </article>
        </div>
      </section>

      <section class="module-card risk-module">
        <header class="module-header">
          <div><h2>风险提醒</h2><span>当日运行风险</span></div>
          <strong>{{ todayAlerts.length }}</strong>
        </header>
        <div class="risk-list">
          <article v-for="item in todayAlerts" :key="item.id" :class="item.level">
            <AlertIcon />
            <div><strong>{{ item.title }}</strong><span>{{ item.owner }}</span></div>
            <time>{{ item.deadline }}</time>
            <button type="button" @click="openModule(item.module)">{{ item.action }}<ArrowIcon /></button>
          </article>
          <div v-if="todayAlerts.length === 0" class="clear-state"><span>✓</span><strong>当日暂无风险提醒</strong></div>
        </div>
      </section>

      <section class="module-card common-module">
        <header class="module-header"><div><h2>常用功能</h2></div></header>
        <div class="common-actions">
          <button type="button" @click="openModule('flight-plan')"><PlaneIcon /><span>航班计划</span></button>
          <button type="button" @click="openModule('flight-release')"><span class="action-dot lime"></span><span>飞行放行</span></button>
          <button type="button" @click="openModule('service-progress')"><ClockIcon /><span>保障进程</span></button>
          <button type="button" @click="openModule('trips')"><span class="action-dot blue"></span><span>行程管理</span></button>
        </div>
      </section>
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
.workbench-canvas { display: grid; min-width: 0; min-height: 0; grid-template-columns: minmax(0, 1fr) 360px; overflow: hidden; }.flight-queue { display: grid; min-width: 0; min-height: 0; grid-template-rows: 56px minmax(0, 1fr); border-right: 1px solid var(--sj-border); }.section-header { display: flex; padding: 0 var(--sj-space-5); align-items: center; justify-content: space-between; border-bottom: 1px solid var(--sj-border); background: var(--sj-surface-1); }.section-header > div:first-child { display: flex; align-items: baseline; gap: var(--sj-space-3); }.section-header h2 { margin: 0; font-size: 14px; }.section-header span { color: var(--sj-text-3); font-size: 10px; }.queue-table-wrap { min-width: 0; min-height: 0; overflow: auto; }.queue-table { width: 100%; min-width: 860px; border-collapse: collapse; table-layout: fixed; }.queue-table th { position: sticky; z-index: 4; top: 0; height: 40px; padding: 0 var(--sj-space-3); color: var(--sj-text-3); background: var(--sj-surface-2); font-size: 10px; font-weight: 600; text-align: left; }.queue-table th:nth-child(1) { width: 100px; }.queue-table th:nth-child(2) { width: 150px; }.queue-table th:nth-child(3) { width: 150px; }.queue-table th:nth-child(4) { width: 150px; }.queue-table th:nth-child(5) { width: 160px; }.queue-table th:nth-child(6) { width: 100px; }.queue-table td { height: 72px; padding: var(--sj-space-2) var(--sj-space-3); border-top: 1px solid var(--sj-grid); vertical-align: middle; }.queue-table tbody tr { background: var(--sj-canvas); cursor: pointer; transition: background var(--sj-duration-fast); }.queue-table tbody tr:hover { background: var(--sj-surface-2); }.queue-table tbody tr.selected { background: var(--sj-blue-soft); box-shadow: inset 2px 0 var(--sj-blue); }.queue-table td > strong, .queue-table td > small, .queue-table td > time { display: block; }.queue-table td > time, .route-code { color: var(--sj-text-1); font: 650 12px var(--sj-font-data); }.queue-table td > small { margin-top: var(--sj-space-1); color: var(--sj-text-3); font-size: 10px; }.route-code { white-space: nowrap; }.route-code svg { width: 13px; margin: 0 var(--sj-space-1); color: var(--sj-blue); vertical-align: -2px; }.progress-track { height: 4px; overflow: hidden; border-radius: var(--sj-radius-tag); background: var(--sj-grid); }.progress-track i { display: block; height: 100%; background: var(--sj-lime); }.progress-track i.attention { background: var(--sj-amber); }.progress-track i.blocked { background: var(--sj-red); }.progress-track i.airborne { background: var(--sj-blue); }.progress-track i.complete { background: var(--sj-teal); }.state-chip { display: inline-flex; min-height: 22px; padding: 0 var(--sj-space-2); align-items: center; border-radius: var(--sj-radius-tag); color: var(--sj-text-2); background: var(--sj-surface-3); font-size: 10px; font-weight: 650; white-space: nowrap; }.state-chip.airborne { color: var(--sj-blue); background: var(--sj-blue-soft); }.state-chip.attention { color: var(--sj-amber); background: var(--sj-amber-soft); }.state-chip.blocked { color: var(--sj-red); background: var(--sj-red-soft); }.state-chip.ready { color: var(--sj-lime); background: var(--sj-lime-soft); }.state-chip.complete { color: var(--sj-teal); background: var(--sj-teal-soft); }.empty-state { height: 180px !important; color: var(--sj-text-3); text-align: center; cursor: default; }
.flight-inspector { min-width: 0; min-height: 0; overflow-y: auto; background: var(--sj-surface-1); }.inspector-flight { display: grid; padding: var(--sj-space-5); grid-template-columns: 1fr var(--sj-control-default); gap: var(--sj-space-3); border-bottom: 1px solid var(--sj-border); }.inspector-flight > div { display: flex; align-items: center; gap: var(--sj-space-2); }.inspector-flight > div > strong { font-size: 14px; }.inspector-flight > button { display: grid; width: var(--sj-control-default); height: var(--sj-control-default); padding: 0; place-items: center; border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); background: var(--sj-surface-2); cursor: pointer; }.inspector-flight > button svg { width: 15px; }.inspector-flight h2, .inspector-flight p { grid-column: 1 / -1; margin: 0; }.inspector-flight h2 { font-size: 24px; }.inspector-flight p { color: var(--sj-text-3); font-size: 10px; }.next-node { display: grid; padding: var(--sj-space-4) var(--sj-space-5); grid-template-columns: 1fr auto; gap: var(--sj-space-1); border-bottom: 1px solid var(--sj-border); }.next-node span { grid-column: 1 / -1; color: var(--sj-text-3); font-size: 10px; }.next-node strong { font-size: 13px; }.next-node time { color: var(--sj-blue); font: 700 12px var(--sj-font-data); }.alert-list { padding: var(--sj-space-4) var(--sj-space-5); border-bottom: 1px solid var(--sj-border); }.alert-list > header { display: flex; margin-bottom: var(--sj-space-3); align-items: center; justify-content: space-between; }.alert-list h3, .quick-actions h3 { margin: 0; font-size: 12px; }.alert-list > header span { display: grid; width: 22px; height: 22px; place-items: center; border-radius: var(--sj-radius-tag); color: var(--sj-text-2); background: var(--sj-surface-3); font: 700 10px var(--sj-font-data); }.alert-list article { display: grid; padding: var(--sj-space-3) 0; grid-template-columns: 18px 1fr auto; gap: var(--sj-space-2); border-top: 1px solid var(--sj-grid); }.alert-list article > svg { width: 14px; color: var(--sj-amber); }.alert-list article.critical > svg, .alert-list article.critical > time { color: var(--sj-red); }.alert-list article > div { display: grid; gap: var(--sj-space-1); }.alert-list article strong { font-size: 11px; }.alert-list article span { color: var(--sj-text-3); font-size: 9px; }.alert-list article > time { color: var(--sj-amber); font: 650 10px var(--sj-font-data); }.alert-list article > button { grid-column: 2 / -1; display: inline-flex; padding: 0; align-items: center; justify-self: start; gap: var(--sj-space-1); border: 0; color: var(--sj-blue); background: transparent; font-size: 10px; cursor: pointer; }.alert-list article > button svg { width: 12px; }.clear-state { display: flex; min-height: 74px; align-items: center; justify-content: center; gap: var(--sj-space-2); color: var(--sj-lime); }.clear-state span { font: 750 13px var(--sj-font-data); }.clear-state strong { font-size: 11px; }.quick-actions { padding: var(--sj-space-4) var(--sj-space-5); }.quick-actions > div { display: grid; margin-top: var(--sj-space-3); grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sj-space-2); }.quick-actions button { display: flex; min-height: var(--sj-control-primary); padding: 0 var(--sj-space-3); align-items: center; gap: var(--sj-space-2); border: 1px solid var(--sj-border); border-radius: var(--sj-radius-control); background: var(--sj-surface-2); font-size: 10px; cursor: pointer; }.quick-actions button:hover { border-color: var(--sj-border-strong); background: var(--sj-surface-3); }.quick-actions button svg { width: 14px; color: var(--sj-blue); }.inspector-empty { display: grid; height: 100%; place-items: center; color: var(--sj-text-3); font-size: 11px; }
.approval-list { padding: var(--sj-space-4) var(--sj-space-5); border-bottom: 1px solid var(--sj-border); }.approval-list > header { display: flex; margin-bottom: var(--sj-space-3); align-items: center; justify-content: space-between; }.approval-list h3 { margin: 0; font-size: 12px; }.approval-list > header span { display: grid; width: 22px; height: 22px; place-items: center; border-radius: var(--sj-radius-tag); color: var(--sj-amber); background: var(--sj-amber-soft); font: 700 10px var(--sj-font-data); }.approval-list article { display: grid; padding: var(--sj-space-3) 0; align-items: center; grid-template-columns: minmax(0, 1fr) auto; gap: var(--sj-space-1) var(--sj-space-2); border-top: 1px solid var(--sj-grid); }.approval-list article > div { display: grid; min-width: 0; gap: 2px; }.approval-list article strong { font-size: 11px; }.approval-list article > div span { overflow: hidden; color: var(--sj-text-3); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }.approval-list article > time { color: var(--sj-text-3); font: 600 9px var(--sj-font-data); }.approval-list article > p { margin: 0; color: var(--sj-text-2); font-size: 9px; }.approval-list article > button { display: inline-flex; padding: 0; align-items: center; justify-self: end; gap: var(--sj-space-1); border: 0; color: var(--sj-blue); background: transparent; font-size: 10px; cursor: pointer; }.approval-list article > button svg { width: 12px; }.approval-list article.urgent { box-shadow: inset 2px 0 var(--sj-amber); }.approval-list article.urgent strong { color: var(--sj-amber); }
@media (max-width: 1279px) { .command-bar { grid-template-columns: minmax(130px, 1fr) auto minmax(260px, 1fr); padding-inline: var(--sj-space-4); }.sync-time { display: none; }.workbench-canvas { grid-template-columns: minmax(0, 1fr) 320px; }.status-strip button { padding-inline: var(--sj-space-3); }.queue-table { min-width: 780px; } }
@media (max-width: 1199px) { .workbench-page { overflow: auto; grid-template-rows: auto auto auto; }.command-bar { grid-template-columns: 1fr auto; }.date-controller { grid-row: 2; grid-column: 1 / -1; justify-self: stretch; }.command-actions { grid-column: 2; grid-row: 1; }.workbench-canvas { display: block; overflow: visible; }.flight-queue { min-height: 520px; border-right: 0; }.flight-inspector { border-top: 1px solid var(--sj-border-strong); }.status-strip { grid-template-columns: repeat(3, minmax(0, 1fr)); }.status-strip button { min-height: 56px; border-bottom: 1px solid var(--sj-border); }.flight-inspector { max-height: none; }.inspector-flight, .next-node, .alert-list, .approval-list, .quick-actions { padding-inline: var(--sj-space-4); } }
@media (max-width: 699px) { .command-bar { display: flex; align-items: stretch; flex-direction: column; }.workbench-title { justify-content: space-between; }.command-actions { justify-content: space-between; }.date-controller { width: 100%; }.status-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }.section-header { padding-inline: var(--sj-space-3); }.workbench-canvas { min-width: 0; }.flight-queue { min-height: 480px; }.queue-table-wrap { overflow-x: auto; }.quick-actions > div { grid-template-columns: 1fr; } }

.workbench-page { display: block; height: var(--vben-content-height, 100dvh); min-height: 0; overflow: auto; }
.dashboard-grid { display: grid; min-width: 0; min-height: 100%; padding: var(--sj-space-4); grid-template-columns: minmax(0, 1fr) 340px; grid-template-rows: auto auto auto; align-items: start; gap: var(--sj-space-4); }
.module-card { min-width: 0; overflow: hidden; border: 1px solid var(--sj-border); border-radius: var(--sj-radius-panel); background: var(--sj-surface-1); }
.module-header { display: flex; min-height: 58px; padding: 0 var(--sj-space-4); align-items: center; justify-content: space-between; gap: var(--sj-space-3); border-bottom: 1px solid var(--sj-border); }
.module-header > div { display: grid; gap: 2px; }
.module-header h1, .module-header h2 { margin: 0; font-size: 14px; }
.module-header span { color: var(--sj-text-3); font-size: 10px; }
.module-header > strong { color: var(--sj-text-2); font: 700 11px var(--sj-font-data); }
.flight-overview { display: grid; min-height: 620px; grid-row: 1 / span 3; grid-template-rows: auto minmax(0, 1fr); }
.flight-overview .queue-table-wrap { min-height: 0; }
.flight-overview .queue-table { min-width: 780px; }
.flight-overview .queue-table tbody tr:focus-visible { outline: 2px solid var(--sj-blue); outline-offset: -2px; }
.todo-module, .risk-module, .common-module { grid-column: 2; }
.todo-list, .risk-list { padding: 0 var(--sj-space-4); }
.todo-list article, .risk-list article { display: grid; min-width: 0; padding: var(--sj-space-3) 0; align-items: center; grid-template-columns: 12px minmax(0, 1fr) auto; gap: var(--sj-space-2); border-top: 1px solid var(--sj-grid); }
.todo-list article:first-child, .risk-list article:first-child { border-top: 0; }
.todo-list article > i { width: 7px; height: 7px; border-radius: 50%; background: var(--sj-lime); }
.todo-list article.attention > i, .todo-list article.urgent > i { background: var(--sj-amber); }
.todo-list article.blocked > i { background: var(--sj-red); }
.todo-list article.airborne > i { background: var(--sj-blue); }
.todo-list article > div, .risk-list article > div { display: grid; min-width: 0; gap: 2px; }
.todo-list article strong, .risk-list article strong { overflow: hidden; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.todo-list article span, .risk-list article span { overflow: hidden; color: var(--sj-text-3); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.todo-list article time, .risk-list article time { color: var(--sj-text-3); font: 650 9px var(--sj-font-data); }
.todo-list article button, .risk-list article button { grid-column: 2 / -1; display: inline-flex; padding: 0; align-items: center; justify-self: start; gap: var(--sj-space-1); border: 0; color: var(--sj-blue); background: transparent; font-size: 10px; cursor: pointer; }
.todo-list article button svg, .risk-list article button svg { width: 12px; }
.risk-list article { grid-template-columns: 18px minmax(0, 1fr) auto; }
.risk-list article > svg { width: 14px; color: var(--sj-amber); }
.risk-list article.critical > svg, .risk-list article.critical time { color: var(--sj-red); }
.common-actions { display: grid; padding: var(--sj-space-4); grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sj-space-2); }
.common-actions button { display: flex; min-height: var(--sj-control-primary); padding: 0 var(--sj-space-3); align-items: center; gap: var(--sj-space-2); border: 1px solid var(--sj-border); border-radius: var(--sj-radius-control); color: var(--sj-text-1); background: var(--sj-surface-2); font-size: 10px; cursor: pointer; }
.common-actions button:hover { border-color: var(--sj-border-strong); background: var(--sj-surface-3); }
.common-actions button:focus-visible, .todo-list button:focus-visible, .risk-list button:focus-visible { outline: 2px solid var(--sj-blue); outline-offset: 2px; }
.common-actions svg { width: 14px; color: var(--sj-blue); }
.common-actions .action-dot { display: inline-block; }

@media (max-width: 1279px) {
  .dashboard-grid { grid-template-columns: minmax(0, 1fr) 310px; gap: var(--sj-space-3); }
}
@media (max-width: 1199px) {
  .dashboard-grid { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto; }
  .flight-overview { min-height: 560px; grid-row: auto; }
  .todo-module, .risk-module, .common-module { grid-column: 1; }
  .todo-list, .risk-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: var(--sj-space-4); }
}
@media (max-width: 699px) {
  .dashboard-grid { padding: var(--sj-space-3); }
  .todo-list, .risk-list, .common-actions { grid-template-columns: 1fr; }
}
</style>

<script lang="ts" setup>
import { computed, ref } from 'vue';

import { createIconifyIcon } from '@vben/icons';
import { ElMessage } from 'element-plus';

defineOptions({ name: 'FlightRelease' });

const CloseIcon = createIconifyIcon('lucide:x');
const RotateIcon = createIconifyIcon('lucide:rotate-ccw');
const CheckIcon = createIconifyIcon('lucide:check');
const AlertIcon = createIconifyIcon('lucide:triangle-alert');

type CheckState = 'ready' | 'pending' | 'blocked';
type ReleaseStatus = '已放行' | '待放行' | '受阻' | '准备中';
type CheckKey = 'cfp' | 'weather' | 'notam' | 'fpl';

interface ReleaseFlight {
  aircraft: string;
  alternates: string;
  ata: string;
  atd: string;
  checks: Record<CheckKey, CheckState>;
  date: string;
  destination: string;
  eta: string;
  etd: string;
  flightNo: string;
  id: string;
  origin: string;
  registration: string;
  releaseBy: string;
  releaseStatus: ReleaseStatus;
  releaseTime: string;
  sta: string;
  std: string;
}

const checkLabels: Record<CheckKey, string> = {
  cfp: '计算飞行计划', weather: '气象资料', notam: '航行通告', fpl: '飞行计划报',
};

const flights = ref<ReleaseFlight[]>([
  { id: 'REL-01', date: '2026-08-22', flightNo: 'SJX603', registration: 'B-602M', aircraft: 'G650ER', origin: 'ZGGG', destination: 'ZGSZ', std: '0820Z', etd: '0820Z', atd: '', sta: '1040Z', eta: '1040Z', ata: '', alternates: 'ZBAA / ZGGG', checks: { cfp: 'ready', weather: 'ready', notam: 'ready', fpl: 'ready' }, releaseStatus: '待放行', releaseTime: '', releaseBy: '' },
  { id: 'REL-02', date: '2026-08-22', flightNo: 'SJX608', registration: 'B-9308', aircraft: 'G450', origin: 'ZSPD', destination: 'ZGGG', std: '1330Z', etd: '1400Z', atd: '', sta: '1620Z', eta: '1650Z', ata: '', alternates: 'ZGSZ', checks: { cfp: 'ready', weather: 'pending', notam: 'ready', fpl: 'ready' }, releaseStatus: '准备中', releaseTime: '', releaseBy: '' },
  { id: 'REL-03', date: '2026-08-22', flightNo: 'SJX611', registration: 'B-9811', aircraft: 'G650ER', origin: 'ZSPD', destination: 'ZBAA', std: '1420Z', etd: '1420Z', atd: '', sta: '1710Z', eta: '1710Z', ata: '', alternates: 'ZBTJ', checks: { cfp: 'ready', weather: 'ready', notam: 'blocked', fpl: 'pending' }, releaseStatus: '受阻', releaseTime: '', releaseBy: '' },
  { id: 'REL-04', date: '2026-08-23', flightNo: 'SJX615', registration: 'B-801Q', aircraft: 'G550', origin: 'ZUUU', destination: 'ZSPD', std: '0900Z', etd: '0900Z', atd: '', sta: '1200Z', eta: '1200Z', ata: '', alternates: 'ZSSS', checks: { cfp: 'ready', weather: 'ready', notam: 'ready', fpl: 'ready' }, releaseStatus: '已放行', releaseTime: '07:42Z', releaseBy: '张园' },
  { id: 'REL-05', date: '2026-08-23', flightNo: 'SJX617', registration: 'B-9811', aircraft: 'G650ER', origin: 'ZBAA', destination: 'ZGSZ', std: '1520Z', etd: '1520Z', atd: '', sta: '1800Z', eta: '1800Z', ata: '', alternates: 'ZGGG', checks: { cfp: 'pending', weather: 'pending', notam: 'ready', fpl: 'pending' }, releaseStatus: '准备中', releaseTime: '', releaseBy: '' },
  { id: 'REL-06', date: '2026-08-24', flightNo: 'SJX619', registration: 'B-9308', aircraft: 'G450', origin: 'ZGSZ', destination: 'ZGGG', std: '0410Z', etd: '0410Z', atd: '', sta: '0530Z', eta: '0530Z', ata: '', alternates: 'ZHUH', checks: { cfp: 'ready', weather: 'ready', notam: 'ready', fpl: 'ready' }, releaseStatus: '待放行', releaseTime: '', releaseBy: '' },
]);

const timeBase = ref<'UTC' | 'BJ'>('UTC');
const startDate = ref('2026-08-22');
const endDate = ref('2026-08-24');
const flightFilter = ref('');
const originFilter = ref('');
const destinationFilter = ref('');
const aircraftFilter = ref('全部机型');
const registrationFilter = ref('全部注册号');
const statusFilter = ref<'全部状态' | ReleaseStatus>('全部状态');
const selectedId = ref<string | null>(null);
const releaseNote = ref('');

const aircraftOptions = computed(() => [...new Set(flights.value.map((item) => item.aircraft))]);
const registrationOptions = computed(() => [...new Set(flights.value.map((item) => item.registration))]);
const filteredFlights = computed(() => flights.value.filter((flight) =>
  flight.date >= startDate.value && flight.date <= endDate.value &&
  (!flightFilter.value || flight.flightNo.toLowerCase().includes(flightFilter.value.toLowerCase())) &&
  (!originFilter.value || flight.origin.includes(originFilter.value.toUpperCase())) &&
  (!destinationFilter.value || flight.destination.includes(destinationFilter.value.toUpperCase())) &&
  (aircraftFilter.value === '全部机型' || flight.aircraft === aircraftFilter.value) &&
  (registrationFilter.value === '全部注册号' || flight.registration === registrationFilter.value) &&
  (statusFilter.value === '全部状态' || flight.releaseStatus === statusFilter.value),
));
const selectedFlight = computed(() => flights.value.find((flight) => flight.id === selectedId.value) || null);
const releaseReady = computed(() => selectedFlight.value && Object.values(selectedFlight.value.checks).every((state) => state === 'ready'));
const summary = computed(() => ({
  total: filteredFlights.value.length,
  ready: filteredFlights.value.filter((item) => item.releaseStatus === '待放行').length,
  released: filteredFlights.value.filter((item) => item.releaseStatus === '已放行').length,
  preparing: filteredFlights.value.filter((item) => item.releaseStatus === '准备中').length,
  blocked: filteredFlights.value.filter((item) => item.releaseStatus === '受阻').length,
}));

function displayTime(value: string) {
  if (!value || timeBase.value === 'UTC') return value || '—';
  const hour = Number(value.slice(0, 2));
  return `${String((hour + 8) % 24).padStart(2, '0')}${value.slice(2, 4)} BJ`;
}

function resetFilters() {
  startDate.value = '2026-08-22'; endDate.value = '2026-08-24'; flightFilter.value = '';
  originFilter.value = ''; destinationFilter.value = ''; aircraftFilter.value = '全部机型';
  registrationFilter.value = '全部注册号'; statusFilter.value = '全部状态';
}

function setCheck(key: CheckKey, state: CheckState) {
  if (!selectedFlight.value) return;
  selectedFlight.value.checks[key] = state;
  const states = Object.values(selectedFlight.value.checks);
  selectedFlight.value.releaseStatus = states.includes('blocked') ? '受阻' : states.every((item) => item === 'ready') ? '待放行' : '准备中';
}

function confirmRelease() {
  if (!selectedFlight.value || !releaseReady.value) return;
  selectedFlight.value.releaseStatus = '已放行';
  selectedFlight.value.releaseTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
  selectedFlight.value.releaseBy = '当前用户';
  ElMessage.success(`${selectedFlight.value.flightNo} 已确认放行`);
}
</script>

<template>
  <main class="release-page sj-mission-control" data-starjet-theme="mission-control-dark">
    <header class="command-bar">
      <div class="filters">
        <label class="field time-field"><span>时间基准</span><span class="segmented"><button :class="{ active: timeBase === 'UTC' }" @click="timeBase = 'UTC'">UTC</button><button :class="{ active: timeBase === 'BJ' }" @click="timeBase = 'BJ'">北京时间</button></span></label>
        <label class="field"><span>开始日期</span><input v-model="startDate" type="date" /></label>
        <label class="field"><span>结束日期</span><input v-model="endDate" type="date" /></label>
        <label class="field"><span>航班号</span><input v-model="flightFilter" placeholder="如 SJX603" /></label>
        <label class="field airport-field"><span>起飞</span><input v-model="originFilter" maxlength="4" placeholder="四字码" /></label>
        <label class="field airport-field"><span>落地</span><input v-model="destinationFilter" maxlength="4" placeholder="四字码" /></label>
        <label class="field"><span>机型</span><select v-model="aircraftFilter"><option>全部机型</option><option v-for="item in aircraftOptions" :key="item">{{ item }}</option></select></label>
        <label class="field"><span>注册号</span><select v-model="registrationFilter"><option>全部注册号</option><option v-for="item in registrationOptions" :key="item">{{ item }}</option></select></label>
        <label class="field"><span>放行状态</span><select v-model="statusFilter"><option>全部状态</option><option>已放行</option><option>待放行</option><option>准备中</option><option>受阻</option></select></label>
      </div>
      <button class="secondary-button" type="button" @click="resetFilters"><RotateIcon />重置</button>
    </header>

    <section class="status-strip">
      <div><strong class="sj-data">{{ summary.total }}</strong><span>当前航班</span></div>
      <div class="ready"><i></i><strong class="sj-data">{{ summary.ready }}</strong><span>待确认放行</span></div>
      <div class="released"><i></i><strong class="sj-data">{{ summary.released }}</strong><span>已放行</span></div>
      <div class="preparing"><i></i><strong class="sj-data">{{ summary.preparing }}</strong><span>准备中</span></div>
      <div class="blocked"><i></i><strong class="sj-data">{{ summary.blocked }}</strong><span>受阻</span></div>
    </section>

    <section class="workspace">
      <div class="table-scroll">
        <table class="release-table">
          <thead><tr><th>日期</th><th>航班号</th><th>注册号 / 机型</th><th>航段</th><th>计划起飞</th><th>预计 / 实际起飞</th><th>计划到达</th><th>预计 / 实际到达</th><th>备降场</th><th>CFP</th><th>天气</th><th>航行通告</th><th>FPL</th><th>放行状态</th><th>放行时间</th></tr></thead>
          <tbody>
            <tr v-for="flight in filteredFlights" :key="flight.id" :class="{ selected: selectedId === flight.id }" tabindex="0" @click="selectedId = flight.id" @keydown.enter="selectedId = flight.id">
              <td class="sj-data muted">{{ flight.date }}</td><td class="sj-data flight-no">{{ flight.flightNo }}</td>
              <td><b class="sj-data">{{ flight.registration }}</b><small class="sj-data">{{ flight.aircraft }}</small></td>
              <td class="route sj-data">{{ flight.origin }} → {{ flight.destination }}</td><td class="sj-data">{{ displayTime(flight.std) }}</td>
              <td class="sj-data"><span>{{ displayTime(flight.etd) }}</span><small>{{ displayTime(flight.atd) }}</small></td><td class="sj-data">{{ displayTime(flight.sta) }}</td>
              <td class="sj-data"><span>{{ displayTime(flight.eta) }}</span><small>{{ displayTime(flight.ata) }}</small></td><td class="sj-data">{{ flight.alternates }}</td>
              <td v-for="key in (['cfp','weather','notam','fpl'] as CheckKey[])" :key="key"><span class="check-dot" :class="flight.checks[key]" :title="`${checkLabels[key]}：${flight.checks[key]}`"></span></td>
              <td><span class="status-chip" :class="flight.releaseStatus">{{ flight.releaseStatus }}</span></td><td class="sj-data muted">{{ flight.releaseTime || '—' }}</td>
            </tr>
            <tr v-if="filteredFlights.length === 0"><td class="empty" colspan="15">当前筛选条件下暂无待处理航班</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="selectedFlight" class="drawer-backdrop" @click.self="selectedId = null">
      <aside class="release-drawer">
        <header class="drawer-header"><div><small>放行检查</small><strong>{{ selectedFlight.flightNo }}</strong></div><button class="icon-button" title="关闭" @click="selectedId = null"><CloseIcon /></button></header>
        <section class="flight-identity"><div><span class="sj-data">{{ selectedFlight.registration }} · {{ selectedFlight.aircraft }}</span><strong class="sj-data">{{ selectedFlight.origin }} → {{ selectedFlight.destination }}</strong><small class="sj-data">{{ selectedFlight.date }} · {{ displayTime(selectedFlight.std) }}—{{ displayTime(selectedFlight.sta) }}</small></div><span class="status-chip" :class="selectedFlight.releaseStatus">{{ selectedFlight.releaseStatus }}</span></section>
        <div class="drawer-body">
          <section class="check-section"><h3>放行资料</h3><div v-for="(label, key) in checkLabels" :key="key" class="check-row"><div><strong>{{ label }}</strong><small>{{ selectedFlight.checks[key] === 'ready' ? '资料已核验' : selectedFlight.checks[key] === 'blocked' ? '存在阻碍，无法放行' : '资料待补充或核验' }}</small></div><div class="state-picker"><button title="就绪" :class="{ active: selectedFlight.checks[key] === 'ready' }" @click="setCheck(key, 'ready')"><i class="ready"></i></button><button title="待处理" :class="{ active: selectedFlight.checks[key] === 'pending' }" @click="setCheck(key, 'pending')"><i class="pending"></i></button><button title="受阻" :class="{ active: selectedFlight.checks[key] === 'blocked' }" @click="setCheck(key, 'blocked')"><i class="blocked"></i></button></div></div></section>
          <section v-if="!releaseReady" class="blocker"><AlertIcon /><div><strong>暂不可放行</strong><span>请先完成全部放行资料核验，并处理红色阻碍项。</span></div></section>
          <label class="note-field"><span>放行备注</span><textarea v-model="releaseNote" rows="4" placeholder="记录限制条件、协调结论或签派备注"></textarea></label>
          <section v-if="selectedFlight.releaseStatus === '已放行'" class="release-record"><CheckIcon /><div><strong>已由 {{ selectedFlight.releaseBy }} 确认放行</strong><span class="sj-data">{{ selectedFlight.releaseTime }}</span></div></section>
        </div>
        <footer class="drawer-footer"><button class="primary-button" :disabled="!releaseReady || selectedFlight.releaseStatus === '已放行'" @click="confirmRelease"><CheckIcon />{{ selectedFlight.releaseStatus === '已放行' ? '已确认放行' : '确认放行' }}</button></footer>
      </aside>
    </div>
  </main>
</template>

<style scoped>
.release-page{display:flex;min-width:0;height:var(--vben-content-height,100dvh);min-height:620px;overflow:hidden;flex-direction:column}button,input,select,textarea{font:inherit}button{cursor:pointer}.command-bar{display:flex;min-height:92px;padding:var(--sj-space-3) var(--sj-space-4);border-bottom:1px solid var(--sj-border);background:var(--sj-surface-1);align-items:flex-end;gap:var(--sj-space-3)}.filters{display:flex;min-width:0;overflow-x:auto;align-items:flex-end;gap:var(--sj-space-2);flex:1}.field{display:grid;min-width:126px;color:var(--sj-text-3);font-size:11px;gap:var(--sj-space-1)}.field.time-field{min-width:166px}.field.airport-field{min-width:92px}.field :is(input,select),.note-field textarea{height:var(--sj-control-default);padding:0 var(--sj-space-3);border:1px solid var(--sj-border-strong);border-radius:var(--sj-radius-control);color:var(--sj-text-1);background:var(--sj-surface-2)}.segmented{display:flex;height:var(--sj-control-default);padding:2px;border:1px solid var(--sj-border-strong);border-radius:var(--sj-radius-control);background:var(--sj-surface-2)}.segmented button{border:0;border-radius:var(--sj-radius-tag);color:var(--sj-text-3);background:transparent;flex:1}.segmented button.active{color:var(--sj-text-1);background:var(--sj-surface-4)}.secondary-button,.primary-button,.icon-button{display:inline-flex;height:var(--sj-control-default);padding:0 var(--sj-space-3);border:1px solid var(--sj-border-strong);border-radius:var(--sj-radius-control);color:var(--sj-text-1);background:var(--sj-surface-2);align-items:center;justify-content:center;gap:var(--sj-space-2);font-weight:700}.icon-button{width:var(--sj-control-default);padding:0}.secondary-button:hover,.icon-button:hover{background:var(--sj-surface-3)}.primary-button{height:var(--sj-control-primary);border-color:var(--sj-lime);color:var(--sj-canvas);background:var(--sj-lime)}.primary-button:disabled{cursor:not-allowed;border-color:var(--sj-border);color:var(--sj-text-disabled);background:var(--sj-surface-2)}.status-strip{display:grid;min-height:64px;border-bottom:1px solid var(--sj-border);background:var(--sj-canvas);grid-template-columns:repeat(5,minmax(130px,180px))}.status-strip>div{display:flex;padding:0 var(--sj-space-4);border-right:1px solid var(--sj-border);align-items:center;gap:var(--sj-space-2)}.status-strip i{width:8px;height:8px;border-radius:50%}.status-strip strong{font-size:20px}.status-strip span{color:var(--sj-text-3);font-size:12px}.ready i{background:var(--sj-lime)}.released i{background:var(--sj-blue)}.preparing i{background:var(--sj-amber)}.blocked i{background:var(--sj-red)}.workspace{min-height:0;overflow:hidden;flex:1}.table-scroll{width:100%;height:100%;overflow:auto}.release-table{width:100%;min-width:1780px;border-collapse:separate;border-spacing:0;table-layout:fixed}.release-table th{position:sticky;z-index:2;top:0;height:48px;padding:0 var(--sj-space-3);border-right:1px solid var(--sj-border);border-bottom:1px solid var(--sj-border-strong);color:var(--sj-text-3);background:var(--sj-surface-2);text-align:left;font-size:12px}.release-table th:nth-child(1){width:112px}.release-table th:nth-child(2){width:94px}.release-table th:nth-child(3){width:136px}.release-table th:nth-child(4){width:142px}.release-table th:nth-child(n+5):nth-child(-n+9){width:116px}.release-table th:nth-child(n+10):nth-child(-n+13){width:78px;text-align:center}.release-table th:nth-child(14){width:110px}.release-table th:nth-child(15){width:100px}.release-table td{height:64px;padding:var(--sj-space-2) var(--sj-space-3);border-right:1px solid var(--sj-grid);border-bottom:1px solid var(--sj-border);color:var(--sj-text-2);background:var(--sj-canvas);font-size:13px;vertical-align:middle}.release-table tbody tr:nth-child(even) td{background:var(--sj-surface-1)}.release-table tbody tr:hover td{background:var(--sj-surface-2)}.release-table tbody tr{cursor:pointer}.release-table tbody tr.selected td{background:var(--sj-blue-soft)}.release-table tbody tr.selected td:first-child{border-left:2px solid var(--sj-blue)}.release-table td small{display:block;color:var(--sj-text-3)}.release-table td:nth-child(n+10):nth-child(-n+13){text-align:center}.flight-no,.route{color:var(--sj-text-1)!important;font-weight:700}.route{color:var(--sj-blue)!important}.muted{color:var(--sj-text-3)!important}.check-dot{display:inline-block;width:12px;height:12px;border:3px solid var(--sj-surface-2);border-radius:50%;outline:2px solid currentColor;background:currentColor}.check-dot.ready{color:var(--sj-lime)}.check-dot.pending{color:var(--sj-amber)}.check-dot.blocked{color:var(--sj-red)}.status-chip{display:inline-flex;height:22px;padding:0 var(--sj-space-2);border-radius:var(--sj-radius-tag);align-items:center;font-size:12px;font-weight:700;white-space:nowrap}.status-chip.已放行{color:var(--sj-blue);background:var(--sj-blue-soft)}.status-chip.待放行{color:var(--sj-lime);background:var(--sj-lime-soft)}.status-chip.准备中{color:var(--sj-amber);background:var(--sj-amber-soft)}.status-chip.受阻{color:var(--sj-red);background:var(--sj-red-soft)}.empty{height:180px!important;color:var(--sj-text-3)!important;text-align:center}.drawer-backdrop{position:fixed;z-index:1000;inset:0;background:color-mix(in srgb,var(--sj-canvas) 70%,transparent)}.release-drawer{position:absolute;display:flex;top:0;right:0;width:min(420px,100vw);height:100%;border-left:1px solid var(--sj-border-strong);background:var(--sj-surface-1);box-shadow:var(--sj-shadow-panel);flex-direction:column}.drawer-header{display:flex;min-height:72px;padding:var(--sj-space-4) var(--sj-space-5);border-bottom:1px solid var(--sj-border);align-items:center;justify-content:space-between}.drawer-header>div{display:grid}.drawer-header small{color:var(--sj-blue);font-size:11px}.drawer-header strong{font-size:20px}.flight-identity{display:flex;padding:var(--sj-space-5);border-bottom:1px solid var(--sj-border);background:var(--sj-surface-2);align-items:flex-start;justify-content:space-between;gap:var(--sj-space-4)}.flight-identity>div{display:grid;gap:var(--sj-space-1)}.flight-identity>div>span,.flight-identity small{color:var(--sj-text-3)}.flight-identity>div>strong{font-size:24px}.drawer-body{min-height:0;padding:var(--sj-space-5);overflow:auto;flex:1}.check-section h3{margin:0 0 var(--sj-space-2);font-size:14px}.check-row{display:flex;min-height:68px;border-top:1px solid var(--sj-border);align-items:center;justify-content:space-between;gap:var(--sj-space-3)}.check-row>div:first-child{display:grid}.check-row small{color:var(--sj-text-3);font-size:11px}.state-picker{display:flex;height:34px;border:1px solid var(--sj-border-strong);border-radius:var(--sj-radius-control);overflow:hidden}.state-picker button{width:38px;border:0;border-right:1px solid var(--sj-border);background:transparent}.state-picker button:last-child{border-right:0}.state-picker button.active{background:var(--sj-surface-4)}.state-picker i{display:inline-block;width:10px;height:10px;border-radius:50%}.state-picker i.ready{background:var(--sj-lime)}.state-picker i.pending{background:var(--sj-amber)}.state-picker i.blocked{background:var(--sj-red)}.blocker,.release-record{display:flex;margin-top:var(--sj-space-4);padding:var(--sj-space-3);border:1px solid var(--sj-red);border-radius:var(--sj-radius-control);color:var(--sj-red);background:var(--sj-red-soft);gap:var(--sj-space-3)}.blocker div,.release-record div{display:grid}.blocker span,.release-record span{color:var(--sj-text-2);font-size:12px}.note-field{display:grid;margin-top:var(--sj-space-5);color:var(--sj-text-3);font-size:11px;gap:var(--sj-space-1)}.note-field textarea{height:auto;padding:var(--sj-space-3);resize:vertical}.release-record{border-color:var(--sj-lime);color:var(--sj-lime);background:var(--sj-lime-soft)}.drawer-footer{padding:var(--sj-space-4) var(--sj-space-5);border-top:1px solid var(--sj-border)}.drawer-footer .primary-button{width:100%}@media(max-width:1280px){.command-bar{align-items:stretch;flex-direction:column}.secondary-button{align-self:flex-end}.status-strip{grid-template-columns:repeat(5,minmax(110px,1fr))}}@media(max-width:1024px){.release-page{min-height:560px}.status-strip{overflow-x:auto;grid-template-columns:repeat(5,130px)}}
</style>

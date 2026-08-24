<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { createIconifyIcon } from '@vben/icons';

defineOptions({ name: 'TripDetail' });

const ArrowLeftIcon = createIconifyIcon('lucide:arrow-left');
const CheckIcon = createIconifyIcon('lucide:circle-check');
const ClockIcon = createIconifyIcon('lucide:clock-3');
const DownloadIcon = createIconifyIcon('lucide:download');
const ExternalIcon = createIconifyIcon('lucide:arrow-up-right');
const FileIcon = createIconifyIcon('lucide:file-text');
const FerryIcon = createIconifyIcon('lucide:plane-landing');
const PaxIcon = createIconifyIcon('lucide:users');
const RouteIcon = createIconifyIcon('lucide:route');

type ExportState = 'pending' | 'ready';
type LegState = 'blocked' | 'pending' | 'ready';
type LegType = 'ferry' | 'task';

interface TripLeg {
  aircraft: string;
  arrival: string;
  date: string;
  dateIso: string;
  departure: string;
  destination: string;
  destinationName: string;
  duration: string;
  flightId: string;
  flightNo: string;
  origin: string;
  originName: string;
  passengers: number;
  sequence: number;
  state: LegState;
  stateLabel: string;
  type: LegType;
}

interface ExportFile {
  format: string;
  id: string;
  name: string;
  scope: string;
  state: ExportState;
  stateLabel: string;
  updatedAt: string;
}

const route = useRoute();
const router = useRouter();
const selectedFileIds = ref<string[]>([]);
const selectedLegIds = ref<string[]>([]);
const exportMessage = ref('');

const queryText = (key: string, fallback: string) => {
  const value = route.query[key];
  return typeof value === 'string' && value ? value : fallback;
};

const tripId = computed(() => String(route.params.tripId || 'SJ260820'));
const trip = computed(() => ({
  applicant: queryText('applicant', '张园'),
  customer: queryText('customer', '星海资本'),
  endDate: queryText('endDate', '2026/08/22'),
  model: queryText('model', 'G650ER'),
  routeSummary: queryText(
    'routeSummary',
    'ZBAA → RJTT → WSSS → ZBAA',
  ),
  sales: queryText('sales', '张园'),
  startDate: queryText('startDate', '2026/08/20'),
  state: queryText('state', 'pending'),
  stateLabel: queryText('stateLabel', '待确认'),
  tailNumber: queryText('tailNumber', 'B-9811'),
  updatedAt: queryText('updatedAt', '2026/08/22 10:32'),
}));

const defaultLegs: TripLeg[] = [
  { aircraft: 'B-9811 · G650ER', arrival: '1020Z', date: '20 AUG', dateIso: '2026-08-20', departure: '0600Z', destination: 'RJTT', destinationName: '东京羽田', duration: '4H20M', flightId: 'FP-208', flightNo: 'SJ6801', origin: 'ZBAA', originName: '北京首都', passengers: 8, sequence: 1, state: 'ready', stateLabel: '已确认', type: 'task' },
  { aircraft: 'B-9811 · G650ER', arrival: '2035Z', date: '20 AUG', dateIso: '2026-08-20', departure: '1420Z', destination: 'WSSS', destinationName: '新加坡樟宜', duration: '6H15M', flightId: 'FP-209', flightNo: 'SJ6802', origin: 'RJTT', originName: '东京羽田', passengers: 0, sequence: 2, state: 'pending', stateLabel: '协调中', type: 'ferry' },
  { aircraft: 'B-9811 · G650ER', arrival: '1510Z', date: '22 AUG', dateIso: '2026-08-22', departure: '0900Z', destination: 'ZBAA', destinationName: '北京首都', duration: '6H10M', flightId: 'FP-211', flightNo: 'SJ6803', origin: 'WSSS', originName: '新加坡樟宜', passengers: 8, sequence: 3, state: 'blocked', stateLabel: '资料待补', type: 'task' },
];

const fallbackLegs = computed<TripLeg[]>(() => [
  { aircraft: `${trip.value.tailNumber} · ${trip.value.model}`, arrival: '1040Z', date: trip.value.startDate.slice(5).replace('/', ' AUG '), dateIso: trip.value.startDate.replaceAll('/', '-'), departure: '0820Z', destination: 'ZGSZ', destinationName: '深圳宝安', duration: '2H20M', flightId: `${tripId.value}-01`, flightNo: `${tripId.value}-01`, origin: 'ZGGG', originName: '广州白云', passengers: 6, sequence: 1, state: trip.value.state as LegState, stateLabel: trip.value.stateLabel, type: trip.value.customer === '内部调机' ? 'ferry' : 'task' },
]);

const legs = computed(() => tripId.value === 'SJ260820' ? defaultLegs : fallbackLegs.value);
const taskLegCount = computed(() => legs.value.filter((leg) => leg.type === 'task').length);
const ferryLegCount = computed(() => legs.value.filter((leg) => leg.type === 'ferry').length);

const exportFiles = computed<ExportFile[]>(() => [
  { format: 'PDF', id: 'crew-itinerary', name: '机组行程清单', scope: `${legs.value.length} 个航段 · 机组`, state: 'ready', stateLabel: '可导出', updatedAt: '10:18' },
  { format: 'PDF', id: 'passenger-itinerary', name: '乘客行程清单', scope: `${taskLegCount.value} 个任务航段 · 旅客`, state: 'ready', stateLabel: '可导出', updatedAt: '10:22' },
  { format: 'PDF', id: 'customs', name: '三关文件', scope: `${taskLegCount.value} 个任务航段 · 海关/边检/检疫`, state: 'pending', stateLabel: '待补资料', updatedAt: '09:56' },
  { format: 'PDF', id: 'flight-assignment', name: '飞行任务书', scope: `${legs.value.length} 个航段 · 机组与运控`, state: 'ready', stateLabel: '可导出', updatedAt: '10:28' },
  { format: 'ZIP', id: 'release-package', name: '航班放行文件包', scope: `${legs.value.length} 个航段 · 放行与签派`, state: 'pending', stateLabel: '生成中', updatedAt: '10:30' },
  { format: 'XLSX', id: 'service-checklist', name: '保障确认清单', scope: `${legs.value.length} 个航段 · 保障单位`, state: 'ready', stateLabel: '可导出', updatedAt: '10:12' },
]);

const allFilesSelected = computed({
  get: () => selectedFileIds.value.length === exportFiles.value.length,
  set: (checked: boolean) => {
    selectedFileIds.value = checked ? exportFiles.value.map((file) => file.id) : [];
  },
});

const allLegsSelected = computed({
  get: () => selectedLegIds.value.length === legs.value.length,
  set: (checked: boolean) => {
    selectedLegIds.value = checked ? legs.value.map((leg) => leg.flightId) : [];
  },
});

const hasPartialFileSelection = computed(() => selectedFileIds.value.length > 0 && !allFilesSelected.value);
const hasPartialLegSelection = computed(() => selectedLegIds.value.length > 0 && !allLegsSelected.value);
const canExport = computed(() => selectedLegIds.value.length > 0 && selectedFileIds.value.length > 0);

function goBack() {
  const name = route.path.startsWith('/demo/')
    ? 'TripManagementDemo'
    : route.path.startsWith('/preview/')
      ? 'TripManagementPreview'
      : 'TripManagement';
  void router.push({ name });
}

function flightRoute(leg: TripLeg) {
  const name = route.path.startsWith('/demo/')
    ? 'FlightDetailDemo'
    : route.path.startsWith('/preview/')
      ? 'FlightDetailPreview'
      : 'FlightDetail';
  return {
    name,
    params: { flightId: leg.flightId },
    query: {
      aircraft: leg.aircraft.split(' · ')[0],
      date: leg.dateIso,
      flightNo: leg.flightNo,
      from: leg.origin,
      fromName: leg.originName,
      source: 'trip',
      sta: leg.arrival.replace('Z', ''),
      std: leg.departure.replace('Z', ''),
      to: leg.destination,
      toName: leg.destinationName,
      todos: JSON.stringify([
        { content: '航班时刻与机场信息复核', status: 'completed' },
        { content: leg.state === 'blocked' ? '补齐航班运行资料' : '确认保障服务进度', status: leg.state === 'blocked' ? 'blocked' : 'pending' },
      ]),
      tripId: tripId.value,
      type: leg.type === 'task' ? 'PAX' : 'FERRY',
    },
  };
}

function downloadSelected() {
  const files = exportFiles.value.filter((file) => selectedFileIds.value.includes(file.id));
  const selectedLegs = legs.value.filter((leg) => selectedLegIds.value.includes(leg.flightId));
  if (!selectedLegs.length || !files.length) {
    exportMessage.value = !selectedLegs.length ? '请先选择需要导出的航段' : '请先选择需要导出的文件类型';
    return;
  }
  const content = [
    `Starjet SOC 行程文件导出包（Demo）`,
    `行程编号：${tripId.value}`,
    `客户：${trip.value.customer}`,
    `生成时间：${new Date().toLocaleString('zh-CN')}`,
    '',
    '所选航段：',
    ...selectedLegs.map((leg, index) => `${index + 1}. ${leg.origin} → ${leg.destination} / ${leg.dateIso} / ${leg.departure}-${leg.arrival}`),
    '',
    '所选文件：',
    ...files.map((file, index) => `${index + 1}. ${file.name} / ${file.format} / ${file.scope} / ${file.stateLabel}`),
  ].join('\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${tripId.value}-批量文件包-Demo.txt`;
  link.click();
  URL.revokeObjectURL(url);
  exportMessage.value = `已生成 ${selectedLegs.length} 个航段 × ${files.length} 种文件的 Demo 导出包`;
}
</script>

<template>
  <main class="trip-detail-page sj-mission-control">
    <div class="detail-layout">
      <div class="trip-main-column">
        <header class="page-header">
          <div class="header-main">
            <button class="back-button" type="button" @click="goBack"><ArrowLeftIcon />返回行程列表</button>
            <div class="eyebrow"><RouteIcon />TRIP CONTROL · SALES & OPERATIONS</div>
            <div class="title-line">
              <h1>{{ tripId }}</h1>
              <span :class="['trip-state', trip.state]"><i></i>{{ trip.stateLabel }}</span>
            </div>
            <p>{{ trip.customer }} · {{ trip.routeSummary }}</p>
          </div>
          <div class="header-actions">
            <span>{{ selectedLegIds.length }} 个航段 · {{ selectedFileIds.length }} 种文件</span>
            <button class="primary-action" :disabled="!canExport" type="button" @click="downloadSelected()"><DownloadIcon />批量导出文件</button>
          </div>
        </header>

        <section class="mission-strip" aria-label="行程概况">
          <div><strong>{{ legs.length }}</strong><span>全部航段</span></div>
          <div><strong>{{ taskLegCount }}</strong><span>任务航段</span></div>
          <div><strong>{{ ferryLegCount }}</strong><span>调机航段</span></div>
          <div><strong>{{ exportFiles.filter((file) => file.state === 'ready').length }}/{{ exportFiles.length }}</strong><span>文件已就绪</span></div>
          <div><strong>{{ trip.tailNumber }}</strong><span>{{ trip.model }}</span></div>
        </section>

        <section class="info-panel panel">
          <div class="section-heading"><div><span>TRIP INFORMATION</span><h2>行程信息</h2></div><small>最后更新 {{ trip.updatedAt }}</small></div>
          <dl class="info-grid">
            <div><dt>行程编号</dt><dd class="sj-data">{{ tripId }}</dd></div>
            <div><dt>客户</dt><dd>{{ trip.customer }}</dd></div>
            <div><dt>行程日期</dt><dd class="sj-data">{{ trip.startDate }} — {{ trip.endDate }}</dd></div>
            <div><dt>执行飞机</dt><dd class="sj-data">{{ trip.tailNumber }} · {{ trip.model }}</dd></div>
            <div><dt>申请人</dt><dd>{{ trip.applicant }}</dd></div>
            <div><dt>销售负责人</dt><dd>{{ trip.sales }}</dd></div>
          </dl>
        </section>

      </div>

      <section class="export-matrix-panel panel">
        <div class="matrix-heading">
          <div class="section-heading-copy"><span>LEG & DOCUMENT MATRIX</span><h2>航段与文件批量导出</h2></div>
          <div class="matrix-actions">
            <label class="select-all-files"><input v-model="allFilesSelected" :indeterminate="hasPartialFileSelection" type="checkbox" /><span>全选文件类型</span><b>{{ selectedFileIds.length }}/{{ exportFiles.length }}</b></label>
            <p aria-live="polite">{{ exportMessage || '先勾选航段，再选择需要生成的文件类型' }}</p>
            <button class="primary-action" :disabled="!canExport" type="button" @click="downloadSelected()"><DownloadIcon />导出 {{ selectedLegIds.length }} × {{ selectedFileIds.length }}</button>
          </div>
        </div>
        <div class="matrix-scroll">
          <table class="export-matrix">
            <thead>
              <tr>
                <th class="leg-column">
                  <label class="column-selector leg-selector">
                    <input v-model="allLegsSelected" :indeterminate="hasPartialLegSelection" type="checkbox" />
                    <span>全选航段</span>
                    <b>{{ selectedLegIds.length }}/{{ legs.length }}</b>
                  </label>
                </th>
                <th v-for="file in exportFiles" :key="file.id">
                  <label class="column-selector file-selector">
                    <input v-model="selectedFileIds" :aria-label="`选择${file.name}`" :value="file.id" type="checkbox" />
                    <FileIcon />
                    <span>{{ file.name }}</span>
                    <small>{{ file.format }}</small>
                  </label>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="leg in legs" :key="leg.flightId" :class="{ selected: selectedLegIds.includes(leg.flightId) }">
                <td class="leg-cell">
                  <input v-model="selectedLegIds" :aria-label="`选择${leg.origin}至${leg.destination}航段`" :value="leg.flightId" type="checkbox" />
                  <div class="leg-summary">
                    <div class="leg-summary-top">
                      <span :class="['leg-type', leg.type]"><component :is="leg.type === 'task' ? PaxIcon : FerryIcon" />{{ leg.type === 'task' ? '任务航段' : '调机航段' }}</span>
                      <span :class="['leg-state', leg.state]"><i></i>{{ leg.stateLabel }}</span>
                    </div>
                    <strong>{{ leg.origin }} <i>→</i> {{ leg.destination }}</strong>
                    <span>{{ leg.originName }} · {{ leg.destinationName }}</span>
                    <small class="sj-data">{{ leg.date }} · {{ leg.departure }}–{{ leg.arrival }} · {{ leg.aircraft }}</small>
                  </div>
                  <RouterLink class="flight-detail-link" :to="flightRoute(leg)" @click.stop>详情<ExternalIcon /></RouterLink>
                </td>
                <td v-for="file in exportFiles" :key="file.id" :class="{ 'file-selected': selectedFileIds.includes(file.id) }">
                  <span :class="['file-state', file.state]"><component :is="file.state === 'ready' ? CheckIcon : ClockIcon" />{{ file.stateLabel }}</span>
                  <small>{{ file.updatedAt }}</small>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.trip-detail-page { min-height: 100%; padding: var(--sj-space-5); color: var(--sj-text-1); background: var(--sj-canvas); }
.detail-layout { display: block; }.trip-main-column { min-width: 0; }
button, input { font: inherit; }
.page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--sj-space-6); padding: var(--sj-space-5); border: 1px solid var(--sj-border); background: var(--sj-surface-1); }
.header-main { min-width: 0; }.back-button { display: inline-flex; min-height: var(--sj-control-dense); align-items: center; gap: var(--sj-space-2); margin-bottom: var(--sj-space-4); padding: 0; border: 0; color: var(--sj-text-2); background: transparent; cursor: pointer; }.back-button:hover { color: var(--sj-blue); }.back-button svg { width: 15px; }
.eyebrow { display: flex; align-items: center; gap: var(--sj-space-2); color: var(--sj-blue); font: 700 10px/1 var(--sj-font-data); letter-spacing: .14em; }.eyebrow svg { width: 14px; }.title-line { display: flex; align-items: center; gap: var(--sj-space-3); margin-top: var(--sj-space-2); }.title-line h1 { margin: 0; font: 700 28px/1.1 var(--sj-font-data); letter-spacing: -.02em; }.header-main p { max-width: 900px; margin: var(--sj-space-2) 0 0; overflow: hidden; color: var(--sj-text-2); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.trip-state, .leg-state, .file-state { display: inline-flex; align-items: center; gap: var(--sj-space-1); font-size: 10px; font-weight: 700; }.trip-state { padding: var(--sj-space-1) var(--sj-space-2); border-radius: var(--sj-radius-tag); }.trip-state i, .leg-state i { width: 6px; height: 6px; border-radius: 50%; }.ready { color: var(--sj-lime); }.pending { color: var(--sj-amber); }.blocked { color: var(--sj-red); }.trip-state.ready { background: var(--sj-lime-soft); }.trip-state.pending { background: var(--sj-amber-soft); }.trip-state.blocked { background: var(--sj-red-soft); }.ready i { background: var(--sj-lime); }.pending i { background: var(--sj-amber); }.blocked i { background: var(--sj-red); }
.header-actions { display: flex; flex: 0 0 auto; align-items: center; gap: var(--sj-space-3); }.header-actions > span { color: var(--sj-text-3); font: 10px/1 var(--sj-font-data); }.primary-action { display: inline-flex; min-height: var(--sj-control-default); align-items: center; justify-content: center; gap: var(--sj-space-2); padding: 0 var(--sj-space-5); border: 1px solid var(--sj-lime); border-radius: var(--sj-radius-control); color: var(--sj-canvas); background: var(--sj-lime); font-weight: 800; cursor: pointer; }.primary-action:hover { filter: brightness(1.06); }.primary-action:disabled { border-color: var(--sj-border-strong); color: var(--sj-text-disabled); background: var(--sj-surface-3); cursor: not-allowed; filter: none; }.primary-action svg { width: 15px; }
.mission-strip { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); border: 1px solid var(--sj-border); border-top: 0; background: var(--sj-surface-2); }.mission-strip > div { display: flex; min-height: 68px; align-items: center; gap: var(--sj-space-3); padding: 0 var(--sj-space-4); border-right: 1px solid var(--sj-border); }.mission-strip > div:last-child { border-right: 0; }.mission-strip strong { color: var(--sj-text-1); font: 700 18px/1 var(--sj-font-data); }.mission-strip span { color: var(--sj-text-3); font-size: 10px; }
.panel { border: 1px solid var(--sj-border); background: var(--sj-surface-1); }.info-panel { margin-top: var(--sj-space-4); }.section-heading { display: flex; min-height: 62px; align-items: center; justify-content: space-between; gap: var(--sj-space-4); padding: 0 var(--sj-space-4); border-bottom: 1px solid var(--sj-border); }.section-heading span { color: var(--sj-blue); font: 700 9px/1 var(--sj-font-data); letter-spacing: .13em; }.section-heading h2 { margin: var(--sj-space-1) 0 0; font-size: 15px; }.section-heading small { color: var(--sj-text-3); font: 10px/1 var(--sj-font-data); }
.info-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); margin: 0; }.info-grid > div { min-width: 0; padding: var(--sj-space-4); border-right: 1px solid var(--sj-border); }.info-grid > div:last-child { border-right: 0; }.info-grid dt { margin-bottom: var(--sj-space-2); color: var(--sj-text-3); font-size: 10px; }.info-grid dd { margin: 0; overflow: hidden; color: var(--sj-text-1); font-size: 12px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.leg-list { margin: 0; padding: 0; overflow-x: auto; list-style: none; }.leg-row { display: grid; min-width: 860px; min-height: 132px; grid-template-columns: 44px 92px minmax(300px, 1fr) 150px 120px; align-items: center; border-bottom: 1px solid var(--sj-border); }.leg-row:last-child { border-bottom: 0; }.sequence { display: flex; height: 100%; align-items: center; flex-direction: column; justify-content: center; border-right: 1px solid var(--sj-border); color: var(--sj-text-3); font: 10px/1 var(--sj-font-data); }.sequence i { width: 1px; height: 35px; margin-top: var(--sj-space-2); background: var(--sj-border-strong); }.leg-row:last-child .sequence i { display: none; }.leg-type { display: flex; align-items: center; flex-direction: column; gap: var(--sj-space-2); color: var(--sj-blue); font-size: 10px; font-weight: 700; }.leg-type svg { width: 20px; height: 20px; }.leg-type.ferry { color: var(--sj-teal); }
.leg-route { display: grid; grid-template-columns: minmax(88px, 1fr) minmax(90px, 1fr) minmax(88px, 1fr); align-items: center; gap: var(--sj-space-3); padding: var(--sj-space-3); }.airport { display: flex; min-width: 0; flex-direction: column; }.airport strong { font: 700 22px/1 var(--sj-font-data); }.airport span { margin-top: var(--sj-space-1); overflow: hidden; color: var(--sj-text-3); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }.airport b { margin-top: var(--sj-space-2); color: var(--sj-text-2); font: 700 12px/1 var(--sj-font-data); }.airport.destination { text-align: right; }.route-line { display: flex; align-items: center; flex-direction: column; gap: var(--sj-space-2); color: var(--sj-text-3); font: 9px/1 var(--sj-font-data); }.route-line i { position: relative; width: 100%; height: 1px; background: var(--sj-border-strong); }.route-line i::after { position: absolute; top: -3px; right: 0; width: 7px; height: 7px; border-radius: 50%; background: var(--sj-blue); content: ''; }
.leg-meta { display: flex; min-width: 0; flex-direction: column; gap: var(--sj-space-2); padding: var(--sj-space-3); border-left: 1px solid var(--sj-border); color: var(--sj-text-2); font-size: 10px; }.leg-operation { display: flex; align-items: flex-end; flex-direction: column; gap: var(--sj-space-4); padding-right: var(--sj-space-4); }.flight-detail-link { display: inline-flex; align-items: center; gap: var(--sj-space-1); color: var(--sj-blue); font-size: 10px; font-weight: 700; text-decoration: none; }.flight-detail-link svg { width: 13px; }
.select-all { display: flex; min-height: 42px; align-items: center; gap: var(--sj-space-3); padding: 0 var(--sj-space-4); border-bottom: 1px solid var(--sj-border); color: var(--sj-text-2); font-size: 11px; cursor: pointer; }.select-all b { margin-left: auto; color: var(--sj-text-3); font: 10px/1 var(--sj-font-data); }.select-all input, .file-list input { accent-color: var(--sj-blue); }.file-list { margin: 0; padding: 0; list-style: none; }.file-list li { display: grid; min-height: 72px; grid-template-columns: 16px 22px minmax(0, 1fr) auto 30px; align-items: center; gap: var(--sj-space-3); padding: 0 var(--sj-space-4); border-bottom: 1px solid var(--sj-border); }.file-icon { width: 18px; color: var(--sj-text-3); }.file-list li > div { display: flex; min-width: 0; flex-direction: column; gap: var(--sj-space-1); }.file-list strong { overflow: hidden; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }.file-list li > div > span { overflow: hidden; color: var(--sj-text-3); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }.file-info { align-items: flex-end; }.file-state { flex-direction: row !important; }.file-state svg { width: 12px; }.file-state.ready { color: var(--sj-lime); }.file-state.pending { color: var(--sj-amber); }.file-info small { color: var(--sj-text-3); font: 9px/1 var(--sj-font-data); }.file-list li > button { display: grid; width: 28px; height: 28px; place-items: center; border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); color: var(--sj-text-2); background: var(--sj-surface-2); cursor: pointer; }.file-list li > button:hover { color: var(--sj-blue); border-color: var(--sj-blue); }.file-list li > button svg { width: 13px; }
.export-footer { display: flex; align-items: center; justify-content: space-between; gap: var(--sj-space-3); padding: var(--sj-space-4); background: var(--sj-surface-2); }.export-footer p { display: flex; min-width: 0; align-items: center; gap: var(--sj-space-2); margin: 0; color: var(--sj-text-3); font-size: 9px; }.export-footer p svg { width: 13px; color: var(--sj-amber); }.export-footer .primary-action { min-height: var(--sj-control-dense); padding-inline: var(--sj-space-3); font-size: 10px; }
.export-matrix-panel { margin-top: var(--sj-space-4); overflow: hidden; }
.matrix-heading { display: flex; min-height: 72px; align-items: center; justify-content: space-between; gap: var(--sj-space-5); padding: var(--sj-space-3) var(--sj-space-4); border-bottom: 1px solid var(--sj-border); background: var(--sj-surface-2); }
.section-heading-copy span { color: var(--sj-blue); font: 700 9px/1 var(--sj-font-data); letter-spacing: .13em; }.section-heading-copy h2 { margin: var(--sj-space-1) 0 0; font-size: 15px; }
.matrix-actions { display: flex; align-items: center; justify-content: flex-end; gap: var(--sj-space-4); }.matrix-actions p { max-width: 320px; margin: 0; overflow: hidden; color: var(--sj-text-3); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.select-all-files { display: inline-flex; min-height: var(--sj-control-dense); align-items: center; gap: var(--sj-space-2); padding: 0 var(--sj-space-3); border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); color: var(--sj-text-2); background: var(--sj-surface-1); font-size: 10px; cursor: pointer; }.select-all-files b { color: var(--sj-text-3); font: 9px/1 var(--sj-font-data); }
.matrix-scroll { width: 100%; overflow-x: auto; }
.export-matrix { width: 100%; min-width: 1260px; border-collapse: separate; border-spacing: 0; table-layout: fixed; }.export-matrix th, .export-matrix td { border-right: 1px solid var(--sj-border); border-bottom: 1px solid var(--sj-border); }.export-matrix th:last-child, .export-matrix td:last-child { border-right: 0; }.export-matrix tbody tr:last-child td { border-bottom: 0; }
.export-matrix th { height: 66px; padding: 0; color: var(--sj-text-2); background: var(--sj-surface-2); text-align: left; vertical-align: middle; }.export-matrix th.leg-column { width: 430px; }.export-matrix th:not(.leg-column) { width: 138px; }
.column-selector { display: flex; height: 66px; box-sizing: border-box; align-items: center; gap: var(--sj-space-2); padding: 0 var(--sj-space-3); cursor: pointer; }.column-selector input, .leg-cell > input, .select-all-files input { flex: 0 0 auto; accent-color: var(--sj-blue); }.column-selector svg { width: 14px; color: var(--sj-text-3); }.column-selector span { min-width: 0; overflow: hidden; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }.column-selector b, .column-selector small { margin-left: auto; color: var(--sj-text-3); font: 9px/1 var(--sj-font-data); }
.export-matrix tbody tr { background: var(--sj-surface-1); transition: background var(--sj-duration-fast); }.export-matrix tbody tr:hover { background: var(--sj-surface-2); }.export-matrix tbody tr.selected { background: var(--sj-blue-soft); }
.leg-cell { display: grid; min-height: 112px; box-sizing: border-box; grid-template-columns: 18px minmax(0, 1fr) auto; align-items: center; gap: var(--sj-space-3); padding: var(--sj-space-3) var(--sj-space-4); }
.leg-summary { display: flex; min-width: 0; flex-direction: column; gap: var(--sj-space-1); }.leg-summary-top { display: flex; align-items: center; justify-content: space-between; gap: var(--sj-space-3); }.leg-summary .leg-type { display: inline-flex; align-items: center; flex-direction: row; gap: var(--sj-space-1); color: var(--sj-blue); font-size: 9px; font-weight: 700; }.leg-summary .leg-type.ferry { color: var(--sj-teal); }.leg-summary .leg-type svg { width: 13px; height: 13px; }.leg-summary strong { color: var(--sj-text-1); font: 700 18px/1.15 var(--sj-font-data); }.leg-summary strong i { color: var(--sj-text-3); font-style: normal; }.leg-summary > span { color: var(--sj-text-2); font-size: 10px; }.leg-summary small { color: var(--sj-text-3); font-size: 9px; }
.export-matrix tbody td:not(.leg-cell) { padding: var(--sj-space-3); text-align: center; vertical-align: middle; }.export-matrix tbody td:not(.leg-cell) > small { display: block; margin-top: var(--sj-space-2); color: var(--sj-text-3); font: 9px/1 var(--sj-font-data); }.export-matrix td.file-selected { background: var(--sj-blue-soft); }.file-state { justify-content: center; }.file-state svg { width: 12px; }.file-state.ready { color: var(--sj-lime); }.file-state.pending { color: var(--sj-amber); }
.sj-data { font-family: var(--sj-font-data); }
button:focus-visible, input:focus-visible { outline: 0; box-shadow: var(--sj-focus-ring); }

@media (max-width: 1279px) { .trip-detail-page { padding: var(--sj-space-4); } }
@media (max-width: 1023px) { .page-header { align-items: flex-start; flex-direction: column; }.header-actions { width: 100%; justify-content: flex-end; }.mission-strip { grid-template-columns: repeat(3, 1fr); }.mission-strip > div:nth-child(3) { border-right: 0; }.mission-strip > div:nth-child(n+4) { border-top: 1px solid var(--sj-border); }.info-grid { grid-template-columns: repeat(3, 1fr); }.info-grid > div:nth-child(3) { border-right: 0; }.info-grid > div:nth-child(n+4) { border-top: 1px solid var(--sj-border); }.matrix-heading { align-items: flex-start; flex-direction: column; }.matrix-actions { width: 100%; justify-content: space-between; } }
@media (max-width: 639px) { .trip-detail-page { padding: var(--sj-space-3); }.title-line h1 { font-size: 23px; }.header-actions { align-items: stretch; flex-direction: column; }.header-actions > span { text-align: right; }.mission-strip { grid-template-columns: repeat(2, 1fr); }.mission-strip > div:nth-child(2n) { border-right: 0; }.mission-strip > div:nth-child(3) { border-right: 1px solid var(--sj-border); }.mission-strip > div:nth-child(n+3) { border-top: 1px solid var(--sj-border); }.info-grid { grid-template-columns: 1fr 1fr; }.info-grid > div:nth-child(3) { border-right: 1px solid var(--sj-border); }.info-grid > div:nth-child(2n) { border-right: 0; }.info-grid > div:nth-child(n+3) { border-top: 1px solid var(--sj-border); }.section-heading { align-items: flex-start; flex-direction: column; justify-content: center; }.matrix-heading, .matrix-actions { align-items: stretch; flex-direction: column; }.matrix-actions { gap: var(--sj-space-2); }.matrix-actions p { max-width: none; white-space: normal; }.matrix-actions .primary-action { width: 100%; } }
</style>

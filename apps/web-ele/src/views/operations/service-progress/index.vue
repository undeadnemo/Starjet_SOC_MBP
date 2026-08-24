<script lang="ts" setup>
import { computed, ref } from 'vue';

import { createIconifyIcon } from '@vben/icons';
import { ElMessage } from 'element-plus';

defineOptions({ name: 'ServiceProgress' });

const ChevronLeftIcon = createIconifyIcon('lucide:chevron-left');
const ChevronRightIcon = createIconifyIcon('lucide:chevron-right');
const CloseIcon = createIconifyIcon('lucide:x');
const PlusIcon = createIconifyIcon('lucide:plus');
const RotateIcon = createIconifyIcon('lucide:rotate-ccw');
const SaveIcon = createIconifyIcon('lucide:save');
const SettingsIcon = createIconifyIcon('lucide:settings-2');

type FlightDirection = '出港' | '进港';
type NodeStatus = 'completed' | 'normal' | 'pending' | 'processing';

interface ServiceNode {
  enabled: boolean;
  id: string;
  name: string;
  offset: string;
  owner: string;
}

interface ServiceFlight {
  agent: string;
  aircraft: string;
  airport: string;
  customer: string;
  date: string;
  direction: FlightDirection;
  flightNo: string;
  id: string;
  nodeStates: Record<string, NodeStatus>;
  registration: string;
  serviceOwner: string;
  time: string;
}

const defaultNodes: ServiceNode[] = [
  { enabled: true, id: 'briefing', name: '任务交接', offset: 'T-180', owner: '运控' },
  { enabled: true, id: 'permit', name: '许可确认', offset: 'T-150', owner: '签派' },
  { enabled: true, id: 'handling', name: '地服确认', offset: 'T-120', owner: '保障' },
  { enabled: true, id: 'fuel', name: '燃油确认', offset: 'T-90', owner: '航油' },
  { enabled: true, id: 'catering', name: '配餐确认', offset: 'T-75', owner: '客服' },
  { enabled: true, id: 'crew', name: '机组到位', offset: 'T-60', owner: '机组' },
  { enabled: true, id: 'passenger', name: '旅客确认', offset: 'T-45', owner: '客服' },
  { enabled: true, id: 'release', name: '放行完成', offset: 'T-30', owner: '签派' },
  { enabled: true, id: 'close', name: '舱门关闭', offset: 'T-10', owner: '机组' },
];

const serviceNodes = ref<ServiceNode[]>(defaultNodes.map((node) => ({ ...node })));
const nodeDrafts = ref<ServiceNode[]>([]);
const configOpen = ref(false);
const timeBase = ref<'BJ' | 'UTC'>('UTC');
const startDate = ref('2026-08-22');
const endDate = ref('2026-08-24');
const registrationFilter = ref('全部注册号');
const airportFilter = ref('全部机场');
const directionFilter = ref<'全部类型' | FlightDirection>('全部类型');

const flights = ref<ServiceFlight[]>([
  {
    agent: 'WFS', aircraft: 'G650ER', airport: 'ZSPD', customer: '星海资本', date: '2026-08-22', direction: '出港', flightNo: 'SJX603', id: 'SV-01', registration: 'B-602M', serviceOwner: '王晨', time: '08:20Z',
    nodeStates: { briefing: 'completed', permit: 'completed', handling: 'completed', fuel: 'processing', catering: 'pending', crew: 'normal', passenger: 'normal', release: 'normal', close: 'normal' },
  },
  {
    agent: '自有保障', aircraft: 'G450', airport: 'ZGGG', customer: '远航科技', date: '2026-08-22', direction: '进港', flightNo: 'SJX608', id: 'SV-02', registration: 'B-9308', serviceOwner: '李悦', time: '10:40Z',
    nodeStates: { briefing: 'completed', permit: 'completed', handling: 'completed', fuel: 'completed', catering: 'completed', crew: 'completed', passenger: 'processing', release: 'pending', close: 'pending' },
  },
  {
    agent: 'WFS', aircraft: 'G650ER', airport: 'ZBAA', customer: '内部调机', date: '2026-08-22', direction: '出港', flightNo: 'SJX611', id: 'SV-03', registration: 'B-9811', serviceOwner: '陈昊', time: '13:30Z',
    nodeStates: { briefing: 'completed', permit: 'processing', handling: 'pending', fuel: 'pending', catering: 'normal', crew: 'pending', passenger: 'normal', release: 'normal', close: 'normal' },
  },
  {
    agent: 'Jet Aviation', aircraft: 'G650ER', airport: 'RJTT', customer: '星海资本', date: '2026-08-23', direction: '进港', flightNo: 'SJX603', id: 'SV-04', registration: 'B-602M', serviceOwner: '王晨', time: '02:15Z',
    nodeStates: { briefing: 'completed', permit: 'completed', handling: 'processing', fuel: 'normal', catering: 'pending', crew: 'completed', passenger: 'completed', release: 'completed', close: 'completed' },
  },
  {
    agent: 'WFS', aircraft: 'G550', airport: 'ZUUU', customer: '拓远实业', date: '2026-08-23', direction: '出港', flightNo: 'SJX615', id: 'SV-05', registration: 'B-801Q', serviceOwner: '周宁', time: '09:00Z',
    nodeStates: { briefing: 'completed', permit: 'pending', handling: 'pending', fuel: 'processing', catering: 'normal', crew: 'completed', passenger: 'pending', release: 'normal', close: 'normal' },
  },
  {
    agent: '自有保障', aircraft: 'G450', airport: 'ZGSZ', customer: '远航科技', date: '2026-08-24', direction: '出港', flightNo: 'SJX619', id: 'SV-06', registration: 'B-9308', serviceOwner: '李悦', time: '04:10Z',
    nodeStates: { briefing: 'pending', permit: 'normal', handling: 'normal', fuel: 'normal', catering: 'normal', crew: 'normal', passenger: 'normal', release: 'normal', close: 'normal' },
  },
]);

const activeNodes = computed(() => serviceNodes.value.filter((node) => node.enabled));
const registrationOptions = computed(() => [...new Set(flights.value.map((item) => item.registration))]);
const airportOptions = computed(() => [...new Set(flights.value.map((item) => item.airport))]);
const filteredFlights = computed(() => flights.value.filter((flight) =>
  flight.date >= startDate.value &&
  flight.date <= endDate.value &&
  (registrationFilter.value === '全部注册号' || flight.registration === registrationFilter.value) &&
  (airportFilter.value === '全部机场' || flight.airport === airportFilter.value) &&
  (directionFilter.value === '全部类型' || flight.direction === directionFilter.value),
));
const summary = computed(() => {
  const counts: Record<NodeStatus, number> = { completed: 0, normal: 0, pending: 0, processing: 0 };
  filteredFlights.value.forEach((flight) => activeNodes.value.forEach((node) => {
    counts[flight.nodeStates[node.id] || 'normal'] += 1;
  }));
  return counts;
});

function openConfig() {
  nodeDrafts.value = serviceNodes.value.map((node) => ({ ...node }));
  configOpen.value = true;
}

function addNode() {
  nodeDrafts.value.push({
    enabled: true,
    id: `custom-${Date.now()}`,
    name: '新保障节点',
    offset: 'T-30',
    owner: '待分配',
  });
}

function removeNode(id: string) {
  nodeDrafts.value = nodeDrafts.value.filter((node) => node.id !== id);
}

function saveNodes() {
  const invalid = nodeDrafts.value.some((node) => !node.name.trim() || !node.offset.trim());
  if (invalid) {
    ElMessage.warning('请补充节点名称和相对时间');
    return;
  }
  serviceNodes.value = nodeDrafts.value.map((node) => ({ ...node }));
  configOpen.value = false;
  ElMessage.success('保障节点配置已保存');
}

function resetFilters() {
  startDate.value = '2026-08-22';
  endDate.value = '2026-08-24';
  registrationFilter.value = '全部注册号';
  airportFilter.value = '全部机场';
  directionFilter.value = '全部类型';
}

function moveDate(days: number) {
  const shift = (value: string) => {
    const date = new Date(`${value}T00:00:00`);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  };
  startDate.value = shift(startDate.value);
  endDate.value = shift(endDate.value);
}

function displayTime(time: string) {
  if (timeBase.value === 'UTC') return time;
  const hour = Number(time.slice(0, 2));
  return `${String((hour + 8) % 24).padStart(2, '0')}${time.slice(3, 5)} BJ`;
}

function statusLabel(status: NodeStatus) {
  return { completed: '完成', normal: '未开始', pending: '待处理', processing: '处理中' }[status];
}
</script>

<template>
  <main class="service-page sj-mission-control" data-starjet-theme="mission-control-dark">
    <header class="command-bar">
      <div class="command-filters">
        <label class="field compact-field">
          <span>时间基准</span>
          <span class="segmented" role="group" aria-label="时间基准">
            <button :class="{ active: timeBase === 'UTC' }" type="button" @click="timeBase = 'UTC'">UTC</button>
            <button :class="{ active: timeBase === 'BJ' }" type="button" @click="timeBase = 'BJ'">北京时间</button>
          </span>
        </label>
        <label class="field date-field"><span>开始日期</span><input v-model="startDate" type="date" /></label>
        <label class="field date-field"><span>结束日期</span><input v-model="endDate" type="date" /></label>
        <label class="field"><span>注册号</span><select v-model="registrationFilter"><option>全部注册号</option><option v-for="item in registrationOptions" :key="item">{{ item }}</option></select></label>
        <label class="field"><span>机场</span><select v-model="airportFilter"><option>全部机场</option><option v-for="item in airportOptions" :key="item">{{ item }}</option></select></label>
        <label class="field"><span>类型</span><select v-model="directionFilter"><option>全部类型</option><option>出港</option><option>进港</option></select></label>
      </div>
      <div class="command-actions">
        <button class="icon-button" title="上一日期段" type="button" @click="moveDate(-1)"><ChevronLeftIcon /></button>
        <button class="icon-button" title="下一日期段" type="button" @click="moveDate(1)"><ChevronRightIcon /></button>
        <button class="secondary-button" type="button" @click="resetFilters"><RotateIcon />重置</button>
        <button class="primary-button" type="button" @click="openConfig"><SettingsIcon />配置保障节点</button>
      </div>
    </header>

    <section class="status-strip" aria-label="保障状态汇总">
      <div class="status-summary"><strong class="sj-data">{{ filteredFlights.length }}</strong><span>当前航班</span></div>
      <div class="status-summary completed"><i></i><strong class="sj-data">{{ summary.completed }}</strong><span>完成</span></div>
      <div class="status-summary processing"><i></i><strong class="sj-data">{{ summary.processing }}</strong><span>处理中</span></div>
      <div class="status-summary pending"><i></i><strong class="sj-data">{{ summary.pending }}</strong><span>待处理</span></div>
      <div class="status-summary normal"><i></i><strong class="sj-data">{{ summary.normal }}</strong><span>未开始</span></div>
      <div class="node-count">已启用 <b class="sj-data">{{ activeNodes.length }}</b> 个保障节点</div>
    </section>

    <section class="workspace">
      <div class="table-scroll">
        <table class="service-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>客户</th>
              <th>注册号</th>
              <th>机型</th>
              <th>机场</th>
              <th>时间</th>
              <th>类型</th>
              <th class="process-heading">
                <span>保障节点进度</span>
                <small>按相对航班时刻排列</small>
              </th>
              <th>代理</th>
              <th>保障人</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="flight in filteredFlights" :key="flight.id">
              <td class="sj-data muted-data">{{ flight.date }}</td>
              <td>{{ flight.customer }}</td>
              <td class="sj-data registration">{{ flight.registration }}</td>
              <td class="sj-data">{{ flight.aircraft }}</td>
              <td class="sj-data airport">{{ flight.airport }}</td>
              <td class="sj-data event-time">{{ displayTime(flight.time) }}</td>
              <td><span class="direction-chip" :class="flight.direction === '出港' ? 'departure' : 'arrival'">{{ flight.direction }}</span></td>
              <td class="process-cell">
                <div class="process-track" :style="{ '--node-count': activeNodes.length }">
                  <span class="track-line"></span>
                  <div
                    v-for="node in activeNodes"
                    :key="node.id"
                    class="process-node"
                    :class="flight.nodeStates[node.id] || 'normal'"
                    :title="`${node.name} · ${statusLabel(flight.nodeStates[node.id] || 'normal')} · ${node.offset}`"
                  >
                    <i></i>
                    <span class="node-name">{{ node.name }}</span>
                    <small class="sj-data">{{ node.offset }}</small>
                  </div>
                </div>
              </td>
              <td>{{ flight.agent }}</td>
              <td>{{ flight.serviceOwner }}</td>
            </tr>
            <tr v-if="filteredFlights.length === 0">
              <td class="empty-state" colspan="10">当前日期及筛选条件下暂无保障航班</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="configOpen" class="drawer-backdrop" @click.self="configOpen = false">
      <aside class="config-drawer" aria-label="保障节点配置">
        <header class="drawer-header">
          <div><span>保障节点配置</span><small>设置节点、责任岗位与计划完成时间</small></div>
          <button class="icon-button" title="关闭" type="button" @click="configOpen = false"><CloseIcon /></button>
        </header>
        <div class="drawer-body">
          <div class="config-columns"><span>启用</span><span>节点名称</span><span>相对时间</span><span>责任岗位</span><span></span></div>
          <div v-for="node in nodeDrafts" :key="node.id" class="config-row">
            <input v-model="node.enabled" :aria-label="`启用${node.name}`" type="checkbox" />
            <input v-model="node.name" aria-label="节点名称" />
            <input v-model="node.offset" aria-label="相对时间" class="sj-data" />
            <input v-model="node.owner" aria-label="责任岗位" />
            <button class="remove-button" :aria-label="`删除${node.name}`" type="button" @click="removeNode(node.id)"><CloseIcon /></button>
          </div>
          <button class="add-node-button" type="button" @click="addNode"><PlusIcon />新增保障节点</button>
        </div>
        <footer class="drawer-footer">
          <button class="secondary-button" type="button" @click="configOpen = false">取消</button>
          <button class="primary-button" type="button" @click="saveNodes"><SaveIcon />保存配置</button>
        </footer>
      </aside>
    </div>
  </main>
</template>

<style scoped>
.service-page {
  display: flex;
  min-width: 0;
  height: var(--vben-content-height, 100dvh);
  min-height: 620px;
  overflow: hidden;
  flex-direction: column;
}

button, input, select { font: inherit; }
button { cursor: pointer; }

.command-bar {
  display: flex;
  min-height: 84px;
  padding: var(--sj-space-3) var(--sj-space-4);
  border-bottom: 1px solid var(--sj-border);
  background: var(--sj-surface-1);
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--sj-space-4);
}

.command-filters { display: flex; min-width: 0; align-items: flex-end; gap: var(--sj-space-3); }
.command-actions { display: flex; flex: none; align-items: center; gap: var(--sj-space-2); }
.field { display: grid; min-width: 140px; gap: var(--sj-space-1); color: var(--sj-text-3); font-size: 11px; }
.field.date-field { min-width: 148px; }
.field.compact-field { min-width: 168px; }
.field select, .field input, .config-row input {
  height: var(--sj-control-default);
  padding: 0 var(--sj-space-3);
  border: 1px solid var(--sj-border-strong);
  border-radius: var(--sj-radius-control);
  color: var(--sj-text-1);
  background: var(--sj-surface-2);
}
.segmented { display: flex; height: var(--sj-control-default); padding: 2px; border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); background: var(--sj-surface-2); }
.segmented button { padding: 0 var(--sj-space-3); border: 0; border-radius: var(--sj-radius-tag); color: var(--sj-text-3); background: transparent; font-size: 12px; font-weight: 700; }
.segmented button.active { color: var(--sj-text-1); background: var(--sj-surface-4); }

.icon-button, .secondary-button, .primary-button, .add-node-button, .remove-button {
  display: inline-flex;
  height: var(--sj-control-default);
  border-radius: var(--sj-radius-control);
  align-items: center;
  justify-content: center;
  gap: var(--sj-space-2);
  font-weight: 700;
}
.icon-button { width: var(--sj-control-default); padding: 0; border: 1px solid var(--sj-border-strong); color: var(--sj-text-2); background: var(--sj-surface-2); }
.secondary-button { padding: 0 var(--sj-space-3); border: 1px solid var(--sj-border-strong); color: var(--sj-text-1); background: var(--sj-surface-2); }
.primary-button { height: var(--sj-control-primary); padding: 0 var(--sj-space-4); border: 1px solid var(--sj-lime); color: var(--sj-canvas); background: var(--sj-lime); }
.icon-button:hover, .secondary-button:hover { background: var(--sj-surface-3); }

.status-strip { display: grid; min-height: 64px; border-bottom: 1px solid var(--sj-border); background: var(--sj-canvas); grid-template-columns: repeat(5, minmax(130px, 170px)) 1fr; }
.status-summary { display: flex; padding: 0 var(--sj-space-4); border-right: 1px solid var(--sj-border); align-items: center; gap: var(--sj-space-2); }
.status-summary i { width: 8px; height: 8px; border-radius: 50%; background: var(--sj-text-3); }
.status-summary strong { color: var(--sj-text-1); font-size: 20px; }
.status-summary span, .node-count { color: var(--sj-text-3); font-size: 12px; }
.status-summary.completed i { background: var(--sj-lime); }.status-summary.processing i { background: var(--sj-blue); }.status-summary.pending i { background: var(--sj-amber); }.status-summary.normal i { background: var(--sj-red); }
.node-count { display: flex; padding-right: var(--sj-space-4); align-items: center; justify-content: flex-end; gap: var(--sj-space-1); }
.node-count b { color: var(--sj-text-1); }

.workspace { min-height: 0; overflow: hidden; flex: 1; background: var(--sj-canvas); }
.table-scroll { width: 100%; height: 100%; overflow: auto; }
.service-table { width: 100%; min-width: 1680px; border-collapse: separate; border-spacing: 0; table-layout: fixed; }
.service-table th { position: sticky; z-index: 3; top: 0; height: 52px; padding: 0 var(--sj-space-3); border-right: 1px solid var(--sj-border); border-bottom: 1px solid var(--sj-border-strong); color: var(--sj-text-3); background: var(--sj-surface-2); text-align: left; font-size: 12px; }
.service-table th:nth-child(1) { width: 122px; }.service-table th:nth-child(2) { width: 124px; }.service-table th:nth-child(3) { width: 102px; }.service-table th:nth-child(4) { width: 90px; }.service-table th:nth-child(5) { width: 82px; }.service-table th:nth-child(6) { width: 92px; }.service-table th:nth-child(7) { width: 74px; }.service-table th:nth-child(8) { width: 760px; }.service-table th:nth-child(9) { width: 118px; }.service-table th:nth-child(10) { width: 100px; }
.service-table td { height: 104px; padding: var(--sj-space-3); border-right: 1px solid var(--sj-grid); border-bottom: 1px solid var(--sj-border); color: var(--sj-text-2); background: var(--sj-canvas); font-size: 13px; vertical-align: middle; }
.service-table tbody tr:nth-child(even) td { background: var(--sj-surface-1); }
.service-table tbody tr:hover td { background: var(--sj-surface-2); }
.process-heading span { display: block; color: var(--sj-text-2); }.process-heading small { color: var(--sj-text-disabled); font-weight: 500; }
.registration, .airport, .event-time { color: var(--sj-text-1) !important; font-weight: 700; }.airport { color: var(--sj-blue) !important; }.event-time { color: var(--sj-lime) !important; }.muted-data { color: var(--sj-text-3) !important; }
.direction-chip { display: inline-flex; height: 24px; padding: 0 var(--sj-space-2); border-radius: var(--sj-radius-tag); align-items: center; font-weight: 700; }.direction-chip.departure { color: var(--sj-blue); background: var(--sj-blue-soft); }.direction-chip.arrival { color: var(--sj-teal); background: var(--sj-teal-soft); }

.process-cell { padding-inline: var(--sj-space-5) !important; }
.process-track { position: relative; display: grid; min-width: 680px; height: 72px; align-items: start; grid-template-columns: repeat(var(--node-count), minmax(64px, 1fr)); }
.track-line { position: absolute; top: 19px; right: 5%; left: 5%; height: 1px; background: var(--sj-border-strong); }
.process-node { position: relative; z-index: 1; display: grid; min-width: 0; color: var(--sj-text-3); justify-items: center; gap: 2px; }
.process-node i { width: 13px; height: 13px; margin-top: 13px; border: 3px solid var(--sj-surface-2); border-radius: 50%; outline: 2px solid currentColor; background: currentColor; }
.process-node .node-name { width: 100%; overflow: hidden; color: var(--sj-text-2); text-align: center; text-overflow: ellipsis; white-space: nowrap; font-size: 11px; }
.process-node small { color: var(--sj-text-disabled); font-size: 10px; }
.process-node.completed { color: var(--sj-lime); }.process-node.processing { color: var(--sj-blue); }.process-node.pending { color: var(--sj-amber); }.process-node.normal { color: var(--sj-red); }
.empty-state { height: 180px !important; color: var(--sj-text-3) !important; text-align: center; }

.drawer-backdrop { position: fixed; z-index: 1000; inset: 0; background: color-mix(in srgb, var(--sj-canvas) 72%, transparent); }
.config-drawer { position: absolute; display: flex; top: 0; right: 0; width: min(720px, 100vw); height: 100%; border-left: 1px solid var(--sj-border-strong); background: var(--sj-surface-1); box-shadow: var(--sj-shadow-panel); flex-direction: column; }
.drawer-header { display: flex; min-height: 72px; padding: var(--sj-space-4) var(--sj-space-5); border-bottom: 1px solid var(--sj-border); align-items: center; justify-content: space-between; }
.drawer-header div { display: grid; gap: 2px; }.drawer-header span { color: var(--sj-text-1); font-size: 18px; font-weight: 700; }.drawer-header small { color: var(--sj-text-3); }
.drawer-body { min-height: 0; padding: var(--sj-space-4) var(--sj-space-5); overflow: auto; flex: 1; }
.config-columns, .config-row { display: grid; align-items: center; gap: var(--sj-space-2); grid-template-columns: 44px minmax(150px, 1.5fr) 100px minmax(110px, 1fr) 36px; }
.config-columns { padding: 0 var(--sj-space-2) var(--sj-space-2); color: var(--sj-text-3); font-size: 11px; }
.config-row { min-height: 60px; padding: var(--sj-space-2); border-top: 1px solid var(--sj-border); }
.config-row > input[type='checkbox'] { width: 16px; height: 16px; accent-color: var(--sj-lime); }
.remove-button { width: 32px; height: 32px; padding: 0; border: 1px solid var(--sj-border); color: var(--sj-text-3); background: transparent; }.remove-button:hover { color: var(--sj-red); border-color: var(--sj-red); }
.add-node-button { width: 100%; margin-top: var(--sj-space-3); border: 1px dashed var(--sj-border-strong); color: var(--sj-text-2); background: transparent; }.add-node-button:hover { color: var(--sj-blue); border-color: var(--sj-blue); }
.drawer-footer { display: flex; min-height: 72px; padding: var(--sj-space-4) var(--sj-space-5); border-top: 1px solid var(--sj-border); align-items: center; justify-content: flex-end; gap: var(--sj-space-2); }

@media (max-width: 1280px) {
  .command-bar { align-items: stretch; flex-direction: column; }
  .command-filters { overflow-x: auto; }
  .command-actions { justify-content: flex-end; }
  .status-strip { grid-template-columns: repeat(5, minmax(110px, 1fr)); }
  .node-count { display: none; }
}

@media (max-width: 1024px) {
  .service-page { min-height: 560px; }
  .status-strip { overflow-x: auto; grid-template-columns: repeat(5, 130px); }
  .command-actions .secondary-button { margin-left: auto; }
}
</style>

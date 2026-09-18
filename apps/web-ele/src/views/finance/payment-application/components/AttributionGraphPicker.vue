<script lang="ts" setup>
import { computed, ref } from 'vue';

import { createIconifyIcon } from '@vben/icons';
import { ElDrawer, ElInputNumber, ElMessage } from 'element-plus';

export interface AttributionAllocation {
  amount: number;
  id: string;
  label: string;
  path: string;
  percent: number;
  type: GraphNodeType;
}

export interface AttributionSelection {
  items: AttributionAllocation[];
  mode: 'single' | 'split';
}

export type GraphNodeType = 'company' | 'customer' | 'flight' | 'journey' | 'payment' | 'station' | 'tail';
type GraphScope = 'bill' | 'legs' | 'trip';

interface GraphEdge {
  from: string;
  label?: string;
  to: string;
}

interface GraphNode {
  id: string;
  label: string;
  meta: string;
  path: string;
  recommended?: boolean;
  relation: string;
  type: GraphNodeType;
  x: number;
  y: number;
}

const props = defineProps<{
  amount: number;
  modelValue: AttributionSelection;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: AttributionSelection];
}>();

const BuildingIcon = createIconifyIcon('lucide:building-2');
const CheckIcon = createIconifyIcon('lucide:check');
const CloseIcon = createIconifyIcon('lucide:x');
const CustomerIcon = createIconifyIcon('lucide:users');
const FlightIcon = createIconifyIcon('lucide:plane-takeoff');
const JourneyIcon = createIconifyIcon('lucide:route');
const LocateIcon = createIconifyIcon('lucide:scan-search');
const NetworkIcon = createIconifyIcon('lucide:network');
const PaymentIcon = createIconifyIcon('lucide:receipt-text');
const PlaneIcon = createIconifyIcon('lucide:plane');
const StationIcon = createIconifyIcon('lucide:map-pin');
const SplitIcon = createIconifyIcon('lucide:split');

const typeConfig: Record<GraphNodeType, { icon: typeof BuildingIcon; label: string }> = {
  company: { icon: BuildingIcon, label: '公司' },
  customer: { icon: CustomerIcon, label: '客户' },
  flight: { icon: FlightIcon, label: '航段' },
  journey: { icon: JourneyIcon, label: '行程' },
  payment: { icon: PaymentIcon, label: '付款事项' },
  station: { icon: StationIcon, label: '航站' },
  tail: { icon: PlaneIcon, label: '飞机' },
};

const nodes: GraphNode[] = [
  { id: 'company-starjet', label: '吉星航空', meta: '申请主体', path: '吉星航空', relation: '付款申请所属公司', type: 'company', x: 100, y: 78 },
  { id: 'payment-current', label: '当前付款事项', meta: 'USD 37,404', path: '当前付款明细', relation: '当前正在配置的付款明细', type: 'payment', x: 280, y: 78 },
  { id: 'tail-b801q', label: 'B-9308', meta: 'G450 · 包机', path: 'B-9308', relation: '账单注册号匹配', type: 'tail', x: 500, y: 72 },
  { id: 'journey-sj260823', label: 'SJ260823', meta: '8月23日—26日', path: 'B-9308 / SJ260823', relation: '服务日期匹配', type: 'journey', x: 500, y: 210 },
  { id: 'flight-sjx603', label: 'SJX603', meta: 'ZSPD → VHHH', path: '星海资本 / B-9308 / SJ260823 / SJX603', relation: '前序到达航段 · 客户星海资本', type: 'flight', x: 210, y: 365 },
  { id: 'station-vhhh', label: 'VHHH 航站', meta: '到港 / 出港保障', path: 'B-9308 / SJ260823 / VHHH 航站', recommended: true, relation: '账单航站与服务项目匹配', type: 'station', x: 500, y: 365 },
  { id: 'flight-sjx604', label: 'SJX604', meta: 'VHHH → ZGSZ', path: '远航科技 / B-9308 / SJ260823 / SJX604', relation: '后序起飞航段 · 客户远航科技', type: 'flight', x: 790, y: 365 },
  { id: 'customer-xh', label: '星海资本', meta: '前序航段客户', path: '星海资本', relation: '包机前序航段合同客户', type: 'customer', x: 210, y: 515 },
  { id: 'customer-charter', label: '远航科技', meta: '后序航段客户', path: '远航科技 / SJX604', relation: '包机航段合同客户', type: 'customer', x: 790, y: 515 },
];

const edges: GraphEdge[] = [
  { from: 'company-starjet', label: '申请主体', to: 'payment-current' },
  { from: 'payment-current', label: '识别注册号', to: 'tail-b801q' },
  { from: 'tail-b801q', label: '执行', to: 'journey-sj260823' },
  { from: 'journey-sj260823', to: 'flight-sjx603' },
  { from: 'journey-sj260823', to: 'station-vhhh' },
  { from: 'journey-sj260823', to: 'flight-sjx604' },
  { from: 'flight-sjx603', label: '归属客户', to: 'customer-xh' },
  { from: 'flight-sjx604', label: '归属客户', to: 'customer-charter' },
];

const scopeNodeIds: Record<GraphScope, Set<string>> = {
  bill: new Set(nodes.map((node) => node.id)),
  legs: new Set(['journey-sj260823', 'flight-sjx603', 'station-vhhh', 'flight-sjx604', 'customer-charter']),
  trip: new Set(['customer-xh', 'tail-b801q', 'journey-sj260823', 'flight-sjx603', 'station-vhhh', 'flight-sjx604', 'customer-charter']),
};

const drawerVisible = ref(false);
const scope = ref<GraphScope>('trip');
const mode = ref<'single' | 'split'>('single');
const selectedNodeId = ref('station-vhhh');
const allocations = ref<AttributionAllocation[]>([]);

const visibleNodes = computed(() => nodes.filter((node) => scopeNodeIds[scope.value].has(node.id)));
const visibleNodeIds = computed(() => new Set(visibleNodes.value.map((node) => node.id)));
const visibleEdges = computed(() => edges.filter((edge) => visibleNodeIds.value.has(edge.from) && visibleNodeIds.value.has(edge.to)));
const selectedNode = computed(() => nodes.find((node) => node.id === selectedNodeId.value));
const allocatedAmount = computed(() => allocations.value.reduce((sum, item) => sum + item.amount, 0));
const allocatedPercent = computed(() => allocations.value.reduce((sum, item) => sum + item.percent, 0));
const remainingAmount = computed(() => props.amount - allocatedAmount.value);
const allocationIsValid = computed(() => allocations.value.length > 0 && Math.abs(remainingAmount.value) < 0.01 && Math.abs(100 - allocatedPercent.value) < 0.05);

const selectionSummary = computed(() => {
  if (!props.modelValue.items.length) return '配置归属对象';
  if (props.modelValue.mode === 'split') return `${props.modelValue.items.length}个对象 · 已分摊`;
  return props.modelValue.items[0]?.label || '已配置';
});

function nodeById(id: string) {
  return nodes.find((node) => node.id === id);
}

function edgeCoordinates(edge: GraphEdge) {
  const from = nodeById(edge.from)!;
  const to = nodeById(edge.to)!;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;
  const startPadding = 42;
  const endPadding = 48;
  return {
    x1: from.x + (dx / length) * startPadding,
    x2: to.x - (dx / length) * endPadding,
    y1: from.y + (dy / length) * startPadding,
    y2: to.y - (dy / length) * endPadding,
  };
}

function openPicker() {
  mode.value = props.modelValue.mode;
  allocations.value = props.modelValue.items.map((item) => ({ ...item }));
  const savedNodeId = props.modelValue.items[0]?.id;
  selectedNodeId.value = savedNodeId && scopeNodeIds[scope.value].has(savedNodeId) ? savedNodeId : 'station-vhhh';
  drawerVisible.value = true;
}

function selectNode(node: GraphNode) {
  if (node.type === 'payment') return;
  selectedNodeId.value = node.id;
}

function allocationFromNode(node: GraphNode, amount: number): AttributionAllocation {
  const percent = props.amount > 0 ? (amount / props.amount) * 100 : 0;
  return { amount, id: node.id, label: node.label, path: node.path, percent, type: node.type };
}

function addSelectedToSplit() {
  const node = selectedNode.value;
  if (!node || node.type === 'payment') return;
  if (mode.value === 'single') allocations.value = [];
  if (allocations.value.some((item) => item.id === node.id)) {
    ElMessage.info('该对象已加入分摊');
    return;
  }
  const count = allocations.value.length + 1;
  const base = props.amount / count;
  allocations.value = [
    ...allocations.value.map((item) => allocationFromNode(nodeById(item.id)!, base)),
    allocationFromNode(node, props.amount - base * (count - 1)),
  ];
  mode.value = 'split';
}

function removeAllocation(id: string) {
  allocations.value = allocations.value.filter((item) => item.id !== id);
  if (!allocations.value.length) return;
  const base = props.amount / allocations.value.length;
  allocations.value = allocations.value.map((item, index) => allocationFromNode(nodeById(item.id)!, index === allocations.value.length - 1 ? props.amount - base * (allocations.value.length - 1) : base));
}

function updateAllocationAmount(item: AttributionAllocation) {
  item.percent = props.amount > 0 ? Number(((item.amount / props.amount) * 100).toFixed(2)) : 0;
}

function updateAllocationPercent(item: AttributionAllocation) {
  item.amount = Number(((props.amount * item.percent) / 100).toFixed(2));
}

function confirmSelection() {
  if (mode.value === 'single') {
    const node = selectedNode.value;
    if (!node || node.type === 'payment') return;
    emit('update:modelValue', { items: [allocationFromNode(node, props.amount)], mode: 'single' });
  } else {
    if (!allocationIsValid.value) {
      ElMessage.warning('分摊比例需合计 100%，且分摊金额需与付款明细金额一致');
      return;
    }
    emit('update:modelValue', { items: allocations.value.map((item) => ({ ...item })), mode: 'split' });
  }
  drawerVisible.value = false;
  ElMessage.success('归属对象已更新');
}

</script>

<template>
  <button class="attribution-trigger" :class="{ configured: modelValue.items.length }" type="button" @click="openPicker">
    <NetworkIcon />
    <span><small>{{ modelValue.items.length ? '关联归属' : '未配置' }}</small><strong>{{ selectionSummary }}</strong></span>
  </button>

  <ElDrawer v-model="drawerVisible" append-to-body class="attribution-graph-drawer" direction="rtl" size="min(1080px, 92vw)" :with-header="false">
    <div class="graph-picker sj-mission-control" data-starjet-theme="mission-control-dark">
      <header class="picker-header">
        <div><p>ATTRIBUTION RELATION</p><h2>选择事项归属对象</h2></div>
        <button aria-label="关闭" type="button" @click="drawerVisible = false"><CloseIcon /></button>
      </header>

      <section class="recommendation">
        <div class="recommendation-icon"><LocateIcon /></div>
        <div><span>系统推荐归属</span><strong>VHHH 航站 · 到港 / 出港保障</strong><small>匹配依据：账单航站、服务日期、飞机注册号 · 匹配度 94%</small></div>
        <button type="button" @click="selectedNodeId = 'station-vhhh'; mode = 'single'">定位推荐节点</button>
      </section>

      <nav class="graph-toolbar" aria-label="关系图范围">
        <div>
          <button :class="{ active: scope === 'bill' }" type="button" @click="scope = 'bill'">当前账单相关</button>
          <button :class="{ active: scope === 'trip' }" type="button" @click="scope = 'trip'">当前行程</button>
          <button :class="{ active: scope === 'legs' }" type="button" @click="scope = 'legs'">前后航段</button>
        </div>
        <span>点击节点查看关系，选择后确认归属</span>
      </nav>

      <div class="graph-workspace">
        <section class="graph-canvas" aria-label="付款事项关联图">
          <svg aria-hidden="true" class="graph-edges" viewBox="0 0 1000 600">
            <defs>
              <marker id="relation-arrow" markerHeight="7" markerWidth="7" orient="auto" refX="6" refY="3.5">
                <path d="M0,0 L7,3.5 L0,7 Z" />
              </marker>
            </defs>
            <g v-for="edge in visibleEdges" :key="`${edge.from}-${edge.to}`">
              <line v-bind="edgeCoordinates(edge)" marker-end="url(#relation-arrow)" />
              <text v-if="edge.label" :x="(edgeCoordinates(edge).x1 + edgeCoordinates(edge).x2) / 2" :y="(edgeCoordinates(edge).y1 + edgeCoordinates(edge).y2) / 2 - 7">{{ edge.label }}</text>
            </g>
          </svg>
          <button
            v-for="node in visibleNodes"
            :key="node.id"
            class="graph-node"
            :class="[`type-${node.type}`, { allocated: allocations.some((item) => item.id === node.id), recommended: node.recommended, selected: selectedNodeId === node.id }]"
            :style="{ left: `${node.x / 10}%`, top: `${node.y / 6}%` }"
            :type="node.type === 'payment' ? undefined : 'button'"
            @click="selectNode(node)"
          >
            <component :is="typeConfig[node.type].icon" />
            <span><small>{{ typeConfig[node.type].label }}</small><strong>{{ node.label }}</strong><em>{{ node.meta }}</em></span>
            <i v-if="node.recommended">推荐</i>
          </button>
          <div class="graph-legend"><span><i class="recommended-dot"></i>系统推荐</span><span><i class="selected-dot"></i>当前选择</span><span><i class="allocated-dot"></i>已加入分摊</span></div>
        </section>

        <aside class="node-inspector">
          <template v-if="selectedNode">
            <div class="node-type"><component :is="typeConfig[selectedNode.type].icon" />{{ typeConfig[selectedNode.type].label }}</div>
            <h3>{{ selectedNode.label }}</h3>
            <p>{{ selectedNode.meta }}</p>
            <dl>
              <div><dt>业务关系</dt><dd>{{ selectedNode.relation }}</dd></div>
              <div><dt>完整路径</dt><dd>{{ selectedNode.path }}</dd></div>
              <div><dt>付款金额</dt><dd class="sj-data">{{ amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}</dd></div>
            </dl>
            <div class="inspector-actions">
              <button type="button" @click="mode = 'single'">选择此对象</button>
              <button type="button" @click="addSelectedToSplit"><SplitIcon />加入分摊</button>
            </div>
          </template>
        </aside>
      </div>

      <section v-if="mode === 'split'" class="allocation-panel">
        <header><div><SplitIcon /><span><strong>多对象分摊</strong><small>航站费用可分配到前后航段或不同客户</small></span></div><b :class="{ invalid: !allocationIsValid }">已分配 {{ allocatedPercent.toFixed(2) }}% · 待分配 {{ remainingAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}</b></header>
        <div v-if="allocations.length" class="allocation-list">
          <div v-for="item in allocations" :key="item.id" class="allocation-row">
            <span><strong>{{ item.label }}</strong><small>{{ item.path }}</small></span>
            <label>比例<div class="percentage-control"><ElInputNumber v-model="item.percent" :max="100" :min="0" :precision="2" controls-position="right" @change="updateAllocationPercent(item)" /><span>%</span></div></label>
            <label>分摊金额<ElInputNumber v-model="item.amount" :min="0" :precision="2" controls-position="right" @change="updateAllocationAmount(item)" /></label>
            <button aria-label="移出分摊" type="button" @click="removeAllocation(item.id)"><CloseIcon /></button>
          </div>
        </div>
        <div v-else class="allocation-empty">在关系图中选择节点并点击“加入分摊”</div>
      </section>

      <footer class="picker-footer">
        <div><CheckIcon /><span>{{ mode === 'single' ? `单一归属：${selectedNode?.label || '未选择'}` : `已选择 ${allocations.length} 个分摊对象` }}</span></div>
        <button class="confirm-button" type="button" @click="confirmSelection">确认归属</button>
      </footer>
    </div>
  </ElDrawer>
</template>

<style scoped>
.attribution-trigger { display: flex; width: 100%; min-width: 190px; min-height: var(--sj-control-default); align-items: center; gap: var(--sj-space-2); padding: var(--sj-space-2) var(--sj-space-3); border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); color: var(--sj-text-2); background: var(--sj-surface-2); text-align: left; cursor: pointer; }
.attribution-trigger:hover, .attribution-trigger.configured { border-color: var(--sj-blue); background: var(--sj-blue-soft); }
.attribution-trigger > svg { flex: 0 0 auto; color: var(--sj-blue); font-size: 18px; }
.attribution-trigger span { display: flex; min-width: 0; flex-direction: column; }
.attribution-trigger small { color: var(--sj-text-3); font-size: 10px; line-height: 12px; }
.attribution-trigger strong { overflow: hidden; color: var(--sj-text-1); font-size: 12px; line-height: 16px; text-overflow: ellipsis; white-space: nowrap; }
</style>

<style>
.attribution-graph-drawer .el-drawer__body { padding: 0; overflow: hidden; background: var(--sj-canvas); }
.graph-picker { display: flex; height: 100%; flex-direction: column; color: var(--sj-text-1); background: var(--sj-canvas); }
.picker-header { display: flex; min-height: 68px; flex: 0 0 auto; align-items: center; justify-content: space-between; padding: var(--sj-space-3) var(--sj-space-5); border-bottom: 1px solid var(--sj-border); background: var(--sj-surface-1); }
.picker-header p { margin: 0; color: var(--sj-blue); font: 700 11px/16px var(--sj-font-data); letter-spacing: .1em; }
.picker-header h2 { margin: 0; font-size: 18px; line-height: 28px; }
.picker-header > button, .allocation-row > button { display: grid; width: var(--sj-control-default); height: var(--sj-control-default); place-items: center; border: 1px solid var(--sj-border); border-radius: var(--sj-radius-control); color: var(--sj-text-2); background: transparent; cursor: pointer; }
.recommendation { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: var(--sj-space-3); align-items: center; margin: var(--sj-space-3) var(--sj-space-4) 0; padding: var(--sj-space-3); border: 1px solid var(--sj-blue); border-radius: var(--sj-radius-panel); background: var(--sj-blue-soft); }
.recommendation-icon { display: grid; width: var(--sj-control-primary); height: var(--sj-control-primary); place-items: center; color: var(--sj-blue); background: var(--sj-surface-3); }
.recommendation > div:nth-child(2) { display: flex; flex-direction: column; gap: var(--sj-space-1); }
.recommendation span, .recommendation small { color: var(--sj-text-3); font-size: 11px; }
.recommendation strong { font-size: 14px; }
.recommendation > button { min-height: var(--sj-control-dense); padding: 0 var(--sj-space-3); border: 1px solid var(--sj-blue); border-radius: var(--sj-radius-control); color: var(--sj-blue); background: transparent; cursor: pointer; }
.graph-toolbar { display: flex; min-height: 48px; flex: 0 0 auto; align-items: center; justify-content: space-between; padding: 0 var(--sj-space-4); border-bottom: 1px solid var(--sj-border); }
.graph-toolbar > div { display: flex; gap: var(--sj-space-1); }
.graph-toolbar button { min-height: var(--sj-control-dense); padding: 0 var(--sj-space-3); border: 1px solid transparent; border-radius: var(--sj-radius-control); color: var(--sj-text-2); background: transparent; cursor: pointer; }
.graph-toolbar button.active { border-color: var(--sj-border-strong); color: var(--sj-text-1); background: var(--sj-surface-3); box-shadow: inset 0 -2px 0 var(--sj-blue); }
.graph-toolbar > span { color: var(--sj-text-3); font-size: 11px; }
.graph-workspace { display: grid; min-height: 500px; flex: 1 1 auto; grid-template-columns: minmax(0, 1fr) 270px; overflow: hidden; }
.graph-canvas { position: relative; min-height: 500px; overflow: hidden; border-right: 1px solid var(--sj-border); background-color: var(--sj-canvas); background-image: linear-gradient(var(--sj-grid) 1px, transparent 1px), linear-gradient(90deg, var(--sj-grid) 1px, transparent 1px); background-size: var(--sj-space-8) var(--sj-space-8); }
.graph-edges { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.graph-edges line { stroke: var(--sj-border-strong); stroke-width: 1.5; }
.graph-edges marker path { fill: var(--sj-text-2); }
.graph-edges text { fill: var(--sj-text-3); font: 10px var(--sj-font-ui); text-anchor: middle; }
.graph-node { position: absolute; display: grid; width: 142px; min-height: 58px; grid-template-columns: auto minmax(0, 1fr); gap: var(--sj-space-2); align-items: center; padding: var(--sj-space-2); border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); color: var(--sj-text-2); background: var(--sj-surface-2); box-shadow: var(--sj-shadow-panel); text-align: left; transform: translate(-50%, -50%); cursor: pointer; transition: border-color var(--sj-duration-fast), background var(--sj-duration-fast); }
.graph-node > svg { color: var(--sj-text-3); font-size: 18px; }
.graph-node > span { display: flex; min-width: 0; flex-direction: column; }
.graph-node small, .graph-node em { overflow: hidden; color: var(--sj-text-3); font-size: 10px; font-style: normal; text-overflow: ellipsis; white-space: nowrap; }
.graph-node strong { overflow: hidden; color: var(--sj-text-1); font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.graph-node i { position: absolute; top: calc(var(--sj-space-2) * -1); right: var(--sj-space-2); padding: 0 var(--sj-space-1); color: var(--sj-lime); background: var(--sj-surface-2); font-size: 10px; font-style: normal; }
.graph-node:hover, .graph-node.selected { border-color: var(--sj-blue); background: var(--sj-blue-soft); }
.graph-node.selected { box-shadow: var(--sj-shadow-selected); }
.graph-node.recommended { border-color: var(--sj-lime); }
.graph-node.allocated::after { position: absolute; top: calc(var(--sj-space-1) * -1); left: calc(var(--sj-space-1) * -1); width: var(--sj-space-3); height: var(--sj-space-3); border: 2px solid var(--sj-canvas); border-radius: 50%; background: var(--sj-amber); content: ''; }
.graph-node.type-payment { cursor: default; }
.graph-node.type-payment > svg { color: var(--sj-blue); }
.graph-node.type-tail > svg, .graph-node.type-flight > svg { color: var(--sj-teal); }
.graph-node.type-station > svg { color: var(--sj-purple); }
.graph-legend { position: absolute; bottom: var(--sj-space-3); left: var(--sj-space-3); display: flex; gap: var(--sj-space-3); padding: var(--sj-space-2); color: var(--sj-text-3); background: var(--sj-surface-1); font-size: 10px; }
.graph-legend span { display: flex; align-items: center; gap: var(--sj-space-1); }
.graph-legend i { width: var(--sj-space-2); height: var(--sj-space-2); border-radius: 50%; }
.recommended-dot { background: var(--sj-lime); }.selected-dot { background: var(--sj-blue); }.allocated-dot { background: var(--sj-amber); }
.node-inspector { padding: var(--sj-space-4); background: var(--sj-surface-1); }
.node-type { display: inline-flex; align-items: center; gap: var(--sj-space-1); color: var(--sj-blue); font-size: 11px; }
.node-inspector h3 { margin: var(--sj-space-2) 0 0; font-size: 18px; }
.node-inspector > p { margin: var(--sj-space-1) 0 var(--sj-space-4); color: var(--sj-text-3); }
.node-inspector dl { margin: 0; }
.node-inspector dl div { padding: var(--sj-space-3) 0; border-top: 1px solid var(--sj-border); }
.node-inspector dt { color: var(--sj-text-3); font-size: 11px; }
.node-inspector dd { margin: var(--sj-space-1) 0 0; color: var(--sj-text-2); line-height: 20px; }
.inspector-actions { display: grid; gap: var(--sj-space-2); margin-top: var(--sj-space-4); }
.inspector-actions button { min-height: var(--sj-control-default); border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); color: var(--sj-text-1); background: var(--sj-surface-2); cursor: pointer; }
.inspector-actions button:last-child { display: flex; align-items: center; justify-content: center; gap: var(--sj-space-2); color: var(--sj-blue); }
.allocation-panel { flex: 0 0 auto; max-height: 220px; overflow: auto; border-top: 1px solid var(--sj-border); background: var(--sj-surface-1); }
.allocation-panel > header { position: sticky; top: 0; z-index: 1; display: flex; min-height: 48px; align-items: center; justify-content: space-between; padding: var(--sj-space-2) var(--sj-space-4); border-bottom: 1px solid var(--sj-border); background: var(--sj-surface-1); }
.allocation-panel header > div, .allocation-panel header span { display: flex; align-items: center; gap: var(--sj-space-2); }
.allocation-panel header span { align-items: flex-start; flex-direction: column; gap: 0; }
.allocation-panel header small { color: var(--sj-text-3); }
.allocation-panel header b { color: var(--sj-lime); font: 700 12px var(--sj-font-data); }
.allocation-panel header b.invalid { color: var(--sj-amber); }
.allocation-row { display: grid; grid-template-columns: minmax(220px, 1fr) 124px 180px auto; gap: var(--sj-space-3); align-items: end; padding: var(--sj-space-2) var(--sj-space-4); border-bottom: 1px solid var(--sj-border); }
.allocation-row > span { display: flex; min-width: 0; flex-direction: column; }
.allocation-row small { overflow: hidden; color: var(--sj-text-3); text-overflow: ellipsis; white-space: nowrap; }
.allocation-row label { display: flex; flex-direction: column; gap: var(--sj-space-1); color: var(--sj-text-3); font-size: 10px; }
.allocation-row input, .allocation-row .el-input-number { width: 100%; height: var(--sj-control-dense); }
.allocation-row input { padding: 0 var(--sj-space-2); border: 1px solid var(--sj-border); border-radius: var(--sj-radius-control); color: var(--sj-text-2); background: var(--sj-surface-2); }
.percentage-control { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: var(--sj-space-1); align-items: center; }
.percentage-control > span { color: var(--sj-text-2); font: 600 12px var(--sj-font-data); }
.allocation-row .el-input__wrapper { background: var(--sj-surface-2); box-shadow: inset 0 0 0 1px var(--sj-border); }
.allocation-row .el-input__inner { color: var(--sj-text-1); }
.allocation-empty { display: grid; min-height: 70px; place-items: center; color: var(--sj-text-3); }
.picker-footer { display: flex; min-height: 64px; flex: 0 0 auto; align-items: center; justify-content: space-between; padding: var(--sj-space-3) var(--sj-space-4); border-top: 1px solid var(--sj-border); background: var(--sj-surface-1); }
.picker-footer > div { display: flex; align-items: center; gap: var(--sj-space-2); color: var(--sj-text-2); }
.picker-footer > div svg { color: var(--sj-lime); }
.confirm-button { min-height: var(--sj-control-primary); padding: 0 var(--sj-space-5); border: 1px solid var(--sj-lime); border-radius: var(--sj-radius-control); color: var(--sj-canvas); background: var(--sj-lime); font-weight: 700; cursor: pointer; }
@media (max-width: 1024px) {
  .graph-workspace { grid-template-columns: 1fr; overflow: auto; }
  .graph-canvas { min-width: 760px; border-right: 0; }
  .node-inspector { border-top: 1px solid var(--sj-border); }
  .recommendation { grid-template-columns: auto minmax(0, 1fr); }
  .recommendation > button { grid-column: 1 / -1; }
}
</style>

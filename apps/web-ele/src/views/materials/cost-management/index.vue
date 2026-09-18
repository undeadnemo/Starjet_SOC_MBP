<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';

import {
  ElButton,
  ElDrawer,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElOption,
  ElSelect,
} from 'element-plus';

type ViewMode = 'inventory' | 'requisitions';

interface MaterialCost {
  category: string;
  costPrice: number;
  defaultSalePrice: number;
  enteredAt: string;
  enteredBy: string;
  id: string;
  location: string;
  name: string;
  partNumber: string;
  quantity: number;
}

interface RequisitionLine {
  materialId: string;
  quantity: number;
  salePrice: number;
}

interface Requisition {
  aircraft: string;
  createdAt: string;
  createdBy: string;
  id: string;
  lines: RequisitionLine[];
  purpose: string;
  receiver: string;
  status: '已出库' | '待出库';
}

const viewMode = ref<ViewMode>('inventory');
const query = ref('');
const category = ref('all');
const costDrawerVisible = ref(false);
const requisitionDrawerVisible = ref(false);
const editingMaterial = ref<MaterialCost>();

const materials = reactive<MaterialCost[]>([
  {
    category: '周转件',
    costPrice: 18_600,
    defaultSalePrice: 23_500,
    enteredAt: '2026-08-28 16:42',
    enteredBy: '张园',
    id: 'MAT-32018',
    location: 'ZBAA / A-03-02',
    name: '主起落架轮胎组件',
    partNumber: 'PN 217K22-1',
    quantity: 3,
  },
  {
    category: '航材件',
    costPrice: 82_400,
    defaultSalePrice: 98_000,
    enteredAt: '2026-08-27 11:18',
    enteredBy: '李悦',
    id: 'MAT-24007',
    location: 'ZSPD / B-01-06',
    name: '启动发电机',
    partNumber: 'PN 23091-002',
    quantity: 1,
  },
  {
    category: '消耗件',
    costPrice: 1_280,
    defaultSalePrice: 1_850,
    enteredAt: '2026-08-27 09:36',
    enteredBy: '王晨',
    id: 'MAT-28031',
    location: 'ZUUU / C-05-01',
    name: '燃油滤芯',
    partNumber: 'PN 7583478',
    quantity: 7,
  },
  {
    category: '航材件',
    costPrice: 126_000,
    defaultSalePrice: 148_000,
    enteredAt: '2026-08-26 17:05',
    enteredBy: '陈昊',
    id: 'MAT-34012',
    location: 'ZBAA / A-02-04',
    name: '大气数据计算机',
    partNumber: 'PN 822-1234-008',
    quantity: 1,
  },
  {
    category: '消耗件',
    costPrice: 460,
    defaultSalePrice: 680,
    enteredAt: '2026-08-25 14:22',
    enteredBy: '赵楠',
    id: 'MAT-29016',
    location: 'ZSPD / C-02-08',
    name: '液压油滤芯',
    partNumber: 'PN 2024-018',
    quantity: 12,
  },
]);

const requisitions = reactive<Requisition[]>([
  {
    aircraft: 'B-9308',
    createdAt: '2026-08-28 15:20',
    createdBy: '张园',
    id: 'MR-260828-003',
    lines: [
      { materialId: 'MAT-28031', quantity: 2, salePrice: 1_850 },
      { materialId: 'MAT-29016', quantity: 3, salePrice: 680 },
    ],
    purpose: '航前例行更换',
    receiver: 'ZSPD 机务组',
    status: '已出库',
  },
  {
    aircraft: 'B-801Q',
    createdAt: '2026-08-29 08:45',
    createdBy: '李悦',
    id: 'MR-260829-001',
    lines: [{ materialId: 'MAT-32018', quantity: 1, salePrice: 23_500 }],
    purpose: '起落架轮胎更换',
    receiver: 'ZBAA 维修组',
    status: '待出库',
  },
]);

const newRequisition = reactive<Omit<Requisition, 'createdAt' | 'createdBy' | 'status'>>({
  aircraft: '',
  id: '',
  lines: [],
  purpose: '',
  receiver: '',
});

const filteredMaterials = computed(() => {
  const keyword = query.value.trim().toLowerCase();
  return materials.filter((item) => {
    const matchesCategory = category.value === 'all' || item.category === category.value;
    const haystack = `${item.id}${item.name}${item.partNumber}${item.location}${item.enteredBy}`.toLowerCase();
    return matchesCategory && (!keyword || haystack.includes(keyword));
  });
});

const summary = computed(() => ({
  inventoryCost: materials.reduce((total, item) => total + item.quantity * item.costPrice, 0),
  inventoryQuantity: materials.reduce((total, item) => total + item.quantity, 0),
  pendingOrders: requisitions.filter((item) => item.status === '待出库').length,
  potentialRevenue: materials.reduce(
    (total, item) => total + item.quantity * item.defaultSalePrice,
    0,
  ),
}));

const requisitionTotals = computed(() => newRequisition.lines.reduce(
  (totals, line) => {
    const material = getMaterial(line.materialId);
    totals.cost += (material?.costPrice ?? 0) * line.quantity;
    totals.sale += line.salePrice * line.quantity;
    totals.quantity += line.quantity;
    return totals;
  },
  { cost: 0, quantity: 0, sale: 0 },
));

function currency(value: number) {
  return `¥${value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`;
}

function getMaterial(id: string) {
  return materials.find((item) => item.id === id);
}

function lineSummary(order: Requisition) {
  return order.lines
    .map((line) => `${getMaterial(line.materialId)?.name ?? line.materialId} × ${line.quantity}`)
    .join('、');
}

function orderAmount(order: Requisition) {
  return order.lines.reduce((total, line) => total + line.salePrice * line.quantity, 0);
}

function openCostEditor(material: MaterialCost) {
  editingMaterial.value = { ...material };
  costDrawerVisible.value = true;
}

function saveMaterialCost() {
  if (!editingMaterial.value) return;
  const index = materials.findIndex((item) => item.id === editingMaterial.value?.id);
  if (index < 0 || !materials[index]) return;
  Object.assign(materials[index], editingMaterial.value);
  costDrawerVisible.value = false;
  ElMessage.success('航材数量与成本信息已更新');
}

function openRequisition() {
  newRequisition.id = `MR-260829-${String(requisitions.length + 2).padStart(3, '0')}`;
  newRequisition.aircraft = '';
  newRequisition.purpose = '';
  newRequisition.receiver = '';
  newRequisition.lines = [];
  addRequisitionLine();
  requisitionDrawerVisible.value = true;
}

function addRequisitionLine() {
  const unused = materials.find(
    (material) => !newRequisition.lines.some((line) => line.materialId === material.id),
  );
  newRequisition.lines.push({
    materialId: unused?.id ?? '',
    quantity: 1,
    salePrice: unused?.defaultSalePrice ?? 0,
  });
}

function changeLineMaterial(line: RequisitionLine) {
  line.quantity = 1;
  line.salePrice = getMaterial(line.materialId)?.defaultSalePrice ?? 0;
}

function removeRequisitionLine(index: number) {
  if (newRequisition.lines.length === 1) {
    ElMessage.warning('领用单至少需要一项航材');
    return;
  }
  newRequisition.lines.splice(index, 1);
}

function saveRequisition() {
  if (!newRequisition.aircraft || !newRequisition.purpose || !newRequisition.receiver) {
    ElMessage.warning('请填写飞机、用途和领用人');
    return;
  }
  if (newRequisition.lines.some((line) => !line.materialId || line.quantity <= 0)) {
    ElMessage.warning('请完整填写航材和领用数量');
    return;
  }
  const unavailableLine = newRequisition.lines.find((line) => {
    const material = getMaterial(line.materialId);
    return !material || line.quantity > material.quantity;
  });
  if (unavailableLine) {
    ElMessage.error(`${getMaterial(unavailableLine.materialId)?.name ?? '所选航材'}库存不足`);
    return;
  }
  requisitions.unshift({
    ...newRequisition,
    createdAt: '2026-08-29 10:32',
    createdBy: '张园',
    lines: newRequisition.lines.map((line) => ({ ...line })),
    status: '待出库',
  });
  requisitionDrawerVisible.value = false;
  viewMode.value = 'requisitions';
  ElMessage.success('航材领用单已创建');
}
</script>

<template>
  <main class="cost-page sj-mission-control" data-starjet-theme="mission-control-dark">
    <header class="page-bar">
      <div>
        <span>MATERIAL COST CONTROL</span>
        <h1>航材成本管理</h1>
      </div>
      <ElButton type="primary" @click="openRequisition">创建航材领用单</ElButton>
    </header>

    <section class="metrics" aria-label="航材成本概览">
      <div><span>库存数量</span><b>{{ summary.inventoryQuantity }}</b></div>
      <div><span>库存成本</span><b>{{ currency(summary.inventoryCost) }}</b></div>
      <div><span>对外价格总额</span><b class="blue">{{ currency(summary.potentialRevenue) }}</b></div>
      <div><span>待出库领用单</span><b class="amber">{{ summary.pendingOrders }}</b></div>
    </section>

    <section class="command-bar">
      <div class="view-switch" aria-label="页面视图">
        <button
          type="button"
          :class="{ active: viewMode === 'inventory' }"
          @click="viewMode = 'inventory'"
        >
          成本台账
        </button>
        <button
          type="button"
          :class="{ active: viewMode === 'requisitions' }"
          @click="viewMode = 'requisitions'"
        >
          航材领用单 <em>{{ requisitions.length }}</em>
        </button>
      </div>
      <div v-if="viewMode === 'inventory'" class="filters">
        <ElInput v-model="query" clearable placeholder="搜索航材编号、名称、料号、录入人" />
        <ElSelect v-model="category">
          <ElOption label="全部分类" value="all" />
          <ElOption label="航材件" value="航材件" />
          <ElOption label="周转件" value="周转件" />
          <ElOption label="消耗件" value="消耗件" />
        </ElSelect>
      </div>
    </section>

    <section v-if="viewMode === 'inventory'" class="data-table inventory-table">
      <header class="table-row">
        <span>航材编号</span><span>名称 / 料号</span><span>库存位置</span><span>数量</span>
        <span>成本价</span><span>库存成本</span><span>录入人</span><span>录入时间</span><span>操作</span>
      </header>
      <div v-for="item in filteredMaterials" :key="item.id" class="table-row data-row">
        <span class="blue sj-data">{{ item.id }}</span>
        <span class="material-name"><strong>{{ item.name }}</strong><small>{{ item.partNumber }} · {{ item.category }}</small></span>
        <span class="sj-data">{{ item.location }}</span>
        <span class="sj-data">{{ item.quantity }}</span>
        <span class="sj-data">{{ currency(item.costPrice) }}</span>
        <span class="sj-data">{{ currency(item.costPrice * item.quantity) }}</span>
        <span>{{ item.enteredBy }}</span>
        <time>{{ item.enteredAt }}</time>
        <button type="button" @click="openCostEditor(item)">编辑</button>
      </div>
      <div v-if="filteredMaterials.length === 0" class="empty-state">当前筛选条件下暂无航材成本记录</div>
    </section>

    <section v-else class="data-table requisition-table">
      <header class="table-row">
        <span>领用单号</span><span>飞机 / 用途</span><span>航材明细</span><span>领用数量</span>
        <span>对外金额</span><span>领用人</span><span>创建人</span><span>创建时间</span><span>状态</span>
      </header>
      <div v-for="order in requisitions" :key="order.id" class="table-row data-row">
        <span class="blue sj-data">{{ order.id }}</span>
        <span class="material-name"><strong>{{ order.aircraft }}</strong><small>{{ order.purpose }}</small></span>
        <span class="line-summary">{{ lineSummary(order) }}</span>
        <span class="sj-data">{{ order.lines.reduce((total, line) => total + line.quantity, 0) }}</span>
        <span class="sj-data">{{ currency(orderAmount(order)) }}</span>
        <span>{{ order.receiver }}</span>
        <span>{{ order.createdBy }}</span>
        <time>{{ order.createdAt }}</time>
        <span class="status" :class="order.status === '已出库' ? 'ready' : 'pending'">{{ order.status }}</span>
      </div>
    </section>

    <ElDrawer
      v-model="costDrawerVisible"
      append-to-body
      class="material-cost-drawer"
      direction="rtl"
      size="440px"
      :with-header="false"
    >
      <div v-if="editingMaterial" class="drawer-content sj-mission-control">
        <header>
          <div><small>MATERIAL COST</small><h2>{{ editingMaterial.id }}</h2></div>
          <button type="button" aria-label="关闭" @click="costDrawerVisible = false">×</button>
        </header>
        <div class="material-context">
          <strong>{{ editingMaterial.name }}</strong>
          <span>{{ editingMaterial.partNumber }} · {{ editingMaterial.location }}</span>
        </div>
        <label>库存数量<ElInputNumber v-model="editingMaterial.quantity" :min="0" controls-position="right" /></label>
        <label>成本价（CNY）<ElInputNumber v-model="editingMaterial.costPrice" :min="0" :precision="2" controls-position="right" /></label>
        <label>默认对外价格（CNY）<ElInputNumber v-model="editingMaterial.defaultSalePrice" :min="0" :precision="2" controls-position="right" /></label>
        <label>录入人<ElInput v-model="editingMaterial.enteredBy" /></label>
        <label>录入时间<ElInput v-model="editingMaterial.enteredAt" /></label>
        <div class="calculated-value"><span>当前库存成本</span><strong>{{ currency(editingMaterial.quantity * editingMaterial.costPrice) }}</strong></div>
        <ElButton type="primary" @click="saveMaterialCost">保存</ElButton>
      </div>
    </ElDrawer>

    <ElDrawer
      v-model="requisitionDrawerVisible"
      append-to-body
      class="material-cost-drawer requisition-drawer"
      direction="rtl"
      size="720px"
      :with-header="false"
    >
      <div class="drawer-content requisition-content sj-mission-control">
        <header>
          <div><small>MATERIAL REQUISITION</small><h2>创建航材领用单</h2></div>
          <button type="button" aria-label="关闭" @click="requisitionDrawerVisible = false">×</button>
        </header>
        <div class="order-grid">
          <label>领用单号<ElInput v-model="newRequisition.id" disabled /></label>
          <label>飞机注册号<ElInput v-model="newRequisition.aircraft" placeholder="如 B-9308" /></label>
          <label>领用人 / 部门<ElInput v-model="newRequisition.receiver" placeholder="输入领用人或维修组" /></label>
          <label>领用用途<ElInput v-model="newRequisition.purpose" placeholder="输入维修任务或使用原因" /></label>
        </div>
        <section class="line-editor">
          <header><strong>领用航材</strong><ElButton @click="addRequisitionLine">增加航材</ElButton></header>
          <div class="line-head"><span>航材</span><span>可用</span><span>数量</span><span>对外单价</span><span>对外小计</span><span></span></div>
          <div v-for="(line, index) in newRequisition.lines" :key="index" class="line-row">
            <ElSelect v-model="line.materialId" filterable @change="changeLineMaterial(line)">
              <ElOption
                v-for="material in materials"
                :key="material.id"
                :disabled="newRequisition.lines.some((current, currentIndex) => currentIndex !== index && current.materialId === material.id)"
                :label="`${material.id} · ${material.name}`"
                :value="material.id"
              />
            </ElSelect>
            <span class="sj-data">{{ getMaterial(line.materialId)?.quantity ?? 0 }}</span>
            <ElInputNumber v-model="line.quantity" :min="1" :max="getMaterial(line.materialId)?.quantity || 1" controls-position="right" />
            <ElInputNumber v-model="line.salePrice" :min="0" :precision="2" controls-position="right" />
            <strong class="sj-data">{{ currency(line.salePrice * line.quantity) }}</strong>
            <button type="button" aria-label="删除航材" @click="removeRequisitionLine(index)">删除</button>
          </div>
        </section>
        <section class="order-summary">
          <div><span>领用数量</span><strong>{{ requisitionTotals.quantity }}</strong></div>
          <div><span>成本合计</span><strong>{{ currency(requisitionTotals.cost) }}</strong></div>
          <div><span>对外金额</span><strong class="lime">{{ currency(requisitionTotals.sale) }}</strong></div>
          <div><span>价差</span><strong class="blue">{{ currency(requisitionTotals.sale - requisitionTotals.cost) }}</strong></div>
        </section>
        <ElButton type="primary" @click="saveRequisition">创建领用单</ElButton>
      </div>
    </ElDrawer>
  </main>
</template>

<style scoped>
.cost-page {
  min-height: 100%;
  padding: var(--sj-space-5);
  color: var(--sj-text-1);
  background: var(--sj-canvas);
  font-size: 13px;
}

.page-bar,
.metrics,
.command-bar,
.data-table {
  border: 1px solid var(--sj-border);
  background: var(--sj-surface-1);
}

.page-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sj-space-4) var(--sj-space-5);
}

.page-bar span,
.drawer-content header small {
  color: var(--sj-blue);
  font: 700 11px var(--sj-font-data);
  letter-spacing: 0.12em;
}

.page-bar h1,
.drawer-content h2 {
  margin: var(--sj-space-1) 0 0;
  font-size: 20px;
  line-height: 28px;
}

.page-bar :deep(.el-button--primary),
.drawer-content > :deep(.el-button--primary) {
  height: var(--sj-control-dense);
  border-color: var(--sj-lime);
  color: var(--sj-canvas);
  background: var(--sj-lime);
}

.metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin-top: var(--sj-space-3);
}

.metrics div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  padding: var(--sj-space-3) var(--sj-space-5);
  border-right: 1px solid var(--sj-border);
}

.metrics div:last-child {
  border-right: 0;
}

.metrics span,
.line-head {
  color: var(--sj-text-3);
  font-size: 11px;
}

.metrics b {
  font: 700 18px/28px var(--sj-font-data);
}

.blue {
  color: var(--sj-blue) !important;
}

.amber {
  color: var(--sj-amber) !important;
}

.lime {
  color: var(--sj-lime) !important;
}

.command-bar {
  display: flex;
  gap: var(--sj-space-4);
  align-items: center;
  justify-content: space-between;
  min-height: 54px;
  padding: var(--sj-space-2) var(--sj-space-3);
  margin-top: var(--sj-space-3);
}

.view-switch {
  display: flex;
  gap: var(--sj-space-1);
  padding: var(--sj-space-1);
  border: 1px solid var(--sj-border);
  border-radius: var(--sj-radius-control);
  background: var(--sj-surface-2);
}

.view-switch button {
  min-height: var(--sj-control-dense);
  padding: 0 var(--sj-space-4);
  border: 0;
  border-radius: var(--sj-radius-tag);
  color: var(--sj-text-2);
  background: transparent;
  cursor: pointer;
}

.view-switch button:hover,
.view-switch button.active {
  color: var(--sj-text-1);
  background: var(--sj-surface-3);
}

.view-switch button.active {
  box-shadow: inset 0 -2px 0 var(--sj-blue);
}

.view-switch em {
  margin-left: var(--sj-space-1);
  color: var(--sj-blue);
  font: 600 11px var(--sj-font-data);
  font-style: normal;
}

.filters {
  display: flex;
  gap: var(--sj-space-2);
}

.filters :deep(.el-input) {
  width: 340px;
}

.filters :deep(.el-select) {
  width: 150px;
}

.filters :deep(.el-input__wrapper),
.filters :deep(.el-select__wrapper),
.drawer-content :deep(.el-input__wrapper),
.drawer-content :deep(.el-select__wrapper),
.drawer-content :deep(.el-input-number) {
  min-height: var(--sj-control-dense);
  background: var(--sj-surface-3);
  box-shadow: inset 0 0 0 1px var(--sj-border);
}

.filters :deep(.el-input__inner),
.filters :deep(.el-select__selected-item),
.drawer-content :deep(.el-input__inner),
.drawer-content :deep(.el-select__selected-item),
.drawer-content :deep(.el-input-number__decrease),
.drawer-content :deep(.el-input-number__increase) {
  color: var(--sj-text-1);
}

.data-table {
  margin-top: var(--sj-space-3);
  overflow: auto;
}

.table-row {
  display: grid;
  gap: var(--sj-space-2);
  align-items: center;
  min-width: 1180px;
  min-height: 52px;
  padding: 0 var(--sj-space-4);
  border-bottom: 1px solid var(--sj-border);
}

.inventory-table .table-row {
  grid-template-columns: 112px minmax(180px, 1.2fr) 145px 56px 105px 116px 72px 138px 54px;
}

.requisition-table .table-row {
  grid-template-columns: 124px 140px minmax(250px, 1.4fr) 66px 105px 110px 70px 138px 72px;
}

.data-table > header {
  min-height: 38px;
  color: var(--sj-text-3);
  background: var(--sj-surface-2);
  font-size: 11px;
}

.data-row {
  color: var(--sj-text-2);
  transition: background var(--sj-duration-fast);
}

.data-row:hover {
  background: var(--sj-surface-3);
}

.material-name {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.material-name strong {
  overflow: hidden;
  color: var(--sj-text-1);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.material-name small {
  overflow: hidden;
  color: var(--sj-text-3);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.data-row time,
.line-summary {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.data-row > button,
.line-row > button {
  min-height: 30px;
  border: 1px solid var(--sj-border);
  border-radius: var(--sj-radius-tag);
  color: var(--sj-blue);
  background: transparent;
  cursor: pointer;
}

.data-row > button:hover {
  border-color: var(--sj-blue);
  background: var(--sj-blue-soft);
}

.status {
  width: max-content;
  padding: var(--sj-space-1) var(--sj-space-2);
  border-radius: var(--sj-radius-tag);
  font-size: 11px;
}

.status.ready {
  color: var(--sj-lime);
  background: var(--sj-lime-soft);
}

.status.pending {
  color: var(--sj-amber);
  background: var(--sj-amber-soft);
}

.empty-state {
  display: grid;
  min-height: 180px;
  place-items: center;
  color: var(--sj-text-3);
}

@media (max-width: 1024px) {
  .cost-page {
    padding: var(--sj-space-3);
  }

  .metrics {
    grid-template-columns: repeat(2, 1fr);
  }

  .metrics div:nth-child(2) {
    border-right: 0;
  }

  .command-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .filters :deep(.el-input) {
    width: min(100%, 340px);
  }
}
</style>

<style>
.material-cost-drawer .el-drawer__body {
  padding: 0;
  background: var(--sj-canvas);
}

.drawer-content {
  display: flex;
  gap: var(--sj-space-4);
  flex-direction: column;
  min-height: 100%;
  padding: var(--sj-space-5);
  color: var(--sj-text-1);
  background: var(--sj-canvas);
}

.drawer-content > header,
.line-editor > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.drawer-content > header > button {
  width: var(--sj-control-default);
  height: var(--sj-control-default);
  border: 1px solid var(--sj-border);
  border-radius: var(--sj-radius-control);
  color: var(--sj-text-2);
  background: transparent;
  font-size: 24px;
  cursor: pointer;
}

.drawer-content label {
  display: grid;
  gap: var(--sj-space-2);
  color: var(--sj-text-3);
  font-size: 12px;
}

.material-context,
.calculated-value {
  display: flex;
  justify-content: space-between;
  padding: var(--sj-space-3);
  border: 1px solid var(--sj-border);
  background: var(--sj-surface-2);
}

.material-context {
  flex-direction: column;
}

.material-context span,
.calculated-value span {
  color: var(--sj-text-3);
  font-size: 12px;
}

.calculated-value strong {
  color: var(--sj-blue);
  font-family: var(--sj-font-data);
}

.drawer-content > .el-button {
  align-self: stretch;
  margin-top: auto;
}

.order-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--sj-space-3);
}

.line-editor {
  border: 1px solid var(--sj-border);
  background: var(--sj-surface-1);
}

.line-editor > header {
  min-height: 48px;
  padding: 0 var(--sj-space-3);
  border-bottom: 1px solid var(--sj-border);
}

.line-editor > header .el-button {
  height: var(--sj-control-dense);
}

.line-head,
.line-row {
  display: grid;
  grid-template-columns: minmax(190px, 1fr) 44px 104px 128px 100px 46px;
  gap: var(--sj-space-2);
  align-items: center;
  padding: var(--sj-space-2) var(--sj-space-3);
}

.line-head {
  min-height: 34px;
  background: var(--sj-surface-2);
}

.line-row {
  border-top: 1px solid var(--sj-border);
}

.line-row:first-of-type {
  border-top: 0;
}

.line-row .el-select,
.line-row .el-input-number {
  width: 100%;
}

.line-row > button {
  color: var(--sj-red);
}

.line-row > button:hover {
  border-color: var(--sj-red);
  background: var(--sj-red-soft);
}

.order-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border: 1px solid var(--sj-border);
}

.order-summary div {
  display: flex;
  gap: var(--sj-space-1);
  flex-direction: column;
  padding: var(--sj-space-3);
  border-right: 1px solid var(--sj-border);
}

.order-summary div:last-child {
  border-right: 0;
}

.order-summary span {
  color: var(--sj-text-3);
  font-size: 11px;
}

.order-summary strong {
  font-family: var(--sj-font-data);
}

@media (max-width: 1024px) {
  .requisition-drawer {
    width: min(720px, 100%) !important;
  }

  .line-editor {
    overflow-x: auto;
  }

  .line-head,
  .line-row {
    min-width: 650px;
  }
}
</style>

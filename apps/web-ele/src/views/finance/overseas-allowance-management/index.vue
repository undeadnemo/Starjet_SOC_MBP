<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';

import {
  ElButton,
  ElDatePicker,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElOption,
  ElSelect,
} from 'element-plus';

defineOptions({ name: 'OverseasAllowanceManagement' });

type CrewCategory = '乘务员' | '飞行员' | '机务' | '其他';
type SettlementStatus = '待复核' | '已确认' | '有调整';

interface CrewAllowance {
  adjustment: number;
  base: string;
  category: CrewCategory;
  communicationDays: number;
  communicationStandard: number;
  currency: 'CNY' | 'EUR' | 'USD';
  domesticDays: number;
  duty: string;
  exchangeRate: number;
  name: string;
  overseasDays: number;
  positioningDays: number;
  standard: number;
  systemAmount: number;
}

interface FlightAllowance {
  aircraft: string;
  date: string;
  flightNo: string;
  id: string;
  region: 'A' | 'B' | 'C';
  route: string;
  rule: string;
  status: SettlementStatus;
  time: string;
  crew: CrewAllowance[];
}

const categoryOptions: CrewCategory[] = ['飞行员', '乘务员', '机务', '其他'];
const aircraftOptions = ['B-602M', 'B-9308', 'B-9811'];
const statusOptions: SettlementStatus[] = ['待复核', '有调整', '已确认'];
const dateRange = ref<[string, string]>(['2026-08-25', '2026-08-29']);
const categoryFilter = ref<'全部' | CrewCategory>('全部');
const aircraftFilter = ref('全部');
const nameFilter = ref('');
const flightFilter = ref('');
const statusFilter = ref<'全部' | SettlementStatus>('全部');
const expandedFlightId = ref('ALLOW-653');

const flights = reactive<FlightAllowance[]>([
  {
    aircraft: 'B-9308', date: '2026-08-25', flightNo: 'SJX651', id: 'ALLOW-651',
    region: 'B', route: 'ZSSS → ZBAA', rule: '境内外分段规则', status: '已确认', time: '0820Z–1040Z',
    crew: [
      { adjustment: 0, base: '上海', category: '飞行员', communicationDays: 0, communicationStandard: 0, currency: 'CNY', domesticDays: 1, duty: '责任机长', exchangeRate: 1, name: '张铭', overseasDays: 0, positioningDays: 0, standard: 600, systemAmount: 600 },
      { adjustment: 0, base: '上海', category: '飞行员', communicationDays: 0, communicationStandard: 0, currency: 'CNY', domesticDays: 1, duty: '副驾驶', exchangeRate: 1, name: '李睿', overseasDays: 0, positioningDays: 0, standard: 480, systemAmount: 480 },
      { adjustment: 0, base: '上海', category: '乘务员', communicationDays: 0, communicationStandard: 0, currency: 'CNY', domesticDays: 1, duty: '乘务员', exchangeRate: 1, name: '许静', overseasDays: 0, positioningDays: 0, standard: 360, systemAmount: 360 },
      { adjustment: 0, base: '上海', category: '机务', communicationDays: 0, communicationStandard: 0, currency: 'CNY', domesticDays: 1, duty: '随机机务', exchangeRate: 1, name: '赵楠', overseasDays: 0, positioningDays: 0, standard: 420, systemAmount: 420 },
    ],
  },
  {
    aircraft: 'B-9811', date: '2026-08-26', flightNo: 'SJX653', id: 'ALLOW-653',
    region: 'A', route: 'ZBAA → RJTT', rule: '境内外分段规则', status: '待复核', time: '0640Z–0940Z',
    crew: [
      { adjustment: 0, base: '上海', category: '飞行员', communicationDays: 1, communicationStandard: 120, currency: 'USD', domesticDays: 0, duty: '责任机长', exchangeRate: 7.18, name: '王晨', overseasDays: 1, positioningDays: 0, standard: 150, systemAmount: 270 },
      { adjustment: 0, base: '上海', category: '飞行员', communicationDays: 1, communicationStandard: 120, currency: 'USD', domesticDays: 0, duty: '副驾驶', exchangeRate: 7.18, name: '陈昊', overseasDays: 1, positioningDays: 0, standard: 130, systemAmount: 250 },
      { adjustment: 0, base: '上海', category: '乘务员', communicationDays: 1, communicationStandard: 120, currency: 'USD', domesticDays: 0, duty: '乘务长', exchangeRate: 7.18, name: '周宁', overseasDays: 1, positioningDays: 0, standard: 110, systemAmount: 230 },
      { adjustment: 0, base: '上海', category: '机务', communicationDays: 1, communicationStandard: 120, currency: 'USD', domesticDays: 0, duty: '随机机务', exchangeRate: 7.18, name: '韩川', overseasDays: 1, positioningDays: 0, standard: 115, systemAmount: 235 },
    ],
  },
  {
    aircraft: 'B-9811', date: '2026-08-27', flightNo: 'SJX655', id: 'ALLOW-655',
    region: 'A', route: 'RJTT → ZSPD', rule: '区域全天半天规则', status: '有调整', time: '1130Z–1420Z',
    crew: [
      { adjustment: 30, base: '上海', category: '飞行员', communicationDays: 1, communicationStandard: 120, currency: 'USD', domesticDays: 0, duty: '责任机长', exchangeRate: 7.18, name: '王晨', overseasDays: 0.5, positioningDays: 0, standard: 150, systemAmount: 195 },
      { adjustment: 0, base: '上海', category: '飞行员', communicationDays: 1, communicationStandard: 120, currency: 'USD', domesticDays: 0, duty: '副驾驶', exchangeRate: 7.18, name: '陈昊', overseasDays: 0.5, positioningDays: 0, standard: 130, systemAmount: 185 },
      { adjustment: -10, base: '上海', category: '乘务员', communicationDays: 1, communicationStandard: 120, currency: 'USD', domesticDays: 0, duty: '乘务长', exchangeRate: 7.18, name: '周宁', overseasDays: 0.5, positioningDays: 0, standard: 110, systemAmount: 175 },
    ],
  },
  {
    aircraft: 'B-602M', date: '2026-08-27', flightNo: 'SJX657', id: 'ALLOW-657',
    region: 'B', route: 'ZSPD → ZGSZ', rule: '统一日标准', status: '已确认', time: '1520Z–1800Z',
    crew: [
      { adjustment: 0, base: '北京', category: '飞行员', communicationDays: 0, communicationStandard: 0, currency: 'CNY', domesticDays: 0, duty: '责任机长', exchangeRate: 1, name: '张铭', overseasDays: 0, positioningDays: 1, standard: 600, systemAmount: 600 },
      { adjustment: 0, base: '北京', category: '乘务员', communicationDays: 0, communicationStandard: 0, currency: 'CNY', domesticDays: 0, duty: '置位', exchangeRate: 1, name: '许静', overseasDays: 0, positioningDays: 1, standard: 360, systemAmount: 360 },
    ],
  },
  {
    aircraft: 'B-602M', date: '2026-08-28', flightNo: 'SJX659', id: 'ALLOW-659',
    region: 'C', route: 'ZGSZ → VHHH', rule: '涉外航段规则', status: '待复核', time: '0310Z–0415Z',
    crew: [
      { adjustment: 0, base: '深圳', category: '飞行员', communicationDays: 1, communicationStandard: 120, currency: 'CNY', domesticDays: 0, duty: '责任机长', exchangeRate: 1, name: '林涛', overseasDays: 1, positioningDays: 0, standard: 980, systemAmount: 1100 },
      { adjustment: 0, base: '深圳', category: '飞行员', communicationDays: 1, communicationStandard: 120, currency: 'CNY', domesticDays: 0, duty: '副驾驶', exchangeRate: 1, name: '宋岩', overseasDays: 1, positioningDays: 0, standard: 820, systemAmount: 940 },
      { adjustment: 0, base: '深圳', category: '乘务员', communicationDays: 1, communicationStandard: 120, currency: 'CNY', domesticDays: 0, duty: '乘务员', exchangeRate: 1, name: '苏悦', overseasDays: 1, positioningDays: 0, standard: 680, systemAmount: 800 },
    ],
  },
  {
    aircraft: 'B-9308', date: '2026-08-29', flightNo: 'SJX661', id: 'ALLOW-661',
    region: 'C', route: 'VHHH → ZSPD', rule: '境内外分段规则', status: '已确认', time: '0910Z–1135Z',
    crew: [
      { adjustment: 0, base: '上海', category: '飞行员', communicationDays: 1, communicationStandard: 120, currency: 'CNY', domesticDays: 1, duty: '责任机长', exchangeRate: 1, name: '王晨', overseasDays: 1, positioningDays: 0, standard: 980, systemAmount: 1100 },
      { adjustment: 0, base: '上海', category: '乘务员', communicationDays: 1, communicationStandard: 120, currency: 'CNY', domesticDays: 1, duty: '乘务长', exchangeRate: 1, name: '周宁', overseasDays: 1, positioningDays: 0, standard: 680, systemAmount: 800 },
    ],
  },
]);

function payableAmount(item: CrewAllowance) {
  return (item.systemAmount + item.adjustment) * item.exchangeRate;
}

function flightTotal(flight: FlightAllowance) {
  return flight.crew.reduce((total, item) => total + payableAmount(item), 0);
}

function daySummary(flight: FlightAllowance) {
  const domestic = flight.crew.reduce((sum, item) => sum + item.domesticDays, 0);
  const overseas = flight.crew.reduce((sum, item) => sum + item.overseasDays, 0);
  const positioning = flight.crew.reduce((sum, item) => sum + item.positioningDays, 0);
  return `${domestic} / ${overseas} / ${positioning}`;
}

const filteredFlights = computed(() => flights.filter((flight) => {
  const [start, end] = dateRange.value;
  const inDate = (!start || flight.date >= start) && (!end || flight.date <= end);
  const inCategory = categoryFilter.value === '全部'
    || flight.crew.some((item) => item.category === categoryFilter.value);
  const inAircraft = aircraftFilter.value === '全部' || flight.aircraft === aircraftFilter.value;
  const inName = !nameFilter.value.trim()
    || flight.crew.some((item) => item.name.includes(nameFilter.value.trim()));
  const inFlight = !flightFilter.value.trim()
    || `${flight.flightNo}${flight.route}`.toLowerCase().includes(flightFilter.value.trim().toLowerCase());
  const inStatus = statusFilter.value === '全部' || flight.status === statusFilter.value;
  return inDate && inCategory && inAircraft && inName && inFlight && inStatus;
}));

const summary = computed(() => ({
  amount: filteredFlights.value.reduce((total, flight) => total + flightTotal(flight), 0),
  crewRecords: filteredFlights.value.reduce((total, flight) => total + flight.crew.length, 0),
  flights: filteredFlights.value.length,
  pending: filteredFlights.value.filter((flight) => flight.status !== '已确认').length,
}));

function resetFilters() {
  dateRange.value = ['2026-08-25', '2026-08-29'];
  categoryFilter.value = '全部';
  aircraftFilter.value = '全部';
  nameFilter.value = '';
  flightFilter.value = '';
  statusFilter.value = '全部';
}

function confirmFlight(flight: FlightAllowance) {
  flight.status = flight.crew.some((item) => item.adjustment !== 0) ? '有调整' : '已确认';
  ElMessage.success(`${flight.flightNo} 补贴明细已确认`);
}

function exportDetails() {
  ElMessage.success(`已生成 ${filteredFlights.value.length} 个航班的补贴明细`);
}
</script>

<template>
  <main class="allowance-page sj-mission-control" data-starjet-theme="mission-control-dark">
    <header class="page-command">
      <div>
        <span>CREW ALLOWANCE</span>
        <h1>驻外补贴管理</h1>
      </div>
      <div class="command-actions">
        <ElButton @click="exportDetails">导出明细</ElButton>
        <ElButton type="primary" @click="ElMessage.success('已同步至付款申请')">生成付款申请</ElButton>
      </div>
    </header>

    <section class="filter-panel" aria-label="驻外补贴筛选">
      <label class="date-filter"><span>飞行日期</span><ElDatePicker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" /></label>
      <label><span>机组类别</span><ElSelect v-model="categoryFilter"><ElOption label="全部类别" value="全部" /><ElOption v-for="category in categoryOptions" :key="category" :label="category" :value="category" /></ElSelect></label>
      <label><span>注册号</span><ElSelect v-model="aircraftFilter"><ElOption label="全部注册号" value="全部" /><ElOption v-for="aircraft in aircraftOptions" :key="aircraft" :label="aircraft" :value="aircraft" /></ElSelect></label>
      <label><span>姓名</span><ElInput v-model="nameFilter" clearable placeholder="输入姓名" /></label>
      <label><span>航班</span><ElInput v-model="flightFilter" clearable placeholder="航班号 / 航段" /></label>
      <label><span>核算状态</span><ElSelect v-model="statusFilter"><ElOption label="全部状态" value="全部" /><ElOption v-for="status in statusOptions" :key="status" :label="status" :value="status" /></ElSelect></label>
      <ElButton class="reset-button" @click="resetFilters">重置</ElButton>
    </section>

    <section class="summary-strip" aria-label="补贴汇总">
      <div><span>航班</span><strong>{{ summary.flights }}</strong></div>
      <div><span>人员核算记录</span><strong>{{ summary.crewRecords }}</strong></div>
      <div><span>折合人民币</span><strong class="amount">¥ {{ summary.amount.toLocaleString('zh-CN', { maximumFractionDigits: 0 }) }}</strong></div>
      <div><span>待复核 / 有调整</span><strong :class="{ warning: summary.pending > 0 }">{{ summary.pending }}</strong></div>
    </section>

    <section class="allowance-table" aria-label="按航班汇总的驻外补贴">
      <header class="flight-row table-head">
        <span></span><span>飞行日期</span><span>航班 / 注册号</span><span>航段 / 时间</span><span>规则</span><span>境内 / 境外 / 置位人天</span><span>人员</span><span>应发合计</span><span>状态</span>
      </header>
      <template v-for="flight in filteredFlights" :key="flight.id">
        <button class="flight-row flight-summary" type="button" :aria-expanded="expandedFlightId === flight.id" @click="expandedFlightId = expandedFlightId === flight.id ? '' : flight.id">
          <b>{{ expandedFlightId === flight.id ? '−' : '+' }}</b>
          <time>{{ flight.date }}</time>
          <span><strong>{{ flight.flightNo }}</strong><small>{{ flight.aircraft }}</small></span>
          <span><strong class="route">{{ flight.route }}</strong><small>{{ flight.time }} · {{ flight.region }} 区</small></span>
          <span>{{ flight.rule }}</span>
          <span class="days">{{ daySummary(flight) }}</span>
          <span>{{ flight.crew.length }} 人</span>
          <strong class="total">¥ {{ flightTotal(flight).toLocaleString('zh-CN', { maximumFractionDigits: 0 }) }}</strong>
          <i class="status-tag" :class="flight.status === '已确认' ? 'confirmed' : flight.status === '有调整' ? 'adjusted' : 'pending'">{{ flight.status }}</i>
        </button>

        <div v-if="expandedFlightId === flight.id" class="flight-detail">
          <header>
            <div><span>{{ flight.flightNo }} 补贴明细</span><small>金额可按人员调整，最终金额按当月汇率折算为人民币</small></div>
            <ElButton type="primary" @click="confirmFlight(flight)">确认本航班</ElButton>
          </header>
          <div class="crew-table-wrap">
            <div class="crew-table crew-head">
              <span>姓名 / 类别</span><span>职责 / 驻地</span><span>境内天</span><span>境外天</span><span>置位天</span><span>通讯天</span><span>标准 / 币种</span><span>汇率</span><span>系统金额</span><span>调整额</span><span>折合应发</span>
            </div>
            <div v-for="person in flight.crew" :key="`${flight.id}-${person.name}`" class="crew-table crew-row">
              <span><strong>{{ person.name }}</strong><small>{{ person.category }}</small></span>
              <span><strong>{{ person.duty }}</strong><small>驻地 {{ person.base }}</small></span>
              <span class="data">{{ person.domesticDays }}</span>
              <span class="data">{{ person.overseasDays }}</span>
              <span class="data">{{ person.positioningDays }}</span>
              <span class="data">{{ person.communicationDays }}</span>
              <span><strong>{{ person.standard }}</strong><small>{{ person.currency }} · 通讯 {{ person.communicationStandard }}</small></span>
              <span class="data">{{ person.exchangeRate.toFixed(2) }}</span>
              <span class="data">{{ person.systemAmount.toFixed(2) }}</span>
              <ElInputNumber v-model="person.adjustment" :controls="false" :precision="2" aria-label="人工调整金额" />
              <strong class="payable">¥ {{ payableAmount(person).toLocaleString('zh-CN', { maximumFractionDigits: 2 }) }}</strong>
            </div>
          </div>
        </div>
      </template>
      <div v-if="!filteredFlights.length" class="empty-state">当前筛选条件下没有驻外补贴记录</div>
    </section>
  </main>
</template>

<style scoped>
.allowance-page{min-height:100%;padding:var(--sj-space-5);color:var(--sj-text-1);background:var(--sj-canvas);font-size:12px}.page-command,.filter-panel,.summary-strip,.allowance-table{border:1px solid var(--sj-border);background:var(--sj-surface-1)}.page-command{display:flex;min-height:64px;padding:var(--sj-space-3) var(--sj-space-4);align-items:center;justify-content:space-between;gap:var(--sj-space-4)}.page-command span{color:var(--sj-blue);font:700 9px var(--sj-font-data);letter-spacing:.12em}.page-command h1{margin:var(--sj-space-1) 0 0;font-size:20px;line-height:1.2}.command-actions{display:flex;gap:var(--sj-space-2)}.page-command :deep(.el-button){height:var(--sj-control-dense);font-size:11px}.page-command :deep(.el-button--primary),.flight-detail :deep(.el-button--primary){border-color:var(--sj-lime);color:var(--sj-canvas);background:var(--sj-lime)}
.filter-panel{display:flex;margin-top:var(--sj-space-3);padding:var(--sj-space-3);align-items:flex-end;gap:var(--sj-space-2);flex-wrap:wrap}.filter-panel label{display:grid;width:150px;gap:var(--sj-space-1)}.filter-panel label>span{color:var(--sj-text-3);font-size:10px}.filter-panel .date-filter{width:260px}.filter-panel :deep(.el-input__wrapper),.filter-panel :deep(.el-select__wrapper),.flight-detail :deep(.el-input__wrapper){min-height:var(--sj-control-dense);background:var(--sj-surface-3);box-shadow:0 0 0 1px var(--sj-border) inset}.filter-panel :deep(.el-input__inner),.filter-panel :deep(.el-select__selected-item),.flight-detail :deep(.el-input__inner){color:var(--sj-text-1);font-size:11px}.filter-panel :deep(.el-date-editor){width:100%}.reset-button{height:var(--sj-control-dense)}
.summary-strip{display:grid;margin-top:var(--sj-space-3);grid-template-columns:repeat(4,minmax(0,1fr))}.summary-strip>div{display:flex;min-height:56px;padding:var(--sj-space-3) var(--sj-space-4);align-items:center;justify-content:space-between;border-right:1px solid var(--sj-border)}.summary-strip>div:last-child{border-right:0}.summary-strip span{color:var(--sj-text-3);font-size:11px}.summary-strip strong{font:800 19px var(--sj-font-data)}.summary-strip .amount{color:var(--sj-lime)}.summary-strip .warning{color:var(--sj-amber)}
.allowance-table{margin-top:var(--sj-space-3);overflow:hidden}.flight-row{display:grid;grid-template-columns:32px 92px 118px minmax(180px,1.2fr) minmax(128px,.8fr) 156px 54px 110px 74px;width:100%;min-width:1050px;align-items:center;gap:var(--sj-space-2);padding:0 var(--sj-space-3);border:0;border-bottom:1px solid var(--sj-border);text-align:left}.table-head{min-height:36px;color:var(--sj-text-3);font-size:10px;background:var(--sj-surface-2)}.flight-summary{min-height:54px;color:var(--sj-text-2);background:transparent;cursor:pointer}.flight-summary:hover,.flight-summary:focus-visible{background:var(--sj-surface-3)}.flight-summary>b{color:var(--sj-blue);font:700 16px var(--sj-font-data)}.flight-summary>span{display:grid;min-width:0;gap:var(--sj-space-1)}.flight-summary strong,.flight-summary time{color:var(--sj-text-1);font-family:var(--sj-font-data)}.flight-summary small{color:var(--sj-text-3);font-size:9px}.flight-summary .route{color:var(--sj-blue)}.flight-summary .days{font-family:var(--sj-font-data)}.flight-summary .total{color:var(--sj-lime);font-size:12px}.status-tag{display:inline-flex;width:max-content;min-height:20px;padding:0 var(--sj-space-2);align-items:center;border-radius:var(--sj-radius-tag);font-size:9px;font-style:normal}.status-tag.confirmed{color:var(--sj-lime);background:var(--sj-lime-soft)}.status-tag.pending{color:var(--sj-amber);background:var(--sj-amber-soft)}.status-tag.adjusted{color:var(--sj-blue);background:var(--sj-blue-soft)}
.flight-detail{padding:var(--sj-space-3) var(--sj-space-4) var(--sj-space-4) 52px;border-bottom:1px solid var(--sj-border);background:var(--sj-surface-2)}.flight-detail>header{display:flex;margin-bottom:var(--sj-space-3);align-items:center;justify-content:space-between;gap:var(--sj-space-4)}.flight-detail>header>div{display:grid;gap:var(--sj-space-1)}.flight-detail>header span{color:var(--sj-text-1);font-weight:700}.flight-detail>header small{color:var(--sj-text-3)}.flight-detail :deep(.el-button){height:var(--sj-control-dense);font-size:10px}.crew-table-wrap{overflow-x:auto;border:1px solid var(--sj-border);background:var(--sj-surface-1)}.crew-table{display:grid;min-width:1120px;grid-template-columns:110px 120px repeat(4,62px) 112px 62px 84px 104px 104px;align-items:center;gap:var(--sj-space-2);padding:0 var(--sj-space-3)}.crew-head{min-height:32px;color:var(--sj-text-3);font-size:9px;background:var(--sj-surface-3)}.crew-row{min-height:48px;border-top:1px solid var(--sj-border)}.crew-row>span{display:grid;gap:2px}.crew-row strong{color:var(--sj-text-1)}.crew-row small{color:var(--sj-text-3);font-size:9px}.crew-row .data{display:block;color:var(--sj-text-2);font-family:var(--sj-font-data)}.crew-row .payable{color:var(--sj-lime);font-family:var(--sj-font-data)}.crew-row :deep(.el-input-number){width:100%}.empty-state{display:grid;min-height:180px;place-items:center;color:var(--sj-text-3)}
@media(max-width:1280px){.allowance-page{padding:var(--sj-space-3)}.filter-panel label{width:140px}.filter-panel .date-filter{width:240px}.flight-detail{padding-left:var(--sj-space-4)}}
@media(max-width:1024px){.summary-strip{grid-template-columns:repeat(2,minmax(0,1fr))}.summary-strip>div:nth-child(2){border-right:0}.summary-strip>div:nth-child(-n+2){border-bottom:1px solid var(--sj-border)}.allowance-table{overflow-x:auto}.page-command{align-items:flex-start}.command-actions{flex-wrap:wrap;justify-content:flex-end}}
</style>

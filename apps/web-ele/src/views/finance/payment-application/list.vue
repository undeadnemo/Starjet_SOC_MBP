<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { createIconifyIcon } from '@vben/icons';

defineOptions({ name: 'PaymentApplicationList' });

const FileIcon = createIconifyIcon('lucide:paperclip');
const PlusIcon = createIconifyIcon('lucide:plus');
const SearchIcon = createIconifyIcon('lucide:search');

type PaymentState = 'approved' | 'draft' | 'paying' | 'pending' | 'rejected';

interface PaymentRecord {
  amount: number;
  applicant: string;
  applicationDate: string;
  currency: string;
  department: string;
  id: string;
  payee: string;
  state: PaymentState;
  stateLabel: string;
  title: string;
  updatedAt: string;
}

const route = useRoute();
const router = useRouter();
const keyword = ref('');
const stateFilter = ref<'all' | PaymentState>('all');
const departmentFilter = ref('全部部门');
const startDate = ref('2026-08-01');
const endDate = ref('2026-08-31');

const records: PaymentRecord[] = [
  { id: 'FK-20260824-001', title: 'Jeppesen 数据库和航图年费', payee: 'BOEING DIGITAL SOLUTIONS, INC.', amount: 37404, currency: 'USD', applicant: '张园', department: '运行控制部', applicationDate: '2026-08-24', state: 'pending', stateLabel: '审批中', updatedAt: '2026-08-24 14:32' },
  { id: 'FK-20260823-006', title: 'B-602M 广州地面保障费用', payee: '广州白云国际机场商旅服务有限公司', amount: 28600, currency: 'CNY', applicant: '李悦', department: '运行控制部', applicationDate: '2026-08-23', state: 'approved', stateLabel: '已批准', updatedAt: '2026-08-24 11:08' },
  { id: 'FK-20260822-004', title: '新加坡航段航油结算', payee: 'WFS Fuel Services', amount: 18520, currency: 'USD', applicant: '王晨', department: '航务部', applicationDate: '2026-08-22', state: 'paying', stateLabel: '付款中', updatedAt: '2026-08-24 09:45' },
  { id: 'FK-20260821-009', title: '机组东京住宿费用', payee: 'HANEDA EXCEL HOTEL TOKYU', amount: 168000, currency: 'JPY', applicant: '周宁', department: '客舱部', applicationDate: '2026-08-21', state: 'draft', stateLabel: '草稿', updatedAt: '2026-08-23 17:20' },
  { id: 'FK-20260820-003', title: 'B-9308 定检航材采购', payee: 'Gulfstream Aerospace', amount: 12800, currency: 'USD', applicant: '陈昊', department: '维修工程部', applicationDate: '2026-08-20', state: 'rejected', stateLabel: '已退回', updatedAt: '2026-08-22 16:12' },
  { id: 'FK-20260818-007', title: '香港航段落地服务费用', payee: 'Hong Kong Business Aviation Centre', amount: 46200, currency: 'HKD', applicant: '许安', department: '运行控制部', applicationDate: '2026-08-18', state: 'approved', stateLabel: '已批准', updatedAt: '2026-08-21 10:02' },
];

const filteredRecords = computed(() => records.filter((item) => {
  const text = keyword.value.trim().toLowerCase();
  return (!text || `${item.id}${item.title}${item.payee}${item.applicant}`.toLowerCase().includes(text))
    && (stateFilter.value === 'all' || item.state === stateFilter.value)
    && (departmentFilter.value === '全部部门' || item.department === departmentFilter.value)
    && item.applicationDate >= startDate.value
    && item.applicationDate <= endDate.value;
}));

const summary = computed(() => ({
  total: records.length,
  pending: records.filter((item) => item.state === 'pending').length,
  paying: records.filter((item) => item.state === 'paying').length,
  approved: records.filter((item) => item.state === 'approved').length,
}));

function createPayment() {
  const name = route.path.startsWith('/demo/')
    ? 'PaymentApplicationCreateDemo'
    : route.path.startsWith('/preview/')
      ? 'PaymentApplicationCreatePreview'
      : 'PaymentApplicationCreate';
  void router.push({ name });
}

function resetFilters() {
  keyword.value = '';
  stateFilter.value = 'all';
  departmentFilter.value = '全部部门';
  startDate.value = '2026-08-01';
  endDate.value = '2026-08-31';
}
</script>

<template>
  <main class="payment-list-page sj-mission-control" data-starjet-theme="mission-control-dark">
    <header class="list-header">
      <div><p>财务管理</p><h1>付款申请</h1></div>
      <button class="primary-button" type="button" @click="createPayment"><PlusIcon />新建付款申请</button>
    </header>

    <section class="summary-strip" aria-label="付款申请统计">
      <div><span>全部申请</span><strong>{{ summary.total }}</strong></div>
      <div><span class="status-dot pending"></span><span>审批中</span><strong>{{ summary.pending }}</strong></div>
      <div><span class="status-dot paying"></span><span>付款中</span><strong>{{ summary.paying }}</strong></div>
      <div><span class="status-dot approved"></span><span>已批准</span><strong>{{ summary.approved }}</strong></div>
    </section>

    <section class="filter-bar">
      <label class="search-field"><span>搜索</span><div><SearchIcon /><input v-model="keyword" placeholder="编号、标题、收款方或申请人" /></div></label>
      <label><span>状态</span><select v-model="stateFilter"><option value="all">全部状态</option><option value="draft">草稿</option><option value="pending">审批中</option><option value="approved">已批准</option><option value="paying">付款中</option><option value="rejected">已退回</option></select></label>
      <label><span>申请部门</span><select v-model="departmentFilter"><option>全部部门</option><option>运行控制部</option><option>航务部</option><option>客舱部</option><option>维修工程部</option></select></label>
      <label><span>开始日期</span><input v-model="startDate" type="date" /></label>
      <label><span>结束日期</span><input v-model="endDate" type="date" /></label>
      <button class="secondary-button" type="button" @click="resetFilters">重置</button>
    </section>

    <section class="table-panel">
      <header><h2>申请记录</h2><span>当前 {{ filteredRecords.length }} 条</span></header>
      <div class="table-wrap">
        <table>
          <thead><tr><th>申请编号</th><th>标题</th><th>收款方</th><th>金额</th><th>申请人 / 部门</th><th>申请日期</th><th>状态</th><th>更新时间</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="item in filteredRecords" :key="item.id">
              <td><button class="record-link" type="button">{{ item.id }}</button></td>
              <td><strong>{{ item.title }}</strong></td>
              <td>{{ item.payee }}</td>
              <td class="money">{{ item.currency }} {{ item.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}</td>
              <td><span class="person">{{ item.applicant }}</span><small>{{ item.department }}</small></td>
              <td class="data-text">{{ item.applicationDate }}</td>
              <td><span class="state-tag" :class="item.state"><i></i>{{ item.stateLabel }}</span></td>
              <td class="data-text">{{ item.updatedAt }}</td>
              <td><button class="view-button" type="button">查看</button></td>
            </tr>
            <tr v-if="filteredRecords.length === 0"><td class="empty-row" colspan="9">没有符合筛选条件的付款申请</td></tr>
          </tbody>
        </table>
      </div>
      <footer><span><FileIcon />支持按申请编号追踪审批和付款进度</span><span>共 {{ filteredRecords.length }} 条</span></footer>
    </section>
  </main>
</template>

<style scoped>
@import '../../../styles/starjet-mission-control-dark.css';

.payment-list-page { min-height: 100%; padding: var(--sj-space-6); }
.list-header { display: flex; align-items: center; justify-content: space-between; gap: var(--sj-space-4); padding-bottom: var(--sj-space-5); border-bottom: 1px solid var(--sj-border); }
.list-header p { margin: 0 0 var(--sj-space-2); color: var(--sj-blue); font: 700 12px/1 var(--sj-font-data); letter-spacing: .12em; }
h1, h2 { margin: 0; }
h1 { font-size: 26px; }
h2 { font-size: 16px; }
.primary-button, .secondary-button, .view-button { display: inline-flex; align-items: center; justify-content: center; gap: var(--sj-space-2); border-radius: var(--sj-radius-control); font-weight: 700; cursor: pointer; }
.primary-button { min-height: var(--sj-control-primary); padding: 0 var(--sj-space-5); border: 1px solid var(--sj-lime); color: var(--sj-canvas); background: var(--sj-lime); }
.secondary-button { min-height: var(--sj-control-default); padding: 0 var(--sj-space-4); border: 1px solid var(--sj-border-strong); color: var(--sj-text-1); background: var(--sj-surface-2); }
.summary-strip { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-top: var(--sj-space-4); border: 1px solid var(--sj-border); border-radius: var(--sj-radius-panel); background: var(--sj-surface-1); }
.summary-strip > div { display: flex; align-items: center; gap: var(--sj-space-2); padding: var(--sj-space-4); }
.summary-strip > div + div { border-left: 1px solid var(--sj-border); }
.summary-strip span { color: var(--sj-text-3); }
.summary-strip strong { margin-left: auto; font: 700 22px/1 var(--sj-font-data); }
.status-dot, .state-tag i { width: var(--sj-space-2); height: var(--sj-space-2); border-radius: 50%; }
.status-dot.pending, .state-tag.pending i, .state-tag.draft i { background: var(--sj-amber); }
.status-dot.paying, .state-tag.paying i { background: var(--sj-blue); }
.status-dot.approved, .state-tag.approved i { background: var(--sj-lime); }
.state-tag.rejected i { background: var(--sj-red); }
.filter-bar { display: grid; grid-template-columns: minmax(240px, 1.4fr) repeat(4, minmax(150px, .8fr)) auto; align-items: end; gap: var(--sj-space-3); margin-top: var(--sj-space-4); padding: var(--sj-space-4); border: 1px solid var(--sj-border); border-radius: var(--sj-radius-panel); background: var(--sj-surface-1); }
.filter-bar label { display: flex; min-width: 0; flex-direction: column; gap: var(--sj-space-2); color: var(--sj-text-3); font-size: 12px; }
input, select { width: 100%; min-width: 0; height: var(--sj-control-default); padding: 0 var(--sj-space-3); border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); color: var(--sj-text-1); background: var(--sj-surface-2); font: inherit; }
.search-field > div { position: relative; }
.search-field svg { position: absolute; top: 50%; left: var(--sj-space-3); width: var(--sj-space-4); color: var(--sj-text-3); transform: translateY(-50%); }
.search-field input { padding-left: var(--sj-space-8); }
.table-panel { margin-top: var(--sj-space-4); overflow: hidden; border: 1px solid var(--sj-border); border-radius: var(--sj-radius-panel); background: var(--sj-surface-1); }
.table-panel > header, .table-panel > footer { display: flex; align-items: center; justify-content: space-between; gap: var(--sj-space-3); padding: var(--sj-space-4); }
.table-panel > header { border-bottom: 1px solid var(--sj-border); }
.table-panel > header span, .table-panel > footer { color: var(--sj-text-3); font-size: 12px; }
.table-panel > footer { border-top: 1px solid var(--sj-border); }
.table-panel > footer span { display: flex; align-items: center; gap: var(--sj-space-2); }
.table-wrap { overflow: auto; }
table { width: 100%; min-width: 1280px; border-collapse: collapse; }
th, td { padding: var(--sj-space-3) var(--sj-space-4); border-bottom: 1px solid var(--sj-border); text-align: left; }
th { color: var(--sj-text-3); background: var(--sj-surface-2); font-size: 11px; }
td { color: var(--sj-text-2); }
tbody tr:hover { background: var(--sj-blue-soft); }
td strong { color: var(--sj-text-1); }
.record-link, .view-button { border: 0; color: var(--sj-blue); background: transparent; cursor: pointer; }
.record-link { padding: 0; font: 700 13px/1 var(--sj-font-data); }
.view-button { min-height: var(--sj-control-dense); padding: 0 var(--sj-space-2); }
.money, .data-text { white-space: nowrap; font-family: var(--sj-font-data); }
.money { color: var(--sj-text-1); font-weight: 700; }
.person { display: block; color: var(--sj-text-1); }
td small { display: block; margin-top: var(--sj-space-1); color: var(--sj-text-3); }
.state-tag { display: inline-flex; align-items: center; gap: var(--sj-space-2); padding: var(--sj-space-1) var(--sj-space-2); border-radius: var(--sj-radius-tag); background: var(--sj-surface-3); white-space: nowrap; font-size: 12px; font-weight: 700; }
.state-tag.approved { color: var(--sj-lime); background: var(--sj-lime-soft); }
.state-tag.pending, .state-tag.draft { color: var(--sj-amber); background: var(--sj-amber-soft); }
.state-tag.paying { color: var(--sj-blue); background: var(--sj-blue-soft); }
.state-tag.rejected { color: var(--sj-red); background: var(--sj-red-soft); }
.empty-row { padding: var(--sj-space-8); color: var(--sj-text-3); text-align: center; }

@media (max-width: 1280px) {
  .filter-bar { grid-template-columns: repeat(3, minmax(180px, 1fr)); }
}
@media (max-width: 1024px) {
  .payment-list-page { padding: var(--sj-space-4); }
  .filter-bar { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .summary-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .summary-strip > div:nth-child(3) { border-top: 1px solid var(--sj-border); border-left: 0; }
  .summary-strip > div:nth-child(4) { border-top: 1px solid var(--sj-border); }
}
</style>

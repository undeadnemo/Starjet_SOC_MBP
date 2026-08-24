<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { createIconifyIcon } from '@vben/icons';

defineOptions({ name: 'TripManagement' });

const PlusIcon = createIconifyIcon('lucide:plus');
const route = useRoute();
const router = useRouter();

type TripState = 'blocked' | 'pending' | 'ready';

interface TripRecord {
  applicant: string;
  company: string;
  customer: string;
  endDate: string;
  group: string;
  id: string;
  imported: boolean;
  model: string;
  routeSummary: string;
  sales: string;
  startDate: string;
  state: TripState;
  stateLabel: string;
  tailNumber: string;
  updatedAt: string;
}

const applicantFilter = ref('');
const companyFilter = ref('全部公司');
const customerFilter = ref('');
const endDateFilter = ref('');
const startDateFilter = ref('');
const startDateInput = ref<HTMLInputElement>();
const endDateInput = ref<HTMLInputElement>();
const stateFilter = ref<'all' | TripState>('all');
const tailFilter = ref('');
const tripNumberFilter = ref('');

const trips: TripRecord[] = [
  { applicant: '张园', company: 'SJ', customer: '星海资本', endDate: '2026/08/22', group: 'VIP', id: 'SJ260820', imported: false, model: 'G650ER', routeSummary: 'ZBAA → RJTT → WSSS → ZBAA', sales: '张园', startDate: '2026/08/20', state: 'pending', stateLabel: '待确认', tailNumber: 'B-9811', updatedAt: '2026/08/22 10:32' },
  { applicant: '李悦', company: 'SJ', customer: '远航科技', endDate: '2026/08/22', group: 'B', id: 'SJ260821', imported: false, model: 'G450', routeSummary: 'ZSPD → ZGGG → ZSPD', sales: '李悦', startDate: '2026/08/21', state: 'ready', stateLabel: '已确认', tailNumber: 'B-9308', updatedAt: '2026/08/22 09:18' },
  { applicant: '王晨', company: 'SJ', customer: '内部调机', endDate: '2026/08/22', group: 'OPS', id: 'SJ260822', imported: true, model: 'Legacy 650', routeSummary: 'ZBAA → ZSPD → ZUUU', sales: '运控中心', startDate: '2026/08/22', state: 'pending', stateLabel: '协调中', tailNumber: 'B-602M', updatedAt: '2026/08/22 08:46' },
  { applicant: '周宁', company: 'SJ', customer: '拓远实业', endDate: '2026/08/26', group: 'B', id: 'SJ260823', imported: false, model: 'G650ER', routeSummary: 'ZSPD → VHHH → VTBS → ZSPD', sales: '周宁', startDate: '2026/08/23', state: 'blocked', stateLabel: '资料受阻', tailNumber: 'B-801Q', updatedAt: '2026/08/21 17:59' },
  { applicant: '陈昊', company: 'SJ', customer: '海岳集团', endDate: '2026/08/29', group: 'VIP', id: 'SJ260824', imported: true, model: 'CL605', routeSummary: 'ZSSS → ZYCC → ZSSS', sales: '陈昊', startDate: '2026/08/24', state: 'ready', stateLabel: '已确认', tailNumber: 'B-3266', updatedAt: '2026/08/21 15:26' },
  { applicant: '许安', company: 'SJ', customer: '北辰投资', endDate: '2026/08/27', group: 'B', id: 'SJ260825', imported: false, model: 'Gulfstream G550', routeSummary: 'ZLIC → ZLZW → ZSAM → ZLIC', sales: '许安', startDate: '2026/08/22', state: 'pending', stateLabel: '待确认', tailNumber: 'B-7715', updatedAt: '2026/08/21 11:23' },
  { applicant: '沈乔', company: 'SJ', customer: '云际咨询', endDate: '2026/08/25', group: 'B', id: 'SJ260826', imported: false, model: 'G450', routeSummary: 'ZSPD → ZGSZ → ZSPD', sales: '沈乔', startDate: '2026/08/24', state: 'ready', stateLabel: '已确认', tailNumber: 'B-9308', updatedAt: '2026/08/20 16:07' },
];

const normalize = (value: string) => value.trim().toLowerCase();

const filteredTrips = computed(() => {
  return trips.filter((trip) => {
    if (companyFilter.value !== '全部公司' && trip.company !== companyFilter.value) return false;
    if (stateFilter.value !== 'all' && trip.state !== stateFilter.value) return false;
    if (tailFilter.value && !normalize(trip.tailNumber).includes(normalize(tailFilter.value))) return false;
    if (tripNumberFilter.value && !normalize(trip.id).includes(normalize(tripNumberFilter.value))) return false;
    if (customerFilter.value && !normalize(trip.customer).includes(normalize(customerFilter.value))) return false;
    if (applicantFilter.value && !normalize(trip.applicant).includes(normalize(applicantFilter.value))) return false;
    if (startDateFilter.value && trip.startDate.replaceAll('/', '-') < startDateFilter.value) return false;
    if (endDateFilter.value && trip.endDate.replaceAll('/', '-') > endDateFilter.value) return false;
    return true;
  });
});

function resetFilters() {
  applicantFilter.value = '';
  companyFilter.value = '全部公司';
  customerFilter.value = '';
  endDateFilter.value = '';
  startDateFilter.value = '';
  stateFilter.value = 'all';
  tailFilter.value = '';
  tripNumberFilter.value = '';
}

function openDatePicker(input?: HTMLInputElement) {
  if (!input) return;
  try {
    input.showPicker?.();
  } catch {
    input.focus();
  }
}

function openTrip(trip: TripRecord) {
  const name = route.path.startsWith('/demo/')
    ? 'TripDetailDemo'
    : route.path.startsWith('/preview/')
      ? 'TripDetailPreview'
      : 'TripDetail';
  void router.push({
    name,
    params: { tripId: trip.id },
    query: {
      applicant: trip.applicant,
      customer: trip.customer,
      endDate: trip.endDate,
      model: trip.model,
      routeSummary: trip.routeSummary,
      sales: trip.sales,
      startDate: trip.startDate,
      state: trip.state,
      stateLabel: trip.stateLabel,
      tailNumber: trip.tailNumber,
      updatedAt: trip.updatedAt,
    },
  });
}
</script>

<template>
  <main class="trip-page sj-mission-control">
    <section class="filter-panel">
      <div class="filter-grid">
        <label><span>公司</span><select v-model="companyFilter"><option>全部公司</option><option>SJ</option></select></label>
        <label><span>状态</span><select v-model="stateFilter"><option value="all">全部状态</option><option value="pending">待确认</option><option value="ready">已确认</option><option value="blocked">受阻</option></select></label>
        <label><span>机号</span><input v-model="tailFilter" placeholder="如 B-9811" /></label>
        <label><span>编号</span><input v-model="tripNumberFilter" placeholder="行程编号" /></label>
        <div class="date-filter"><span>飞行日期</span><input ref="startDateInput" v-model="startDateFilter" aria-label="开始日期" type="date" @click="openDatePicker(startDateInput)" /><i>至</i><input ref="endDateInput" v-model="endDateFilter" aria-label="结束日期" type="date" @click="openDatePicker(endDateInput)" /></div>
        <label><span>客户</span><input v-model="customerFilter" placeholder="客户名称" /></label>
        <label><span>申请人</span><input v-model="applicantFilter" placeholder="申请人" /></label>
        <div class="filter-actions">
          <button class="secondary-action" type="button" @click="resetFilters">重置</button>
          <button class="primary-action" type="button"><PlusIcon />增加行程</button>
        </div>
      </div>
    </section>

    <section class="list-panel">
      <div class="table-scroll">
        <table>
          <thead><tr><th>编号</th><th>客户</th><th>开始日期</th><th>结束日期</th><th>机号</th><th>机型</th><th>行程概要</th><th>状态</th><th>申请人</th><th>更新时间</th></tr></thead>
          <tbody>
            <tr v-for="trip in filteredTrips" :key="trip.id" tabindex="0" @click="openTrip(trip)" @keydown.enter="openTrip(trip)">
              <td><button class="trip-link" type="button" @click.stop="openTrip(trip)">{{ trip.id }}</button></td>
              <td>{{ trip.customer }}</td>
              <td class="sj-data">{{ trip.startDate }}</td><td class="sj-data">{{ trip.endDate }}</td><td class="sj-data tail">{{ trip.tailNumber }}</td><td>{{ trip.model }}</td>
              <td class="route-summary" :title="trip.routeSummary">{{ trip.routeSummary }}</td>
              <td><span :class="['state', trip.state]"><i></i>{{ trip.stateLabel }}</span></td>
              <td><span class="applicant"><b>{{ trip.applicant.slice(0, 1) }}</b>{{ trip.applicant }}</span></td>
              <td class="sj-data updated">{{ trip.updatedAt }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="!filteredTrips.length" class="empty-state">没有符合当前筛选条件的行程</div>
      </div>

      <footer class="table-footer">
        <span>显示 1 至 {{ filteredTrips.length }} 条，共 {{ filteredTrips.length }} 条</span>
        <nav aria-label="分页"><button disabled type="button">上一页</button><button class="current" type="button">1</button><button disabled type="button">下一页</button></nav>
      </footer>
    </section>
  </main>
</template>

<style scoped>
.trip-page { box-sizing: border-box; display: flex; height: var(--vben-content-height, 100%); min-height: 0; padding: var(--sj-space-5); overflow: hidden; flex-direction: column; }
button, input, select { font: inherit; }
.secondary-action, .primary-action { display: inline-flex; min-height: var(--sj-control-default); align-items: center; justify-content: center; gap: var(--sj-space-2); padding: 0 var(--sj-space-5); border-radius: var(--sj-radius-control); font-weight: 700; cursor: pointer; }.secondary-action { border: 1px solid var(--sj-border-strong); color: var(--sj-text-1); background: var(--sj-surface-3); }.primary-action { border: 1px solid var(--sj-lime); color: var(--sj-canvas); background: var(--sj-lime); }.primary-action svg { width: 14px; }
.filter-panel, .list-panel { overflow: hidden; border: 1px solid var(--sj-border); border-radius: var(--sj-radius-panel); background: var(--sj-surface-1); }.filter-panel { flex: 0 0 auto; }.list-panel { display: flex; min-height: 0; margin-top: var(--sj-space-4); flex: 1 1 auto; flex-direction: column; }
.filter-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: var(--sj-space-3) var(--sj-space-4); padding: var(--sj-space-4); background: var(--sj-surface-2); }.filter-grid label { display: flex; grid-column: span 2; align-items: center; gap: var(--sj-space-2); min-width: 0; }.filter-grid label > span, .date-filter > span { flex: 0 0 auto; color: var(--sj-text-2); font-size: 11px; }
input, select { min-width: 0; min-height: var(--sj-control-default); border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); color: var(--sj-text-1); background: var(--sj-surface-1); font-size: 11px; }input { width: 100%; padding: 0 var(--sj-space-3); }select { width: 100%; padding: 0 var(--sj-space-3); }input::placeholder { color: var(--sj-text-3); }
.date-filter { display: grid; grid-column: span 4; grid-template-columns: auto 1fr auto 1fr; align-items: center; gap: var(--sj-space-2); }.date-filter i { color: var(--sj-text-3); font-style: normal; font-size: 10px; }.date-filter input { cursor: pointer; }.filter-actions { display: flex; grid-column: span 4; align-items: center; justify-content: flex-end; gap: var(--sj-space-3); }.filter-actions button { width: max-content; flex: 0 0 auto; }
.table-scroll { min-height: 0; overflow: auto; flex: 1 1 auto; }.table-scroll table { width: 100%; min-width: 1020px; border-collapse: separate; border-spacing: 0; table-layout: fixed; }.table-scroll th { position: sticky; z-index: 3; top: 0; height: 38px; padding: 0 var(--sj-space-3); border-right: 1px solid var(--sj-border); border-bottom: 1px solid var(--sj-border); color: var(--sj-text-3); background: var(--sj-surface-2); font: 700 10px/1 var(--sj-font-data); letter-spacing: .04em; text-align: left; white-space: nowrap; }.table-scroll th:last-child, .table-scroll td:last-child { border-right: 0; }.table-scroll td { height: 52px; padding: 0 var(--sj-space-3); overflow: hidden; border-right: 1px solid var(--sj-border); border-bottom: 1px solid var(--sj-border); color: var(--sj-text-2); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }.table-scroll tbody tr:last-child td { border-bottom: 0; }.table-scroll tbody tr { cursor: pointer; transition: background var(--sj-duration-fast); }.table-scroll tbody tr:hover, .table-scroll tbody tr:focus-visible { outline: 0; background: var(--sj-surface-2); }
.table-scroll th:nth-child(1) { width: 100px; }.table-scroll th:nth-child(2) { width: 110px; }.table-scroll th:nth-child(3), .table-scroll th:nth-child(4) { width: 96px; }.table-scroll th:nth-child(5) { width: 76px; }.table-scroll th:nth-child(6) { width: 112px; }.table-scroll th:nth-child(7) { width: auto; }.table-scroll th:nth-child(8) { width: 92px; }.table-scroll th:nth-child(9) { width: 86px; }.table-scroll th:nth-child(10) { width: 132px; }
.trip-link { padding: 0; border: 0; color: var(--sj-blue); background: transparent; font-family: var(--sj-font-data); cursor: pointer; }.tail { color: var(--sj-text-1) !important; font-weight: 700; }.route-summary { color: var(--sj-text-1) !important; }.state { display: inline-flex; align-items: center; gap: var(--sj-space-1); padding: var(--sj-space-1) var(--sj-space-2); border-radius: var(--sj-radius-tag); font-size: 10px; }.state i { width: 6px; height: 6px; border-radius: 50%; }.state.ready { color: var(--sj-lime); background: var(--sj-lime-soft); }.state.ready i { background: var(--sj-lime); }.state.pending { color: var(--sj-amber); background: var(--sj-amber-soft); }.state.pending i { background: var(--sj-amber); }.state.blocked { color: var(--sj-red); background: var(--sj-red-soft); }.state.blocked i { background: var(--sj-red); }.applicant { display: inline-flex; align-items: center; gap: var(--sj-space-2); }.applicant b { display: grid; width: 24px; height: 24px; place-items: center; border: 1px solid var(--sj-border-strong); border-radius: 50%; color: var(--sj-blue); background: var(--sj-blue-soft); font-size: 10px; }.updated { color: var(--sj-text-3) !important; }
.empty-state { display: grid; min-height: 220px; place-items: center; color: var(--sj-text-3); font-size: 12px; }.table-footer { display: flex; min-height: 52px; align-items: center; justify-content: space-between; padding: 0 var(--sj-space-4); border-top: 1px solid var(--sj-border); color: var(--sj-text-3); font-size: 11px; }.table-footer nav { display: flex; }.table-footer button { min-height: var(--sj-control-dense); padding: 0 var(--sj-space-3); border: 1px solid var(--sj-border-strong); color: var(--sj-text-2); background: var(--sj-surface-2); }.table-footer button + button { border-left: 0; }.table-footer button.current { color: var(--sj-canvas); background: var(--sj-blue); }.table-footer button:disabled { color: var(--sj-text-disabled); cursor: not-allowed; }

@media (max-width: 1279px) { .trip-page { padding: var(--sj-space-4); }.filter-grid label { grid-column: span 3; }.date-filter { grid-column: span 6; }.filter-actions { grid-column: span 6; } }
@media (max-width: 899px) { .filter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }.filter-grid label { grid-column: span 1 !important; }.date-filter, .filter-actions { grid-column: 1 / -1 !important; } }
@media (max-width: 599px) { .trip-page { padding: var(--sj-space-3); }.filter-grid { grid-template-columns: 1fr; }.filter-grid label, .date-filter, .filter-actions { grid-column: 1 !important; }.date-filter { grid-template-columns: auto 1fr; }.date-filter i { display: none; }.date-filter input:last-child { grid-column: 2; }.filter-actions { justify-content: stretch; }.filter-actions button { flex: 1 1 auto; }.table-footer { align-items: flex-start; flex-direction: column; gap: var(--sj-space-2); padding-block: var(--sj-space-3); } }
</style>

<script lang="ts" setup>
import type { CSSProperties } from 'vue';

import { computed, ref, watch } from 'vue';

import { createIconifyIcon } from '@vben/icons';
import { ElMessage } from 'element-plus';

defineOptions({ name: 'CrewRoster' });

const AlertIcon = createIconifyIcon('lucide:triangle-alert');
const CalendarOffIcon = createIconifyIcon('lucide:calendar-off');
const ChevronLeftIcon = createIconifyIcon('lucide:chevron-left');
const ChevronRightIcon = createIconifyIcon('lucide:chevron-right');
const CloseIcon = createIconifyIcon('lucide:x');
const ClipboardIcon = createIconifyIcon('lucide:clipboard-pen-line');
const SparklesIcon = createIconifyIcon('lucide:sparkles');

type CrewState = 'conflict' | 'ready' | 'rest' | 'warning';
type DutyState = 'conflict' | 'confirmed' | 'draft';
type FlightType = 'FERRY' | 'PAX';
type RosterUnit = 'flight' | 'trip';
type CrewRoleFilter = 'PIC' | 'SIC' | '乘务' | '全部';

interface CrewMember {
  base: string;
  dutyHours: string;
  id: string;
  name: string;
  qualification: string;
  readiness: number;
  role: 'PIC' | 'SIC' | '乘务';
  rosterIssue?: string;
  state: CrewState;
  stateLabel: string;
  team: string;
}

interface DutyAssignment {
  aircraft: string;
  dateIndex: number;
  from: string;
  crewIds: string[];
  id: string;
  sta: string;
  state: DutyState;
  std: string;
  tail: string;
  to: string;
  type: FlightType;
}

interface UnassignedFlight {
  aircraft: string;
  date: string;
  dateIndex: number;
  from: string;
  id: string;
  sta: string;
  std: string;
  tail: string;
  to: string;
  type: FlightType;
}

interface RosterTrip {
  customer: string;
  flightIds: string[];
  id: string;
  name: string;
}

const dates = [
  { date: '8月21日', day: '周五', iso: '2026-08-21' },
  { date: '8月22日', day: '周六', iso: '2026-08-22', today: true },
  { date: '8月23日', day: '周日', iso: '2026-08-23' },
  { date: '8月24日', day: '周一', iso: '2026-08-24' },
  { date: '8月25日', day: '周二', iso: '2026-08-25' },
  { date: '8月26日', day: '周三', iso: '2026-08-26' },
  { date: '8月27日', day: '周四', iso: '2026-08-27' },
];

const crewMembers: CrewMember[] = [
  { base: 'ZSPD', dutyHours: '06:20 / 13:00', id: 'CREW-A-PIC', name: '张铭', qualification: 'G650ER · G450', readiness: 92, role: 'PIC', state: 'ready', stateLabel: '可用', team: 'A 组' },
  { base: 'ZSPD', dutyHours: '06:20 / 13:00', id: 'CREW-A-SIC', name: '李睿', qualification: 'G650ER · G450', readiness: 91, role: 'SIC', state: 'ready', stateLabel: '可用', team: 'A 组' },
  { base: 'ZSPD', dutyHours: '06:20 / 13:00', id: 'CREW-A-CC', name: '许静', qualification: '国际航线', readiness: 94, role: '乘务', state: 'ready', stateLabel: '可用', team: 'A 组' },
  { base: 'ZBAA', dutyHours: '09:40 / 13:00', id: 'CREW-B-PIC', name: '王晨', qualification: 'G650ER', readiness: 74, role: 'PIC', state: 'warning', stateLabel: '需关注', team: 'B 组' },
  { base: 'ZBAA', dutyHours: '09:40 / 13:00', id: 'CREW-B-SIC', name: '陈昊', qualification: 'G650ER · G550', readiness: 77, role: 'SIC', rosterIssue: '前序执勤休息不足', state: 'warning', stateLabel: '需关注', team: 'B 组' },
  { base: 'ZBAA', dutyHours: '09:40 / 13:00', id: 'CREW-B-CC', name: '周宁', qualification: '国际航线', readiness: 82, role: '乘务', state: 'ready', stateLabel: '可用', team: 'B 组' },
  { base: 'ZGGG', dutyHours: '11:55 / 13:00', id: 'CREW-C-PIC', name: '赵楠', qualification: 'G550', readiness: 41, role: 'PIC', rosterIssue: '与 B-801Q 航班冲突', state: 'conflict', stateLabel: '受阻', team: 'C 组' },
  { base: 'ZGGG', dutyHours: '11:55 / 13:00', id: 'CREW-C-SIC', name: '高宇', qualification: 'G550', readiness: 46, role: 'SIC', rosterIssue: '与 B-801Q 航班冲突', state: 'conflict', stateLabel: '受阻', team: 'C 组' },
  { base: 'ZGGG', dutyHours: '11:55 / 13:00', id: 'CREW-C-CC', name: '林安', qualification: '国内航线', readiness: 52, role: '乘务', state: 'warning', stateLabel: '需关注', team: 'C 组' },
  { base: 'ZSPD', dutyHours: '00:00 / 13:00', id: 'CREW-D-PIC', name: '孙航', qualification: 'G650ER · G450', readiness: 100, role: 'PIC', state: 'rest', stateLabel: '休息中', team: 'D 组' },
  { base: 'ZSPD', dutyHours: '00:00 / 13:00', id: 'CREW-D-SIC', name: '沈乔', qualification: 'G650ER · G450', readiness: 100, role: 'SIC', state: 'rest', stateLabel: '休息中', team: 'D 组' },
  { base: 'ZSPD', dutyHours: '00:00 / 13:00', id: 'CREW-D-CC', name: '杨希', qualification: '国际航线', readiness: 100, role: '乘务', rosterIssue: '休假至 8月24日', state: 'rest', stateLabel: '休息中', team: 'D 组' },
];

const assignments = ref<DutyAssignment[]>([
  { aircraft: 'G450', crewIds: ['CREW-A-PIC', 'CREW-A-SIC', 'CREW-A-CC'], dateIndex: 0, from: 'ZSPD', id: 'DUTY-01', sta: '1620', state: 'confirmed', std: '1330', tail: 'B-9308', to: 'ZGGG', type: 'PAX' },
  { aircraft: 'G650ER', crewIds: ['CREW-A-PIC', 'CREW-A-SIC', 'CREW-A-CC'], dateIndex: 1, from: 'ZGGG', id: 'DUTY-02', sta: '1040', state: 'confirmed', std: '0820', tail: 'B-602M', to: 'ZGSZ', type: 'PAX' },
  { aircraft: 'G650ER', crewIds: ['CREW-B-PIC', 'CREW-B-SIC', 'CREW-B-CC'], dateIndex: 0, from: 'ZUUU', id: 'DUTY-03', sta: '1530', state: 'confirmed', std: '1100', tail: 'B-602M', to: 'ZSPD', type: 'FERRY' },
  { aircraft: 'G650ER', crewIds: ['CREW-B-PIC', 'CREW-B-SIC', 'CREW-B-CC'], dateIndex: 2, from: 'ZSPD', id: 'DUTY-04', sta: '1710', state: 'draft', std: '1420', tail: 'B-9811', to: 'ZBAA', type: 'PAX' },
  { aircraft: 'G550', crewIds: ['CREW-C-PIC', 'CREW-C-SIC', 'CREW-C-CC'], dateIndex: 1, from: 'ZSPD', id: 'DUTY-05', sta: '1800', state: 'conflict', std: '1000', tail: 'B-801Q', to: 'ZSPD', type: 'PAX' },
]);

const unassignedFlights = ref<UnassignedFlight[]>([
  { aircraft: 'G650ER', date: '8月22日', dateIndex: 1, from: 'ZGSZ', id: 'OPEN-01', sta: '1640', std: '1320', tail: 'B-9811', to: 'ZBAA', type: 'PAX' },
  { aircraft: 'G450', date: '8月23日', dateIndex: 2, from: 'ZBAA', id: 'OPEN-02', sta: '1120', std: '0840', tail: 'B-9308', to: 'ZSPD', type: 'FERRY' },
  { aircraft: 'G650ER', date: '8月24日', dateIndex: 3, from: 'ZSPD', id: 'OPEN-03', sta: '1130', std: '0900', tail: 'B-602M', to: 'ZGGG', type: 'PAX' },
  { aircraft: 'G450', date: '8月25日', dateIndex: 4, from: 'ZGGG', id: 'OPEN-04', sta: '1600', std: '1320', tail: 'B-9308', to: 'ZSPD', type: 'FERRY' },
  { aircraft: 'G650ER', date: '8月26日', dateIndex: 5, from: 'ZBAA', id: 'OPEN-05', sta: '1000', std: '0710', tail: 'B-9811', to: 'ZGSZ', type: 'PAX' },
]);

const rosterTrips: RosterTrip[] = [
  { customer: '华东商务', flightIds: ['OPEN-01', 'OPEN-02'], id: 'TRIP-20260822-01', name: '新加坡—北京—上海' },
  { customer: '远航科技', flightIds: ['OPEN-03', 'OPEN-04'], id: 'TRIP-20260824-02', name: '上海—广州—上海' },
  { customer: '星海资本', flightIds: ['OPEN-05'], id: 'TRIP-20260826-03', name: '北京—深圳' },
];

const baseFilter = ref('全部基地');
const qualificationFilter = ref('全部资质');
const registrationFilter = ref('全部注册号');
const crewSearch = ref('');
const stateFilter = ref('全部状态');
const selectedCrewId = ref('all');
const selectedItemId = ref('');
const rosterWorkspaceRef = ref<HTMLElement>();
const targetPicId = ref('CREW-D-PIC');
const targetSicId = ref('CREW-D-SIC');
const targetCabinId = ref('CREW-D-CC');
const inspectorOpen = ref(false);
const leavePanelOpen = ref(false);
const leaveApplicantId = ref('CREW-D-PIC');
const leaveStart = ref('2026-08-29');
const leaveEnd = ref('2026-08-31');
const leaveReason = ref('年假');
const assignmentWorkspaceOpen = ref(false);
const rosterUnit = ref<RosterUnit>('trip');
const selectedRosterFlightIds = ref<string[]>([]);
const rosterCrewSearch = ref('');
const rosterCrewRoleFilter = ref<CrewRoleFilter>('全部');
const selectedRosterCrewIds = ref<string[]>([]);
const leaveRequests = ref([
  { applicant: '陈昊', created: '8月21日 09:12', end: '8月24日', id: 'LEAVE-01', reason: '年假', start: '8月23日', status: '待审批' },
  { applicant: '许静', created: '8月20日 16:40', end: '8月27日', id: 'LEAVE-02', reason: '调休', start: '8月27日', status: '已批准' },
]);

const registrationOptions = computed(() => [...new Set([
  ...assignments.value.map((item) => item.tail),
  ...unassignedFlights.value.map((item) => item.tail),
])].sort());
const filteredAssignments = computed(() => assignments.value.filter((item) =>
  registrationFilter.value === '全部注册号' || item.tail === registrationFilter.value,
));
const visibleUnassignedFlights = computed(() => unassignedFlights.value.filter((item) =>
  registrationFilter.value === '全部注册号' || item.tail === registrationFilter.value,
));
const relatedCrewIds = computed(() => new Set(filteredAssignments.value.flatMap((item) => item.crewIds)));
const visibleCrew = computed(() => crewMembers.filter((member) =>
  (!crewSearch.value.trim() || `${member.name}${member.role}${member.qualification}`.toLowerCase().includes(crewSearch.value.trim().toLowerCase())) &&
  (stateFilter.value === '全部状态' || member.stateLabel === stateFilter.value) &&
  (registrationFilter.value === '全部注册号' || relatedCrewIds.value.has(member.id)) &&
  (baseFilter.value === '全部基地' || member.base === baseFilter.value) &&
  (qualificationFilter.value === '全部资质' || member.qualification.includes(qualificationFilter.value)),
));
const selectedAssignment = computed(() => filteredAssignments.value.find((item) => item.id === selectedItemId.value));
const selectedOpenFlight = computed(() => visibleUnassignedFlights.value.find((item) => item.id === selectedItemId.value));
const hasSelectedFlight = computed(() => Boolean(selectedAssignment.value || selectedOpenFlight.value));
const selectedAssignmentCrew = computed(() => crewMembers.filter((member) =>
  selectedAssignment.value?.crewIds.includes(member.id),
));
const picOptions = computed(() => crewMembers.filter((member) => member.role === 'PIC'));
const sicOptions = computed(() => crewMembers.filter((member) => member.role === 'SIC'));
const cabinOptions = computed(() => crewMembers.filter((member) => member.role === '乘务'));
const maximumDutyHours = computed(() => selectedAssignmentCrew.value.reduce((maximum, member) => {
  const current = minutes(member.dutyHours.slice(0, 5).replace(':', ''));
  return current > maximum.value ? { label: member.dutyHours, value: current } : maximum;
}, { label: '00:00 / 13:00', value: 0 }).label);
const availableRosterTrips = computed(() => rosterTrips.map((trip) => ({
  ...trip,
  flights: trip.flightIds
    .map((flightId) => unassignedFlights.value.find((flight) => flight.id === flightId))
    .filter((flight): flight is UnassignedFlight => Boolean(flight)),
})).filter((trip) => trip.flights.length));
const rosterTargets = computed(() => rosterUnit.value === 'trip'
  ? availableRosterTrips.value.map((trip) => ({
      customer: trip.customer,
      flights: trip.flights,
      id: trip.id,
      label: trip.name,
      unit: 'trip' as const,
    }))
  : unassignedFlights.value.map((flight) => ({
      customer: '',
      flights: [flight],
      id: flight.id,
      label: `${flight.from} → ${flight.to}`,
      unit: 'flight' as const,
    })));
const selectedRosterFlights = computed(() => {
  const selected = new Set(selectedRosterFlightIds.value);
  return unassignedFlights.value.filter((flight) => selected.has(flight.id));
});
const rosterCrewCandidates = computed(() => crewMembers.filter((member) =>
  (rosterCrewRoleFilter.value === '全部' || member.role === rosterCrewRoleFilter.value) &&
  (!rosterCrewSearch.value.trim() || `${member.name}${member.role}${member.qualification}${member.base}`.toLowerCase().includes(rosterCrewSearch.value.trim().toLowerCase())),
));
const selectedRosterCrew = computed(() => crewMembers.filter((member) => selectedRosterCrewIds.value.includes(member.id)));
const rosterHasConflict = computed(() => selectedRosterCrew.value.some((member) => Boolean(member.rosterIssue)));
const rosterRolesComplete = computed(() => ['PIC', 'SIC', '乘务'].every((role) => selectedRosterCrew.value.some((member) => member.role === role)));
const canConfirmRoster = computed(() => selectedRosterFlights.value.length > 0 && rosterRolesComplete.value && !rosterHasConflict.value);

watch([registrationFilter, crewSearch, baseFilter, qualificationFilter, stateFilter], () => {
  selectedItemId.value = '';
  selectedCrewId.value = 'all';
  inspectorOpen.value = false;
});

watch(rosterUnit, () => {
  selectedRosterFlightIds.value = [];
});

watch(() => unassignedFlights.value.length, (count) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('starjet:crew-unassigned-count', { detail: count }));
}, { immediate: true });

function minutes(value: string) {
  return Number(value.slice(0, 2)) * 60 + Number(value.slice(2));
}

function assignmentStyle(item: DutyAssignment): CSSProperties {
  const start = minutes(item.std);
  const duration = Math.max(70, minutes(item.sta) - start);
  const dayWidth = 100 / dates.length;
  return {
    left: `${item.dateIndex * dayWidth + (start / 1440) * dayWidth}%`,
    width: `${(duration / 1440) * dayWidth}%`,
  };
}

function assignmentsForCrew(crewId: string) {
  return filteredAssignments.value.filter((item) => item.crewIds.includes(crewId));
}

function selectCrew(crewId: string) {
  selectedCrewId.value = selectedCrewId.value === crewId ? 'all' : crewId;
}

function selectItem(id: string) {
  selectedItemId.value = id;
  inspectorOpen.value = true;
}

function closeInspector() {
  inspectorOpen.value = false;
  selectedItemId.value = '';
}

function openAssignmentWorkspace() {
  closeInspector();
  assignmentWorkspaceOpen.value = true;
  selectedRosterFlightIds.value = [];
  selectedRosterCrewIds.value = [];
  rosterCrewSearch.value = '';
  rosterCrewRoleFilter.value = '全部';
}

function closeAssignmentWorkspace() {
  assignmentWorkspaceOpen.value = false;
}

function recommendRosterCrew() {
  selectedRosterCrewIds.value = ['CREW-D-PIC', 'CREW-D-SIC', 'CREW-A-CC'];
  ElMessage.success('已按资质、基地和休息时间推荐机组');
}

function isRosterCrewUnavailable(member: CrewMember) {
  return Boolean(member.rosterIssue);
}

function confirmRosterAssignment() {
  const crewIds = [...selectedRosterCrewIds.value];
  if (!canConfirmRoster.value) return;
  selectedRosterFlights.value.forEach((flight) => {
    assignments.value.push({
      ...flight,
      crewIds,
      id: `DUTY-${String(assignments.value.length + 1).padStart(2, '0')}`,
      state: 'draft',
    });
  });
  const assignedIds = new Set(selectedRosterFlights.value.map((flight) => flight.id));
  unassignedFlights.value = unassignedFlights.value.filter((flight) => !assignedIds.has(flight.id));
  ElMessage.success(`已批量分配 ${assignedIds.size} 个航班，执行人员：${selectedRosterCrew.value.map((member) => member.name).join('、')}`);
  selectedRosterFlightIds.value = [];
  if (!rosterTargets.value.length) closeAssignmentWorkspace();
}

function isTripSelected(target: (typeof rosterTargets.value)[number]) {
  return target.flights.every((flight) => selectedRosterFlightIds.value.includes(flight.id));
}

function isTripPartiallySelected(target: (typeof rosterTargets.value)[number]) {
  const selectedCount = target.flights.filter((flight) => selectedRosterFlightIds.value.includes(flight.id)).length;
  return selectedCount > 0 && selectedCount < target.flights.length;
}

function toggleTripSelection(target: (typeof rosterTargets.value)[number], checked: boolean) {
  const next = new Set(selectedRosterFlightIds.value);
  target.flights.forEach((flight) => checked ? next.add(flight.id) : next.delete(flight.id));
  selectedRosterFlightIds.value = [...next];
}

function onScheduleWheel(event: WheelEvent) {
  if (!event.shiftKey || !rosterWorkspaceRef.value) return;
  const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX)
    ? event.deltaY
    : event.deltaX;
  if (!delta) return;
  event.preventDefault();
  rosterWorkspaceRef.value.scrollLeft += delta;
}

function assignOpenFlight() {
  const flight = selectedOpenFlight.value;
  const crewIds = [targetPicId.value, targetSicId.value, targetCabinId.value];
  const crew = crewMembers.filter((member) => crewIds.includes(member.id));
  if (!flight || crew.length !== 3) return;
  assignments.value.push({
    ...flight,
    crewIds,
    id: `DUTY-${String(assignments.value.length + 1).padStart(2, '0')}`,
    state: crew.some((member) => member.state === 'conflict') ? 'conflict' : 'draft',
  });
  unassignedFlights.value = unassignedFlights.value.filter((item) => item.id !== flight.id);
  selectedItemId.value = assignments.value.at(-1)?.id || '';
  ElMessage.success(`已将 ${flight.tail} 分配给 ${crew.map((member) => member.name).join('、')}`);
}

function submitLeaveRequest() {
  const applicant = crewMembers.find((member) => member.id === leaveApplicantId.value);
  if (!applicant) return;
  leaveRequests.value.unshift({
    applicant: applicant.name,
    created: '刚刚',
    end: leaveEnd.value.replace('2026-', '').replace('-', '月') + '日',
    id: `LEAVE-${String(leaveRequests.value.length + 1).padStart(2, '0')}`,
    reason: leaveReason.value,
    start: leaveStart.value.replace('2026-', '').replace('-', '月') + '日',
    status: '待审批',
  });
  ElMessage.success(`已提交 ${applicant.name} 的请假申请`);
}
</script>

<template>
  <main :class="['crew-roster-page', 'sj-mission-control', { 'inspector-visible': hasSelectedFlight && !assignmentWorkspaceOpen }]">
    <section v-if="assignmentWorkspaceOpen" class="assignment-workspace" aria-label="新建机组排班">
      <header class="assignment-header">
        <div><span>CREW ASSIGNMENT</span><strong>新建排班</strong><small>选择任务单位，核对航段后分配执行人员</small></div>
        <div class="unit-switch" aria-label="排班单位" role="group"><button :class="{ active: rosterUnit === 'trip' }" type="button" @click="rosterUnit = 'trip'">按行程</button><button :class="{ active: rosterUnit === 'flight' }" type="button" @click="rosterUnit = 'flight'">按航班</button></div>
        <button aria-label="关闭排班工作区" class="workspace-close" type="button" @click="closeAssignmentWorkspace"><CloseIcon /></button>
      </header>

      <div v-if="rosterTargets.length" class="assignment-body">
        <aside class="target-panel">
          <header><span>{{ rosterUnit === 'trip' ? '勾选待排行程或航班' : '勾选待排航班' }}</span><strong>{{ selectedRosterFlights.length }}/{{ unassignedFlights.length }}</strong></header>
          <template v-if="rosterUnit === 'trip'">
            <div v-for="target in rosterTargets" :key="target.id" :class="{ partial: isTripPartiallySelected(target), selected: isTripSelected(target) }" class="target-option target-trip">
              <label class="target-summary">
                <input :checked="isTripSelected(target)" :indeterminate="isTripPartiallySelected(target)" type="checkbox" @change="toggleTripSelection(target, ($event.target as HTMLInputElement).checked)" />
                <span><b>行程</b><small>{{ target.flights.length }} 个航段</small></span>
                <strong>{{ target.label }}</strong>
                <em>{{ target.flights[0]?.date }} · {{ target.flights[0]?.tail }}</em>
                <small v-if="target.customer">客户 {{ target.customer }}</small>
              </label>
              <div class="target-flight-options">
                <label v-for="flight in target.flights" :key="flight.id" :class="{ selected: selectedRosterFlightIds.includes(flight.id) }">
                  <input v-model="selectedRosterFlightIds" :value="flight.id" type="checkbox" />
                  <span><b>{{ flight.type }}</b><strong>{{ flight.from }} → {{ flight.to }}</strong></span>
                  <time>{{ flight.date }} · {{ flight.std }}Z—{{ flight.sta }}Z</time>
                </label>
              </div>
            </div>
          </template>
          <label v-for="target in rosterTargets" v-else :key="target.id" :class="{ selected: selectedRosterFlightIds.includes(target.flights[0]?.id || '') }" class="target-option target-flight">
            <input v-model="selectedRosterFlightIds" :value="target.flights[0]?.id" type="checkbox" />
            <span><b>{{ target.flights[0]?.type }}</b><small>1 个航段</small></span>
            <strong>{{ target.label }}</strong>
            <em>{{ target.flights[0]?.date }} · {{ target.flights[0]?.tail }} · {{ target.flights[0]?.std }}Z—{{ target.flights[0]?.sta }}Z</em>
          </label>
        </aside>

        <aside class="assignment-crew-panel">
          <header><div><span>执行人员</span><strong>已选 {{ selectedRosterCrew.length }} 人</strong></div><button class="secondary-action" type="button" @click="recommendRosterCrew"><SparklesIcon />智能推荐</button></header>
          <div class="crew-role-filter" aria-label="执行人员岗位筛选" role="group">
            <button v-for="role in (['全部', 'PIC', 'SIC', '乘务'] as CrewRoleFilter[])" :key="role" :class="{ active: rosterCrewRoleFilter === role }" type="button" @click="rosterCrewRoleFilter = role">{{ role }}</button>
          </div>
          <div class="roster-crew-search"><input v-model="rosterCrewSearch" aria-label="搜索待分配人员" placeholder="搜索姓名、岗位、资质或基地" type="search" /></div>
          <div class="roster-crew-options">
            <label v-for="member in rosterCrewCandidates" :key="member.id" :class="[member.state, { incompatible: isRosterCrewUnavailable(member), selected: selectedRosterCrewIds.includes(member.id) }]">
              <input v-model="selectedRosterCrewIds" :disabled="isRosterCrewUnavailable(member)" :value="member.id" type="checkbox" />
              <b>{{ member.role }}</b><span><strong>{{ member.name }}</strong><small>{{ member.qualification }} · {{ member.base }}</small></span><em v-if="member.rosterIssue"><AlertIcon />{{ member.rosterIssue }}</em>
            </label>
            <p v-if="!rosterCrewCandidates.length">没有匹配的人员</p>
          </div>
          <div :class="['validation-message', rosterHasConflict ? 'blocked' : 'ready']"><AlertIcon v-if="rosterHasConflict" /><span v-else>✓</span><div><strong>{{ rosterHasConflict ? '存在执勤冲突' : rosterRolesComplete ? '岗位配置完整' : '还需配置岗位' }}</strong><small>{{ rosterHasConflict ? '请移除标记为受阻的机组成员。' : rosterRolesComplete ? '已包含机长、副驾驶和乘务。' : '至少勾选一名机长、副驾驶和乘务。' }}</small></div></div>
        </aside>
      </div>
      <div v-else class="assignment-empty"><ClipboardIcon /><strong>当前没有待排任务</strong><span>新增航班后可在这里按行程或航班分配机组。</span></div>
      <footer class="assignment-footer"><span>分配后进入待确认状态，发布排班前仍可调整</span><div><button class="secondary-action" type="button" @click="closeAssignmentWorkspace">取消</button><button :disabled="!canConfirmRoster" class="primary-action" type="button" @click="confirmRosterAssignment">确认分配</button></div></footer>
    </section>

    <template v-else>
    <section class="open-flight-strip" aria-label="待分配航班">
      <header><div><span>UNASSIGNED</span><strong>待分配航班</strong></div><small>{{ visibleUnassignedFlights.length }} 个任务需要处理</small></header>
      <div class="open-flight-list" tabindex="0">
        <button v-for="flight in visibleUnassignedFlights" :key="flight.id" :class="{ selected: selectedItemId === flight.id }" :aria-label="`${flight.tail} ${flight.from} 至 ${flight.to} ${flight.date} ${flight.std}Z 至 ${flight.sta}Z 待分配`" type="button" @click="selectItem(flight.id)"><strong>{{ flight.tail }}</strong><em>{{ flight.from }} → {{ flight.to }}</em><time>{{ flight.date }} · {{ flight.std }}Z–{{ flight.sta }}Z</time></button>
        <p v-if="!visibleUnassignedFlights.length">当前注册号没有待分配航班</p>
      </div>
      <div class="open-flight-action"><button class="primary-action" type="button" @click="openAssignmentWorkspace"><ClipboardIcon />机组排班</button></div>
    </section>

    <section class="filter-bar" aria-label="机组排班筛选">
      <label><span>注册号</span><select v-model="registrationFilter"><option>全部注册号</option><option v-for="registration in registrationOptions" :key="registration">{{ registration }}</option></select></label>
      <label><span>基地</span><select v-model="baseFilter"><option>全部基地</option><option>ZSPD</option><option>ZBAA</option><option>ZGGG</option></select></label>
      <label><span>资质</span><select v-model="qualificationFilter"><option>全部资质</option><option>G650ER</option><option>G450</option><option>G550</option></select></label>
      <label><span>状态</span><select v-model="stateFilter"><option>全部状态</option><option>可用</option><option>需关注</option><option>受阻</option><option>休息中</option></select></label>
      <div class="date-control"><button aria-label="前一天" type="button"><ChevronLeftIcon /></button><strong>2026年8月21日 — 8月27日</strong><button aria-label="后一天" type="button"><ChevronRightIcon /></button></div>
      <div class="filter-actions"><button class="secondary-action" type="button" @click="leavePanelOpen = true"><CalendarOffIcon />请休假</button></div>
    </section>

    <section ref="rosterWorkspaceRef" :class="['roster-workspace', { 'has-inspector': hasSelectedFlight }]" aria-label="机组排班工作区" tabindex="0" @wheel="onScheduleWheel">
      <aside class="crew-rail" aria-label="人员资源">
        <header class="crew-search"><input v-model="crewSearch" aria-label="搜索机组成员" placeholder="搜索姓名或岗位" type="search" /><small>{{ visibleCrew.length }} 人</small></header>
        <button
          v-for="member in visibleCrew"
          :key="member.id"
          :aria-label="`${member.name} ${member.role} ${assignmentsForCrew(member.id).length} 个待飞航段`"
          :class="['crew-card', { selected: selectedCrewId === member.id }]"
          type="button"
          @click="selectCrew(member.id)"
        >
          <strong>{{ member.name }}</strong>
          <b>{{ member.role }}</b>
          <span>{{ assignmentsForCrew(member.id).length }} 个待飞航段</span>
        </button>
      </aside>

      <section class="schedule-canvas" aria-label="机组执勤排班表">
        <header class="schedule-axis" :style="{ gridTemplateColumns: `repeat(${dates.length}, minmax(220px, 1fr))`, minWidth: `${dates.length * 220}px` }"><div v-for="date in dates" :key="date.iso" :class="{ today: date.today }"><strong>{{ date.date }}</strong><span>{{ date.day }}</span><i><b>00</b><b>06</b><b>12</b><b>18</b></i></div></header>
        <div class="schedule-rows" :style="{ minWidth: `${dates.length * 220}px` }">
          <section v-for="member in visibleCrew" :key="member.id" :class="['schedule-row', { dimmed: selectedCrewId !== 'all' && selectedCrewId !== member.id }]">
            <div class="time-grid" :style="{ gridTemplateColumns: `repeat(${dates.length * 4}, 1fr)` }" aria-hidden="true"><template v-for="date in dates" :key="date.iso"><span v-for="n in 4" :key="n"></span></template></div>
            <button v-for="item in assignmentsForCrew(member.id)" :key="item.id" :class="['duty-card', item.state, { selected: selectedItemId === item.id }]" :style="assignmentStyle(item)" :aria-label="`${member.name} ${member.role} ${item.type} ${item.tail} ${item.from} ${item.std}Z 至 ${item.to} ${item.sta}Z`" type="button" @click="selectItem(item.id)">
              <span><b>{{ item.type }}</b><strong>{{ item.tail }}</strong></span>
              <em>{{ item.from }} → {{ item.to }}</em>
              <time>{{ item.std }}Z–{{ item.sta }}Z</time>
            </button>
          </section>
        </div>
        <footer class="schedule-legend"><span><i class="confirmed"></i>已确认</span><span><i class="draft"></i>待确认</span><span><i class="conflict"></i>冲突</span><small>按住 Shift 滚动鼠标滚轮查看日期 · 点击任务查看执勤详情</small></footer>
      </section>

      <aside v-if="hasSelectedFlight" :class="['roster-inspector', { open: inspectorOpen }]" aria-label="排班检查器">
        <header><div><span>ROSTER INSPECTOR</span><strong>{{ selectedOpenFlight ? '待分配航班' : '执勤详情' }}</strong></div><button aria-label="关闭排班检查器" type="button" @click="closeInspector"><CloseIcon /></button></header>
        <template v-if="selectedAssignment">
          <section class="flight-identity"><span><b>{{ selectedAssignment.type }}</b>{{ selectedAssignment.tail }}</span><strong>{{ selectedAssignment.from }} → {{ selectedAssignment.to }}</strong><time>{{ dates[selectedAssignment.dateIndex]?.date }} · {{ selectedAssignment.std }}Z–{{ selectedAssignment.sta }}Z</time></section>
          <section class="inspector-section"><h3>执行人员</h3><div class="assigned-crew"><span v-for="member in selectedAssignmentCrew" :key="member.id"><b>{{ member.role }}</b><strong>{{ member.name }}</strong><em>{{ member.base }}</em></span></div></section>
          <section class="inspector-section"><h3>关键限制</h3><dl class="limit-list"><div><dt>最高累计执勤</dt><dd>{{ maximumDutyHours }}</dd></div><div><dt>最低休息</dt><dd>10:00</dd></div></dl></section>
          <section v-if="selectedAssignment.state !== 'confirmed'" class="alert-panel"><AlertIcon /><div><strong>{{ selectedAssignment.state === 'conflict' ? '执勤冲突' : '等待排班确认' }}</strong><span>{{ selectedAssignment.state === 'conflict' ? '预计执勤时间超过限制，需要更换机组。' : '机组成员尚未全部确认本次任务。' }}</span></div></section>
          <footer><button class="secondary-action" type="button">调整机组</button><button class="primary-action" type="button">确认排班</button></footer>
        </template>
        <template v-else-if="selectedOpenFlight">
          <section class="flight-identity pending"><span><b>{{ selectedOpenFlight.type }}</b>{{ selectedOpenFlight.tail }}</span><strong>{{ selectedOpenFlight.from }} → {{ selectedOpenFlight.to }}</strong><time>{{ selectedOpenFlight.date }} · {{ selectedOpenFlight.std }}Z–{{ selectedOpenFlight.sta }}Z</time></section>
          <section class="inspector-section"><h3>选择执行人员</h3><div class="crew-selection-grid"><label class="crew-select"><span>机长 PIC</span><select v-model="targetPicId"><option v-for="member in picOptions" :key="member.id" :disabled="member.state === 'conflict'" :value="member.id">{{ member.name }} · {{ member.base }} · {{ member.stateLabel }}</option></select></label><label class="crew-select"><span>副驾驶 SIC</span><select v-model="targetSicId"><option v-for="member in sicOptions" :key="member.id" :disabled="member.state === 'conflict'" :value="member.id">{{ member.name }} · {{ member.base }} · {{ member.stateLabel }}</option></select></label><label class="crew-select"><span>乘务员</span><select v-model="targetCabinId"><option v-for="member in cabinOptions" :key="member.id" :disabled="member.state === 'conflict'" :value="member.id">{{ member.name }} · {{ member.base }} · {{ member.stateLabel }}</option></select></label></div></section>
          <section class="match-reason"><SparklesIcon /><div><strong>推荐组合匹配度 96%</strong><span>三名人员资质满足、驻地匹配，计划起飞前可获得 18 小时休息。</span></div></section>
          <footer><button class="primary-action" type="button" @click="assignOpenFlight">确认分配</button></footer>
        </template>
        <div v-else class="inspector-empty">选择一个航班任务查看排班详情</div>
      </aside>
    </section>

    </template>

    <div v-if="leavePanelOpen" class="leave-overlay" role="presentation" @click.self="leavePanelOpen = false">
      <section aria-label="请休假管理" aria-modal="true" class="leave-panel" role="dialog">
        <header><div><span>LEAVE CONTROL</span><strong>请休假管理</strong></div><button aria-label="关闭请休假管理" type="button" @click="leavePanelOpen = false"><CloseIcon /></button></header>
        <div class="leave-form"><label><span>申请人</span><select v-model="leaveApplicantId"><option v-for="member in crewMembers" :key="member.id" :value="member.id">{{ member.name }} · {{ member.role }} · {{ member.base }}</option></select></label><label><span>开始日期</span><input v-model="leaveStart" type="date" /></label><label><span>结束日期</span><input v-model="leaveEnd" type="date" /></label><label><span>请假类型</span><select v-model="leaveReason"><option>年假</option><option>调休</option><option>病假</option><option>事假</option></select></label><button class="primary-action" type="button" @click="submitLeaveRequest">提交申请</button></div>
        <div class="leave-list"><header><strong>申请记录</strong><small>{{ leaveRequests.length }} 条</small></header><article v-for="request in leaveRequests" :key="request.id"><span><strong>{{ request.applicant }}</strong><b>{{ request.reason }}</b></span><time>{{ request.start }} — {{ request.end }}</time><small>提交于 {{ request.created }}</small><em :class="request.status === '已批准' ? 'approved' : 'pending'"><i></i>{{ request.status }}</em></article></div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.crew-roster-page { --roster-filter-sticky-height: calc(var(--sj-control-dense) + var(--sj-space-6)); position: relative; display: flex; height: var(--vben-content-height, 100dvh); min-height: 0; flex-direction: column; overflow: hidden; color: var(--sj-text-1); background: var(--sj-canvas); font-family: var(--sj-font-ui); }.crew-roster-page.inspector-visible > :is(.filter-bar, .roster-workspace, .open-flight-strip) { margin-right: 332px; }
button, select { font: inherit; }
button { cursor: pointer; }
.date-control { display: flex; align-items: center; gap: var(--sj-space-2); }.date-control strong { min-width: 190px; font: 700 12px var(--sj-font-data); text-align: center; }.date-control button, .roster-inspector header button { display: grid; width: var(--sj-control-default); height: var(--sj-control-default); place-items: center; border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); color: var(--sj-text-2); background: var(--sj-surface-2); }.date-control svg, .roster-inspector header svg { width: 15px; }
.filter-actions { display: flex; margin-left: auto; gap: var(--sj-space-2); }.secondary-action, .primary-action { display: inline-flex; min-height: var(--sj-control-default); padding: 0 var(--sj-space-4); align-items: center; justify-content: center; gap: var(--sj-space-2); border-radius: var(--sj-radius-control); font-weight: 750; }.secondary-action { border: 1px solid var(--sj-border-strong); color: var(--sj-text-1); background: var(--sj-surface-3); }.secondary-action svg, .primary-action svg { width: 14px; }.primary-action { border: 1px solid var(--sj-lime); color: var(--sj-canvas); background: var(--sj-lime); }.primary-action:disabled { cursor: not-allowed; border-color: var(--sj-border-strong); color: var(--sj-text-disabled); background: var(--sj-surface-3); }
.assignment-workspace { display: grid; min-height: 0; flex: 1; grid-template-rows: auto minmax(0, 1fr) auto; background: var(--sj-canvas); }
.assignment-header { display: grid; min-height: 72px; padding: var(--sj-space-3) var(--sj-space-5); align-items: center; grid-template-columns: 1fr auto var(--sj-control-default); gap: var(--sj-space-4); border-bottom: 1px solid var(--sj-border); background: var(--sj-surface-2); }.assignment-header > div:first-child { display: grid; gap: var(--sj-space-1); }.assignment-header > div:first-child span { color: var(--sj-blue); font: 8px var(--sj-font-data); letter-spacing: .12em; }.assignment-header > div:first-child strong { font-size: 16px; }.assignment-header > div:first-child small { color: var(--sj-text-3); font-size: 9px; }.unit-switch { display: inline-flex; padding: 2px; border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); background: var(--sj-surface-1); }.unit-switch button { min-height: var(--sj-control-dense); padding: 0 var(--sj-space-4); border: 0; border-radius: var(--sj-radius-tag); color: var(--sj-text-2); background: transparent; font-size: 10px; font-weight: 700; }.unit-switch button.active { color: var(--sj-text-1); background: var(--sj-blue-soft); box-shadow: inset 0 -2px var(--sj-blue); }.workspace-close { display: grid; width: var(--sj-control-default); height: var(--sj-control-default); place-items: center; border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); color: var(--sj-text-2); background: var(--sj-surface-1); }.workspace-close svg { width: 15px; }
.assignment-body { display: grid; min-height: 500px; grid-template-columns: minmax(300px, .72fr) minmax(520px, 1.48fr); }.assignment-body > * { min-width: 0; border-right: 1px solid var(--sj-border); }.target-panel { max-height: calc(100vh - 136px); overflow-y: auto; background: var(--sj-surface-1); }.target-panel > header { position: sticky; z-index: 2; top: 0; display: flex; min-height: 48px; padding: 0 var(--sj-space-4); align-items: center; justify-content: space-between; border-bottom: 1px solid var(--sj-border); background: var(--sj-surface-1); }.target-panel > header span { color: var(--sj-text-3); font-size: 9px; letter-spacing: .08em; }.target-panel > header strong { color: var(--sj-amber); font: 750 14px var(--sj-font-data); }.target-option { position: relative; display: grid; min-height: 110px; padding: var(--sj-space-3) var(--sj-space-4) var(--sj-space-3) 44px; gap: var(--sj-space-2); border-bottom: 1px solid var(--sj-border); color: var(--sj-text-1); cursor: pointer; background: transparent; }.target-option:hover, .target-option.selected { background: var(--sj-surface-3); }.target-option.selected { box-shadow: inset 3px 0 var(--sj-blue); }.target-option.partial { box-shadow: inset 3px 0 var(--sj-amber); }.target-option.target-trip { display: block; min-height: 0; padding: 0; cursor: default; }.target-summary { position: relative; display: grid; min-height: 96px; padding: var(--sj-space-3) var(--sj-space-4) var(--sj-space-3) 44px; gap: var(--sj-space-2); cursor: pointer; }.target-option > input, .target-summary > input { position: absolute; top: var(--sj-space-4); left: var(--sj-space-4); width: 16px; height: 16px; accent-color: var(--sj-blue); }.target-option > span, .target-summary > span { display: flex; align-items: center; justify-content: space-between; }.target-option span b, .target-summary span b { padding: 1px var(--sj-space-2); border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-tag); color: var(--sj-blue); font: 750 8px var(--sj-font-data); }.target-option span small, .target-option > small, .target-summary span small, .target-summary > small { color: var(--sj-text-3); font-size: 9px; }.target-option > strong, .target-summary > strong { font: 750 13px var(--sj-font-data); }.target-option > em, .target-summary > em { color: var(--sj-text-2); font: 9px var(--sj-font-data); font-style: normal; }.target-flight-options { position: relative; margin-left: var(--sj-space-6); border-top: 1px solid var(--sj-border); border-left: 1px solid var(--sj-border-strong); background: var(--sj-canvas); }.target-flight-options label { display: grid; min-height: 52px; padding: var(--sj-space-2) var(--sj-space-3); align-items: center; grid-template-columns: 16px 1fr; gap: 2px var(--sj-space-2); border-bottom: 1px solid var(--sj-grid); cursor: pointer; }.target-flight-options label:last-child { border-bottom: 0; }.target-flight-options label:hover, .target-flight-options label.selected { background: var(--sj-blue-soft); }.target-flight-options input { width: 14px; height: 14px; accent-color: var(--sj-blue); }.target-flight-options span { display: flex; min-width: 0; align-items: center; gap: var(--sj-space-2); }.target-flight-options span b { flex: 0 0 auto; }.target-flight-options span strong { overflow: hidden; font: 750 10px var(--sj-font-data); text-overflow: ellipsis; white-space: nowrap; }.target-flight-options time { grid-column: 2; color: var(--sj-text-3); font: 8px var(--sj-font-data); }
.assignment-crew-panel { padding-bottom: var(--sj-space-5); background: var(--sj-surface-1); }.assignment-crew-panel > header { display: flex; min-height: 64px; padding: 0 var(--sj-space-4); align-items: center; justify-content: space-between; border-bottom: 1px solid var(--sj-border); }.assignment-crew-panel > header div { display: grid; gap: var(--sj-space-1); }.assignment-crew-panel > header span { color: var(--sj-blue); font: 8px var(--sj-font-data); letter-spacing: .1em; }.assignment-crew-panel > header strong { font-size: 13px; }.assignment-crew-panel .crew-selection-grid { padding: var(--sj-space-4); border-bottom: 1px solid var(--sj-border); }.crew-preview { display: grid; padding: var(--sj-space-4); gap: var(--sj-space-2); }.crew-preview article { display: grid; min-height: 52px; padding: 0 var(--sj-space-3); align-items: center; grid-template-columns: 36px 1fr auto; gap: var(--sj-space-2); border: 1px solid var(--sj-border); background: var(--sj-surface-2); }.crew-preview article > b { color: var(--sj-blue); font: 750 8px var(--sj-font-data); }.crew-preview article > div { display: grid; gap: 2px; }.crew-preview article strong { font-size: 11px; }.crew-preview article span { color: var(--sj-text-3); font-size: 8px; }.crew-preview article em { display: inline-flex; align-items: center; gap: var(--sj-space-1); color: var(--sj-lime); font-size: 8px; font-style: normal; }.crew-preview article.warning em { color: var(--sj-amber); }.crew-preview article.conflict em { color: var(--sj-red); }.crew-preview article.rest em { color: var(--sj-blue); }.crew-preview article em i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }.validation-message { display: flex; margin: 0 var(--sj-space-4); padding: var(--sj-space-3); align-items: flex-start; gap: var(--sj-space-2); border: 1px solid var(--sj-lime); color: var(--sj-lime); background: var(--sj-lime-soft); }.validation-message.blocked { border-color: var(--sj-red); color: var(--sj-red); background: var(--sj-red-soft); }.validation-message > svg { width: 14px; flex: 0 0 14px; }.validation-message > span { font: 800 12px var(--sj-font-data); }.validation-message > div { display: grid; gap: var(--sj-space-1); }.validation-message strong { font-size: 10px; }.validation-message small { color: var(--sj-text-2); font-size: 9px; }.assignment-footer { display: flex; min-height: 64px; padding: 0 var(--sj-space-5); align-items: center; justify-content: space-between; border-top: 1px solid var(--sj-border); background: var(--sj-surface-2); }.assignment-footer > span { color: var(--sj-text-3); font-size: 9px; }.assignment-footer > div { display: flex; gap: var(--sj-space-2); }.assignment-empty { display: grid; min-height: 420px; place-content: center; justify-items: center; gap: var(--sj-space-2); color: var(--sj-text-3); }.assignment-empty svg { width: 30px; color: var(--sj-blue); }.assignment-empty strong { color: var(--sj-text-1); font-size: 14px; }.assignment-empty span { font-size: 10px; }
.filter-bar { z-index: 18; display: flex; min-height: var(--roster-filter-sticky-height); flex: 0 0 auto; padding: var(--sj-space-2) var(--sj-space-4); align-items: center; gap: var(--sj-space-3); border-bottom: 1px solid var(--sj-border); background: var(--sj-surface-2); }.filter-bar label { display: grid; width: 148px; gap: 2px; }.filter-bar label span { color: var(--sj-text-3); font-size: 9px; }.filter-bar select, .crew-select select { width: 100%; min-height: var(--sj-control-dense); padding: 0 var(--sj-space-3); border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); color: var(--sj-text-1); background: var(--sj-surface-1); font-size: 11px; }
.roster-workspace { display: grid; min-height: 0; flex: 1; align-items: start; grid-template-columns: 244px minmax(0, 1fr); overflow: auto; overscroll-behavior: contain; border-bottom: 1px solid var(--sj-border); scrollbar-color: var(--sj-border-strong) var(--sj-surface-1); }.roster-workspace.has-inspector { grid-template-columns: 244px minmax(0, 1fr); }.roster-workspace:focus-visible { outline: 2px solid var(--sj-blue); outline-offset: -2px; }
.crew-rail { position: sticky; z-index: 9; left: 0; min-width: 0; min-height: 100%; border-right: 1px solid var(--sj-border); background: var(--sj-surface-1); }.crew-rail > header, .open-flight-strip > header, .roster-inspector > header { display: flex; min-height: 58px; padding: 0 var(--sj-space-4); align-items: center; justify-content: space-between; border-bottom: 1px solid var(--sj-border); }.crew-rail header div, .open-flight-strip header div, .roster-inspector header div { display: grid; }.crew-rail header span, .open-flight-strip header span, .roster-inspector header span { color: var(--sj-blue); font: 8px var(--sj-font-data); letter-spacing: .11em; }.crew-rail header strong, .open-flight-strip header strong, .roster-inspector header strong { font-size: 13px; }.crew-rail header small, .open-flight-strip header small { color: var(--sj-text-3); font: 9px var(--sj-font-data); }
.crew-search { position: sticky; top: 0; z-index: 12; gap: var(--sj-space-2); background: var(--sj-surface-1); }.crew-search input { min-width: 0; height: var(--sj-control-dense); flex: 1; padding: 0 var(--sj-space-3); border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); color: var(--sj-text-1); background: var(--sj-canvas); font-size: 10px; }.crew-search input::placeholder { color: var(--sj-text-3); }
.crew-card { display: grid; width: 100%; min-height: 82px; padding: 0 var(--sj-space-4); align-items: center; grid-template-columns: minmax(0, 1fr) auto auto; gap: var(--sj-space-2); border: 0; border-bottom: 1px solid var(--sj-border); color: var(--sj-text-1); text-align: left; background: transparent; }.crew-card:hover, .crew-card.selected { background: var(--sj-surface-3); }.crew-card.selected { box-shadow: inset 2px 0 var(--sj-blue); }.crew-card > strong { overflow: hidden; font: 750 12px var(--sj-font-data); text-overflow: ellipsis; white-space: nowrap; }.crew-card > b { padding: 1px var(--sj-space-1); border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-tag); color: var(--sj-blue); font: 750 8px var(--sj-font-data); white-space: nowrap; }.crew-card > span { color: var(--sj-text-3); font: 8px var(--sj-font-data); white-space: nowrap; }
.schedule-canvas { min-width: 0; overflow: visible; background: var(--sj-canvas); }.schedule-axis { position: sticky; top: 0; z-index: 10; display: grid; min-width: 660px; height: 58px; grid-template-columns: repeat(3, minmax(220px, 1fr)); border-bottom: 1px solid var(--sj-border); background: var(--sj-surface-1); }.schedule-axis > div { position: relative; display: flex; padding: var(--sj-space-2) var(--sj-space-3) 17px; align-items: center; gap: var(--sj-space-2); border-right: 1px solid var(--sj-border); }.schedule-axis > div.today { background: var(--sj-lime-soft); box-shadow: inset 0 -2px var(--sj-lime); }.schedule-axis strong { font: 750 11px var(--sj-font-data); }.schedule-axis .today strong { color: var(--sj-lime); }.schedule-axis span { color: var(--sj-text-3); font-size: 9px; }.schedule-axis i { position: absolute; right: 0; bottom: 3px; left: 0; display: grid; grid-template-columns: repeat(4, 1fr); font-style: normal; }.schedule-axis i b { padding-left: var(--sj-space-1); color: var(--sj-text-disabled); font: 8px var(--sj-font-data); }
.schedule-rows { min-width: 660px; }.schedule-row { position: relative; height: 82px; border-bottom: 1px solid var(--sj-border); transition: opacity var(--sj-duration-fast); }.schedule-row.dimmed { opacity: .28; }.time-grid { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(12, 1fr); }.time-grid span { border-right: 1px solid var(--sj-grid); }.duty-card { position: absolute; z-index: 2; top: var(--sj-space-2); bottom: var(--sj-space-2); display: grid; min-width: 118px; padding: var(--sj-space-2); align-content: center; gap: 2px; overflow: hidden; border: 1px solid var(--sj-border-strong); border-left: 3px solid var(--sj-blue); border-radius: var(--sj-radius-control); color: var(--sj-text-1); text-align: left; background: var(--sj-surface-3); }.duty-card:hover, .duty-card.selected { border-color: var(--sj-blue); box-shadow: var(--sj-shadow-selected); }.duty-card.confirmed { border-left-color: var(--sj-lime); }.duty-card.draft { border-left-color: var(--sj-amber); }.duty-card.conflict { border-left-color: var(--sj-red); background: var(--sj-red-soft); }.duty-card > span { display: flex; align-items: center; gap: var(--sj-space-2); }.duty-card span b { padding: 1px var(--sj-space-1); border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-tag); color: var(--sj-text-2); font: 8px var(--sj-font-data); }.duty-card span strong { color: var(--sj-text-1); font: 750 10px var(--sj-font-data); }.duty-card em { font: 750 11px var(--sj-font-data); font-style: normal; white-space: nowrap; }.duty-card time { color: var(--sj-text-3); font: 8px var(--sj-font-data); white-space: nowrap; }.schedule-legend { display: flex; min-height: 40px; padding: 0 var(--sj-space-3); align-items: center; gap: var(--sj-space-4); color: var(--sj-text-2); font-size: 9px; }.schedule-legend span { display: inline-flex; align-items: center; gap: var(--sj-space-1); }.schedule-legend i { width: 7px; height: 7px; border-radius: 50%; }.schedule-legend .confirmed { background: var(--sj-lime); }.schedule-legend .draft { background: var(--sj-amber); }.schedule-legend .conflict { background: var(--sj-red); }.schedule-legend small { margin-left: auto; color: var(--sj-text-3); }
.roster-inspector { position: absolute; z-index: 20; top: 0; right: 0; bottom: 0; display: flex; width: 332px; min-width: 0; flex-direction: column; border-left: 1px solid var(--sj-border); background: var(--sj-surface-1); box-shadow: var(--sj-shadow-panel); }.roster-inspector header button { display: grid; }.flight-identity { display: grid; padding: var(--sj-space-5); gap: var(--sj-space-2); border-bottom: 1px solid var(--sj-border); background: var(--sj-blue-soft); }.flight-identity.pending { background: var(--sj-amber-soft); }.flight-identity > span { display: flex; align-items: center; gap: var(--sj-space-2); color: var(--sj-text-2); font: 700 11px var(--sj-font-data); }.flight-identity > span b { padding: 1px var(--sj-space-1); border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-tag); font-size: 8px; }.flight-identity > strong { font: 800 22px var(--sj-font-data); }.flight-identity time { color: var(--sj-text-2); font: 10px var(--sj-font-data); }.inspector-section { padding: var(--sj-space-4); border-bottom: 1px solid var(--sj-border); }.inspector-section h3 { margin: 0 0 var(--sj-space-3); color: var(--sj-text-3); font-size: 9px; letter-spacing: .08em; }.assigned-crew { display: grid; gap: var(--sj-space-2); }.assigned-crew > span { display: grid; min-height: 42px; padding: 0 var(--sj-space-3); align-items: center; grid-template-columns: 34px 1fr auto; gap: var(--sj-space-2); border-bottom: 1px solid var(--sj-border); }.assigned-crew span b { color: var(--sj-blue); font: 750 8px var(--sj-font-data); }.assigned-crew span strong { color: var(--sj-text-1); font-size: 11px; }.assigned-crew span em { color: var(--sj-text-3); font: 8px var(--sj-font-data); font-style: normal; }.limit-list { display: grid; margin: 0; gap: var(--sj-space-2); }.limit-list div { display: flex; justify-content: space-between; }.limit-list dt { color: var(--sj-text-3); font-size: 10px; }.limit-list dd { margin: 0; color: var(--sj-text-1); font: 10px var(--sj-font-data); }.alert-panel, .match-reason { display: flex; margin: var(--sj-space-4); padding: var(--sj-space-3); gap: var(--sj-space-3); border: 1px solid var(--sj-red); border-radius: var(--sj-radius-control); color: var(--sj-red); background: var(--sj-red-soft); }.match-reason { border-color: var(--sj-blue); color: var(--sj-blue); background: var(--sj-blue-soft); }.alert-panel > svg, .match-reason > svg { width: 16px; flex: 0 0 16px; }.alert-panel div, .match-reason div { display: grid; gap: var(--sj-space-1); }.alert-panel strong, .match-reason strong { font-size: 11px; }.alert-panel span, .match-reason span { color: var(--sj-text-2); font-size: 9px; line-height: 1.5; }.crew-selection-grid { display: grid; gap: var(--sj-space-3); }.crew-select { display: grid; gap: var(--sj-space-2); }.crew-select span { color: var(--sj-text-3); font-size: 9px; }.roster-inspector footer { display: flex; margin-top: auto; padding: var(--sj-space-4); gap: var(--sj-space-2); border-top: 1px solid var(--sj-border); }.roster-inspector footer button { flex: 1; }.inspector-empty { display: grid; flex: 1; place-items: center; color: var(--sj-text-3); font-size: 11px; }
.open-flight-strip { display: grid; min-width: 0; grid-template-columns: 244px minmax(0, 1fr) 140px; border-bottom: 1px solid var(--sj-border-strong); background: var(--sj-surface-1); }.open-flight-strip > header { min-height: 72px; border-right: 1px solid var(--sj-border); border-bottom: 0; background: var(--sj-surface-2); }.open-flight-list { display: grid; min-width: 0; grid-auto-flow: column; grid-auto-columns: minmax(220px, 270px); overflow-x: auto; overflow-y: hidden; scroll-snap-type: x proximity; scrollbar-color: var(--sj-border-strong) var(--sj-surface-1); }.open-flight-list:focus-visible { outline: 2px solid var(--sj-blue); outline-offset: -2px; }.open-flight-list > button { display: grid; min-height: 72px; padding: var(--sj-space-2) var(--sj-space-3); grid-template-columns: auto 1fr; align-content: center; gap: 2px var(--sj-space-3); border: 0; border-right: 1px solid var(--sj-border); color: var(--sj-text-1); text-align: left; background: transparent; scroll-snap-align: start; }.open-flight-list > button:hover, .open-flight-list > button.selected { background: var(--sj-surface-3); }.open-flight-list > button.selected { box-shadow: inset 0 2px var(--sj-blue); }.open-flight-list button > strong { color: var(--sj-text-1); font: 750 11px var(--sj-font-data); }.open-flight-list button em { font: 750 12px var(--sj-font-data); font-style: normal; }.open-flight-list button time { grid-column: 1 / -1; color: var(--sj-text-3); font: 8px var(--sj-font-data); }.open-flight-list > p { display: grid; min-width: 100%; min-height: 72px; margin: 0; place-items: center; color: var(--sj-text-3); font-size: 10px; }.open-flight-action { display: grid; min-height: 72px; padding: var(--sj-space-3); place-items: center; border-left: 1px solid var(--sj-border); background: var(--sj-surface-2); }.open-flight-action .primary-action { width: 100%; padding-inline: var(--sj-space-3); white-space: nowrap; }
.open-flight-strip { flex: 0 0 auto; }
.leg-list { max-height: 330px; overflow-y: auto; }.selection-empty { display: grid; min-height: 260px; place-content: center; justify-items: center; gap: var(--sj-space-2); color: var(--sj-text-3); }.selection-empty svg { width: 28px; color: var(--sj-blue); }.selection-empty strong { color: var(--sj-text-1); font-size: 13px; }.selection-empty span { font-size: 9px; }
.crew-role-filter { display: grid; padding: var(--sj-space-3) var(--sj-space-4) 0; grid-template-columns: repeat(4, minmax(0, 1fr)); }.crew-role-filter button { min-height: var(--sj-control-dense); padding: 0 var(--sj-space-2); border: 1px solid var(--sj-border-strong); border-right: 0; color: var(--sj-text-2); background: var(--sj-canvas); font-size: 9px; font-weight: 700; }.crew-role-filter button:first-child { border-radius: var(--sj-radius-control) 0 0 var(--sj-radius-control); }.crew-role-filter button:last-child { border-right: 1px solid var(--sj-border-strong); border-radius: 0 var(--sj-radius-control) var(--sj-radius-control) 0; }.crew-role-filter button:hover { color: var(--sj-text-1); background: var(--sj-surface-3); }.crew-role-filter button.active { color: var(--sj-text-1); background: var(--sj-blue-soft); box-shadow: inset 0 -2px var(--sj-blue); }.roster-crew-search { padding: var(--sj-space-2) var(--sj-space-4) var(--sj-space-3); border-bottom: 1px solid var(--sj-border); }.roster-crew-search input { width: 100%; height: var(--sj-control-default); padding: 0 var(--sj-space-3); border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); color: var(--sj-text-1); background: var(--sj-canvas); font-size: 10px; }.roster-crew-options { max-height: 340px; padding: var(--sj-space-2) var(--sj-space-4); overflow-y: auto; }.roster-crew-options label { display: grid; min-height: 52px; padding: var(--sj-space-2); align-items: center; grid-template-columns: 18px 34px 1fr auto; gap: var(--sj-space-2); border-bottom: 1px solid var(--sj-border); cursor: pointer; }.roster-crew-options label:hover, .roster-crew-options label.selected { background: var(--sj-surface-3); }.roster-crew-options label > input { width: 14px; height: 14px; accent-color: var(--sj-blue); }.roster-crew-options label > b { color: var(--sj-blue); font: 750 8px var(--sj-font-data); }.roster-crew-options label > span { display: grid; gap: 2px; }.roster-crew-options label strong { font-size: 11px; }.roster-crew-options label small { color: var(--sj-text-3); font-size: 8px; }.roster-crew-options label em { display: inline-flex; align-items: center; gap: var(--sj-space-1); color: var(--sj-lime); font-size: 8px; font-style: normal; }.roster-crew-options label.warning em { color: var(--sj-amber); }.roster-crew-options label.conflict em { color: var(--sj-red); }.roster-crew-options label.rest em { color: var(--sj-blue); }.roster-crew-options label em i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }.roster-crew-options > p { margin: var(--sj-space-5); color: var(--sj-text-3); text-align: center; font-size: 9px; }.assignment-crew-panel .validation-message { margin-top: var(--sj-space-3); }
.leave-overlay { position: fixed; z-index: 1200; inset: 0; display: flex; justify-content: flex-end; background: color-mix(in srgb, var(--sj-canvas) 72%, transparent); }.leave-panel { display: flex; width: min(520px, 94vw); min-height: 100%; flex-direction: column; border-left: 1px solid var(--sj-border-strong); background: var(--sj-surface-1); box-shadow: var(--sj-shadow-panel); }.leave-panel > header { display: flex; min-height: 60px; padding: 0 var(--sj-space-4); align-items: center; justify-content: space-between; border-bottom: 1px solid var(--sj-border); }.leave-panel > header div { display: grid; }.leave-panel > header span { color: var(--sj-blue); font: 8px var(--sj-font-data); letter-spacing: .11em; }.leave-panel > header strong { font-size: 14px; }.leave-panel > header button { display: grid; width: var(--sj-control-default); height: var(--sj-control-default); place-items: center; border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); color: var(--sj-text-2); background: var(--sj-surface-2); }.leave-panel > header svg { width: 15px; }.leave-form { display: grid; padding: var(--sj-space-4); grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sj-space-3); border-bottom: 1px solid var(--sj-border); background: var(--sj-surface-2); }.leave-form label { display: grid; gap: var(--sj-space-1); }.leave-form label:first-child { grid-column: 1 / -1; }.leave-form label span { color: var(--sj-text-3); font-size: 9px; }.leave-form select, .leave-form input { width: 100%; height: var(--sj-control-default); padding: 0 var(--sj-space-3); border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); color: var(--sj-text-1); background: var(--sj-surface-1); font-size: 10px; }.leave-form > button { grid-column: 1 / -1; }.leave-list > header { display: flex; min-height: 48px; padding: 0 var(--sj-space-4); align-items: center; justify-content: space-between; border-bottom: 1px solid var(--sj-border); }.leave-list > header strong { font-size: 12px; }.leave-list > header small { color: var(--sj-text-3); font: 9px var(--sj-font-data); }.leave-list article { display: grid; min-height: 76px; padding: var(--sj-space-3) var(--sj-space-4); grid-template-columns: 1fr auto; gap: var(--sj-space-1) var(--sj-space-3); border-bottom: 1px solid var(--sj-border); }.leave-list article > span { display: flex; align-items: center; gap: var(--sj-space-2); }.leave-list article span strong { font-size: 12px; }.leave-list article span b { padding: 1px var(--sj-space-1); border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-tag); color: var(--sj-text-2); font-size: 8px; }.leave-list article time { color: var(--sj-text-2); font: 9px var(--sj-font-data); }.leave-list article small { grid-row: 2; color: var(--sj-text-3); font-size: 9px; }.leave-list article em { display: inline-flex; grid-row: 1 / 3; grid-column: 2; align-self: center; align-items: center; gap: var(--sj-space-1); color: var(--sj-amber); font-size: 9px; font-style: normal; }.leave-list article em.approved { color: var(--sj-lime); }.leave-list article em i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
@media (max-width: 1439px) { .crew-roster-page.inspector-visible > :is(.filter-bar, .roster-workspace, .open-flight-strip) { margin-right: 0; }.assignment-body { grid-template-columns: minmax(220px, .65fr) minmax(360px, 1.2fr) minmax(290px, .9fr); }.roster-workspace, .roster-workspace.has-inspector { grid-template-columns: 220px minmax(0, 1fr); }.roster-inspector { position: fixed; z-index: 1000; top: 0; right: 0; bottom: 0; width: 352px; max-width: 92vw; border-left: 1px solid var(--sj-border); box-shadow: var(--sj-shadow-panel); transform: translateX(100%); transition: transform var(--sj-duration-panel); }.roster-inspector.open { transform: translateX(0); }.roster-inspector header button { display: grid; }.open-flight-strip { grid-template-columns: 220px minmax(0, 1fr) 132px; overflow: hidden; }.open-flight-list { grid-auto-columns: minmax(240px, 300px); } }
@media (max-width: 1199px) { .assignment-body { grid-template-columns: minmax(220px, .7fr) minmax(0, 1.3fr); }.assignment-crew-panel { grid-column: 1 / -1; border-top: 1px solid var(--sj-border); }.assignment-crew-panel .crew-selection-grid, .crew-preview { grid-template-columns: repeat(3, minmax(0, 1fr)); }.validation-message { margin-top: var(--sj-space-3); }.filter-bar { overflow-x: auto; padding-inline: var(--sj-space-3); }.filter-bar label { min-width: 140px; }.date-control { min-width: 260px; }.filter-actions { min-width: max-content; }.roster-workspace { grid-template-columns: 188px minmax(620px, 1fr); overflow-x: auto; }.crew-rail { position: sticky; left: 0; z-index: 6; }.open-flight-strip { grid-template-columns: 188px minmax(0, 1fr) 124px; }.open-flight-list { grid-auto-columns: minmax(260px, 300px); }.schedule-legend small { display: none; } }
@media (max-width: 699px) { .assignment-header { grid-template-columns: 1fr var(--sj-control-default); }.unit-switch { grid-row: 2; grid-column: 1 / -1; }.unit-switch button { flex: 1; }.assignment-body { display: block; }.target-panel { max-height: 300px; overflow-y: auto; }.target-detail > header, .assignment-crew-panel > header { padding-inline: var(--sj-space-3); }.leg-list { padding: var(--sj-space-3); }.leg-list article { grid-template-columns: 30px 1fr; }.leg-list article time { grid-column: 2; }.assignment-crew-panel .crew-selection-grid, .crew-preview { grid-template-columns: 1fr; }.assignment-footer { align-items: stretch; flex-direction: column; padding-block: var(--sj-space-3); gap: var(--sj-space-2); }.assignment-footer > div button { flex: 1; }.roster-workspace { grid-template-columns: 150px minmax(620px, 1fr); }.crew-card { min-height: 82px; padding-inline: var(--sj-space-2); grid-template-columns: minmax(0, 1fr) auto; gap: var(--sj-space-1); }.crew-card > span { grid-column: 1 / -1; }.open-flight-strip { grid-template-columns: 150px minmax(0, 1fr) 112px; }.open-flight-action { padding: var(--sj-space-2); } }
/* New roster workspace: preserve task hierarchy and prioritize crew selection. */
.roster-crew-options label {
  grid-template-columns: 18px 34px minmax(150px, 1fr) minmax(180px, auto);
}
.roster-crew-options label.incompatible {
  cursor: not-allowed;
  opacity: .72;
}
.roster-crew-options label em {
  min-width: 0;
  justify-content: flex-end;
  color: var(--sj-amber);
  font-size: 9px;
  text-align: right;
}
.roster-crew-options label.conflict em { color: var(--sj-red); }
.roster-crew-options label em svg { width: 12px; flex: 0 0 12px; }
.assignment-body {
  grid-template-columns: minmax(300px, .72fr) minmax(520px, 1.48fr);
}
.target-flight-options {
  position: relative;
  margin-left: var(--sj-space-6);
  border-left: 1px solid var(--sj-border-strong);
}

@media (max-width: 1439px) {
  .assignment-body { grid-template-columns: minmax(260px, .72fr) minmax(0, 1.48fr); }
}
@media (max-width: 1199px) {
  .assignment-body { grid-template-columns: minmax(240px, .7fr) minmax(0, 1.3fr); }
  .assignment-crew-panel { grid-column: auto; border-top: 0; }
}
@media (max-width: 699px) {
  .assignment-body { display: block; }
  .assignment-crew-panel > header { padding-inline: var(--sj-space-3); }
  .roster-crew-options label { grid-template-columns: 18px 34px minmax(0, 1fr); }
  .roster-crew-options label em { grid-column: 3; justify-content: flex-start; text-align: left; }
}
</style>

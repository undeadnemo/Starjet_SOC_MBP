<script lang="ts" setup>
import type { CSSProperties } from 'vue';

import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue';
import { useRouter } from 'vue-router';

import {
  ArrowRightLeft,
  CircleAlert,
  Settings,
  UserRoundPen,
  X,
} from '@vben/icons';
import dayjs from 'dayjs';
import {
  ElButton,
  ElDatePicker,
  ElDialog,
  ElDrawer,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElSelect,
  ElTable,
  ElTableColumn,
} from 'element-plus';

defineOptions({ name: 'FlightPlanContent' });

type FlightPhase =
  | 'aog'
  | 'arrived'
  | 'confirmed'
  | 'maintenance'
  | 'preparing';
type FlightType = 'AOG' | 'FERRY' | 'MX' | 'PAX';
type TodoStatus = 'blocked' | 'completed' | 'pending';
type ViewMode = 'calendar' | 'list' | 'timeline';

interface FlightPlanItem {
  aircraft: string;
  date: string;
  flightNo: string;
  from: string;
  fuel: string;
  id: string;
  notes?: string;
  permit: string;
  phase: FlightPhase;
  sta: string;
  std: string;
  to: string;
  type: FlightType;
}

interface FlightTodo {
  content: string;
  id: string;
  status: TodoStatus;
}

interface AirportInfo {
  city: string;
  iata: string;
  name: string;
  timezone: string;
}

const viewMode = ref<ViewMode>('timeline');
const router = useRouter();
const today = dayjs();
const now = ref(dayjs());
const selectedYear = ref(today.year());
const selectedMonth = ref(today.month() + 1);
const selectedDay = ref(today.date());
const aircraftFilter = ref('all');
const typeFilter = ref('all');
const timezone = ref('UTC+08:00 China/Shanghai');
const timelineScrollRef = ref<HTMLElement>();
const timelineHeaderTrackRef = ref<HTMLElement>();
const timelineViewportWidth = ref(0);
const requestedTimelineDays = ref(5);
const addDialogVisible = ref(false);
const inspectorVisible = ref(false);
const selectedFlight = ref<FlightPlanItem>();
let todoSequence = 20;

const airportInfo: Record<string, AirportInfo> = {
  VHHH: { city: '中国香港', iata: 'HKG', name: '香港国际机场', timezone: 'UTC+08:00' },
  ZBAA: { city: '北京', iata: 'PEK', name: '北京首都国际机场', timezone: 'UTC+08:00' },
  ZGGG: { city: '广州', iata: 'CAN', name: '广州白云国际机场', timezone: 'UTC+08:00' },
  ZGSZ: { city: '深圳', iata: 'SZX', name: '深圳宝安国际机场', timezone: 'UTC+08:00' },
  ZSPD: { city: '上海', iata: 'PVG', name: '上海浦东国际机场', timezone: 'UTC+08:00' },
  ZSSS: { city: '上海', iata: 'SHA', name: '上海虹桥国际机场', timezone: 'UTC+08:00' },
  ZUUU: { city: '成都', iata: 'CTU', name: '成都双流国际机场', timezone: 'UTC+08:00' },
};

const todoStatusOptions = [
  { color: 'lime', label: '完成', value: 'completed' },
  { color: 'amber', label: '待处理', value: 'pending' },
  { color: 'red', label: '阻碍', value: 'blocked' },
] as const;

const aircraftToneByRegistration: Record<string, string> = {
  'B-602M': 'teal',
  'B-801Q': 'amber',
  'B-9308': 'blue',
  'B-9811': 'purple',
};
const aircraftToneFallbacks = ['blue', 'teal', 'purple', 'amber', 'lime'] as const;
const flightTypeIcons = {
  AOG: CircleAlert,
  FERRY: ArrowRightLeft,
  MX: Settings,
  PAX: UserRoundPen,
} as const;

const flightTodos = reactive<Record<string, FlightTodo[]>>({
  'FP-205': [
    { content: '确认浦东地服保障窗口', id: 'TODO-1', status: 'pending' },
    { content: '补充航路许可文件', id: 'TODO-2', status: 'blocked' },
  ],
  'FP-206': [
    { content: '协调航材到场时间', id: 'TODO-3', status: 'blocked' },
    { content: '更新 AOG 恢复预估', id: 'TODO-4', status: 'pending' },
  ],
  'FP-210': [
    { content: '确认广州白云 FBO 停机位', id: 'TODO-5', status: 'completed' },
    { content: '确认旅客特殊餐食', id: 'TODO-6', status: 'pending' },
    { content: '等待加油订单回执', id: 'TODO-7', status: 'blocked' },
  ],
});

const newTodo = reactive({
  content: '',
});

const flights = ref<FlightPlanItem[]>([
  { aircraft: 'B-9308', date: '2026-08-16', flightNo: 'SJX301', from: 'ZSSS', fuel: '加油 WFS 已确认', id: 'FP-201', permit: 'HK PSP/BAC 已确认', phase: 'arrived', sta: '1215', std: '0840', to: 'VHHH', type: 'PAX' },
  { aircraft: 'B-9308', date: '2026-08-16', flightNo: 'SJX302', from: 'VHHH', fuel: '加油 WFS 异常', id: 'FP-202', permit: 'HK PSP/BAC 已确认', phase: 'confirmed', sta: '1520', std: '1430', to: 'ZGSZ', type: 'FERRY' },
  { aircraft: 'B-9811', date: '2026-08-17', flightNo: 'SJX118', from: 'ZGSZ', fuel: '加油 WFS 异常', id: 'FP-203', permit: '许可 & 地服 已确认', phase: 'preparing', sta: '1150', std: '0910', to: 'ZBAA', type: 'PAX' },
  { aircraft: 'B-9811', date: '2026-08-17', flightNo: 'SJX119', from: 'ZBAA', fuel: '加油 WFS 已确认', id: 'FP-204', permit: '许可 & 地服 已确认', phase: 'confirmed', sta: '1710', std: '1520', to: 'ZGSZ', type: 'PAX' },
  { aircraft: 'B-9308', date: '2026-08-18', flightNo: 'SJX220', from: 'ZBAA', fuel: '加油 WFS 异常', id: 'FP-205', permit: '许可 / 地服待处理 异常', phase: 'preparing', sta: '0805', std: '0630', to: 'ZSPD', type: 'PAX' },
  { aircraft: 'B-801Q', date: '2026-08-19', flightNo: 'AOG-801', from: 'ZUUU', fuel: '加油不适用', id: 'FP-206', permit: '航材与放行协调中 异常', phase: 'aog', sta: '2359', std: '0000', to: 'ZUUU', type: 'AOG' },
  { aircraft: 'B-602M', date: '2026-08-19', flightNo: 'SJX602', from: 'ZUUU', fuel: '加油 WFS 异常', id: 'FP-207', permit: '许可 & 地服 已确认', phase: 'confirmed', sta: '1530', std: '1100', to: 'ZSPD', type: 'FERRY' },
  { aircraft: 'B-801Q', date: '2026-08-20', flightNo: 'MX-801', from: 'ZUUU', fuel: '加油不适用', id: 'FP-208', permit: '许可 / 地服待处理 异常', phase: 'aog', sta: '1200', std: '0900', to: 'ZUUU', type: 'MX' },
  { aircraft: 'B-9811', date: '2026-08-20', flightNo: 'MX-207', from: 'ZSPD', fuel: '加油不适用', id: 'FP-209', permit: '机务窗口 已确认', phase: 'maintenance', sta: '1800', std: '1000', to: 'ZSPD', type: 'MX' },
  { aircraft: 'B-9308', date: '2026-08-21', flightNo: 'SJX305', from: 'ZSPD', fuel: '加油 WFS 异常', id: 'FP-210', permit: '许可 & 地服 已确认', phase: 'confirmed', sta: '1620', std: '1330', to: 'ZGGG', type: 'PAX' },
  { aircraft: 'B-602M', date: '2026-08-22', flightNo: 'SJX603', from: 'ZGGG', fuel: '加油 WFS 已确认', id: 'FP-211', permit: '许可 & 地服 已确认', phase: 'arrived', sta: '1040', std: '0820', to: 'ZGSZ', type: 'PAX' },
]);

const addForm = reactive({
  aircraft: '',
  date: today.format('YYYY-MM-DD'),
  from: '',
  sta: '1200',
  std: '1000',
  to: '',
  type: 'PAX' as FlightType,
});

const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const yearOptions = [selectedYear.value - 1, selectedYear.value, selectedYear.value + 1];
const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);

const days = computed(() => {
  const firstDay = dayjs(`${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}-01`);
  return Array.from({ length: firstDay.daysInMonth() }, (_, index) => {
    const date = firstDay.date(index + 1);
    return {
      day: index + 1,
      isToday: date.isSame(today, 'day'),
      key: date.format('YYYY-MM-DD'),
      label: `${selectedMonth.value}月${index + 1}日`,
      weekday: weekdays[date.day()],
    };
  });
});

const aircraftOptions = computed(() => [...new Set(flights.value.map((flight) => flight.aircraft))]);
const filteredFlights = computed(() => flights.value.filter((flight) =>
  (aircraftFilter.value === 'all' || flight.aircraft === aircraftFilter.value) &&
  (typeFilter.value === 'all' || flight.type === typeFilter.value),
));
const visibleMonthFlights = computed(() => {
  const prefix = `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}`;
  return filteredFlights.value.filter((flight) => flight.date.startsWith(prefix));
});
const operationalMetrics = computed(() => [
  { label: '计划任务', tone: 'blue', value: visibleMonthFlights.value.length },
  { label: 'AOG 停场', tone: 'red', value: visibleMonthFlights.value.filter((flight) => flight.type === 'AOG').length },
  { label: '保障异常', tone: 'amber', value: visibleMonthFlights.value.filter((flight) => flight.fuel.includes('异常') || flight.permit.includes('异常')).length },
  { label: '排班冲突', tone: 'coral', value: 0 },
  { label: '按时放行率', tone: 'lime', value: '92%' },
]);
const visibleTimelineDays = computed(() => requestedTimelineDays.value);
const timelineStyle = computed<CSSProperties>(() => {
  const columnWidth = timelineViewportWidth.value / visibleTimelineDays.value;
  return {
    '--timeline-days': days.value.length,
    width: timelineViewportWidth.value > 0
      ? `${columnWidth * days.value.length}px`
      : `${(days.value.length * 100) / visibleTimelineDays.value}%`,
  };
});
const currentTimeTop = computed(() => (
  (now.value.hour() * 60 + now.value.minute() + now.value.second() / 60) / 1440
) * 100);
const currentTimeLabel = computed(() => now.value.format('HH:mm'));
const selectedFlightTodos = computed(() => selectedFlight.value
  ? (flightTodos[selectedFlight.value.id] ?? [])
  : []);
const selectedDepartureAirport = computed(() => selectedFlight.value
  ? getAirportInfo(selectedFlight.value.from)
  : undefined);
const selectedArrivalAirport = computed(() => selectedFlight.value
  ? getAirportInfo(selectedFlight.value.to)
  : undefined);

function flightsForDay(date: string) {
  return visibleMonthFlights.value.filter((flight) => flight.date === date);
}

function getAirportInfo(code: string): AirportInfo {
  return airportInfo[code] ?? {
    city: '待补充',
    iata: '—',
    name: '机场资料待补充',
    timezone: timezone.value.split(' ')[0] ?? 'UTC',
  };
}

function getTodoStatus(status: TodoStatus) {
  return todoStatusOptions.find((item) => item.value === status) ?? todoStatusOptions[1];
}

function getAircraftStyle(aircraft: string): CSSProperties {
  const hash = Array.from(aircraft).reduce((total, character) => total + character.codePointAt(0)!, 0);
  const tone = aircraftToneByRegistration[aircraft]
    ?? aircraftToneFallbacks[hash % aircraftToneFallbacks.length];
  return {
    '--aircraft-color': `var(--sj-${tone})`,
    '--aircraft-soft': `var(--sj-${tone}-soft)`,
  };
}

function todosForFlight(flight: FlightPlanItem) {
  return flightTodos[flight.id] ?? buildDefaultTodos(flight);
}

function formatTodoForCard(content: string) {
  const characters = Array.from(content);
  return characters.length > 15 ? `${characters.slice(0, 15).join('')}…` : content;
}

function buildDefaultTodos(flight: FlightPlanItem): FlightTodo[] {
  return [
    {
      content: flight.permit,
      id: `${flight.id}-PERMIT`,
      status: flight.permit.includes('已确认') ? 'completed' : 'pending',
    },
    {
      content: flight.fuel,
      id: `${flight.id}-FUEL`,
      status: flight.fuel.includes('异常')
        ? 'blocked'
        : flight.fuel.includes('已确认')
          ? 'completed'
          : 'pending',
    },
  ];
}

function ensureFlightTodos(flight: FlightPlanItem) {
  if (flightTodos[flight.id]) return;
  flightTodos[flight.id] = buildDefaultTodos(flight);
}

function formatFlightTime(time: string) {
  return `${time.slice(0, 2)}:${time.slice(2)}Z`;
}

function flightDuration(flight: FlightPlanItem) {
  const start = Number(flight.std.slice(0, 2)) * 60 + Number(flight.std.slice(2));
  const end = Number(flight.sta.slice(0, 2)) * 60 + Number(flight.sta.slice(2));
  const duration = end >= start ? end - start : 1440 - start + end;
  return `${Math.floor(duration / 60)} 小时 ${String(duration % 60).padStart(2, '0')} 分`;
}

function flightTimeToMinutes(time: string) {
  return Number(time.slice(0, 2)) * 60 + Number(time.slice(2));
}

function getTurnaroundLabel(flight: FlightPlanItem) {
  const departureMinute = flightTimeToMinutes(flight.std);
  const previousFlight = flights.value
    .filter((item) =>
      item.id !== flight.id &&
      item.aircraft === flight.aircraft &&
      item.date === flight.date &&
      flightTimeToMinutes(item.std) < departureMinute,
    )
    .sort((left, right) => flightTimeToMinutes(right.std) - flightTimeToMinutes(left.std))[0];

  if (!previousFlight) return undefined;
  const turnaroundMinutes = departureMinute - flightTimeToMinutes(previousFlight.sta);
  if (turnaroundMinutes < 0 || turnaroundMinutes >= 240) return undefined;

  const hours = Math.floor(turnaroundMinutes / 60);
  const minutes = turnaroundMinutes % 60;
  const duration = [hours ? `${hours}小时` : '', minutes ? `${minutes}分` : '']
    .filter(Boolean)
    .join('');
  return `过站 ${duration || '0分'}`;
}

function getCardStyle(flight: FlightPlanItem, index: number): CSSProperties {
  const startMinute = Number(flight.std.slice(0, 2)) * 60 + Number(flight.std.slice(2));
  const top = Math.max(0.8, Math.min(94, (startMinute / 1440) * 100));
  const todos = todosForFlight(flight);
  const longestTodo = Math.max(0, ...todos.map((todo) => Math.min(Array.from(todo.content).length, 15)));
  const preferredTodosWidth = Math.max(
    96,
    Math.min(176, longestTodo * 6.5 + Math.min(todos.length, 6) * 6),
  );
  const columnWidth = timelineViewportWidth.value > 0
    ? timelineViewportWidth.value / visibleTimelineDays.value
    : 300;
  const maxCardWidth = Math.max(220, columnWidth - 14);
  const todosWidth = Math.min(preferredTodosWidth, maxCardWidth * 0.48);
  const cardWidth = Math.min(maxCardWidth, 180 + todosWidth);
  return {
    ...getAircraftStyle(flight.aircraft),
    '--card-width': `${cardWidth}px`,
    '--todos-width': `${todosWidth}px`,
    top: `calc(${top}% + ${(index % 2) * 5}px)`,
  };
}

async function scrollToDay(day: number, behavior: ScrollBehavior = 'smooth') {
  await nextTick();
  const scroller = timelineScrollRef.value;
  const target = scroller?.querySelector<HTMLElement>(`[data-day="${day}"]`);
  if (!scroller || !target) return;
  const left = target.offsetLeft - (scroller.clientWidth - target.offsetWidth) / 2;
  scroller.scrollTo({ behavior, left: Math.max(0, left) });
}

async function goToday() {
  selectedYear.value = today.year();
  selectedMonth.value = today.month() + 1;
  selectedDay.value = today.date();
  await scrollToDay(today.date());
}

function openFlight(flight: FlightPlanItem) {
  ensureFlightTodos(flight);
  selectedFlight.value = flight;
  newTodo.content = '';
  inspectorVisible.value = true;
}

function goToFlightDetail(flight: FlightPlanItem) {
  const isDemo = router.currentRoute.value.path.startsWith('/demo/');
  const isPreview = router.currentRoute.value.path.startsWith('/preview/');
  void router.push({
    name: isDemo ? 'FlightDetailDemo' : isPreview ? 'FlightDetailPreview' : 'FlightDetail',
    params: { flightId: flight.id },
    query: {
      aircraft: flight.aircraft,
      date: flight.date,
      flightNo: flight.flightNo,
      from: flight.from,
      sta: flight.sta,
      std: flight.std,
      to: flight.to,
      type: flight.type,
    },
  });
}

function addTodo() {
  const flight = selectedFlight.value;
  const content = newTodo.content.trim();
  if (!flight || !content) {
    ElMessage.warning('请填写待办内容');
    return;
  }
  ensureFlightTodos(flight);
  flightTodos[flight.id]?.push({
    content,
    id: `TODO-${++todoSequence}`,
    status: 'pending',
  });
  newTodo.content = '';
  ElMessage.success('待办事项已添加');
}

async function deleteTodo(todo: FlightTodo) {
  const flight = selectedFlight.value;
  if (!flight) return;
  try {
    await ElMessageBox.confirm(
      `确认删除“${todo.content}”？`,
      '删除待办事项',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' },
    );
  } catch {
    return;
  }
  const items = flightTodos[flight.id];
  const index = items?.findIndex((item) => item.id === todo.id) ?? -1;
  if (index >= 0) items?.splice(index, 1);
  ElMessage.success('待办事项已删除');
}

function saveFlight() {
  if (!addForm.aircraft || !addForm.date || !addForm.from || !addForm.to) {
    ElMessage.warning('请填写注册号、日期和起降机场');
    return;
  }
  flights.value.push({
    aircraft: addForm.aircraft.toUpperCase(),
    date: addForm.date,
    flightNo: `SJX${String(flights.value.length + 301)}`,
    from: addForm.from.toUpperCase(),
    fuel: addForm.type === 'MX' || addForm.type === 'AOG' ? '加油不适用' : '加油待确认',
    id: `FP-${String(flights.value.length + 201)}`,
    notes: `PF ${addForm.std}Z-${addForm.sta}Z 已确认\n许可 & 地服待处理\n${addForm.type === 'MX' || addForm.type === 'AOG' ? '加油不适用' : '加油待确认'}`,
    permit: '许可 & 地服待处理',
    phase: addForm.type === 'MX' ? 'maintenance' : 'preparing',
    sta: addForm.sta,
    std: addForm.std,
    to: addForm.to.toUpperCase(),
    type: addForm.type,
  });
  addDialogVisible.value = false;
  ElMessage.success('航班已加入当前计划');
}

let dragStartX = 0;
let dragStartScrollLeft = 0;
let dragging = false;

function onTimelinePointerDown(event: PointerEvent) {
  if ((event.target as HTMLElement).closest('.flight-card')) return;
  const scroller = timelineScrollRef.value;
  if (!scroller) return;
  dragging = true;
  dragStartX = event.clientX;
  dragStartScrollLeft = scroller.scrollLeft;
  scroller.classList.add('is-dragging');
  scroller.setPointerCapture(event.pointerId);
}

function onTimelinePointerMove(event: PointerEvent) {
  if (!dragging || !timelineScrollRef.value) return;
  timelineScrollRef.value.scrollLeft = dragStartScrollLeft - (event.clientX - dragStartX);
}

function onTimelinePointerUp(event: PointerEvent) {
  dragging = false;
  timelineScrollRef.value?.classList.remove('is-dragging');
  if (timelineScrollRef.value?.hasPointerCapture(event.pointerId)) {
    timelineScrollRef.value.releasePointerCapture(event.pointerId);
  }
}

function onTimelineScroll() {
  const scroller = timelineScrollRef.value;
  const headerTrack = timelineHeaderTrackRef.value;
  if (!scroller || !headerTrack) return;
  headerTrack.style.transform = `translateX(${-scroller.scrollLeft}px)`;
}

watch([selectedYear, selectedMonth, requestedTimelineDays], async () => {
  selectedDay.value = Math.min(selectedDay.value, days.value.length);
  await scrollToDay(selectedDay.value, 'auto');
});

let timelineResizeObserver: ResizeObserver | undefined;
let currentTimeTimer: ReturnType<typeof setInterval> | undefined;

function updateTimelineViewport(width: number) {
  timelineViewportWidth.value = width;
}

async function setupTimelineResizeObserver() {
  timelineResizeObserver?.disconnect();
  timelineResizeObserver = undefined;
  if (viewMode.value !== 'timeline') return;

  await nextTick();
  if (viewMode.value !== 'timeline') return;
  const scroller = timelineScrollRef.value;
  if (!scroller) return;

  updateTimelineViewport(scroller.getBoundingClientRect().width);
  timelineResizeObserver = new ResizeObserver(([entry]) => {
    if (!entry) return;
    updateTimelineViewport(entry.contentRect.width);
  });
  timelineResizeObserver.observe(scroller);
  await scrollToDay(selectedDay.value, 'auto');
}

watch(viewMode, () => {
  void setupTimelineResizeObserver();
});

onMounted(() => {
  now.value = dayjs();
  currentTimeTimer = setInterval(() => {
    now.value = dayjs();
  }, 30_000);
  void setupTimelineResizeObserver();
});

onBeforeUnmount(() => {
  timelineResizeObserver?.disconnect();
  if (currentTimeTimer) clearInterval(currentTimeTimer);
});
</script>

<template>
  <div class="flight-plan-page sj-mission-control">
    <section class="plan-toolbar" aria-label="航班计划筛选">
      <header class="mission-header">
        <div class="mission-identity">
          <span class="soc-mark">SOC</span>
          <span>
            <strong>运行控制中心</strong>
            <small>FLEET {{ aircraftOptions.length }} · TASKS {{ visibleMonthFlights.length }} · UTC BASE</small>
          </span>
        </div>
        <div class="mission-status"><i></i>运行监控中</div>
      </header>
      <div class="toolbar-main">
        <div class="view-switch" aria-label="视图切换">
          <ElButton :class="{ active: viewMode === 'timeline' }" @click="viewMode = 'timeline'">时间线</ElButton>
          <ElButton :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">列表</ElButton>
          <ElButton :class="{ active: viewMode === 'calendar' }" @click="viewMode = 'calendar'">日历</ElButton>
        </div>
        <div class="date-selectors" aria-label="计划日期">
          <ElSelect v-model="selectedYear" aria-label="年份" class="year-select">
            <ElOption v-for="year in yearOptions" :key="year" :label="`${year}年`" :value="year" />
          </ElSelect>
          <ElSelect v-model="selectedMonth" aria-label="月份" class="month-select">
            <ElOption v-for="month in monthOptions" :key="month" :label="`${month}月`" :value="month" />
          </ElSelect>
          <ElSelect v-model="selectedDay" aria-label="日期" class="day-select" @change="scrollToDay(Number($event))">
            <ElOption v-for="day in days" :key="day.day" :label="`${day.day}日`" :value="day.day" />
          </ElSelect>
        </div>
        <ElButton class="today-button" @click="goToday">回到今天</ElButton>
        <div class="toolbar-spacer"></div>
        <label class="timezone-field">
          <span>时区</span>
          <ElSelect v-model="timezone" aria-label="时区">
            <ElOption label="UTC+08:00 China/Shanghai" value="UTC+08:00 China/Shanghai" />
            <ElOption label="UTC+00:00 UTC" value="UTC+00:00 UTC" />
          </ElSelect>
        </label>
        <ElButton type="primary" class="add-button" @click="addDialogVisible = true">添加航班</ElButton>
      </div>
      <div class="toolbar-filters">
        <label>
          <span>注册号</span>
          <ElSelect v-model="aircraftFilter" aria-label="注册号">
            <ElOption label="不限" value="all" />
            <ElOption v-for="aircraft in aircraftOptions" :key="aircraft" :label="aircraft" :value="aircraft" />
          </ElSelect>
        </label>
        <label>
          <span>航班类型</span>
          <ElSelect v-model="typeFilter" aria-label="航班类型">
            <ElOption label="不限" value="all" />
            <ElOption label="客运 PAX" value="PAX" />
            <ElOption label="调机 FERRY" value="FERRY" />
            <ElOption label="维修 MX" value="MX" />
            <ElOption label="AOG" value="AOG" />
          </ElSelect>
        </label>
        <label v-if="viewMode === 'timeline'">
          <span>每屏天数</span>
          <ElSelect v-model="requestedTimelineDays" aria-label="每屏天数">
            <ElOption v-for="count in [3, 4, 5, 6, 7]" :key="count" :label="`${count} 天`" :value="count" />
          </ElSelect>
        </label>
        <p class="task-count">当前显示 <strong>{{ visibleMonthFlights.length }}</strong> 个任务</p>
      </div>
      <div class="operations-strip" aria-label="运行指标">
        <div v-for="metric in operationalMetrics" :key="metric.label" class="operation-metric">
          <i :class="`tone-${metric.tone}`"></i>
          <strong>{{ metric.value }}</strong>
          <span>{{ metric.label }}</span>
        </div>
        <div class="type-filters" aria-label="航班类型快速筛选">
          <button :class="{ active: typeFilter === 'all' }" @click="typeFilter = 'all'">全部</button>
          <button v-for="type in ['PAX', 'FERRY', 'MX', 'AOG']" :key="type" :class="{ active: typeFilter === type }" @click="typeFilter = type">{{ type }}</button>
        </div>
      </div>
    </section>

    <section v-if="viewMode === 'timeline'" class="timeline-panel">
      <div class="timeline-sticky-header">
        <div class="timeline-header-viewport">
          <div
            ref="timelineHeaderTrackRef"
            class="timeline-header timeline-track"
            :style="timelineStyle"
          >
            <div
              v-for="day in days"
              :key="day.key"
              class="day-head"
              :class="{ today: day.isToday }"
            >
              <span>{{ day.isToday ? '今天' : '\u00a0' }}</span>
              <strong>{{ day.label }}</strong>
              <small>{{ day.weekday }}</small>
            </div>
          </div>
        </div>
      </div>
      <div
        ref="timelineScrollRef"
        class="timeline-scroll"
        aria-label="月度航班运行时间线"
        @scroll="onTimelineScroll"
        @pointerdown="onTimelinePointerDown"
        @pointermove="onTimelinePointerMove"
        @pointerup="onTimelinePointerUp"
        @pointercancel="onTimelinePointerUp"
      >
        <div class="timeline-track" :style="timelineStyle">
          <div class="timeline-body">
            <section
              v-for="day in days"
              :key="day.key"
              class="day-column"
              :class="{ today: day.isToday }"
              :data-day="day.day"
              :aria-label="`${day.label} ${day.weekday}`"
            >
              <span
                v-for="hour in [0, 6, 12, 18, 24]"
                :key="hour"
                class="hour-line"
                :style="{ top: `${(hour / 24) * 100}%` }"
              ><i>{{ String(hour).padStart(2, '0') }}:00</i></span>
              <span
                v-if="day.isToday"
                class="current-time-line"
                :style="{ top: `${currentTimeTop}%` }"
                :title="`当前时间 ${currentTimeLabel}`"
              ><i>{{ currentTimeLabel }}</i></span>
              <button
                v-for="(flight, index) in flightsForDay(day.key)"
                :key="flight.id"
                type="button"
                class="flight-card"
                :class="`phase-${flight.phase}`"
                :style="getCardStyle(flight, index)"
                :aria-label="`${flight.type} ${flight.aircraft}，${flight.from} ${formatFlightTime(flight.std)} 至 ${flight.to} ${formatFlightTime(flight.sta)}，${todosForFlight(flight).length} 项待办`"
                @click="openFlight(flight)"
              >
                <span class="flight-main">
                  <span class="flight-card-head">
                    <span>
                      <strong class="flight-type-tag"><component :is="flightTypeIcons[flight.type]" aria-hidden="true" />{{ flight.type }}</strong>
                      <b class="aircraft-color-label">{{ flight.aircraft }}</b>
                    </span>
                  </span>
                  <small v-if="getTurnaroundLabel(flight)" class="flight-turnaround" title="可用过站时间">{{ getTurnaroundLabel(flight) }}</small>
                  <span class="flight-route">
                    <span><b class="airport-code">{{ flight.from }}</b><time>{{ formatFlightTime(flight.std) }}</time></span>
                    <em>→</em>
                    <span><b class="airport-code">{{ flight.to }}</b><time>{{ formatFlightTime(flight.sta) }}</time></span>
                  </span>
                </span>
                <span class="flight-card-todos" aria-label="待办事项">
                  <span v-for="todo in todosForFlight(flight)" :key="todo.id">
                    <i :title="todo.content">{{ formatTodoForCard(todo.content) }}</i>
                    <b
                      class="todo-status-light"
                      :class="`status-${getTodoStatus(todo.status).color}`"
                      :title="getTodoStatus(todo.status).label"
                      :aria-label="getTodoStatus(todo.status).label"
                    ></b>
                  </span>
                </span>
              </button>
            </section>
          </div>
        </div>
      </div>
    </section>

    <section v-else-if="viewMode === 'calendar'" class="alternative-panel">
      <div class="calendar-grid">
        <article v-for="day in days" :key="day.key" class="calendar-day">
          <header><strong>{{ day.label }}</strong><span>{{ day.weekday }}</span></header>
          <button v-for="flight in flightsForDay(day.key)" :key="flight.id" class="calendar-flight" :style="getAircraftStyle(flight.aircraft)" @click="openFlight(flight)">
            <span class="flight-type-tag"><component :is="flightTypeIcons[flight.type]" aria-hidden="true" />{{ flight.type }}</span>
            <span class="aircraft-color-label">{{ flight.aircraft }}</span>
            <span>{{ flight.std }}Z · {{ flight.from }} → {{ flight.to }}</span>
          </button>
        </article>
      </div>
    </section>

    <section v-else class="alternative-panel list-panel">
      <ElTable :data="visibleMonthFlights" stripe>
        <ElTableColumn prop="date" label="日期" width="120" />
        <ElTableColumn label="注册号" width="110"><template #default="{ row }"><span class="aircraft-color-label" :style="getAircraftStyle(row.aircraft)">{{ row.aircraft }}</span></template></ElTableColumn>
        <ElTableColumn label="类型" width="100"><template #default="{ row }"><span class="flight-type-tag"><component :is="flightTypeIcons[row.type as FlightType]" aria-hidden="true" />{{ row.type }}</span></template></ElTableColumn>
        <ElTableColumn label="航段"><template #default="{ row }">{{ row.from }} {{ row.std }}Z - {{ row.sta }}Z {{ row.to }}</template></ElTableColumn>
        <ElTableColumn label="待办事项"><template #default="{ row }">{{ todosForFlight(row).map((todo) => todo.content).join(' / ') }}</template></ElTableColumn>
        <ElTableColumn label="操作" width="90"><template #default="{ row }"><ElButton link type="primary" @click="openFlight(row)">查看</ElButton></template></ElTableColumn>
      </ElTable>
    </section>

    <ElDrawer
      v-model="inspectorVisible"
      append-to-body
      class="flight-inspector-drawer"
      direction="rtl"
      size="min(440px, 94vw)"
      :with-header="false"
    >
      <div v-if="selectedFlight" class="flight-inspector-content">
        <header class="inspector-header">
          <div>
            <small>FLIGHT INSPECTOR</small>
            <h2>航班简介</h2>
          </div>
          <button type="button" aria-label="关闭航班简介" @click="inspectorVisible = false">×</button>
        </header>

        <section class="inspector-flight-summary" aria-label="航班概要" :style="getAircraftStyle(selectedFlight.aircraft)">
          <div class="summary-meta">
            <span class="flight-type-tag"><component :is="flightTypeIcons[selectedFlight.type]" aria-hidden="true" />{{ selectedFlight.type }}</span>
            <strong class="aircraft-color-label">{{ selectedFlight.aircraft }}</strong>
            <i>{{ selectedFlight.flightNo }}</i>
          </div>
          <div class="summary-route">
            <div>
              <strong>{{ selectedFlight.from }}</strong>
              <p>{{ selectedDepartureAirport?.name }}</p>
              <small>{{ selectedDepartureAirport?.timezone }}</small>
              <time>{{ formatFlightTime(selectedFlight.std) }}</time>
            </div>
            <span><i></i><b>→</b><i></i></span>
            <div>
              <strong>{{ selectedFlight.to }}</strong>
              <p>{{ selectedArrivalAirport?.name }}</p>
              <small>{{ selectedArrivalAirport?.timezone }}</small>
              <time>{{ formatFlightTime(selectedFlight.sta) }}</time>
            </div>
          </div>
          <div class="summary-facts">
            <span><small>日期</small>{{ selectedFlight.date }}</span>
            <span><small>计划时长</small>{{ flightDuration(selectedFlight) }}</span>
          </div>
        </section>

        <section class="todo-section" aria-labelledby="todo-section-title">
          <header>
            <div><h3 id="todo-section-title">待办事项</h3><small>{{ selectedFlightTodos.length }} ITEMS</small></div>
            <div class="todo-legend">
              <span v-for="status in todoStatusOptions" :key="status.value" :class="`status-${status.color}`">
                <i class="todo-status-light"></i>{{ status.label }}
              </span>
            </div>
          </header>
          <div class="todo-list">
            <article v-for="todo in selectedFlightTodos" :key="todo.id" class="todo-item">
              <ElInput v-model="todo.content" aria-label="待办内容" class="todo-content-input" />
              <div class="todo-status-lights" role="radiogroup" :aria-label="`待办状态：${getTodoStatus(todo.status).label}`">
                <button
                  v-for="status in todoStatusOptions"
                  :key="status.value"
                  class="todo-status-choice"
                  :class="[`status-${status.color}`, { 'is-active': todo.status === status.value }]"
                  type="button"
                  role="radio"
                  :aria-checked="todo.status === status.value"
                  :aria-label="`设为${status.label}`"
                  :title="status.label"
                  @click="todo.status = status.value"
                >
                  <i class="todo-status-light" aria-hidden="true"></i>
                </button>
              </div>
              <button class="todo-delete-button" type="button" :aria-label="`删除待办：${todo.content}`" @click="deleteTodo(todo)">
                <X />
              </button>
            </article>
            <p v-if="!selectedFlightTodos.length" class="todo-empty">暂无待办事项</p>
          </div>

          <div class="todo-composer">
            <ElInput v-model="newTodo.content" type="textarea" :rows="2" resize="none" placeholder="填写新的待办事项，可输入具体责任或下一步动作" />
            <ElButton class="todo-secondary-action" @click="addTodo">添加待办</ElButton>
          </div>
        </section>

        <footer class="inspector-footer">
          <ElButton @click="goToFlightDetail(selectedFlight)">进入完整详情页</ElButton>
        </footer>
      </div>
    </ElDrawer>

    <ElDialog v-model="addDialogVisible" title="添加航班" width="560px">
      <ElForm label-width="90px">
        <ElFormItem label="注册号"><ElInput v-model="addForm.aircraft" placeholder="例如 B-9308" /></ElFormItem>
        <ElFormItem label="日期"><ElDatePicker v-model="addForm.date" type="date" value-format="YYYY-MM-DD" class="dialog-full-width" /></ElFormItem>
        <ElFormItem label="任务类型">
          <ElSelect v-model="addForm.type" class="dialog-full-width">
            <ElOption label="客运 PAX" value="PAX" /><ElOption label="调机 FERRY" value="FERRY" /><ElOption label="维修 MX" value="MX" /><ElOption label="AOG" value="AOG" />
          </ElSelect>
        </ElFormItem>
        <div class="dialog-grid">
          <ElFormItem label="起飞机场"><ElInput v-model="addForm.from" placeholder="ZSSS" /></ElFormItem>
          <ElFormItem label="到达机场"><ElInput v-model="addForm.to" placeholder="VHHH" /></ElFormItem>
          <ElFormItem label="起飞时间"><ElInput v-model="addForm.std" placeholder="0840" /></ElFormItem>
          <ElFormItem label="到达时间"><ElInput v-model="addForm.sta" placeholder="1215" /></ElFormItem>
        </div>
      </ElForm>
      <template #footer><ElButton @click="addDialogVisible = false">取消</ElButton><ElButton type="primary" @click="saveFlight">保存航班</ElButton></template>
    </ElDialog>
  </div>
</template>

<style scoped>
.flight-plan-page { min-width: 0; min-height: 100%; padding: 12px; color: #1f2937; background: #f4f8fa; }
.plan-toolbar, .timeline-panel, .alternative-panel { min-width: 0; border: 1px solid #e4e9ef; border-radius: 14px; background: rgba(255,255,255,.96); box-shadow: 0 8px 22px rgba(31,55,79,.05); }
.plan-toolbar { display: grid; gap: 10px; padding: 14px 16px; }
.toolbar-main, .toolbar-filters, .date-selectors, .view-switch { display: flex; align-items: center; gap: 8px; }
.toolbar-main { align-items: flex-end; flex-wrap: wrap; }
.toolbar-filters { align-items: flex-end; }
.view-switch { height: 34px; gap: 0; padding: 2px; overflow: hidden; border: 1px solid #d9e0e8; border-radius: 7px; background: #f7f9fb; }
.view-switch :deep(.el-button) { min-height: 28px; margin: 0; padding-inline: 13px; border: 0; border-radius: 5px; color: #52637a; font-size: 13px; font-weight: 600; background: transparent; box-shadow: none; }
.view-switch :deep(.el-button.active) { color: #137c78; background: #e8f6f5; box-shadow: 0 1px 3px rgba(31,55,79,.12); }
.year-select { width: 96px; }
.month-select, .day-select { width: 76px; }
.date-selectors :deep(.el-select__wrapper), .timezone-field :deep(.el-select__wrapper), .toolbar-filters :deep(.el-select__wrapper) { min-height: 34px; border-radius: 6px; background: #fff; box-shadow: 0 0 0 1px #d9e0e8 inset; }
.date-selectors :deep(.el-select__selected-item), .timezone-field :deep(.el-select__selected-item), .toolbar-filters :deep(.el-select__selected-item) { color: #253044; font-size: 13px; }
.date-selectors :deep(.el-select__caret), .timezone-field :deep(.el-select__caret), .toolbar-filters :deep(.el-select__caret) { color: #7b8798; }
.today-button { min-height: 34px; padding-inline: 14px; border-color: #d9e0e8; border-radius: 6px; color: #253044; font-size: 13px; font-weight: 600; background: #fff; }
.today-button:hover, .today-button:focus-visible { border-color: #78b9b5; color: #137c78; background: #f3fbfa; }
.toolbar-spacer { flex: 1; }
.timezone-field, .toolbar-filters label { display: grid; gap: 2px; }
.timezone-field > span, .toolbar-filters label > span { padding-left: 6px; color: #7b8798; font-size: 11px; }
.timezone-field { width: 238px; }
.add-button { min-width: 104px; min-height: 34px; border-radius: 6px; font-size: 13px; font-weight: 600; }
.toolbar-filters label { width: 180px; }
.task-count { display: flex; align-items: center; min-height: 34px; margin: 0 0 0 auto; color: #72839a; font-size: 12px; }
.timeline-panel, .alternative-panel { margin-top: 12px; padding: 12px; }
.timeline-sticky-header { position: sticky; top: 0; z-index: 20; padding-top: 1px; background: #fff; }
.timeline-header-viewport { width: 100%; min-width: 0; overflow: hidden; border: 1px solid #dce3ea; border-radius: 10px 10px 0 0; background: #fff; }
.timeline-scroll { width: 100%; max-width: 100%; min-width: 0; overflow-x: auto; overflow-y: hidden; border: 1px solid #dce3ea; border-top: 0; border-radius: 0 0 10px 10px; background: #fff; cursor: grab; overscroll-behavior-inline: contain; scrollbar-color: rgba(72,96,128,.32) transparent; scroll-snap-type: x proximity; }
.timeline-scroll.is-dragging { cursor: grabbing; scroll-behavior: auto; user-select: none; }
.timeline-track { min-width: 100%; }
.timeline-header, .timeline-body { display: grid; grid-template-columns: repeat(var(--timeline-days), minmax(0,1fr)); }
.timeline-header { height: 70px; border-bottom: 1px solid #d9e0e8; background: #fff; will-change: transform; }
.day-head { display: grid; place-content: center; gap: 3px; color: #202833; text-align: center; scroll-snap-align: start; }
.day-head span { min-height: 14px; color: #748196; font-size: 11px; }
.day-head strong { font-size: 16px; line-height: 1.1; }
.day-head small { color: #465264; font-size: 12px; }
.day-head.today { z-index: 2; border: 2px solid #3f7cff; border-bottom: 0; border-radius: 9px 9px 0 0; }
.timeline-body {
  height: 640px;
  height: clamp(480px, calc(100dvh - 210px), 640px);
}
.day-column { position: relative; min-width: 0; border-right: 1px solid #e1e6eb; background: #fff; }
.day-column:nth-child(even) { background: #f5f5f5; }
.day-column.today { z-index: 1; border-inline: 2px solid #3f7cff; background: #fff; }
.hour-line { position: absolute; z-index: 0; left: 0; width: 100%; border-top: 1px solid #e1e5e9; color: #b1b8c0; font-size: 10px; }
.hour-line i { position: absolute; top: 4px; left: 7px; font-style: normal; }
.current-time-line { position: absolute; z-index: 3; left: 0; width: 100%; border-top: 1px dashed #f05252; }
.current-time-line i { position: absolute; top: -9px; right: 6px; padding-left: 6px; color: #ef4444; font-size: 10px; font-style: normal; background: #fff; }
.flight-card { position: absolute; z-index: 4; left: 7px; display: grid; grid-template-columns: minmax(0,1fr) minmax(88px,var(--todos-width,120px)); gap: 6px; width: min(calc(100% - 14px),var(--card-width,calc(100% - 14px))); max-width: calc(100% - 14px); min-height: 58px; padding: 8px; overflow: hidden; border: 1px solid #cbd8e6; border-radius: 5px; color: #202833; text-align: left; box-shadow: 0 5px 12px rgba(31,55,79,.07); transition: 160ms ease; }
.flight-card:hover, .flight-card:focus-visible { z-index: 8; outline: 2px solid rgba(63,124,255,.36); transform: translateY(-2px); box-shadow: 0 11px 24px rgba(31,55,79,.15); }
.phase-arrived { border-color: #c9d8e8; background: #eef3f8; }
.phase-confirmed { border-color: #c4d6ef; background: #edf5ff; }
.phase-preparing { border-color: #f0d497; background: #fff7e4; }
.phase-maintenance { border-color: #dfc4db; background: #f8ecf6; }
.phase-aog { border-color: #f0c2c2; background: #fff0f0; }
.flight-main, .flight-card-todos { display: grid; min-width: 0; gap: 4px; }
.flight-card-head { display: flex; min-width: 0; align-items: center; justify-content: space-between; gap: var(--sj-space-2); }
.flight-card-head > span:first-child { display: flex; align-items: center; gap: 5px; white-space: nowrap; }
.flight-type-tag {
  display: inline-flex;
  min-height: 19px;
  padding-inline: var(--sj-space-1);
  align-items: center;
  gap: var(--sj-space-1);
  border: 1px solid var(--sj-border-strong);
  border-radius: var(--sj-radius-tag);
  color: var(--sj-text-2);
  background: var(--sj-surface-3);
  font: 700 9px var(--sj-font-data);
  letter-spacing: .08em;
}
.flight-type-tag svg { width: 11px; height: 11px; flex: 0 0 11px; stroke-width: 2; }
.aircraft-color-label { color: var(--aircraft-color, var(--sj-text-1)); font-family: var(--sj-font-data); font-weight: 700; }
.flight-main .aircraft-color-label { font-size: 12px; }
.flight-turnaround {
  width: max-content;
  max-width: 100%;
  min-width: 0;
  padding-inline: var(--sj-space-1);
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--sj-amber) 48%, transparent);
  border-radius: var(--sj-radius-tag);
  color: var(--sj-amber);
  background: var(--sj-amber-soft);
  font: 700 8px var(--sj-font-data);
  line-height: 17px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.flight-route { display: flex; min-width: 0; align-items: center; gap: var(--sj-space-1); overflow: visible; font-size: 11px; font-weight: 650; line-height: 1.35; overflow-wrap: anywhere; text-overflow: clip; white-space: normal; }
.flight-route > span { display: grid; min-width: 0; gap: 1px; }
.flight-route > span:last-child { text-align: right; }
.flight-route em { color: var(--sj-text-3); font-style: normal; }
.flight-route .airport-code { font-size: 14px; line-height: 1; }
.flight-route time { color: var(--sj-text-2); font-size: 11px; font-weight: 650; white-space: nowrap; }
.todo-status-light { display: inline-block; width: 9px; height: 9px; flex: 0 0 9px; border-radius: 50%; background: currentColor; }
.status-lime { color: var(--sj-lime); }
.status-blue { color: var(--sj-blue); }
.status-amber { color: var(--sj-amber); }
.status-red { color: var(--sj-red); }
.flight-card-todos { align-self: start; align-content: start; text-align: right; }
.flight-card-todos > span { display: grid; min-width: 0; grid-template-columns: minmax(0, 1fr) 14px; align-items: center; gap: var(--sj-space-1); }
.flight-card-todos i { max-width: 15em; overflow: hidden; color: #202833; font-size: 10px; font-style: normal; line-height: 1.35; text-overflow: ellipsis; white-space: nowrap; }
.calendar-grid { display: grid; grid-template-columns: repeat(7,minmax(0,1fr)); gap: 1px; overflow: hidden; border: 1px solid #e1e6eb; border-radius: 12px; background: #e1e6eb; }
.calendar-day { min-height: 138px; padding: 10px; background: #fff; }
.calendar-day header { display: flex; justify-content: space-between; margin-bottom: 10px; color: #5b6677; }
.calendar-flight { display: flex; width: 100%; margin-top: 6px; padding: 6px 8px; overflow: hidden; align-items: center; gap: var(--sj-space-2); border: 0; border-radius: 5px; color: #24435d; font-size: 12px; text-align: left; white-space: nowrap; background: #edf5ff; }
.calendar-flight > span:last-child { min-width: 0; overflow: hidden; flex: 1; text-overflow: ellipsis; }
.list-panel {
  overflow: hidden;
  background: #fff;
}
.list-panel :deep(.el-table) {
  --el-table-bg-color: #fff;
  --el-table-tr-bg-color: #fff;
  --el-table-header-bg-color: #f7f9fb;
  --el-table-row-hover-bg-color: #f2f7fb;
  --el-table-current-row-bg-color: #edf5fb;
  --el-table-text-color: #253044;
  --el-table-header-text-color: #5f6f83;
  --el-table-border-color: #e4e9ef;
  --el-fill-color-lighter: #fafbfd;
  color: #253044;
  background: #fff;
}
.list-panel :deep(.el-table th.el-table__cell) {
  height: 46px;
  color: #5f6f83;
  font-weight: 650;
  background: #f7f9fb;
}
.list-panel :deep(.el-table td.el-table__cell) {
  height: 48px;
  color: #253044;
  background: transparent;
}
.list-panel :deep(.el-table__body tr.el-table__row--striped td.el-table__cell) {
  background: #fafbfd;
}
.list-panel :deep(.el-table__body tr:hover > td.el-table__cell) {
  background: #f2f7fb;
}
.list-panel :deep(.el-table__inner-wrapper::before) {
  background: #e4e9ef;
}
.list-panel :deep(.el-button.is-link) {
  color: #0b74de;
  font-weight: 600;
}
.dialog-full-width { width: 100%; }
.dialog-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 0 12px; }
.edit-flight-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 0 12px; }
.edit-flight-form :deep(.el-form-item__label) { color: #cfd5df; font-weight: 600; }
@media (max-width: 1180px) { .toolbar-spacer { display: none; } .timezone-field { margin-left: 0; } .task-count { width: 100%; margin-left: 0; } }
@media (max-width: 760px) { .flight-plan-page { padding: 10px; } .plan-toolbar, .timeline-panel, .alternative-panel { padding: 14px; border-radius: 12px; } .toolbar-filters, .date-selectors { flex-wrap: wrap; } .timezone-field, .toolbar-filters label { width: 100%; } .flight-card { grid-template-columns: 1fr; } .flight-card-todos { display: none; } .calendar-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } }

/* Mission Control Dark: opt-in operational workspace skin. */
.flight-plan-page.sj-mission-control {
  --mc-canvas: #07090e;
  --mc-surface: #0b0e15;
  --mc-raised: #111722;
  --mc-grid: #171d29;
  --mc-line: #252d3d;
  --mc-text: #f1f5f9;
  --mc-muted: #778398;
  --mc-blue: #55a8ff;
  --mc-lime: #a3e635;
  --mc-amber: #f5b942;
  --mc-red: #ff665c;
  min-height: 100%;
  padding: 0;
  color: var(--mc-text);
  background: var(--mc-canvas);
  font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif;
}

.sj-mission-control .plan-toolbar,
.sj-mission-control .timeline-panel,
.sj-mission-control .alternative-panel {
  border: 0;
  border-radius: 0;
  background: var(--mc-canvas);
  box-shadow: none;
}

.sj-mission-control .plan-toolbar { gap: 0; padding: 0; border-bottom: 1px solid var(--mc-line); }
.mission-header { display: flex; align-items: center; justify-content: space-between; min-height: 58px; padding: 0 20px; border-bottom: 1px solid var(--mc-line); background: #080b11; }
.mission-identity { display: flex; align-items: center; gap: 11px; }
.mission-identity > span:last-child { display: grid; gap: 2px; }
.mission-identity strong { color: #f8fafc; font-size: 14px; font-weight: 720; }
.mission-identity small { color: #657086; font-family: "SFMono-Regular", Consolas, monospace; font-size: 9px; letter-spacing: .14em; }
.soc-mark { display: grid; width: 34px; height: 34px; place-items: center; border-radius: 8px; color: #111807; background: var(--mc-lime); box-shadow: 0 0 24px rgba(163,230,53,.16); font-size: 11px; font-weight: 900; letter-spacing: .04em; }
.mission-status { display: flex; align-items: center; gap: 7px; color: #8a96a9; font-size: 10px; letter-spacing: .12em; }
.mission-status i { width: 7px; height: 7px; border-radius: 50%; background: var(--mc-lime); box-shadow: 0 0 12px rgba(163,230,53,.72); }

.sj-mission-control .toolbar-main { min-height: 58px; padding: 10px 20px; align-items: center; border-bottom: 1px solid var(--mc-line); background: var(--mc-surface); }
.sj-mission-control .toolbar-filters { min-height: 56px; padding: 9px 20px; align-items: center; border-bottom: 1px solid var(--mc-line); background: #090c12; }
.sj-mission-control .view-switch { height: 36px; border-color: #283247; border-radius: 7px; background: #111722; }
.sj-mission-control .view-switch :deep(.el-button) { min-height: 30px; color: #7d899d; font-size: 12px; }
.sj-mission-control .view-switch :deep(.el-button.active) { color: #fff; background: #26344a; box-shadow: inset 0 0 0 1px rgba(85,168,255,.38), 0 0 16px rgba(85,168,255,.08); }
.sj-mission-control .year-select { width: 108px; }
.sj-mission-control .month-select,
.sj-mission-control .day-select { width: 84px; }
.sj-mission-control .date-selectors :deep(.el-select__wrapper),
.sj-mission-control .timezone-field :deep(.el-select__wrapper),
.sj-mission-control .toolbar-filters :deep(.el-select__wrapper) {
  min-height: 36px;
  border-radius: 6px;
  background: #111722;
  box-shadow: 0 0 0 1px #2a3345 inset;
}
.sj-mission-control .date-selectors :deep(.el-select__selected-item),
.sj-mission-control .timezone-field :deep(.el-select__selected-item),
.sj-mission-control .toolbar-filters :deep(.el-select__selected-item) { color: #e7edf7; font-family: "SFMono-Regular", Consolas, monospace; font-size: 12px; }
.sj-mission-control .date-selectors :deep(.el-select__caret),
.sj-mission-control .timezone-field :deep(.el-select__caret),
.sj-mission-control .toolbar-filters :deep(.el-select__caret) { color: #778398; }
.sj-mission-control .today-button { min-height: 36px; border-color: color-mix(in srgb, var(--sj-lime) 42%, transparent); color: var(--sj-lime); background: var(--sj-lime-soft); }
.sj-mission-control .today-button:hover,
.sj-mission-control .today-button:focus-visible { border-color: var(--sj-lime); color: var(--sj-canvas); background: var(--sj-lime); }
.sj-mission-control .timezone-field > span,
.sj-mission-control .toolbar-filters label > span { padding-left: 1px; color: #657086; font-family: "SFMono-Regular", Consolas, monospace; font-size: 9px; letter-spacing: .1em; text-transform: uppercase; }
.sj-mission-control .timezone-field { width: 240px; }
.sj-mission-control .toolbar-filters label { width: 165px; }
.sj-mission-control .add-button { min-height: 36px; border-color: var(--mc-lime); color: #101607; background: var(--mc-lime); box-shadow: 0 0 20px rgba(163,230,53,.12); font-weight: 750; }
.sj-mission-control .add-button:hover,
.sj-mission-control .add-button:focus-visible { border-color: #b8f35c; color: #071006; background: #b8f35c; }
.sj-mission-control .task-count { color: #68758a; font-family: "SFMono-Regular", Consolas, monospace; font-size: 10px; }
.sj-mission-control .task-count strong { color: #e8eef8; }

.operations-strip { display: flex; min-height: 62px; padding: 0 20px; align-items: stretch; background: #070a10; }
.operation-metric { display: grid; min-width: 146px; padding: 11px 22px 10px 0; margin-right: 22px; grid-template-columns: 9px auto; grid-template-rows: auto auto; column-gap: 9px; align-content: center; border-right: 1px solid #1c2330; }
.operation-metric > i { width: 7px; height: 7px; margin-top: 5px; border-radius: 50%; background: #657086; }
.operation-metric > strong { color: #f8fafc; font-family: "SFMono-Regular", Consolas, monospace; font-size: 18px; line-height: 1; }
.operation-metric > span { grid-column: 2; margin-top: 5px; color: #657086; font-size: 9px; letter-spacing: .04em; }
.operation-metric > i.tone-blue { background: var(--mc-blue); box-shadow: 0 0 9px rgba(85,168,255,.65); }
.operation-metric > i.tone-red,
.operation-metric > i.tone-coral { background: var(--mc-red); box-shadow: 0 0 9px rgba(255,102,92,.56); }
.operation-metric > i.tone-amber { background: var(--mc-amber); box-shadow: 0 0 9px rgba(245,185,66,.55); }
.operation-metric > i.tone-lime { background: var(--mc-lime); box-shadow: 0 0 9px rgba(163,230,53,.62); }
.type-filters { display: flex; align-items: center; gap: 7px; margin-left: auto; }
.type-filters button { min-width: 46px; height: 29px; border: 1px solid #252d3c; border-radius: 5px; color: #758197; background: #0c1018; font: 10px "SFMono-Regular", Consolas, monospace; cursor: pointer; }
.type-filters button:hover,
.type-filters button.active { border-color: #56647b; color: #f4f7fb; background: #161c27; }

.sj-mission-control .timeline-panel,
.sj-mission-control .alternative-panel { margin-top: 0; padding: 0; }
.sj-mission-control .timeline-sticky-header { padding: 0; background: #0a0d14; }
.sj-mission-control .timeline-header-viewport { border: 0; border-radius: 0; background: #0a0d14; }
.sj-mission-control .timeline-header { height: 64px; border-bottom-color: var(--mc-line); background: #0a0d14; }
.sj-mission-control .day-head { border-right: 1px solid var(--mc-line); color: #edf2f8; }
.sj-mission-control .day-head span { color: #8090a6; font-size: 9px; }
.sj-mission-control .day-head strong { font-family: "SFMono-Regular", Consolas, monospace; font-size: 14px; letter-spacing: -.02em; }
.sj-mission-control .day-head small { color: #647087; font-family: "SFMono-Regular", Consolas, monospace; font-size: 9px; letter-spacing: .08em; }
.sj-mission-control .day-head.today { border: 0; border-right: 1px solid #2b4630; border-radius: 0; background: #152118; box-shadow: inset 0 -2px var(--mc-lime); }
.sj-mission-control .day-head.today span { color: var(--mc-lime); }
.sj-mission-control .timeline-scroll { border: 0; border-radius: 0; background: var(--mc-canvas); scrollbar-color: #38445b #0a0d14; }
.sj-mission-control .timeline-body { height: clamp(500px, calc(100dvh - 305px), 680px); }
.sj-mission-control .day-column,
.sj-mission-control .day-column:nth-child(even) { border-right-color: var(--mc-line); background-color: var(--mc-canvas); background-image: linear-gradient(90deg, rgba(31,39,53,.2) 1px, transparent 1px); background-size: 25% 100%; }
.sj-mission-control .day-column:nth-child(even) { background-color: #090b11; }
.sj-mission-control .day-column.today { border-inline: 1px solid rgba(163,230,53,.42); background-color: #0a0e0b; box-shadow: inset 0 0 35px rgba(163,230,53,.025); }
.sj-mission-control .hour-line { border-top-color: #1b2230; color: #4f5c72; font-family: "SFMono-Regular", Consolas, monospace; font-size: 9px; }
.sj-mission-control .current-time-line { border-top: 1px solid var(--mc-red); box-shadow: 0 0 8px rgba(255,102,92,.25); }
.sj-mission-control .current-time-line i { color: #140807; background: var(--mc-red); border-radius: 3px; padding: 2px 5px; font-family: "SFMono-Regular", Consolas, monospace; }
.sj-mission-control .flight-card { min-height: 72px; border-color: color-mix(in srgb, var(--aircraft-color) 58%, var(--sj-border)); border-left-width: 3px; border-radius: 7px; color: var(--sj-text-1); background: color-mix(in srgb, var(--aircraft-color) 22%, var(--sj-surface-2)); box-shadow: 0 0 0 1px var(--aircraft-soft) inset, 0 0 16px var(--aircraft-soft); }
.sj-mission-control .flight-card:hover,
.sj-mission-control .flight-card:focus-visible { outline-color: rgba(85,168,255,.35); box-shadow: 0 0 0 1px rgba(85,168,255,.35) inset, 0 0 24px rgba(58,135,217,.28); }
.sj-mission-control .phase-arrived,
.sj-mission-control .phase-confirmed,
.sj-mission-control .phase-preparing,
.sj-mission-control .phase-maintenance,
.sj-mission-control .phase-aog { border-color: color-mix(in srgb, var(--aircraft-color) 58%, var(--sj-border)); background: color-mix(in srgb, var(--aircraft-color) 22%, var(--sj-surface-2)); box-shadow: 0 0 16px var(--aircraft-soft); }
.sj-mission-control .flight-main .aircraft-color-label { color: var(--aircraft-color); font-family: var(--sj-font-data); font-size: 12px; letter-spacing: .04em; }
.sj-mission-control .flight-route { color: var(--sj-text-1); font-family: var(--sj-font-data); }
.sj-mission-control .flight-route .airport-code { color: var(--sj-text-1); font-size: 15px; letter-spacing: .03em; }
.sj-mission-control .flight-route time { color: var(--sj-text-2); font-size: 11px; }
.sj-mission-control .flight-card-todos i { color: var(--sj-text-2); font-family: var(--sj-font-ui); font-size: 9px; line-height: 1.45; }

.sj-mission-control .calendar-grid { gap: 1px; border-color: var(--mc-line); border-radius: 0; background: var(--mc-line); }
.sj-mission-control .calendar-day { background: #090c12; }
.sj-mission-control .calendar-day:nth-child(even) { background: #0b0f16; }
.sj-mission-control .calendar-day header { color: #8b98ab; }
.sj-mission-control .calendar-flight { border: 1px solid color-mix(in srgb, var(--aircraft-color) 48%, var(--sj-border)); color: var(--sj-text-1); background: color-mix(in srgb, var(--aircraft-color) 18%, var(--sj-surface-2)); }
.sj-mission-control .list-panel { background: var(--mc-canvas); }
.sj-mission-control .list-panel :deep(.el-table) {
  --el-table-bg-color: #080b11;
  --el-table-tr-bg-color: #080b11;
  --el-table-header-bg-color: #0e131d;
  --el-table-row-hover-bg-color: #111b2a;
  --el-table-current-row-bg-color: #111b2a;
  --el-table-text-color: #c6cfdd;
  --el-table-header-text-color: #69768a;
  --el-table-border-color: #1f2633;
  --el-fill-color-lighter: #0a0e15;
  color: #c6cfdd;
  background: #080b11;
}
.sj-mission-control .list-panel :deep(.el-table th.el-table__cell) { height: 42px; color: #7c889b; background: #0e131d; font-family: "SFMono-Regular", Consolas, monospace; font-size: 10px; letter-spacing: .08em; }
.sj-mission-control .list-panel :deep(.el-table td.el-table__cell) { height: 48px; color: #c8d2e0; border-bottom-color: #1c2330; background: #080b11; font-family: "SFMono-Regular", Consolas, monospace; font-size: 11px; }
.sj-mission-control .list-panel :deep(.el-table__body tr.el-table__row--striped td.el-table__cell) { background: #0a0e15; }
.sj-mission-control .list-panel :deep(.el-table__body tr:hover > td.el-table__cell) { background: #111b2a; }
.sj-mission-control .list-panel :deep(.el-table__inner-wrapper::before) { background: #1f2633; }
.sj-mission-control .list-panel :deep(.el-button.is-link) { color: var(--mc-blue); }

@media (max-width: 1180px) {
  .operations-strip { overflow-x: auto; }
  .operation-metric { min-width: 132px; }
  .type-filters { padding-left: 8px; }
}

@media (max-width: 760px) {
  .flight-plan-page.sj-mission-control { padding: 0; }
  .mission-header { padding-inline: 12px; }
  .mission-status { display: none; }
  .sj-mission-control .toolbar-main,
  .sj-mission-control .toolbar-filters { padding: 10px 12px; }
  .sj-mission-control .plan-toolbar,
  .sj-mission-control .timeline-panel,
  .sj-mission-control .alternative-panel { padding: 0; border-radius: 0; }
  .operations-strip { padding-inline: 12px; }
  .operation-metric { min-width: 124px; }
  .sj-mission-control .flight-card-todos { display: grid; }
  .sj-mission-control .timeline-body { height: 610px; }
}
</style>

<style>
.el-drawer.flight-inspector-drawer {
  --el-drawer-bg-color: var(--sj-surface-1);
  border-left: 1px solid var(--sj-border);
  color: var(--sj-text-1);
  background: var(--sj-surface-1);
  box-shadow: var(--sj-shadow-panel);
}

.flight-inspector-drawer .el-drawer__body {
  padding: 0;
  overflow-x: hidden;
}

.flight-inspector-content {
  display: flex;
  height: 100%;
  min-height: 100%;
  flex-direction: column;
  color: var(--sj-text-1);
  background: var(--sj-canvas);
  font-family: var(--sj-font-ui);
}

.inspector-header {
  position: sticky;
  top: 0;
  z-index: 4;
  display: flex;
  min-height: 68px;
  padding: var(--sj-space-3) var(--sj-space-4);
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--sj-border);
  background: var(--sj-surface-1);
}

.inspector-header > div { display: grid; gap: var(--sj-space-1); }
.inspector-header small,
.todo-section header small {
  color: var(--sj-text-3);
  font: 9px var(--sj-font-data);
  letter-spacing: .14em;
}
.inspector-header h2,
.todo-section h3 { margin: 0; color: var(--sj-text-1); }
.inspector-header h2 { font-size: 18px; }
.inspector-header button {
  display: grid;
  width: var(--sj-control-dense);
  height: var(--sj-control-dense);
  padding: 0;
  place-items: center;
  border: 1px solid var(--sj-border);
  border-radius: var(--sj-radius-control);
  color: var(--sj-text-2);
  background: var(--sj-surface-2);
  font-size: 22px;
  cursor: pointer;
}
.inspector-header button:hover { border-color: var(--sj-border-strong); color: var(--sj-text-1); }

.inspector-flight-summary,
.todo-section { border-bottom: 1px solid var(--sj-border); }
.inspector-flight-summary { padding: var(--sj-space-4); background: var(--sj-surface-1); }
.summary-meta { display: flex; align-items: center; gap: var(--sj-space-2); }
.summary-meta .flight-type-tag {
  padding: var(--sj-space-1) var(--sj-space-2);
  border-radius: var(--sj-radius-tag);
  color: var(--sj-text-2);
  background: var(--sj-surface-3);
  font: 10px var(--sj-font-data);
  letter-spacing: .08em;
}
.summary-meta .aircraft-color-label { color: var(--aircraft-color); font: 14px var(--sj-font-data); }
.summary-meta i { margin-left: auto; color: var(--sj-text-3); font: 10px var(--sj-font-data); font-style: normal; }
.summary-route { display: grid; margin-top: var(--sj-space-5); grid-template-columns: 1fr minmax(58px, .65fr) 1fr; align-items: center; }
.summary-route > div { display: grid; gap: var(--sj-space-1); }
.summary-route > div:last-child { text-align: right; }
.summary-route strong { color: var(--sj-text-1); font: 28px var(--sj-font-data); letter-spacing: -.04em; }
.summary-route p { min-height: 34px; margin: 0; color: var(--sj-text-2); font-size: 12px; line-height: 1.4; }
.summary-route small { color: var(--sj-text-3); font: 9px var(--sj-font-data); }
.summary-route time { color: var(--sj-blue); font-size: 13px; }
.summary-route > span { display: flex; align-items: center; color: var(--sj-text-3); }
.summary-route > span i { height: 1px; flex: 1; background: var(--sj-border-strong); }
.summary-route > span b { padding-inline: var(--sj-space-1); font-weight: 500; }
.summary-facts { display: grid; margin-top: var(--sj-space-5); grid-template-columns: 1fr 1fr; gap: var(--sj-space-3); }
.summary-facts span { display: grid; gap: var(--sj-space-1); color: var(--sj-text-2); font: 11px var(--sj-font-data); }
.summary-facts small { color: var(--sj-text-3); font: 9px var(--sj-font-ui); }

.todo-section { padding: var(--sj-space-4); }
.todo-section > header { display: flex; align-items: center; justify-content: space-between; }
.todo-section h3 { font-size: 14px; }

.todo-section > header > div:first-child { display: flex; align-items: baseline; gap: var(--sj-space-2); }
.todo-legend { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: var(--sj-space-2); }
.todo-legend span { display: flex; align-items: center; gap: var(--sj-space-1); font-size: 9px; }
.todo-legend .todo-status-light { width: 8px; height: 8px; flex-basis: 8px; }
.todo-list { display: grid; margin-top: var(--sj-space-3); gap: var(--sj-space-2); }
.todo-item {
  display: grid;
  min-width: 0;
  min-height: 52px;
  padding: var(--sj-space-2);
  grid-template-columns: minmax(0, 1fr) auto var(--sj-control-dense);
  align-items: center;
  gap: var(--sj-space-2);
  border: 1px solid var(--sj-border);
  border-radius: var(--sj-radius-control);
  background: var(--sj-surface-2);
}
.todo-content-input .el-input__wrapper {
  min-height: var(--sj-control-dense);
  padding-inline: var(--sj-space-2);
  border-radius: var(--sj-radius-control);
  background: var(--sj-surface-1);
  box-shadow: 0 0 0 1px var(--sj-border) inset;
}
.todo-content-input .el-input__inner { color: var(--sj-text-1); font-size: 12px; }
.todo-content-input .el-input__wrapper:hover,
.todo-content-input .el-input__wrapper.is-focus { box-shadow: 0 0 0 1px var(--sj-blue) inset; }
.todo-status-lights {
  display: inline-grid;
  grid-template-columns: repeat(3, var(--sj-control-default));
  overflow: hidden;
  border: 1px solid var(--sj-border);
  border-radius: var(--sj-radius-control);
  background: var(--sj-surface-1);
}
.todo-status-choice {
  display: grid;
  width: var(--sj-control-default);
  height: var(--sj-control-default);
  padding: 0;
  place-items: center;
  border: 0;
  border-right: 1px solid var(--sj-border);
  color: var(--sj-text-disabled);
  background: transparent;
  cursor: pointer;
  transition: color var(--sj-duration-fast), background var(--sj-duration-fast);
}
.todo-status-choice:last-child { border-right: 0; }
.todo-status-choice .todo-status-light { opacity: .32; }
.todo-status-choice:hover .todo-status-light { opacity: .72; }
.todo-status-choice.is-active .todo-status-light {
  opacity: 1;
  box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 18%, transparent);
}
.todo-status-choice.is-active.status-lime { color: var(--sj-lime); background: var(--sj-lime-soft); }
.todo-status-choice.is-active.status-amber { color: var(--sj-amber); background: var(--sj-amber-soft); }
.todo-status-choice.is-active.status-red { color: var(--sj-red); background: var(--sj-red-soft); }
.todo-status-choice:focus-visible { position: relative; z-index: 1; }
.todo-delete-button {
  display: grid;
  width: var(--sj-control-dense);
  height: var(--sj-control-dense);
  padding: 0;
  place-items: center;
  border: 1px solid var(--sj-border);
  border-radius: var(--sj-radius-control);
  color: var(--sj-text-3);
  background: var(--sj-surface-1);
  cursor: pointer;
}
.todo-delete-button svg { width: 14px; height: 14px; }
.todo-delete-button:hover,
.todo-delete-button:focus-visible { border-color: var(--sj-red); color: var(--sj-red); background: var(--sj-red-soft); }
.todo-empty { margin: 0; padding: var(--sj-space-4); color: var(--sj-text-3); text-align: center; }
.todo-composer {
  display: grid;
  margin-top: var(--sj-space-3);
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: stretch;
  gap: var(--sj-space-2);
}
.todo-composer .el-textarea__inner {
  color: var(--sj-text-1);
  border-radius: var(--sj-radius-control);
  background: var(--sj-surface-2);
  box-shadow: 0 0 0 1px var(--sj-border) inset;
}
.todo-composer .el-textarea__inner::placeholder { color: var(--sj-text-3); }
.todo-secondary-action.el-button {
  min-height: 100%;
  padding-inline: var(--sj-space-3);
  border-color: color-mix(in srgb, var(--sj-lime) 42%, transparent);
  border-radius: var(--sj-radius-control);
  color: var(--sj-lime);
  background: var(--sj-lime-soft);
  font-weight: 600;
}
.todo-secondary-action.el-button:hover,
.todo-secondary-action.el-button:focus-visible { border-color: var(--sj-lime); color: var(--sj-canvas); background: var(--sj-lime); }
.inspector-footer {
  position: sticky;
  bottom: 0;
  z-index: 4;
  margin-top: auto;
  padding: var(--sj-space-4);
  border-top: 1px solid var(--sj-border);
  background: var(--sj-surface-1);
}
.inspector-footer .el-button {
  width: 100%;
  min-height: var(--sj-control-primary);
  border-color: var(--sj-lime);
  border-radius: var(--sj-radius-control);
  color: var(--sj-canvas);
  background: var(--sj-lime);
  font-weight: 700;
}
.inspector-footer .el-button:hover,
.inspector-footer .el-button:focus-visible {
  border-color: var(--sj-lime);
  color: var(--sj-canvas);
  background: var(--sj-lime);
}

@media (max-width: 520px) {
  .summary-route { grid-template-columns: 1fr var(--sj-space-8) 1fr; }
  .todo-item { grid-template-columns: minmax(0, 1fr) var(--sj-control-dense); }
  .todo-content-input { grid-column: 1 / 3; }
  .todo-status-lights { grid-column: 1; }
  .todo-delete-button { grid-column: 2; grid-row: 2; }
  .todo-composer { grid-template-columns: 1fr; }
  .todo-composer .todo-secondary-action { min-height: var(--sj-control-default); }
}
</style>

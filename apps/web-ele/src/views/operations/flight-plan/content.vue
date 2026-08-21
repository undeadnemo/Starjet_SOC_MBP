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

import dayjs from 'dayjs';
import {
  ElButton,
  ElDatePicker,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
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

const viewMode = ref<ViewMode>('timeline');
const router = useRouter();
const today = dayjs();
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
const currentTimeTop = computed(() => ((today.hour() * 60 + today.minute()) / 1440) * 100);

function flightsForDay(date: string) {
  return visibleMonthFlights.value.filter((flight) => flight.date === date);
}

function flightNoteLines(flight: FlightPlanItem) {
  const source = flight.notes === undefined
    ? `PF ${flight.std}Z-${flight.sta}Z 已确认\n${flight.permit}\n${flight.fuel}`
    : flight.notes;
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function getCardStyle(flight: FlightPlanItem, index: number): CSSProperties {
  const startMinute = Number(flight.std.slice(0, 2)) * 60 + Number(flight.std.slice(2));
  const top = Math.max(0.8, Math.min(94, (startMinute / 1440) * 100));
  const notes = flightNoteLines(flight);
  const longestNote = Math.max(0, ...notes.map((note) => note.length));
  const preferredNotesWidth = Math.max(
    96,
    Math.min(176, longestNote * 6.5 + Math.min(notes.length, 6) * 6),
  );
  const columnWidth = timelineViewportWidth.value > 0
    ? timelineViewportWidth.value / visibleTimelineDays.value
    : 300;
  const maxCardWidth = Math.max(220, columnWidth - 14);
  const notesWidth = Math.min(preferredNotesWidth, maxCardWidth * 0.48);
  const cardWidth = Math.min(maxCardWidth, 180 + notesWidth);
  return {
    '--card-width': `${cardWidth}px`,
    '--notes-width': `${notesWidth}px`,
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
  const isDemo = router.currentRoute.value.path.startsWith('/demo/');
  void router.push({
    name: isDemo ? 'FlightDetailDemo' : 'FlightDetail',
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
  void setupTimelineResizeObserver();
});

onBeforeUnmount(() => timelineResizeObserver?.disconnect());
</script>

<template>
  <div class="flight-plan-page">
    <section class="plan-toolbar" aria-label="航班计划筛选">
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
              <span v-if="day.isToday" class="current-time-line" :style="{ top: `${currentTimeTop}%` }"><i>当前</i></span>
              <button
                v-for="(flight, index) in flightsForDay(day.key)"
                :key="flight.id"
                type="button"
                class="flight-card"
                :class="`phase-${flight.phase}`"
                :style="getCardStyle(flight, index)"
                @click="openFlight(flight)"
              >
                <span class="flight-main">
                  <span><strong>{{ flight.type }}</strong> <b>{{ flight.aircraft }}</b></span>
                  <span class="flight-route">{{ flight.from }} {{ flight.std }}Z - {{ flight.sta }}Z {{ flight.to }}</span>
                </span>
                <span class="flight-notes">
                  <i v-for="(note, noteIndex) in flightNoteLines(flight)" :key="`${flight.id}-${noteIndex}`">{{ note }}</i>
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
          <button v-for="flight in flightsForDay(day.key)" :key="flight.id" class="calendar-flight" @click="openFlight(flight)">
            {{ flight.std }} {{ flight.aircraft }} · {{ flight.from }} → {{ flight.to }}
          </button>
        </article>
      </div>
    </section>

    <section v-else class="alternative-panel list-panel">
      <ElTable :data="visibleMonthFlights" stripe>
        <ElTableColumn prop="date" label="日期" width="120" />
        <ElTableColumn prop="aircraft" label="注册号" width="110" />
        <ElTableColumn prop="type" label="类型" width="100" />
        <ElTableColumn label="航段"><template #default="{ row }">{{ row.from }} {{ row.std }}Z - {{ row.sta }}Z {{ row.to }}</template></ElTableColumn>
        <ElTableColumn label="备注"><template #default="{ row }">{{ flightNoteLines(row).join(' / ') }}</template></ElTableColumn>
        <ElTableColumn label="操作" width="90"><template #default="{ row }"><ElButton link type="primary" @click="openFlight(row)">查看</ElButton></template></ElTableColumn>
      </ElTable>
    </section>

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
.flight-card { position: absolute; z-index: 4; left: 7px; display: grid; grid-template-columns: minmax(0,1fr) minmax(88px,var(--notes-width,120px)); gap: 6px; width: min(calc(100% - 14px),var(--card-width,calc(100% - 14px))); max-width: calc(100% - 14px); min-height: 58px; padding: 8px; overflow: hidden; border: 1px solid #cbd8e6; border-radius: 5px; color: #202833; text-align: left; box-shadow: 0 5px 12px rgba(31,55,79,.07); transition: 160ms ease; }
.flight-card:hover, .flight-card:focus-visible { z-index: 8; outline: 2px solid rgba(63,124,255,.36); transform: translateY(-2px); box-shadow: 0 11px 24px rgba(31,55,79,.15); }
.phase-arrived { border-color: #c9d8e8; background: #eef3f8; }
.phase-confirmed { border-color: #c4d6ef; background: #edf5ff; }
.phase-preparing { border-color: #f0d497; background: #fff7e4; }
.phase-maintenance { border-color: #dfc4db; background: #f8ecf6; }
.phase-aog { border-color: #f0c2c2; background: #fff0f0; }
.flight-main, .flight-notes { display: grid; min-width: 0; gap: 4px; }
.flight-main > span:first-child { display: flex; align-items: center; gap: 5px; white-space: nowrap; }
.flight-main strong, .flight-main b { font-size: 12px; }
.phase-aog .flight-main b, .phase-maintenance .flight-main b { color: #9b3434; }
.flight-route { overflow: visible; font-size: 11px; font-weight: 650; line-height: 1.35; overflow-wrap: anywhere; text-overflow: clip; white-space: normal; }
.flight-notes { align-content: center; text-align: right; }
.flight-notes i { overflow: visible; color: #202833; font-size: 10px; font-style: normal; line-height: 1.35; overflow-wrap: anywhere; text-overflow: clip; white-space: normal; }
.calendar-grid { display: grid; grid-template-columns: repeat(7,minmax(0,1fr)); gap: 1px; overflow: hidden; border: 1px solid #e1e6eb; border-radius: 12px; background: #e1e6eb; }
.calendar-day { min-height: 138px; padding: 10px; background: #fff; }
.calendar-day header { display: flex; justify-content: space-between; margin-bottom: 10px; color: #5b6677; }
.calendar-flight { display: block; width: 100%; margin-top: 6px; padding: 6px 8px; overflow: hidden; border: 0; border-radius: 5px; color: #24435d; font-size: 12px; text-align: left; text-overflow: ellipsis; white-space: nowrap; background: #edf5ff; }
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
@media (max-width: 760px) { .flight-plan-page { padding: 10px; } .plan-toolbar, .timeline-panel, .alternative-panel { padding: 14px; border-radius: 12px; } .toolbar-filters, .date-selectors { flex-wrap: wrap; } .timezone-field, .toolbar-filters label { width: 100%; } .flight-card { grid-template-columns: 1fr; } .flight-notes { display: none; } .calendar-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } }
</style>

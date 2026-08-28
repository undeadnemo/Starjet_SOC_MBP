<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';
import { ElButton, ElInput, ElMessage, ElOption, ElSelect } from 'element-plus';

type OwnerType = 'flight' | 'trip';
type RouteScope = 'crossBorder' | 'domestic' | 'international';
interface BillType { id: number; name: string; owner: OwnerType }
interface FlightTypeTemplate { code: string; description: string; label: string; scope: RouteScope; scopeLabel: string; types: BillType[] }

const storageKey = 'starjet-flight-bill-templates';
const baseDefaults = [
  { code: 'PAX', label: '客运包机', description: '载客飞行任务', types: [
    { id: 1, name: '航油账单', owner: 'flight' }, { id: 2, name: '地面代理费', owner: 'flight' }, { id: 3, name: '机场费用', owner: 'flight' }, { id: 4, name: '餐食费用', owner: 'trip' }, { id: 5, name: '旅客服务费', owner: 'trip' },
  ] },
  { code: 'FERRY', label: '调机', description: '不载客调机任务', types: [
    { id: 6, name: '航油账单', owner: 'flight' }, { id: 7, name: '地面代理费', owner: 'flight' }, { id: 8, name: '机场费用', owner: 'flight' },
  ] },
  { code: 'MX', label: '维修', description: '维修与试飞任务', types: [
    { id: 9, name: '维修航材费', owner: 'flight' }, { id: 10, name: '维修工时费', owner: 'flight' }, { id: 11, name: '停场费', owner: 'trip' },
  ] },
  { code: 'AOG', label: 'AOG', description: '紧急维修保障任务', types: [
    { id: 12, name: '航材采购费', owner: 'flight' }, { id: 13, name: '紧急物流费', owner: 'flight' }, { id: 14, name: '维修服务费', owner: 'trip' },
  ] },
] as const;
const scopeOptions: { label: string; value: RouteScope }[] = [
  { label: '国内', value: 'domestic' },
  { label: '跨境', value: 'crossBorder' },
  { label: '国际', value: 'international' },
];
const defaults: FlightTypeTemplate[] = baseDefaults.flatMap((template) => scopeOptions.map((scope, scopeIndex) => ({
  ...template,
  scope: scope.value,
  scopeLabel: scope.label,
  types: template.types.map((item) => ({ ...item, id: item.id + scopeIndex * 100 })),
})));

function loadTemplates() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (!Array.isArray(saved) || !saved.length) return defaults;
    if (saved.every((item) => item.scope)) return saved;
    return saved.flatMap((template) => scopeOptions.map((scope, scopeIndex) => ({
      ...template,
      scope: scope.value,
      scopeLabel: scope.label,
      types: template.types.map((item: BillType) => ({ ...item, id: item.id + scopeIndex * 100 })),
    })));
  } catch {
    return defaults;
  }
}

const query = ref('');
const scopeFilter = ref<'all' | RouteScope>('all');
const expanded = ref('PAX:domestic');
const rows = reactive<FlightTypeTemplate[]>(loadTemplates());
let sequence = Math.max(20, ...rows.flatMap((row) => row.types.map((item) => item.id))) + 1;

const filteredRows = computed(() => rows.filter((row) => {
  const text = `${row.code}${row.label}${row.scopeLabel}${row.description}${row.types.map((item) => item.name).join('')}`.toLowerCase();
  return (scopeFilter.value === 'all' || row.scope === scopeFilter.value)
    && (!query.value || text.includes(query.value.trim().toLowerCase()));
}));
const totals = computed(() => ({
  flightTypes: new Set(rows.map((row) => row.code)).size,
  combinations: rows.length,
  billTypes: rows.reduce((total, row) => total + row.types.length, 0),
}));

function addType(row: FlightTypeTemplate) { row.types.push({ id: sequence++, name: '新增账单类型', owner: 'flight' }); }
function removeType(row: FlightTypeTemplate, id: number) { row.types = row.types.filter((item) => item.id !== id); }
function save() {
  localStorage.setItem(storageKey, JSON.stringify(rows));
  ElMessage.success('航班类型账单配置已保存，并同步至航班详情');
}
</script>

<template>
  <main class="bill-page sj-mission-control" data-starjet-theme="mission-control-dark">
    <header class="page-bar">
      <div><span>OPERATIONS CONTROL</span><h1>航班账单预管理</h1></div>
      <ElButton type="primary" @click="save">保存配置</ElButton>
    </header>
    <section class="summary" aria-label="配置概览">
      <div><span>航班类型</span><strong>{{ totals.flightTypes }}</strong></div>
      <div><span>航线范围</span><strong>3</strong></div>
      <div><span>配置组合</span><strong class="blue">{{ totals.combinations }}</strong></div>
      <div><span>账单类型</span><strong>{{ totals.billTypes }}</strong></div>
    </section>
    <section class="filters"><ElInput v-model="query" clearable placeholder="搜索航班类型或账单类型" /><ElSelect v-model="scopeFilter"><ElOption label="全部航线范围" value="all" /><ElOption v-for="scope in scopeOptions" :key="scope.value" :label="scope.label" :value="scope.value" /></ElSelect></section>
    <section class="bill-table">
      <header class="table-row"><span></span><span>航班类型</span><span>航线范围</span><span>适用说明</span><span>已配置账单类型</span><span>归属配置</span></header>
      <template v-for="row in filteredRows" :key="`${row.code}:${row.scope}`">
        <button class="table-row flight-row" type="button" @click="expanded = expanded === `${row.code}:${row.scope}` ? '' : `${row.code}:${row.scope}`">
          <b>{{ expanded === `${row.code}:${row.scope}` ? '−' : '+' }}</b>
          <span><strong>{{ row.label }}</strong><small>{{ row.code }}</small></span>
          <span><em class="scope-tag" :class="row.scope">{{ row.scopeLabel }}</em></span>
          <span>{{ row.description }}</span>
          <span class="type-names">{{ row.types.map((item) => item.name).join('、') }}</span>
          <span>{{ row.types.filter((item) => item.owner === 'flight').length }} 航班 · {{ row.types.filter((item) => item.owner === 'trip').length }} 行程</span>
        </button>
        <div v-if="expanded === `${row.code}:${row.scope}`" class="bill-config">
          <header><strong>{{ row.label }} · {{ row.scopeLabel }}账单类型</strong><ElButton @click="addType(row)">新增类型</ElButton></header>
          <div class="bill-type-head"><span>账单类型名称</span><span>归属对象</span><span>操作</span></div>
          <div v-for="item in row.types" :key="item.id" class="bill-type-row">
            <ElInput v-model="item.name" />
            <ElSelect v-model="item.owner"><ElOption label="归属航班" value="flight" /><ElOption label="归属行程" value="trip" /></ElSelect>
            <button type="button" :aria-label="`删除${item.name}`" @click="removeType(row, item.id)">删除</button>
          </div>
        </div>
      </template>
    </section>
  </main>
</template>

<style scoped>
.bill-page{--sj-text:var(--sj-text-1);--sj-text-secondary:var(--sj-text-2);--sj-text-muted:var(--sj-text-3);--sj-surface:var(--sj-surface-1);--sj-surface-raised:var(--sj-surface-3);--sj-canvas-subtle:var(--sj-surface-2);--sj-font-mono:var(--sj-font-data);min-height:100%;padding:20px;color:var(--sj-text);background:var(--sj-canvas);font-size:12px}.page-bar,.filters,.summary,.bill-table{border:1px solid var(--sj-border);background:var(--sj-surface)}.page-bar{display:flex;align-items:center;justify-content:space-between;padding:16px 18px}.page-bar span{color:var(--sj-blue);font:700 9px var(--sj-font-mono);letter-spacing:.14em}.page-bar h1{margin:4px 0 0;font-size:20px;line-height:1.25}.page-bar :deep(.el-button--primary){height:32px;border-color:var(--sj-lime);color:#101607;background:var(--sj-lime);font-size:11px}.summary{display:grid;grid-template-columns:repeat(4,1fr);margin-top:12px}.summary div{display:flex;align-items:center;justify-content:space-between;min-height:54px;padding:10px 18px;border-right:1px solid var(--sj-border)}.summary div:last-child{border-right:0}.summary span{color:var(--sj-text-muted);font-size:11px}.summary strong{font:800 18px var(--sj-font-mono)}.blue{color:var(--sj-blue)!important}.teal{color:var(--sj-teal)!important}
.filters{display:flex;gap:10px;padding:10px 12px;margin-top:12px}.filters :deep(.el-input){max-width:420px}.filters :deep(.el-select){width:180px}.filters :deep(.el-input__wrapper),.filters :deep(.el-select__wrapper),.bill-config :deep(.el-input__wrapper),.bill-config :deep(.el-select__wrapper){min-height:32px;background:var(--sj-surface-raised);box-shadow:0 0 0 1px var(--sj-border) inset}.filters :deep(.el-input__inner),.filters :deep(.el-select__selected-item),.bill-config :deep(.el-input__inner),.bill-config :deep(.el-select__selected-item){color:var(--sj-text);font-size:12px}.bill-table{margin-top:12px;overflow:hidden}.table-row{display:grid;grid-template-columns:38px 145px 100px 150px minmax(260px,1fr) 165px;align-items:center;width:100%;min-height:44px;padding:0 14px;border:0;border-bottom:1px solid var(--sj-border);color:var(--sj-text-secondary);font-size:11px;text-align:left;background:transparent}.bill-table>header{min-height:36px;color:var(--sj-text-muted);font-size:10px}.flight-row{cursor:pointer}.flight-row:hover{background:var(--sj-surface-raised)}.flight-row span{display:flex;gap:2px;flex-direction:column;min-width:0}.flight-row strong{color:var(--sj-text);font-size:12px}.flight-row small{color:var(--sj-blue);font:9px var(--sj-font-mono)}.scope-tag{width:max-content;padding:3px 6px;border:1px solid var(--sj-border-strong);border-radius:var(--sj-radius-control);color:var(--sj-text-2);font-size:9px;font-style:normal}.scope-tag.crossBorder{color:var(--sj-amber);border-color:var(--sj-amber)}.scope-tag.international{color:var(--sj-blue);border-color:var(--sj-blue)}.type-names{display:block!important;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.bill-config{padding:12px 18px 16px 52px;border-bottom:1px solid var(--sj-border);background:var(--sj-canvas-subtle)}.bill-config header{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px;font-size:12px}.bill-config header :deep(.el-button){height:30px;font-size:11px}.bill-type-head,.bill-type-row{display:grid;grid-template-columns:minmax(240px,1fr) 180px 58px;gap:8px}.bill-type-head{padding:0 10px 5px;color:var(--sj-text-muted);font-size:10px}.bill-type-row{margin-top:7px}.bill-type-row>button{border:1px solid var(--sj-border);border-radius:5px;color:var(--sj-red);background:transparent;font-size:10px;cursor:pointer}.bill-type-row>button:hover{border-color:var(--sj-red);background:color-mix(in srgb,var(--sj-red) 10%,transparent)}
@media(max-width:1000px){.summary{grid-template-columns:repeat(2,1fr)}.summary div:nth-child(2){border-right:0}.table-row{grid-template-columns:32px 130px 90px 130px minmax(220px,1fr)}.table-row>span:last-child{display:none}.bill-type-row,.bill-type-head{grid-template-columns:1fr 150px 58px}}
</style>

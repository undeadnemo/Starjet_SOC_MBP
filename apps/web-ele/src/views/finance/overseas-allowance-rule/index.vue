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
  ElSwitch,
} from 'element-plus';

defineOptions({ name: 'OverseasAllowanceRule' });

type CrewCategory = '乘务员' | '飞行员' | '机务' | '其他';
type Currency = 'CNY' | 'EUR' | 'USD';

interface RuleProfile {
  code: string;
  description: string;
  formula: string;
  id: string;
  name: string;
  tags: string[];
}

interface AllowanceStandard {
  category: CrewCategory;
  communication: number;
  currency: Currency;
  fullDay: number;
  halfDay: number;
  id: number;
  region: 'A' | 'B' | 'C' | '境内' | '境外' | '统一';
}

interface RegionRule {
  code: 'A' | 'B' | 'C';
  members: string;
  name: string;
}

interface ExchangeRate {
  currency: Currency;
  id: number;
  month: string;
  rate: number;
}

interface SavedConfiguration {
  activeProfileId: string;
  bases: string[];
  communicationEnabled: boolean;
  departureLeadHours: number;
  exchangeRates: ExchangeRate[];
  includePositioning: boolean;
  noonThreshold: string;
  regions: RegionRule[];
  returnCutoff: string;
  returnPostHours: number;
  standards: AllowanceStandard[];
}

const storageKey = 'starjet-overseas-allowance-rule-config';
const profiles: RuleProfile[] = [
  {
    code: 'RULE 01', id: 'domestic-overseas', name: '境内外分段规则',
    description: '按最终落地城市区分境内与境外，境外航班另计通讯补贴；返回驻地按凌晨阈值判定。',
    formula: '境内/境外驻外天数 + 对应置位天数 × 分区标准 + 境外通讯补贴',
    tags: ['境内外分开', '通讯补贴', '归站阈值'],
  },
  {
    code: 'RULE 02', id: 'unified-day', name: '统一日标准',
    description: '驻外与置位均按统一日标准计算，不区分境内、境外或区域。',
    formula: '（驻外天数 + 置位天数）× 统一补贴标准/天',
    tags: ['统一标准', '按天', '含置位'],
  },
  {
    code: 'RULE 03', id: 'foreign-involved', name: '涉外航段规则',
    description: '起飞或落地城市涉及境外时，当前核算日统一采用境外标准。',
    formula: '（驻外天数 + 置位天数）× 境内或境外标准/天',
    tags: ['涉外判定', '境外标准', '按天'],
  },
  {
    code: 'RULE 04', id: 'regional-half-day', name: '区域全天半天规则',
    description: '按出发地 A/B/C 区域计费，并依据离开和返回驻地的当地时间判定全天或半天。',
    formula: '区域日标准 × 全天数 + 区域半日标准 × 半天数',
    tags: ['A/B/C 区域', '全天/半天', '当地时间'],
  },
];

const activeProfileId = ref('domestic-overseas');
const selectedProfileId = ref(activeProfileId.value);
const returnCutoff = ref('02:00');
const noonThreshold = ref('12:00');
const departureLeadHours = ref(3);
const returnPostHours = ref(1);
const includePositioning = ref(true);
const communicationEnabled = ref(true);
const standards = reactive<AllowanceStandard[]>([
  { category: '飞行员', communication: 0, currency: 'CNY', fullDay: 600, halfDay: 300, id: 1, region: '境内' },
  { category: '飞行员', communication: 120, currency: 'USD', fullDay: 150, halfDay: 75, id: 2, region: '境外' },
  { category: '乘务员', communication: 0, currency: 'CNY', fullDay: 360, halfDay: 180, id: 3, region: '境内' },
  { category: '乘务员', communication: 120, currency: 'USD', fullDay: 110, halfDay: 55, id: 4, region: '境外' },
  { category: '机务', communication: 0, currency: 'CNY', fullDay: 420, halfDay: 210, id: 5, region: '境内' },
  { category: '机务', communication: 120, currency: 'USD', fullDay: 115, halfDay: 57.5, id: 6, region: '境外' },
]);
const regions = reactive<RegionRule[]>([
  { code: 'A', members: '欧洲、日本', name: 'A 区域' },
  { code: 'B', members: '中国大陆、香港、澳门、台湾', name: 'B 区域' },
  { code: 'C', members: '除 A、B 区域外的其他国家和地区', name: 'C 区域' },
]);
const bases = reactive(['上海', '北京', '深圳', '广州']);
const newBase = ref('');
const exchangeRates = reactive<ExchangeRate[]>([
  { currency: 'USD', id: 1, month: '2026-08', rate: 7.18 },
  { currency: 'EUR', id: 2, month: '2026-08', rate: 7.83 },
]);
let standardSequence = 10;
let rateSequence = 10;

try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || 'null') as Partial<SavedConfiguration> | null;
  if (saved) {
    if (profiles.some((profile) => profile.id === saved.activeProfileId)) {
      activeProfileId.value = saved.activeProfileId!;
      selectedProfileId.value = saved.activeProfileId!;
    }
    if (typeof saved.returnCutoff === 'string') returnCutoff.value = saved.returnCutoff;
    if (typeof saved.noonThreshold === 'string') noonThreshold.value = saved.noonThreshold;
    if (typeof saved.departureLeadHours === 'number') departureLeadHours.value = saved.departureLeadHours;
    if (typeof saved.returnPostHours === 'number') returnPostHours.value = saved.returnPostHours;
    if (typeof saved.includePositioning === 'boolean') includePositioning.value = saved.includePositioning;
    if (typeof saved.communicationEnabled === 'boolean') communicationEnabled.value = saved.communicationEnabled;
    if (Array.isArray(saved.standards)) standards.splice(0, standards.length, ...saved.standards);
    if (Array.isArray(saved.regions)) regions.splice(0, regions.length, ...saved.regions);
    if (Array.isArray(saved.bases)) bases.splice(0, bases.length, ...saved.bases);
    if (Array.isArray(saved.exchangeRates)) exchangeRates.splice(0, exchangeRates.length, ...saved.exchangeRates);
    standardSequence = Math.max(10, ...standards.map((item) => item.id));
    rateSequence = Math.max(10, ...exchangeRates.map((item) => item.id));
  }
} catch {
  // Keep the approved defaults when local configuration cannot be parsed.
}

const selectedProfile = computed(() => profiles.find((profile) => profile.id === selectedProfileId.value) ?? profiles[0]!);

function addStandard() {
  standards.push({ category: '飞行员', communication: 0, currency: 'CNY', fullDay: 0, halfDay: 0, id: ++standardSequence, region: '统一' });
}

function removeStandard(id: number) {
  const index = standards.findIndex((item) => item.id === id);
  if (index >= 0) standards.splice(index, 1);
}

function addBase() {
  const value = newBase.value.trim();
  if (!value) return;
  if (bases.includes(value)) {
    ElMessage.warning('该驻地城市已存在');
    return;
  }
  bases.push(value);
  newBase.value = '';
}

function removeBase(index: number) {
  bases.splice(index, 1);
}

function addExchangeRate() {
  exchangeRates.push({ currency: 'USD', id: ++rateSequence, month: '2026-09', rate: 1 });
}

function removeExchangeRate(id: number) {
  const index = exchangeRates.findIndex((item) => item.id === id);
  if (index >= 0) exchangeRates.splice(index, 1);
}

function activateProfile() {
  activeProfileId.value = selectedProfileId.value;
  ElMessage.success(`已启用“${selectedProfile.value.name}”`);
}

function saveConfiguration() {
  localStorage.setItem(storageKey, JSON.stringify({
    activeProfileId: activeProfileId.value,
    bases,
    communicationEnabled: communicationEnabled.value,
    departureLeadHours: departureLeadHours.value,
    exchangeRates,
    includePositioning: includePositioning.value,
    noonThreshold: noonThreshold.value,
    regions,
    returnCutoff: returnCutoff.value,
    returnPostHours: returnPostHours.value,
    standards,
  }));
  ElMessage.success('驻外补贴规则已保存');
}
</script>

<template>
  <main class="rule-page sj-mission-control" data-starjet-theme="mission-control-dark">
    <header class="page-command">
      <div><span>ALLOWANCE POLICY</span><h1>驻外补贴规则</h1></div>
      <div class="command-actions"><i>当前生效：{{ profiles.find((item) => item.id === activeProfileId)?.name }}</i><ElButton type="primary" @click="saveConfiguration">保存配置</ElButton></div>
    </header>

    <section class="rule-workspace">
      <aside class="profile-rail" aria-label="计算规则类型">
        <header><span>计算模式</span><strong>{{ profiles.length }} 套规则</strong></header>
        <button v-for="profile in profiles" :key="profile.id" type="button" :class="{ active: selectedProfileId === profile.id }" @click="selectedProfileId = profile.id">
          <span>{{ profile.code }}<i v-if="activeProfileId === profile.id">生效中</i></span>
          <strong>{{ profile.name }}</strong>
          <small>{{ profile.description }}</small>
        </button>
      </aside>

      <div class="configuration-canvas">
        <section class="profile-summary">
          <div>
            <span>{{ selectedProfile.code }}</span>
            <h2>{{ selectedProfile.name }}</h2>
            <p>{{ selectedProfile.description }}</p>
          </div>
          <div class="profile-actions">
            <span v-for="tag in selectedProfile.tags" :key="tag">{{ tag }}</span>
            <ElButton v-if="activeProfileId !== selectedProfile.id" @click="activateProfile">设为生效规则</ElButton>
            <i v-else>当前生效</i>
          </div>
          <code>{{ selectedProfile.formula }}</code>
        </section>

        <section class="config-section parameters-section">
          <header><div><span>01</span><h3>核算参数</h3></div><small>时间均按人员驻地或航段当地时间判断</small></header>
          <div class="parameter-grid">
            <label><span>飞回驻地截止节点</span><ElInput v-model="returnCutoff" /><small>截止前落地当天不计驻外</small></label>
            <label><span>全天/半天分界</span><ElInput v-model="noonThreshold" /><small>当地中午时间，含该时刻</small></label>
            <label><span>离开驻地提前量</span><ElInputNumber v-model="departureLeadHours" :min="0" :max="12" /><small>计划起飞前小时数</small></label>
            <label><span>返回驻地延后量</span><ElInputNumber v-model="returnPostHours" :min="0" :max="12" /><small>实际关车后小时数</small></label>
            <label class="switch-field"><span>置位计入补贴天数</span><ElSwitch v-model="includePositioning" /><small>置位不计小时费，但可计驻外补贴</small></label>
            <label class="switch-field"><span>启用境外通讯补贴</span><ElSwitch v-model="communicationEnabled" /><small>航班涉及境外城市即发放</small></label>
          </div>
        </section>

        <section class="config-section standards-section">
          <header><div><span>02</span><h3>补贴标准</h3></div><ElButton @click="addStandard">新增标准</ElButton></header>
          <div class="standard-table-wrap">
            <div class="standard-table standard-head"><span>机组类别</span><span>适用区域</span><span>币种</span><span>全天标准</span><span>半天标准</span><span>通讯补贴/天</span><span>操作</span></div>
            <div v-for="item in standards" :key="item.id" class="standard-table standard-row">
              <ElSelect v-model="item.category"><ElOption v-for="category in ['飞行员','乘务员','机务','其他']" :key="category" :label="category" :value="category" /></ElSelect>
              <ElSelect v-model="item.region"><ElOption v-for="region in ['境内','境外','统一','A','B','C']" :key="region" :label="region" :value="region" /></ElSelect>
              <ElSelect v-model="item.currency"><ElOption v-for="currency in ['CNY','USD','EUR']" :key="currency" :label="currency" :value="currency" /></ElSelect>
              <ElInputNumber v-model="item.fullDay" :controls="false" :min="0" :precision="2" />
              <ElInputNumber v-model="item.halfDay" :controls="false" :min="0" :precision="2" />
              <ElInputNumber v-model="item.communication" :controls="false" :min="0" :precision="2" />
              <button type="button" @click="removeStandard(item.id)">删除</button>
            </div>
          </div>
        </section>

        <div class="config-columns">
          <section class="config-section regions-section">
            <header><div><span>03</span><h3>区域划分</h3></div><small>区域规则按航段出发地判定</small></header>
            <div class="region-list">
              <label v-for="region in regions" :key="region.code"><b>{{ region.code }}</b><span><strong>{{ region.name }}</strong><ElInput v-model="region.members" type="textarea" :rows="2" resize="none" /></span></label>
            </div>
          </section>

          <section class="config-section bases-section">
            <header><div><span>04</span><h3>驻地城市</h3></div><small>人员可从已开放城市中选择驻地</small></header>
            <div class="base-tags"><span v-for="(base,index) in bases" :key="base">{{ base }}<button type="button" :aria-label="`删除驻地${base}`" @click="removeBase(index)">×</button></span></div>
            <div class="base-composer"><ElInput v-model="newBase" placeholder="输入城市名称" @keyup.enter="addBase" /><ElButton @click="addBase">新增驻地</ElButton></div>
          </section>
        </div>

        <section class="config-section exchange-section">
          <header><div><span>05</span><h3>月度汇率</h3></div><ElButton @click="addExchangeRate">新增汇率</ElButton></header>
          <div class="exchange-table">
            <div class="exchange-head"><span>结算月份</span><span>币种</span><span>兑人民币汇率</span><span>维护方式</span><span>操作</span></div>
            <div v-for="rate in exchangeRates" :key="rate.id" class="exchange-row">
              <ElDatePicker v-model="rate.month" type="month" value-format="YYYY-MM" />
              <ElSelect v-model="rate.currency"><ElOption label="USD" value="USD" /><ElOption label="EUR" value="EUR" /><ElOption label="CNY" value="CNY" /></ElSelect>
              <ElInputNumber v-model="rate.rate" :controls="false" :min="0" :precision="4" />
              <span>财务每月手动维护</span>
              <button type="button" @click="removeExchangeRate(rate.id)">删除</button>
            </div>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.rule-page{min-height:100%;padding:var(--sj-space-5);color:var(--sj-text-1);background:var(--sj-canvas);font-size:12px}.page-command,.rule-workspace,.config-section,.profile-summary{border:1px solid var(--sj-border);background:var(--sj-surface-1)}.page-command{display:flex;min-height:64px;padding:var(--sj-space-3) var(--sj-space-4);align-items:center;justify-content:space-between;gap:var(--sj-space-4)}.page-command>div:first-child>span{color:var(--sj-blue);font:700 9px var(--sj-font-data);letter-spacing:.12em}.page-command h1{margin:var(--sj-space-1) 0 0;font-size:20px;line-height:1.2}.command-actions{display:flex;align-items:center;gap:var(--sj-space-3)}.command-actions i{color:var(--sj-text-2);font-size:10px;font-style:normal}.page-command :deep(.el-button--primary){height:var(--sj-control-dense);border-color:var(--sj-lime);color:var(--sj-canvas);background:var(--sj-lime);font-size:11px}
.rule-workspace{display:grid;margin-top:var(--sj-space-3);grid-template-columns:248px minmax(0,1fr);align-items:start}.profile-rail{position:sticky;top:0;display:grid;border-right:1px solid var(--sj-border);background:var(--sj-surface-2)}.profile-rail>header{display:flex;min-height:44px;padding:0 var(--sj-space-3);align-items:center;justify-content:space-between;border-bottom:1px solid var(--sj-border)}.profile-rail>header span{color:var(--sj-text-3)}.profile-rail>header strong{font:700 11px var(--sj-font-data)}.profile-rail>button{display:grid;min-height:112px;padding:var(--sj-space-3);gap:var(--sj-space-2);border:0;border-bottom:1px solid var(--sj-border);border-left:2px solid transparent;color:var(--sj-text-2);text-align:left;background:transparent;cursor:pointer}.profile-rail>button:hover{background:var(--sj-surface-3)}.profile-rail>button.active{border-left-color:var(--sj-blue);background:var(--sj-blue-soft)}.profile-rail>button>span{display:flex;align-items:center;justify-content:space-between;color:var(--sj-blue);font:700 9px var(--sj-font-data);letter-spacing:.08em}.profile-rail>button i{padding:2px var(--sj-space-1);border-radius:var(--sj-radius-tag);color:var(--sj-lime);background:var(--sj-lime-soft);font-size:8px;font-style:normal;letter-spacing:0}.profile-rail>button strong{color:var(--sj-text-1);font-size:13px}.profile-rail>button small{color:var(--sj-text-3);font-size:10px;line-height:1.6}
.configuration-canvas{display:grid;padding:var(--sj-space-3);gap:var(--sj-space-3);min-width:0}.profile-summary{display:grid;padding:var(--sj-space-4);grid-template-columns:minmax(0,1fr) auto;gap:var(--sj-space-3)}.profile-summary>div:first-child>span{color:var(--sj-blue);font:700 9px var(--sj-font-data);letter-spacing:.1em}.profile-summary h2{margin:var(--sj-space-1) 0;font-size:18px}.profile-summary p{max-width:760px;margin:0;color:var(--sj-text-2);font-size:11px;line-height:1.7}.profile-summary code{grid-column:1/-1;padding:var(--sj-space-2) var(--sj-space-3);border-left:2px solid var(--sj-blue);color:var(--sj-text-2);background:var(--sj-surface-2);font-size:11px}.profile-actions{display:flex;max-width:360px;align-content:flex-start;justify-content:flex-end;gap:var(--sj-space-1);flex-wrap:wrap}.profile-actions>span{height:22px;padding:0 var(--sj-space-2);border:1px solid var(--sj-border);border-radius:var(--sj-radius-tag);color:var(--sj-text-2);font-size:9px;line-height:20px}.profile-actions>i{height:22px;padding:0 var(--sj-space-2);border-radius:var(--sj-radius-tag);color:var(--sj-lime);background:var(--sj-lime-soft);font-size:9px;font-style:normal;line-height:22px}.profile-actions :deep(.el-button){height:22px;padding:0 var(--sj-space-2);font-size:9px}
.config-section{min-width:0}.config-section>header{display:flex;min-height:44px;padding:0 var(--sj-space-3);align-items:center;justify-content:space-between;border-bottom:1px solid var(--sj-border);gap:var(--sj-space-3)}.config-section>header>div{display:flex;align-items:center;gap:var(--sj-space-2)}.config-section>header>div>span{color:var(--sj-blue);font:700 9px var(--sj-font-data)}.config-section h3{margin:0;font-size:13px}.config-section>header small{color:var(--sj-text-3);font-size:9px}.config-section>header :deep(.el-button){height:var(--sj-control-dense);font-size:10px}.parameter-grid{display:grid;padding:var(--sj-space-3);grid-template-columns:repeat(3,minmax(160px,1fr));gap:var(--sj-space-3)}.parameter-grid label{display:grid;min-width:0;gap:var(--sj-space-1)}.parameter-grid label>span{color:var(--sj-text-2);font-size:10px}.parameter-grid label>small{color:var(--sj-text-3);font-size:8px}.parameter-grid .switch-field{grid-template-columns:1fr auto}.parameter-grid .switch-field small{grid-column:1/-1}.parameter-grid :deep(.el-input-number){width:100%}
.standard-table-wrap{overflow-x:auto}.standard-table{display:grid;min-width:850px;grid-template-columns:150px 120px 100px repeat(3,minmax(110px,1fr)) 52px;align-items:center;gap:var(--sj-space-2);padding:0 var(--sj-space-3)}.standard-head{min-height:34px;color:var(--sj-text-3);font-size:9px;background:var(--sj-surface-2)}.standard-row{min-height:48px;border-top:1px solid var(--sj-border)}.standard-row>button,.exchange-row>button{height:var(--sj-control-dense);border:1px solid var(--sj-border);border-radius:var(--sj-radius-control);color:var(--sj-red);background:transparent;font-size:9px;cursor:pointer}.standard-row>button:hover,.exchange-row>button:hover{border-color:var(--sj-red);background:var(--sj-red-soft)}
.config-columns{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(260px,.8fr);gap:var(--sj-space-3)}.region-list{display:grid}.region-list label{display:grid;min-height:86px;padding:var(--sj-space-3);grid-template-columns:38px minmax(0,1fr);align-items:start;gap:var(--sj-space-2);border-bottom:1px solid var(--sj-border)}.region-list label:last-child{border-bottom:0}.region-list label>b{display:grid;width:28px;height:28px;place-items:center;border:1px solid var(--sj-blue);border-radius:var(--sj-radius-tag);color:var(--sj-blue);font:800 12px var(--sj-font-data)}.region-list label>span{display:grid;gap:var(--sj-space-2)}.base-tags{display:flex;min-height:100px;padding:var(--sj-space-3);align-content:flex-start;gap:var(--sj-space-2);flex-wrap:wrap}.base-tags>span{display:inline-flex;height:28px;padding-left:var(--sj-space-2);align-items:center;gap:var(--sj-space-1);border:1px solid var(--sj-border);border-radius:var(--sj-radius-control);color:var(--sj-text-1);background:var(--sj-surface-2)}.base-tags button{width:24px;height:26px;border:0;color:var(--sj-text-3);background:transparent;cursor:pointer}.base-tags button:hover{color:var(--sj-red)}.base-composer{display:flex;padding:var(--sj-space-3);gap:var(--sj-space-2);border-top:1px solid var(--sj-border)}
.exchange-table{overflow-x:auto}.exchange-head,.exchange-row{display:grid;min-width:700px;grid-template-columns:170px 120px 170px minmax(180px,1fr) 52px;align-items:center;gap:var(--sj-space-2);padding:0 var(--sj-space-3)}.exchange-head{min-height:34px;color:var(--sj-text-3);font-size:9px;background:var(--sj-surface-2)}.exchange-row{min-height:48px;border-top:1px solid var(--sj-border)}.exchange-row>span{color:var(--sj-text-3);font-size:10px}.exchange-row :deep(.el-date-editor),.exchange-row :deep(.el-input-number){width:100%}
.rule-page :deep(.el-input__wrapper),.rule-page :deep(.el-select__wrapper),.rule-page :deep(.el-textarea__inner){min-height:var(--sj-control-dense);border-radius:var(--sj-radius-control);color:var(--sj-text-1);background:var(--sj-surface-3);box-shadow:0 0 0 1px var(--sj-border) inset}.rule-page :deep(.el-input__inner),.rule-page :deep(.el-select__selected-item),.rule-page :deep(.el-textarea__inner){color:var(--sj-text-1);font-size:10px}.rule-page :deep(.el-switch.is-checked .el-switch__core){border-color:var(--sj-lime);background:var(--sj-lime)}
@media(max-width:1280px){.rule-page{padding:var(--sj-space-3)}.rule-workspace{grid-template-columns:220px minmax(0,1fr)}.parameter-grid{grid-template-columns:repeat(2,minmax(160px,1fr))}}
@media(max-width:1024px){.rule-workspace{display:block}.profile-rail{position:static;grid-template-columns:repeat(2,minmax(0,1fr));border-right:0;border-bottom:1px solid var(--sj-border)}.profile-rail>header{grid-column:1/-1}.profile-rail>button{min-height:96px;border-left:0;border-bottom:1px solid var(--sj-border)}.profile-rail>button.active{border-left:0;box-shadow:inset 0 -2px var(--sj-blue)}.config-columns{grid-template-columns:1fr}.page-command{align-items:flex-start}.command-actions{flex-wrap:wrap;justify-content:flex-end}}
</style>

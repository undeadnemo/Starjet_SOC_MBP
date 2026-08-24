<script lang="ts" setup>
import { computed, ref } from 'vue';

import { createIconifyIcon } from '@vben/icons';
import { ElMessage } from 'element-plus';

defineOptions({ name: 'CrewInformation' });

const BadgeIcon = createIconifyIcon('lucide:badge-check');
const BellIcon = createIconifyIcon('lucide:bell-ring');
const FileIcon = createIconifyIcon('lucide:file-badge');
const SearchIcon = createIconifyIcon('lucide:search');
const UserIcon = createIconifyIcon('lucide:user-round');

type CrewRole = 'PIC' | 'SIC' | '乘务';
type CrewState = 'attention' | 'in-service' | 'leave';

interface CrewProfile {
  base: string;
  chineseName: string;
  email: string;
  englishName: string;
  id: string;
  nationality: string;
  phone: string;
  qualification: string;
  role: CrewRole;
  state: CrewState;
  stateLabel: string;
  systemId: string;
}

const crew = ref<CrewProfile[]>([
  { base: 'ZSPD', chineseName: '张铭', email: 'ming.zhang@starjet.example', englishName: 'ZHANG, MING', id: 'CREW-001', nationality: '中国 / CHN', phone: '+86 138 **** 2817', qualification: 'G650ER · G450', role: 'PIC', state: 'in-service', stateLabel: '在岗', systemId: 'zhangming' },
  { base: 'ZSPD', chineseName: '李睿', email: 'rui.li@starjet.example', englishName: 'LI, RUI', id: 'CREW-002', nationality: '中国 / CHN', phone: '+86 139 **** 3206', qualification: 'G650ER · G450', role: 'SIC', state: 'in-service', stateLabel: '在岗', systemId: 'lirui' },
  { base: 'ZSPD', chineseName: '许静', email: 'jing.xu@starjet.example', englishName: 'XU, JING', id: 'CREW-003', nationality: '中国 / CHN', phone: '+86 136 **** 8711', qualification: '资深乘务员 · 国际航线', role: '乘务', state: 'attention', stateLabel: '证照临期', systemId: 'xujing' },
  { base: 'ZBAA', chineseName: '王晨', email: 'chen.wang@starjet.example', englishName: 'WANG, CHEN', id: 'CREW-004', nationality: '中国 / CHN', phone: '+86 135 **** 0928', qualification: 'G650ER', role: 'PIC', state: 'in-service', stateLabel: '在岗', systemId: 'wangchen' },
  { base: 'ZBAA', chineseName: '陈昊', email: 'hao.chen@starjet.example', englishName: 'CHEN, HAO', id: 'CREW-005', nationality: '中国 / CHN', phone: '+86 137 **** 6652', qualification: 'G650ER · G550', role: 'SIC', state: 'leave', stateLabel: '休假中', systemId: 'chenhao' },
  { base: 'ZGGG', chineseName: '周宁', email: 'ning.zhou@starjet.example', englishName: 'ZHOU, NING', id: 'CREW-006', nationality: '中国 / CHN', phone: '+86 138 **** 1470', qualification: '乘务员 · 国际航线', role: '乘务', state: 'in-service', stateLabel: '在岗', systemId: 'zhouning' },
]);

const tabs = ['基本', '证件告警', '证件信息', '技术证照', '请休假', '驻外记录', '其他'] as const;
const activeTab = ref<(typeof tabs)[number]>('基本');
const selectedId = ref('CREW-003');
const keyword = ref('');
const roleFilter = ref('全部岗位');
const alertStatusFilter = ref('全部告警');

const selectedCrew = computed(() => crew.value.find((item) => item.id === selectedId.value) || crew.value[0]!);
const filteredCrew = computed(() => crew.value.filter((item) =>
  (roleFilter.value === '全部岗位' || item.role === roleFilter.value) &&
  (!keyword.value || `${item.chineseName}${item.englishName}${item.systemId}${item.qualification}`.toLowerCase().includes(keyword.value.toLowerCase())),
));

type CredentialAlertLevel = 'critical' | 'warning';

interface CredentialAlert {
  category: '技术证照' | '证件信息';
  crewId: string;
  credential: string;
  daysLeft: number;
  expiry: string;
  id: string;
  level: CredentialAlertLevel;
  notified: boolean;
}

const credentialAlerts = ref<CredentialAlert[]>([
  { category: '技术证照', crewId: 'CREW-003', credential: '乘务员训练合格证', daysLeft: 2, expiry: '2026-08-25', id: 'ALERT-001', level: 'warning', notified: false },
  { category: '证件信息', crewId: 'CREW-004', credential: '日本签证', daysLeft: -3, expiry: '2026-08-20', id: 'ALERT-002', level: 'critical', notified: true },
  { category: '技术证照', crewId: 'CREW-002', credential: '体检合格证', daysLeft: 14, expiry: '2026-09-06', id: 'ALERT-003', level: 'warning', notified: false },
  { category: '证件信息', crewId: 'CREW-005', credential: '港澳通行证', daysLeft: 27, expiry: '2026-09-19', id: 'ALERT-004', level: 'warning', notified: false },
]);

const filteredCredentialAlerts = computed(() => credentialAlerts.value.filter((alert) =>
  alertStatusFilter.value === '全部告警' ||
  (alertStatusFilter.value === '已失效' && alert.level === 'critical') ||
  (alertStatusFilter.value === '30天内到期' && alert.level === 'warning'),
));
const expiredCredentialCount = computed(() => credentialAlerts.value.filter((alert) => alert.level === 'critical').length);

function alertCrewName(crewId: string) {
  return crew.value.find((member) => member.id === crewId)?.chineseName || '未知人员';
}

function notifyCredentialOwner(alert: CredentialAlert) {
  alert.notified = true;
  ElMessage.success(`已提醒 ${alertCrewName(alert.crewId)} 处理${alert.credential}`);
}

const identityDocuments = [
  { chineseName: '护照', description: '本人手中', expiry: '2036-03-17', issue: '2026-03-18', name: 'Passport', number: 'E92••••17', status: '有效' },
  { chineseName: '身份证', description: '本人手中', expiry: '2044-12-12', issue: '2024-12-12', name: 'ID', number: '310••••0626', status: '有效' },
  { chineseName: '空勤登机证', description: '随身携带', expiry: '2031-12-31', issue: '2023-10-22', name: 'CAAC Crew Pass', number: 'CC-•••291', status: '有效' },
  { chineseName: '港澳通行证', description: '本人手中', expiry: '2033-07-20', issue: '2023-07-21', name: 'Travel Permit HK&MO', number: 'C84••••03', status: '有效' },
  { chineseName: '签证', description: '法国申根', expiry: '2028-05-28', issue: '2026-05-29', name: 'VISA', number: 'FRA-•••82', status: '有效' },
];

const technicalCertificates = [
  { chineseName: '乘务员训练合格证', expiry: '2026-08-25', issue: '2025-08-26', name: 'Attendant Training Certificate', number: '07', status: '14 天内到期' },
  { chineseName: '危险品培训合格证', expiry: '2027-08-08', issue: '2025-08-08', name: 'Dangerous Goods Training Certificate', number: 'DG-1158', status: '有效' },
  { chineseName: '体检合格证', expiry: '2027-07-18', issue: '2026-07-18', name: 'Medical Certificate', number: 'MED-7021', status: '有效' },
];

const leaveRecords = [
  { created: '2026-08-17 14:23', duration: '3 天', end: '2026-08-31', reason: '年假', start: '2026-08-29', status: '已批准' },
  { created: '2026-07-08 09:16', duration: '1 天', end: '2026-07-16', reason: '调休', start: '2026-07-16', status: '已完成' },
];

const overseasRecords = [
  { end: '2026-06-18', location: '新加坡 · WSSS', note: '国际航线保障待命', start: '2026-06-12' },
  { end: '2026-04-09', location: '东京 · RJTT', note: 'VIP 包机驻外保障', start: '2026-04-05' },
];

function editProfile() {
  ElMessage.info(`正在编辑 ${selectedCrew.value.chineseName} 的机组资料`);
}
</script>

<template>
  <main class="crew-info-page sj-mission-control">
    <header class="page-command">
      <div><UserIcon /><span><strong>机组信息</strong><small>人员档案、证照与资质状态</small></span></div>
      <button class="primary-action" type="button" @click="editProfile">新增机组人员</button>
    </header>

    <section class="crew-metrics" aria-label="机组人员指标">
      <div><i class="blue"></i><strong>{{ crew.length }}</strong><span>机组人员</span></div>
      <div><i class="lime"></i><strong>{{ crew.filter((item) => item.state === 'in-service').length }}</strong><span>当前在岗</span></div>
      <button type="button" @click="activeTab = '证件告警'"><i class="amber"></i><strong>{{ credentialAlerts.length }}</strong><span>证件告警</span></button>
      <button type="button" @click="activeTab = '证件告警'; alertStatusFilter = '已失效'"><i class="red"></i><strong>{{ expiredCredentialCount }}</strong><span>已失效</span></button>
      <div><i class="blue"></i><strong>{{ crew.filter((item) => item.state === 'leave').length }}</strong><span>休假中</span></div>
    </section>

    <section class="crew-info-workspace">
      <aside class="crew-directory" aria-label="机组人员列表">
        <header><strong>人员列表</strong><small>{{ filteredCrew.length }} 人</small></header>
        <div class="directory-filters">
          <label><SearchIcon /><input v-model="keyword" aria-label="搜索机组人员" placeholder="姓名 / 系统ID / 资质" /></label>
          <select v-model="roleFilter" aria-label="岗位筛选"><option>全部岗位</option><option>PIC</option><option>SIC</option><option>乘务</option></select>
        </div>
        <button v-for="member in filteredCrew" :key="member.id" :class="['person-row', member.state, { selected: selectedId === member.id }]" type="button" @click="selectedId = member.id">
          <span><strong>{{ member.chineseName }}</strong><b>{{ member.role }}</b></span>
          <small>{{ member.englishName }} · {{ member.systemId }}</small>
          <em><i></i>{{ member.stateLabel }}</em><time>{{ member.base }}</time>
        </button>
      </aside>

      <section class="profile-panel">
        <header class="profile-summary">
          <span class="avatar">{{ selectedCrew.chineseName.slice(-1) }}</span>
          <div><span><b>{{ selectedCrew.role }}</b><em :class="selectedCrew.state"><i></i>{{ selectedCrew.stateLabel }}</em></span><strong>{{ selectedCrew.chineseName }}</strong><small>{{ selectedCrew.englishName }} · {{ selectedCrew.systemId }}</small></div>
          <dl><div><dt>基地</dt><dd>{{ selectedCrew.base }}</dd></div><div><dt>技术等级 / 资质</dt><dd>{{ selectedCrew.qualification }}</dd></div></dl>
          <button class="secondary-action" type="button" @click="editProfile">编辑资料</button>
        </header>

        <nav class="profile-tabs" aria-label="机组资料分类">
          <button v-for="tab in tabs" :key="tab" :class="{ active: activeTab === tab }" type="button" @click="activeTab = tab">{{ tab }}<span v-if="tab === '证件告警'" class="warning">{{ credentialAlerts.length }}</span><span v-else-if="tab === '证件信息'">{{ identityDocuments.length }}</span><span v-else-if="tab === '技术证照'" class="warning">1</span></button>
        </nav>

        <section v-if="activeTab === '基本'" class="profile-content basic-grid">
          <article><header><UserIcon /><strong>基本资料</strong></header><dl><div><dt>系统ID</dt><dd>{{ selectedCrew.systemId }}</dd></div><div><dt>机组类别</dt><dd>{{ selectedCrew.role }}</dd></div><div><dt>状态</dt><dd>{{ selectedCrew.stateLabel }}</dd></div><div><dt>英文名称</dt><dd>{{ selectedCrew.englishName }}</dd></div><div><dt>中文名称</dt><dd>{{ selectedCrew.chineseName }}</dd></div><div><dt>国籍</dt><dd>{{ selectedCrew.nationality }}</dd></div></dl></article>
          <article><header><BadgeIcon /><strong>任职与联系</strong></header><dl><div><dt>执照机型 / 技术等级</dt><dd>{{ selectedCrew.qualification }}</dd></div><div><dt>运行基地</dt><dd>{{ selectedCrew.base }}</dd></div><div><dt>手机</dt><dd>{{ selectedCrew.phone }}</dd></div><div><dt>邮件</dt><dd>{{ selectedCrew.email }}</dd></div><div class="wide"><dt>地址（中文）</dt><dd>上海市浦东新区 · 已登记</dd></div><div class="wide"><dt>紧急联系人</dt><dd>已登记 · 仅授权人员可见</dd></div></dl></article>
        </section>

        <section v-else-if="activeTab === '证件告警'" class="profile-content data-section credential-alerts">
          <header>
            <div><BellIcon /><span><strong>证件失效告警</strong><small>监控全部机组人员的身份、出入境及技术证照有效期</small></span></div>
            <label><span>告警范围</span><select v-model="alertStatusFilter" aria-label="证件告警范围"><option>全部告警</option><option>已失效</option><option>30天内到期</option></select></label>
          </header>
          <div class="alert-summary">
            <span class="critical"><i></i><b>{{ expiredCredentialCount }}</b> 项已失效</span>
            <span class="warning"><i></i><b>{{ credentialAlerts.length - expiredCredentialCount }}</b> 项将在 30 天内到期</span>
            <small>数据基准：2026-08-23 · UTC+08:00</small>
          </div>
          <div class="table-wrap"><table><thead><tr><th>人员</th><th>证件 / 证照</th><th>分类</th><th>失效日期</th><th>剩余时间</th><th>处理状态</th><th>操作</th></tr></thead><tbody><tr v-for="alert in filteredCredentialAlerts" :key="alert.id" :class="`alert-row-${alert.level}`"><td><strong>{{ alertCrewName(alert.crewId) }}</strong><small>{{ alert.crewId }}</small></td><td><strong>{{ alert.credential }}</strong></td><td>{{ alert.category }}</td><td :class="`expiry-${alert.level}`">{{ alert.expiry }}</td><td><span :class="['status-chip', alert.level]">{{ alert.daysLeft < 0 ? `已失效 ${Math.abs(alert.daysLeft)} 天` : `剩余 ${alert.daysLeft} 天` }}</span></td><td><span :class="['notice-state', { notified: alert.notified }]"><i></i>{{ alert.notified ? '已通知' : '待通知' }}</span></td><td><button class="table-action" type="button" :disabled="alert.notified" @click="notifyCredentialOwner(alert)">{{ alert.notified ? '已提醒' : '发送提醒' }}</button></td></tr></tbody></table></div>
          <p v-if="filteredCredentialAlerts.length === 0" class="alert-empty">当前范围内没有证件失效告警。</p>
        </section>

        <section v-else-if="activeTab === '证件信息'" class="profile-content data-section">
          <header><div><FileIcon /><span><strong>证件信息</strong><small>身份与出入境证件</small></span></div><button class="secondary-action" type="button">新增证件</button></header>
          <div class="table-wrap"><table><thead><tr><th>证件名称</th><th>描述</th><th>号码</th><th>颁发日期</th><th>失效日期</th><th>状态</th></tr></thead><tbody><tr v-for="document in identityDocuments" :key="`${document.name}-${document.number}`"><td><strong>{{ document.chineseName }}</strong><small>{{ document.name }}</small></td><td>{{ document.description }}</td><td>{{ document.number }}</td><td>{{ document.issue }}</td><td>{{ document.expiry }}</td><td><span class="status-chip ready">{{ document.status }}</span></td></tr></tbody></table></div>
        </section>

        <section v-else-if="activeTab === '技术证照'" class="profile-content data-section">
          <header><div><BadgeIcon /><span><strong>技术证照</strong><small>训练、体检与专业资质</small></span></div><button class="secondary-action" type="button">新增证照</button></header>
          <div class="table-wrap"><table><thead><tr><th>证照名称</th><th>证照号码</th><th>颁发日期</th><th>失效日期</th><th>状态</th></tr></thead><tbody><tr v-for="certificate in technicalCertificates" :key="certificate.name"><td><strong>{{ certificate.chineseName }}</strong><small>{{ certificate.name }}</small></td><td>{{ certificate.number }}</td><td>{{ certificate.issue }}</td><td :class="{ 'expiry-warning': certificate.status !== '有效' }">{{ certificate.expiry }}</td><td><span :class="['status-chip', certificate.status === '有效' ? 'ready' : 'warning']">{{ certificate.status }}</span></td></tr></tbody></table></div>
        </section>

        <section v-else-if="activeTab === '请休假'" class="profile-content data-section">
          <header><div><UserIcon /><span><strong>请休假记录</strong><small>与机组排班同步计算可用性</small></span></div><button class="primary-action" type="button">发起请假</button></header>
          <div class="table-wrap"><table><thead><tr><th>类型</th><th>开始日期</th><th>结束日期</th><th>时长</th><th>申请时间</th><th>状态</th></tr></thead><tbody><tr v-for="record in leaveRecords" :key="record.created"><td>{{ record.reason }}</td><td>{{ record.start }}</td><td>{{ record.end }}</td><td>{{ record.duration }}</td><td>{{ record.created }}</td><td><span class="status-chip ready">{{ record.status }}</span></td></tr></tbody></table></div>
        </section>

        <section v-else-if="activeTab === '驻外记录'" class="profile-content data-section">
          <header><div><UserIcon /><span><strong>驻外记录</strong><small>人员驻外与基地调配历史</small></span></div><button class="secondary-action" type="button">新增记录</button></header>
          <div class="table-wrap"><table><thead><tr><th>地点</th><th>开始日期</th><th>结束日期</th><th>说明</th></tr></thead><tbody><tr v-for="record in overseasRecords" :key="record.start"><td>{{ record.location }}</td><td>{{ record.start }}</td><td>{{ record.end }}</td><td>{{ record.note }}</td></tr></tbody></table></div>
        </section>

        <section v-else class="profile-content other-panel"><FileIcon /><strong>其他资料</strong><p>体检备注、培训记录及经授权的内部补充资料。</p><button class="secondary-action" type="button">添加资料</button></section>
      </section>
    </section>
  </main>
</template>

<style scoped>
.crew-info-page { min-height: 100%; color: var(--sj-text-1); background: var(--sj-canvas); font-family: var(--sj-font-ui); }.page-command { display: flex; min-height: 64px; padding: 0 var(--sj-space-5); align-items: center; justify-content: space-between; border-bottom: 1px solid var(--sj-border); background: var(--sj-surface-1); }.page-command > div { display: flex; align-items: center; gap: var(--sj-space-3); }.page-command svg { width: 22px; color: var(--sj-blue); }.page-command span { display: grid; }.page-command strong { font-size: 16px; }.page-command small { color: var(--sj-text-3); font-size: 10px; }.primary-action, .secondary-action { min-height: var(--sj-control-default); padding: 0 var(--sj-space-4); border-radius: var(--sj-radius-control); font-weight: 750; white-space: nowrap; }.primary-action { border: 1px solid var(--sj-lime); color: var(--sj-canvas); background: var(--sj-lime); }.secondary-action { border: 1px solid var(--sj-border-strong); color: var(--sj-text-1); background: var(--sj-surface-3); }
.crew-metrics { display: grid; min-height: 68px; grid-template-columns: repeat(5, minmax(140px, 1fr)); border-bottom: 1px solid var(--sj-border); }.crew-metrics > :is(div, button) { display: grid; padding: var(--sj-space-3) var(--sj-space-5); align-content: center; grid-template-columns: 12px auto; column-gap: var(--sj-space-2); border: 0; border-right: 1px solid var(--sj-border); color: var(--sj-text-1); text-align: left; background: transparent; }.crew-metrics > button:hover { background: var(--sj-surface-3); }.crew-metrics i { width: 7px; height: 7px; margin-top: 7px; border-radius: 50%; }.crew-metrics i.blue { background: var(--sj-blue); }.crew-metrics i.lime { background: var(--sj-lime); }.crew-metrics i.amber { background: var(--sj-amber); }.crew-metrics i.red { background: var(--sj-red); }.crew-metrics strong { font: 750 20px var(--sj-font-data); }.crew-metrics span { grid-column: 2; color: var(--sj-text-3); font-size: 9px; }
.crew-info-workspace { display: grid; min-height: calc(100vh - 240px); grid-template-columns: 320px minmax(0, 1fr); }.crew-directory { border-right: 1px solid var(--sj-border); background: var(--sj-surface-1); }.crew-directory > header { display: flex; min-height: 52px; padding: 0 var(--sj-space-4); align-items: center; justify-content: space-between; border-bottom: 1px solid var(--sj-border); }.crew-directory header strong { font-size: 13px; }.crew-directory header small { color: var(--sj-text-3); font: 9px var(--sj-font-data); }.directory-filters { display: grid; padding: var(--sj-space-3); grid-template-columns: 1fr 92px; gap: var(--sj-space-2); border-bottom: 1px solid var(--sj-border); }.directory-filters label { display: flex; min-width: 0; height: var(--sj-control-dense); padding: 0 var(--sj-space-2); align-items: center; gap: var(--sj-space-2); border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); background: var(--sj-surface-2); }.directory-filters svg { width: 14px; color: var(--sj-text-3); }.directory-filters input { width: 100%; min-width: 0; border: 0; outline: 0; color: var(--sj-text-1); background: transparent; font-size: 10px; }.directory-filters select { border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); color: var(--sj-text-1); background: var(--sj-surface-2); font-size: 10px; }.person-row { position: relative; display: grid; width: 100%; min-height: 76px; padding: var(--sj-space-3) var(--sj-space-4); grid-template-columns: 1fr auto; gap: var(--sj-space-1); border: 0; border-bottom: 1px solid var(--sj-border); color: var(--sj-text-1); text-align: left; background: transparent; }.person-row:hover, .person-row.selected { background: var(--sj-surface-3); }.person-row.selected { box-shadow: inset 2px 0 var(--sj-blue); }.person-row > span { display: flex; align-items: center; gap: var(--sj-space-2); }.person-row span strong { font-size: 13px; }.person-row span b { padding: 1px var(--sj-space-1); border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-tag); color: var(--sj-blue); font: 8px var(--sj-font-data); }.person-row small { grid-row: 2; color: var(--sj-text-3); font: 8px var(--sj-font-data); }.person-row em { display: inline-flex; align-items: center; gap: var(--sj-space-1); color: var(--sj-lime); font-size: 9px; font-style: normal; }.person-row em i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }.person-row.attention em { color: var(--sj-amber); }.person-row.leave em { color: var(--sj-blue); }.person-row time { color: var(--sj-text-3); font: 9px var(--sj-font-data); text-align: right; }
.profile-panel { min-width: 0; }.profile-summary { display: grid; min-height: 124px; padding: var(--sj-space-5); align-items: center; grid-template-columns: 60px minmax(190px, 1fr) minmax(320px, 1.4fr) auto; gap: var(--sj-space-4); border-bottom: 1px solid var(--sj-border); background: var(--sj-surface-1); }.avatar { display: grid; width: 56px; height: 56px; place-items: center; border: 1px solid var(--sj-border-strong); border-radius: 50%; color: var(--sj-blue); background: var(--sj-blue-soft); font-size: 22px; font-weight: 800; }.profile-summary > div { display: grid; gap: var(--sj-space-1); }.profile-summary > div > span { display: flex; gap: var(--sj-space-2); }.profile-summary > div b, .profile-summary > div em { display: inline-flex; padding: 2px var(--sj-space-2); align-items: center; gap: var(--sj-space-1); border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-tag); color: var(--sj-blue); font: 8px var(--sj-font-data); font-style: normal; }.profile-summary > div em { color: var(--sj-lime); }.profile-summary > div em.attention { color: var(--sj-amber); }.profile-summary > div em.leave { color: var(--sj-blue); }.profile-summary > div em i { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }.profile-summary > div > strong { font-size: 20px; }.profile-summary > div > small { color: var(--sj-text-3); font: 9px var(--sj-font-data); }.profile-summary dl { display: grid; margin: 0; grid-template-columns: 120px 1fr; gap: var(--sj-space-3); }.profile-summary dl div { display: grid; gap: var(--sj-space-1); }.profile-summary dt { color: var(--sj-text-3); font-size: 9px; }.profile-summary dd { margin: 0; font: 11px var(--sj-font-data); }
.profile-tabs { display: flex; min-height: 54px; padding: 0 var(--sj-space-5); gap: var(--sj-space-5); overflow-x: auto; border-bottom: 1px solid var(--sj-border); background: var(--sj-surface-2); }.profile-tabs button { position: relative; display: flex; min-width: max-content; padding: 0 var(--sj-space-1); align-items: center; gap: var(--sj-space-2); border: 0; color: var(--sj-text-2); background: transparent; font-size: 11px; font-weight: 700; }.profile-tabs button.active { color: var(--sj-text-1); }.profile-tabs button.active::after { position: absolute; right: 0; bottom: 0; left: 0; height: 2px; background: var(--sj-blue); content: ''; }.profile-tabs button span { min-width: 18px; padding: 1px var(--sj-space-1); border-radius: var(--sj-radius-tag); color: var(--sj-text-2); background: var(--sj-surface-4); font: 8px var(--sj-font-data); text-align: center; }.profile-tabs button span.warning { color: var(--sj-amber); background: var(--sj-amber-soft); }
.profile-content { min-height: 360px; }.basic-grid { display: grid; padding: var(--sj-space-5); grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sj-space-4); }.basic-grid article { border: 1px solid var(--sj-border); background: var(--sj-surface-1); }.basic-grid article > header { display: flex; min-height: 48px; padding: 0 var(--sj-space-4); align-items: center; gap: var(--sj-space-2); border-bottom: 1px solid var(--sj-border); }.basic-grid header svg, .data-section > header svg, .other-panel > svg { width: 16px; color: var(--sj-blue); }.basic-grid header strong { font-size: 12px; }.basic-grid dl { display: grid; margin: 0; grid-template-columns: repeat(2, minmax(0, 1fr)); }.basic-grid dl div { min-height: 64px; padding: var(--sj-space-3) var(--sj-space-4); border-right: 1px solid var(--sj-border); border-bottom: 1px solid var(--sj-border); }.basic-grid dl div.wide { grid-column: 1 / -1; }.basic-grid dt { color: var(--sj-text-3); font-size: 9px; }.basic-grid dd { margin: var(--sj-space-1) 0 0; font-size: 11px; }.data-section > header { display: flex; min-height: 64px; padding: 0 var(--sj-space-5); align-items: center; justify-content: space-between; border-bottom: 1px solid var(--sj-border); }.data-section > header > div { display: flex; align-items: center; gap: var(--sj-space-3); }.data-section > header span { display: grid; }.data-section > header strong { font-size: 13px; }.data-section > header small { color: var(--sj-text-3); font-size: 9px; }.table-wrap { overflow-x: auto; }.table-wrap table { width: 100%; min-width: 780px; border-collapse: collapse; }.table-wrap th { height: 40px; padding: 0 var(--sj-space-3); color: var(--sj-text-3); text-align: left; background: var(--sj-surface-2); font-size: 9px; }.table-wrap td { height: 52px; padding: var(--sj-space-2) var(--sj-space-3); border-bottom: 1px solid var(--sj-border); color: var(--sj-text-2); font: 10px var(--sj-font-data); }.table-wrap tbody tr:hover { background: var(--sj-surface-2); }.table-wrap td strong, .table-wrap td small { display: block; }.table-wrap td strong { color: var(--sj-text-1); font-family: var(--sj-font-ui); }.table-wrap td small { color: var(--sj-text-3); font-size: 8px; }.status-chip { display: inline-flex; padding: 2px var(--sj-space-2); border-radius: var(--sj-radius-tag); font: 8px var(--sj-font-ui); }.status-chip.ready { color: var(--sj-lime); background: var(--sj-lime-soft); }.status-chip.warning, .expiry-warning { color: var(--sj-amber) !important; }.status-chip.warning { background: var(--sj-amber-soft); }.status-chip.critical, .expiry-critical { color: var(--sj-red) !important; }.status-chip.critical { background: var(--sj-red-soft); }.credential-alerts > header label { display: grid; width: 160px; gap: var(--sj-space-1); }.credential-alerts > header label span { color: var(--sj-text-3); font-size: 9px; }.credential-alerts > header select { min-height: var(--sj-control-dense); padding: 0 var(--sj-space-3); border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); color: var(--sj-text-1); background: var(--sj-surface-2); font-size: 10px; }.alert-summary { display: flex; min-height: 44px; padding: 0 var(--sj-space-5); align-items: center; gap: var(--sj-space-5); border-bottom: 1px solid var(--sj-border); background: var(--sj-surface-1); }.alert-summary > span, .notice-state { display: inline-flex; align-items: center; gap: var(--sj-space-2); color: var(--sj-text-2); font-size: 9px; }.alert-summary i, .notice-state i { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }.alert-summary .critical { color: var(--sj-red); }.alert-summary .warning { color: var(--sj-amber); }.alert-summary small { margin-left: auto; color: var(--sj-text-3); font: 8px var(--sj-font-data); }.alert-row-critical { box-shadow: inset 2px 0 var(--sj-red); }.alert-row-warning { box-shadow: inset 2px 0 var(--sj-amber); }.notice-state { color: var(--sj-amber); }.notice-state.notified { color: var(--sj-lime); }.table-action { min-height: var(--sj-control-dense); padding: 0 var(--sj-space-3); border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); color: var(--sj-text-1); background: var(--sj-surface-3); font-size: 9px; font-weight: 700; }.table-action:disabled { cursor: default; color: var(--sj-text-disabled); background: var(--sj-surface-2); }.alert-empty { display: grid; min-height: 96px; margin: 0; place-content: center; color: var(--sj-text-3); text-align: center; font-size: 10px; }.other-panel { display: grid; place-items: center; align-content: center; gap: var(--sj-space-3); color: var(--sj-text-3); }.other-panel > svg { width: 28px; }.other-panel strong { color: var(--sj-text-1); }.other-panel p { margin: 0; font-size: 10px; }
@media (max-width: 1199px) { .crew-info-workspace { grid-template-columns: 260px minmax(0, 1fr); }.profile-summary { grid-template-columns: 56px 1fr auto; }.profile-summary dl { display: none; }.basic-grid { grid-template-columns: 1fr; } }
@media (max-width: 899px) { .crew-metrics { overflow-x: auto; grid-template-columns: repeat(5, minmax(150px, 1fr)); }.crew-info-workspace { grid-template-columns: 220px minmax(600px, 1fr); overflow-x: auto; }.crew-directory { position: sticky; left: 0; z-index: 3; }.profile-summary { grid-template-columns: 48px 1fr auto; padding: var(--sj-space-3); }.avatar { width: 44px; height: 44px; }.profile-summary > div > strong { font-size: 16px; } }
</style>

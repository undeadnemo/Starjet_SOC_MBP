<script lang="ts" setup>
import { computed, onBeforeUnmount, ref } from 'vue';

import { createIconifyIcon } from '@vben/icons';
import { ElMessage } from 'element-plus';

defineOptions({ name: 'PaymentApplication' });

const ArrowLeftIcon = createIconifyIcon('lucide:arrow-left');
const CheckIcon = createIconifyIcon('lucide:check');
const FileIcon = createIconifyIcon('lucide:file-text');
const PlusIcon = createIconifyIcon('lucide:plus');
const TrashIcon = createIconifyIcon('lucide:trash-2');
const UploadIcon = createIconifyIcon('lucide:upload-cloud');

interface ConfirmedField {
  id: string;
  label: string;
  required?: boolean;
  value: string;
}

interface OcrItem extends ConfirmedField {
  confidence: number;
  selected: boolean;
}

interface PaymentDetail {
  amount: number;
  attachmentCount: number;
  attributionId: string;
  attributionType: AttributionType;
  date: string;
  item: string;
  reason: string;
}

interface UploadedDocument {
  file: File;
  id: string;
  url: string;
}

type AttributionType = 'company' | 'customer' | 'flight' | 'journey' | 'station' | 'tail';

const step = ref<1 | 2>(1);
const fileInput = ref<HTMLInputElement>();
const uploadedDocuments = ref<UploadedDocument[]>([]);
const activeDocumentId = ref('');
const submitted = ref(false);

const activeDocument = computed(() => uploadedDocuments.value.find((item) => item.id === activeDocumentId.value) || uploadedDocuments.value[0] || null);

const attributionTypes: Array<{ label: string; value: AttributionType }> = [
  { label: '客户', value: 'customer' },
  { label: '公司', value: 'company' },
  { label: '飞机', value: 'tail' },
  { label: '行程', value: 'journey' },
  { label: '航班', value: 'flight' },
  { label: '航班站点', value: 'station' },
];

const attributionOptions: Record<AttributionType, Array<{ label: string; value: string }>> = {
  customer: [
    { label: '星海资本', value: 'customer-xh' },
    { label: '远航科技', value: 'customer-yh' },
    { label: '拓远实业', value: 'customer-ty' },
  ],
  company: [
    { label: '吉星航空', value: 'company-starjet' },
    { label: '星航公务机', value: 'company-xh' },
  ],
  tail: [
    { label: 'B-602M · G650ER', value: 'tail-b602m' },
    { label: 'B-9308 · G450', value: 'tail-b9308' },
    { label: 'B-9811 · G650ER', value: 'tail-b9811' },
  ],
  journey: [
    { label: 'SJ260820 · 北京—东京—新加坡', value: 'journey-sj260820' },
    { label: 'SJ260821 · 上海—广州—上海', value: 'journey-sj260821' },
  ],
  flight: [
    { label: 'SJX603 · ZGGG → ZGSZ', value: 'flight-sjx603' },
    { label: 'SJX608 · ZSPD → ZGGG', value: 'flight-sjx608' },
    { label: 'SJX611 · ZSPD → ZBAA', value: 'flight-sjx611' },
  ],
  station: [
    { label: 'SJX603 · ZGGG 起飞机场', value: 'station-sjx603-zggg' },
    { label: 'SJX603 · ZGSZ 到达机场', value: 'station-sjx603-zgsz' },
    { label: 'SJX608 · ZSPD 起飞机场', value: 'station-sjx608-zspd' },
    { label: 'SJX608 · ZGGG 到达机场', value: 'station-sjx608-zggg' },
  ],
};

const ocrItems = ref<OcrItem[]>([
  { id: 'accountName', label: '账户名称', value: 'BOEING DIGITAL SOLUTIONS, INC.', confidence: 99, selected: true },
  { id: 'bankName', label: '开户银行', value: 'BANK OF AMERICA', confidence: 98, selected: true },
  { id: 'bankAccount', label: '银行账号', value: '123 306 2600', confidence: 97, selected: true },
  { id: 'currency', label: '币种', value: 'USD', confidence: 99, selected: true },
  { id: 'amount', label: '付款金额', value: '37404.00', confidence: 96, selected: true },
  { id: 'contractName', label: '合同名称', value: 'Jeppesen 基础数据库和障碍物数据库年费', confidence: 91, selected: true },
  { id: 'contact', label: '联系人', value: 'Doris FULLER', confidence: 88, selected: false },
  { id: 'phone', label: '联系电话', value: '+1 303-328-4320', confidence: 86, selected: false },
]);

const extraFields = ref<ConfirmedField[]>([]);
const confirmedFields = computed(() => [
  ...ocrItems.value.filter((item) => item.selected),
  ...extraFields.value,
]);

const form = ref({
  title: '吉星航空付款申请 - Jeppesen 数据库年费',
  urgency: '正常',
  applicationNo: 'FK-20260824-001',
  applicant: '张园',
  department: '运行控制部',
  company: '吉星航空',
  handler: '张园',
  applicationDate: '2026-08-24',
  contractName: '',
  contractNo: '',
  contact: '',
  phone: '',
  accountName: '',
  bankName: '',
  currency: 'USD',
  bankAccount: '',
  remarks: '汇款请务必备注合同编号及付款用途。',
});

const details = ref<PaymentDetail[]>([
  { date: '2026-08-24', item: '数据库与航图服务费', attachmentCount: 1, reason: '2026—2027 年度 Jeppesen 基础数据库和障碍物数据库年费', amount: 37404, attributionType: 'company', attributionId: 'company-starjet' },
]);

const totalAmount = computed(() => details.value.reduce((sum, item) => sum + Number(item.amount || 0), 0));

function choosePdf() {
  fileInput.value?.click();
}

function handleFile(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = [...(input.files || [])];
  if (files.length === 0) return;
  const pdfFiles = files.filter((file) => file.type === 'application/pdf');
  if (pdfFiles.length !== files.length) {
    ElMessage.warning('请选择 PDF 文件');
  }
  const existingKeys = new Set(uploadedDocuments.value.map((item) => `${item.file.name}-${item.file.size}`));
  const added = pdfFiles
    .filter((file) => !existingKeys.has(`${file.name}-${file.size}`))
    .map((file) => ({ file, id: `${Date.now()}-${file.name}-${file.size}`, url: URL.createObjectURL(file) }));
  uploadedDocuments.value.push(...added);
  if (!activeDocumentId.value && added[0]) activeDocumentId.value = added[0].id;
  input.value = '';
  if (added.length > 0) ElMessage.success(`已上传 ${added.length} 个 PDF，OCR 识别结果已更新`);
}

function removeDocument(id: string) {
  const index = uploadedDocuments.value.findIndex((item) => item.id === id);
  if (index < 0) return;
  URL.revokeObjectURL(uploadedDocuments.value[index]!.url);
  uploadedDocuments.value.splice(index, 1);
  if (activeDocumentId.value === id) activeDocumentId.value = uploadedDocuments.value[0]?.id || '';
}

function addField() {
  extraFields.value.push({
    id: `extra-${Date.now()}`,
    label: '新增字段',
    value: '',
  });
}

function removeExtraField(id: string) {
  extraFields.value = extraFields.value.filter((item) => item.id !== id);
}

function goToForm() {
  const values = new Map(confirmedFields.value.map((item) => [item.id, item.value]));
  form.value.contractName = values.get('contractName') || form.value.contractName;
  form.value.contact = values.get('contact') || form.value.contact;
  form.value.phone = values.get('phone') || form.value.phone;
  form.value.accountName = values.get('accountName') || form.value.accountName;
  form.value.bankName = values.get('bankName') || form.value.bankName;
  form.value.currency = values.get('currency') || form.value.currency;
  form.value.bankAccount = values.get('bankAccount') || form.value.bankAccount;
  const recognizedAmount = Number(values.get('amount'));
  if (Number.isFinite(recognizedAmount) && details.value[0]) details.value[0].amount = recognizedAmount;
  step.value = 2;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function addDetail() {
  details.value.push({ date: form.value.applicationDate, item: '', attachmentCount: 0, reason: '', amount: 0, attributionType: 'company', attributionId: 'company-starjet' });
}

function resetAttribution(detail: PaymentDetail) {
  detail.attributionId = attributionOptions[detail.attributionType][0]?.value || '';
}

function removeDetail(index: number) {
  if (details.value.length === 1) return;
  details.value.splice(index, 1);
}

function submitApplication() {
  submitted.value = true;
  ElMessage.success('付款申请已提交审批');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

onBeforeUnmount(() => {
  uploadedDocuments.value.forEach((item) => URL.revokeObjectURL(item.url));
});
</script>

<template>
  <main class="payment-page sj-mission-control" data-starjet-theme="mission-control-dark">
    <header class="page-header">
      <div>
        <p class="eyebrow">财务管理 · 付款申请</p>
        <h1>{{ step === 1 ? '创建付款申请' : '填写付款申请单' }}</h1>
      </div>
      <ol class="stepper" aria-label="申请步骤">
        <li :class="{ active: step === 1, done: step === 2 }"><span>{{ step === 2 ? '✓' : '1' }}</span>票据识别</li>
        <li :class="{ active: step === 2 }"><span>2</span>填写申请单</li>
      </ol>
    </header>

    <section v-if="step === 1" class="recognition-workspace">
      <article class="workspace-panel pdf-panel">
        <header class="panel-heading">
          <div><span class="panel-index">01</span><h2>原始票据</h2></div>
          <span class="panel-status">{{ uploadedDocuments.length ? `${uploadedDocuments.length} 个文件` : '等待文件' }}</span>
        </header>
        <div v-if="activeDocument" class="pdf-preview">
          <object :data="activeDocument.url" type="application/pdf"><p>浏览器无法预览此 PDF。</p></object>
        </div>
        <button v-else class="upload-zone" type="button" @click="choosePdf">
          <UploadIcon />
          <strong>上传付款凭证 PDF</strong>
          <span>单个文件，建议 20MB 以内</span>
        </button>
        <input ref="fileInput" accept="application/pdf" class="sr-only" multiple type="file" @change="handleFile" />
        <div v-if="uploadedDocuments.length" class="source-file-list">
          <button v-for="document in uploadedDocuments" :key="document.id" :class="{ active: document.id === activeDocument?.id }" type="button" @click="activeDocumentId = document.id"><FileIcon /><span>{{ document.file.name }}</span><small>{{ (document.file.size / 1024 / 1024).toFixed(1) }} MB</small></button>
        </div>
        <footer class="file-footer">
          <span><FileIcon />{{ uploadedDocuments.length ? `共 ${uploadedDocuments.length} 个识别文件` : '尚未选择文件' }}</span>
          <button class="secondary-button" type="button" @click="choosePdf">继续添加</button>
        </footer>
      </article>

      <article class="workspace-panel ocr-panel">
        <header class="panel-heading">
          <div><span class="panel-index">02</span><h2>OCR 识别结果</h2></div>
          <span class="panel-status ready">{{ ocrItems.filter((item) => item.selected).length }} 项已选</span>
        </header>
        <p class="panel-note">勾选需要写入付款申请单的信息。</p>
        <div class="ocr-list">
          <label v-for="item in ocrItems" :key="item.id" class="ocr-item" :class="{ selected: item.selected }">
            <input v-model="item.selected" type="checkbox" />
            <span class="ocr-copy"><small>{{ item.label }}</small><strong>{{ item.value }}</strong></span>
            <span class="confidence">{{ item.confidence }}%</span>
          </label>
        </div>
      </article>

      <article class="workspace-panel fields-panel">
        <header class="panel-heading">
          <div><span class="panel-index">03</span><h2>确认字段</h2></div>
          <button class="icon-text-button" type="button" @click="addField"><PlusIcon />新增字段</button>
        </header>
        <p class="panel-note">识别值可直接修正，新增字段会同步进入申请单。</p>
        <div class="field-list">
          <div v-for="item in confirmedFields" :key="item.id" class="field-row">
            <input v-model="item.label" aria-label="字段名称" class="field-label-input" />
            <textarea v-model="item.value" :aria-label="`${item.label}的值`" rows="2"></textarea>
            <button v-if="item.id.startsWith('extra-')" aria-label="删除字段" class="danger-icon" type="button" @click="removeExtraField(item.id)"><TrashIcon /></button>
          </div>
          <div v-if="confirmedFields.length === 0" class="empty-fields">请先从 OCR 结果中勾选字段</div>
        </div>
        <footer class="panel-action">
          <span>{{ confirmedFields.length }} 个字段待写入</span>
          <button :disabled="confirmedFields.length === 0" class="primary-button" type="button" @click="goToForm">确认并下一步</button>
        </footer>
      </article>
    </section>

    <section v-else class="form-workspace">
      <div v-if="submitted" class="success-banner"><CheckIcon /><div><strong>付款申请已提交</strong><span>申请编号 {{ form.applicationNo }}，等待部门负责人审批。</span></div></div>
      <div class="form-main">
        <article class="form-card">
          <header class="form-card-heading"><div><span>01</span><h2>基本信息</h2></div><small>申请编号 {{ form.applicationNo }}</small></header>
          <div class="two-column-form">
            <label class="full"><span>标题</span><input v-model="form.title" /></label>
            <label><span>紧急程度</span><select v-model="form.urgency"><option>正常</option><option>紧急</option><option>特急</option></select></label>
            <label><span>申请日期</span><input v-model="form.applicationDate" type="date" /></label>
            <label><span>申请人</span><input v-model="form.applicant" /></label>
            <label><span>申请部门</span><input v-model="form.department" /></label>
            <label><span>所属公司</span><input v-model="form.company" /></label>
            <label><span>经办人</span><input v-model="form.handler" /></label>
            <label class="full"><span>合同名称</span><input v-model="form.contractName" /></label>
            <label><span>合同编号</span><input v-model="form.contractNo" placeholder="选填" /></label>
            <label><span>联系人</span><input v-model="form.contact" /></label>
            <label><span>联系电话</span><input v-model="form.phone" /></label>
          </div>
        </article>

        <article class="form-card">
          <header class="form-card-heading"><div><span>02</span><h2>收款信息</h2></div><small>请与合同及发票核对</small></header>
          <div class="two-column-form">
            <label><span>账户名称</span><input v-model="form.accountName" /></label>
            <label><span>开户银行</span><input v-model="form.bankName" /></label>
            <label><span>币种</span><select v-model="form.currency"><option>CNY</option><option>USD</option><option>EUR</option><option>HKD</option></select></label>
            <label><span>银行账号</span><input v-model="form.bankAccount" /></label>
          </div>
        </article>

        <article class="form-card">
          <header class="form-card-heading"><div><span>03</span><h2>付款明细</h2></div><button class="secondary-button" type="button" @click="addDetail"><PlusIcon />增加明细</button></header>
          <div class="detail-table-wrap">
            <table class="detail-table">
              <thead><tr><th>日期</th><th>事项</th><th>事由</th><th>附件数</th><th>金额</th><th class="attribution-heading">归属类型</th><th class="attribution-heading">归属对象</th><th></th></tr></thead>
              <tbody>
                <tr v-for="(item, index) in details" :key="index">
                  <td><input v-model="item.date" type="date" /></td>
                  <td><input v-model="item.item" /></td>
                  <td><input v-model="item.reason" /></td>
                  <td><input v-model.number="item.attachmentCount" min="0" type="number" /></td>
                  <td><input v-model.number="item.amount" min="0" step="0.01" type="number" /></td>
                  <td>
                    <select v-model="item.attributionType" aria-label="归属类型" @change="resetAttribution(item)">
                      <option v-for="type in attributionTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
                    </select>
                  </td>
                  <td>
                    <select v-model="item.attributionId" aria-label="归属对象">
                      <option v-for="option in attributionOptions[item.attributionType]" :key="option.value" :value="option.value">{{ option.label }}</option>
                    </select>
                  </td>
                  <td><button :disabled="details.length === 1" aria-label="删除明细" class="danger-icon" type="button" @click="removeDetail(index)"><TrashIcon /></button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="total-line"><span>金额合计</span><strong>{{ form.currency }} {{ totalAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}</strong></div>
          <label class="remarks-field"><span>备注</span><textarea v-model="form.remarks" rows="3"></textarea></label>
        </article>

        <article class="form-card">
          <header class="form-card-heading"><div><span>04</span><h2>附件</h2></div><button class="secondary-button" type="button" @click="choosePdf"><PlusIcon />继续添加</button></header>
          <input ref="fileInput" accept="application/pdf" class="sr-only" multiple type="file" @change="handleFile" />
          <div v-if="uploadedDocuments.length" class="attachment-list">
            <div v-for="document in uploadedDocuments" :key="document.id" class="attachment-item">
              <FileIcon />
              <div><strong>{{ document.file.name }}</strong><span>PDF · {{ (document.file.size / 1024 / 1024).toFixed(1) }} MB · 已用于 OCR 识别</span></div>
              <span class="attachment-status"><CheckIcon />已识别</span>
              <button aria-label="删除附件" class="danger-icon" type="button" @click="removeDocument(document.id)"><TrashIcon /></button>
            </div>
          </div>
          <button v-else class="empty-attachment" type="button" @click="choosePdf"><UploadIcon /><span>暂无附件，点击上传 PDF</span></button>
        </article>
      </div>

      <aside class="application-aside">
        <article class="summary-card">
          <p class="eyebrow">提交摘要</p>
          <h2>{{ form.title }}</h2>
          <dl><div><dt>申请人</dt><dd>{{ form.applicant }}</dd></div><div><dt>付款对象</dt><dd>{{ form.accountName }}</dd></div><div><dt>付款金额</dt><dd class="amount">{{ form.currency }} {{ totalAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}</dd></div><div><dt>附件</dt><dd>{{ uploadedDocuments.length }} 个 PDF</dd></div></dl>
        </article>
        <article class="approval-card">
          <p class="eyebrow">审批流程</p>
          <ol><li class="current"><span></span><div><strong>提交申请</strong><small>{{ form.applicant }}</small></div></li><li><span></span><div><strong>部门负责人</strong><small>审批付款事由</small></div></li><li><span></span><div><strong>财务审核</strong><small>核对票据及账户</small></div></li><li><span></span><div><strong>出纳付款</strong><small>完成付款并回填凭证</small></div></li></ol>
        </article>
        <div class="aside-actions"><button class="secondary-button" type="button" @click="step = 1"><ArrowLeftIcon />返回识别</button><button class="primary-button" type="button" @click="submitApplication">提交审批</button></div>
      </aside>
    </section>
  </main>
</template>

<style scoped>
@import '../../../styles/starjet-mission-control-dark.css';

.payment-page { min-height: 100%; padding: var(--sj-space-6); }
.page-header { display: flex; align-items: center; justify-content: space-between; gap: var(--sj-space-6); padding-bottom: var(--sj-space-5); border-bottom: 1px solid var(--sj-border); }
.eyebrow { margin: 0 0 var(--sj-space-2); color: var(--sj-blue); font: 700 12px/1 var(--sj-font-data); letter-spacing: .12em; text-transform: uppercase; }
h1, h2, p { margin-top: 0; }
h1 { margin-bottom: 0; font-size: 26px; }
.stepper { display: flex; align-items: center; gap: var(--sj-space-2); margin: 0; padding: 0; list-style: none; color: var(--sj-text-3); }
.stepper li { display: flex; align-items: center; gap: var(--sj-space-2); font-weight: 700; }
.stepper li + li::before { width: 48px; height: 1px; margin-right: var(--sj-space-2); background: var(--sj-border-strong); content: ''; }
.stepper span { display: grid; width: var(--sj-control-dense); height: var(--sj-control-dense); place-items: center; border: 1px solid var(--sj-border-strong); border-radius: 50%; font-family: var(--sj-font-data); }
.stepper .active { color: var(--sj-text-1); }
.stepper .active span { border-color: var(--sj-blue); background: var(--sj-blue-soft); color: var(--sj-blue); }
.stepper .done span { border-color: var(--sj-lime); background: var(--sj-lime-soft); color: var(--sj-lime); }
.recognition-workspace { display: grid; grid-template-columns: minmax(280px, .9fr) minmax(320px, 1fr) minmax(360px, 1.1fr); gap: var(--sj-space-4); margin-top: var(--sj-space-5); min-height: calc(100vh - 180px); }
.workspace-panel, .form-card, .summary-card, .approval-card { min-width: 0; border: 1px solid var(--sj-border); border-radius: var(--sj-radius-panel); background: var(--sj-surface-1); }
.workspace-panel { display: flex; flex-direction: column; overflow: hidden; }
.panel-heading, .form-card-heading { display: flex; align-items: center; justify-content: space-between; gap: var(--sj-space-3); padding: var(--sj-space-4); border-bottom: 1px solid var(--sj-border); }
.panel-heading > div, .form-card-heading > div { display: flex; align-items: center; gap: var(--sj-space-3); }
.panel-heading h2, .form-card-heading h2 { margin: 0; font-size: 17px; }
.panel-index, .form-card-heading div > span { color: var(--sj-blue); font: 700 12px/1 var(--sj-font-data); }
.panel-status { color: var(--sj-text-3); font: 600 12px/1 var(--sj-font-data); }
.panel-status.ready { color: var(--sj-lime); }
.panel-note { margin: 0; padding: var(--sj-space-3) var(--sj-space-4); color: var(--sj-text-3); font-size: 12px; border-bottom: 1px solid var(--sj-border); }
.upload-zone { display: flex; flex: 1; min-height: 360px; flex-direction: column; align-items: center; justify-content: center; gap: var(--sj-space-3); margin: var(--sj-space-4); border: 1px dashed var(--sj-border-strong); border-radius: var(--sj-radius-control); color: var(--sj-text-2); background: var(--sj-surface-2); cursor: pointer; }
.upload-zone svg { width: var(--sj-space-8); height: var(--sj-space-8); color: var(--sj-blue); }
.upload-zone strong { color: var(--sj-text-1); }
.upload-zone span { font-size: 12px; }
.pdf-preview { flex: 1; min-height: 480px; margin: var(--sj-space-4); overflow: hidden; border: 1px solid var(--sj-border); border-radius: var(--sj-radius-control); background: var(--sj-surface-2); }
.pdf-preview object { width: 100%; height: 100%; }
.source-file-list { max-height: 128px; overflow: auto; padding: 0 var(--sj-space-4) var(--sj-space-3); }
.source-file-list button { display: grid; width: 100%; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: var(--sj-space-2); padding: var(--sj-space-2); border: 1px solid transparent; border-radius: var(--sj-radius-control); color: var(--sj-text-2); background: transparent; text-align: left; cursor: pointer; }
.source-file-list button.active { border-color: var(--sj-blue); background: var(--sj-blue-soft); color: var(--sj-text-1); }
.source-file-list button span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.source-file-list button small { color: var(--sj-text-3); font-family: var(--sj-font-data); }
.file-footer, .panel-action { display: flex; align-items: center; justify-content: space-between; gap: var(--sj-space-3); padding: var(--sj-space-3) var(--sj-space-4); border-top: 1px solid var(--sj-border); }
.file-footer > span { display: flex; min-width: 0; align-items: center; gap: var(--sj-space-2); overflow: hidden; color: var(--sj-text-2); text-overflow: ellipsis; white-space: nowrap; }
.ocr-list, .field-list { min-height: 0; flex: 1; overflow: auto; padding: var(--sj-space-3); }
.ocr-item { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: var(--sj-space-3); padding: var(--sj-space-3); border: 1px solid transparent; border-radius: var(--sj-radius-control); cursor: pointer; }
.ocr-item + .ocr-item { margin-top: var(--sj-space-2); }
.ocr-item.selected { border-color: var(--sj-border-strong); background: var(--sj-blue-soft); }
.ocr-item input { accent-color: var(--sj-blue); }
.ocr-copy { display: flex; min-width: 0; flex-direction: column; gap: var(--sj-space-1); }
.ocr-copy small { color: var(--sj-text-3); }
.ocr-copy strong { overflow: hidden; color: var(--sj-text-1); font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.confidence { color: var(--sj-lime); font: 700 11px/1 var(--sj-font-data); }
.field-row { position: relative; display: grid; grid-template-columns: minmax(90px, .36fr) minmax(0, 1fr); gap: var(--sj-space-2); padding: var(--sj-space-2); border-bottom: 1px solid var(--sj-border); }
.field-row:has(.danger-icon) { padding-right: 44px; }
.field-row .danger-icon { position: absolute; top: var(--sj-space-3); right: var(--sj-space-2); }
.field-label-input { color: var(--sj-blue) !important; font-weight: 700; }
.empty-fields { display: grid; min-height: 240px; place-items: center; color: var(--sj-text-3); }
.panel-action > span { color: var(--sj-text-3); font-size: 12px; }
.form-workspace { display: grid; grid-template-columns: minmax(0, 1fr) minmax(300px, 360px); gap: var(--sj-space-4); margin-top: var(--sj-space-5); }
.success-banner { grid-column: 1 / -1; display: flex; align-items: center; gap: var(--sj-space-3); padding: var(--sj-space-4); border: 1px solid var(--sj-lime); border-radius: var(--sj-radius-panel); background: var(--sj-lime-soft); color: var(--sj-lime); }
.success-banner svg { width: var(--sj-space-6); height: var(--sj-space-6); }
.success-banner div { display: flex; flex-direction: column; gap: var(--sj-space-1); }
.success-banner span { color: var(--sj-text-2); font-size: 12px; }
.form-main { display: flex; min-width: 0; flex-direction: column; gap: var(--sj-space-4); }
.form-card-heading small { color: var(--sj-text-3); }
.two-column-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sj-space-4); padding: var(--sj-space-4); }
.two-column-form label, .remarks-field { display: flex; min-width: 0; flex-direction: column; gap: var(--sj-space-2); color: var(--sj-text-2); font-size: 12px; }
.two-column-form .full { grid-column: 1 / -1; }
input, select, textarea { width: 100%; min-width: 0; border: 1px solid var(--sj-border-strong); border-radius: var(--sj-radius-control); color: var(--sj-text-1); background: var(--sj-surface-2); font: inherit; }
input, select { height: var(--sj-control-default); padding: 0 var(--sj-space-3); }
textarea { resize: vertical; padding: var(--sj-space-3); }
.secondary-button, .primary-button, .icon-text-button, .danger-icon { display: inline-flex; align-items: center; justify-content: center; gap: var(--sj-space-2); border-radius: var(--sj-radius-control); font-weight: 700; cursor: pointer; }
.secondary-button, .icon-text-button { min-height: var(--sj-control-default); padding: 0 var(--sj-space-3); border: 1px solid var(--sj-border-strong); color: var(--sj-text-1); background: var(--sj-surface-2); }
.icon-text-button { color: var(--sj-blue); }
.primary-button { min-height: var(--sj-control-primary); padding: 0 var(--sj-space-5); border: 1px solid var(--sj-lime); color: var(--sj-canvas); background: var(--sj-lime); }
button:disabled { cursor: not-allowed; opacity: .45; }
.danger-icon { width: var(--sj-control-dense); height: var(--sj-control-dense); border: 1px solid var(--sj-border); color: var(--sj-red); background: var(--sj-surface-2); }
.detail-table-wrap { overflow-x: auto; }
.detail-table { width: 100%; min-width: 1260px; border-collapse: collapse; }
.detail-table th { padding: var(--sj-space-3); color: var(--sj-text-3); font-size: 11px; text-align: left; background: var(--sj-surface-2); }
.detail-table td { padding: var(--sj-space-2); border-top: 1px solid var(--sj-border); }
.detail-table th:nth-child(1), .detail-table td:nth-child(1) { width: 150px; }
.detail-table th:nth-child(2), .detail-table td:nth-child(2) { width: 190px; }
.detail-table th:nth-child(4), .detail-table td:nth-child(4) { width: 90px; }
.detail-table th:nth-child(5), .detail-table td:nth-child(5) { width: 150px; }
.detail-table th:nth-child(6), .detail-table td:nth-child(6) { width: 130px; }
.detail-table th:nth-child(7), .detail-table td:nth-child(7) { width: 250px; }
.detail-table th:last-child, .detail-table td:last-child { width: 48px; }
.attribution-heading { color: var(--sj-blue) !important; }
.total-line { display: flex; align-items: baseline; justify-content: flex-end; gap: var(--sj-space-4); padding: var(--sj-space-4); border-top: 1px solid var(--sj-border); }
.total-line span { color: var(--sj-text-3); }
.total-line strong { color: var(--sj-lime); font: 700 20px/1 var(--sj-font-data); }
.remarks-field { padding: 0 var(--sj-space-4) var(--sj-space-4); }
.attachment-list { padding: var(--sj-space-2) var(--sj-space-4) var(--sj-space-4); }
.attachment-item { display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto; align-items: center; gap: var(--sj-space-3); padding: var(--sj-space-3); border-bottom: 1px solid var(--sj-border); }
.attachment-item > svg { width: var(--sj-space-5); height: var(--sj-space-5); color: var(--sj-blue); }
.attachment-item > div { display: flex; min-width: 0; flex-direction: column; gap: var(--sj-space-1); }
.attachment-item strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.attachment-item div span { color: var(--sj-text-3); font-size: 12px; }
.attachment-status { display: inline-flex; align-items: center; gap: var(--sj-space-1); color: var(--sj-lime); font-size: 12px; font-weight: 700; }
.empty-attachment { display: flex; min-height: 112px; align-items: center; justify-content: center; gap: var(--sj-space-2); margin: var(--sj-space-4); border: 1px dashed var(--sj-border-strong); border-radius: var(--sj-radius-control); color: var(--sj-text-3); background: var(--sj-surface-2); cursor: pointer; }
.empty-attachment svg { color: var(--sj-blue); }
.application-aside { display: flex; flex-direction: column; gap: var(--sj-space-4); }
.summary-card, .approval-card { padding: var(--sj-space-4); }
.summary-card h2 { font-size: 18px; line-height: 1.5; }
.summary-card dl { margin: var(--sj-space-5) 0 0; }
.summary-card dl div { display: flex; justify-content: space-between; gap: var(--sj-space-3); padding: var(--sj-space-3) 0; border-top: 1px solid var(--sj-border); }
.summary-card dt { color: var(--sj-text-3); }
.summary-card dd { margin: 0; text-align: right; }
.summary-card .amount { color: var(--sj-lime); font-family: var(--sj-font-data); font-weight: 700; }
.approval-card ol { margin: var(--sj-space-4) 0 0; padding: 0; list-style: none; }
.approval-card li { position: relative; display: grid; grid-template-columns: auto 1fr; gap: var(--sj-space-3); padding-bottom: var(--sj-space-5); }
.approval-card li:not(:last-child)::before { position: absolute; top: var(--sj-space-4); bottom: 0; left: 5px; width: 1px; background: var(--sj-border-strong); content: ''; }
.approval-card li > span { z-index: 1; width: 11px; height: 11px; margin-top: var(--sj-space-1); border: 2px solid var(--sj-text-3); border-radius: 50%; background: var(--sj-surface-1); }
.approval-card li.current > span { border-color: var(--sj-lime); background: var(--sj-lime); }
.approval-card li div { display: flex; flex-direction: column; gap: var(--sj-space-1); }
.approval-card small { color: var(--sj-text-3); }
.aside-actions { position: sticky; bottom: var(--sj-space-4); display: grid; grid-template-columns: 1fr 1fr; gap: var(--sj-space-2); padding: var(--sj-space-3); border: 1px solid var(--sj-border); border-radius: var(--sj-radius-panel); background: var(--sj-surface-1); }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); }

@media (max-width: 1280px) {
  .recognition-workspace { grid-template-columns: minmax(250px, .8fr) minmax(290px, .9fr) minmax(330px, 1fr); }
  .form-workspace { grid-template-columns: minmax(0, 1fr) 300px; }
}
@media (max-width: 1024px) {
  .payment-page { padding: var(--sj-space-4); }
  .page-header { align-items: flex-start; flex-direction: column; }
  .recognition-workspace { grid-template-columns: 1fr; min-height: auto; }
  .workspace-panel { min-height: 520px; }
  .form-workspace { grid-template-columns: 1fr; }
  .application-aside { display: grid; grid-template-columns: 1fr 1fr; }
  .aside-actions { position: static; grid-column: 1 / -1; }
}
@media (max-width: 720px) {
  .stepper li + li::before { width: var(--sj-space-5); }
  .stepper li { font-size: 12px; }
  .two-column-form, .application-aside { grid-template-columns: 1fr; }
  .two-column-form .full, .aside-actions { grid-column: auto; }
}
</style>

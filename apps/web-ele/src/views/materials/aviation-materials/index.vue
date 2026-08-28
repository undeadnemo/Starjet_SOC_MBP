<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';
import { ElButton, ElDrawer, ElInput, ElMessage, ElOption, ElSelect } from 'element-plus';

interface Material { ata: string; available: number; category: string; description: string; id: string; location: string; min: number; reserved: number; serial: string; stock: number }
const query=ref('');const category=ref('all');const drawerVisible=ref(false);const selected=ref<Material>();
const rows=reactive<Material[]>([
  {ata:'32',available:2,category:'周转件',description:'主起落架轮胎组件',id:'MAT-32018',location:'ZBAA / A-03-02',min:2,reserved:1,serial:'PN 217K22-1',stock:3},
  {ata:'24',available:0,category:'航材件',description:'启动发电机',id:'MAT-24007',location:'ZSPD / B-01-06',min:1,reserved:1,serial:'PN 23091-002',stock:1},
  {ata:'28',available:5,category:'消耗件',description:'燃油滤芯',id:'MAT-28031',location:'ZUUU / C-05-01',min:4,reserved:2,serial:'PN 7583478',stock:7},
  {ata:'34',available:1,category:'航材件',description:'大气数据计算机',id:'MAT-34012',location:'ZBAA / A-02-04',min:1,reserved:0,serial:'PN 822-1234-008',stock:1},
]);
const filtered=computed(()=>rows.filter((r)=>(category.value==='all'||r.category===category.value)&&(!query.value||`${r.id}${r.description}${r.serial}${r.location}`.toLowerCase().includes(query.value.toLowerCase()))));
function open(row?:Material){selected.value=row?{...row}:{ata:'',available:0,category:'航材件',description:'',id:`MAT-${Date.now().toString().slice(-5)}`,location:'',min:0,reserved:0,serial:'',stock:0};drawerVisible.value=true}
function save(){const record=selected.value;if(!record)return;const found=rows.findIndex((r)=>r.id===record.id);record.available=Math.max(0,record.stock-record.reserved);if(found>=0&&rows[found])Object.assign(rows[found],record);else rows.push({...record});drawerVisible.value=false;ElMessage.success('航材信息已保存')}
</script>
<template>
<main class="materials-page sj-mission-control" data-starjet-theme="mission-control-dark">
  <header class="page-bar"><div><span>MATERIAL CONTROL</span><h1>航材台账</h1></div><ElButton type="primary" @click="open()">新增航材</ElButton></header>
  <section class="metrics"><div><span>库存种类</span><b>{{ rows.length }}</b></div><div><span>低于安全库存</span><b class="red">{{ rows.filter(r=>r.available<r.min).length }}</b></div><div><span>已预留</span><b class="amber">{{ rows.reduce((s,r)=>s+r.reserved,0) }}</b></div><div><span>可用件数</span><b class="lime">{{ rows.reduce((s,r)=>s+r.available,0) }}</b></div></section>
  <section class="filters"><ElInput v-model="query" clearable placeholder="搜索料号、名称、位置"/><ElSelect v-model="category"><ElOption label="全部分类" value="all"/><ElOption label="航材件" value="航材件"/><ElOption label="周转件" value="周转件"/><ElOption label="消耗件" value="消耗件"/></ElSelect></section>
  <section class="materials-table"><header><span>航材编号</span><span>名称 / 料号</span><span>分类 / ATA</span><span>库位</span><span>库存</span><span>预留</span><span>可用</span><span>状态</span></header><button v-for="row in filtered" :key="row.id" type="button" @click="open(row)"><span class="blue">{{row.id}}</span><span><strong>{{row.description}}</strong><small>{{row.serial}}</small></span><span>{{row.category}} / ATA {{row.ata}}</span><span>{{row.location}}</span><span>{{row.stock}}</span><span>{{row.reserved}}</span><span>{{row.available}}</span><span :class="row.available<row.min?'red':'lime'">● {{row.available<row.min?'需补库':'库存正常'}}</span></button></section>
  <ElDrawer v-model="drawerVisible" append-to-body class="materials-drawer" direction="rtl" size="440px" :with-header="false"><div v-if="selected" class="drawer-content sj-mission-control"><header><div><small>MATERIAL RECORD</small><h2>{{selected.id}}</h2></div><button @click="drawerVisible=false">×</button></header><label>名称<ElInput v-model="selected.description"/></label><label>料号<ElInput v-model="selected.serial"/></label><label>分类<ElSelect v-model="selected.category"><ElOption label="航材件" value="航材件"/><ElOption label="周转件" value="周转件"/><ElOption label="消耗件" value="消耗件"/></ElSelect></label><label>ATA 章节<ElInput v-model="selected.ata"/></label><label>库位<ElInput v-model="selected.location"/></label><div class="numbers"><label>库存<ElInput v-model.number="selected.stock" type="number"/></label><label>预留<ElInput v-model.number="selected.reserved" type="number"/></label><label>安全库存<ElInput v-model.number="selected.min" type="number"/></label></div><ElButton type="primary" @click="save">保存</ElButton></div></ElDrawer>
</main>
</template>
<style scoped>
.materials-page {
  --sj-text: var(--sj-text-1);
  --sj-text-secondary: var(--sj-text-2);
  --sj-text-muted: var(--sj-text-3);
  --sj-surface: var(--sj-surface-1);
  --sj-surface-raised: var(--sj-surface-3);
  --sj-font-mono: var(--sj-font-data);
}
.materials-page{min-height:100%;padding:20px;color:var(--sj-text);background:var(--sj-canvas)}.page-bar,.metrics,.filters,.materials-table{border:1px solid var(--sj-border);background:var(--sj-surface)}.page-bar{display:flex;align-items:center;justify-content:space-between;padding:18px 20px}.page-bar span{color:var(--sj-blue);font:700 10px var(--sj-font-mono);letter-spacing:.16em}.page-bar h1{margin:4px 0 0;font-size:22px}.page-bar :deep(.el-button--primary),.drawer-content :deep(.el-button--primary){border-color:var(--sj-lime);color:#101607;background:var(--sj-lime)}.metrics{display:grid;grid-template-columns:repeat(4,1fr);margin-top:12px}.metrics div{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-right:1px solid var(--sj-border)}.metrics div:last-child{border-right:0}.metrics span{color:var(--sj-text-muted);font-size:12px}.metrics b{font:800 24px var(--sj-font-mono)}.red{color:var(--sj-red)!important}.amber{color:var(--sj-amber)!important}.lime{color:var(--sj-lime)!important}.blue{color:var(--sj-blue)!important}.filters{display:flex;gap:10px;padding:12px;margin-top:12px}.filters :deep(.el-input){max-width:420px}.filters :deep(.el-select){width:180px}.filters :deep(.el-input__wrapper),.filters :deep(.el-select__wrapper){background:var(--sj-surface-raised);box-shadow:0 0 0 1px var(--sj-border) inset}.filters :deep(.el-input__inner),.filters :deep(.el-select__selected-item){color:var(--sj-text)}.materials-table{margin-top:12px;overflow:auto}.materials-table>header,.materials-table>button{display:grid;grid-template-columns:120px minmax(200px,1.3fr) 150px minmax(160px,1fr) 80px 80px 80px 130px;align-items:center;width:100%;min-width:1050px;min-height:48px;padding:0 16px;border:0;border-bottom:1px solid var(--sj-border);color:var(--sj-text-secondary);font:inherit;text-align:left;background:transparent}.materials-table>header{color:var(--sj-text-muted);font-size:11px}.materials-table>button{cursor:pointer}.materials-table>button:hover,.materials-table>button:focus-visible{background:var(--sj-surface-raised)}.materials-table>button:focus-visible{outline:2px solid var(--sj-blue);outline-offset:-2px}.materials-table button span{display:flex;gap:3px;flex-direction:column;min-width:0}.materials-table button span:nth-last-child(-n+4){font-family:var(--sj-font-mono)}.materials-table button span:last-child{white-space:nowrap}.materials-table strong{overflow:hidden;color:var(--sj-text);text-overflow:ellipsis;white-space:nowrap}.materials-table small{overflow:hidden;color:var(--sj-text-muted);text-overflow:ellipsis;white-space:nowrap}
</style>
<style>
.drawer-content {
  --sj-text: var(--sj-text-1);
  --sj-text-muted: var(--sj-text-3);
  --sj-surface-raised: var(--sj-surface-3);
  --sj-font-mono: var(--sj-font-data);
}
.materials-drawer .el-drawer__body{padding:0;background:var(--sj-canvas)}.drawer-content{display:grid;gap:14px;min-height:100%;padding:20px;color:var(--sj-text);background:var(--sj-canvas)}.drawer-content header{display:flex;justify-content:space-between}.drawer-content header small{color:var(--sj-blue);font:700 10px var(--sj-font-mono)}.drawer-content h2{margin:4px 0}.drawer-content header button{border:0;color:var(--sj-text-muted);background:transparent;font-size:28px}.drawer-content label{display:grid;gap:6px;color:var(--sj-text-muted);font-size:12px}.drawer-content .el-input__wrapper,.drawer-content .el-select__wrapper{background:var(--sj-surface-raised);box-shadow:0 0 0 1px var(--sj-border) inset}.drawer-content .el-input__inner,.drawer-content .el-select__selected-item{color:var(--sj-text)}.numbers{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.drawer-content>.el-button{align-self:end}
</style>

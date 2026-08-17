<script lang="ts" setup>
import type { Position } from '#/api';

import { onMounted, reactive, ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';

import {
  ElButton,
  ElCard,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElSwitch,
  ElTable,
  ElTableColumn,
} from 'element-plus';

import { adminApi } from '#/api';
const { hasAccessByCodes } = useAccess();
const rows = ref<Position[]>([]);
const visible = ref(false);
const editingId = ref<number>();
const form = reactive({
  code: '',
  name: '',
  description: '',
  enabled: true,
  version: 0,
});
async function load() {
  const result = await adminApi.getPositions();
  rows.value = result.items;
}
function open(row?: Position) {
  editingId.value = row?.id;
  Object.assign(
    form,
    row ?? { code: '', name: '', description: '', enabled: true, version: 0 },
  );
  visible.value = true;
}
async function save() {
  if (!form.code || !form.name) return ElMessage.warning('请填写编码和名称');
  const data = { ...form };
  editingId.value
    ? await adminApi.updatePosition(editingId.value, data)
    : await adminApi.createPosition(data);
  visible.value = false;
  ElMessage.success('保存成功');
  await load();
}
onMounted(load);
</script>
<template>
  <!-- eslint-disable vue/html-closing-bracket-newline, vue/multiline-html-element-content-newline -->
  <Page
    title="岗位管理"
    description="岗位描述员工在组织中的职责，不直接代替角色权限。"
  >
    <ElCard>
      <template #header>
        <div class="flex justify-end">
          <ElButton
            v-if="hasAccessByCodes(['system:position:write'])"
            type="primary"
            @click="open()"
          >
            新增岗位
          </ElButton>
        </div> </template
      ><ElTable :data="rows">
        <ElTableColumn prop="code" label="岗位编码" /><ElTableColumn
          prop="name"
          label="岗位名称"
        /><ElTableColumn
          prop="description"
          label="说明"
          min-width="240"
        /><ElTableColumn label="状态" width="90">
          <template #default="{ row }">
            {{ row.enabled ? '启用' : '停用' }}
          </template> </ElTableColumn
        ><ElTableColumn label="操作" width="100">
          <template #default="{ row }">
            <ElButton
              v-if="hasAccessByCodes(['system:position:write'])"
              link
              type="primary"
              @click="open(row)"
            >
              编辑
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable> </ElCard
    ><ElDialog
      v-model="visible"
      :title="editingId ? '编辑岗位' : '新增岗位'"
      width="500"
    >
      <ElForm label-width="90">
        <ElFormItem label="岗位编码">
          <ElInput v-model="form.code" /> </ElFormItem
        ><ElFormItem label="岗位名称">
          <ElInput v-model="form.name" /> </ElFormItem
        ><ElFormItem label="说明">
          <ElInput v-model="form.description" type="textarea" /> </ElFormItem
        ><ElFormItem label="启用">
          <ElSwitch v-model="form.enabled" />
        </ElFormItem> </ElForm
      ><template #footer>
        <ElButton @click="visible = false">取消</ElButton
        ><ElButton type="primary" @click="save">保存</ElButton>
      </template>
    </ElDialog>
  </Page>
</template>

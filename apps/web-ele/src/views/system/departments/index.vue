<script lang="ts" setup>
import type { Department } from '#/api';

import { computed, onMounted, reactive, ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';

import {
  ElButton,
  ElCard,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElOption,
  ElSelect,
  ElSwitch,
  ElTable,
  ElTableColumn,
} from 'element-plus';

import { adminApi } from '#/api';

const { hasAccessByCodes } = useAccess();
const loading = ref(false);
const rows = ref<Department[]>([]);
const visible = ref(false);
const editingId = ref<number>();
const form = reactive({
  code: '',
  enabled: true,
  name: '',
  parentId: undefined as number | undefined,
  sortOrder: 0,
  version: 0,
});
const treeRows = computed(() => {
  const map = new Map<number, Department & { children: Department[] }>();
  rows.value.forEach((item) => map.set(item.id, { ...item, children: [] }));
  const roots: Array<Department & { children: Department[] }> = [];
  map.forEach((item) =>
    item.parentId && map.has(item.parentId)
      ? map.get(item.parentId)?.children.push(item)
      : roots.push(item),
  );
  return roots;
});
async function load() {
  loading.value = true;
  try {
    rows.value = await adminApi.getDepartments();
  } finally {
    loading.value = false;
  }
}
function open(row?: Department) {
  editingId.value = row?.id;
  Object.assign(
    form,
    row ?? {
      code: '',
      enabled: true,
      name: '',
      parentId: undefined,
      sortOrder: 0,
      version: 0,
    },
  );
  visible.value = true;
}
async function save() {
  if (!form.code || !form.name)
    return ElMessage.warning('请填写部门编码和名称');
  const data = { ...form };
  editingId.value
    ? await adminApi.updateDepartment(editingId.value, data)
    : await adminApi.createDepartment(data);
  visible.value = false;
  ElMessage.success('保存成功');
  await load();
}
onMounted(load);
</script>

<template>
  <!-- eslint-disable vue/html-closing-bracket-newline, vue/multiline-html-element-content-newline -->
  <Page
    title="部门管理"
    description="维护组织层级；数据权限中的本部门及下级以此组织树计算。"
  >
    <ElCard>
      <template #header>
        <div class="flex items-center justify-between">
          <span>组织架构</span
          ><ElButton
            v-if="hasAccessByCodes(['system:department:write'])"
            type="primary"
            @click="open()"
          >
            新增部门
          </ElButton>
        </div> </template
      ><ElTable
        v-loading="loading"
        :data="treeRows"
        row-key="id"
        default-expand-all
      >
        <ElTableColumn
          prop="name"
          label="部门名称"
          min-width="220"
        /><ElTableColumn prop="code" label="编码" /><ElTableColumn
          prop="sortOrder"
          label="排序"
          width="90"
        /><ElTableColumn label="状态" width="90">
          <template #default="{ row }">
            {{ row.enabled ? '启用' : '停用' }}
          </template> </ElTableColumn
        ><ElTableColumn label="操作" width="100">
          <template #default="{ row }">
            <ElButton
              v-if="hasAccessByCodes(['system:department:write'])"
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
      :title="editingId ? '编辑部门' : '新增部门'"
      width="520"
    >
      <ElForm label-width="90">
        <ElFormItem label="上级部门">
          <ElSelect v-model="form.parentId" clearable class="w-full">
            <ElOption
              v-for="item in rows.filter((i) => i.id !== editingId)"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </ElSelect> </ElFormItem
        ><ElFormItem label="部门编码">
          <ElInput v-model="form.code" maxlength="50" /> </ElFormItem
        ><ElFormItem label="部门名称">
          <ElInput v-model="form.name" maxlength="100" /> </ElFormItem
        ><ElFormItem label="显示排序">
          <ElInputNumber v-model="form.sortOrder" :min="0" /> </ElFormItem
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

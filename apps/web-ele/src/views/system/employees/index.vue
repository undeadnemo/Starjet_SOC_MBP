<script lang="ts" setup>
import type { Department, Employee, Position } from '#/api';

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
  ElOption,
  ElPagination,
  ElSelect,
  ElSwitch,
  ElTable,
  ElTableColumn,
} from 'element-plus';

import { adminApi } from '#/api';
const { hasAccessByCodes } = useAccess();
const rows = ref<Employee[]>([]);
const total = ref(0);
const page = ref(1);
const departments = ref<Department[]>([]);
const positions = ref<Position[]>([]);
const visible = ref(false);
const editingId = ref<number>();
const form = reactive({
  employeeNo: '',
  name: '',
  departmentId: undefined as number | undefined,
  positionId: undefined as number | undefined,
  mobile: '',
  email: '',
  enabled: true,
  version: 0,
});
async function load() {
  const d = await adminApi.getEmployees(page.value);
  rows.value = d.items;
  total.value = d.total;
}
function open(row?: Employee) {
  editingId.value = row?.id;
  Object.assign(
    form,
    row ?? {
      employeeNo: '',
      name: '',
      departmentId: undefined,
      positionId: undefined,
      mobile: '',
      email: '',
      enabled: true,
      version: 0,
    },
  );
  visible.value = true;
}
async function save() {
  if (!form.employeeNo || !form.name || !form.departmentId)
    return ElMessage.warning('请填写工号、姓名和部门');
  const data = { ...form, departmentId: form.departmentId };
  editingId.value
    ? await adminApi.updateEmployee(editingId.value, data)
    : await adminApi.createEmployee(data);
  visible.value = false;
  await load();
}
onMounted(async () => {
  [departments.value, positions.value] = await Promise.all([
    adminApi.getDepartments(),
    adminApi.getPositions().then((v) => v.items),
  ]);
  await load();
});
</script>
<template>
  <!-- eslint-disable vue/html-closing-bracket-newline, vue/multiline-html-element-content-newline -->
  <Page
    title="员工管理"
    description="员工是组织主体，用户账号可关联员工；岗位与角色分别表达职责和系统权限。"
  >
    <ElCard>
      <template #header>
        <div class="flex justify-end">
          <ElButton
            v-if="hasAccessByCodes(['system:employee:write'])"
            type="primary"
            @click="open()"
          >
            新增员工
          </ElButton>
        </div> </template
      ><ElTable :data="rows">
        <ElTableColumn prop="employeeNo" label="工号" /><ElTableColumn
          prop="name"
          label="姓名"
        /><ElTableColumn prop="departmentName" label="部门" /><ElTableColumn
          prop="positionName"
          label="岗位"
        /><ElTableColumn prop="mobile" label="手机号" /><ElTableColumn
          prop="email"
          label="邮箱"
        /><ElTableColumn label="状态" width="90">
          <template #default="{ row }">
            {{ row.enabled ? '在职' : '停用' }}
          </template> </ElTableColumn
        ><ElTableColumn label="操作" width="100">
          <template #default="{ row }">
            <ElButton
              v-if="hasAccessByCodes(['system:employee:write'])"
              link
              type="primary"
              @click="open(row)"
            >
              编辑
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
      <div class="mt-4 flex justify-end">
        <ElPagination
          v-model:current-page="page"
          :total="total"
          :page-size="20"
          @current-change="load"
        />
      </div> </ElCard
    ><ElDialog
      v-model="visible"
      :title="editingId ? '编辑员工' : '新增员工'"
      width="540"
    >
      <ElForm label-width="90">
        <ElFormItem label="工号">
          <ElInput v-model="form.employeeNo" /> </ElFormItem
        ><ElFormItem label="姓名"><ElInput v-model="form.name" /></ElFormItem
        ><ElFormItem label="部门">
          <ElSelect v-model="form.departmentId" class="w-full">
            <ElOption
              v-for="i in departments"
              :key="i.id"
              :value="i.id"
              :label="i.name"
            />
          </ElSelect> </ElFormItem
        ><ElFormItem label="岗位">
          <ElSelect v-model="form.positionId" clearable class="w-full">
            <ElOption
              v-for="i in positions"
              :key="i.id"
              :value="i.id"
              :label="i.name"
            />
          </ElSelect> </ElFormItem
        ><ElFormItem label="手机号">
          <ElInput v-model="form.mobile" /> </ElFormItem
        ><ElFormItem label="邮箱"><ElInput v-model="form.email" /></ElFormItem
        ><ElFormItem label="在职">
          <ElSwitch v-model="form.enabled" />
        </ElFormItem> </ElForm
      ><template #footer>
        <ElButton @click="visible = false">取消</ElButton
        ><ElButton type="primary" @click="save">保存</ElButton>
      </template>
    </ElDialog>
  </Page>
</template>

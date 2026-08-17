<script lang="ts" setup>
import type { Department, Role, UserAccount } from '#/api';

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
  ElTag,
} from 'element-plus';

import { adminApi } from '#/api';
const { hasAccessByCodes } = useAccess();
const rows = ref<UserAccount[]>([]);
const departments = ref<Department[]>([]);
const roles = ref<Role[]>([]);
const total = ref(0);
const page = ref(1);
const keyword = ref('');
const visible = ref(false);
const roleVisible = ref(false);
const editingId = ref<number>();
const selectedUser = ref<UserAccount>();
const selectedRoles = ref<number[]>([]);
const form = reactive({
  username: '',
  password: '',
  displayName: '',
  departmentId: undefined as number | undefined,
  mobile: '',
  email: '',
  enabled: true,
  version: 0,
});
async function load() {
  const data = await adminApi.getUsers({
    keyword: keyword.value,
    page: page.value,
    size: 20,
  });
  rows.value = data.items;
  total.value = data.total;
}
function open(row?: UserAccount) {
  editingId.value = row?.id;
  Object.assign(
    form,
    row
      ? { ...row, password: '' }
      : {
          username: '',
          password: '',
          displayName: '',
          departmentId: undefined,
          mobile: '',
          email: '',
          enabled: true,
          version: 0,
        },
  );
  visible.value = true;
}
async function save() {
  if (!form.username || !form.displayName)
    return ElMessage.warning('请填写用户名和姓名');
  const data = { ...form };
  await (editingId.value
    ? adminApi.updateUser(editingId.value, data)
    : adminApi.createUser(data));
  visible.value = false;
  ElMessage.success('保存成功');
  await load();
}
async function openRoles(row: UserAccount) {
  selectedUser.value = row;
  selectedRoles.value = await adminApi.getUserRoles(row.id);
  roleVisible.value = true;
}
async function saveRoles() {
  if (!selectedUser.value) return;
  await adminApi.assignUserRoles(selectedUser.value.id, selectedRoles.value);
  roleVisible.value = false;
  ElMessage.success('角色已更新，该用户现有会话已失效');
  await load();
}
onMounted(async () => {
  [departments.value, roles.value] = await Promise.all([
    adminApi.getDepartments(),
    adminApi.getRoles(),
  ]);
  await load();
});
</script>
<template>
  <!-- eslint-disable vue/html-closing-bracket-newline, vue/multiline-html-element-content-newline -->
  <Page
    title="用户管理"
    description="用户权限来自角色；查询结果由后端数据权限策略过滤。"
  >
    <ElCard>
      <template #header>
        <div class="flex gap-3">
          <ElInput
            v-model="keyword"
            clearable
            placeholder="用户名或姓名"
            class="max-w-64"
            @keyup.enter="load"
          /><ElButton @click="load">查询</ElButton>
          <div class="flex-1"></div>
          <ElButton
            v-if="hasAccessByCodes(['system:user:create'])"
            type="primary"
            @click="open()"
          >
            新增用户
          </ElButton>
        </div> </template
      ><ElTable :data="rows">
        <ElTableColumn prop="username" label="用户名" /><ElTableColumn
          prop="displayName"
          label="姓名"
        /><ElTableColumn prop="departmentName" label="部门" /><ElTableColumn
          prop="mobile"
          label="手机号"
        /><ElTableColumn label="安全" width="150">
          <template #default="{ row }">
            <ElTag :type="row.mfaEnabled ? 'success' : 'info'">
              {{ row.mfaEnabled ? 'MFA 已启用' : '未启用 MFA' }}
            </ElTag>
          </template> </ElTableColumn
        ><ElTableColumn label="状态" width="90">
          <template #default="{ row }">
            {{ row.enabled ? '启用' : '停用' }}
          </template> </ElTableColumn
        ><ElTableColumn label="操作" width="170">
          <template #default="{ row }">
            <ElButton
              v-if="hasAccessByCodes(['system:user:update'])"
              link
              type="primary"
              @click="open(row)"
            >
              编辑 </ElButton
            ><ElButton
              v-if="hasAccessByCodes(['system:user:assign-role'])"
              link
              type="primary"
              @click="openRoles(row)"
            >
              分配角色
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
      :title="editingId ? '编辑用户' : '新增用户'"
      width="560"
    >
      <ElForm label-width="100">
        <ElFormItem label="用户名">
          <ElInput
            v-model="form.username"
            :disabled="!!editingId"
          /> </ElFormItem
        ><ElFormItem v-if="!editingId" label="初始密码">
          <ElInput
            v-model="form.password"
            type="password"
            show-password
            placeholder="至少12位，含大小写、数字和特殊字符"
          /> </ElFormItem
        ><ElFormItem label="姓名">
          <ElInput v-model="form.displayName" /> </ElFormItem
        ><ElFormItem label="部门">
          <ElSelect v-model="form.departmentId" class="w-full">
            <ElOption
              v-for="item in departments"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </ElSelect> </ElFormItem
        ><ElFormItem label="手机号">
          <ElInput v-model="form.mobile" /> </ElFormItem
        ><ElFormItem label="邮箱"><ElInput v-model="form.email" /></ElFormItem
        ><ElFormItem label="启用">
          <ElSwitch v-model="form.enabled" />
        </ElFormItem> </ElForm
      ><template #footer>
        <ElButton @click="visible = false">取消</ElButton
        ><ElButton type="primary" @click="save">保存</ElButton>
      </template> </ElDialog
    ><ElDialog v-model="roleVisible" title="分配角色" width="480">
      <ElSelect v-model="selectedRoles" multiple class="w-full">
        <ElOption
          v-for="item in roles"
          :key="item.id"
          :label="`${item.name} (${item.code})`"
          :value="item.id"
        /> </ElSelect
      ><template #footer>
        <ElButton @click="roleVisible = false">取消</ElButton
        ><ElButton type="primary" @click="saveRoles">
          保存并使会话失效
        </ElButton>
      </template>
    </ElDialog>
  </Page>
</template>

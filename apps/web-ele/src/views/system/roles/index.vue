<script lang="ts" setup>
import type { Department, Permission, Role } from '#/api';

import { onMounted, reactive, ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';

import {
  ElButton,
  ElCard,
  ElCheckbox,
  ElCheckboxGroup,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElSelect,
  ElSwitch,
  ElTable,
  ElTableColumn,
  ElTag,
  ElTree,
} from 'element-plus';

import { adminApi } from '#/api';
const { hasAccessByCodes } = useAccess();
const rows = ref<Role[]>([]);
const permissions = ref<Permission[]>([]);
const departments = ref<Department[]>([]);
const visible = ref(false);
const grantVisible = ref(false);
const editingId = ref<number>();
const selectedRole = ref<Role>();
const permissionTree = ref<InstanceType<typeof ElTree>>();
const departmentIds = ref<number[]>([]);
const form = reactive({
  code: '',
  name: '',
  description: '',
  dataScope: 'SELF',
  enabled: true,
  version: 0,
});
const scopes = [
  { value: 'ALL', label: '全部数据' },
  { value: 'CUSTOM', label: '指定组织' },
  { value: 'DEPARTMENT_AND_CHILDREN', label: '本部门及下级' },
  { value: 'DEPARTMENT', label: '本部门' },
  { value: 'SELF', label: '仅本人' },
];
async function load() {
  rows.value = await adminApi.getRoles();
}
function open(row?: Role) {
  editingId.value = row?.id;
  Object.assign(
    form,
    row ?? {
      code: '',
      name: '',
      description: '',
      dataScope: 'SELF',
      enabled: true,
      version: 0,
    },
  );
  visible.value = true;
}
async function save() {
  if (!form.code || !form.name) return ElMessage.warning('请填写编码和名称');
  const data = { ...form };
  editingId.value
    ? await adminApi.updateRole(editingId.value, data)
    : await adminApi.createRole(data);
  visible.value = false;
  await load();
}
async function openGrant(row: Role) {
  selectedRole.value = row;
  const data = await adminApi.getRoleGrant(row.id);
  departmentIds.value = data.departmentIds;
  grantVisible.value = true;
  setTimeout(() => permissionTree.value?.setCheckedKeys(data.permissionIds), 0);
}
async function saveGrant() {
  if (!selectedRole.value) return;
  await adminApi.grantRole(selectedRole.value.id, {
    permissionIds: (permissionTree.value?.getCheckedKeys(false) ??
      []) as number[],
    departmentIds: departmentIds.value,
  });
  grantVisible.value = false;
  ElMessage.success('授权已更新，受影响用户会话已失效');
}
onMounted(async () => {
  [permissions.value, departments.value] = await Promise.all([
    adminApi.getPermissions(),
    adminApi.getDepartments(),
  ]);
  await load();
});
</script>
<template>
  <!-- eslint-disable vue/html-closing-bracket-newline, vue/multiline-html-element-content-newline -->
  <Page
    title="角色与数据权限"
    description="配置功能权限和数据范围。后端会对受影响用户增加权限版本并使会话失效。"
  >
    <ElCard>
      <template #header>
        <div class="flex justify-end">
          <ElButton
            v-if="hasAccessByCodes(['system:role:create'])"
            type="primary"
            @click="open()"
          >
            新增角色
          </ElButton>
        </div> </template
      ><ElTable :data="rows">
        <ElTableColumn prop="code" label="角色编码" /><ElTableColumn
          prop="name"
          label="角色名称"
        /><ElTableColumn label="数据范围">
          <template #default="{ row }">
            <ElTag>
              {{ scopes.find((i) => i.value === row.dataScope)?.label }}
            </ElTag>
          </template> </ElTableColumn
        ><ElTableColumn prop="description" label="说明" /><ElTableColumn
          label="操作"
          width="170"
        >
          <template #default="{ row }">
            <ElButton
              v-if="hasAccessByCodes(['system:role:update'])"
              link
              type="primary"
              @click="open(row)"
            >
              编辑 </ElButton
            ><ElButton
              v-if="hasAccessByCodes(['system:role:grant'])"
              link
              type="primary"
              @click="openGrant(row)"
            >
              授权
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable> </ElCard
    ><ElDialog
      v-model="visible"
      :title="editingId ? '编辑角色' : '新增角色'"
      width="520"
    >
      <ElForm label-width="100">
        <ElFormItem label="角色编码">
          <ElInput v-model="form.code" /> </ElFormItem
        ><ElFormItem label="角色名称">
          <ElInput v-model="form.name" /> </ElFormItem
        ><ElFormItem label="数据范围">
          <ElSelect v-model="form.dataScope" class="w-full">
            <ElOption
              v-for="item in scopes"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            />
          </ElSelect> </ElFormItem
        ><ElFormItem label="说明">
          <ElInput v-model="form.description" type="textarea" /> </ElFormItem
        ><ElFormItem label="启用">
          <ElSwitch v-model="form.enabled" />
        </ElFormItem> </ElForm
      ><template #footer>
        <ElButton @click="visible = false">取消</ElButton
        ><ElButton type="primary" @click="save">保存</ElButton>
      </template> </ElDialog
    ><ElDialog v-model="grantVisible" title="角色授权" width="680">
      <div class="grid grid-cols-2 gap-6">
        <div>
          <h4 class="mb-3 font-medium">功能权限</h4>
          <ElTree
            ref="permissionTree"
            :data="permissions"
            node-key="id"
            show-checkbox
            :props="{ label: 'name', children: 'children' }"
            default-expand-all
          />
        </div>
        <div>
          <h4 class="mb-3 font-medium">自定义部门范围</h4>
          <ElCheckboxGroup v-model="departmentIds" class="flex flex-col gap-2">
            <ElCheckbox
              v-for="item in departments"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }}
            </ElCheckbox>
          </ElCheckboxGroup>
        </div>
      </div>
      <template #footer>
        <ElButton @click="grantVisible = false">取消</ElButton
        ><ElButton type="primary" @click="saveGrant"> 保存授权 </ElButton>
      </template>
    </ElDialog>
  </Page>
</template>

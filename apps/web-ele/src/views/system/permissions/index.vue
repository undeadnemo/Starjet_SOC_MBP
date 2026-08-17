<script lang="ts" setup>
import type { Permission } from '#/api';

import { computed, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { ElCard, ElTable, ElTableColumn, ElTag } from 'element-plus';

import { adminApi } from '#/api';
const rows = ref<Permission[]>([]);
const treeRows = computed(() => {
  const map = new Map<number, Permission & { children: Permission[] }>();
  rows.value.forEach((i) => map.set(i.id, { ...i, children: [] }));
  const roots: Array<Permission & { children: Permission[] }> = [];
  map.forEach((i) =>
    i.parentId && map.has(i.parentId)
      ? map.get(i.parentId)?.children.push(i)
      : roots.push(i),
  );
  return roots;
});
onMounted(async () => (rows.value = await adminApi.getPermissions()));
</script>
<template>
  <!-- eslint-disable vue/html-closing-bracket-newline, vue/multiline-html-element-content-newline -->
  <Page
    title="权限资源"
    description="权限码采用“业务域:资源:动作”；前端显示控制不能替代后端授权。"
  >
    <ElCard>
      <ElTable :data="treeRows" row-key="id" default-expand-all>
        <ElTableColumn
          prop="name"
          label="资源名称"
          min-width="180"
        /><ElTableColumn
          prop="code"
          label="权限码"
          min-width="240"
        /><ElTableColumn label="类型" width="100">
          <template #default="{ row }">
            <ElTag>{{ row.resourceType }}</ElTag>
          </template> </ElTableColumn
        ><ElTableColumn prop="routePath" label="路由" /><ElTableColumn
          prop="component"
          label="组件"
          min-width="180"
        />
      </ElTable>
    </ElCard>
  </Page>
</template>

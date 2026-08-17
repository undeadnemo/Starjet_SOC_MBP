<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';

import {
  ElButton,
  ElCard,
  ElMessage,
  ElMessageBox,
  ElTable,
  ElTableColumn,
} from 'element-plus';

import { adminApi } from '#/api';
const { hasAccessByCodes } = useAccess();
const rows = ref<Record<string, any>[]>([]);
async function load() {
  rows.value = await adminApi.getSessions();
}
async function kickout(row: Record<string, any>) {
  await ElMessageBox.confirm(
    `确认强制用户 ${row.username} 下线？`,
    '敏感操作',
    {
      type: 'warning',
    },
  );
  await adminApi.kickout(row.sessionId);
  ElMessage.success('会话已删除');
  await load();
}
onMounted(load);
</script>
<template>
  <!-- eslint-disable vue/html-closing-bracket-newline, vue/multiline-html-element-content-newline -->
  <Page
    title="在线会话"
    description="会话保存在 Redis，两个应用实例共享；强制下线对所有实例立即生效。"
  >
    <ElCard>
      <template #header>
        <div class="flex justify-end">
          <ElButton @click="load">刷新</ElButton>
        </div> </template
      ><ElTable :data="rows">
        <ElTableColumn prop="username" label="用户" /><ElTableColumn
          prop="sessionId"
          label="会话 ID"
          min-width="300"
          show-overflow-tooltip
        /><ElTableColumn
          prop="createdAt"
          label="创建时间"
          min-width="180"
        /><ElTableColumn
          prop="lastAccessedAt"
          label="最后访问"
          min-width="180"
        /><ElTableColumn
          prop="maxInactiveSeconds"
          label="超时（秒）"
        /><ElTableColumn label="操作" width="110">
          <template #default="{ row }">
            <ElButton
              v-if="hasAccessByCodes(['system:session:kickout'])"
              link
              type="danger"
              @click="kickout(row)"
            >
              强制下线
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </Page>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  ElCard,
  ElPagination,
  ElTable,
  ElTableColumn,
  ElTabPane,
  ElTabs,
  ElTag,
} from 'element-plus';

import { adminApi } from '#/api';
const active = ref('login');
const loginRows = ref<Record<string, any>[]>([]);
const changeRows = ref<Record<string, any>[]>([]);
const loginTotal = ref(0);
const changeTotal = ref(0);
const loginPage = ref(1);
const changePage = ref(1);
async function loadLogin() {
  const d = await adminApi.getLoginLogs(loginPage.value);
  loginRows.value = d.items;
  loginTotal.value = d.total;
}
async function loadChanges() {
  const d = await adminApi.getPermissionChanges(changePage.value);
  changeRows.value = d.items;
  changeTotal.value = d.total;
}
onMounted(() => Promise.all([loadLogin(), loadChanges()]));
</script>
<template>
  <!-- eslint-disable vue/html-closing-bracket-newline, vue/multiline-html-element-content-newline -->
  <Page
    title="安全审计"
    description="登录和授权变更使用独立审计记录，包含来源 IP 与 traceId。"
  >
    <ElCard>
      <ElTabs v-model="active">
        <ElTabPane label="登录日志" name="login">
          <ElTable :data="loginRows">
            <ElTableColumn prop="username" label="用户名" /><ElTableColumn
              label="结果"
              width="90"
            >
              <template #default="{ row }">
                <ElTag :type="row.success ? 'success' : 'danger'">
                  {{ row.success ? '成功' : '失败' }}
                </ElTag>
              </template> </ElTableColumn
            ><ElTableColumn
              prop="failureReason"
              label="失败原因"
            /><ElTableColumn prop="sourceIp" label="来源 IP" /><ElTableColumn
              prop="traceId"
              label="Trace ID"
              min-width="230"
            /><ElTableColumn prop="occurredAt" label="时间" min-width="180" />
          </ElTable>
          <div class="mt-4 flex justify-end">
            <ElPagination
              v-model:current-page="loginPage"
              :page-size="20"
              :total="loginTotal"
              @current-change="loadLogin"
            />
          </div> </ElTabPane
        ><ElTabPane label="权限变更" name="changes">
          <ElTable :data="changeRows">
            <ElTableColumn prop="actorUserId" label="操作者" /><ElTableColumn
              prop="targetType"
              label="对象类型"
            /><ElTableColumn prop="targetId" label="对象 ID" /><ElTableColumn
              prop="action"
              label="动作"
            /><ElTableColumn
              prop="changeSummary"
              label="变更摘要"
              min-width="300"
              show-overflow-tooltip
            /><ElTableColumn prop="sourceIp" label="来源 IP" /><ElTableColumn
              prop="traceId"
              label="Trace ID"
              min-width="220"
            /><ElTableColumn prop="occurredAt" label="时间" min-width="180" />
          </ElTable>
          <div class="mt-4 flex justify-end">
            <ElPagination
              v-model:current-page="changePage"
              :page-size="20"
              :total="changeTotal"
              @current-change="loadChanges"
            />
          </div>
        </ElTabPane>
      </ElTabs>
    </ElCard>
  </Page>
</template>

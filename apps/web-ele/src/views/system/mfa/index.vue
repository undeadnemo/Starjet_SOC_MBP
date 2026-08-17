<script lang="ts" setup>
import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  ElAlert,
  ElButton,
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
} from 'element-plus';

import { requestClient } from '#/api/request';
const secret = ref('');
const uri = ref('');
const code = ref('');
async function setup() {
  const data = await requestClient.post<{ otpauthUri: string; secret: string }>(
    '/auth/mfa/setup',
  );
  secret.value = data.secret;
  uri.value = data.otpauthUri;
}
async function enable() {
  await requestClient.post('/auth/mfa/enable', { code: code.value });
  ElMessage.success('MFA 已启用，请重新登录验证');
}
</script>
<template>
  <!-- eslint-disable vue/html-closing-bracket-newline, vue/multiline-html-element-content-newline -->
  <Page title="MFA 管理" description="管理员应启用基于 TOTP 的多因素认证。">
    <ElCard class="max-w-3xl">
      <ElAlert
        title="启用后，登录必须同时提供密码和认证器生成的 6 位验证码。请在受控环境保存恢复信息。"
        type="warning"
        show-icon
        :closable="false"
      />
      <div class="mt-6">
        <ElButton type="primary" @click="setup">生成绑定密钥</ElButton>
      </div>
      <ElForm v-if="secret" class="mt-6" label-width="120">
        <ElFormItem label="Base32 密钥">
          <ElInput :model-value="secret" readonly /> </ElFormItem
        ><ElFormItem label="OTPAuth URI">
          <ElInput :model-value="uri" type="textarea" readonly /> </ElFormItem
        ><ElFormItem label="认证器验证码">
          <ElInput
            v-model="code"
            maxlength="6"
            placeholder="输入认证器当前显示的 6 位验证码"
          /> </ElFormItem
        ><ElFormItem>
          <ElButton type="primary" @click="enable"> 验证并启用 MFA </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
  </Page>
</template>

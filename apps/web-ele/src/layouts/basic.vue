<script lang="ts" setup>
import type { NotificationItem } from '@vben/layouts';
import type { MenuRecordRaw } from '@vben/types';

import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { AuthenticationLoginExpiredModal } from '@vben/common-ui';
import { VBEN_DOC_URL, VBEN_GITHUB_URL } from '@vben/constants';
import { useWatermark } from '@vben/hooks';
import { BookOpenText, CircleHelp, SvgGithubIcon } from '@vben/icons';
import {
  BasicLayout,
  LockScreen,
  Notification,
  UserDropdown,
} from '@vben/layouts';
import { preferences, usePreferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';
import { openWindow } from '@vben/utils';

import { $t } from '#/locales';
import { useAuthStore } from '#/store';
import LoginForm from '#/views/_core/authentication/login.vue';

const notifications = ref<NotificationItem[]>([
  {
    id: 1,
    avatar: 'https://avatar.vercel.sh/vercel.svg?text=VB',
    date: '3小时前',
    isRead: true,
    message: '描述信息描述信息描述信息',
    title: '收到了 14 份新周报',
  },
  {
    id: 2,
    avatar: 'https://avatar.vercel.sh/1',
    date: '刚刚',
    isRead: false,
    message: '描述信息描述信息描述信息',
    title: '朱偏右 回复了你',
  },
  {
    id: 3,
    avatar: 'https://avatar.vercel.sh/1',
    date: '2024-01-01',
    isRead: false,
    message: '描述信息描述信息描述信息',
    title: '曲丽丽 评论了你',
  },
  {
    id: 4,
    avatar: 'https://avatar.vercel.sh/satori',
    date: '1天前',
    isRead: false,
    message: '描述信息描述信息描述信息',
    title: '代办提醒',
  },
  {
    id: 5,
    avatar: 'https://avatar.vercel.sh/satori',
    date: '1天前',
    isRead: false,
    message: '描述信息描述信息描述信息',
    title: '跳转Workspace示例',
    link: '/workspace',
  },
  {
    id: 6,
    avatar: 'https://avatar.vercel.sh/satori',
    date: '1天前',
    isRead: false,
    message: '描述信息描述信息描述信息',
    title: '跳转外部链接示例',
    link: 'https://doc.vben.pro',
  },
]);

const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();
const accessStore = useAccessStore();
const { destroyWatermark, updateWatermark } = useWatermark();
const { isDark } = usePreferences();
const showDot = computed(() =>
  notifications.value.some((item) => !item.isRead),
);
const crewUnassignedCount = ref(5);

function createPreviewMenus(prefix: '/demo' | '/preview'): MenuRecordRaw[] {
  return [
    {
      children: [
        {
          icon: 'lucide:route',
          name: '行程管理',
          path: `${prefix}/trips`,
        },
        {
          icon: 'lucide:calendar-range',
          name: '航班计划',
          path: `${prefix}/flight-plan`,
        },
        {
          icon: 'lucide:badge-check',
          name: '飞行放行',
          path: `${prefix}/flight-release`,
        },
        {
          icon: 'lucide:list-checks',
          name: '保障进程',
          path: `${prefix}/service-progress`,
        },
      ],
      icon: 'lucide:plane',
      name: '航班管理',
      path: `${prefix}/operations`,
    },
    {
      children: [
        {
          badge: String(crewUnassignedCount.value),
          badgeType: 'normal',
          badgeVariants: 'warning',
          icon: 'lucide:users-round',
          name: '机组排班',
          path: `${prefix}/crew-roster`,
        },
        {
          icon: 'lucide:id-card',
          name: '机组信息',
          path: `${prefix}/crew-info`,
        },
      ],
      icon: 'lucide:contact-round',
      name: '机组管理',
      path: `${prefix}/crew`,
    },
    {
      children: [
        {
          disabled: true,
          icon: 'lucide:users',
          name: '用户管理',
          path: `${prefix}/system/users`,
        },
      ],
      icon: 'lucide:settings',
      name: '系统管理',
      path: `${prefix}/system`,
    },
    {
      children: [
        {
          disabled: true,
          icon: 'lucide:database',
          name: '飞机与机场数据',
          path: `${prefix}/master-data/aviation`,
        },
      ],
      icon: 'lucide:database',
      name: '主数据管理',
      path: `${prefix}/master-data`,
    },
    {
      children: [
        {
          disabled: true,
          icon: 'lucide:files',
          name: '文件中心',
          path: `${prefix}/files/center`,
        },
      ],
      icon: 'lucide:paperclip',
      name: '文件管理',
      path: `${prefix}/files`,
    },
  ];
}

function updateCrewRosterBadge(count: number) {
  crewUnassignedCount.value = count;
  const visit = (items: MenuRecordRaw[]) => {
    items.forEach((item) => {
      if (item.path?.endsWith('/crew-roster')) {
        item.badge = String(count);
        item.badgeType = 'normal';
        item.badgeVariants = 'warning';
      }
      if (item.children) visit(item.children);
    });
  };
  visit(accessStore.accessMenus as MenuRecordRaw[]);
}

function handleCrewUnassignedCount(event: Event) {
  const count = Number((event as CustomEvent<number>).detail);
  if (Number.isFinite(count)) updateCrewRosterBadge(count);
}

onMounted(() => window.addEventListener('starjet:crew-unassigned-count', handleCrewUnassignedCount));
onBeforeUnmount(() => window.removeEventListener('starjet:crew-unassigned-count', handleCrewUnassignedCount));

watch(
  () => router.currentRoute.value.path,
  (path) => {
    if (accessStore.accessMenus.length > 0) return;
    const prefix = path.startsWith('/demo/')
      ? '/demo'
      : path.startsWith('/preview/')
        ? '/preview'
        : null;
    if (prefix) accessStore.setAccessMenus(createPreviewMenus(prefix));
  },
  { immediate: true },
);

const menus = computed(() => [
  {
    handler: () => {
      router.push({ name: 'Profile' });
    },
    icon: 'lucide:user',
    text: $t('page.auth.profile'),
  },
  {
    handler: () => {
      openWindow(VBEN_DOC_URL, {
        target: '_blank',
      });
    },
    icon: BookOpenText,
    text: $t('ui.widgets.document'),
  },
  {
    handler: () => {
      openWindow(VBEN_GITHUB_URL, {
        target: '_blank',
      });
    },
    icon: SvgGithubIcon,
    text: 'GitHub',
  },
  {
    handler: () => {
      openWindow(`${VBEN_GITHUB_URL}/issues`, {
        target: '_blank',
      });
    },
    icon: CircleHelp,
    text: $t('ui.widgets.qa'),
  },
]);

const avatar = computed(() => {
  return userStore.userInfo?.avatar ?? preferences.app.defaultAvatar;
});

async function handleLogout() {
  await authStore.logout(false);
}

function handleNoticeClear() {
  notifications.value = [];
}

function markRead(id: number | string) {
  const item = notifications.value.find((item) => item.id === id);
  if (item) {
    item.isRead = true;
  }
}

function remove(id: number | string) {
  notifications.value = notifications.value.filter((item) => item.id !== id);
}

function handleMakeAll() {
  notifications.value.forEach((item) => (item.isRead = true));
}

const viewAll = () => {};

const handleClick = (item: NotificationItem) => {
  // 如果通知项有链接，点击时跳转
  if (item.link) {
    navigateTo(item.link, item.query, item.state);
  }
};

function navigateTo(
  link: string,
  query?: Record<string, any>,
  state?: Record<string, any>,
) {
  if (link.startsWith('http://') || link.startsWith('https://')) {
    // 外部链接，在新标签页打开
    window.open(link, '_blank');
  } else {
    // 内部路由链接，支持 query 参数和 state
    router.push({
      path: link,
      query: query || {},
      state,
    });
  }
}

watch(
  () => ({
    enable: preferences.app.watermark,
    content: preferences.app.watermarkContent,
    isDark: isDark.value,
  }),
  async ({ enable, content, isDark: isDarkValue }) => {
    if (enable) {
      const watermarkColor = isDarkValue
        ? 'rgba(255, 255, 255, 0.12)'
        : 'rgba(0, 0, 0, 0.12)';

      await updateWatermark({
        advancedStyle: {
          colorStops: [
            {
              color: watermarkColor,
              offset: 0,
            },
            {
              color: watermarkColor,
              offset: 1,
            },
          ],
          type: 'linear',
        },
        content:
          content ||
          `${userStore.userInfo?.username} - ${userStore.userInfo?.realName}`,
      });
    } else {
      destroyWatermark();
    }
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <BasicLayout @clear-preferences-and-logout="handleLogout">
    <template #user-dropdown>
      <UserDropdown
        :avatar
        :menus
        :text="userStore.userInfo?.realName"
        description="ann.vben@gmail.com"
        tag-text="Pro"
        @logout="handleLogout"
        @clear-preferences-and-logout="handleLogout"
      />
    </template>
    <template #notification>
      <Notification
        :dot="showDot"
        :notifications="notifications"
        @clear="handleNoticeClear"
        @read="(item) => item.id && markRead(item.id)"
        @remove="(item) => item.id && remove(item.id)"
        @make-all="handleMakeAll"
        @on-click="handleClick"
        @view-all="viewAll"
      />
    </template>
    <template #extra>
      <AuthenticationLoginExpiredModal
        v-model:open="accessStore.loginExpired"
        :avatar
      >
        <LoginForm />
      </AuthenticationLoginExpiredModal>
    </template>
    <template #lock-screen>
      <LockScreen :avatar @to-login="handleLogout" />
    </template>
  </BasicLayout>
</template>

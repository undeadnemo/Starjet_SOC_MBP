import type { RouteRecordRaw } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';

import { $t } from '#/locales';

const BasicLayout = () => import('#/layouts/basic.vue');
const AuthPageLayout = () => import('#/layouts/auth.vue');
const isPublicDemo = import.meta.env.VITE_PUBLIC_DEMO === 'true';
const isDevelopmentPreview = import.meta.env.DEV;

const publicDemoRoutes: RouteRecordRaw[] = isPublicDemo
  ? [
      {
        name: 'OperationsWorkbenchDemo',
        path: '/demo/workbench',
        component: () =>
          import('#/views/operations/workbench/index.vue'),
        meta: {
          hideInBreadcrumb: true,
          hideInMenu: true,
          hideInTab: true,
          ignoreAccess: true,
          title: '工作台 Demo',
        },
      },
      {
        name: 'TripManagementDemo',
        path: '/demo/trips',
        component: () =>
          import('#/views/operations/trip-management/index.vue'),
        meta: {
          hideInBreadcrumb: true,
          hideInMenu: true,
          hideInTab: true,
          ignoreAccess: true,
          title: '行程管理 Demo',
        },
      },
      {
        name: 'TripDetailDemo',
        path: '/demo/trip-detail/:tripId?',
        component: () => import('#/views/operations/trip-detail/index.vue'),
        meta: {
          hideInBreadcrumb: true,
          hideInMenu: true,
          hideInTab: true,
          ignoreAccess: true,
          title: '行程详情 Demo',
        },
      },
      {
        name: 'FlightPlanDemo',
        path: '/demo/flight-plan',
        component: () =>
          import('#/views/operations/flight-plan/content.vue'),
        meta: {
          hideInBreadcrumb: true,
          hideInMenu: true,
          hideInTab: true,
          ignoreAccess: true,
          title: '航班计划 Demo',
        },
      },
      {
        name: 'FlightReleaseDemo',
        path: '/demo/flight-release',
        component: () =>
          import('#/views/operations/flight-release/index.vue'),
        meta: {
          hideInBreadcrumb: true,
          hideInMenu: true,
          hideInTab: true,
          ignoreAccess: true,
          title: '飞行放行 Demo',
        },
      },
      {
        name: 'ServiceProgressDemo',
        path: '/demo/service-progress',
        component: () =>
          import('#/views/operations/service-progress/index.vue'),
        meta: {
          hideInBreadcrumb: true,
          hideInMenu: true,
          hideInTab: true,
          ignoreAccess: true,
          title: '保障进程 Demo',
        },
      },
      {
        name: 'CrewRosterDemo',
        path: '/demo/crew-roster',
        component: () => import('#/views/operations/crew-roster/index.vue'),
        meta: {
          hideInBreadcrumb: true,
          hideInMenu: true,
          hideInTab: true,
          ignoreAccess: true,
          title: '机组排班 Demo',
        },
      },
      {
        name: 'CrewInformationDemo',
        path: '/demo/crew-info',
        component: () =>
          import('#/views/crew-management/crew-info/index.vue'),
        meta: {
          hideInBreadcrumb: true,
          hideInMenu: true,
          hideInTab: true,
          ignoreAccess: true,
          title: '机组信息 Demo',
        },
      },
      {
        name: 'FlightDetailDemo',
        path: '/demo/flight-detail/:flightId?',
        component: () =>
          import('#/views/operations/flight-detail/index.vue'),
        meta: {
          hideInBreadcrumb: true,
          hideInMenu: true,
          hideInTab: true,
          ignoreAccess: true,
          title: '航班详情 Demo',
        },
      },
      {
        name: 'PaymentApplicationDemo',
        path: '/demo/payment-application',
        component: () =>
          import('#/views/finance/payment-application/list.vue'),
        meta: {
          hideInBreadcrumb: true,
          hideInMenu: true,
          hideInTab: true,
          ignoreAccess: true,
          title: '付款申请 Demo',
        },
      },
      {
        name: 'PaymentApplicationCreateDemo',
        path: '/demo/payment-application/create',
        component: () =>
          import('#/views/finance/payment-application/index.vue'),
        meta: {
          hideInBreadcrumb: true,
          hideInMenu: true,
          hideInTab: true,
          ignoreAccess: true,
          title: '付款申请 Demo',
        },
      },
    ]
  : [];

/**
 * 本地开发预览页。
 *
 * 使用 import.meta.env.DEV 确保生产构建不会注册免登录预览路由，
 * 正式环境仍必须通过后端菜单和角色权限访问航班计划。
 */
const developmentPreviewRoutes: RouteRecordRaw[] = isDevelopmentPreview
  ? [
      {
        name: 'OperationsWorkbenchPreview',
        path: '/preview/workbench',
        component: () =>
          import('#/views/operations/workbench/index.vue'),
        meta: {
          hideInBreadcrumb: true,
          hideInMenu: true,
          hideInTab: true,
          ignoreAccess: true,
          title: '工作台预览',
        },
      },
      {
        name: 'TripManagementPreview',
        path: '/preview/trips',
        component: () =>
          import('#/views/operations/trip-management/index.vue'),
        meta: {
          hideInBreadcrumb: true,
          hideInMenu: true,
          hideInTab: true,
          ignoreAccess: true,
          title: '行程管理预览',
        },
      },
      {
        name: 'TripDetailPreview',
        path: '/preview/trip-detail/:tripId?',
        component: () => import('#/views/operations/trip-detail/index.vue'),
        meta: {
          hideInBreadcrumb: true,
          hideInMenu: true,
          hideInTab: true,
          ignoreAccess: true,
          title: '行程详情预览',
        },
      },
      {
        name: 'FlightPlanPreview',
        path: '/preview/flight-plan',
        component: () =>
          import('#/views/operations/flight-plan/content.vue'),
        meta: {
          hideInBreadcrumb: true,
          hideInMenu: true,
          hideInTab: true,
          ignoreAccess: true,
          title: '航班计划预览',
        },
      },
      {
        name: 'FlightReleasePreview',
        path: '/preview/flight-release',
        component: () =>
          import('#/views/operations/flight-release/index.vue'),
        meta: {
          hideInBreadcrumb: true,
          hideInMenu: true,
          hideInTab: true,
          ignoreAccess: true,
          title: '飞行放行预览',
        },
      },
      {
        name: 'ServiceProgressPreview',
        path: '/preview/service-progress',
        component: () =>
          import('#/views/operations/service-progress/index.vue'),
        meta: {
          hideInBreadcrumb: true,
          hideInMenu: true,
          hideInTab: true,
          ignoreAccess: true,
          title: '保障进程预览',
        },
      },
      {
        name: 'CrewRosterPreview',
        path: '/preview/crew-roster',
        component: () => import('#/views/operations/crew-roster/index.vue'),
        meta: {
          hideInBreadcrumb: true,
          hideInMenu: true,
          hideInTab: true,
          ignoreAccess: true,
          title: '机组排班预览',
        },
      },
      {
        name: 'CrewInformationPreview',
        path: '/preview/crew-info',
        component: () =>
          import('#/views/crew-management/crew-info/index.vue'),
        meta: {
          hideInBreadcrumb: true,
          hideInMenu: true,
          hideInTab: true,
          ignoreAccess: true,
          title: '机组信息预览',
        },
      },
      {
        name: 'FlightDetailPreview',
        path: '/preview/flight-detail/:flightId?',
        component: () =>
          import('#/views/operations/flight-detail/index.vue'),
        meta: {
          hideInBreadcrumb: true,
          hideInMenu: true,
          hideInTab: true,
          ignoreAccess: true,
          title: '航班详情预览',
        },
      },
      {
        name: 'PaymentApplicationPreview',
        path: '/preview/payment-application',
        component: () =>
          import('#/views/finance/payment-application/list.vue'),
        meta: {
          hideInBreadcrumb: true,
          hideInMenu: true,
          hideInTab: true,
          ignoreAccess: true,
          title: '付款申请预览',
        },
      },
      {
        name: 'PaymentApplicationCreatePreview',
        path: '/preview/payment-application/create',
        component: () =>
          import('#/views/finance/payment-application/index.vue'),
        meta: {
          hideInBreadcrumb: true,
          hideInMenu: true,
          hideInTab: true,
          ignoreAccess: true,
          title: '付款申请预览',
        },
      },
    ]
  : [];
/** 全局404页面 */
const fallbackNotFoundRoute: RouteRecordRaw = {
  component: () => import('#/views/_core/fallback/not-found.vue'),
  meta: {
    hideInBreadcrumb: true,
    hideInMenu: true,
    hideInTab: true,
    title: '404',
  },
  name: 'FallbackNotFound',
  path: '/:path(.*)*',
};

/** 基本路由，这些路由是必须存在的 */
const coreRoutes: RouteRecordRaw[] = [
  /**
   * 根路由
   * 使用基础布局，作为所有页面的父级容器，子级就不必配置BasicLayout。
   * 此路由必须存在，且不应修改
   */
  {
    component: BasicLayout,
    meta: {
      hideInBreadcrumb: true,
      title: 'Root',
    },
    name: 'Root',
    path: '/',
    redirect: isPublicDemo
      ? '/demo/flight-plan'
      : isDevelopmentPreview
        ? '/preview/flight-plan'
        : preferences.app.defaultHomePath,
    children: [...developmentPreviewRoutes, ...publicDemoRoutes],
  },
  {
    component: AuthPageLayout,
    meta: {
      hideInTab: true,
      title: 'Authentication',
    },
    name: 'Authentication',
    path: '/auth',
    redirect: LOGIN_PATH,
    children: [
      {
        name: 'Login',
        path: 'login',
        component: () => import('#/views/_core/authentication/login.vue'),
        beforeEnter: (to) =>
          isDevelopmentPreview && to.query.auth !== '1'
            ? '/preview/flight-plan'
            : true,
        meta: {
          title: $t('page.auth.login'),
        },
      },
      {
        name: 'CodeLogin',
        path: 'code-login',
        component: () => import('#/views/_core/authentication/code-login.vue'),
        meta: {
          title: $t('page.auth.codeLogin'),
        },
      },
      {
        name: 'QrCodeLogin',
        path: 'qrcode-login',
        component: () =>
          import('#/views/_core/authentication/qrcode-login.vue'),
        meta: {
          title: $t('page.auth.qrcodeLogin'),
        },
      },
      {
        name: 'ForgetPassword',
        path: 'forget-password',
        component: () =>
          import('#/views/_core/authentication/forget-password.vue'),
        meta: {
          title: $t('page.auth.forgetPassword'),
        },
      },
      {
        name: 'Register',
        path: 'register',
        component: () => import('#/views/_core/authentication/register.vue'),
        meta: {
          title: $t('page.auth.register'),
        },
      },
    ],
  },
];

export { coreRoutes, fallbackNotFoundRoute };

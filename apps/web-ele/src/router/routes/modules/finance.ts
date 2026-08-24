import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:landmark',
      order: 3,
      title: '财务管理',
    },
    name: 'FinanceManagement',
    path: '/finance',
    children: [
      {
        component: () =>
          import('#/views/finance/payment-application/list.vue'),
        meta: {
          icon: 'lucide:receipt-text',
          title: '付款申请',
        },
        name: 'PaymentApplicationList',
        path: '/finance/payment-application',
      },
      {
        component: () =>
          import('#/views/finance/payment-application/index.vue'),
        meta: {
          hideInMenu: true,
          title: '创建付款申请',
        },
        name: 'PaymentApplicationCreate',
        path: '/finance/payment-application/create',
      },
    ],
  },
];

export default routes;

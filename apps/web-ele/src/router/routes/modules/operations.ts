import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:plane',
      order: 1,
      title: '航班管理',
    },
    name: 'Operations',
    path: '/operations',
    children: [
      {
        name: 'OperationsWorkbench',
        path: '/operations/workbench',
        component: () =>
          import('#/views/operations/workbench/index.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:gauge',
          title: '工作台',
        },
      },
      {
        name: 'TripManagement',
        path: '/operations/trips',
        component: () =>
          import('#/views/operations/trip-management/index.vue'),
        meta: {
          icon: 'lucide:route',
          title: '行程管理',
        },
      },
      {
        name: 'FlightPlan',
        path: '/operations/flight-plan',
        component: () => import('#/views/operations/flight-plan/index.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:calendar-range',
          title: '航班计划',
        },
      },
      {
        alias: '/crew/crew-roster',
        component: () => import('#/views/operations/crew-roster/index.vue'),
        meta: {
          badge: '5',
          badgeType: 'normal',
          badgeVariants: 'warning',
          icon: 'lucide:users-round',
          title: '机组排班',
        },
        name: 'CrewRoster',
        path: '/operations/crew-roster',
      },
      {
        alias: '/crew/crew-info',
        component: () =>
          import('#/views/crew-management/crew-info/index.vue'),
        meta: {
          icon: 'lucide:id-card',
          title: '机组信息',
        },
        name: 'CrewInformation',
        path: '/operations/crew-info',
      },
      {
        name: 'FlightRelease',
        path: '/operations/flight-release',
        component: () =>
          import('#/views/operations/flight-release/index.vue'),
        meta: {
          icon: 'lucide:badge-check',
          title: '飞行放行',
        },
      },
      {
        name: 'ServiceProgress',
        path: '/operations/service-progress',
        component: () =>
          import('#/views/operations/service-progress/index.vue'),
        meta: {
          icon: 'lucide:list-checks',
          title: '保障进程',
        },
      },
      {
        alias: '/finance/flight-bill-pre-management',
        component: () =>
          import('#/views/finance/flight-bill-pre-management/index.vue'),
        meta: {
          icon: 'lucide:files',
          title: '航班账单预管理',
        },
        name: 'FlightBillPreManagement',
        path: '/operations/flight-bill-pre-management',
      },
      {
        alias: '/finance/overseas-allowance',
        component: () =>
          import('#/views/finance/overseas-allowance-management/index.vue'),
        meta: {
          icon: 'lucide:wallet-cards',
          title: '驻外补贴管理',
        },
        name: 'OverseasAllowanceManagement',
        path: '/operations/overseas-allowance',
      },
      {
        alias: '/finance/overseas-allowance-rules',
        component: () =>
          import('#/views/finance/overseas-allowance-rule/index.vue'),
        meta: {
          icon: 'lucide:settings-2',
          title: '驻外补贴规则',
        },
        name: 'OverseasAllowanceRule',
        path: '/operations/overseas-allowance-rules',
      },
    ],
  },
];

export default routes;

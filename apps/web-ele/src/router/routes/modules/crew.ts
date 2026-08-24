import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:contact-round',
      order: 2,
      title: '机组管理',
    },
    name: 'CrewManagement',
    path: '/crew',
    children: [
      {
        alias: '/operations/crew-roster',
        component: () => import('#/views/operations/crew-roster/index.vue'),
        meta: {
          badge: '5',
          badgeType: 'normal',
          badgeVariants: 'warning',
          icon: 'lucide:users-round',
          title: '机组排班',
        },
        name: 'CrewRoster',
        path: '/crew/crew-roster',
      },
      {
        component: () => import('#/views/crew-management/crew-info/index.vue'),
        meta: {
          icon: 'lucide:id-card',
          title: '机组信息',
        },
        name: 'CrewInformation',
        path: '/crew/crew-info',
      },
    ],
  },
];

export default routes;

import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:contact-round',
      order: 2,
      title: '信息管理',
    },
    name: 'CrewManagement',
    path: '/crew',
    children: [
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

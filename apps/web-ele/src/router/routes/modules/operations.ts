import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:plane',
      order: 1,
      title: '航班计划',
    },
    name: 'Operations',
    path: '/operations',
    children: [
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
    ],
  },
];

export default routes;

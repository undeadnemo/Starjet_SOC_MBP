import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:package-open',
      order: 4,
      title: '航材管理',
    },
    name: 'MaterialsManagement',
    path: '/materials',
    children: [
      {
        component: () => import('#/views/materials/aviation-materials/index.vue'),
        meta: {
          icon: 'lucide:warehouse',
          title: '航材台账',
        },
        name: 'AviationMaterials',
        path: '/materials/aviation-materials',
      },
      {
        component: () => import('#/views/materials/cost-management/index.vue'),
        meta: {
          icon: 'lucide:receipt-text',
          title: '航材成本管理',
        },
        name: 'MaterialCostManagement',
        path: '/materials/cost-management',
      },
    ],
  },
];

export default routes;

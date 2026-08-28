import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

const isStaticDemo = import.meta.env.VITE_STATIC_DEMO_AUTH === 'true';

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  if (isStaticDemo) {
    return {
      avatar: '',
      desc: 'Starjet SOC Demo',
      homePath: '/operations/workbench',
      realName: 'Starjet 运控',
      roles: ['admin'],
      token: 'static-demo-session',
      userId: 'demo-admin',
      username: 'admin',
    } satisfies UserInfo;
  }

  return requestClient.get<UserInfo>('/auth/me');
}

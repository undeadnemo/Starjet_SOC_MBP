import { baseRequestClient, requestClient } from '#/api/request';

const isStaticDemo = import.meta.env.VITE_STATIC_DEMO_AUTH === 'true';
const staticDemoAccount = {
  password: '123456',
  username: 'admin',
};

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    totpCode?: string;
    username?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    authenticated: boolean;
    mfaEnabled: boolean;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  if (isStaticDemo) {
    const authenticated =
      data.username?.trim() === staticDemoAccount.username &&
      data.password === staticDemoAccount.password;

    if (!authenticated) {
      throw new Error('演示账号或密码错误');
    }

    return {
      authenticated,
      mfaEnabled: false,
    };
  }

  await baseRequestClient.get('/auth/csrf', { withCredentials: true });
  return requestClient.post<AuthApi.LoginResult>('/auth/login', data);
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  if (isStaticDemo) {
    return { data: 'static-demo-session', status: 200 };
  }

  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', {
    withCredentials: true,
  });
}

/**
 * 退出登录
 */
export async function logoutApi() {
  if (isStaticDemo) {
    return Promise.resolve();
  }

  return baseRequestClient.post('/auth/logout', {
    withCredentials: true,
  });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  if (isStaticDemo) {
    return ['AC_100010', 'AC_100020', 'AC_100030'];
  }

  return requestClient.get<string[]>('/auth/permission-codes');
}

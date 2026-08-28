import { defineOverridesPreferences } from '@vben/preferences';

const isStaticDemo = import.meta.env.VITE_STATIC_DEMO_AUTH === 'true';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    accessMode: isStaticDemo ? 'frontend' : 'backend',
    defaultHomePath: isStaticDemo ? '/operations/workbench' : '/system/users',
    enableRefreshToken: false,
    name: import.meta.env.VITE_APP_TITLE,
  },
  navigation: {
    accordion: false,
  },
});

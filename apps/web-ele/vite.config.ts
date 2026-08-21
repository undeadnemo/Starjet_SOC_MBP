import { defineConfig } from '@vben/vite-config';

import ElementPlus from 'unplugin-element-plus/vite';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      base:
        process.env.VITE_PUBLIC_DEMO === 'true'
          ? '/Starjet_SOC_MBP/'
          : undefined,
      plugins: [
        ElementPlus({
          format: 'esm',
        }),
      ],
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            target: 'http://127.0.0.1:22001',
            ws: true,
          },
        },
      },
    },
  };
});

import { defineConfig } from 'vite';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import veauryVitePlugins from 'veaury/vite/index.js';
import eslint from 'vite-plugin-eslint';

export default defineConfig({
  plugins: [
    eslint({ cache: false }),
    tsconfigPaths({ loose: true }),
    viteCommonjs(),
    veauryVitePlugins({
      type: 'react',
    }),
  ],
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/.netlify/functions/': {
        target: 'http://localhost:6000/',
        changeOrigin: true,
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import '@weni/unnnic-system/src/assets/scss/unnnic.scss';
        `,
      },
    },
  },
  test: {
    cache: false,
    clearMocks: true,
    globals: true,
    setupFiles: ['./vitest-setup.ts', 'vitest.d.ts'],
    environment: 'jsdom',
    root: 'src',
    coverage: {
      reporter: ['lcov', 'text'],
    },
    outputFile: 'coverage/sonar-report.xml',
  },
});

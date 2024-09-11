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
    cache: true,
    clearMocks: true,
    globals: true,
    threads: false,
    setupFiles: ['./vitest-setup.ts', 'vitest.d.ts'],
    environment: 'jsdom',
    root: 'src',
    coverage: {
      reporter: ['lcov', 'text'],
    },
    outputFile: 'coverage/sonar-report.xml',
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    manifest: true,
    rollupOptions: {
      input: ['./src/main.jsx'],
      output: {
        format: 'iife',
        assetFileNames: assetInfo => {
          const extType = assetInfo.name.split('.').at(1);
          console.log('extType', extType);
          if (/ttf|woff/i.test(extType)) {
            return 'sitestatic/assets/[name]-[hash][extname]';
          }

          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    force: true,
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
});

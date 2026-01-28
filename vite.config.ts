import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    plugins: [
      react(),
      // Generate types in both dev and production
      dts({
        insertTypesEntry: true,
        exclude: ['**/*.test.ts', '**/*.test.tsx', '**/demo/**'],
      }),
    ].filter(Boolean),
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'CouponTemplateBuilder',
        formats: ['es'],
        fileName: 'index',
      },
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: isDev,
      minify: !isDev,
      cssCodeSplit: false,
      rollupOptions: {
        external: [
          'react',
          'react-dom',
          'antd',
          'zustand',
          'axios',
          'lucide-react',
          'react-email-editor',
          'dayjs',
          /^@ant-design/,
          /^@dnd-kit/,
        ],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
      },
      // Fast rebuild in dev mode
      watch: isDev ? {} : null,
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 3001,
      open: true,
    },
  };
});
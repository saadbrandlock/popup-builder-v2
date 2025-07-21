import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development' || process.env.ROLLUP_WATCH;

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'esm',
      sourcemap: isDev,
      exports: 'named',
      banner: isDev ? `/* Built at ${new Date().toISOString()} */` : undefined,
    },
  ],
  onwarn(warning, warn) {
    // Suppress "use client" directive warnings from Ant Design
    if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client')) {
      return;
    }
    warn(warning);
  },
  plugins: [
    peerDepsExternal(),
    resolve({
      browser: true,
      preferBuiltins: false,
      alias: {
        '@': path.resolve(process.cwd(), 'src'),
      },
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      useTsconfigDeclarationDir: true,
      tsconfigOverride: {
        compilerOptions: {
          incremental: true,
          ...(isDev && { tsBuildInfoFile: '.tsbuildinfo' }),
        }
      },
      check: !isDev, // Skip type checking in watch mode for speed
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/demo/**'],
    }),
    postcss({
      extract: 'style.css',
      minimize: !isDev, // Skip minification in dev
      config: {
        path: './postcss.config.js',
      },
    }),
    // Only use terser in production
    ...(!isDev ? [terser()] : []),
    // Only copy files in production
    ...(!isDev ? [copy({
      targets: [
        { src: 'README.md', dest: 'dist' },
        { src: 'package.json', dest: 'dist' },
      ],
    })] : []),
  ],
  external: (id) => {
    return ['react', 'react-dom', 'antd', 'zustand', '@tanstack/react-query', 'dayjs'].includes(id) ||
           id.startsWith('@dnd-kit/') ||
           id.includes('node_modules');
  },
  watch: {
    exclude: ['node_modules/**', 'dist/**'],
    include: ['src/**'],
    clearScreen: false,
    chokidar: {
      usePolling: false, // Disable polling for better performance
      ignored: ['**/node_modules/**', '**/dist/**'],
    },
  },
};
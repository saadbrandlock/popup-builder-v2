import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';
import path from 'path';

// Production build only - dev uses Vite direct source import
export default {
  input: 'src/index.ts',
  output: [
    {
      dir: 'dist',
      format: 'esm',
      sourcemap: true,
      exports: 'named',
      entryFileNames: 'index.js',
      chunkFileNames: 'chunks/[name]-[hash].js',
    },
  ],
  onwarn(warning, warn) {
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
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/demo/**'],
    }),
    postcss({
      config: {
        path: './postcss.config.cjs',
      },
      extensions: ['.css'],
      minimize: true,
      extract: false,
      inject: true,
    }),
    terser(),
    copy({
      targets: [
        { src: 'README.md', dest: 'dist' },
        { src: 'package.json', dest: 'dist' },
      ],
    }),
  ],
  external: (id) => {
    const peerDeps = [
      'react',
      'react-dom',
      'antd',
      'zustand',
      'axios',
      'lucide-react',
      'react-email-editor',
      'dayjs',
    ];
    return (
      peerDeps.some((dep) => id === dep || id.startsWith(dep + '/')) ||
      id.startsWith('@dnd-kit/') ||
      id.includes('node_modules')
    );
  },
};
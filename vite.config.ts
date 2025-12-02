/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { copy } from 'vite-plugin-copy'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    server: {
      port: 4200,
      // Para habilitar HTTPS, descomente e configure os certificados:
      // https: {
      //   key: fs.readFileSync('certificate/localhost-key.pem'),
      //   cert: fs.readFileSync('certificate/localhost.pem')
      // },
      proxy: {
        '/api': {
          target: env.VITE_API || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    build: {
      sourcemap: true
    },
    plugins: [
      react({
        babel: {
          parserOpts: {
            plugins: ['decorators-legacy', 'classProperties'],
          },
        },
      }),
      copy({
        targets: [
          {
            src: 'src/locales/**',
            dest: 'dist/locales',
          },
        ],
        verbose: true,
      }),
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTest.ts',
    },
    base: '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@views': path.resolve(__dirname, './src/views'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@types': path.resolve(__dirname, './src/types'),
        '@theme': path.resolve(__dirname, './src/theme'),
        '@auth': path.resolve(__dirname, './src/auth'),
        '@ioc': path.resolve(__dirname, './src/ioc'),
        '@navigation': path.resolve(__dirname, './src/navigation'),
        '@locales': path.resolve(__dirname, './src/locales'),
        '@domain': path.resolve(__dirname, './src/domain'),
        '@services': path.resolve(__dirname, './src/services'),
      },
    },
  }
})

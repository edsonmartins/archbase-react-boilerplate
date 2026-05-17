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
      sourcemap: mode !== 'production',
      cssMinify: mode === 'production' ? 'esbuild' : false,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          // IMPORTANTE: React + React-DOM + Mantine + Archbase precisam ficar
          // no mesmo chunk para evitar TDZ ("Cannot access 'X' before
          // initialization") em produção. Esse erro aparece quando helpers
          // TypeScript (__extends), contextos React e singletons do Archbase
          // são avaliados em ordem incorreta entre chunks separados.
          //
          // Apenas libs pesadas e auto-contidas (icons, charts, pdf, etc.)
          // saem em chunks dedicados, para melhorar cache.
          //
          // NÃO crie chunks separados como vendor-react / vendor-mantine /
          // vendor-archbase — o bundle quebra em produção (funciona em dev
          // porque o Vite serve módulos não bundleados).
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return undefined

            if (
              id.includes('react-dom') ||
              id.includes('react/') ||
              id.match(/\/react@/) ||
              id.includes('@mantine') ||
              id.includes('@emotion') ||
              id.includes('@archbase')
            ) {
              return 'vendor'
            }

            if (id.includes('@tabler/icons')) return 'icons'
            if (id.includes('echarts') || id.includes('recharts') || id.match(/\/d3-/))
              return 'charts'
            if (id.includes('@pdfme') || id.includes('jspdf') || id.includes('html2canvas'))
              return 'pdf'
            if (id.includes('@fortune-sheet') || id.includes('sheet-happens'))
              return 'spreadsheet'
            if (id.includes('xlsx')) return 'xlsx'
            if (id.includes('dockview')) return 'dockview'

            return undefined
          },
        },
      },
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

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
      rolldownOptions: {
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
          //
          // Vite 8 (Rolldown): a função `manualChunks` virou camada de compatibilidade de um
          // grupo só, e nela o vendor puxava junto as dependências que capturava — o xlsx ia
          // parar dentro do vendor. Com dois grupos e prioridade, o xlsx é capturado antes e
          // continua no seu chunk, como no Vite 6.
          codeSplitting: {
            groups: [
              // Aprendizado após várias iterações de TDZ em produção
              // (vendor-react → dockview → pdf → echarts):
              //
              // QUASE TODA lib do ecossistema React/Mantine/Archbase tem
              // dependências transitivas para React em algum nível, mesmo
              // libs que parecem "puramente JS" como echarts (acaba puxando
              // wrappers via deps transitivas). Splits agressivos quebram em
              // produção com "Cannot access 'X' before initialization".
              //
              // ESTRATÉGIA SEGURA: só faça split de libs que você AUDITOU
              // pessoalmente serem 100% sem dep transitiva de React.
              //
              // Conhecidamente seguras:
              // - xlsx: parser/encoder de planilhas, zero deps React
              //
              // O resto vai pro vendor (~17MB, ~4.7MB gzip). Cache do navegador
              // elimina o custo nas visitas subsequentes.
              {
                name: 'xlsx',
                test: (id: string) => id.includes('node_modules') && id.includes('xlsx'),
                priority: 2,
              },
              { name: 'vendor', test: /node_modules/, priority: 1 },
            ],
          },
        },
      },
    },
    plugins: [
      // plugin-react 6 não aceita mais a opção `babel`. Os decorators passam a ser compilados
      // pelo Oxc a partir do tsconfig (`experimentalDecorators`, saída legada).
      react(),
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
    // O tsconfig tem `emitDecoratorMetadata: true`. O esbuild do Vite 6 ignorava a opção; o Oxc
    // (Vite 8) a respeita e passaria a emitir `design:type`/`design:paramtypes`. Desligamos para
    // manter o comportamento atual de inversify/class-transformer.
    oxc: {
      decorator: { legacy: true, emitDecoratorMetadata: false },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTest.ts',
    },
    base: '/',
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
        '@components': path.resolve(import.meta.dirname, './src/components'),
        '@views': path.resolve(import.meta.dirname, './src/views'),
        '@utils': path.resolve(import.meta.dirname, './src/utils'),
        '@types': path.resolve(import.meta.dirname, './src/types'),
        '@theme': path.resolve(import.meta.dirname, './src/theme'),
        '@auth': path.resolve(import.meta.dirname, './src/auth'),
        '@ioc': path.resolve(import.meta.dirname, './src/ioc'),
        '@navigation': path.resolve(import.meta.dirname, './src/navigation'),
        '@locales': path.resolve(import.meta.dirname, './src/locales'),
        '@domain': path.resolve(import.meta.dirname, './src/domain'),
        '@services': path.resolve(import.meta.dirname, './src/services'),
      },
    },
  }
})

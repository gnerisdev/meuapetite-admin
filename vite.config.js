import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync, statSync } from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Plugin para resolver imports absolutos baseado no jsconfig.json (baseUrl: "src")
const resolveAbsoluteImports = () => {
  return {
    name: 'resolve-absolute-imports',
    resolveId(id, importer) {
      // Se o import não começa com . ou .. ou / ou @, tenta resolver a partir de src/
      if (
        importer &&
        !id.startsWith('.') &&
        !id.startsWith('..') &&
        !id.startsWith('/') &&
        !id.startsWith('@') &&
        !id.startsWith('http') &&
        !path.isAbsolute(id)
      ) {
        const srcPath = path.resolve(__dirname, 'src', id)
        
        // Verifica se o caminho existe
        if (existsSync(srcPath)) {
          const stats = statSync(srcPath)
          
          // Se for um diretório, procura por index.jsx ou index.js dentro
          if (stats.isDirectory()) {
            const indexFiles = ['index.jsx', 'index.js', 'index.ts', 'index.tsx']
            for (const indexFile of indexFiles) {
              const indexPath = path.join(srcPath, indexFile)
              if (existsSync(indexPath)) {
                return indexPath
              }
            }
          } else {
            // Se for um arquivo, retorna diretamente
            return srcPath
          }
        }
        
        // Tenta encontrar o arquivo com extensões comuns para JS/TS
        const extensions = ['.js', '.jsx', '.ts', '.tsx']
        for (const ext of extensions) {
          const fullPath = srcPath + ext
          if (existsSync(fullPath)) {
            return fullPath
          }
        }
      }
      return null
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Inclui arquivos .js para processar JSX
      include: '**/*.{jsx,js}',
    }),
    resolveAbsoluteImports(),
  ],
  resolve: {
    alias: {
      // Suporte para imports absolutos como no jsconfig.json
      '@': path.resolve(__dirname, './src'),
      // Evita conflito com módulo Node.js built-in 'constants'
      'constants': path.resolve(__dirname, './src/constants'),
    },
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  server: {
    port: 8000,
    host: true, // Permite acesso de fora do container
    watch: {
      usePolling: false, // Mais rápido que polling
    },
  },
  build: {
    outDir: 'build',
    sourcemap: false, // Desabilita source maps para build mais rápido
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
  publicDir: 'public',
  // Variáveis de ambiente públicas (precisam começar com VITE_)
  envPrefix: 'VITE_',
})

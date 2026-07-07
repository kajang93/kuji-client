
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), figmaAssetResolver()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    global: 'window',
  },
  build: {
    target: 'esnext',
    outDir: 'build',
    base: './',
    minify: 'esbuild',
    sourcemap: false,
    // 청크 자동 분할 비활성화 및 동적 import 를 정적으로 포함해 모듈 순서 보장
    rollupOptions: {
      output: {
        manualChunks: undefined,
        inlineDynamicImports: true,
        entryFileNames: '[name].js',
      },
    },
  },
  server: {
    port: Number(process.env.PORT) || 5173, // PORT 환경변수 지정 시 해당 포트 사용 (기본 5173)
    host: true, // 로컬 네트워크(192.168.x.x)에서도 접속 가능하도록 설정
    hmr: {
      // 모바일이나 외부 도메인에서 접속 시 웹소켓 연결이 localhost로 시도되는 문제 해결
      protocol: 'ws',
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      }
    }
  },
});
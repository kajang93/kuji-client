import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    host: true, // 로컬 네트워크(192.168.x.x)에서도 접속 가능하도록 설정
    proxy: {
      '/api': { // 만약 Spring Boot의 컨트롤러 주소가 /api 로 시작한다면
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  },
})


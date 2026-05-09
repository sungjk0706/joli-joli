import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // 주식 앱(5173)과 충돌하지 않게 3000번 포트로 고정!
    port: 3000,
    // 스마트폰에서 접속할 수 있게 외부 접속(host) 허용!
    host: true,
    // 만약 3000번도 누가 쓰고 있다면 자동으로 다음 포트를 찾지 않고 에러를 띄워 확인하게 함
    strictPort: true,
  },
});

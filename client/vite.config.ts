import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve('/etc/ssl/nollab.key')),  // Путь к SSL-ключу
      cert: fs.readFileSync(path.resolve('/etc/ssl/nollab.crt')), // Путь к SSL-сертификату
    },
    host: '0.0.0.0',  // Открыть сервер для доступа извне
    proxy: {
      '/api': {
        target: 'https://localhost:8000',  // HTTPS используется для FastAPI
        changeOrigin: true,
        secure: true,  // Проверка сертификата FastAPI
      },
    },
  },
});

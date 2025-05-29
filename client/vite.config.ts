import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
    '/graphql': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    '/api/security-questions': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false,
      },
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { join } from 'path';

export default defineConfig({
  root: 'src/renderer',
  base: './',
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true
  },
  plugins: [react()],
  resolve: {
    alias: { '@': join(__dirname, 'src/renderer') }
  },
  optimizeDeps: { exclude: ['electron'] }
});
import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

// Copy service worker to the root of the build directory
const copyServiceWorker = () => {
  return {
    name: 'copy-service-worker',
    writeBundle() {
      const srcPath = resolve(__dirname, 'src', 'sw.js');
      const destPath = resolve(__dirname, 'dist', 'sw.js');

      if (fs.existsSync(srcPath)) {
        const swContent = fs.readFileSync(srcPath, 'utf-8');
        fs.writeFileSync(destPath, swContent);
        console.log('Service worker copied to dist directory');
      } else {
        console.error('Service worker file not found at', srcPath);
      }
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'src', 'public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    copyServiceWorker()
  ],
});

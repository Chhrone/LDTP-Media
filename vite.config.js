import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';

// Copy manifest.json to the root of the build directory
const copyManifest = () => {
  return {
    name: 'copy-manifest',
    writeBundle() {
      const srcPath = resolve(__dirname, 'src', 'manifest.json');
      const destPath = resolve(__dirname, 'dist', 'manifest.json');

      if (fs.existsSync(srcPath)) {
        const manifestContent = fs.readFileSync(srcPath, 'utf-8');
        fs.writeFileSync(destPath, manifestContent);
        console.log('Manifest copied to dist directory');
      } else {
        console.error('Manifest file not found at', srcPath);
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
    VitePWA({
      strategies: 'injectManifest',
      srcDir: '',
      filename: 'sw-workbox.js',
      injectRegister: 'auto',
      registerType: 'autoUpdate',
      injectManifest: {
        injectionPoint: self.__WB_MANIFEST,
        globDirectory: 'dist',
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp}'
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp}'],
        cleanupOutdatedCaches: true,
      },
    }),
    copyManifest()
  ],
});

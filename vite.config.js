import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['tbs-clock-icon.png'],
      manifest: {
        name: 'TBS Time Clock',
        short_name: 'TBS Clock',
        description: 'Employee Time Clock - Traffic & Barrier Solutions',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/time-clock',
        scope: '/time-clock',
        icons: [
          { src: 'tbs-clock-icon.png', sizes: '192x192', type: 'image/png' },
          { src: 'tbs-clock-icon.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /\/timeclock\/employees/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'employee-list', expiration: { maxEntries: 1, maxAgeSeconds: 86400 } }
          },
          {
            urlPattern: /\/timeclock\/status/,
            handler: 'NetworkFirst',
            options: { cacheName: 'clock-status', networkTimeoutSeconds: 3 }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@flaggers': path.resolve(__dirname, './src/assets/tcp'),
    },
  },
});

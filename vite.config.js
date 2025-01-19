import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
const pkg = require('./package.json');


export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Use prompt strategy so user controls when to update
      registerType: 'prompt',
      
      // Minimal service worker - only what's needed for install prompt
      injectRegister: 'auto',
      
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      
      manifest: {
        name: pkg.title,
        short_name: pkg.title,
        description: 'Track your daily habits and build consistency',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/#/',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      
      workbox: {
        // Very minimal caching - only cache on navigation (network-first strategy)
        // This means SW won't aggressively cache everything
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        
        // Skip waiting means new SW takes over immediately
        skipWaiting: true,
        clientsClaim: true,
        
        // Network first for everything - only use cache as fallback
        navigateFallback: undefined,
        
        // Minimal runtime caching - mostly just to satisfy PWA requirements
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'documents',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week only
              }
            }
          }
        ]
      },
      
      devOptions: {
        enabled: true,
        type: 'module',
        // Force refresh on dev to avoid caching issues
        navigateFallback: 'index.html'
      }
    })
  ],
  define: {
  'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
  'import.meta.env.VITE_APP_TITLE': JSON.stringify(pkg.title),
  'import.meta.env.VITE_APP_SLUG': JSON.stringify(pkg.name)
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // Allow access from network
    port: 5050,
  },
});

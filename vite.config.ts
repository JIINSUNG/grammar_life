/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'favicon-32x32.png', 'apple-touch-icon.png'],
      manifest: {
        name: '내 생활 문법',
        short_name: '내 생활 문법',
        description: '내 하루로 만든 예문으로 영어·일본어 문법을 익히는 학습 웹앱',
        lang: 'ko',
        start_url: '/',
        display: 'standalone',
        background_color: '#EEF1F6',
        theme_color: '#2F45C8',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: '순간 메모',
            short_name: '순간 메모',
            description: '갑자기 하고 싶었던 말을 한국어로 바로 적어두기',
            url: '/?quick=1',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
          },
        ],
      },
      workbox: {
        // 데이터(JSON)까지 포함해 전부 선캐싱 — 오프라인에서도 설문·학습·실전 전부 그대로 동작해야 함
        globPatterns: ['**/*.{js,css,html,svg,png,json}'],
      },
    }),
  ],
  test: {
    environment: 'node',
    exclude: ['node_modules/**', 'e2e/**'],
  },
})

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
// Base path: '/saman-track/' for GitHub Pages project site, '/' for local dev.
var base = process.env.DEPLOY_TARGET === 'gh-pages' ? '/saman-track/' : '/';
export default defineConfig({
    base: base,
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
            manifest: {
                name: 'saman-track',
                short_name: 'saman-track',
                description: 'Track parking fines vs. savings and when enforcement happens.',
                theme_color: '#0f766e',
                background_color: '#0b1220',
                display: 'standalone',
                orientation: 'portrait',
                icons: [
                    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
                    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
                navigateFallbackDenylist: [/^https:\/\/(www\.)?googleapis\.com/],
            },
        }),
    ],
});

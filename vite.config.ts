/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Adds the cookieless Cloudflare Web Analytics beacon only when CF_ANALYTICS_TOKEN is set. */
function cloudflareAnalytics(token: string | undefined): Plugin {
  return {
    name: 'cloudflare-web-analytics',
    transformIndexHtml(html) {
      if (!token) return html
      const tag = `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${JSON.stringify({ token })}'></script>`
      return html.replace('</body>', `    ${tag}\n  </body>`)
    },
  }
}

// Served at https://kfarrag.com/lvlup/ — every asset must resolve under this base.
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env }
  return {
    base: '/lvlup/',
    // SUBMIT_WEBHOOK_URL is read by the app; CF_ANALYTICS_TOKEN only by the plugin above.
    envPrefix: ['VITE_', 'SUBMIT_'],
    plugins: [react(), tailwindcss(), cloudflareAnalytics(env.CF_ANALYTICS_TOKEN?.trim())],
    build: {
      outDir: 'dist/lvlup',
      emptyOutDir: true,
    },
    test: {
      include: ['src/**/*.test.ts'],
    },
  }
})

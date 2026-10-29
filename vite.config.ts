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

/**
 * Inline head script: applies the saved/URL language's dir before React mounts and
 * preloads only that language's fonts. Prevents a left-to-right flash and layout shift.
 */
function earlyLanguage(base: string): Plugin {
  return {
    name: 'early-language',
    transformIndexHtml(html, ctx) {
      const files = Object.keys(ctx.bundle ?? {})
      const pick = (re: RegExp) => files.filter((f) => re.test(f)).map((f) => base + f)
      const inter = pick(/inter-latin-wght-normal-[^/]*\.woff2$/)
      const fonts = {
        en: inter,
        ar: [...pick(/ibm-plex-sans-arabic-arabic-(400|600)-normal-[^/]*\.woff2$/), ...inter],
      }
      const script = `(function(){var f=${JSON.stringify(fonts)},l=new URLSearchParams(location.search).get('lang');if(l!=='ar'&&l!=='en'){try{l=JSON.parse(localStorage.getItem('fundmatch:lang'))}catch(e){}}if(l==='ar'){document.documentElement.lang='ar';document.documentElement.dir='rtl'}(l==='ar'?f.ar:f.en).forEach(function(h){var k=document.createElement('link');k.rel='preload';k.as='font';k.type='font/woff2';k.crossOrigin='';k.href=h;document.head.appendChild(k)})})()`
      return html.replace('</title>', `</title>\n    <script>${script}</script>`)
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
    plugins: [react(), tailwindcss(), earlyLanguage('/lvlup/'), cloudflareAnalytics(env.CF_ANALYTICS_TOKEN?.trim())],
    build: {
      outDir: 'dist/lvlup',
      emptyOutDir: true,
    },
    test: {
      include: ['src/**/*.test.ts', 'worker/**/*.test.ts'],
    },
  }
})

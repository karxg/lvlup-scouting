/**
 * Regenerates public/og.png (1200×630) and the PNG favicons from HTML templates.
 * Run with `npm run images` (needs Playwright + Chromium installed locally).
 */
const { chromium } = require('playwright')
const path = require('node:path')
const fs = require('node:fs')

const root = path.resolve(__dirname, '..')
// Inline as data URLs: pages created with setContent can't load file:// fonts.
const font = (rel) =>
  'data:font/woff2;base64,' + fs.readFileSync(path.join(root, 'node_modules', rel)).toString('base64')
const serifUrl = font('@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2')
const sansUrl = font('@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2')
const naskhUrl = font('@fontsource/noto-naskh-arabic/files/noto-naskh-arabic-arabic-600-normal.woff2')
const mark = fs.readFileSync(path.join(root, 'public/favicon.svg'), 'utf8')

// Colours mirror src/tokens.css (paper, ink, ink-2, ink-3, rule, accent).
const og = `<!doctype html><html><head><style>
@font-face{font-family:NR;src:url(${serifUrl}) format('woff2');font-weight:200 800}
@font-face{font-family:Sans;src:url(${sansUrl}) format('woff2');font-weight:400}
@font-face{font-family:Naskh;src:url(${naskhUrl}) format('woff2');font-weight:600}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;font-family:Sans,sans-serif;color:oklch(22% 0.012 60);background:oklch(97.6% 0.008 85);padding:64px 80px;display:flex;flex-direction:column}
.top{display:flex;align-items:baseline;gap:18px;border-bottom:2px solid oklch(22% 0.012 60);padding-bottom:18px}
.name{font-family:NR;font-size:38px;font-weight:600;letter-spacing:-.01em}.tag{font-size:22px;color:oklch(49% 0.012 60)}
h1{margin-top:auto;font-family:NR;font-size:76px;line-height:1.02;font-weight:500;letter-spacing:-.025em;max-width:960px}
h1 span{color:oklch(47% 0.15 28)}
.ar{font-family:Naskh,NR;font-weight:600;font-size:34px;color:oklch(40% 0.012 60);margin-top:18px}
.foot{margin-top:40px;padding-top:18px;border-top:1px solid oklch(86.5% 0.012 75);display:flex;justify-content:space-between;font-size:22px;color:oklch(40% 0.012 60)}
</style></head><body>
<div class="top"><span class="name">Fund Match</span><span class="tag">for LvlUp Ventures programs</span></div>
<h1>Find the LvlUp Ventures program that <span>fits you</span>.</h1>
<p class="ar" dir="rtl" style="text-align:left">اكتشف برنامج LvlUp Ventures الأنسب لك</p>
<div class="foot"><span>Independent guide. Not an official LvlUp Ventures tool.</span><span>kfarrag.com/lvlup</span></div>
</body></html>`

const icon = (size) =>
  `<!doctype html><html><head><style>*{margin:0}body{width:${size}px;height:${size}px;background:transparent}svg{width:${size}px;height:${size}px;display:block}</style></head><body>${mark}</body></html>`

;(async () => {
  const browser = await chromium.launch()
  const shot = async (html, w, h, out, omitBackground = false) => {
    const page = await browser.newPage({ viewport: { width: w, height: h } })
    await page.setContent(html, { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: path.join(root, 'public', out), omitBackground })
    await page.close()
  }
  await shot(og, 1200, 630, 'og.png')
  await shot(icon(32), 32, 32, 'favicon-32.png', true)
  await shot(icon(180), 180, 180, 'apple-touch-icon.png')
  await browser.close()
  console.log('Wrote public/og.png, favicon-32.png, apple-touch-icon.png')
})()

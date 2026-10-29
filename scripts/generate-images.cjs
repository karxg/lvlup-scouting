/**
 * Regenerates public/og.png (1200×630) and the PNG favicons from HTML templates.
 * Run with `npm run images` (needs Playwright + Chromium installed locally).
 */
const { chromium } = require('playwright')
const path = require('node:path')
const fs = require('node:fs')

const root = path.resolve(__dirname, '..')
const font = (rel) => 'file://' + path.join(root, 'node_modules', rel)
const interUrl = font('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')
const arabicUrl = font('@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-500-normal.woff2')
const mark = fs.readFileSync(path.join(root, 'public/favicon.svg'), 'utf8')

const og = `<!doctype html><html><head><style>
@font-face{font-family:Inter;src:url(${interUrl}) format('woff2');font-weight:100 900}
@font-face{font-family:Plex;src:url(${arabicUrl}) format('woff2');font-weight:500}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;font-family:Inter,sans-serif;color:#fff;padding:72px 80px;display:flex;flex-direction:column;
background:radial-gradient(700px 480px at 92% -8%,rgba(192,132,252,.32),transparent 62%),radial-gradient(600px 400px at -8% 115%,rgba(192,132,252,.16),transparent 60%),#0B0B0F}
.brand{display:flex;align-items:center;gap:18px}.brand svg{width:60px;height:60px}
.name{font-size:34px;font-weight:650;letter-spacing:-.02em}.tag{font-size:22px;color:#A1A1AA;margin-top:2px}
h1{margin-top:auto;font-size:68px;line-height:1.04;font-weight:650;letter-spacing:-.035em;max-width:900px}
h1 em{font-style:normal;color:#C084FC}
.ar{font-family:Plex,Inter;direction:rtl;text-align:left;font-size:30px;color:#D4D4D8;margin-top:18px}
.foot{margin-top:38px;padding-top:24px;border-top:1px solid #26262F;display:flex;justify-content:space-between;font-size:22px;color:#A1A1AA}
</style></head><body>
<div class="brand">${mark}<div><div class="name">Fund Match</div><div class="tag">for LvlUp Ventures programs</div></div></div>
<h1>Find the LvlUp Ventures program that <em>fits you</em>.</h1>
<p class="ar" dir="rtl">اكتشف برنامج LvlUp Ventures الأنسب لك</p>
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

import { describe, expect, it } from 'vitest'
import { handle, type Env } from './handler'

const FILES: Record<string, string> = {
  '/lvlup/': '<!doctype html><title>Fund Match</title>',
  '/lvlup/assets/index-AbC123.js': 'console.log(1)',
  '/lvlup/og.png': 'png',
}

const env: Env = {
  ASSETS: {
    async fetch(req: Request) {
      const path = new URL(req.url).pathname
      const body = FILES[path]
      if (body === undefined) return new Response('not found', { status: 404 })
      const type = path.endsWith('/') ? 'text/html; charset=utf-8' : path.endsWith('.js') ? 'text/javascript' : 'image/png'
      return new Response(body, { headers: { 'Content-Type': type } })
    },
  },
}

const passThrough = async () => new Response('main site', { status: 200, headers: { 'X-From': 'origin' } })
const get = (path: string) => handle(new Request(`https://kfarrag.com${path}`), env, passThrough)

describe('worker', () => {
  it('serves the app at /lvlup/', async () => {
    const res = await get('/lvlup/')
    expect(res.status).toBe(200)
    expect(await res.text()).toContain('Fund Match')
    expect(res.headers.get('Cache-Control')).toBe('no-cache')
  })

  it('redirects /lvlup to /lvlup/, keeping the query', async () => {
    const res = await get('/lvlup?lang=ar')
    expect(res.status).toBe(301)
    expect(res.headers.get('Location')).toBe('https://kfarrag.com/lvlup/?lang=ar')
  })

  it.each([
    ['/LvlUp', '/lvlup/'],
    ['/LVLUP/', '/lvlup/'],
    ['/lvlUP/Funds', '/lvlup/funds'],
    ['/LVLUP/funds?lang=en&a=1', '/lvlup/funds?lang=en&a=1'],
  ])('redirects %s to lowercase %s', async (from, to) => {
    const res = await get(from)
    expect(res.status).toBe(301)
    expect(res.headers.get('Location')).toBe(`https://kfarrag.com${to}`)
  })

  it('serves deep links through the SPA fallback', async () => {
    for (const path of ['/lvlup/funds', '/lvlup/?lang=ar&a=1.01.3.1.3.1.2.4', '/lvlup/funds?lang=ar']) {
      const res = await get(path)
      expect(res.status).toBe(200)
      expect(await res.text()).toContain('Fund Match')
    }
  })

  it('serves hashed assets with long-lived caching and keeps their casing', async () => {
    const res = await get('/lvlup/assets/index-AbC123.js')
    expect(res.status).toBe(200)
    expect(res.headers.get('Cache-Control')).toContain('immutable')
  })

  it('returns a real 404 for missing files', async () => {
    expect((await get('/lvlup/assets/missing.js')).status).toBe(404)
  })

  it('passes paths that only start with "lvlup" back to the main site', async () => {
    const res = await get('/lvlupdates')
    expect(res.headers.get('X-From')).toBe('origin')
  })

  it('adds security headers', async () => {
    const res = await get('/lvlup/')
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff')
  })
})

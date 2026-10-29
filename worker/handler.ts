/**
 * Serves Fund Match at kfarrag.com/lvlup/ from Workers static assets.
 * The Worker is bound only to /lvlup* routes (every casing), so the rest of
 * kfarrag.com never reaches it.
 */

export interface AssetsBinding {
  fetch(request: Request): Promise<Response>
}

export interface Env {
  ASSETS: AssetsBinding
}

export const PREFIX = '/lvlup'

/** App routes handled client-side; anything else under /lvlup/ is a file or a 404. */
const APP_ROUTES = new Set(['/', '/funds', '/funds/'])

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'X-Frame-Options': 'DENY',
}

export async function handle(request: Request, env: Env, passThrough: (r: Request) => Promise<Response>): Promise<Response> {
  const url = new URL(request.url)
  const head = url.pathname.slice(0, PREFIX.length)
  const rest = url.pathname.slice(PREFIX.length)

  // e.g. /lvlupdates or /LvLuPx: not this app. Hand it back to the main site untouched.
  if (head.toLowerCase() !== PREFIX || (rest !== '' && !rest.startsWith('/'))) {
    return passThrough(request)
  }

  // Normalise casing (/LvlUp/Funds → /lvlup/funds) and add the trailing slash (/lvlup → /lvlup/).
  // Only app routes are lowercased; asset file names are case-sensitive hashes.
  const lowerRest = rest.toLowerCase()
  const canonicalRest = rest === '' ? '/' : APP_ROUTES.has(lowerRest) ? lowerRest : rest
  if (head !== PREFIX || canonicalRest !== rest) {
    const target = new URL(url)
    target.pathname = PREFIX + canonicalRest
    return Response.redirect(target.toString(), 301)
  }

  let response = await env.ASSETS.fetch(request)

  // SPA fallback: deep links like /lvlup/funds load the app shell.
  const looksLikeFile = /\.[a-z0-9]+$/i.test(rest)
  if (response.status === 404 && !looksLikeFile && (request.method === 'GET' || request.method === 'HEAD')) {
    const shell = new URL(url)
    shell.pathname = `${PREFIX}/`
    const fallback = await env.ASSETS.fetch(new Request(shell.toString(), request))
    if (fallback.ok) response = new Response(fallback.body, { status: 200, headers: fallback.headers })
  }

  const headers = new Headers(response.headers)
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) headers.set(k, v)
  if (rest.startsWith('/assets/') && response.ok) {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  } else if ((headers.get('Content-Type') ?? '').includes('text/html')) {
    headers.set('Cache-Control', 'no-cache')
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

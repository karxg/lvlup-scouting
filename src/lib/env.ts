/** Public URL of the app, including the subpath. Used for share links and meta tags. */
export const SITE_URL = 'https://kfarrag.com/lvlup/'

/** Optional. When set at build time, an opt-in contact screen appears and results are POSTed here. */
export const SUBMIT_WEBHOOK_URL: string = (import.meta.env.SUBMIT_WEBHOOK_URL ?? '').trim()

/** Resolve a file in /public against the deploy base, e.g. asset('og.png') → /lvlup/og.png. */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

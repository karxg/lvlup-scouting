/** localStorage that never throws (private mode, blocked storage, quota). */
export const storage = {
  get<T>(key: string): T | null {
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : null
    } catch {
      return null
    }
  },
  set(key: string, value: unknown): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Progress just won't persist.
    }
  },
  remove(key: string): void {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // Nothing to clean up.
    }
  },
}

export const KEYS = {
  progress: 'fundmatch:progress:v1',
  lang: 'fundmatch:lang',
  helpful: 'fundmatch:helpful',
} as const

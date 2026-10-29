import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { KEYS, storage } from '../lib/storage'
import type { Lang } from '../lib/types'
import { MESSAGES, isLang, type Messages } from '.'

interface LangState {
  /** null until the founder has picked a language (first visit without ?lang). */
  lang: Lang | null
  t: Messages
  setLang: (lang: Lang) => void
}

const Ctx = createContext<LangState | null>(null)

function initialLang(): Lang | null {
  const fromUrl = new URLSearchParams(window.location.search).get('lang')
  if (isLang(fromUrl)) return fromUrl
  const saved = storage.get<string>(KEYS.lang)
  return isLang(saved) ? saved : null
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang | null>(initialLang)
  const effective: Lang = lang ?? 'en'
  const t = MESSAGES[effective]

  useEffect(() => {
    const root = document.documentElement
    root.lang = effective
    root.dir = t.dir
    document.title = t.meta.title
  }, [effective, t])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    storage.set(KEYS.lang, next)
    const url = new URL(window.location.href)
    url.searchParams.set('lang', next)
    window.history.replaceState(window.history.state, '', url)
  }, [])

  const value = useMemo(() => ({ lang, t, setLang }), [lang, t, setLang])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useLang() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useLang must be used inside LangProvider')
  return { ...v, lang: v.lang ?? ('en' as Lang), chosen: v.lang !== null }
}

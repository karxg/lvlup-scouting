import { useState, type ReactNode } from 'react'
import { Link } from 'wouter'
import { DATA_LAST_UPDATED } from '../data/funds'
import { useLang } from '../i18n/LangContext'
import { AboutDialog } from './AboutDialog'
import { Wordmark } from './Wordmark'

interface Props {
  children: ReactNode
  /** Rendered at the very top (e.g. the progress line). */
  top?: ReactNode
  /** Hide the language toggle (the language-choice screen offers both already). */
  hideLangToggle?: boolean
}

export function Shell({ children, top, hideLangToggle }: Props) {
  const { t, lang, setLang } = useLang()
  const [about, setAbout] = useState(false)
  const other = lang === 'en' ? 'ar' : 'en'

  return (
    <div className="flex min-h-dvh flex-col">
      {top}
      <header className="border-b border-rule">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <Link href="/" className="-mx-1 flex min-h-12 items-center px-1">
            <Wordmark />
          </Link>
          {!hideLangToggle && (
            <button
              type="button"
              onClick={() => setLang(other)}
              aria-label={`${t.lang.other} · ${t.lang.switchLabel}`}
              className="link shrink-0 text-[15px]"
            >
              <span lang={other}>{t.lang.other}</span>
            </button>
          )}
        </div>
      </header>

      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>

      <footer className="mt-12 border-t border-rule">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 px-4 py-2 text-[13px] text-ink-3 sm:px-8">
          <button type="button" onClick={() => setAbout(true)} className="link text-[13px] font-normal text-ink-2">
            {t.footer.unofficial} · {t.footer.about}
          </button>
          <span>{t.funds.lastChecked(DATA_LAST_UPDATED)}</span>
        </div>
      </footer>

      <AboutDialog open={about} onClose={() => setAbout(false)} />
    </div>
  )
}

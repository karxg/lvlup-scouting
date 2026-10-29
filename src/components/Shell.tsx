import { useState, type ReactNode } from 'react'
import { Link } from 'wouter'
import { useLang } from '../i18n/LangContext'
import { AboutDialog } from './AboutDialog'
import { Wordmark } from './Wordmark'

interface Props {
  children: ReactNode
  /** Rendered at the very top (e.g. the progress bar). */
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
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 pt-5 sm:px-6">
        <Link href="/" className="-m-1 rounded-lg p-1" aria-label={`${t.brand.name} · ${t.brand.tagline}`}>
          <Wordmark />
        </Link>
        {!hideLangToggle && (
          <button
            type="button"
            onClick={() => setLang(other)}
            aria-label={t.lang.switchLabel}
            className="inline-flex h-12 min-w-12 items-center justify-center rounded-full border border-line px-4 text-sm font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface"
          >
            <span lang={other} className={other === 'ar' ? 'font-[family-name:var(--font-arabic)]' : 'font-sans'}>
              {t.lang.other}
            </span>
          </button>
        )}
      </header>

      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>

      <footer className="mx-auto w-full max-w-5xl px-4 pb-5 pt-8 text-center text-xs text-subtle sm:px-6">
        <button
          type="button"
          onClick={() => setAbout(true)}
          className="inline-flex min-h-12 items-center gap-1.5 rounded-lg px-3 text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          <span>{t.footer.unofficial}</span>
          <span aria-hidden="true">·</span>
          <span>{t.footer.about}</span>
        </button>
      </footer>

      <AboutDialog open={about} onClose={() => setAbout(false)} />
    </div>
  )
}

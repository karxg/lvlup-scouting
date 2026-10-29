import { useLang } from '../i18n/LangContext'
import type { Lang } from '../lib/types'
import { MESSAGES } from '../i18n'

export function LanguageChoice({ onChosen }: { onChosen: () => void }) {
  const { setLang } = useLang()
  const pick = (l: Lang) => {
    setLang(l)
    onChosen()
  }
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        <span lang="en" dir="ltr" className="block font-sans">
          {MESSAGES.en.lang.chooseTitle}
        </span>
        <span lang="ar" dir="rtl" className="mt-1 block text-muted">
          {MESSAGES.ar.lang.chooseTitle}
        </span>
      </h1>
      <div className="mt-8 grid gap-3">
        <button
          type="button"
          lang="en"
          dir="ltr"
          onClick={() => pick('en')}
          className="h-16 rounded-[var(--radius-card)] border border-line bg-surface font-sans text-lg font-medium transition-colors hover:border-accent hover:bg-accent-soft"
        >
          English
        </button>
        <button
          type="button"
          lang="ar"
          dir="rtl"
          onClick={() => pick('ar')}
          className="h-16 rounded-[var(--radius-card)] border border-line bg-surface text-lg font-medium transition-colors hover:border-accent hover:bg-accent-soft"
        >
          العربية
        </button>
      </div>
    </div>
  )
}

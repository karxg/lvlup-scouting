import { MESSAGES } from '../i18n'
import { useLang } from '../i18n/LangContext'
import type { Lang } from '../lib/types'
import { ArrowRight } from './Icons'

export function LanguageChoice({ onChosen }: { onChosen: () => void }) {
  const { setLang } = useLang()
  const pick = (l: Lang) => {
    setLang(l)
    onChosen()
  }
  const row =
    'flex min-h-16 w-full items-center justify-between gap-4 border-b border-rule px-1 text-start text-2xl transition-colors hover:bg-paper-2'
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-12 sm:px-8">
      <h1 className="text-[28px] leading-tight">
        <span lang="en" dir="ltr" className="block">
          {MESSAGES.en.lang.chooseTitle}
        </span>
        <span lang="ar" dir="rtl" className="block text-ink-2">
          {MESSAGES.ar.lang.chooseTitle}
        </span>
      </h1>
      <div className="mt-8 border-t border-ink">
        <button type="button" lang="en" dir="ltr" onClick={() => pick('en')} className={`${row} font-[family-name:var(--font-display)]`}>
          English
          <ArrowRight />
        </button>
        <button type="button" lang="ar" dir="rtl" onClick={() => pick('ar')} className={`${row} font-[family-name:var(--font-display)] font-semibold`}>
          العربية
          <ArrowRight className="-scale-x-100" />
        </button>
      </div>
    </div>
  )
}

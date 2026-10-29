import { useLang } from '../i18n/LangContext'

/** Typographic wordmark: the name set in the display serif, the qualifier in small body type. */
export function Wordmark() {
  const { t } = useLang()
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
      <span lang="en" dir="ltr" className="font-[family-name:var(--font-display)] text-[21px] leading-none font-semibold tracking-[-0.01em] text-ink">
        {t.brand.name}
      </span>
      <span className="text-[13px] leading-none text-ink-3">{t.brand.tagline}</span>
    </span>
  )
}

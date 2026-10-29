import { useLang } from '../i18n/LangContext'

export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#16161D" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="8.5" fill="none" stroke="#3A3A46" />
      <path d="M9 23V9h9M9 16h7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="22.5" cy="21.5" r="3.2" fill="#C084FC" />
    </svg>
  )
}

export function Wordmark() {
  const { t } = useLang()
  return (
    <span className="inline-flex items-center gap-2.5">
      <Mark />
      <span className="flex flex-col leading-tight sm:flex-row sm:items-baseline sm:gap-1.5">
        <span lang="en" dir="ltr" className="font-sans text-[15px] font-semibold tracking-tight text-ink">
          {t.brand.name}
        </span>
        <span className="text-xs text-muted">
          <span aria-hidden="true" className="hidden sm:inline">
            ·{' '}
          </span>
          {t.brand.tagline}
        </span>
      </span>
    </span>
  )
}

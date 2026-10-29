import { useLang } from '../i18n/LangContext'

/** Hairline progress rule pinned to the top edge. `value` is 0–1. */
export function ProgressBar({ value, current, total }: { value: number; current: number; total: number }) {
  const { t } = useLang()
  return (
    <div
      role="progressbar"
      aria-label={t.nav.progress(current, total)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      className="fixed inset-x-0 top-0 z-50 h-[3px] bg-rule"
    >
      <div
        className="h-full origin-left bg-accent transition-transform duration-300 ease-[var(--ease-out)] rtl:origin-right"
        style={{ transform: `scaleX(${Math.max(0.02, value)})` }}
      />
    </div>
  )
}

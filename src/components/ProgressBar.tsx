import { useLang } from '../i18n/LangContext'

/** Thin bar pinned to the top. `value` is 0–1. */
export function ProgressBar({ value, current, total }: { value: number; current: number; total: number }) {
  const { t } = useLang()
  return (
    <div
      role="progressbar"
      aria-label={t.nav.progress(current, total)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      className="fixed inset-x-0 top-0 z-50 h-[3px] bg-line/60"
    >
      <div
        className="h-full origin-[left] bg-accent shadow-[0_0_12px_rgba(192,132,252,0.7)] transition-transform duration-500 ease-out rtl:origin-[right]"
        style={{ transform: `scaleX(${Math.max(0.02, value)})` }}
      />
    </div>
  )
}

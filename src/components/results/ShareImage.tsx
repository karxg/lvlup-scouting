import { forwardRef } from 'react'
import { MESSAGES, formatReason, ltr, plain } from '../../i18n'
import type { FundMatch } from '../../lib/match'
import type { Lang } from '../../lib/types'
import { Mark } from '../Wordmark'

/**
 * The 1080×1350 card exported by "Save as image". Rendered off-screen at full size
 * with explicit dir/lang so Arabic lays out right-to-left in the PNG as well.
 */
export const ShareImage = forwardRef<HTMLDivElement, { match: FundMatch; lang: Lang }>(function ShareImage(
  { match, lang },
  ref,
) {
  const t = MESSAGES[lang]
  const f = match.fund
  const rtl = lang === 'ar'
  return (
    <div
      ref={ref}
      dir={t.dir}
      lang={lang}
      style={{
        width: 1080,
        height: 1350,
        fontFamily: rtl ? 'var(--font-arabic)' : 'var(--font-sans)',
        background:
          'radial-gradient(900px 600px at 85% -10%, rgba(192,132,252,0.28), transparent 60%), radial-gradient(700px 500px at -10% 110%, rgba(192,132,252,0.14), transparent 60%), #0B0B0F',
      }}
      className="flex flex-col p-[88px] text-ink"
    >
      <div className="flex items-center gap-5">
        <Mark size={64} />
        <div className="flex flex-col">
          <span dir="ltr" className="font-sans text-[34px] font-semibold tracking-tight">
            {t.brand.name}
          </span>
          <span className="text-[24px] text-muted">{t.brand.tagline}</span>
        </div>
      </div>

      <p className="mt-[110px] text-[30px] font-medium text-accent">{t.results.eyebrow}</p>
      <h1 dir="ltr" lang="en" className="mt-4 font-sans text-[84px] leading-[1.02] font-semibold tracking-tight" style={{ textAlign: rtl ? 'right' : 'left' }}>
        {f.name}
      </h1>
      <p className="mt-6 max-w-[860px] text-[32px] leading-snug text-muted">{plain(f.description[lang])}</p>
      <p className="mt-10 text-[96px] leading-none font-semibold tracking-tight text-accent">
        {ltr(f.rangeHeadline[lang])}
      </p>

      <ul className="mt-14 space-y-5">
        {match.reasons.slice(0, 3).map((r) => (
          <li key={r.code} className="flex items-start gap-5 text-[30px] leading-snug">
            <span className="mt-[14px] inline-block h-3.5 w-3.5 shrink-0 rounded-full bg-accent" />
            <span>{formatReason(r, lang)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-end justify-between gap-8 border-t border-line pt-8 text-[24px] text-muted">
        <span>{t.results.imageTagline}</span>
        <span dir="ltr" className="shrink-0 font-sans">
          kfarrag.com/lvlup
        </span>
      </div>
    </div>
  )
})

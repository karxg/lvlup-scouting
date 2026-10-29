import { forwardRef } from 'react'
import { MESSAGES, formatReason, ltr, plain } from '../../i18n'
import type { FundMatch } from '../../lib/match'
import type { Lang } from '../../lib/types'

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
  return (
    <div
      ref={ref}
      dir={t.dir}
      lang={lang}
      style={{ width: 1080, height: 1350 }}
      className="flex flex-col bg-paper px-[96px] py-[88px] font-[family-name:var(--font-body)] text-ink"
    >
      <div className="flex items-baseline justify-between gap-8 border-b-2 border-ink pb-6">
        <span lang="en" dir="ltr" className="font-[family-name:var(--font-display)] text-[44px] leading-none font-semibold">
          {t.brand.name}
        </span>
        <span className="text-[26px] text-ink-3">{t.brand.tagline}</span>
      </div>

      <p className="mt-[96px] text-[28px] text-ink-3">{t.results.eyebrow}</p>
      <h1
        lang="en"
        dir="ltr"
        className="mt-4 font-[family-name:var(--font-display)] text-[104px] leading-[0.98] font-medium tracking-[-0.02em] rtl:text-right"
      >
        {f.name}
      </h1>
      <p className="mt-4 text-[26px] text-ink-3">{t.fundType[f.type]}</p>
      <p className="mt-8 max-w-[860px] text-[32px] leading-snug text-ink-2">{plain(f.description[lang])}</p>
      <p className="mt-10 font-[family-name:var(--font-display)] text-[96px] leading-none font-medium tracking-[-0.02em] text-accent [font-variant-numeric:lining-nums]">{ltr(f.rangeHeadline[lang])}</p>

      <ol className="mt-14 border-t border-rule">
        {match.reasons.slice(0, 3).map((r, i) => (
          <li key={r.code} className="flex gap-6 border-b border-rule py-5 text-[30px] leading-snug">
            <span className="num w-8 shrink-0 text-[26px] text-ink-3">{i + 1}</span>
            <span>{formatReason(r, lang)}</span>
          </li>
        ))}
      </ol>

      <div className="mt-auto flex items-end justify-between gap-8 text-[24px] text-ink-2">
        <span>{t.results.imageTagline}</span>
        <span dir="ltr" className="num shrink-0">
          kfarrag.com/lvlup
        </span>
      </div>
    </div>
  )
})

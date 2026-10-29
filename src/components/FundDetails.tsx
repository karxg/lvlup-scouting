import { useLang } from '../i18n/LangContext'
import type { Fund } from '../lib/types'
import { ltr } from '../i18n'
import { Check } from './Icons'
import { Rich } from './Rich'

export function FundBadge({ fund }: { fund: Fund }) {
  const { lang } = useLang()
  if (!fund.badge) return null
  return (
    <span className="inline-flex items-center rounded-full border border-accent/40 bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
      {ltr(fund.badge[lang])}
    </span>
  )
}

/** Fund name (always English) with its description in the current language underneath. */
export function FundTitle({ fund, as: As = 'h3', size = 'md' }: { fund: Fund; as?: 'h1' | 'h2' | 'h3'; size?: 'lg' | 'md' }) {
  const { lang, t } = useLang()
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <As
          lang="en"
          dir="ltr"
          className={`font-sans font-semibold tracking-tight rtl:text-right ${size === 'lg' ? 'text-3xl sm:text-4xl' : 'text-xl'}`}
        >
          {fund.name}
        </As>
        <FundBadge fund={fund} />
        <span className="text-xs text-muted">{t.fundType[fund.type]}</span>
      </div>
      <p className={`mt-2 leading-relaxed text-muted ${size === 'lg' ? 'text-base sm:text-lg' : 'text-[15px]'}`}>
        <Rich text={fund.description[lang]} />
      </p>
    </div>
  )
}

export function Checklist({ fund, as: As = 'h3' }: { fund: Fund; as?: 'h2' | 'h3' | 'h4' }) {
  const { lang, t } = useLang()
  return (
    <div>
      <As className="mb-2 text-sm font-semibold text-ink">{t.results.checklist}</As>
      <ul className="space-y-2">
        {fund.checklist.map((item) => (
          <li key={item.en} className="flex gap-2.5 text-[15px] leading-snug text-muted">
            <span
              aria-hidden="true"
              className="mt-0.5 inline-flex h-4 w-4 shrink-0 rounded border border-line-strong"
            />
            {item[lang]}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Funding, criteria, focus, cost and the accelerator note. */
export function FundFacts({ fund }: { fund: Fund }) {
  const { lang, t } = useLang()
  const rows: [string, string][] = [
    [t.results.funding, fund.rangeLabel[lang]],
    [t.results.criteria, fund.criteria[lang]],
    [t.results.focus, fund.focus[lang]],
  ]
  if (fund.cost) rows.push([t.results.cost, fund.cost[lang]])
  return (
    <div className="space-y-4">
      <dl className="grid gap-3 text-[15px]">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-0.5 sm:grid-cols-[8rem_1fr] sm:gap-4">
            <dt className="text-sm font-medium text-subtle">{k}</dt>
            <dd className="leading-relaxed text-ink">
              <Rich text={v} />
            </dd>
          </div>
        ))}
      </dl>
      {fund.type === 'accelerator' && (
        <p className="rounded-xl border border-line bg-bg/40 p-3 text-sm leading-relaxed text-muted">
          {t.results.acceleratorNote}
        </p>
      )}
    </div>
  )
}

export function ReasonList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((text) => (
        <li key={text} className="flex gap-2.5 text-[15px] leading-snug text-ink">
          <Check width={18} height={18} className="mt-px shrink-0 text-accent" />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  )
}

/** The big purple amount, in the current language with amounts kept left-to-right. */
export function RangeHeadline({ fund, className = '' }: { fund: Fund; className?: string }) {
  const { lang } = useLang()
  return (
    <p className={`font-semibold tracking-tight text-accent tabular-nums text-balance ${className}`}>
      {ltr(fund.rangeHeadline[lang])}
    </p>
  )
}

import { useId } from 'react'
import { ltr } from '../i18n'
import { useLang } from '../i18n/LangContext'
import type { Fund } from '../lib/types'
import { Rich } from './Rich'

export function FundBadge({ fund }: { fund: Fund }) {
  const { lang } = useLang()
  if (!fund.badge) return null
  return (
    <span className="inline-flex items-center rounded-[var(--radius-sm)] border border-rule-strong px-1.5 py-px text-[12px] font-medium text-ink-2">
      {ltr(fund.badge[lang])}
    </span>
  )
}

/** Fund name (always English, display serif) with its type, badge and description. */
export function FundTitle({
  fund,
  as: As = 'h3',
  size = 'md',
}: {
  fund: Fund
  as?: 'h1' | 'h2' | 'h3'
  size?: 'lg' | 'md'
}) {
  const { lang, t } = useLang()
  return (
    <div className="min-w-0">
      <As
        lang="en"
        dir="ltr"
        className={`tracking-[-0.015em] rtl:text-right ${
          size === 'lg' ? 'text-[clamp(2.25rem,8vw,3.75rem)] leading-[1.02]' : 'text-[22px] leading-tight'
        }`}
      >
        {fund.name}
      </As>
      <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-3 ${size === 'lg' ? 'mt-3' : 'mt-1.5'}`}>
        <span>{t.fundType[fund.type]}</span>
        <FundBadge fund={fund} />
      </p>
      <p className={`mt-2 leading-relaxed text-ink-2 ${size === 'lg' ? 'max-w-[38rem] text-lg' : 'text-[15px]'}`}>
        <Rich text={fund.description[lang]} />
      </p>
    </div>
  )
}

/** "Before you apply" as real checkboxes the founder can tick off (not saved). */
export function Checklist({ fund, as: As = 'h3' }: { fund: Fund; as?: 'h2' | 'h3' | 'h4' }) {
  const { lang, t } = useLang()
  const id = useId()
  return (
    <div>
      <As className="font-[family-name:var(--font-body)] text-[15px] font-semibold text-ink">{t.results.checklist}</As>
      <ul className="mt-1">
        {fund.checklist.map((item, i) => (
          <li key={item.en}>
            <label
              htmlFor={`${id}-${i}`}
              className="flex min-h-11 cursor-pointer items-start gap-3 py-2 text-[15px] leading-snug text-ink-2 has-[:checked]:text-ink-3 has-[:checked]:line-through"
            >
              <input
                id={`${id}-${i}`}
                type="checkbox"
                className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-[var(--color-ink)]"
              />
              {item[lang]}
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Funding, criteria, focus and cost as a ruled table, plus the accelerator note. */
export function FundFacts({ fund }: { fund: Fund }) {
  const { lang, t } = useLang()
  const rows: [string, string][] = [
    [t.results.funding, fund.rangeLabel[lang]],
    [t.results.criteria, fund.criteria[lang]],
    [t.results.focus, fund.focus[lang]],
  ]
  if (fund.cost) rows.push([t.results.cost, fund.cost[lang]])
  return (
    <div>
      <dl className="border-t border-rule text-[15px]">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-0.5 border-b border-rule py-2.5 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-4">
            <dt className="text-[13px] text-ink-3 sm:pt-0.5">{k}</dt>
            <dd className="leading-relaxed text-ink">
              <Rich text={v} />
            </dd>
          </div>
        ))}
      </dl>
      {fund.type === 'accelerator' && (
        <p className="mt-3 border-s-2 border-rule-strong ps-3 text-sm leading-relaxed text-ink-2">{t.results.acceleratorNote}</p>
      )}
    </div>
  )
}

/** Numbered reasons; numbers set in mono so they read like a memo's points. */
export function ReasonList({ items }: { items: string[] }) {
  return (
    <ol>
      {items.map((text, i) => (
        <li key={text} className="flex gap-3 border-b border-rule py-2.5 text-[15px] leading-snug text-ink last:border-b-0">
          <span aria-hidden="true" className="num w-5 shrink-0 pt-px text-[13px] text-ink-3">
            {i + 1}
          </span>
          <span>{text}</span>
        </li>
      ))}
    </ol>
  )
}

/** The headline amount: display serif with lining figures, in the accent colour, amounts kept left-to-right. */
export function RangeHeadline({ fund, className = '' }: { fund: Fund; className?: string }) {
  const { lang } = useLang()
  return (
    <p className={`font-[family-name:var(--font-display)] font-medium text-accent text-balance [font-variant-numeric:lining-nums_tabular-nums] ${className}`}>
      {ltr(fund.rangeHeadline[lang])}
    </p>
  )
}

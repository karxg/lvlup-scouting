import { useMemo, useState } from 'react'
import { Link } from 'wouter'
import { Checklist, FundFacts, FundTitle, RangeHeadline } from '../components/FundDetails'
import { ArrowLeft, ArrowRight, ChevronDown } from '../components/Icons'
import { Shell } from '../components/Shell'
import { DATA_LAST_UPDATED, FUNDS, MRR_LOWER_BOUND } from '../data/funds'
import { useLang } from '../i18n/LangContext'
import type { Fund, Mrr, Stage } from '../lib/types'

type TypeFilter = 'equity' | 'non-dilutive' | 'accelerator' | 'free'
const TYPE_FILTERS: TypeFilter[] = ['equity', 'non-dilutive', 'accelerator', 'free']
const STAGES: Stage[] = ['idea', 'building', 'pre_seed', 'seed', 'series_a', 'growth']
const MRRS: Mrr[] = ['zero', 'under_1k', '1k_10k', '10k_100k', '100k_plus']

/** Hybrid funds offer both equity and non-dilutive capital, so they show under either filter. */
function matchesType(f: Fund, type: TypeFilter): boolean {
  if (type === 'free') return f.type === 'support'
  if (type === 'equity') return f.type === 'equity' || f.type === 'hybrid'
  if (type === 'non-dilutive') return f.type === 'non-dilutive' || f.type === 'hybrid'
  return f.type === 'accelerator'
}

export function Funds() {
  const { t } = useLang()
  const ft = t.funds
  const [type, setType] = useState<TypeFilter | ''>('')
  const [stage, setStage] = useState<Stage | ''>('')
  const [mrr, setMrr] = useState<Mrr | ''>('')

  const shown = useMemo(
    () =>
      FUNDS.filter(
        (f) =>
          (!type || matchesType(f, type)) &&
          (!stage || !f.hardRules.stages || f.hardRules.stages.includes(stage)) &&
          (!mrr || (f.hardRules.minMrr ?? 0) <= MRR_LOWER_BOUND[mrr]),
      ),
    [type, stage, mrr],
  )

  const select =
    'h-12 w-full appearance-none rounded-[var(--radius-sm)] border border-rule-strong bg-paper ps-3 pe-9 text-[15px] text-ink hover:border-ink focus-visible:border-ink'

  return (
    <Shell>
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
        <Link href="/" className="link text-[15px]">
          <ArrowLeft className="flip-rtl" width={18} height={18} />
          {ft.back}
        </Link>
        <h1 className="mt-4 text-[clamp(2.25rem,7vw,3.75rem)] leading-[1.02] tracking-[-0.02em]">{ft.title}</h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-2">{ft.subtitle}</p>

        <div className="mt-8 grid gap-x-6 gap-y-4 border-y border-ink py-4 md:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)]">
          <fieldset className="min-w-0">
            <legend className="mb-1.5 text-[13px] text-ink-3">{ft.filterType}</legend>
            <div className="flex flex-wrap">
              {(['', ...TYPE_FILTERS] as const).map((v) => (
                <button
                  key={v || 'any'}
                  type="button"
                  aria-pressed={type === v}
                  onClick={() => setType(v)}
                  className={`-me-px h-12 border px-3.5 text-[15px] whitespace-nowrap transition-colors first:rounded-s-[var(--radius-sm)] last:rounded-e-[var(--radius-sm)] ${
                    type === v
                      ? 'relative z-10 border-ink bg-ink text-paper'
                      : 'border-rule-strong text-ink hover:bg-paper-2'
                  }`}
                >
                  {v ? ft.typeFilter[v] : ft.any}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="grid min-w-0 gap-1.5 text-[13px] text-ink-3">
            {ft.filterStage}
            <span className="relative">
              <select value={stage} onChange={(e) => setStage(e.target.value as Stage | '')} className={select}>
                <option value="">{ft.any}</option>
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {t.questions.stage.options[s].label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-ink-2" />
            </span>
          </label>
          <label className="grid min-w-0 gap-1.5 text-[13px] text-ink-3">
            {ft.filterMrr}
            <span className="relative">
              <select value={mrr} onChange={(e) => setMrr(e.target.value as Mrr | '')} className={select}>
                <option value="">{ft.any}</option>
                {MRRS.map((m) => (
                  <option key={m} value={m}>
                    {t.questions.mrr.options[m].label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-ink-2" />
            </span>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4">
          <p className="py-3 text-sm text-ink-2" aria-live="polite">
            {ft.count(shown.length, FUNDS.length)}
          </p>
          {(type || stage || mrr) && (
            <button
              type="button"
              onClick={() => {
                setType('')
                setStage('')
                setMrr('')
              }}
              className="link text-sm"
            >
              {ft.clear}
            </button>
          )}
        </div>

        {shown.length === 0 ? (
          <p className="border-t border-rule py-6 text-ink-2">{ft.empty}</p>
        ) : (
          <ol className="border-t border-rule">
            {shown.map((f) => (
              <li
                key={f.id}
                className="grid gap-6 border-b border-rule py-7 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-10"
              >
                <div>
                  <FundTitle fund={f} as="h2" />
                  <RangeHeadline fund={f} className="mt-4 text-[30px] leading-none" />
                </div>
                <div className="grid gap-5">
                  <FundFacts fund={f} />
                  <Checklist fund={f} />
                </div>
              </li>
            ))}
          </ol>
        )}

        <p role="note" className="mt-10 max-w-2xl border border-rule-strong p-4 text-sm leading-relaxed text-ink-2">
          {t.results.disclaimer} {ft.lastChecked(DATA_LAST_UPDATED)}
        </p>
        <Link href="/" className="btn btn-primary mt-6 min-h-14 px-7 text-base">
          {ft.findMatch}
          <ArrowRight className="flip-rtl" />
        </Link>
      </div>
    </Shell>
  )
}

import { useMemo, useState } from 'react'
import { Link } from 'wouter'
import { Checklist, FundFacts, FundTitle, RangeHeadline } from '../components/FundDetails'
import { ArrowLeft, ArrowRight } from '../components/Icons'
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
  const { t, lang } = useLang()
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
    'h-12 w-full appearance-none rounded-xl border border-line bg-surface px-4 text-[15px] text-ink focus:border-accent focus:outline-none'
  const chevron = {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: lang === 'ar' ? 'left 1rem center' : 'right 1rem center',
  }

  return (
    <Shell>
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/"
          className="mb-6 inline-flex h-12 items-center gap-2 rounded-full border border-line px-5 text-sm font-medium hover:border-line-strong hover:bg-surface"
        >
          <ArrowLeft className="flip-rtl" />
          {ft.back}
        </Link>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{ft.title}</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">{ft.subtitle}</p>

        <div className="mt-8 grid gap-4 rounded-[var(--radius-card)] border border-line bg-surface/60 p-4 sm:grid-cols-3">
          <fieldset className="sm:col-span-3">
            <legend className="mb-2 text-sm font-medium text-muted">{ft.filterType}</legend>
            <div className="flex flex-wrap gap-2">
              {(['', ...TYPE_FILTERS] as const).map((v) => (
                <button
                  key={v || 'any'}
                  type="button"
                  aria-pressed={type === v}
                  onClick={() => setType(v)}
                  className={`h-12 rounded-full border px-4 text-sm font-medium transition-colors ${
                    type === v ? 'border-accent bg-accent-soft text-ink' : 'border-line text-muted hover:text-ink'
                  }`}
                >
                  {v ? ft.typeFilter[v] : ft.any}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="grid gap-2 text-sm font-medium text-muted">
            {ft.filterStage}
            <select value={stage} onChange={(e) => setStage(e.target.value as Stage | '')} className={select} style={chevron}>
              <option value="">{ft.any}</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {t.questions.stage.options[s].label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-muted">
            {ft.filterMrr}
            <select value={mrr} onChange={(e) => setMrr(e.target.value as Mrr | '')} className={select} style={chevron}>
              <option value="">{ft.any}</option>
              {MRRS.map((m) => (
                <option key={m} value={m}>
                  {t.questions.mrr.options[m].label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setType('')
                setStage('')
                setMrr('')
              }}
              className="h-12 rounded-full px-4 text-sm font-medium text-accent underline-offset-4 hover:underline"
            >
              {ft.clear}
            </button>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted" aria-live="polite">
          {ft.count(shown.length, FUNDS.length)}
        </p>

        {shown.length === 0 ? (
          <p className="mt-6 rounded-[var(--radius-card)] border border-line bg-surface p-6 text-muted">{ft.empty}</p>
        ) : (
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {shown.map((f) => (
              <li key={f.id} className="flex flex-col rounded-[var(--radius-card)] border border-line bg-surface p-5 sm:p-6">
                <FundTitle fund={f} as="h2" />
                <RangeHeadline fund={f} className="mt-4 text-3xl" />
                <div className="mt-5 border-t border-line pt-5">
                  <FundFacts fund={f} />
                </div>
                <div className="mt-5 border-t border-line pt-5">
                  <Checklist fund={f} />
                </div>
              </li>
            ))}
          </ul>
        )}

        <p role="note" className="mt-10 rounded-[var(--radius-card)] border border-line bg-surface p-4 text-sm leading-relaxed text-muted">
          {t.results.disclaimer} {ft.lastChecked(DATA_LAST_UPDATED)}
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-14 items-center gap-2.5 rounded-full bg-accent px-7 text-base font-semibold text-bg hover:opacity-90"
        >
          {ft.findMatch}
          <ArrowRight className="flip-rtl" />
        </Link>
      </div>
    </Shell>
  )
}

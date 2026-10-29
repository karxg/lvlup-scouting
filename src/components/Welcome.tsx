import { Link } from 'wouter'
import { useLang } from '../i18n/LangContext'
import { estimatedLength } from '../lib/questions'
import type { Answers } from '../lib/types'
import { ArrowRight } from './Icons'

export function Welcome({ answers, onStart }: { answers: Answers; onStart: () => void }) {
  const { t } = useLang()
  const { questions, minutes } = estimatedLength(answers)
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-10 sm:px-6">
      <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
        {t.welcome.eyebrow}
      </p>
      <h1 className="text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-6xl">{t.welcome.title}</h1>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{t.welcome.subtitle}</p>

      <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          type="button"
          autoFocus
          onClick={onStart}
          className="inline-flex h-14 items-center gap-2.5 rounded-full bg-accent px-8 text-base font-semibold text-bg shadow-[0_8px_30px_rgba(192,132,252,0.25)] transition hover:opacity-90"
        >
          {t.welcome.start}
          <ArrowRight className="flip-rtl" />
        </button>
        <span className="text-sm text-muted tabular-nums">{t.welcome.length(questions, minutes)}</span>
      </div>
      <p className="mt-4 text-sm text-subtle">{t.welcome.disclaimer}</p>

      <Link
        href="/funds"
        className="mt-10 inline-flex min-h-12 w-fit items-center gap-2 text-sm font-medium text-accent underline-offset-4 hover:underline"
      >
        {t.welcome.browse}
        <ArrowRight width={16} height={16} className="flip-rtl" />
      </Link>
    </div>
  )
}

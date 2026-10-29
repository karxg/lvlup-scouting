import { Link } from 'wouter'
import { FUNDS } from '../data/funds'
import { useLang } from '../i18n/LangContext'
import { estimatedLength } from '../lib/questions'
import type { Answers } from '../lib/types'
import { ArrowRight } from './Icons'

export function Welcome({ answers, onStart }: { answers: Answers; onStart: () => void }) {
  const { t } = useLang()
  const { questions, minutes } = estimatedLength(answers)
  return (
    <div className="mx-auto grid w-full max-w-5xl flex-1 gap-12 px-4 py-10 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-16">
      <div className="flex flex-col justify-center">
        <h1 className="text-[clamp(2.4rem,7.5vw,4.25rem)] leading-[1.02] tracking-[-0.02em] text-balance">
          {t.welcome.title}
        </h1>
        <p className="mt-5 max-w-[34rem] text-lg leading-relaxed text-ink-2">{t.welcome.subtitle}</p>

        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button type="button" autoFocus onClick={onStart} className="btn btn-primary min-h-13 px-7 text-base">
            {t.welcome.start}
            <ArrowRight className="flip-rtl" />
          </button>
          <span className="text-sm text-ink-2">{t.welcome.length(questions, minutes)}</span>
        </div>
        <p className="mt-5 text-sm text-ink-3">{t.welcome.disclaimer}</p>
      </div>

      <aside aria-labelledby="covered" className="self-center">
        <h2 id="covered" className="border-b border-ink pb-2 text-lg">
          {t.welcome.covered(FUNDS.length)}
        </h2>
        <ol className="text-[15px]">
          {FUNDS.map((f) => (
            <li key={f.id} className="flex items-baseline justify-between gap-4 border-b border-rule py-2">
              <span lang="en" dir="ltr" className="min-w-0 truncate text-ink">
                {f.name}
              </span>
              <span className="shrink-0 text-[13px] text-ink-3">{t.fundType[f.type]}</span>
            </li>
          ))}
        </ol>
        <Link href="/funds" className="link mt-2 text-[15px]">
          {t.welcome.browse}
          <ArrowRight width={16} height={16} className="flip-rtl" />
        </Link>
      </aside>
    </div>
  )
}

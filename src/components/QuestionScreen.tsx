import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLang } from '../i18n/LangContext'
import type { Question } from '../lib/questions'
import type { Answers } from '../lib/types'
import { ArrowLeft, Check } from './Icons'
import { Rich } from './Rich'
import { TermInfo } from './Term'

/** Delay between choosing a single-select option and moving on, so the choice registers visually. */
export const AUTO_ADVANCE_MS = 350

interface Props {
  question: Question
  answers: Answers
  index: number
  total: number
  onChange: (answers: Answers) => void
  onNext: () => void
  onBack: () => void
}

const LATIN = 'abcdefghijklmnopqrstuvwxyz'

export function QuestionScreen({ question: q, answers, index, total, onChange, onNext, onBack }: Props) {
  const { t } = useLang()
  const copy = t.questions[q.id]
  const options = copy.options as Record<string, { label: string; hint?: string }>
  const value = answers[q.id]
  const selected: string[] = Array.isArray(value) ? value : value ? [value] : []
  const multi = q.kind === 'multi'
  const atMax = multi && q.max !== undefined && selected.length >= q.max
  const [confirming, setConfirming] = useState<string | null>(null)
  const reduce = useReducedMotion()

  const root = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const advanceTimer = useRef<number | undefined>(undefined)
  const titleId = `q-${q.id}-title`

  // Give keyboard users a starting point without pre-selecting an option.
  useEffect(() => {
    root.current?.focus({ preventScroll: true })
    return () => window.clearTimeout(advanceTimer.current)
  }, [])

  function choose(opt: string) {
    if (confirming) return
    if (!multi) {
      onChange({ ...answers, [q.id]: opt })
      setConfirming(opt)
      advanceTimer.current = window.setTimeout(onNext, AUTO_ADVANCE_MS)
      return
    }
    const has = selected.includes(opt)
    if (!has && atMax) return
    const next = has ? selected.filter((o) => o !== opt) : [...selected, opt]
    onChange({ ...answers, [q.id]: q.options.filter((o) => next.includes(o)) })
  }

  // Latest values for the window-level key handler.
  const live = useRef({ choose, selected, onNext, onBack })
  useLayoutEffect(() => {
    live.current = { choose, selected, onNext, onBack }
  })

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, select, dialog')) return
      const { choose, selected, onNext, onBack } = live.current
      const focusedIdx = optionRefs.current.findIndex((el) => el === document.activeElement)
      const nothingFocused = target === document.body || target === root.current

      if (e.key === 'Enter') {
        if (target.closest('button') && focusedIdx < 0) return // let other buttons work normally
        e.preventDefault()
        if (focusedIdx >= 0 && (!multi || selected.length === 0)) choose(q.options[focusedIdx])
        else if (selected.length > 0) (multi ? onNext : () => choose(selected[0]))()
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (focusedIdx > 0) optionRefs.current[focusedIdx - 1]?.focus()
        else onBack()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        optionRefs.current[Math.min(focusedIdx + 1, q.options.length - 1)]?.focus()
        return
      }
      if (e.key === 'Tab' && e.shiftKey && nothingFocused) {
        e.preventDefault()
        onBack()
        return
      }
      if (e.key.length === 1) {
        const key = e.key.toLowerCase()
        let i = LATIN.indexOf(key)
        if (i < 0) i = t.letters.findIndex((l) => l === e.key || l.charAt(0) === e.key)
        if (i >= 0 && i < q.options.length) {
          e.preventDefault()
          choose(q.options[i])
          optionRefs.current[i]?.focus({ preventScroll: true })
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [q, multi, t.letters])

  const hint = multi ? (q.max ? t.nav.chooseUpTo(q.max) : t.nav.chooseMany) : null
  const subtitle = 'subtitle' in copy ? (copy.subtitle as string) : null

  return (
    <div
      ref={root}
      tabIndex={-1}
      className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-8 outline-none sm:px-6"
    >
      <p className="mb-3 text-sm font-medium text-accent">
        <span className="tabular-nums">{t.nav.progress(index + 1, total)}</span>
      </p>
      <h1 id={titleId} className="text-[26px] leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
        <Rich text={copy.title} />
      </h1>
      {(subtitle || hint) && (
        <p className="mt-3 text-base text-muted">
          {subtitle && <Rich text={subtitle} />}
          {subtitle && hint && ' '}
          {hint}
        </p>
      )}
      {q.terms && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {q.terms.map((id) => (
            <li
              key={id}
              className="inline-flex items-center rounded-full border border-line bg-surface ps-3 pe-1 text-sm text-muted"
            >
              {t.glossary.terms[id].term}
              <TermInfo id={id} />
            </li>
          ))}
        </ul>
      )}

      <div
        role={multi ? 'group' : 'radiogroup'}
        aria-labelledby={titleId}
        className="mt-7 grid gap-2.5"
      >
        {q.options.map((opt, i) => {
          const isSel = selected.includes(opt)
          const disabled = !isSel && atMax
          const o = options[opt]
          return (
            <motion.button
              key={opt}
              ref={(el) => {
                optionRefs.current[i] = el
              }}
              type="button"
              role={multi ? 'checkbox' : 'radio'}
              aria-checked={isSel}
              aria-disabled={disabled || undefined}
              onClick={() => choose(opt)}
              animate={confirming === opt && !reduce ? { scale: [1, 0.985, 1] } : undefined}
              transition={{ duration: 0.3 }}
              className={`group flex min-h-14 w-full items-center gap-3.5 rounded-[var(--radius-card)] border px-4 py-3 text-start transition-colors duration-150 ${
                isSel
                  ? 'border-accent bg-accent-soft'
                  : disabled
                    ? 'cursor-not-allowed border-line bg-surface opacity-45'
                    : 'border-line bg-surface hover:border-line-strong hover:bg-surface-2'
              }`}
            >
              <span
                aria-hidden="true"
                className={`inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md border text-[13px] font-semibold transition-colors ${
                  isSel ? 'border-accent bg-accent text-bg' : 'border-line-strong text-muted group-hover:text-ink'
                }`}
              >
                {t.letters[i]}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[16px] leading-snug font-medium text-ink"><Rich text={o.label} /></span>
                {o.hint && <span className="mt-0.5 text-sm leading-snug text-muted"><Rich text={o.hint} /></span>}
              </span>
              <span
                aria-hidden="true"
                className={`shrink-0 text-accent transition-opacity ${isSel ? 'opacity-100' : 'opacity-0'}`}
              >
                <Check />
              </span>
            </motion.button>
          )
        })}
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-12 items-center gap-2 rounded-full border border-line px-5 text-sm font-medium text-ink hover:border-line-strong hover:bg-surface"
        >
          <ArrowLeft className="flip-rtl" />
          {t.nav.back}
        </button>
        {multi && (
          <>
            <button
              type="button"
              onClick={onNext}
              disabled={selected.length === 0}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t.nav.ok}
              <Check width={18} height={18} />
            </button>
            {selected.length > 0 && (
              <span className="hidden text-xs text-subtle sm:inline">{t.nav.pressEnter}</span>
            )}
          </>
        )}
      </div>
      <p className="mt-6 hidden text-xs text-subtle sm:block">{t.nav.keyHint}</p>
    </div>
  )
}

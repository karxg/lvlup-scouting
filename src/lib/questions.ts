import type { Answers } from './types'

export type QuestionId = keyof Answers
export type TermId =
  | 'mrr'
  | 'safe'
  | 'nondilutive'
  | 'preseed'
  | 'seed'
  | 'seriesa'
  | 'revshare'
  | 'followon'
  | 'incorporation'

export interface Question {
  id: QuestionId
  kind: 'single' | 'multi'
  options: string[]
  /** Multi-select only: maximum number of choices. */
  max?: number
  /** Glossary terms explained under the question (for terms that appear in option labels). */
  terms?: TermId[]
  /** Shown only when this returns true. Omitted means always shown. */
  when?: (a: Answers) => boolean
}

const isTech = (a: Answers) => a.business_type === 'tech' || a.business_type === 'b2b_saas'

export const QUESTIONS: Question[] = [
  { id: 'business_type', kind: 'single', options: ['tech', 'b2b_saas', 'ecom_tech', 'cpg', 'local'] },
  {
    id: 'tech_sector',
    kind: 'multi',
    options: ['ai', 'fintech', 'climate', 'hardware', 'gaming', 'healthtech', 'other'],
    when: isTech,
  },
  {
    id: 'stage',
    kind: 'single',
    options: ['idea', 'building', 'pre_seed', 'seed', 'series_a', 'growth'],
    terms: ['preseed', 'seed', 'seriesa'],
  },
  { id: 'incorporation', kind: 'single', options: ['us', 'non_us', 'none'] },
  { id: 'mrr', kind: 'single', options: ['zero', 'under_1k', '1k_10k', '10k_100k', '100k_plus'] },
  {
    id: 'need',
    kind: 'multi',
    max: 2,
    options: ['equity', 'non_dilutive', 'growth_marketing', 'ops_scale', 'mentorship'],
    terms: ['nondilutive'],
  },
  {
    id: 'amount',
    kind: 'single',
    options: ['under_10k', '10k_100k', '100k_250k', '250k_3_5m', 'over_3_5m', 'not_raising'],
  },
  {
    id: 'use_of_funds',
    kind: 'multi',
    options: ['equipment', 'working_capital', 'expansion', 'marketing', 'hiring', 'product'],
    when: (a) => a.business_type === 'local' || (a.need ?? []).includes('non_dilutive'),
  },
]

export const SECONDS_PER_QUESTION = 15

/** Questions on this founder's path given the answers so far. */
export function questionPath(answers: Answers): Question[] {
  return QUESTIONS.filter((q) => !q.when || q.when(answers))
}

/**
 * Estimated length before (or during) the flow. A branch whose deciding answer
 * hasn't been given yet is counted, so the estimate only ever shrinks.
 */
export function estimatedLength(answers: Answers): { questions: number; minutes: number } {
  const questions = QUESTIONS.filter((q) => {
    if (!q.when) return true
    if (q.id === 'tech_sector' && !answers.business_type) return true
    if (q.id === 'use_of_funds' && (!answers.business_type || !answers.need)) return true
    return q.when(answers)
  }).length
  return { questions, minutes: Math.max(1, Math.round((questions * SECONDS_PER_QUESTION) / 60)) }
}

export function isAnswered(q: Question, answers: Answers): boolean {
  const v = answers[q.id]
  return Array.isArray(v) ? v.length > 0 : v !== undefined
}

/** Drop answers to questions that are no longer on the path (e.g. after changing business type). */
export function pruneAnswers(answers: Answers): Answers {
  const onPath = new Set(questionPath(answers).map((q) => q.id))
  const out: Answers = {}
  for (const q of QUESTIONS) {
    if (onPath.has(q.id) && answers[q.id] !== undefined) {
      ;(out as Record<string, unknown>)[q.id] = answers[q.id]
    }
  }
  return out
}

export function isComplete(answers: Answers): boolean {
  return questionPath(answers).every((q) => isAnswered(q, answers))
}

/**
 * Compact, URL-safe encoding of answers: one slot per question in QUESTIONS order,
 * option indexes as digits, "_" for unanswered, slots joined by ".".
 * e.g. "1.05.3.0.3.1.4._"
 */
export function encodeAnswers(answers: Answers): string {
  return QUESTIONS.map((q) => {
    const v = answers[q.id]
    const vals = Array.isArray(v) ? v : v === undefined ? [] : [v]
    const idx = vals.map((x) => q.options.indexOf(x as string)).filter((i) => i >= 0)
    return idx.length ? idx.join('') : '_'
  }).join('.')
}

export function decodeAnswers(code: string | null | undefined): Answers | null {
  if (!code) return null
  const slots = code.split('.')
  if (slots.length !== QUESTIONS.length) return null
  const out: Record<string, unknown> = {}
  for (const [i, q] of QUESTIONS.entries()) {
    const slot = slots[i]
    if (slot === '_') continue
    if (!/^\d+$/.test(slot)) return null
    const vals = [...new Set([...slot].map((d) => q.options[Number(d)]))]
    if (vals.some((v) => v === undefined)) return null
    if (q.kind === 'single') {
      if (vals.length !== 1) return null
      out[q.id] = vals[0]
    } else {
      out[q.id] = q.max ? vals.slice(0, q.max) : vals
    }
  }
  const answers = pruneAnswers(out as Answers)
  return isComplete(answers) ? answers : null
}

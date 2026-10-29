import {
  AMOUNT_ORDER,
  FALLBACK_FUND_ID,
  FUNDS,
  MATCH_WEIGHTS as W,
  MRR_LOWER_BOUND,
  STAGE_ORDER,
  UNLOCK_MAX_GAPS,
} from '../data/funds'
import type { Amount, Answers, BusinessType, Fund, Need, Stage, TechSector, UseOfFunds } from './types'

/** Why a fund fits, as data. The UI turns these into sentences in the selected language. */
export type Reason =
  | { code: 'need'; needs: Need[] }
  | { code: 'amount'; amount: Amount }
  | { code: 'amount_partial'; amount: Amount }
  | { code: 'stage'; stage: Stage }
  | { code: 'sector'; sectors: TechSector[] }
  | { code: 'focus'; businessType: BusinessType }
  | { code: 'use_of_funds'; uses: UseOfFunds[] }
  | { code: 'mrr'; min: number }
  | { code: 'us_inc' }
  | { code: 'no_entity' }
  | { code: 'agnostic' }
  | { code: 'free' }
  | { code: 'alongside' }

/** Something a founder could change to become eligible. */
export type Gap = { code: 'mrr'; min: number } | { code: 'us_inc' } | { code: 'stage'; minStage: Stage }

export interface Eligibility {
  eligible: boolean
  /** Rules that fail but could be met later (more revenue, US entity, a later stage). */
  gaps: Gap[]
  /** True when a rule fails that can't be "unlocked" (wrong business type, past the stage window). */
  blocked: boolean
}

export interface FundMatch {
  fund: Fund
  /** 0–100, for display. */
  score: number
  /** Unclamped score, used for ranking. */
  raw: number
  reasons: Reason[]
}

export interface Unlock {
  fund: Fund
  gaps: Gap[]
}

export interface MatchResult {
  top: FundMatch
  alternatives: FundMatch[]
  unlocks: Unlock[]
  /** LvlUp Labs, shown at the bottom when it isn't already among the top results. */
  freeOption: FundMatch | null
  /** Nothing but the free option fits; the UI shows an encouraging message. */
  noMatch: boolean
}

const MAX_REASONS = 4
const MIN_REASONS = 2
const MAX_ALTERNATIVES = 2
const MAX_UNLOCKS = 2

const stageIndex = (s: Stage) => STAGE_ORDER.indexOf(s)

export function mrrLowerBound(answers: Answers): number {
  return answers.mrr ? MRR_LOWER_BOUND[answers.mrr] : 0
}

export function checkEligibility(fund: Fund, answers: Answers): Eligibility {
  const rules = fund.hardRules
  const gaps: Gap[] = []
  let blocked = false

  if (rules.businessTypes && (!answers.business_type || !rules.businessTypes.includes(answers.business_type))) {
    blocked = true
  }

  if (rules.stages) {
    const stage = answers.stage
    if (!stage) {
      blocked = true
    } else if (!rules.stages.includes(stage)) {
      const earliest = rules.stages.reduce((a, b) => (stageIndex(a) <= stageIndex(b) ? a : b))
      if (stageIndex(stage) < stageIndex(earliest)) gaps.push({ code: 'stage', minStage: earliest })
      else blocked = true
    }
  }

  if (rules.minMrr !== undefined && mrrLowerBound(answers) < rules.minMrr) {
    gaps.push({ code: 'mrr', min: rules.minMrr })
  }

  if (rules.requiresUsIncorporation && answers.incorporation !== 'us') {
    gaps.push({ code: 'us_inc' })
  }

  return { eligible: !blocked && gaps.length === 0, gaps, blocked }
}

function amountDistance(requested: Amount, offered: Amount[]): number {
  if (requested === 'not_raising') return 0
  const r = AMOUNT_ORDER.indexOf(requested)
  const distances = offered
    .filter((a): a is Exclude<Amount, 'not_raising'> => a !== 'not_raising')
    .map((a) => Math.abs(AMOUNT_ORDER.indexOf(a) - r))
  return distances.length ? Math.min(...distances) : Infinity
}

/** Score an eligible fund and collect the reasons that fired, strongest first. */
export function scoreFund(fund: Fund, answers: Answers): FundMatch {
  const s = fund.softSignals
  const weighted: { weight: number; reason: Reason }[] = []
  let raw = W.base + (s.baseAdjust ?? 0)

  // Need alignment
  const needs = answers.need ?? []
  if (s.needs && needs.length) {
    const matched = needs.filter((n) => s.needs!.includes(n))
    if (matched.length) {
      const w = W.needMatch + (matched.length > 1 ? W.needMatchExtra : 0)
      raw += w
      weighted.push({ weight: w, reason: { code: 'need', needs: matched } })
    } else {
      raw += W.needMiss
    }
  } else if (!s.needs && needs.length) {
    raw += W.needMiss
  }

  // Amount alignment
  const amount = answers.amount
  if (amount && amount !== 'not_raising' && s.amounts) {
    if (s.amounts.full.includes(amount)) {
      raw += W.amountInRange
      weighted.push({ weight: W.amountInRange, reason: { code: 'amount', amount } })
    } else if (s.amounts.partial?.includes(amount)) {
      raw += W.amountPartial
      weighted.push({ weight: W.amountPartial, reason: { code: 'amount_partial', amount } })
    } else if (amountDistance(amount, [...s.amounts.full, ...(s.amounts.partial ?? [])]) >= 2) {
      raw += W.amountFarMismatch
    }
  } else if (amount && amount !== 'not_raising' && !s.amounts) {
    // A program with no capital can't cover a capital request.
    raw += W.amountFarMismatch
  }

  // Sector match
  if (s.sectors && answers.tech_sector?.length) {
    const matched = answers.tech_sector.filter((t) => s.sectors!.includes(t))
    if (matched.length) {
      raw += W.sectorMatch
      weighted.push({ weight: W.sectorMatch, reason: { code: 'sector', sectors: matched } })
    }
  }

  // Built specifically for this business type
  if (s.focusBusinessTypes && answers.business_type && s.focusBusinessTypes.includes(answers.business_type)) {
    raw += W.focusMatch
    weighted.push({ weight: W.focusMatch, reason: { code: 'focus', businessType: answers.business_type } })
  }

  // Stage sweet spot
  if (s.sweetSpotStages && answers.stage && s.sweetSpotStages.includes(answers.stage)) {
    raw += W.stageSweetSpot
    weighted.push({ weight: W.stageSweetSpot, reason: { code: 'stage', stage: answers.stage } })
  }

  // Use of funds
  if (s.useOfFunds && answers.use_of_funds?.length) {
    const matched = answers.use_of_funds.filter((u) => s.useOfFunds!.includes(u))
    if (matched.length) {
      const w = W.useOfFundsMatch * Math.min(matched.length, W.useOfFundsMaxMatches)
      raw += w
      weighted.push({ weight: w, reason: { code: 'use_of_funds', uses: matched } })
    }
  }

  weighted.sort((a, b) => b.weight - a.weight)
  const reasons = weighted.map((w) => w.reason).slice(0, MAX_REASONS)

  // Requirements the founder meets are worth saying; weaker ones only fill a card up to two reasons.
  const { strong, weak } = eligibilityReasons(fund, answers)
  for (const r of strong) if (reasons.length < MAX_REASONS) reasons.push(r)
  for (const r of weak) if (reasons.length < MIN_REASONS) reasons.push(r)

  return { fund, raw, score: Math.max(0, Math.min(100, Math.round(raw))), reasons }
}

function eligibilityReasons(fund: Fund, answers: Answers): { strong: Reason[]; weak: Reason[] } {
  const strong: Reason[] = []
  const weak: Reason[] = []
  const rules = fund.hardRules
  if (fund.type === 'support') strong.push({ code: 'free' }, { code: 'alongside' })
  if (rules.minMrr !== undefined && rules.minMrr > 1) strong.push({ code: 'mrr', min: rules.minMrr })
  if (rules.requiresUsIncorporation) strong.push({ code: 'us_inc' })
  if (fund.id === 'first_check' && answers.incorporation === 'none') strong.push({ code: 'no_entity' })
  if (rules.stages && answers.stage && !fund.softSignals.sweetSpotStages?.includes(answers.stage)) {
    weak.push({ code: 'stage', stage: answers.stage })
  }
  if (!rules.businessTypes && fund.type !== 'support') weak.push({ code: 'agnostic' })
  return { strong, weak }
}

const byRank = (a: FundMatch, b: FundMatch) =>
  b.raw - a.raw || FUNDS.indexOf(a.fund) - FUNDS.indexOf(b.fund)

export function matchFunds(answers: Answers, funds: Fund[] = FUNDS): MatchResult {
  const fallback = funds.find((f) => f.id === FALLBACK_FUND_ID)
  if (!fallback) throw new Error(`Fund data must include the fallback fund "${FALLBACK_FUND_ID}"`)

  const eligible: FundMatch[] = []
  const nearMisses: { fund: Fund; gaps: Gap[]; raw: number }[] = []

  for (const fund of funds) {
    const e = checkEligibility(fund, answers)
    if (e.eligible) eligible.push(scoreFund(fund, answers))
    else if (!e.blocked && e.gaps.length <= UNLOCK_MAX_GAPS) {
      nearMisses.push({ fund, gaps: e.gaps, raw: scoreFund(fund, answers).raw })
    }
  }

  eligible.sort(byRank)
  const funded = eligible.filter((m) => m.fund.id !== FALLBACK_FUND_ID)
  const fallbackMatch = eligible.find((m) => m.fund.id === FALLBACK_FUND_ID) ?? scoreFund(fallback, answers)

  const unlocks = nearMisses
    .sort((a, b) => a.gaps.length - b.gaps.length || b.raw - a.raw)
    .slice(0, MAX_UNLOCKS)
    .map(({ fund, gaps }) => ({ fund, gaps }))

  if (funded.length === 0) {
    return { top: fallbackMatch, alternatives: [], unlocks, freeOption: null, noMatch: true }
  }

  // The free option only counts as a top result when it is a genuine fit (e.g. the founder asked for mentorship).
  const ranked = eligible.filter((m) => m.fund.id !== FALLBACK_FUND_ID || m.raw >= W.base)
  const [top, ...rest] = ranked
  const alternatives = rest.filter((m) => m.raw >= W.minAlternativeScore).slice(0, MAX_ALTERNATIVES)
  const shown = [top, ...alternatives]
  const freeOption = shown.some((m) => m.fund.id === FALLBACK_FUND_ID) ? null : fallbackMatch

  return { top, alternatives, unlocks, freeOption, noMatch: false }
}

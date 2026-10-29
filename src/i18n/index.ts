import type { Gap, Reason } from '../lib/match'
import type { Lang } from '../lib/types'
import { ar } from './ar'
import { en, type Messages } from './en'

export const MESSAGES: Record<Lang, Messages> = { en, ar }
export const LANGS: Lang[] = ['en', 'ar']

export type { Messages }

export function isLang(value: unknown): value is Lang {
  return value === 'en' || value === 'ar'
}

/** Compact USD, e.g. 10000 → "$10K", 3500000 → "$3.5M". Western digits in both languages. */
export function usd(n: number): string {
  if (n >= 1_000_000) return `$${trim(n / 1_000_000)}M`
  if (n >= 1_000) return `$${trim(n / 1_000)}K`
  return `$${n}`
}
const trim = (n: number) => String(Math.round(n * 10) / 10)

export function list(items: string[], lang: Lang): string {
  try {
    return new Intl.ListFormat(lang, { style: 'long', type: 'conjunction' }).format(items)
  } catch {
    return items.join(lang === 'ar' ? '، ' : ', ')
  }
}

/** Dollar amounts and ranges, e.g. "$10K", "$1,000 – $9,999", "$100,000+". */
const MONEY = /\$\d[\d.,]*[KM]?\+?(?:\s?[–-]\s?\$\d[\d.,]*[KM]?\+?)?/g

/**
 * Wrap dollar amounts in left-to-right isolates (U+2066…U+2069) so "$100K–$250K"
 * keeps its order inside Arabic sentences. Harmless in English.
 */
export function ltr(text: string): string {
  return text.replace(MONEY, (m) => `\u2066${m}\u2069`)
}

/** Isolate amounts only where it matters, keeping English copy free of invisible characters. */
export const bidi = (text: string, lang: Lang) => (lang === 'ar' ? ltr(text) : text)

/** Glossary markup: [[termId:visible text]]. */
export const TERM_PATTERN = /\[\[([a-z]+):([^\]]+)\]\]/g

/** Remove glossary markup for plain-text contexts (copy, share, meta). */
export function plain(text: string): string {
  return text.replace(TERM_PATTERN, '$2')
}

export function formatReason(r: Reason, lang: Lang): string {
  return bidi(reasonText(r, lang), lang)
}

function reasonText(r: Reason, lang: Lang): string {
  const m = MESSAGES[lang]
  const p = m.phrases
  switch (r.code) {
    case 'need':
      return m.reasons.need(list(r.needs.map((n) => p.need[n]), lang))
    case 'amount':
      return m.reasons.amount(p.amount[r.amount])
    case 'amount_partial':
      return m.reasons.amount_partial(p.amount[r.amount])
    case 'stage':
      return m.reasons.stage(p.stage[r.stage])
    case 'sector':
      return m.reasons.sector(list(r.sectors.map((s) => p.sector[s]), lang))
    case 'focus':
      return m.reasons.focus(p.businessType[r.businessType])
    case 'use_of_funds':
      return m.reasons.use_of_funds(list(r.uses.map((u) => p.useOfFunds[u]), lang))
    case 'mrr':
      return m.reasons.mrr(usd(r.min))
    case 'us_inc':
    case 'no_entity':
    case 'agnostic':
    case 'free':
    case 'alongside':
      return m.reasons[r.code]
  }
}

export function formatGap(g: Gap, lang: Lang): string {
  return bidi(capitalize(gapPhrase(g, lang)), lang)
}

function gapPhrase(g: Gap, lang: Lang): string {
  const m = MESSAGES[lang]
  switch (g.code) {
    case 'mrr':
      return g.min <= 1 ? m.gaps.firstSales : m.gaps.mrr(usd(g.min))
    case 'us_inc':
      return m.gaps.us_inc
    case 'stage':
      return m.gaps.stage(m.phrases.stage[g.minStage])
  }
}

/** e.g. "Reach $10K MRR to qualify for Tech Non-Dilutive Fund." */
export function formatUnlock(gaps: Gap[], fundName: string, lang: Lang): string {
  return bidi(capitalize(MESSAGES[lang].gaps.toQualify(list(gaps.map((g) => gapPhrase(g, lang)), lang), fundName)), lang)
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

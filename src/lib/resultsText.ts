import { DATA_LAST_UPDATED } from '../data/funds'
import { MESSAGES, bidi, formatReason, formatUnlock, plain } from '../i18n'
import { SITE_URL } from './env'
import type { MatchResult } from './match'
import { encodeAnswers, pruneAnswers } from './questions'
import type { Answers, Lang } from './types'

/** Absolute link that reopens these exact results, including the /lvlup/ subpath. */
export function shareUrl(answers: Answers, lang: Lang): string {
  const url = new URL(SITE_URL)
  url.searchParams.set('lang', lang)
  url.searchParams.set('a', encodeAnswers(pruneAnswers(answers)))
  return url.toString()
}

/** Plain-text summary for "Copy my results". */
export function resultsText(result: MatchResult, answers: Answers, lang: Lang): string {
  const t = MESSAGES[lang]
  const r = t.results
  const name = (m: MatchResult['top']) => bidi(`${m.fund.name} (${m.fund.rangeHeadline[lang]})`, lang)
  const lines: string[] = [r.copyHeader, '']

  lines.push(`${r.copyTop}: ${name(result.top)}`)
  lines.push(bidi(plain(result.top.fund.description[lang]), lang))
  lines.push(`${r.copyWhy}:`)
  for (const reason of result.top.reasons) lines.push(`• ${formatReason(reason, lang)}`)

  if (result.alternatives.length) {
    lines.push('', `${r.copyAlternatives}:`)
    for (const m of result.alternatives) lines.push(`• ${name(m)}`)
  }
  if (result.unlocks.length) {
    lines.push('', `${r.copyUnlock}:`)
    for (const u of result.unlocks) lines.push(`• ${formatUnlock(u.gaps, u.fund.name, lang)}`)
  }
  if (result.freeOption) lines.push('', `${r.copyFree}: ${result.freeOption.fund.name}`)

  lines.push('', `${r.copyLink}: ${shareUrl(answers, lang)}`)
  lines.push('', r.disclaimer, t.about.accuracy(DATA_LAST_UPDATED))
  return lines.join('\n')
}

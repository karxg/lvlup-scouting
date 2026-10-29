import { Fragment } from 'react'
import { TERM_PATTERN, ltr } from '../i18n'
import type { TermId } from '../lib/questions'
import { TermInfo } from './Term'

/** Renders copy with [[termId:text]] markup as text followed by an ⓘ glossary button. */
export function Rich({ text: raw }: { text: string }) {
  const text = ltr(raw)
  const parts: React.ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(TERM_PATTERN)) {
    const i = m.index ?? 0
    if (i > last) parts.push(text.slice(last, i))
    // Keep the ⓘ glued to the term's last word so it never wraps onto its own line.
    const words = m[2]
    const cut = words.lastIndexOf(' ') + 1
    const end = i + m[0].length
    const punct = /^[?.,!:;؟،؛]+/.exec(text.slice(end))?.[0] ?? ''
    parts.push(
      <Fragment key={i}>
        {words.slice(0, cut)}
        <span className="whitespace-nowrap">
          {words.slice(cut)}
          <TermInfo id={m[1] as TermId} />
          {punct}
        </span>
      </Fragment>,
    )
    last = end + punct.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return <>{parts}</>
}

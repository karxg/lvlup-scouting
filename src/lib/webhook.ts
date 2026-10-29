import { SUBMIT_WEBHOOK_URL } from './env'
import type { MatchResult } from './match'
import type { Answers, Lang } from './types'

export type HelpfulVote = 'up' | 'down'

export interface Contact {
  name: string
  email: string
  company: string
}

/** Stable per-browser-session id so a later helpful vote can be joined to a submission. */
function sessionId(): string {
  try {
    const existing = sessionStorage.getItem('fundmatch:sid')
    if (existing) return existing
    const id = crypto.randomUUID()
    sessionStorage.setItem('fundmatch:sid', id)
    return id
  } catch {
    return 'anonymous'
  }
}

export const webhookEnabled = () => SUBMIT_WEBHOOK_URL !== ''

/** POSTs only when SUBMIT_WEBHOOK_URL is configured; otherwise does nothing. */
export async function postToWebhook(payload: {
  type: 'submission' | 'helpful'
  lang: Lang
  answers: Answers
  result: MatchResult
  helpful?: HelpfulVote | null
  contact?: Contact
}): Promise<void> {
  if (!webhookEnabled()) return
  const { result, ...rest } = payload
  const res = await fetch(SUBMIT_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...rest,
      sessionId: sessionId(),
      submittedAt: new Date().toISOString(),
      match: {
        top: result.top.fund.id,
        alternatives: result.alternatives.map((m) => m.fund.id),
        unlocks: result.unlocks.map((u) => u.fund.id),
        noMatch: result.noMatch,
      },
    }),
  })
  if (!res.ok) throw new Error(`Webhook responded ${res.status}`)
}

import { useState, type FormEvent } from 'react'
import { useLang } from '../i18n/LangContext'
import { matchFunds } from '../lib/match'
import { pruneAnswers } from '../lib/questions'
import type { Answers } from '../lib/types'
import { postToWebhook } from '../lib/webhook'

/** Optional opt-in screen. Only exists when SUBMIT_WEBHOOK_URL is configured. */
export function SubmitScreen({ answers, onDone }: { answers: Answers; onDone: () => void }) {
  const { t, lang } = useLang()
  const s = t.submit
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const contact = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      company: String(data.get('company') ?? '').trim(),
    }
    if (!/^\S+@\S+\.\S+$/.test(contact.email)) {
      setError(s.invalidEmail)
      return
    }
    setSending(true)
    setError('')
    try {
      const pruned = pruneAnswers(answers)
      await postToWebhook({ type: 'submission', lang, answers: pruned, result: matchFunds(pruned), contact })
      onDone()
    } catch {
      setError(s.error)
      setSending(false)
    }
  }

  const field =
    'h-12 w-full rounded-xl border border-line bg-surface px-4 text-base text-ink placeholder:text-subtle focus:border-accent focus:outline-none'

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{s.title}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">{s.subtitle}</p>
      <form onSubmit={onSubmit} noValidate className="mt-7 grid gap-4">
        {(
          [
            ['name', s.name, 'text', 'name'],
            ['email', s.email, 'email', 'email'],
            ['company', s.company, 'text', 'organization'],
          ] as const
        ).map(([name, label, type, autoComplete]) => (
          <label key={name} className="grid gap-1.5 text-sm font-medium">
            {label}
            <input name={name} type={type} autoComplete={autoComplete} required={name === 'email'} className={field} />
          </label>
        ))}
        <p aria-live="polite" className="min-h-5 text-sm text-accent">
          {error}
        </p>
        <button
          type="submit"
          disabled={sending}
          className="h-12 rounded-full bg-accent px-6 text-sm font-semibold text-bg hover:opacity-90 disabled:opacity-60"
        >
          {sending ? s.sending : s.send}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="h-12 rounded-full border border-line px-6 text-sm font-medium hover:bg-surface"
        >
          {s.skip}
        </button>
      </form>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useLang } from '../i18n/LangContext'
import { Check } from './Icons'

export const MATCHING_MS = 1200

export function Matching({ onDone }: { onDone: () => void }) {
  const { t } = useLang()
  const steps = t.matching.steps
  const [step, setStep] = useState(0)

  useEffect(() => {
    const each = MATCHING_MS / steps.length
    const tick = window.setInterval(() => setStep((s) => Math.min(s + 1, steps.length)), each)
    const done = window.setTimeout(onDone, MATCHING_MS)
    return () => {
      window.clearInterval(tick)
      window.clearTimeout(done)
    }
  }, [onDone, steps.length])

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-12 sm:px-8">
      <h1 className="text-[clamp(1.75rem,5vw,2.5rem)] leading-tight">{t.matching.title}</h1>
      <ol className="mt-6 border-t border-ink" aria-live="polite">
        {steps.map((label, i) => {
          const done = i < step
          return (
            <li
              key={label}
              className={`flex min-h-12 items-center justify-between gap-4 border-b border-rule transition-colors duration-200 ${
                done ? 'text-ink' : i === step ? 'text-ink-2' : 'text-ink-3'
              }`}
            >
              {label}
              <Check width={18} height={18} className={`text-accent transition-opacity duration-150 ${done ? 'opacity-100' : 'opacity-0'}`} />
            </li>
          )
        })}
      </ol>
    </div>
  )
}

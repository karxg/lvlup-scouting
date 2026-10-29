import { m, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLang } from '../i18n/LangContext'

export const MATCHING_MS = 1200

export function Matching({ onDone }: { onDone: () => void }) {
  const { t } = useLang()
  const reduce = useReducedMotion()
  const [step, setStep] = useState(0)

  useEffect(() => {
    const each = MATCHING_MS / t.matching.steps.length
    const tick = window.setInterval(() => setStep((s) => Math.min(s + 1, t.matching.steps.length - 1)), each)
    const done = window.setTimeout(onDone, MATCHING_MS)
    return () => {
      window.clearInterval(tick)
      window.clearTimeout(done)
    }
  }, [onDone, t.matching.steps.length])

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
      <div className="relative h-20 w-20" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <m.span
            key={i}
            className="absolute inset-0 rounded-full border border-accent"
            initial={{ scale: 0.4, opacity: 0.9 }}
            animate={reduce ? { opacity: 0.6 } : { scale: 1.4, opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
          />
        ))}
        <span className="absolute inset-[30%] rounded-full bg-accent shadow-[0_0_30px_rgba(192,132,252,0.8)]" />
      </div>
      <h1 className="mt-8 text-2xl font-semibold tracking-tight">{t.matching.title}</h1>
      <p className="mt-2 h-6 text-muted" aria-live="polite">
        {t.matching.steps[step]}
      </p>
    </div>
  )
}

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLang } from '../i18n/LangContext'
import type { TermId } from '../lib/questions'
import { Info } from './Icons'

const GUTTER = 16
const WIDTH = 280

/** An ⓘ button that explains a glossary term. Tap/click/Enter toggles, hover previews, Escape closes. */
export function TermInfo({ id, className = '' }: { id: TermId; className?: string }) {
  const { t } = useLang()
  const entry = t.glossary.terms[id]
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number; container: Element } | null>(null)
  const btn = useRef<HTMLButtonElement>(null)
  const pinned = useRef(false)
  const popId = useId()

  const place = useCallback(() => {
    const el = btn.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const width = Math.min(WIDTH, window.innerWidth - GUTTER * 2)
    const center = r.left + r.width / 2
    const left = Math.max(GUTTER, Math.min(center - width / 2, window.innerWidth - width - GUTTER))
    setPos({ top: r.bottom + 8, left, container: el.closest('dialog') ?? document.body })
  }, [])

  useLayoutEffect(() => {
    if (open) place()
  }, [open, place])

  useEffect(() => {
    if (!open) return
    const close = () => {
      pinned.current = false
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        close()
        btn.current?.focus()
      }
    }
    const onDown = (e: PointerEvent) => {
      if (!btn.current?.contains(e.target as Node)) close()
    }
    window.addEventListener('keydown', onKey, true)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [open, place])

  return (
    <>
      <button
        ref={btn}
        type="button"
        aria-label={t.glossary.open(entry.term)}
        aria-expanded={open}
        aria-controls={open ? popId : undefined}
        aria-describedby={open ? popId : undefined}
        onClick={(e) => {
          e.stopPropagation()
          pinned.current = !open
          setOpen(!open)
        }}
        onKeyDown={(e) => e.stopPropagation()}
        onMouseEnter={(e) => {
          if (e.nativeEvent instanceof PointerEvent && e.nativeEvent.pointerType !== 'mouse') return
          setOpen(true)
        }}
        onMouseLeave={() => {
          if (!pinned.current) setOpen(false)
        }}
        className={`relative ms-0.5 inline-flex h-6 w-5 shrink-0 translate-y-[-1px] items-center justify-center rounded-full align-middle text-accent/80 transition-colors before:absolute before:-inset-2.5 before:content-[''] hover:text-accent ${className}`}
      >
        <Info />
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            id={popId}
            role="tooltip"
            style={{ top: pos.top, left: pos.left, width: Math.min(WIDTH, window.innerWidth - GUTTER * 2) }}
            className="fixed z-[100] rounded-xl border border-line-strong bg-surface-2 p-3 text-start text-sm leading-relaxed font-normal text-ink shadow-2xl shadow-black/60"
          >
            <span className="mb-1 block font-semibold text-accent">{entry.term}</span>
            {entry.def}
          </div>,
          pos.container,
        )}
    </>
  )
}

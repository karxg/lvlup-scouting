import { useEffect, useRef, type ReactNode } from 'react'
import { useLang } from '../i18n/LangContext'
import { Close } from './Icons'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** "sheet" docks to the bottom on small screens. */
  variant?: 'modal' | 'sheet'
}

/**
 * Native <dialog>: focus trapping, Escape and inert background come from the browser.
 * Focus returns to the opener on close.
 */
export function Dialog({ open, onClose, title, children, variant = 'modal' }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const { t } = useLang()

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) {
      const opener = document.activeElement as HTMLElement | null
      d.showModal()
      return () => opener?.focus?.()
    }
    if (!open && d.open) d.close()
  }, [open])

  const sheet = variant === 'sheet'
  return (
    <dialog
      ref={ref}
      aria-labelledby="dialog-title"
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
      className={
        sheet
          ? 'm-0 mt-auto w-full max-w-none border-0 bg-transparent p-0 sm:m-auto sm:max-w-md'
          : 'm-auto w-[calc(100%-32px)] max-w-lg border-0 bg-transparent p-0'
      }
    >
      {open && (
        <div
          className={`border border-ink bg-paper text-start ${
            sheet ? 'border-x-0 border-b-0 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:border' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-4 border-b border-rule ps-5 pe-2">
            <h2 id="dialog-title" className="py-3 text-xl leading-tight">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.about.close}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center text-ink-2 hover:text-ink"
            >
              <Close />
            </button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      )}
    </dialog>
  )
}

import { useEffect, useRef, type ReactNode } from 'react'
import { useLang } from '../i18n/LangContext'
import { Close } from './Icons'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** "sheet" slides up from the bottom on small screens. */
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
          className={`border border-line bg-surface p-6 text-start shadow-2xl shadow-black/60 ${
            sheet ? 'rounded-t-3xl pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:rounded-3xl' : 'rounded-3xl'
          }`}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 id="dialog-title" className="text-xl font-semibold tracking-tight">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.about.close}
              className="-m-2 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-ink"
            >
              <Close />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}

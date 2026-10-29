import { APPLY_URL } from '../data/funds'
import { useLang } from '../i18n/LangContext'
import { Dialog } from './Dialog'
import { ExternalLink } from './Icons'

export function LeaveDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLang()
  return (
    <Dialog open={open} onClose={onClose} title={t.leave.title} variant="sheet">
      <p className="text-[15px] leading-relaxed text-muted">{t.leave.body}</p>
      <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
        <a
          href={APPLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-bg hover:opacity-90"
        >
          {t.leave.continue}
          <ExternalLink width={16} height={16} />
        </a>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-12 items-center justify-center rounded-full border border-line px-5 text-sm font-medium hover:bg-surface-2 sm:order-first"
        >
          {t.leave.cancel}
        </button>
      </div>
    </Dialog>
  )
}

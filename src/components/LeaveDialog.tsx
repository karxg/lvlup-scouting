import { APPLY_URL } from '../data/funds'
import { useLang } from '../i18n/LangContext'
import { Dialog } from './Dialog'
import { ExternalLink } from './Icons'

export function LeaveDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLang()
  return (
    <Dialog open={open} onClose={onClose} title={t.leave.title} variant="sheet">
      <p className="text-[15px] leading-relaxed text-ink-2">{t.leave.body}</p>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <a href={APPLY_URL} target="_blank" rel="noopener noreferrer" onClick={onClose} className="btn btn-primary">
          {t.leave.continue}
          <ExternalLink width={16} height={16} />
        </a>
        <button type="button" onClick={onClose} className="btn btn-secondary sm:order-first">
          {t.leave.cancel}
        </button>
      </div>
    </Dialog>
  )
}

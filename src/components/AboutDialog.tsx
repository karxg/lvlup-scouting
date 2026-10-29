import { DATA_LAST_UPDATED } from '../data/funds'
import { useLang } from '../i18n/LangContext'
import { Dialog } from './Dialog'

export function AboutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLang()
  const a = t.about
  const sections: [string, string][] = [
    [a.whatTitle, a.what],
    [a.notTitle, a.not],
    [a.accuracyTitle, a.accuracy(DATA_LAST_UPDATED)],
    [a.privacyTitle, a.privacy],
  ]
  return (
    <Dialog open={open} onClose={onClose} title={a.title}>
      <div className="max-h-[65dvh] space-y-4 overflow-y-auto text-[15px] leading-relaxed">
        {sections.map(([title, body]) => (
          <section key={title}>
            <h3 className="mb-1 text-sm font-semibold text-accent">{title}</h3>
            <p className="text-muted">{body}</p>
          </section>
        ))}
        <p className="border-t border-line pt-4 text-sm font-medium text-ink">{a.advice}</p>
      </div>
    </Dialog>
  )
}

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
      <dl className="max-h-[65dvh] divide-y divide-rule overflow-y-auto text-[15px] leading-relaxed">
        {sections.map(([title, body]) => (
          <div key={title} className="py-3 first:pt-0">
            <dt className="font-semibold text-ink">{title}</dt>
            <dd className="mt-0.5 text-ink-2">{body}</dd>
          </div>
        ))}
        <div className="py-3 last:pb-0">
          <dd className="font-medium text-ink">{a.advice}</dd>
        </div>
      </dl>
    </Dialog>
  )
}

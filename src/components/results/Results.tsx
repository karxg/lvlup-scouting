import { useMemo, useRef, useState } from 'react'
import { Link } from 'wouter'
import { formatGap, formatReason, formatUnlock, ltr } from '../../i18n'
import { useLang } from '../../i18n/LangContext'
import { copyText } from '../../lib/clipboard'
import { matchFunds, type FundMatch } from '../../lib/match'
import { encodeAnswers, pruneAnswers } from '../../lib/questions'
import { resultsText, shareUrl } from '../../lib/resultsText'
import { KEYS, storage } from '../../lib/storage'
import type { Answers } from '../../lib/types'
import { postToWebhook, type HelpfulVote } from '../../lib/webhook'
import { Checklist, FundFacts, FundTitle, RangeHeadline, ReasonList } from '../FundDetails'
import { ArrowLeft, ArrowRight, Copy, Download, ExternalLink, Refresh, Share } from '../Icons'
import { LeaveDialog } from '../LeaveDialog'
import { ShareImage } from './ShareImage'

interface Props {
  answers: Answers
  onBack: () => void
  onRetake: () => void
}

export function Results({ answers, onBack, onRetake }: Props) {
  const { t, lang } = useLang()
  const r = t.results
  const pruned = useMemo(() => pruneAnswers(answers), [answers])
  const result = useMemo(() => matchFunds(pruned), [pruned])
  const [leaving, setLeaving] = useState(false)

  const fitLabel = (m: FundMatch) =>
    m.score >= 80 ? r.fit.strong : m.score >= 55 ? r.fit.good : r.fit.possible

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex h-12 items-center gap-2 rounded-full border border-line px-5 text-sm font-medium hover:border-line-strong hover:bg-surface"
      >
        <ArrowLeft className="flip-rtl" />
        {t.nav.back}
      </button>

      {result.noMatch && (
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{r.noMatchTitle}</h1>
          <p className="mt-3 text-base leading-relaxed text-muted">{r.noMatchBody}</p>
        </div>
      )}

      {/* Hero */}
      <article
        aria-labelledby="top-match"
        className="relative overflow-hidden rounded-3xl border border-accent/40 bg-surface p-6 shadow-[0_0_80px_-20px_rgba(192,132,252,0.35)] sm:p-9"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 h-64 w-64 rounded-full bg-accent/20 blur-3xl ltr:-right-24 rtl:-left-24"
        />
        <div className="relative">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-accent">{result.noMatch ? r.noMatchEyebrow : r.eyebrow}</p>
            {!result.noMatch && (
              <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                {fitLabel(result.top)}
              </span>
            )}
          </div>
          <div id="top-match">
            <FundTitle fund={result.top.fund} as={result.noMatch ? 'h2' : 'h1'} size="lg" />
          </div>
          <RangeHeadline fund={result.top.fund} className="mt-6 text-[clamp(2.4rem,11vw,3.75rem)] leading-none" />

          <h2 className="mt-8 mb-3 text-base font-semibold">{r.whyFits}</h2>
          <ReasonList items={result.top.reasons.map((x) => formatReason(x, lang))} />

          <div className="mt-8 border-t border-line pt-6">
            <FundFacts fund={result.top.fund} />
          </div>
          <div className="mt-6 border-t border-line pt-6">
            <Checklist fund={result.top.fund} />
          </div>
        </div>
      </article>

      {/* Alternatives */}
      {result.alternatives.length > 0 && (
        <section aria-labelledby="alts" className="mt-10">
          <h2 id="alts" className="mb-4 text-lg font-semibold">
            {r.alternatives}
          </h2>
          <div className="grid gap-4">
            {result.alternatives.map((m) => (
              <SmallFundCard key={m.fund.id} match={m} chip={fitLabel(m)} />
            ))}
          </div>
        </section>
      )}

      {/* Unlock */}
      {result.unlocks.length > 0 && (
        <section aria-labelledby="unlock" className="mt-10">
          <h2 id="unlock" className="text-lg font-semibold">
            {r.unlockTitle}
          </h2>
          <p className="mt-1 mb-4 text-sm text-muted">{r.unlockSubtitle}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {result.unlocks.map((u) => (
              <div key={u.fund.id} className="rounded-[var(--radius-card)] border border-dashed border-line-strong bg-surface/60 p-5">
                <h3 lang="en" dir="ltr" className="font-sans font-semibold rtl:text-right">
                  {u.fund.name}
                </h3>
                <p className="mt-1 text-sm text-accent tabular-nums">{ltr(u.fund.rangeHeadline[lang])}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {u.gaps.map((g) => (
                    <li key={g.code} className="rounded-full border border-line bg-bg px-3 py-1 text-xs text-ink">
                      {formatGap(g, lang)}
                    </li>
                  ))}
                </ul>
                <p className="sr-only">{formatUnlock(u.gaps, u.fund.name, lang)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Free fallback */}
      {result.freeOption && (
        <section aria-labelledby="free" className="mt-10">
          <h2 id="free" className="mb-4 text-lg font-semibold">
            {r.freeTitle}
          </h2>
          <SmallFundCard match={result.freeOption} />
        </section>
      )}

      <p className="mt-10 text-sm text-muted">{r.demoDays}</p>

      {/* Disclaimer sits above every call to action. */}
      <p role="note" className="mt-6 rounded-[var(--radius-card)] border border-line bg-surface p-4 text-sm leading-relaxed text-muted">
        {r.disclaimer}
      </p>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setLeaving(true)}
          className="inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-accent px-8 text-base font-semibold text-bg shadow-[0_8px_30px_rgba(192,132,252,0.25)] hover:opacity-90 sm:w-auto"
        >
          {r.apply}
          <ExternalLink width={18} height={18} />
        </button>
        <SecondaryActions answers={pruned} result={result} onRetake={onRetake} />
      </div>

      <Helpful answers={pruned} result={result} />

      <Link
        href="/funds"
        className="mt-8 inline-flex min-h-12 items-center gap-2 text-sm font-medium text-accent underline-offset-4 hover:underline"
      >
        {r.browse}
        <ArrowRight width={16} height={16} className="flip-rtl" />
      </Link>

      <LeaveDialog open={leaving} onClose={() => setLeaving(false)} />
    </div>
  )
}

function SmallFundCard({ match, chip }: { match: FundMatch; chip?: string }) {
  const { t, lang } = useLang()
  const f = match.fund
  return (
    <article className="rounded-[var(--radius-card)] border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <FundTitle fund={f} />
        </div>
        <div className="flex shrink-0 items-baseline gap-3 sm:flex-col sm:items-end sm:gap-1">
          <RangeHeadline fund={f} className="text-2xl" />
          {chip && <span className="text-xs text-muted">{chip}</span>}
        </div>
      </div>
      <div className="mt-4">
        <ReasonList items={match.reasons.slice(0, 3).map((x) => formatReason(x, lang))} />
      </div>
      <details className="group mt-4 border-t border-line pt-3">
        <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 text-sm font-medium text-accent [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">{t.results.showChecklist}</span>
          <span className="hidden group-open:inline">{t.results.hideChecklist}</span>
        </summary>
        <div className="space-y-5 pt-2 pb-1">
          <FundFacts fund={f} />
          <Checklist fund={f} />
        </div>
      </details>
    </article>
  )
}

function SecondaryActions({
  answers,
  result,
  onRetake,
}: {
  answers: Answers
  result: ReturnType<typeof matchFunds>
  onRetake: () => void
}) {
  const { t, lang } = useLang()
  const r = t.results
  const [status, setStatus] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)
  const [renderImage, setRenderImage] = useState(false)

  const flash = (msg: string) => {
    setStatus(msg)
    window.setTimeout(() => setStatus(''), 2500)
  }

  async function onCopy() {
    if (await copyText(resultsText(result, answers, lang))) flash(r.copied)
  }

  async function onShare() {
    const url = shareUrl(answers, lang)
    if (navigator.share) {
      try {
        await navigator.share({ title: r.shareTitle, text: r.shareText(result.top.fund.name), url })
        return
      } catch (e) {
        if ((e as DOMException).name === 'AbortError') return
      }
    }
    if (await copyText(url)) flash(r.linkCopied)
  }

  async function onSaveImage() {
    setSaving(true)
    setRenderImage(true)
    try {
      // Wait for the off-screen card to mount and fonts to be ready.
      await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)))
      await document.fonts.ready
      const node = imageRef.current
      if (!node) throw new Error('image node missing')
      const { toPng } = await import('html-to-image')
      const opts = { width: 1080, height: 1350, pixelRatio: 1, backgroundColor: '#0B0B0F', cacheBust: true }
      await toPng(node, opts) // first pass warms up font embedding (Safari)
      const dataUrl = await toPng(node, opts)
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `fund-match-${result.top.fund.id}-${lang}.png`
      a.click()
    } catch {
      flash(r.imageError)
    } finally {
      setSaving(false)
      setRenderImage(false)
    }
  }

  const btn =
    'inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line px-4 text-sm font-medium text-ink hover:border-line-strong hover:bg-surface disabled:opacity-60'

  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap">
        <button type="button" onClick={onCopy} className={btn}>
          <Copy width={18} height={18} />
          {r.copy}
        </button>
        <button type="button" onClick={onShare} className={btn}>
          <Share width={18} height={18} />
          {r.share}
        </button>
        <button type="button" onClick={onSaveImage} disabled={saving} className={btn}>
          <Download width={18} height={18} />
          {saving ? r.savingImage : r.saveImage}
        </button>
        <button type="button" onClick={onRetake} className={btn}>
          <Refresh width={18} height={18} />
          {r.retake}
        </button>
      </div>
      <p aria-live="polite" className="mt-2 h-5 text-sm text-accent">
        {status}
      </p>
      {renderImage && (
        <div aria-hidden="true" style={{ position: 'fixed', top: 0, left: -20000, pointerEvents: 'none' }}>
          <ShareImage ref={imageRef} match={result.top} lang={lang} />
        </div>
      )}
    </>
  )
}

function Helpful({ answers, result }: { answers: Answers; result: ReturnType<typeof matchFunds> }) {
  const { t, lang } = useLang()
  const r = t.results
  const key = `${KEYS.helpful}:${encodeAnswers(answers)}`
  const [vote, setVote] = useState<HelpfulVote | null>(() => storage.get<HelpfulVote>(key))

  function cast(v: HelpfulVote) {
    setVote(v)
    storage.set(key, v)
    postToWebhook({ type: 'helpful', lang, answers, result, helpful: v }).catch(() => {})
  }

  return (
    <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-6">
      <p className="text-sm font-medium" id="helpful-label">
        {r.helpful}
      </p>
      <div role="group" aria-labelledby="helpful-label" className="flex gap-2">
        {(
          [
            ['up', '👍', r.helpfulYes],
            ['down', '👎', r.helpfulNo],
          ] as const
        ).map(([v, emoji, label]) => (
          <button
            key={v}
            type="button"
            aria-label={label}
            aria-pressed={vote === v}
            onClick={() => cast(v)}
            className={`inline-flex h-12 w-12 items-center justify-center rounded-full border text-lg transition-colors ${
              vote === v ? 'border-accent bg-accent-soft' : 'border-line hover:bg-surface'
            }`}
          >
            <span aria-hidden="true">{emoji}</span>
          </button>
        ))}
      </div>
      <p aria-live="polite" className="text-sm text-muted">
        {vote ? r.helpfulThanks : ''}
      </p>
    </div>
  )
}

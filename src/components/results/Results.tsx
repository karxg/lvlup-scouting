import { useMemo, useRef, useState } from 'react'
import { Link } from 'wouter'
import { formatGap, formatReason, formatUnlock, ltr } from '../../i18n'
import { useLang } from '../../i18n/LangContext'
import { copyText } from '../../lib/clipboard'
import { matchFunds, type FundMatch, type MatchResult } from '../../lib/match'
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

  const fitLabel = (m: FundMatch) => (m.score >= 80 ? r.fit.strong : m.score >= 55 ? r.fit.good : r.fit.possible)
  const top = result.top

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 sm:py-10">
      <button type="button" onClick={onBack} className="link text-[15px]">
        <ArrowLeft className="flip-rtl" width={18} height={18} />
        {t.nav.back}
      </button>

      {result.noMatch && (
        <div className="mt-6 max-w-2xl">
          <h1 className="text-[clamp(1.6rem,4.5vw,2.25rem)] leading-tight text-balance">{r.noMatchTitle}</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-ink-2">{r.noMatchBody}</p>
        </div>
      )}

      {/* The match, set like the first page of a memo. */}
      <article aria-labelledby="top-match" className="mt-6 border-t-2 border-ink pt-5">
        <p className="text-sm text-ink-3">
          {result.noMatch ? r.noMatchEyebrow : r.eyebrow}
          {!result.noMatch && (
            <>
              <span aria-hidden="true"> · </span>
              <span className="font-medium text-ink">{fitLabel(top)}</span>
            </>
          )}
        </p>
        <div id="top-match" className="mt-3">
          <FundTitle fund={top.fund} as={result.noMatch ? 'h2' : 'h1'} size="lg" />
        </div>
        <RangeHeadline fund={top.fund} className="mt-5 text-[clamp(2.4rem,9vw,3.5rem)] leading-none tracking-[-0.02em]" />

        <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-10">
          <section aria-labelledby="why">
            <h2 id="why" className="border-b border-ink pb-2 text-xl">
              {r.whyFits}
            </h2>
            <ReasonList items={top.reasons.map((x) => formatReason(x, lang))} />
          </section>
          <section aria-label={top.fund.name}>
            <FundFacts fund={top.fund} />
          </section>
        </div>
        <div className="mt-8 max-w-xl">
          <Checklist fund={top.fund} as="h2" />
        </div>
      </article>

      {result.alternatives.length > 0 && (
        <Section id="alts" title={r.alternatives}>
          {result.alternatives.map((m) => (
            <FundRow key={m.fund.id} match={m} note={fitLabel(m)} />
          ))}
        </Section>
      )}

      {result.unlocks.length > 0 && (
        <Section id="unlock" title={r.unlockTitle} subtitle={r.unlockSubtitle}>
          {result.unlocks.map((u) => (
            <div key={u.fund.id} className="grid gap-1 border-b border-rule py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-6">
              <div className="min-w-0">
                <h3 lang="en" dir="ltr" className="text-[19px] leading-tight rtl:text-right">
                  {u.fund.name}
                </h3>
                <p className="mt-1 text-[15px] text-ink-2">{u.gaps.map((g) => formatGap(g, lang)).join(' · ')}</p>
                <p className="sr-only">{formatUnlock(u.gaps, u.fund.name, lang)}</p>
              </div>
              <p className="font-[family-name:var(--font-display)] text-[19px] text-ink-2 [font-variant-numeric:lining-nums] sm:text-end">{ltr(u.fund.rangeHeadline[lang])}</p>
            </div>
          ))}
        </Section>
      )}

      {result.freeOption && (
        <Section id="free" title={r.freeTitle}>
          <FundRow match={result.freeOption} />
        </Section>
      )}

      <div className="mt-12 max-w-2xl">
        <p className="text-[15px] text-ink-2">{r.demoDays}</p>

        {/* The disclaimer sits above every call to action. */}
        <p role="note" className="mt-5 border border-rule-strong p-4 text-sm leading-relaxed text-ink-2">
          {r.disclaimer}
        </p>

        <button type="button" onClick={() => setLeaving(true)} className="btn btn-primary mt-5 min-h-14 w-full px-7 text-base sm:w-auto">
          {r.apply}
          <ExternalLink width={18} height={18} />
        </button>
        <SecondaryActions answers={pruned} result={result} onRetake={onRetake} />
        <Helpful answers={pruned} result={result} />

        <Link href="/funds" className="link mt-4 text-[15px]">
          {r.browse}
          <ArrowRight width={16} height={16} className="flip-rtl" />
        </Link>
      </div>

      <LeaveDialog open={leaving} onClose={() => setLeaving(false)} />
    </div>
  )
}

function Section({ id, title, subtitle, children }: { id: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-14">
      <h2 id={id} className="border-b border-ink pb-2 text-2xl">
        {title}
      </h2>
      {subtitle && <p className="mt-2 text-[15px] text-ink-2">{subtitle}</p>}
      {children}
    </section>
  )
}

/** A fund as one ruled row: title and reasons on the start side, amount on the end side, details on demand. */
function FundRow({ match, note }: { match: FundMatch; note?: string }) {
  const { t, lang } = useLang()
  const f = match.fund
  return (
    <article className="border-b border-rule py-5">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-8">
        <FundTitle fund={f} />
        <div className="flex items-baseline gap-3 sm:flex-col sm:items-end sm:gap-1">
          <RangeHeadline fund={f} className="text-[26px] leading-none" />
          {note && <span className="text-[13px] text-ink-3">{note}</span>}
        </div>
      </div>
      <div className="mt-3 max-w-2xl">
        <ReasonList items={match.reasons.slice(0, 3).map((x) => formatReason(x, lang))} />
      </div>
      <details className="group mt-1">
        <summary className="link cursor-pointer list-none text-[15px] [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">{t.results.showChecklist}</span>
          <span className="hidden group-open:inline">{t.results.hideChecklist}</span>
        </summary>
        <div className="grid gap-6 pt-2 pb-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-10">
          <FundFacts fund={f} />
          <Checklist fund={f} as="h4" />
        </div>
      </details>
    </article>
  )
}

function SecondaryActions({ answers, result, onRetake }: { answers: Answers; result: MatchResult; onRetake: () => void }) {
  const { t, lang } = useLang()
  const r = t.results
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [renderImage, setRenderImage] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

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
      const paper = getComputedStyle(document.documentElement).getPropertyValue('--color-paper').trim()
      const opts = { width: 1080, height: 1350, pixelRatio: 1, backgroundColor: paper, cacheBust: true }
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

  return (
    <>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <button type="button" onClick={onCopy} className="btn btn-secondary px-3">
          <Copy width={17} height={17} />
          {r.copy}
        </button>
        <button type="button" onClick={onShare} className="btn btn-secondary px-3">
          <Share width={17} height={17} />
          {r.share}
        </button>
        <button type="button" onClick={onSaveImage} disabled={saving} className="btn btn-secondary px-3">
          <Download width={17} height={17} />
          {saving ? r.savingImage : r.saveImage}
        </button>
        <button type="button" onClick={onRetake} className="btn btn-secondary px-3">
          <Refresh width={17} height={17} />
          {r.retake}
        </button>
      </div>
      <p aria-live="polite" className="mt-2 min-h-5 text-sm text-ink">
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

function Helpful({ answers, result }: { answers: Answers; result: MatchResult }) {
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
    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-rule pt-4">
      <p className="text-[15px] font-medium" id="helpful-label">
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
            className={`inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-sm)] border text-lg transition-colors ${
              vote === v ? 'border-ink bg-paper-3' : 'border-rule-strong hover:bg-paper-2'
            }`}
          >
            <span aria-hidden="true">{emoji}</span>
          </button>
        ))}
      </div>
      <p aria-live="polite" className="text-sm text-ink-2">
        {vote ? r.helpfulThanks : ''}
      </p>
    </div>
  )
}

import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { Matching } from '../components/Matching'
import { LanguageChoice } from '../components/LanguageChoice'
import { ProgressBar } from '../components/ProgressBar'
import { QuestionScreen } from '../components/QuestionScreen'
import { Results } from '../components/results/Results'
import { Shell } from '../components/Shell'
import { SubmitScreen } from '../components/SubmitScreen'
import { Welcome } from '../components/Welcome'
import { plain } from '../i18n'
import { useLang } from '../i18n/LangContext'
import { useQuiz } from '../hooks/useQuiz'
import { questionPath } from '../lib/questions'
import { webhookEnabled } from '../lib/webhook'

const variants: Variants = {
  enter: (d: number) => ({ x: d * 48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d * -48, opacity: 0 }),
}

export function Home() {
  const { t, chosen } = useLang()
  const reduce = useReducedMotion()
  const quiz = useQuiz(chosen, webhookEnabled())
  const { state } = quiz
  const path = questionPath(state.answers)
  const step = Math.min(state.step, path.length - 1)
  const question = path[step]
  const rtl = t.dir === 'rtl'

  // Direction-aware slide, mirrored in RTL; fade only when reduced motion is requested.
  const d = reduce ? 0 : state.dir * (rtl ? -1 : 1)

  const key = state.screen === 'question' ? `q-${question.id}` : state.screen

  // Announce each new question to screen readers.
  const announce =
    state.screen === 'question'
      ? `${t.nav.progress(step + 1, path.length)}. ${plain(t.questions[question.id].title)}`
      : state.screen === 'matching'
        ? t.matching.title
        : ''

  // Move to the top on every screen change (long results pages, mobile).
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [key])

  const progress =
    state.screen === 'question' ? step / path.length : state.screen === 'welcome' || state.screen === 'lang' ? 0 : 1
  const showBar = state.screen === 'question' || state.screen === 'matching'

  return (
    <Shell
      hideLangToggle={state.screen === 'lang'}
      top={showBar ? <ProgressBar value={progress} current={step + 1} total={path.length} /> : null}
    >
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announce}
      </p>
      <AnimatePresence mode="wait" custom={d} initial={false}>
        <motion.div
          key={key}
          custom={d}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: reduce ? 0.15 : 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-1 flex-col"
        >
          {state.screen === 'lang' && <LanguageChoice onChosen={quiz.chooseLang} />}
          {state.screen === 'welcome' && <Welcome answers={state.answers} onStart={quiz.start} />}
          {state.screen === 'question' && (
            <QuestionScreen
              question={question}
              answers={state.answers}
              index={step}
              total={path.length}
              onChange={quiz.setAnswers}
              onNext={quiz.next}
              onBack={quiz.back}
            />
          )}
          {state.screen === 'matching' && <Matching onDone={quiz.matched} />}
          {state.screen === 'submit' && <SubmitScreen answers={state.answers} onDone={quiz.submitted} />}
          {state.screen === 'results' && (
            <Results answers={state.answers} onBack={quiz.back} onRetake={quiz.restart} />
          )}
        </motion.div>
      </AnimatePresence>
      {(state.screen === 'question' || state.screen === 'welcome') && Object.keys(state.answers).length > 0 && (
        <div className="mx-auto w-full max-w-2xl px-4 sm:px-6">
          <button
            type="button"
            onClick={quiz.restart}
            className="min-h-12 text-sm text-muted underline underline-offset-4 hover:text-ink"
          >
            {t.nav.startOver}
          </button>
        </div>
      )}
    </Shell>
  )
}

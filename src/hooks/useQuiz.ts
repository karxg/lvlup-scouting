import { useCallback, useEffect, useReducer } from 'react'
import { decodeAnswers, encodeAnswers, isComplete, pruneAnswers, questionPath } from '../lib/questions'
import { KEYS, storage } from '../lib/storage'
import type { Answers } from '../lib/types'

export type Screen = 'lang' | 'welcome' | 'question' | 'matching' | 'submit' | 'results'

export interface QuizState {
  screen: Screen
  /** Index into the founder's current question path. */
  step: number
  /** Raw answers. Off-path answers are kept so going back and forth never loses them. */
  answers: Answers
  /** 1 = forward, -1 = back. Drives transition direction. */
  dir: 1 | -1
}

type Action =
  | { type: 'chooseLang' }
  | { type: 'start' }
  | { type: 'answer'; answers: Answers }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'matched'; hasSubmitScreen: boolean }
  | { type: 'submitted' }
  | { type: 'restart' }

interface Saved {
  screen: Screen
  step: number
  answers: Answers
}

function reducer(s: QuizState, a: Action): QuizState {
  switch (a.type) {
    case 'chooseLang':
      return { ...s, screen: 'welcome', dir: 1 }
    case 'start':
      return { ...s, screen: 'question', step: 0, dir: 1 }
    case 'answer':
      return { ...s, answers: a.answers }
    case 'next': {
      const path = questionPath(s.answers)
      if (s.step < path.length - 1) return { ...s, step: s.step + 1, dir: 1 }
      return { ...s, screen: 'matching', dir: 1 }
    }
    case 'back': {
      if (s.screen === 'question') {
        return s.step > 0 ? { ...s, step: s.step - 1, dir: -1 } : { ...s, screen: 'welcome', dir: -1 }
      }
      if (s.screen === 'results' || s.screen === 'submit') {
        return { ...s, screen: 'question', step: questionPath(s.answers).length - 1, dir: -1 }
      }
      if (s.screen === 'welcome') return { ...s, screen: 'lang', dir: -1 }
      return s
    }
    case 'matched':
      return { ...s, screen: a.hasSubmitScreen ? 'submit' : 'results', dir: 1 }
    case 'submitted':
      return { ...s, screen: 'results', dir: 1 }
    case 'restart':
      return { screen: 'welcome', step: 0, answers: {}, dir: -1 }
  }
}

function init({ langChosen }: { langChosen: boolean }): QuizState {
  const shared = decodeAnswers(new URLSearchParams(window.location.search).get('a'))
  if (shared) return { screen: 'results', step: questionPath(shared).length - 1, answers: shared, dir: 1 }

  const saved = storage.get<Saved>(KEYS.progress)
  if (saved && saved.answers && typeof saved.step === 'number') {
    const path = questionPath(saved.answers)
    if ((saved.screen === 'results' || saved.screen === 'matching' || saved.screen === 'submit') && isComplete(saved.answers)) {
      return { screen: 'results', step: path.length - 1, answers: saved.answers, dir: 1 }
    }
    if (saved.screen === 'question') {
      return { screen: 'question', step: Math.min(saved.step, path.length - 1), answers: saved.answers, dir: 1 }
    }
  }
  return { screen: langChosen ? 'welcome' : 'lang', step: 0, answers: saved?.answers ?? {}, dir: 1 }
}

export function useQuiz(langChosen: boolean, hasSubmitScreen: boolean) {
  const [state, dispatch] = useReducer(reducer, { langChosen }, init)

  // Persist progress and keep the shareable URL in sync with the results.
  useEffect(() => {
    if (state.screen !== 'lang') {
      storage.set(KEYS.progress, { screen: state.screen, step: state.step, answers: state.answers } satisfies Saved)
    }
    const url = new URL(window.location.href)
    const code = state.screen === 'results' ? encodeAnswers(pruneAnswers(state.answers)) : null
    if (code) url.searchParams.set('a', code)
    else url.searchParams.delete('a')
    if (url.href !== window.location.href) window.history.replaceState(window.history.state, '', url)
  }, [state])

  const restart = useCallback(() => {
    storage.remove(KEYS.progress)
    dispatch({ type: 'restart' })
  }, [])

  return {
    state,
    chooseLang: useCallback(() => dispatch({ type: 'chooseLang' }), []),
    start: useCallback(() => dispatch({ type: 'start' }), []),
    setAnswers: useCallback((answers: Answers) => dispatch({ type: 'answer', answers }), []),
    next: useCallback(() => dispatch({ type: 'next' }), []),
    back: useCallback(() => dispatch({ type: 'back' }), []),
    matched: useCallback(() => dispatch({ type: 'matched', hasSubmitScreen }), [hasSubmitScreen]),
    submitted: useCallback(() => dispatch({ type: 'submitted' }), []),
    restart,
  }
}

import { describe, expect, it } from 'vitest'
import { MESSAGES } from '../i18n'
import { matchFunds } from './match'
import { decodeAnswers } from './questions'
import { resultsText, shareUrl } from './resultsText'
import type { Answers } from './types'

const answers: Answers = {
  business_type: 'cpg',
  stage: 'pre_seed',
  incorporation: 'non_us',
  mrr: '1k_10k',
  need: ['equity'],
  amount: '10k_100k',
}

describe('share link', () => {
  it('includes the /lvlup/ subpath and reopens the same answers', () => {
    const url = new URL(shareUrl(answers, 'ar'))
    expect(url.origin + url.pathname).toBe('https://kfarrag.com/lvlup/')
    expect(url.searchParams.get('lang')).toBe('ar')
    expect(decodeAnswers(url.searchParams.get('a'))).toEqual(answers)
  })
})

describe('copied results', () => {
  for (const lang of ['en', 'ar'] as const) {
    it(`is a clean ${lang} summary with the disclaimer and link`, () => {
      const text = resultsText(matchFunds(answers), answers, lang)
      expect(text).toContain('CPG Fund')
      expect(text).toContain(MESSAGES[lang].results.disclaimer)
      expect(text).toContain('https://kfarrag.com/lvlup/?lang=' + lang)
      expect(text).not.toMatch(/\[\[|undefined/)
    })
  }

  it('keeps dollar ranges in order inside Arabic text', () => {
    const text = resultsText(matchFunds(answers), answers, 'ar')
    expect(text).toContain('⁦$10K–$100K⁩')
  })
})

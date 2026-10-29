import { describe, expect, it } from 'vitest'
import {
  decodeAnswers,
  encodeAnswers,
  estimatedLength,
  isComplete,
  pruneAnswers,
  questionPath,
} from './questions'
import type { Answers } from './types'

const saas: Answers = {
  business_type: 'b2b_saas',
  tech_sector: ['ai', 'fintech'],
  stage: 'seed',
  incorporation: 'us',
  mrr: '10k_100k',
  need: ['non_dilutive', 'mentorship'],
  amount: '250k_3_5m',
  use_of_funds: ['hiring'],
}

describe('branching', () => {
  it('asks the sector only for tech product or B2B SaaS', () => {
    expect(questionPath({ business_type: 'tech' }).map((q) => q.id)).toContain('tech_sector')
    expect(questionPath({ business_type: 'cpg' }).map((q) => q.id)).not.toContain('tech_sector')
  })

  it('asks use of funds for local businesses or non-dilutive seekers', () => {
    expect(questionPath({ business_type: 'local' }).map((q) => q.id)).toContain('use_of_funds')
    expect(questionPath({ business_type: 'cpg', need: ['non_dilutive'] }).map((q) => q.id)).toContain('use_of_funds')
    expect(questionPath({ business_type: 'cpg', need: ['equity'] }).map((q) => q.id)).not.toContain('use_of_funds')
  })

  it('estimates length, shrinking as branches resolve', () => {
    expect(estimatedLength({})).toEqual({ questions: 8, minutes: 2 })
    expect(estimatedLength({ business_type: 'cpg', need: ['equity'] }).questions).toBe(6)
  })

  it('prunes answers that fall off the path', () => {
    const pruned = pruneAnswers({ ...saas, business_type: 'cpg', need: ['equity'] })
    expect(pruned.tech_sector).toBeUndefined()
    expect(pruned.use_of_funds).toBeUndefined()
    expect(isComplete(pruned)).toBe(true)
  })
})

describe('URL encoding', () => {
  it('round-trips a full set of answers', () => {
    const code = encodeAnswers(saas)
    expect(code).toBe('1.01.3.0.3.14.3.4')
    expect(decodeAnswers(code)).toEqual(saas)
  })

  it('round-trips a path with skipped questions', () => {
    const cpg: Answers = { business_type: 'cpg', stage: 'pre_seed', incorporation: 'none', mrr: 'zero', need: ['equity'], amount: 'not_raising' }
    expect(decodeAnswers(encodeAnswers(cpg))).toEqual(cpg)
  })

  it('rejects malformed or incomplete codes', () => {
    for (const bad of [null, '', 'x', '1.2', '9._.3.0.3.1.4._', '1._.3.0.3.1.4._', '1.0.33.0.3.1.4._']) {
      expect(decodeAnswers(bad)).toBeNull()
    }
  })
})

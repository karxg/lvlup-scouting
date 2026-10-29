import { describe, expect, it } from 'vitest'
import { CPG_NON_DILUTIVE_MIN_MRR, FUNDS, getFund } from '../data/funds'
import { formatReason, formatUnlock, plain } from '../i18n'
import { checkEligibility, matchFunds, type MatchResult } from './match'
import type { Answers, FundId } from './types'

const ids = (r: MatchResult) => [r.top, ...r.alternatives].map((m) => m.fund.id)
const fund = (id: FundId) => getFund(id)!

describe('founder scenarios', () => {
  it('1. idea stage, not incorporated, $0 MRR, wants equity → First Check Fund', () => {
    const r = matchFunds({
      business_type: 'tech',
      tech_sector: ['other'],
      stage: 'idea',
      incorporation: 'none',
      mrr: 'zero',
      need: ['equity'],
      amount: 'under_10k',
    })
    expect(r.top.fund.id).toBe('first_check')
    expect(r.top.reasons.map((x) => x.code)).toContain('no_entity')
    expect(r.noMatch).toBe(false)
  })

  it('2. US B2B SaaS, $25K MRR, wants non-dilutive $1M → B2B SaaS Accel Fund', () => {
    const r = matchFunds({
      business_type: 'b2b_saas',
      tech_sector: ['other'],
      stage: 'seed',
      incorporation: 'us',
      mrr: '10k_100k',
      need: ['non_dilutive'],
      amount: '250k_3_5m',
    })
    expect(r.top.fund.id).toBe('b2b_saas_accel')
    expect(ids(r)).toContain('tech_non_dilutive')
  })

  it('3. Egyptian AI startup, $15K MRR, wants non-dilutive → Tech Non-Dilutive, not B2B SaaS Accel', () => {
    const answers: Answers = {
      business_type: 'b2b_saas',
      tech_sector: ['ai'],
      stage: 'seed',
      incorporation: 'non_us',
      mrr: '10k_100k',
      need: ['non_dilutive'],
      amount: '100k_250k',
    }
    const r = matchFunds(answers)
    expect(r.top.fund.id).toBe('tech_non_dilutive')
    expect(ids(r)).not.toContain('b2b_saas_accel')
    expect(r.top.reasons.map((x) => x.code)).toContain('sector')
    // B2B SaaS Accel is one step away: US incorporation.
    const accel = r.unlocks.find((u) => u.fund.id === 'b2b_saas_accel')
    expect(accel?.gaps).toEqual([{ code: 'us_inc' }])
  })

  it('4. apparel DTC brand, $3K MRR, wants $50K equity → CPG Fund, Labs CPG as an alternative', () => {
    const r = matchFunds({
      business_type: 'cpg',
      stage: 'pre_seed',
      incorporation: 'non_us',
      mrr: '1k_10k',
      need: ['equity'],
      amount: '10k_100k',
    })
    expect(r.top.fund.id).toBe('cpg_fund')
    expect(r.alternatives.map((m) => m.fund.id)).toContain('labs_cpg')
  })

  it('5. US CPG brand, $40K MRR, wants non-dilutive → CPG Non-Dilutive Fund', () => {
    const r = matchFunds({
      business_type: 'cpg',
      stage: 'seed',
      incorporation: 'us',
      mrr: '10k_100k',
      need: ['non_dilutive'],
      amount: '100k_250k',
      use_of_funds: ['working_capital'],
    })
    expect(r.top.fund.id).toBe('cpg_non_dilutive')
  })

  it('6. café needing equipment, $12K MRR → Real Economy Non-Dilutive or Small Business Fund', () => {
    const r = matchFunds({
      business_type: 'local',
      stage: 'seed',
      incorporation: 'non_us',
      mrr: '10k_100k',
      need: ['non_dilutive'],
      amount: '10k_100k',
      use_of_funds: ['equipment'],
    })
    expect(['real_economy', 'small_business']).toContain(r.top.fund.id)
    expect(ids(r)).toEqual(expect.arrayContaining(['real_economy', 'small_business']))
    expect(r.top.reasons.map((x) => x.code)).toContain('use_of_funds')
  })

  it('7. pre-seed checkout-tools startup → E-Commerce Ecosystem Builders', () => {
    const r = matchFunds({
      business_type: 'ecom_tech',
      stage: 'pre_seed',
      incorporation: 'us',
      mrr: 'under_1k',
      need: ['equity'],
      amount: '10k_100k',
    })
    expect(r.top.fund.id).toBe('ecom_builders')
  })

  it('8. seed-stage tech, $5K MRR, wants $200K equity → Seed Fund, with a Tech Non-Dilutive unlock at $10K MRR', () => {
    const r = matchFunds({
      business_type: 'tech',
      tech_sector: ['fintech'],
      stage: 'seed',
      incorporation: 'us',
      mrr: '1k_10k',
      need: ['equity'],
      amount: '100k_250k',
    })
    expect(r.top.fund.id).toBe('seed')
    const unlock = r.unlocks.find((u) => u.fund.id === 'tech_non_dilutive')
    expect(unlock?.gaps).toEqual([{ code: 'mrr', min: 10_000 }])
    expect(formatUnlock(unlock!.gaps, unlock!.fund.name, 'en')).toBe(
      'Reach $10K MRR to qualify for Tech Non-Dilutive Fund.',
    )
  })

  it('9. pre-seed founder wanting marketing help → Marketing Edge Accelerator', () => {
    const r = matchFunds({
      business_type: 'tech',
      tech_sector: ['other'],
      stage: 'pre_seed',
      incorporation: 'non_us',
      mrr: 'under_1k',
      need: ['growth_marketing'],
      amount: '10k_100k',
    })
    expect(r.top.fund.id).toBe('marketing_edge')
  })

  it('10. nothing fits → LvlUp Labs is the top result', () => {
    const r = matchFunds({
      business_type: 'cpg',
      stage: 'growth',
      incorporation: 'non_us',
      mrr: 'zero',
      need: ['equity'],
      amount: 'over_3_5m',
    })
    expect(r.noMatch).toBe(true)
    expect(r.top.fund.id).toBe('lvlup_labs')
    expect(r.alternatives).toEqual([])
    expect(r.freeOption).toBeNull()
    expect(r.unlocks.length).toBeGreaterThan(0)
  })
})

describe('hard eligibility', () => {
  const base: Answers = {
    business_type: 'tech',
    stage: 'seed',
    incorporation: 'us',
    mrr: '10k_100k',
    need: ['equity'],
    amount: '100k_250k',
  }

  it('excludes First Check and Seed Fund at growth stage', () => {
    const a = { ...base, stage: 'growth' as const }
    expect(checkEligibility(fund('first_check'), a)).toMatchObject({ eligible: false, blocked: true })
    expect(checkEligibility(fund('seed'), a)).toMatchObject({ eligible: false, blocked: true })
  })

  it('treats an earlier stage as unlockable', () => {
    const e = checkEligibility(fund('seed'), { ...base, stage: 'idea' })
    expect(e).toMatchObject({ eligible: false, blocked: false, gaps: [{ code: 'stage', minStage: 'pre_seed' }] })
  })

  it('applies MRR minimums', () => {
    const under1k = { business_type: 'cpg', mrr: 'under_1k', incorporation: 'us' } as Answers
    expect(checkEligibility(fund('cpg_fund'), under1k).eligible).toBe(false)
    expect(checkEligibility(fund('cpg_fund'), { ...under1k, mrr: '1k_10k' }).eligible).toBe(true)
    expect(checkEligibility(fund('labs_cpg'), { ...under1k, mrr: 'zero' }).eligible).toBe(false)
    expect(checkEligibility(fund('labs_cpg'), under1k).eligible).toBe(true)
    expect(checkEligibility(fund('tech_non_dilutive'), { ...base, mrr: '1k_10k' }).gaps).toEqual([
      { code: 'mrr', min: 10_000 },
    ])
  })

  it('uses CPG_NON_DILUTIVE_MIN_MRR for CPG Non-Dilutive', () => {
    expect(fund('cpg_non_dilutive').hardRules.minMrr).toBe(CPG_NON_DILUTIVE_MIN_MRR)
  })

  it('requires US incorporation for B2B SaaS Accel and CPG Non-Dilutive', () => {
    const saas: Answers = { ...base, business_type: 'b2b_saas', incorporation: 'non_us' }
    expect(checkEligibility(fund('b2b_saas_accel'), saas).gaps).toEqual([{ code: 'us_inc' }])
    const cpg: Answers = { ...base, business_type: 'cpg', incorporation: 'none' }
    expect(checkEligibility(fund('cpg_non_dilutive'), cpg).gaps).toEqual([{ code: 'us_inc' }])
  })

  it('restricts funds by business type', () => {
    const local: Answers = { ...base, business_type: 'local' }
    for (const id of ['seed', 'tech_non_dilutive', 'ecom_builders', 'cpg_fund', 'b2b_saas_accel'] as FundId[]) {
      expect(checkEligibility(fund(id), local).blocked).toBe(true)
    }
    expect(checkEligibility(fund('real_economy'), local).eligible).toBe(true)
    expect(checkEligibility(fund('small_business'), { ...base, business_type: 'tech' }).blocked).toBe(true)
  })

  it('keeps LvlUp Labs open to everyone', () => {
    expect(checkEligibility(fund('lvlup_labs'), {}).eligible).toBe(true)
  })
})

describe('result shape', () => {
  const answers: Answers = {
    business_type: 'tech',
    tech_sector: ['ai'],
    stage: 'pre_seed',
    incorporation: 'us',
    mrr: '1k_10k',
    need: ['equity'],
    amount: '10k_100k',
  }

  it('returns a top match, at most two alternatives and at most two unlocks', () => {
    const r = matchFunds(answers)
    expect(r.alternatives.length).toBeLessThanOrEqual(2)
    expect(r.unlocks.length).toBeLessThanOrEqual(2)
    expect(new Set(ids(r)).size).toBe(ids(r).length)
  })

  it('appends LvlUp Labs as a free option when it is not already shown', () => {
    const r = matchFunds(answers)
    expect(ids(r)).not.toContain('lvlup_labs')
    expect(r.freeOption?.fund.id).toBe('lvlup_labs')
  })

  it('keeps a weak-fit LvlUp Labs out of the alternatives, but ranks it when mentorship is the ask', () => {
    const idea = matchFunds({ ...answers, stage: 'idea', incorporation: 'none' })
    expect(idea.alternatives.map((m) => m.fund.id)).not.toContain('lvlup_labs')
    expect(idea.freeOption?.fund.id).toBe('lvlup_labs')

    const mentor = matchFunds({ ...answers, need: ['mentorship'], amount: 'not_raising' })
    expect(ids(mentor)).toContain('lvlup_labs')
    expect(mentor.freeOption).toBeNull()
  })

  it('gives every shown fund 2–4 reasons, with scores in 0–100', () => {
    for (const a of [answers, { ...answers, stage: 'idea' as const, incorporation: 'none' as const }]) {
      const r = matchFunds(a)
      for (const m of [r.top, ...r.alternatives, ...(r.freeOption ? [r.freeOption] : [])]) {
        expect(m.reasons.length).toBeGreaterThanOrEqual(2)
        expect(m.reasons.length).toBeLessThanOrEqual(4)
        expect(m.score).toBeGreaterThanOrEqual(0)
        expect(m.score).toBeLessThanOrEqual(100)
      }
    }
  })

  it('ranks in descending score order', () => {
    const r = matchFunds(answers)
    const raws = [r.top, ...r.alternatives].map((m) => m.raw)
    expect([...raws].sort((a, b) => b - a)).toEqual(raws)
  })

  it('never lists an eligible fund as an unlock', () => {
    const r = matchFunds(answers)
    for (const u of r.unlocks) expect(checkEligibility(u.fund, answers).eligible).toBe(false)
  })
})

describe('copy', () => {
  it('formats reasons in English and Arabic with no leftover markup', () => {
    const r = matchFunds({
      business_type: 'b2b_saas',
      tech_sector: ['ai'],
      stage: 'seed',
      incorporation: 'non_us',
      mrr: '10k_100k',
      need: ['non_dilutive'],
      amount: '100k_250k',
    })
    for (const lang of ['en', 'ar'] as const) {
      for (const reason of r.top.reasons) {
        const text = formatReason(reason, lang)
        expect(text.length).toBeGreaterThan(10)
        expect(text).not.toMatch(/undefined|\[\[/)
      }
    }
    expect(formatReason({ code: 'need', needs: ['non_dilutive'] }, 'ar')).toContain('غير مخفِّف')
    expect(formatUnlock([{ code: 'us_inc' }], 'B2B SaaS Accel Fund', 'ar')).toBe(
      'سجّل شركتك في الولايات المتحدة لتتأهل إلى B2B SaaS Accel Fund.',
    )
  })

  it('has complete bilingual data for every fund', () => {
    expect(FUNDS).toHaveLength(12)
    for (const f of FUNDS) {
      for (const field of [f.description, f.criteria, f.focus, f.rangeLabel, f.rangeHeadline]) {
        expect(field.en.trim()).not.toBe('')
        expect(field.ar.trim()).not.toBe('')
        expect(plain(field.en)).not.toMatch(/\[\[|\]\]/)
      }
      expect(f.checklist.length).toBeGreaterThan(0)
    }
  })

  it('only uses known glossary terms in fund text', () => {
    const known = ['mrr', 'safe', 'nondilutive', 'preseed', 'seed', 'seriesa', 'revshare', 'followon', 'incorporation']
    for (const f of FUNDS) {
      const text = JSON.stringify([f.rangeLabel, f.criteria, f.description, f.focus])
      for (const [, id] of text.matchAll(/\[\[([a-z]+):/g)) expect(known).toContain(id)
    }
  })
})

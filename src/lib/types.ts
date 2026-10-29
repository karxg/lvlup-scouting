export type Lang = 'en' | 'ar'

/** A piece of copy in both languages. */
export interface L10n {
  en: string
  ar: string
}

export type BusinessType = 'tech' | 'b2b_saas' | 'ecom_tech' | 'cpg' | 'local'
export type TechSector = 'ai' | 'fintech' | 'climate' | 'hardware' | 'gaming' | 'healthtech' | 'other'
export type Stage = 'idea' | 'building' | 'pre_seed' | 'seed' | 'series_a' | 'growth'
export type Incorporation = 'us' | 'non_us' | 'none'
export type Mrr = 'zero' | 'under_1k' | '1k_10k' | '10k_100k' | '100k_plus'
export type Need = 'equity' | 'non_dilutive' | 'growth_marketing' | 'ops_scale' | 'mentorship'
export type Amount = 'under_10k' | '10k_100k' | '100k_250k' | '250k_3_5m' | 'over_3_5m' | 'not_raising'
export type UseOfFunds = 'equipment' | 'working_capital' | 'expansion' | 'marketing' | 'hiring' | 'product'

export interface Answers {
  business_type?: BusinessType
  tech_sector?: TechSector[]
  stage?: Stage
  incorporation?: Incorporation
  mrr?: Mrr
  need?: Need[]
  amount?: Amount
  use_of_funds?: UseOfFunds[]
}

export type FundType = 'equity' | 'non-dilutive' | 'accelerator' | 'hybrid' | 'support'

export type FundId =
  | 'first_check'
  | 'seed'
  | 'b2b_saas_accel'
  | 'tech_non_dilutive'
  | 'ecom_builders'
  | 'cpg_fund'
  | 'cpg_non_dilutive'
  | 'labs_cpg'
  | 'marketing_edge'
  | 'small_business'
  | 'real_economy'
  | 'lvlup_labs'

/** A fund fails eligibility if any of these rules fails. */
export interface HardRules {
  /** Minimum monthly revenue in USD, compared against the lower bound of the founder's MRR bracket. */
  minMrr?: number
  requiresUsIncorporation?: boolean
  stages?: Stage[]
  businessTypes?: BusinessType[]
}

/** Signals that raise or lower a fund's score once it is eligible. */
export interface SoftSignals {
  needs?: Need[]
  /** `full`: the fund's range contains this amount. `partial`: reachable only through follow-on or a secondary track. */
  amounts?: { full: Amount[]; partial?: Amount[] }
  sectors?: TechSector[]
  /** Business types this fund is built specifically for. */
  focusBusinessTypes?: BusinessType[]
  sweetSpotStages?: Stage[]
  useOfFunds?: UseOfFunds[]
  /** Added to the base score (used to keep the free fallback below funded programs). */
  baseAdjust?: number
}

export interface Fund {
  id: FundId
  name: string
  badge?: L10n
  type: FundType
  /** Short headline amount shown as the big number on cards. */
  rangeHeadline: L10n
  rangeLabel: L10n
  description: L10n
  criteria: L10n
  focus: L10n
  cost?: L10n
  checklist: L10n[]
  hardRules: HardRules
  softSignals: SoftSignals
}

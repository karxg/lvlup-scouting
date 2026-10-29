/**
 * Fund Match: program data and matching configuration.
 *
 * This is the one file to edit when programs, criteria or weights change.
 * Text may mark glossary terms as [[termId:visible text]]; the UI renders those
 * with an ⓘ tooltip (see `GLOSSARY` in src/i18n). Valid term ids:
 * mrr, safe, nondilutive, preseed, seed, seriesa, revshare, followon, incorporation.
 */
import type { Fund, Mrr, Stage, Amount } from '../lib/types'

/** Update whenever program details are re-checked against lvlup.vc. */
export const DATA_LAST_UPDATED = 'October 2026'

export const APPLY_URL = 'https://www.lvlup.vc/apply/funding-application'

/** "Revenue traction" for CPG Non-Dilutive is interpreted as at least this much MRR. */
export const CPG_NON_DILUTIVE_MIN_MRR = 10_000

/** Lower bound (USD) of each MRR answer, used for minimum-MRR rules. */
export const MRR_LOWER_BOUND: Record<Mrr, number> = {
  zero: 0,
  under_1k: 1,
  '1k_10k': 1_000,
  '10k_100k': 10_000,
  '100k_plus': 100_000,
}

/** Stages in order, earliest first. */
export const STAGE_ORDER: Stage[] = ['idea', 'building', 'pre_seed', 'seed', 'series_a', 'growth']

/** Requested amounts in order, smallest first (`not_raising` is neutral and not ranked). */
export const AMOUNT_ORDER: Exclude<Amount, 'not_raising'>[] = [
  'under_10k',
  '10k_100k',
  '100k_250k',
  '250k_3_5m',
  'over_3_5m',
]

/** All scoring weights. Scores start at `base` and are clamped to 0–100. */
export const MATCH_WEIGHTS = {
  base: 40,
  /** First need the fund serves. */
  needMatch: 30,
  /** Second need the fund also serves. */
  needMatchExtra: 10,
  /** Founder named needs and the fund serves none of them. */
  needMiss: -15,
  amountInRange: 15,
  amountPartial: 7,
  /** Requested amount is two or more brackets away from anything the fund offers. */
  amountFarMismatch: -15,
  sectorMatch: 10,
  focusMatch: 12,
  stageSweetSpot: 15,
  /** Per matching use of funds, counted at most `useOfFundsMaxMatches` times. */
  useOfFundsMatch: 8,
  useOfFundsMaxMatches: 2,
  /** Applied to the free, no-capital option so funded programs rank first. */
  freeSupportAdjust: -15,
  /** Alternatives scoring below this are too weak to suggest. */
  minAlternativeScore: 35,
} as const

/** How many unlockable gaps a fund may have and still appear under "Unlock more options". */
export const UNLOCK_MAX_GAPS = 2

const TECH_TYPES = ['tech', 'b2b_saas', 'ecom_tech'] as const

export const FUNDS: Fund[] = [
  {
    id: 'first_check',
    name: 'First Check Fund',
    badge: { en: 'Flagship', ar: 'البرنامج الرئيسي' },
    type: 'equity',
    rangeHeadline: { en: '$1K–$10K', ar: '$1K–$10K' },
    rangeLabel: {
      en: "$1,000–$10,000 cash plus $10M in perks, invested via standard [[safe:SAFEs]] at the round's valuation",
      ar: 'من $1,000 إلى $10,000 نقدًا، إضافةً إلى مزايا بقيمة $10M، ويُستثمر عبر اتفاقيات [[safe:SAFE]] القياسية بتقييم الجولة',
    },
    description: {
      en: "A founder's first institutional capital, written at idea stage.",
      ar: 'أول تمويل مؤسسي يحصل عليه المؤسس، ويُقدَّم منذ مرحلة الفكرة.',
    },
    criteria: {
      en: 'Idea stage, pre-formation or [[preseed:pre-seed]]. No data room needed: a deck and a conversation are enough. No entity needed, so you can apply before [[incorporation:incorporating]].',
      ar: 'مرحلة الفكرة أو ما قبل التأسيس أو مرحلة [[preseed:ما قبل البذرة]]. لا حاجة إلى غرفة بيانات، فالعرض التقديمي ومحادثة واحدة يكفيان. ولا يُشترط وجود كيان قانوني، لذا يمكنك التقديم قبل [[incorporation:تسجيل الشركة]].',
    },
    focus: {
      en: 'Industry- and geography-agnostic.',
      ar: 'مفتوح لجميع القطاعات والمناطق الجغرافية.',
    },
    checklist: [
      { en: 'A short pitch deck', ar: 'عرض تقديمي قصير' },
      { en: 'A clear problem statement and why your team can solve it', ar: 'وصف واضح للمشكلة ولماذا فريقك قادر على حلها' },
      { en: 'Founder backgrounds (LinkedIn or a short bio)', ar: 'نبذة عن المؤسسين (حساب LinkedIn أو سيرة مختصرة)' },
    ],
    hardRules: { stages: ['idea', 'building', 'pre_seed'] },
    softSignals: {
      needs: ['equity'],
      amounts: { full: ['under_10k'] },
      sweetSpotStages: ['idea', 'building'],
    },
  },
  {
    id: 'seed',
    name: 'Seed Fund',
    type: 'equity',
    rangeHeadline: { en: '$100K–$250K', ar: '$100K–$250K' },
    rangeLabel: { en: '$100,000–$250,000', ar: 'من $100,000 إلى $250,000' },
    description: {
      en: 'A seed-stage, value-add fund investing directly into high-potential tech founders worldwide, with hands-on support on product, traction and go-to-market.',
      ar: 'صندوق لمرحلة البذرة يستثمر مباشرةً في مؤسسي التقنية الواعدين حول العالم، ويقدّم دعمًا عمليًا في المنتج والنمو وخطة الدخول إلى السوق.',
    },
    criteria: {
      en: '[[preseed:Pre-seed]] to [[seriesa:Series A]], traction-driven.',
      ar: 'من مرحلة [[preseed:ما قبل البذرة]] حتى [[seriesa:الجولة A]]، مع التركيز على النمو الفعلي.',
    },
    focus: { en: 'Sector-agnostic tech.', ar: 'شركات التقنية في جميع القطاعات.' },
    checklist: [
      { en: 'Pitch deck', ar: 'عرض تقديمي' },
      { en: 'Traction metrics: users, revenue and growth rate', ar: 'مؤشرات النمو: المستخدمون والإيرادات ومعدل النمو' },
      { en: 'Cap table and incorporation documents', ar: 'جدول الملكية ومستندات تسجيل الشركة' },
      { en: 'Go-to-market plan', ar: 'خطة الدخول إلى السوق' },
    ],
    hardRules: { stages: ['pre_seed', 'seed', 'series_a'], businessTypes: [...TECH_TYPES] },
    softSignals: {
      needs: ['equity'],
      amounts: { full: ['100k_250k'] },
      sweetSpotStages: ['seed'],
    },
  },
  {
    id: 'b2b_saas_accel',
    name: 'B2B SaaS Accel Fund',
    type: 'hybrid',
    rangeHeadline: { en: 'Up to $3.5M', ar: 'حتى $3.5M' },
    rangeLabel: {
      en: 'Up to $3.5M [[nondilutive:non-dilutive]] financing blended with VC support',
      ar: 'تمويل [[nondilutive:غير مخفِّف للملكية]] يصل إلى $3.5M، مع دعم على طريقة رأس المال الجريء',
    },
    description: {
      en: 'Non-dilutive financing for revenue-generating B2B SaaS companies, blended with VC support.',
      ar: 'تمويل لا يتطلب التنازل عن حصص لشركات B2B SaaS التي تحقق إيرادات، مع دعم على طريقة رأس المال الجريء.',
    },
    criteria: {
      en: '$10,000+ [[mrr:MRR]] and US [[incorporation:incorporation]].',
      ar: '[[mrr:إيرادات شهرية متكررة]] لا تقل عن $10,000، وشركة [[incorporation:مسجّلة]] في الولايات المتحدة.',
    },
    focus: { en: 'B2B SaaS.', ar: 'شركات B2B SaaS.' },
    checklist: [
      { en: 'Proof of MRR (billing or Stripe exports)', ar: 'إثبات الإيرادات الشهرية (تقارير الفوترة أو Stripe)' },
      { en: 'US incorporation documents', ar: 'مستندات تسجيل الشركة في الولايات المتحدة' },
      { en: 'Last 6–12 months of financials', ar: 'البيانات المالية لآخر 6 إلى 12 شهرًا' },
      { en: 'Pitch deck', ar: 'عرض تقديمي' },
    ],
    hardRules: { minMrr: 10_000, requiresUsIncorporation: true, businessTypes: ['b2b_saas'] },
    softSignals: {
      needs: ['non_dilutive'],
      amounts: { full: ['10k_100k', '100k_250k', '250k_3_5m'] },
      focusBusinessTypes: ['b2b_saas'],
    },
  },
  {
    id: 'tech_non_dilutive',
    name: 'Tech Non-Dilutive Fund',
    type: 'non-dilutive',
    rangeHeadline: { en: '$20K–$20M', ar: '$20K–$20M' },
    rangeLabel: {
      en: '$20,000–$20,000,000 [[nondilutive:non-dilutive]]',
      ar: 'من $20,000 إلى $20,000,000 تمويلًا [[nondilutive:غير مخفِّف للملكية]]',
    },
    description: {
      en: 'Non-dilutive capital for tech companies, from pre-seed to growth.',
      ar: 'تمويل لا يتطلب التنازل عن حصص لشركات التقنية، من مرحلة ما قبل البذرة حتى مرحلة النمو.',
    },
    criteria: {
      en: '$10K+ [[mrr:MRR]]. [[preseed:Pre-seed]] to growth.',
      ar: '[[mrr:إيرادات شهرية متكررة]] لا تقل عن $10K، من مرحلة [[preseed:ما قبل البذرة]] حتى مرحلة النمو.',
    },
    focus: {
      en: 'AI, fintech, climate, hardware, gaming, healthtech and more.',
      ar: 'الذكاء الاصطناعي، والتقنية المالية، والمناخ، والأجهزة، والألعاب، والتقنية الصحية، وغيرها.',
    },
    checklist: [
      { en: 'Proof of MRR (billing or bank statements)', ar: 'إثبات الإيرادات الشهرية (تقارير الفوترة أو كشوف الحساب)' },
      { en: 'Revenue history for the last 6–12 months', ar: 'سجل الإيرادات لآخر 6 إلى 12 شهرًا' },
      { en: 'A use-of-funds plan', ar: 'خطة لاستخدام التمويل' },
      { en: 'Incorporation documents', ar: 'مستندات تسجيل الشركة' },
    ],
    hardRules: {
      minMrr: 10_000,
      stages: ['pre_seed', 'seed', 'series_a', 'growth'],
      businessTypes: [...TECH_TYPES],
    },
    softSignals: {
      needs: ['non_dilutive'],
      amounts: { full: ['10k_100k', '100k_250k', '250k_3_5m', 'over_3_5m'] },
      sectors: ['ai', 'fintech', 'climate', 'hardware', 'gaming', 'healthtech'],
    },
  },
  {
    id: 'ecom_builders',
    name: 'E-Commerce Ecosystem Builders',
    type: 'equity',
    rangeHeadline: { en: 'Up to $25K', ar: 'حتى $25K' },
    rangeLabel: {
      en: 'Up to $25,000, with potential [[followon:follow-on]] up to $250,000',
      ar: 'حتى $25,000، مع إمكانية [[followon:استثمار لاحق]] يصل إلى $250,000',
    },
    description: {
      en: 'For early-stage startups transforming commerce infrastructure.',
      ar: 'للشركات الناشئة في مراحلها الأولى التي تعيد بناء البنية التحتية للتجارة.',
    },
    criteria: {
      en: '[[preseed:Pre-seed]] through [[seriesa:Series A]]+.',
      ar: 'من مرحلة [[preseed:ما قبل البذرة]] حتى [[seriesa:الجولة A]] وما بعدها.',
    },
    focus: {
      en: 'AI agents, checkout tools, marketing automation, merchant workflows, OMS, loyalty, payments, logistics tooling and personalization engines.',
      ar: 'وكلاء الذكاء الاصطناعي، وأدوات الدفع والشراء، وأتمتة التسويق، وسير عمل التجار، وأنظمة إدارة الطلبات، وبرامج الولاء، والمدفوعات، وأدوات الخدمات اللوجستية، ومحركات التخصيص.',
    },
    checklist: [
      { en: 'Pitch deck', ar: 'عرض تقديمي' },
      { en: 'Product demo or screenshots', ar: 'عرض توضيحي للمنتج أو لقطات شاشة' },
      { en: 'Early merchant users or pilots', ar: 'أوائل التجار المستخدمين أو التجارب الأولية' },
    ],
    hardRules: { stages: ['pre_seed', 'seed', 'series_a', 'growth'], businessTypes: ['ecom_tech'] },
    softSignals: {
      needs: ['equity'],
      amounts: { full: ['under_10k', '10k_100k'], partial: ['100k_250k'] },
      focusBusinessTypes: ['ecom_tech'],
      sweetSpotStages: ['pre_seed', 'seed'],
    },
  },
  {
    id: 'cpg_fund',
    name: 'CPG Fund',
    badge: { en: 'Backed by Shopline', ar: 'بدعم من Shopline' },
    type: 'equity',
    rangeHeadline: { en: '$10K–$100K', ar: '$10K–$100K' },
    rangeLabel: {
      en: '$10,000–$100,000, with potential [[followon:follow-on]] up to $250,000',
      ar: 'من $10,000 إلى $100,000، مع إمكانية [[followon:استثمار لاحق]] يصل إلى $250,000',
    },
    description: {
      en: 'Investment for companies selling a physical product direct to consumers.',
      ar: 'استثمار للشركات التي تبيع منتجًا ملموسًا مباشرةً إلى المستهلكين.',
    },
    criteria: {
      en: '$1,000+ [[mrr:MRR]].',
      ar: '[[mrr:إيرادات شهرية متكررة]] لا تقل عن $1,000.',
    },
    focus: {
      en: 'Any company selling a physical product direct to consumers, from F&B to apparel to electronics.',
      ar: 'أي شركة تبيع منتجًا ملموسًا مباشرةً إلى المستهلكين، من الأغذية والمشروبات إلى الأزياء والإلكترونيات.',
    },
    checklist: [
      { en: 'Pitch deck', ar: 'عرض تقديمي' },
      { en: 'Proof of monthly sales (store or payment exports)', ar: 'إثبات المبيعات الشهرية (تقارير المتجر أو بوابة الدفع)' },
      { en: 'Unit economics: margins and customer acquisition cost', ar: 'اقتصاديات الوحدة: هوامش الربح وتكلفة اكتساب العميل' },
    ],
    hardRules: { minMrr: 1_000, businessTypes: ['cpg'] },
    softSignals: {
      needs: ['equity'],
      amounts: { full: ['10k_100k'], partial: ['100k_250k'] },
      focusBusinessTypes: ['cpg'],
    },
  },
  {
    id: 'cpg_non_dilutive',
    name: 'CPG Non-Dilutive Fund',
    type: 'non-dilutive',
    rangeHeadline: { en: '$20K–$20M', ar: '$20K–$20M' },
    rangeLabel: {
      en: '$20,000–$20,000,000 [[nondilutive:non-dilutive]] growth capital, with no equity given up',
      ar: 'من $20,000 إلى $20,000,000 تمويلًا للنمو [[nondilutive:غير مخفِّف للملكية]]، دون التنازل عن أي حصة',
    },
    description: {
      en: 'Growth capital for DTC, retail, inventory and marketing, without giving up equity.',
      ar: 'تمويل للنمو يغطي البيع المباشر والتجزئة والمخزون والتسويق، دون التنازل عن حصص.',
    },
    criteria: {
      en: 'US [[incorporation:incorporated]], high-performing CPG brand with revenue traction.',
      ar: 'علامة استهلاكية متميزة الأداء، [[incorporation:مسجّلة]] في الولايات المتحدة، وتحقق إيرادات واضحة.',
    },
    focus: { en: 'Consumer packaged goods (CPG).', ar: 'السلع الاستهلاكية المعبأة (CPG).' },
    checklist: [
      { en: 'US incorporation documents', ar: 'مستندات تسجيل الشركة في الولايات المتحدة' },
      { en: 'Revenue history and channel breakdown (DTC, retail)', ar: 'سجل الإيرادات وتوزيعها حسب القناة (بيع مباشر، تجزئة)' },
      { en: 'Inventory and marketing plan for the capital', ar: 'خطة المخزون والتسويق لاستخدام التمويل' },
    ],
    hardRules: { minMrr: CPG_NON_DILUTIVE_MIN_MRR, requiresUsIncorporation: true, businessTypes: ['cpg'] },
    softSignals: {
      needs: ['non_dilutive'],
      amounts: { full: ['10k_100k', '100k_250k', '250k_3_5m', 'over_3_5m'] },
      focusBusinessTypes: ['cpg'],
      useOfFunds: ['working_capital', 'marketing'],
    },
  },
  {
    id: 'labs_cpg',
    name: 'Labs CPG Accelerator',
    badge: { en: 'Virtual · $10/mo', ar: 'افتراضي · $10 شهريًا' },
    type: 'accelerator',
    rangeHeadline: { en: 'Up to $20K', ar: 'حتى $20K' },
    rangeLabel: {
      en: 'Up to $20,000 upfront plus performance-based [[followon:follow-on]]. Backed by Shopline.',
      ar: 'حتى $20,000 مقدّمًا، إضافةً إلى [[followon:استثمار لاحق]] مرتبط بالأداء. بدعم من Shopline.',
    },
    description: {
      en: 'A virtual accelerator for consumer brands ready to scale operations and distribution.',
      ar: 'مسرّعة افتراضية للعلامات الاستهلاكية المستعدة لتوسيع عملياتها وقنوات توزيعها.',
    },
    criteria: {
      en: 'Consumer brands with early traction seeking operational and distribution scale.',
      ar: 'علامات استهلاكية حققت بدايات نمو، وتسعى إلى توسيع العمليات والتوزيع.',
    },
    focus: { en: 'CPG.', ar: 'السلع الاستهلاكية المعبأة (CPG).' },
    cost: { en: '$10/month subscription', ar: 'اشتراك شهري بقيمة $10' },
    checklist: [
      { en: 'Proof of early sales', ar: 'إثبات المبيعات الأولى' },
      { en: 'Current operations and distribution setup', ar: 'وصف العمليات وقنوات التوزيع الحالية' },
      { en: 'A short brand story for the program', ar: 'قصة مختصرة عن علامتك التجارية' },
    ],
    hardRules: { minMrr: 1, businessTypes: ['cpg'] },
    softSignals: {
      needs: ['ops_scale', 'mentorship'],
      amounts: { full: ['under_10k', '10k_100k'] },
      focusBusinessTypes: ['cpg'],
    },
  },
  {
    id: 'marketing_edge',
    name: 'Marketing Edge Accelerator',
    badge: { en: 'Virtual · $10/mo', ar: 'افتراضي · $10 شهريًا' },
    type: 'accelerator',
    rangeHeadline: { en: 'Up to $25K', ar: 'حتى $25K' },
    rangeLabel: {
      en: 'Up to $25,000 upfront plus up to $250,000 [[followon:follow-on]], with advanced email and digital marketing on the SmartPush platform',
      ar: 'حتى $25,000 مقدّمًا، إضافةً إلى [[followon:استثمار لاحق]] يصل إلى $250,000، مع أدوات متقدمة للتسويق عبر البريد الإلكتروني والتسويق الرقمي على منصة SmartPush',
    },
    description: {
      en: 'A virtual accelerator for early-stage startups scaling acquisition, retention and lifecycle marketing.',
      ar: 'مسرّعة افتراضية للشركات الناشئة التي تريد تنمية اكتساب العملاء والاحتفاظ بهم والتسويق عبر دورة حياة العميل.',
    },
    criteria: {
      en: 'Early-stage, looking to scale customer acquisition, retention and lifecycle marketing.',
      ar: 'شركات في مراحلها الأولى تسعى إلى تنمية اكتساب العملاء والاحتفاظ بهم والتسويق عبر دورة حياة العميل.',
    },
    focus: {
      en: 'Cross-industry growth, marketing infrastructure and digital distribution.',
      ar: 'النمو في مختلف القطاعات، والبنية التحتية للتسويق، والتوزيع الرقمي.',
    },
    cost: { en: '$10/month subscription', ar: 'اشتراك شهري بقيمة $10' },
    checklist: [
      { en: 'Current acquisition channels and their results', ar: 'قنوات اكتساب العملاء الحالية ونتائجها' },
      { en: 'Retention or repeat-purchase numbers', ar: 'أرقام الاحتفاظ بالعملاء أو تكرار الشراء' },
      { en: 'Pitch deck', ar: 'عرض تقديمي' },
    ],
    hardRules: { stages: ['building', 'pre_seed', 'seed'] },
    softSignals: {
      needs: ['growth_marketing', 'mentorship'],
      amounts: { full: ['under_10k', '10k_100k'], partial: ['100k_250k'] },
      useOfFunds: ['marketing'],
    },
  },
  {
    id: 'small_business',
    name: 'Small Business Fund',
    type: 'hybrid',
    rangeHeadline: { en: 'Up to $50K + $1M', ar: 'حتى $50K + $1M' },
    rangeLabel: {
      en: 'Up to $50,000 equity or [[revshare:revenue-share]] plus up to $1,000,000 [[nondilutive:non-dilutive]], with hands-on operator support',
      ar: 'حتى $50,000 مقابل حصة أو [[revshare:مشاركة في الإيرادات]]، إضافةً إلى تمويل [[nondilutive:غير مخفِّف للملكية]] يصل إلى $1,000,000، مع دعم عملي من أصحاب خبرة تشغيلية',
    },
    description: {
      en: 'Capital and hands-on operator support for local businesses ready to grow.',
      ar: 'تمويل ودعم تشغيلي عملي للأعمال المحلية المستعدة للنمو.',
    },
    criteria: {
      en: 'Brick-and-mortar businesses with growth or expansion needs.',
      ar: 'أعمال ذات موقع فعلي لديها احتياجات للنمو أو التوسع.',
    },
    focus: {
      en: 'Physical retail, services and local businesses.',
      ar: 'متاجر التجزئة الفعلية، والخدمات، والأعمال المحلية.',
    },
    checklist: [
      { en: 'Recent revenue and bank statements', ar: 'الإيرادات الأخيرة وكشوف الحساب البنكية' },
      { en: 'Growth or expansion plan', ar: 'خطة النمو أو التوسع' },
      { en: 'Business registration documents', ar: 'مستندات تسجيل النشاط التجاري' },
    ],
    hardRules: { businessTypes: ['local'] },
    softSignals: {
      needs: ['non_dilutive', 'ops_scale'],
      amounts: { full: ['under_10k', '10k_100k'], partial: ['100k_250k', '250k_3_5m'] },
      focusBusinessTypes: ['local'],
      useOfFunds: ['equipment', 'working_capital', 'expansion'],
    },
  },
  {
    id: 'real_economy',
    name: 'Real Economy Non-Dilutive',
    type: 'non-dilutive',
    rangeHeadline: { en: '$20K–$20M', ar: '$20K–$20M' },
    rangeLabel: {
      en: '$20,000–$20,000,000 [[nondilutive:non-dilutive]] for equipment, working capital and expansion',
      ar: 'من $20,000 إلى $20,000,000 تمويلًا [[nondilutive:غير مخفِّف للملكية]] للمعدات ورأس المال العامل والتوسع',
    },
    description: {
      en: 'Non-dilutive capital for real-economy businesses: equipment, working capital and expansion.',
      ar: 'تمويل لا يتطلب التنازل عن حصص لأعمال الاقتصاد الحقيقي: المعدات ورأس المال العامل والتوسع.',
    },
    criteria: {
      en: '$10K+ [[mrr:MRR]].',
      ar: '[[mrr:إيرادات شهرية متكررة]] لا تقل عن $10K.',
    },
    focus: {
      en: 'Retail, healthcare, services, trades and brick-and-mortar.',
      ar: 'التجزئة، والرعاية الصحية، والخدمات، والحِرف، والأعمال ذات الموقع الفعلي.',
    },
    checklist: [
      { en: 'Proof of monthly revenue (bank or POS statements)', ar: 'إثبات الإيرادات الشهرية (كشوف البنك أو نقاط البيع)' },
      { en: 'Quotes or a plan for equipment, inventory or expansion', ar: 'عروض أسعار أو خطة للمعدات أو المخزون أو التوسع' },
      { en: 'Business registration documents', ar: 'مستندات تسجيل النشاط التجاري' },
    ],
    hardRules: { minMrr: 10_000, businessTypes: ['local'] },
    softSignals: {
      needs: ['non_dilutive'],
      amounts: { full: ['10k_100k', '100k_250k', '250k_3_5m', 'over_3_5m'] },
      focusBusinessTypes: ['local'],
      useOfFunds: ['equipment', 'working_capital', 'expansion'],
    },
  },
  {
    id: 'lvlup_labs',
    name: 'LvlUp Labs',
    badge: { en: 'Free', ar: 'مجاني' },
    type: 'support',
    rangeHeadline: { en: 'Free', ar: 'مجاني' },
    rangeLabel: { en: 'Free · no direct capital', ar: 'مجاني · دون تمويل مباشر' },
    description: {
      en: 'Free startup support: educational resources, mentorship and strategic guidance, before or alongside institutional funding.',
      ar: 'دعم مجاني للشركات الناشئة: موارد تعليمية وإرشاد وتوجيه استراتيجي، قبل الحصول على تمويل مؤسسي أو بالتوازي معه.',
    },
    criteria: { en: 'Open to all early-stage founders.', ar: 'متاح لجميع المؤسسين في المراحل الأولى.' },
    focus: { en: 'All early-stage founders.', ar: 'جميع المؤسسين في المراحل الأولى.' },
    checklist: [
      { en: 'A short description of what you are building', ar: 'وصف مختصر لما تعمل على بنائه' },
      { en: 'The one or two questions you most want help with', ar: 'سؤال أو سؤالان تحتاج إلى المساعدة فيهما أكثر من غيرهما' },
    ],
    hardRules: {},
    softSignals: {
      needs: ['mentorship'],
      baseAdjust: MATCH_WEIGHTS.freeSupportAdjust,
    },
  },
]

export const FALLBACK_FUND_ID = 'lvlup_labs' as const

export function getFund(id: string): Fund | undefined {
  return FUNDS.find((f) => f.id === id)
}

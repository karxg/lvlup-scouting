# Fund Match

A free, independent, bilingual (English/Arabic) guide that asks founders a few questions and suggests which LvlUp Ventures fund or program may fit them. **Unofficial:** not created, reviewed or endorsed by LvlUp Ventures.

Live at **https://kfarrag.com/lvlup/**. It's a static Vite + React + TypeScript + Tailwind app, served by a Cloudflare Worker with static assets on the `kfarrag.com/lvlup*` routes only.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173/lvlup/
```

| Command | What it does |
| --- | --- |
| `npm test` | Vitest: matching logic, question branching/URL encoding, copy text, Worker routing |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run build` | Production build into `dist/lvlup/` |
| `npx wrangler dev` | Serve `dist/` through the real Worker at http://localhost:8787/lvlup/ (build first) |
| `npm run images` | Regenerate `public/og.png` and the PNG favicons (needs Playwright) |

The app lives under the `/lvlup/` base. Reference files in `public/` with `asset('file.png')` from `src/lib/env.ts` (or `import.meta.env.BASE_URL`), never `/file.png`.

## Editing content

### Funds, criteria and matching weights: `src/data/funds.ts`

Everything about the programs is in this one file:

- `FUNDS`: each program's name, badge, type, headline amount, range, description, criteria, focus, cost and "before you apply" checklist, in `en` and `ar`.
  - `hardRules`: a fund is excluded if any rule fails (`minMrr`, `requiresUsIncorporation`, `stages`, `businessTypes`).
  - `softSignals`: what raises its score (`needs`, `amounts`, `sectors`, `focusBusinessTypes`, `sweetSpotStages`, `useOfFunds`).
- `MATCH_WEIGHTS`: every scoring weight in one object. Scores start at `base` and are clamped to 0–100.
- `CPG_NON_DILUTIVE_MIN_MRR`: how "revenue traction" is interpreted for CPG Non-Dilutive.
- `APPLY_URL`: where the apply button points.

To mark a glossary term with an ⓘ tooltip, write `[[termId:visible text]]`, e.g. `[[mrr:MRR]]`. Valid ids: `mrr`, `safe`, `nondilutive`, `preseed`, `seed`, `seriesa`, `revshare`, `followon`, `incorporation`.

After changing rules or weights, run `npm test`. The ten founder scenarios in `src/lib/match.test.ts` will tell you if a change moved someone to the wrong fund.

### Updating `DATA_LAST_UPDATED`

When you re-check the programs against lvlup.vc, update `DATA_LAST_UPDATED` at the top of `src/data/funds.ts` (e.g. `"January 2027"`). It appears in the About dialog, the copied results and the funds page.

### Copy: `src/i18n/en.ts` and `src/i18n/ar.ts`

All interface text, question copy, glossary definitions, reason sentences and disclaimers. `ar.ts` is type-checked against `en.ts`, so a missing Arabic string fails the build. Keep Western digits and `$`, and keep fund names in English.

### Questions and branching: `src/lib/questions.ts`

Question order, options, multi-select limits and `when` conditions. Shared result links encode answers by option index, so **add new options at the end** of a list to keep old links working.

## Optional settings

Both are unset by default. Set them as GitHub repository **variables** (Settings → Secrets and variables → Actions → Variables) or in `.env.local` (see `.env.example`).

- `SUBMIT_WEBHOOK_URL`: adds an optional "stay in touch" screen (name, email, company) and POSTs answers, match and the helpful vote as JSON. When it's unset, nothing is sent anywhere and the screen doesn't exist.
- `CF_ANALYTICS_TOKEN`: adds the cookieless Cloudflare Web Analytics beacon. When it's unset, there's no analytics script.

## Deployment

### How it's served

- `wrangler.jsonc` deploys a Worker named `lvlup-fund-matching` with static assets from `dist/`. Vite builds into `dist/lvlup/`, so files are served at `/lvlup/...`.
- Routes: `kfarrag.com/lvlup*` in all 32 casings (Cloudflare route patterns are case-sensitive). **Nothing else on kfarrag.com is routed to this Worker.** Paths that merely start with `lvlup` (e.g. `/lvlupdates`) are passed straight back to the main site.
- The Worker (`worker/handler.ts`):
  - redirects `/lvlup` to `/lvlup/` and any casing (e.g. `/LvlUp/Funds`) to lowercase;
  - serves the app shell for deep links such as `/lvlup/funds` and shared result links;
  - returns real 404s for missing files;
  - adds long-lived caching for hashed assets, `no-cache` for HTML, and basic security headers.

### CI/CD (`.github/workflows/deploy.yml`)

Every push and pull request runs lint, typecheck, tests and the build. On push to `main`, the deploy job runs only if those pass. It builds, runs `wrangler deploy`, then runs `scripts/verify-deploy.sh https://kfarrag.com`. That script checks:

- the root of kfarrag.com still loads;
- `/lvlup/`, `/lvlup/funds` and shared deep links load;
- the casing and trailing-slash redirects work;
- every referenced asset and font returns 200.

**Repository secrets** (Settings → Secrets and variables → Actions → Secrets):

- `CLOUDFLARE_ACCOUNT_ID`: from the Cloudflare dashboard (Workers & Pages overview, right sidebar).
- `CLOUDFLARE_API_TOKEN`: a custom API token (My Profile → API Tokens → Create Token → Custom token) with:
  - **Account → Workers Scripts → Edit** (limited to your account)
  - **Zone → Workers Routes → Edit**, with Zone Resources set to *Specific zone → kfarrag.com*

  If a deploy fails with an authentication error, create the token from the **"Edit Cloudflare Workers"** template instead and limit it to your account and the kfarrag.com zone.

### First deploy, manually

```bash
npm run build
npx wrangler login
npx wrangler deploy
bash scripts/verify-deploy.sh https://kfarrag.com
```

### Rolling back

- **Previous version:** `npx wrangler rollback` (or Workers & Pages → `lvlup-fund-matching` → Deployments → pick a version → Rollback). Rolling back only affects `/lvlup*`.
- **Through git:** revert the commit on `main` and push; CI redeploys.
- **Take the app offline entirely:** delete the `lvlup-fund-matching` Worker (or its routes) in the dashboard. The rest of kfarrag.com is unaffected, because only `/lvlup*` was ever routed to it.

## Privacy

No cookies and no trackers. Answers and progress stay in the browser's localStorage. Nothing is sent unless the founder chooses to share, or the optional webhook is configured and they opt in.

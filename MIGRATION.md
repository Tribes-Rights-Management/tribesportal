# Watershed Migration — Execution Plan

**From:** Tribes Rights Management (Lovable + Vite SPA + Supabase + Mailgun)
**To:** Watershed (VS Code + Claude Code + Next.js App Router monorepo + Vercel + Supabase + Resend + Inngest + Algolia + Sentry)

**Confirmed assumptions**
- Web-first **Next.js (App Router)**, scaffolded as a **monorepo** so an Expo/React Native app can be added later (Solito + NativeWind).
- **Same Supabase project** — no data migration. DB, RLS, auth, storage, and edge functions stay; only the frontend connection method changes.
- **AWS compute** and **ElevenLabs voice** are deferred to post-migration feature work.

**Legend:** `[H]` = you (human), `[CC]` = Claude Code does it, you review diffs.

**Naming (locked)**
- Product name: **Watershed Portal** (replaces "Tribes Portal").
- Target repo: **`Watershed-Music-Group/watershedportal`** (private) — org already exists.
- Domains: marketing **`watershedmusicrights.com`**, app **`app.watershedmusicrights.com`**, email
  **`@watershedmusicrights.com`** (replaces `tribesrightsmanagement.com` / `app.tribesrightsmanagement.com` / `@tribesassets.com`).
- Rename rule (Phase 6): `Tribes Portal` → `Watershed Portal`, and the bare word `Tribes` →
  `Watershed`, everywhere except git history, the Supabase project id, and DB table/column names.

---

## Reconciled against repo audit — 2026-06-07

This plan supersedes `Watershed-Migration-Plan.md`. It keeps that document's phase structure but
corrects it to match the actual repository. Key deltas applied:

- **Design system is `platform-ui` (23 components), not `app-ui`.** The canonical layout/table are
  **`PlatformPageLayout`** and **`PlatformTable`** (not `AppPageLayout`/`AppTable`).
- **11 edge functions exist** (not 8 as `CLAUDE.md` claims), and there are **no "atomic song"
  functions** — the song-submit page calls `send-support-email`. Full list in Phase 5.
- **Lovable AI gateway is a real dependency**, not just config: `parse-voice/index.ts:66` and
  `analyze-message/index.ts:65` call `ai.gateway.lovable.dev` with `LOVABLE_API_KEY`. Explicit
  repoint step added (Phase 5.5).
- **There is no `returnTo` mechanism today.** Post-auth landing is `RootRedirect` + an access-state
  machine (`/pending`, `/no-access`, `/suspended`, `/restricted`). Phase 3 *builds* `returnTo` and
  ports those access-state pages + 7 guards.
- **Algolia search key + app id are hardcoded** across `useAlgoliaSearch.ts` and ~8 pages; live
  indices are **writers / publishers / deals**; sync functions use the **admin** key. Phase 5
  consolidates to one env-based module.
- **The custom Tailwind scale is a fontSize/typography scale** (2xs…4xl) + `tribes.*` color tokens
  via CSS variables — not a spacing scale. `@/*` alias and `./app/**` content glob already match.
- **No tests exist** — Phase 7 gates lint + typecheck now; tests are net-new.

> Note: `CLAUDE.md` is stale — it says 8 edge functions and lists Algolia indices
> `writers/catalog/help_articles`. Reality: 11 functions, indices `writers/publishers/deals`.

---

## Phase 0 — Decisions & provisioning `[H]`

| # | Step | Notes |
|---|------|-------|
| 0.1 | Register **`watershedmusicrights.com`** (app on `app.watershedmusicrights.com`, email `@watershedmusicrights.com`) | Domain is locked; DNS work happens in Phase 7. |
| 0.2 | Create empty **`watershedportal`** repo (private) in the existing **`Watershed-Music-Group`** org (no README/license, for a clean first push) | Keep `tribesportal` intact until cutover. |
| 0.3 | Create accounts: Vercel, Resend, Inngest, Sentry | Use the `Watershed-Music-Group` GitHub org for SSO where possible. |
| 0.4 | Confirm Supabase project ownership/billing stays on `rsdjfnsbimcdrxlhognv` | A new Supabase org re-scopes this to a full schema/data/RLS/storage migration — avoid unless required. |

**Verify:** All accounts exist; you can log into each dashboard.

---

## Phase 1 — Local environment & repo audit

| # | Step | Owner |
|---|------|-------|
| 1.1 | Install Node.js LTS, VS Code, pnpm, git (Windows: WSL2) | `[H]` |
| 1.2 | Install Claude Code VS Code extension; sign in (browser OAuth) | `[H]` |
| 1.3 | Clone `tribesportal` locally; clone the new empty `Watershed-Music-Group/watershedportal` | `[H]` |
| 1.4 | Connect Supabase MCP to Claude Code (live schema introspection) | `[H]` |
| 1.5 | Repo audit on `tribesportal` | `[CC]` — **DONE 2026-06-07** (this document is the reconciled output) |

**Verify:** ✅ Audit complete and reconciled into this plan before any code is written.

---

## Phase 2 — Monorepo & app scaffold `[CC]`, you approve

| # | Step |
|---|------|
| 2.1 | Init Turborepo + pnpm workspace |
| 2.2 | `apps/web` — Next.js (App Router, TS, Tailwind). Port `tsconfig` (`@/*` alias already correct), `tailwind.config.ts`, `postcss.config.js` — all near-portable. |
| 2.3 | `packages/ui` (from `src/components/platform-ui` + `src/components/ui`), `packages/lib` (from `src/lib`, `src/hooks`, `src/contexts`, `src/integrations`, `src/constants`, `src/config`), `packages/config` (eslint/tsconfig/tailwind presets) |
| 2.4 | Wire Tailwind to consume the custom **fontSize scale** (2xs=10px, xs=11px, sm=13px, base=14px, …) + `tribes.*` CSS-variable color tokens. Verify computed px in the browser (prior lesson). Import `src/index.css` / theme CSS in `app/layout.tsx`. |

**Verify:** `pnpm dev` boots a blank Next.js app from the monorepo; DM Sans + the typography scale render at the right px.

---

## Phase 3 — Port the core `[CC]`, you review diffs

| # | Step | Risk |
|---|------|------|
| 3.1 | Migrate `platform-ui` → `packages/ui`; add `'use client'` to `PlatformPanel` and `PlatformSectionHeader` (and the TipTap `rich-text-editor`); fix imports | Low — components port cleanly |
| 3.2 | **Rebuild routing: Vite SPA → App Router file tree** (route map below). Convert the **7 guards** (`AppProtectedRoute`, `ConsoleProtectedRoute`, `ModuleProtectedRoute`, `TribesAdminProtectedRoute`, `HelpProtectedRoute`, `AuditorProtectedRoute`, legacy `RoleProtectedRoute`) into `middleware.ts` + server layouts. Replace the ~18 files using `useNavigate`/`useLocation`/`Navigate` with `next/navigation` (`useRouter`/`usePathname`/`redirect`). Recreate `PathPreservingRedirect` variants as `next.config` redirects. | **High — the real work** |
| 3.3 | **Build** the canonical `returnTo` post-sign-in return (does not exist today). Port `RootRedirect` + the access-state machine pages (`/pending`, `/no-access`, `/suspended`, `/restricted`) and the magic-link `/auth/callback`. | Medium |
| 3.4 | Port `PlatformPageLayout`, `PlatformTable`, and the other single-canonical platform-ui patterns; convert `src/main.tsx`'s `ThemeProvider → AuthProvider` tree into a `'use client'` providers wrapper mounted in `app/layout.tsx`; move `index.html` GA tag → `next/script`, `data-ui-density` bootstrap → layout. | Low |

**Route-group → `app/` mapping** (from `src/App.tsx`, ~84 pages):

| Vite group | App Router segment | Layout / guard |
|---|---|---|
| `/sign-in`, `/check-email`, `/auth/*`, `/invite/accept` | `app/(auth)/…` | public |
| `/pending`, `/no-access`, `/suspended`, `/restricted` | `app/(access)/…` | access-state |
| `/workspaces` (+ `/home`,`/dashboard` redirects) | `app/(app)/workspaces` | `AppProtectedRoute` |
| `/licensing/*` | `app/(app)/licensing/…` | `ModuleLayout` + `ModuleProtectedRoute` |
| `/rights/*` (dynamic `:submissionId`, `:clientId`, `:songNumber/:songSlug?`, `:dealNumber`) | `app/(app)/rights/…` | `ModuleLayout` + `AppProtectedRoute` |
| `/admin/*` | `app/(admin)/admin/…` | `TribesAdminLayout` + guard |
| `/console/*` (incl. `:tenantId`, `:userId`, billing/reporting subtrees) | `app/(console)/console/…` | `SystemConsoleLayout` + `ConsoleProtectedRoute` |
| `/auditor/*` | `app/(auditor)/auditor/…` | `AuditorProtectedRoute` (standalone) |
| `/help/*` (incl. `:id`, `/new`) | `app/(help)/help/…` | `HelpWorkstationLayout` + guard |
| `/account/*` | `app/(account)/account/…` | `AccountLayout` |
| `*` | `app/not-found.tsx` | — |

**Verify:** Key pages render against staging data; navigation, the access-state redirects, and the new `returnTo` flow work; `/rights`, `/admin`, `/console` enforce their guards.

---

## Phase 4 — Supabase wiring `[CC]`, you hold secrets

| # | Step |
|---|------|
| 4.1 | Install `@supabase/ssr`; create server, browser, and middleware Supabase clients (replaces the singleton `localStorage` client in `src/integrations/supabase/client.ts`). Move hardcoded URL + anon key to env. |
| 4.2 | Reimplement auth/session for App Router (cookie-based, middleware refresh). Refactor `AuthContext` (magic-link `signInWithOtp`, `onAuthStateChange`, tenant memberships, active-tenant/context, density) off `localStorage` + `window.location.origin`. |
| 4.3 | Repoint all data calls (~43 `.from()`/`.rpc()` across ~20 files; RPCs `log_audit_event`, `approve_queue_item`, `search_entities`, `get_correlation_chain`, etc.) and storage (`help-articles`, `client-documents` via `src/lib/storage.ts`). **RLS, schema, edge functions unchanged.** |
| 4.4 | `[H]` Paste `NEXT_PUBLIC_SUPABASE_URL` + anon key (and service key where server-only) into `.env.local`. |

**Verify:** Magic-link login/logout works end-to-end; RLS still enforces role boundaries (re-test `/rights`, `/admin`, `/console`, `/auditor`).

---

## Phase 5 — Services `[CC]` build, `[H]` provide keys

Current backend = **11 Deno edge functions** (portable as-is): `accept-invite`, `analyze-message`,
`api-gateway`, `generate-disclosure-export`, `parse-voice`, `send-support-email`, `support-form`,
`support-webhook`, `sync-writers-algolia`, `sync-publishers-algolia`, `sync-deals-algolia`.

| # | Step |
|---|------|
| 5.1 | Resend + React Email — port email logic currently in `send-support-email`, `support-form`, and the inbound `support-webhook` (today: **Mailgun**, domain `mail.tribesassets.com`). |
| 5.2 | Inngest — background jobs/webhooks (email triggers; future AI reconciliation pipeline). Net-new: no realtime/background jobs exist today. |
| 5.3 | Algolia — consolidate the **hardcoded** app id `8WVEYVACJ3` + search key (in `useAlgoliaSearch.ts` + ~8 pages) into one env-based module (`NEXT_PUBLIC_ALGOLIA_*`). Indices **writers/publishers/deals**; keep client→`functions.invoke('sync-*-algolia')` indexing (admin key stays server-side). Use the unrestricted default Search key (prior 403 lesson). |
| 5.4 | Sentry — server + client error monitoring (replaces `AppErrorBoundary` + GA-only setup). |
| 5.5 | **Repoint the Lovable AI gateway** — `parse-voice/index.ts:66` and `analyze-message/index.ts:65` call `ai.gateway.lovable.dev` via `LOVABLE_API_KEY`. Switch to Anthropic (`support-webhook` already uses `ANTHROPIC_API_KEY`) and drop `LOVABLE_API_KEY`. |

**Verify:** Test email sends and lands (check SPF/DKIM headers); an Inngest function fires; Algolia search returns results; Sentry captures a forced test error; voice parse + message triage work without any `lovable.dev` call.

---

## Phase 6 — Rebrand to Watershed `[CC]`, you sign off

| # | Step |
|---|------|
| 6.1 | Global string/asset rename per the locked rule: `Tribes Portal` → `Watershed Portal`, bare `Tribes` → `Watershed`. Hit-points: `index.html` `<title>` + GA id + favicons; `src/components/brand/TribesLogo.tsx` (component name + asset); email domain `@tribesassets.com` → `@watershedmusicrights.com` + the templates in `send-support-email` / `support-form` / `support-webhook`; copy in `src/constants/`; `package.json` name; `CLAUDE.md`; `README.md`. |
| 6.2 | Update institutional tone/branding across UI + email templates. |
| 6.3 | New `CLAUDE.md` for the `watershedportal` repo (carry forward design-system law, schema canon, RLS helpers; fix the stale 8-vs-11 functions + Algolia-index notes). |

> Do the rename **after** the port so you're not chasing strings across two stacks.

**Do NOT rename:** the Supabase project id `rsdjfnsbimcdrxlhognv` (opaque), git history, or DB
table/column names (schema is untouched infra — note the `tribes.*` Tailwind color-token names are
cosmetic and *may* be renamed, but the DB `tribes`-prefixed objects must not).

**Verify:** `grep -ri "tribes" --exclude-dir=.git` returns zero results outside intentional history / the Supabase id / DB object names. Same for `tribesassets.com` and `lovable`.

---

## Phase 7 — Deploy `[H]` + `[CC]`

| # | Step | Owner |
|---|------|-------|
| 7.1 | Connect `Watershed-Music-Group/watershedportal` to Vercel; confirm per-PR preview deploys | `[H]` |
| 7.2 | Set all env vars in Vercel (prod + preview scopes): Supabase, Algolia, Resend, Inngest, Sentry, Anthropic | `[H]` |
| 7.3 | GitHub Actions CI: **lint + typecheck gates now** (no test suite exists yet); add test gate once tests are written | `[CC]` build, `[H]` enable |
| 7.4 | Resend domain verification for `watershedmusicrights.com` — SPF/DKIM/DMARC records | `[H]` |
| 7.5 | DNS cutover: point `watershedmusicrights.com` + `app.watershedmusicrights.com` to production | `[H]` |

**Verify:** Production loads on the Watershed domain; email deliverability passes; PR previews work.

---

## Phase 8 — Decommission `[H]`

| # | Step |
|---|------|
| 8.1 | Disconnect Lovable from the old repo; remove `lovable-tagger` (`package.json`) + `componentTagger` (`vite.config.ts`). |
| 8.2 | Archive `tribesportal` once Watershed is stable in prod. |
| 8.3 | Revoke unused Mailgun + `LOVABLE_API_KEY` + old API keys. |

---

## Guardrails

- **Keep auto-accept OFF** for Phases 3 and 6; review every diff.
- **Secrets never go through Claude Code** — you paste them into `.env.local` and Vercel only.
- **Supabase is untouched infrastructure** — if a step proposes schema/RLS changes during migration, stop; that's out of scope until post-MVP reconciliation.
- **Design system is law** — UI fixes go into `packages/ui` (`platform-ui`) first, then pages consume. No per-page patches.
- **One canonical pattern each** — `returnTo`, `PlatformTable`, `PlatformPageLayout`, Algolia. Delete duplicates; don't maintain parallels.

---

## Deferred (post-migration feature work)

- **AWS compute** — define the workload first (AI catalog-reconciliation pipeline or audio processing) before scaffolding.
- **ElevenLabs voice** — feature integration once core is stable.
- **Expo / React Native app** — add `apps/native` via Solito + NativeWind, reusing `packages/ui` + `packages/lib`.
- **Schema reconciliation** — deliberate post-MVP cleanup (legacy `profiles`, `articles`/`categories`, dual export systems; see `docs/SCHEMA_CANON.md`).

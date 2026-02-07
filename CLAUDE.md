# CLAUDE.md — Tribes Rights Management Portal

> This file is the single source of truth for AI-assisted development.
> Read this FIRST before making any changes to this codebase.
> Last updated: 2026-02-07

---

## What Is This Project?

Tribes Rights Management is a music publishing administration platform positioned as **"the JP Morgan of music publishing"** — institutional-grade asset management, not clerical SaaS. The platform serves songwriters, producers, rights holders, and commercial users through structured administration, rights management, licensing, and financial oversight.

**Domains:**
- Portal: `app.tribesrightsmanagement.com`
- Website: `tribesrightsmanagement.com`
- Email: `@tribesassets.com`

---

## Architecture

```
React 18 + TypeScript + Vite
├── Supabase (Postgres + Auth + Edge Functions + Storage)
├── Algolia (search — writers, catalog, help articles)
├── TipTap (rich text editing in Help Workstation)
├── Tailwind CSS (with custom institutional typography scale)
├── Radix UI primitives → shadcn/ui → app-ui design system
└── Lovable (deployment platform)
```

**Path alias:** `@/` → `./src/`

---

## Module Map

| Module | Route | Layout | Purpose | Protected By |
|--------|-------|--------|---------|-------------|
| Auth | `/sign-in`, `/auth/*` | AuthLayout | Authentication flows | None (public) |
| Workspaces | `/workspaces` | PlatformLayout | Landing hub after login | Auth |
| Rights | `/rights/*` | ModuleLayout | Song catalog, writers, submissions | Auth + module access |
| Licensing | `/licensing/*` | ModuleLayout | Agreements, requests, payments | Auth + module access |
| Admin (Tribes) | `/admin/*` | TribesAdminLayout | Catalog admin, queue, documents | TribesAdminProtectedRoute |
| Console | `/console/*` | SystemConsoleLayout | Platform governance, security, billing | PlatformAdminProtectedRoute |
| Help Workstation | `/help/*` | HelpWorkstationLayout | Knowledge base management | HelpProtectedRoute |
| Auditor | `/auditor/*` | (standalone) | External audit read-only access | AuditorProtectedRoute |
| Account | `/account/*` | AccountLayout | User profile, security, preferences | Auth |
| Client Portal | `/app/*` | AppLayout | External client views (publishing/licensing) | AppProtectedRoute + context |

---

## Design System — MANDATORY RULES

### The Golden Rule
**ALL UI changes go through the `app-ui` design system. Never patch individual pages.**

Components must be created or fixed in `src/components/app-ui/` first, then consumed by pages. This prevents fragmentation and ensures consistency.

### Component Kit by Context

| Context | Component Source | When to Use |
|---------|-----------------|-------------|
| Console (`/console/*`) | `@/components/admin` + `@/components/console` | AdminListRow, AdminMetricRow, AdminSection, ConsoleButton |
| Help Workstation (`/help/*`) | `@/components/app-ui` | All app-ui components |
| Rights/Licensing modules | `@/components/app-ui` | All app-ui components |
| Client Portal (`/app/*`) | `@/components/app-ui` | All app-ui components |
| Account settings | `@/components/app-ui` | All app-ui components |

### Prohibited Patterns (NEVER do these)

```tsx
// ❌ NEVER import raw primitives in page files
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// ✅ ALWAYS import from the design system
import { AppButton, AppCard } from "@/components/app-ui";
```

```tsx
// ❌ NEVER hardcode colors
<div className="bg-white border rounded-lg">
<div className="bg-[#1A1A1A]">

// ✅ ALWAYS use CSS variables or app-ui components
<AppCard>
<AppPanel>
```

```tsx
// ❌ NEVER create one-off section/card components in pages
const MySection = ({ title, children }) => (...)

// ✅ ALWAYS use the design system
import { AppSection, AppSectionHeader } from "@/components/app-ui";
```

```tsx
// ❌ NEVER mix component kits in the same page
import { ConsoleButton } from "@/components/console";
import { AppCard } from "@/components/app-ui";
```

### Available app-ui Components

**Layout:** AppPageHeader, AppPageContainer, AppSection, AppSectionGrid, AppSectionHeader, AppDetailRow, AppDetailRowGroup, AppSettingsCard, AppSettingsFooter
**Cards:** AppCard, AppCardHeader, AppCardTitle, AppCardDescription, AppCardBody, AppCardFooter, AppStatCard, AppStatCardGrid
**Lists:** AppListCard, AppListRow, AppListAction, AppResponsiveList, AppItemCard
**Tables:** AppTable, AppTableHeader, AppTableBody, AppTableRow, AppTableHead, AppTableCell, AppTableEmpty, AppTableBadge, AppTableTag, AppPagination
**Inputs:** AppInput, AppTextarea, AppSearchInput, AppSelect, AppCheckboxGroup
**Actions:** AppButton, AppDropdown, AppChip
**Panels:** AppPanel, AppPanelFooter
**Feedback:** AppAlert, AppEmptyState, AppDivider
**Filters:** AppFilterDrawer, AppFilterSection, AppFilterOption, AppFilterTrigger

### Typography Scale (Institutional)

```
2xs: 10px  — micro labels, timestamps
xs:  11px  — secondary labels, metadata
sm:  13px  — body secondary, table cells
base: 14px — body primary
```

Font family: DM Sans (loaded via CSS).

---

## Database Conventions

### Canonical Tables (Use These)

See `docs/SCHEMA_CANON.md` for the complete classification of all 71 tables.

**Key decisions:**
- `user_profiles` is canonical (NOT the legacy `profiles` table from migration 1)
- `help_articles` + `help_categories` are canonical (NOT the legacy `articles` + `categories`)
- `platform_role` + `portal_role` enums are canonical (NOT the legacy `app_role`)
- `writers` is the canonical writer registry
- `songs` → `song_writers` → `writers` is the canonical relationship chain
- `messages` is legacy (help widget era) — NOT for new features
- `ticket_messages` is canonical for support threads

### Naming Conventions (For All New Code)

| Element | Convention | Example |
|---------|-----------|---------|
| Table names | snake_case, plural | `song_writers`, `client_accounts` |
| Column names | snake_case | `created_at`, `client_account_id` |
| Timestamps | `created_at`, `updated_at` | Always `timestamptz` |
| Foreign keys | `{singular_entity}_id` | `writer_id`, `tenant_id` |
| Status columns | Use enums, not free text | `status song_queue_status` |
| Booleans | `is_` prefix | `is_active`, `is_controlled` |
| Soft deletes | `archived_at` or `deactivated_at` | Never hard delete governed records |

### Enums (Current Live)

```
access_level: viewer | editor | manager | approver
access_request_status: pending | processed
agreement_status: draft | active | expired | terminated
api_token_scope: platform_read | organization_read
api_token_status: active | revoked | expired
audit_action: record_created | record_updated | record_approved | record_rejected | access_granted | access_revoked | export_generated | document_uploaded | document_removed | login | logout | record_viewed
client_account_status: (check schema)
client_member_role: (check schema)
company_user_role: (check schema)
contract_status: draft | active | amended | terminated | expired
disclosure_export_status: generating | completed | failed
escalation_status: pending | escalated | resolved | expired
help_article_status: (check schema)
interested_party_type: (check schema)
invitation_status: (check schema)
invoice_status: draft | open | paid | void | uncollectible
licensing_request_status: draft | submitted | under_review | approved | rejected | cancelled
membership_status: pending | active | denied | revoked | suspended
module_type: (check schema)
notification_priority: low | normal | high | critical
notification_type: authority_change_proposal | licensing_request | payment_failure | refund_initiated | approval_timeout | security_event | export_completed | membership_change
org_role: (check schema)
payment_status: pending | processing | succeeded | failed | cancelled | refunded | partially_refunded
platform_role: platform_admin | platform_user | external_auditor
portal_context: publishing | licensing
portal_role: tenant_admin | tenant_user | viewer
recovery_event_type: backup_created | backup_verified | restore_initiated | restore_completed | restore_failed | integrity_check
refund_reason: duplicate | fraudulent | requested_by_customer | service_not_provided | other
song_queue_status: (check schema)
ui_density_mode: (check schema)
```

---

## RLS & Security Model

### Helper Functions (Use These for RLS Policies)

| Function | Purpose |
|----------|---------|
| `is_platform_admin(user_id)` | Is user a platform admin? |
| `is_external_auditor(user_id)` | Is user an external auditor? |
| `is_active_member(tenant_id)` | Is current user an active tenant member? |
| `has_tenant_role(tenant_id, role)` | Does user have a specific portal role? |
| `has_any_tenant_role(tenant_id, roles[])` | Does user have any of the listed roles? |
| `is_org_admin(org_id)` | Is user an admin of this organization? |
| `is_org_member(org_id)` | Is user a member of this organization? |
| `has_module_access(user_id, org_id, module)` | Does user have access to this module? |
| `can_manage_help()` | Can current user manage help content? |

### RLS Template for New Tables

```sql
-- Every new table MUST have:
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

-- Use helper functions, never inline subqueries
CREATE POLICY "Platform admins full access"
  ON public.new_table FOR ALL
  USING (is_platform_admin(auth.uid()));

-- Tenant-scoped access
CREATE POLICY "Tenant members can view"
  ON public.new_table FOR SELECT
  USING (is_active_member(tenant_id));
```

---

## Edge Functions

| Function | Purpose |
|----------|---------|
| `accept-invite` | Process organization/client invitation tokens |
| `analyze-message` | AI-powered support message triage (Claude API) |
| `api-gateway` | Read-only API for external integrations |
| `generate-disclosure-export` | Create regulatory disclosure packs |
| `parse-voice` | Voice-to-text for song submissions |
| `send-support-email` | Branded email delivery for support responses |
| `support-form` | Public support form submission handler |
| `sync-writers-algolia` | Sync writers registry to Algolia search index |

---

## Deployment Workflow

```
1. All code changes happen in the local repo or Claude Code
2. Commit and push to GitHub (main branch)
3. In Lovable: "Sync from GitHub" — pull latest
4. Deploy from Lovable
5. Verify: deployed version matches GitHub HEAD
```

**CRITICAL RULES:**
- **Never edit code directly in Lovable's editor.** Lovable is for deployment only.
- **Never deploy from Lovable without syncing from GitHub first.**
- **Always commit before deploying** — uncommitted changes will be lost on next sync.

---

## External Integrations

| Service | Config |
|---------|--------|
| Algolia | App ID: `8WVEYVACJ3` — indices: `writers`, `catalog`, `help_articles` |
| Supabase | Project: `rsdjfnsbimcdrxlhognv` |
| Email | Branded templates via `send-support-email` edge function, escalations to `adam@tribesassets.com` |

---

## Known Technical Debt

1. **Design system adoption at 43%** — 50 of 88 pages don't import from app-ui. See Phase 4 migration list.
2. **Legacy schema tables** — `articles`, `categories`, `messages`, `searches`, `widget_settings`, `chat_conversations`, `chat_messages` are from the help widget era. See `docs/SCHEMA_CANON.md`.
3. **19 stub pages** — Placeholder pages with < 2KB of code. Need MVP scope decision.
4. **Dual export systems** — Both `disclosure_exports` and `data_room_exports` exist with overlapping purpose.
5. **`profiles` table** — Legacy from migration 1, superseded by `user_profiles`. Still exists in DB.

---

## How to Make Changes

### Adding a New Page
1. Determine which module/context it belongs to
2. Import ONLY from the correct component kit (see table above)
3. Use the appropriate layout
4. Add the route in `App.tsx` with proper protection
5. Run the lint script: `bash scripts/lint-design-system.sh`

### Adding a New Database Table
1. Check `docs/SCHEMA_CANON.md` — does a table for this already exist?
2. Follow naming conventions above
3. Always enable RLS
4. Use helper functions for policies
5. Add the migration to `supabase/migrations/`
6. Regenerate types: update `src/integrations/supabase/types.ts`

### Modifying an Existing Component
1. If it's in `app-ui/` — fix it there, all consumers benefit
2. If it's NOT in `app-ui/` but should be — create the app-ui version first, then migrate the page
3. Never add page-specific styling that should be in the design system

---

## File Structure Quick Reference

```
src/
├── components/
│   ├── app-ui/          ← DESIGN SYSTEM (single source of truth)
│   ├── admin/           ← Console-specific components
│   ├── console/         ← Console-specific components
│   ├── app/             ← Client portal components
│   ├── auth/            ← Authentication components
│   ├── help/            ← Help workstation components
│   ├── ui/              ← Radix/shadcn primitives (DO NOT import in pages)
│   └── ...
├── pages/
│   ├── admin/           ← Tribes Admin pages (/admin/*)
│   │   ├── billing/     ← Billing governance pages
│   │   └── reporting/   ← Executive reporting pages
│   ├── app/             ← Client portal pages (/app/*)
│   │   ├── licensing/   ← Client licensing views
│   │   └── publishing/  ← Client publishing views
│   ├── auditor/         ← External auditor pages (/auditor/*)
│   ├── auth/            ← Auth flow pages
│   ├── help-workstation/ ← Help management pages (/help/*)
│   ├── modules/
│   │   ├── licensing/   ← Internal licensing module (/licensing/*)
│   │   └── rights/      ← Internal rights module (/rights/*)
│   └── workstations/    ← Workspace hub (/workspaces)
├── hooks/               ← Custom React hooks
├── contexts/            ← React contexts (Auth, Theme)
├── layouts/             ← Page layout wrappers
├── integrations/        ← Supabase client + types
├── constants/           ← Institutional copy, SLA defaults, etc.
├── config/              ← Layout config, navigation config
├── lib/                 ← Utility functions
├── services/            ← Payment service abstractions
└── styles/              ← Design tokens, theme CSS
```

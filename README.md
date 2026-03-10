# Tribes Portal

> Authenticated application and operational platform for Tribes Rights Management.

---

## Purpose

This repository contains the **Tribes Portal** — the authenticated web application that powers all operational, administrative, and governance functions for Tribes Rights Management. It is the primary interface for staff, clients, auditors, and platform administrators.

This is **not** the public marketing website. The public-facing brand site, legal pages, and unauthenticated help content live in a separate repository. See [docs/REPO_BOUNDARY.md](docs/REPO_BOUNDARY.md) for the explicit boundary.

---

## Intended Users

| User Type | Access Surface |
|-----------|---------------|
| Tribes staff (rights administration) | Rights Workstation (`/rights`) |
| Tribes staff (licensing operations) | Licensing Module (`/licensing`) |
| Client administrators and team members | Tribes Admin (`/admin`) |
| Platform owners / executives | System Console (`/console`) |
| External auditors | Auditor View (`/auditor`) |
| Help content managers | Help Workstation (`/help`) |
| All authenticated users | Account Settings (`/account`), Workspaces Hub (`/workspaces`) |

---

## Canonical Route Structure

| Route | Surface | Role |
|-------|---------|------|
| `/admin` | Tribes Admin | Client-facing workspace — catalog, documents, payments |
| `/console` | System Console | Platform governance, security, audit, billing |
| `/rights` | Rights Workstation | Staff catalog management, client relationships |
| `/licensing` | Licensing Module | Agreement and request management |
| `/help` | Help Workstation | Knowledge base content management |
| `/auditor` | Auditor View | Read-only external audit access |
| `/account` | Account Settings | User profile, security, preferences |
| `/workspaces` | Workspaces Hub | Authenticated landing — module selection |
| `/app/*` | Legacy Client Portal | Backward-compatible client views (publishing/licensing contexts) |
| `/portal/*` | Legacy redirect | Redirects to `/admin` — not a primary identity |

---

## Major Surfaces

- **Rights Workstation** — Master song catalog, writers, publishers, deals, client accounts, submission queue
- **Licensing Module** — License requests, agreements, payments, fee schedules
- **Tribes Admin** — Client-facing portal: catalog view, documents, royalty statements, settings
- **System Console** — Company-level governance: approvals, workspaces, users, security, disclosures, billing, reporting, correlation chain
- **Help Workstation** — Audiences, categories, articles, analytics for the knowledge base
- **Auditor View** — Read-only access to activity logs, access logs, licensing data, correlation chains
- **Account Settings** — Profile, security, display preferences

---

## Technology Stack

```
React 18 + TypeScript + Vite
├── Supabase (Postgres + Auth + Edge Functions + Storage)
├── Algolia (search — writers, catalog, help articles)
├── TipTap (rich text editor)
├── Tailwind CSS (institutional design tokens)
├── Radix UI → shadcn/ui → app-ui design system
└── Lovable (deployment platform)
```

---

## Local Development

```sh
# Clone the repository
git clone <repo-url>
cd tribes-portal

# Install dependencies
npm install

# Start the development server
npm run dev
```

**Requirements:** Node.js 18+ and npm. The project uses Vite for development and build.

**Path alias:** `@/` resolves to `./src/`.

---

## Environment

The application connects to:

- **Supabase** — Authentication, database, edge functions, storage
- **Algolia** — Search indices (writers, catalog, help articles)

Environment configuration is managed through Supabase client configuration in `src/integrations/supabase/client.ts`. Edge functions are deployed via Supabase CLI.

---

## Deployment

1. Commit and push to GitHub (main branch)
2. In Lovable: sync from GitHub to pull latest changes
3. Deploy from Lovable
4. Verify deployed version matches GitHub HEAD

**Rule:** Never edit code directly in the Lovable editor. Lovable is for deployment only.

---

## Relationship to Tribes Website

The **Tribes Website** is a separate repository that owns the public-facing brand site, marketing pages, legal/privacy content, and any unauthenticated public help article rendering.

This Portal repository does **not** own public marketing content, SEO landing pages, or unauthenticated brand presentation. See [docs/REPO_BOUNDARY.md](docs/REPO_BOUNDARY.md) for detailed boundary rules.

---

## Documentation

| Document | Purpose |
|----------|---------|
| [CLAUDE.md](CLAUDE.md) | AI development instructions — read first |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture and module structure |
| [docs/REPO_BOUNDARY.md](docs/REPO_BOUNDARY.md) | Portal vs Website ownership boundary |
| [docs/PLATFORM_ARCHITECTURE.md](docs/PLATFORM_ARCHITECTURE.md) | Platform hierarchy, roles, mobile rules |
| [docs/SCHEMA_CANON.md](docs/SCHEMA_CANON.md) | Database table classification |

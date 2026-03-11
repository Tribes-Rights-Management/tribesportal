# TRIBES PORTAL — ARCHITECTURE

> Concise architectural reference for the authenticated Tribes application.

---

## Role of This Repository

The Tribes Portal is the single authenticated application for all Tribes Rights Management operations. Every interaction that requires a user session — staff workflows, client access, governance, audit — occurs within this application.

The Portal is **not** the public website. It serves authenticated users only.

---

## Conceptual Surface Structure

The application is organized into **modules**, each mounted at a canonical top-level route:

| Route | Surface | Scope | Purpose |
|-------|---------|-------|---------|
| `/admin` | Tribes Admin | Client workspace | Client-facing catalog, documents, payments |
| `/console` | System Console | Company governance | Security, audit, billing, approvals, reporting |
| `/rights` | Rights Workstation | Staff operations | Master catalog, writers, publishers, deals, submissions |
| `/licensing` | Licensing Module | Organization-scoped | Agreements, requests, payments |
| `/help` | Help Workstation | Company-scoped | Knowledge base content management |
| `/auditor` | Auditor View | Read-only | External audit access to logs and correlation chains |
| `/account` | Account Settings | User-scoped | Profile, security, preferences |
| `/workspaces` | Workspaces Hub | User-scoped | Authenticated landing, module selection |
| `/app/*` | Legacy Client Views | Context-scoped | Backward-compatible publishing/licensing client views |

### Legacy and Redirect Paths

| Path | Behavior |
|------|----------|
| `/portal/*` | Redirects to `/admin/*` — legacy compatibility only |
| `/tribes-admin/*` | Redirects to `/admin/*` |
| `/tribes-licensing/*` | Redirects to `/licensing/*` |
| `/workstations` | Redirects to `/workspaces` |

---

## Authentication and Access Model

### Authentication

All routes except `/sign-in`, `/auth/*`, and `/invite/accept` require an authenticated Supabase session. Authentication uses magic link (email-based) sign-in.

### Access Layers

| Layer | Mechanism | Example |
|-------|-----------|---------|
| Authentication | Supabase Auth session | All protected routes |
| Module access | `ModuleProtectedRoute` | `/licensing` requires `licensing` module grant |
| Role-based | `ConsoleProtectedRoute`, `TribesAdminProtectedRoute`, `AuditorProtectedRoute` | Route-level role gates |
| Context-based | `AppProtectedRoute` with `requiredContext` | Legacy `/app/*` context routing |
| Membership | Tenant/organization membership checks | Organization-scoped data |

### Role Model

Roles are defined at two levels:

- **Platform roles** (`platform_role` enum): `platform_admin`, `platform_user`, `external_auditor`
- **Portal roles** (`portal_role` enum): `tenant_admin`, `tenant_user`, `viewer`
- **Client roles** (`client_member_role` enum): Client account team permissions

RLS policies use security-definer helper functions (`is_platform_admin`, `is_active_member`, `has_tenant_role`, etc.) to prevent recursive policy evaluation.

---

## Module and Layout Structure

Each surface uses a dedicated layout component:

| Surface | Layout | Navigation |
|---------|--------|------------|
| System Console | `SystemConsoleLayout` | Console sidebar (`consoleNav`) |
| Tribes Admin | `TribesAdminLayout` | Admin sidebar (`adminNav`) |
| Rights | `ModuleLayout` | Rights sidebar (`rightsNav`) |
| Licensing | `ModuleLayout` | Licensing sidebar (`licensingNav`) |
| Help Workstation | `HelpWorkstationLayout` | Help sidebar (`helpNav`) |
| Account | `AccountLayout` | Account sidebar |
| Legacy Client Portal | `AppLayout` | Context-specific navigation |

Navigation configuration lives in `src/config/moduleNav.ts` as a unified registry. Each module declares its sidebar items as data; the shared `SideNav` component renders them identically.

---

## Backend and Service Dependencies

| Service | Role | Configuration |
|---------|------|---------------|
| **Supabase** | Auth, database (Postgres), edge functions, file storage | `src/integrations/supabase/client.ts` |
| **Algolia** | Full-text search (writers, catalog, help articles) | App ID in hooks (`useAlgoliaSearch`) |
| **Lovable** | Deployment platform | Deploy via Lovable dashboard |

### Edge Functions

| Function | Purpose |
|----------|---------|
| `accept-invite` | Process invitation tokens |
| `analyze-message` | AI message triage (Claude API) |
| `api-gateway` | Read-only external API |
| `generate-disclosure-export` | Regulatory disclosure packs |
| `parse-voice` | Voice-to-text for submissions |
| `send-support-email` | Branded email delivery |
| `support-form` | Public support form handler |
| `sync-writers-algolia` | Writer index sync |
| `sync-deals-algolia` | Deal index sync |
| `sync-publishers-algolia` | Publisher index sync |

---

## Design System

The application uses a layered component architecture:

```
Radix UI primitives
  → shadcn/ui components (src/components/ui/)
    → app-ui design system (src/components/app-ui/)
      → Page components
```

**Rule:** Pages import from `app-ui`, never from `ui/` directly. Console and Auditor surfaces have their own component kits (`console/`, `admin/`) and may use `ui/` primitives directly.

Typography uses the DM Sans font family with an institutional scale (10px–14px). Colors use HSL-based CSS custom properties with semantic tokens.

---

## Architectural Principles

1. **Module isolation** — Each module owns its routes, pages, and navigation data. No module reaches into another module's internals.

2. **Design system enforcement** — All UI composition flows through the `app-ui` kit. One-off styling in pages is prohibited.

3. **Role-based access at every layer** — Routes are gated by protection components. Data is gated by RLS policies using helper functions. No client-side-only authorization.

4. **Audit everything** — All privileged actions produce immutable audit log entries with actor, timestamp, and correlation ID.

5. **Separation of governance and operations** — The System Console (`/console`) is supervisory. It never contains operational workflows, catalogs, or client-facing features.

6. **Default deny** — Access is never implicit. New surfaces must declare their permission model, audit strategy, and mobile behavior before shipping.

7. **Portal is not the website** — This repository serves authenticated users only. Public content, marketing, and brand presentation belong in the separate Tribes Website repository.

# REPO BOUNDARY — Portal vs Website

> Defines the explicit ownership boundary between the Tribes Portal repository and the Tribes Website repository.

---

## Overview

Tribes operates two primary web properties:

| Property | Domain | Repository | Purpose |
|----------|--------|------------|---------|
| **Tribes Portal** | `app.tribesrightsmanagement.com` | This repository | Authenticated application and operational platform |
| **Tribes Website** | `tribesrightsmanagement.com` | Separate repository | Public-facing brand, marketing, and informational site |

These are distinct codebases with distinct purposes. This document defines which features, content, and responsibilities belong in each.

---

## Responsibilities Owned by the Portal

The Portal owns all **authenticated operational functionality**:

- User authentication (sign-in, session management, invitation acceptance)
- Staff workstations (Rights, Licensing, Help content management)
- Client-facing admin workspace (`/admin` — catalog, documents, payments)
- System Console (`/console` — governance, security, audit, billing, reporting)
- External auditor read-only access (`/auditor`)
- User account management (profile, security, preferences)
- Workspace selection and module routing
- Role and membership enforcement (RLS, route guards)
- Edge functions that serve authenticated workflows (invitations, API gateway, exports)
- Internal help content authoring and management (Help Workstation)
- Notification and escalation systems
- Billing governance and financial oversight dashboards

### The Portal Does NOT Own

- Public marketing pages
- Public brand presentation or SEO landing content
- Unauthenticated help article rendering for public visitors
- Legal/privacy/terms pages as a primary public surface
- Public-facing contact forms that do not require authentication
- Investor or press information pages

---

## Responsibilities Owned by the Website

The Website owns all **public-facing, unauthenticated content**:

- Brand homepage and marketing messaging
- Service descriptions, value propositions
- Legal pages (Terms of Service, Privacy Policy, Cookie Policy)
- Public help center (rendered articles for unauthenticated visitors)
- Contact information and public inquiry forms
- Press, investor, and company information
- SEO, social sharing metadata, and public discoverability
- Public-facing blog or news content, if applicable

### The Website Does NOT Own

- Any authenticated user session or login flow
- Any operational workflow (requests, approvals, submissions)
- Any data mutation against the platform database
- Any administrative, governance, or audit functionality
- Any client-specific data display
- Any role-based access control

---

## Shared Backend Dependencies

Both repositories may connect to the same Supabase project for certain read-only or shared concerns:

| Dependency | Portal Usage | Website Usage |
|------------|-------------|---------------|
| **Supabase Auth** | Full authentication, session management | None (unauthenticated) |
| **Supabase Database** | Full CRUD with RLS | Read-only (if rendering published help articles) |
| **Supabase Edge Functions** | All operational functions | Limited (e.g., `support-form` for public contact) |
| **Algolia** | Staff search (writers, catalog) | Public search (help articles, if applicable) |

**Rule:** The Website must never write to operational tables. Any Website interaction with the database must be read-only against published/public content.

---

## Decision Rules for New Features

When deciding whether a new feature belongs in the Portal or Website:

### It belongs in the Portal if:

- It requires an authenticated user session
- It displays user-specific, role-specific, or organization-specific data
- It involves data creation, modification, or deletion
- It is part of an operational workflow (submissions, approvals, reviews)
- It requires role-based access control
- It produces audit log entries
- It is a governance, compliance, or financial oversight surface

### It belongs in the Website if:

- It is visible to unauthenticated visitors
- It serves a marketing, brand, or informational purpose
- It does not require knowledge of the user's identity or role
- It is primarily about public discoverability (SEO, social sharing)
- It is a legal or compliance disclosure intended for public consumption

### It may span both if:

- Published help articles are authored in the Portal's Help Workstation but rendered publicly on the Website
- A public contact form (Website) triggers a support workflow processed in the Portal
- Links on the Website direct users to the Portal's sign-in page

In spanning cases, the boundary is clear: **the Website handles the public presentation; the Portal handles the authenticated operation.**

---

## Examples

### Features That Belong in the Portal

- Song submission queue and review workflow
- Client account management and team invitations
- License request processing and agreement generation
- Royalty statement display for authenticated clients
- System Console dashboards (security, billing, approvals)
- User role assignment and permission management
- Audit log viewing for external auditors
- Help article authoring and category management

### Features That Do NOT Belong in the Portal

- "About Tribes" company overview page
- Public pricing or service tier comparison
- SEO-optimized landing pages for search traffic
- Press releases or news announcements
- Public rendering of help articles for unauthenticated readers
- Cookie consent banners for public visitors
- Social media link pages

---

## Anti-Patterns to Prevent

1. **Portal as marketing site** — The Portal must not accumulate public-facing marketing content. If a page does not require authentication, it belongs on the Website.

2. **Website as application** — The Website must not implement operational workflows, data mutations, or authenticated features. If it requires a user session, it belongs in the Portal.

3. **Duplicated content management** — Help articles are authored once in the Portal's Help Workstation. The Website renders the published output. There is no separate CMS for the Website's help content.

4. **Ambiguous ownership** — Every new feature must be explicitly assigned to one repository before implementation. "We'll figure out where it goes later" is not acceptable.

---

## Canonical Route Identities (Portal)

For clarity, the Portal's top-level routes have fixed canonical meanings:

| Route | Identity | Notes |
|-------|----------|-------|
| `/admin` | Tribes Admin workspace | Client-facing — catalog, documents, payments |
| `/console` | System Console | Company governance — not a workspace |

All documentation, navigation labels, and developer references should use `/admin` for the client-facing workspace and `/console` for platform governance.

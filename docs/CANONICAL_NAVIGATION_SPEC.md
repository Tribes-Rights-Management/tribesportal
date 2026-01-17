# Canonical Navigation & Back-Stack Enforcement — Rules v1.0

> **Status**: LOCKED (System Law)  
> **Scope**: All navigation, routing, scope transitions  
> **Last Updated**: 2026-01-17

---

## Purpose

Ensure every page knows exactly where it lives, where it came from, and where "Back" goes. Eliminate browser-history guessing, scroll inheritance, and scope leaks.

**This is system law, not preference.**

---

## Part 1: Navigation Canonicalization

### Core Principle

Navigation is **structural, not contextual**. Browser history must never determine back behavior.

### Route Declaration Requirements

Every route MUST declare:
- `parentRoute` — Explicit parent for back navigation
- `scope` — System Console | Organization | User | Auth | Public
- `entryIntent` — How the route should be accessed
- `isGovernancePage` — Whether deliberate entry is required

### Route Hierarchy Example

```
System Console (scope: system)
  └─ Governance Overview (/admin)
      └─ Active Users (/admin/users)
          └─ Member Details (/admin/users/:userId)
              └─ Authority Record (/admin/users/:userId/authority)
              └─ Permissions (/admin/users/:userId/permissions)
```

### Back Navigation Rules

1. **Back arrows always navigate to declared `parentRoute`**
2. **Back navigation may not skip hierarchy levels**
3. **Back navigation must never cross scopes** (System ↔ Organization)
4. **Browser history is never used for back navigation**

### Scroll Position Rules

On **every** route entry:
- Scroll position resets to top
- Scroll state inheritance is prohibited
- Applies to: CTA navigation, deep links, refreshes, mobile & desktop

---

## Part 2: Scope Transition & Access Boundaries

### Scope Definitions

| Scope | Description | Root Path |
|-------|-------------|-----------|
| `system` | Platform-level governance | `/admin`, `/auditor` |
| `organization` | Org-scoped workspaces | `/licensing`, `/portal`, `/app/*` |
| `user` | User account settings | `/account` |
| `auth` | Authentication flows | `/auth/*` |
| `public` | Public/boundary pages | `/`, `/restricted` |

### No Implicit Scope Switching

Users may **NOT** transition between scopes via:
- Back navigation
- Deep links
- Browser refresh

Scope changes must occur **only through explicit CTAs**.

### Explicit Scope Transition CTAs

All scope changes must use labeled actions:
- **"Enter System Console"** — org → system
- **"Return to Organization"** — system → org
- **"Enter Workspace"** — system → specific org workspace

Scope transitions must:
1. Reset navigation stack
2. Reset scroll position
3. Reset transient UI state

### Scope Validation on Load

On every route load:
1. Validate user authority for the scope
2. Validate route belongs to current scope
3. If validation fails:
   - Redirect to last valid scope root
   - Display no partial UI
   - Log validation failure (optional audit)

### Authority Pages

Authority, permissions, governance, and audit pages:
- Are **read-only by default**
- May not be accessed through indirect navigation
- Must require deliberate entry from a valid parent page
- Set `isGovernancePage: true` in route definition

---

## Part 3: Entry Intent Types

### Intent Definitions

| Intent | Description | Example Routes |
|--------|-------------|----------------|
| `navigation` | Standard nav CTA | Most pages |
| `deep-link` | Direct URL allowed | Overview pages |
| `explicit-only` | Requires intent tracking | Cross-scope transitions |
| `redirect` | System redirect only | Auth callback, error pages |

### Governance Pages

Pages with `isGovernancePage: true`:
- Cannot be accessed via bookmarks without re-validation
- Require coming from a valid parent in the same scope
- Display institutional "deliberate entry required" if accessed incorrectly

---

## Part 4: Invalid Entry Handling

If a route is accessed without valid parent context:
1. Do not partially render
2. Redirect to nearest valid parent route
3. Reset scroll and state

### Redirect Priority

1. Nearest registered parent in same scope
2. Scope root path
3. Role-appropriate default (admin → `/admin`, user → `/app`)

---

## Part 5: Implementation Files

| File | Purpose |
|------|---------|
| `src/hooks/useRouteMetadata.ts` | Canonical route registry with parent declarations |
| `src/hooks/useScopeTransition.ts` | Scope boundary enforcement |
| `src/hooks/useDeepLinkValidation.ts` | Deep-link validation |
| `src/hooks/useScrollReset.ts` | Scroll position reset |
| `src/components/ui/back-button.tsx` | Scope-safe back navigation components |

### Component Usage

```tsx
// Scope-safe back button
import { BackButton } from "@/components/ui/back-button";
<BackButton showLabel />

// Scope transition CTA
import { ScopeTransitionButton } from "@/components/ui/back-button";
<ScopeTransitionButton targetScope="system" />
<ScopeTransitionButton targetScope="organization" targetPath="/licensing" />
```

---

## Part 6: Future Feature Inheritance

Any new module (billing, payments, messaging, reporting, exports):
- **MUST** declare scope ownership
- **MUST** be registered in route registry
- **MUST** inherit navigation and scope rules automatically
- **MUST NOT** introduce cross-scope shortcuts

These constraints are **architectural** and cannot be bypassed.

---

## What This Gives You

✅ Back arrows always go exactly where expected  
✅ Pages always load scrolled to the top  
✅ No "why am I here?" moments  
✅ No authority or governance drift  
✅ Mobile behaves like desktop  
✅ Future features can't break the model  

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-17 | Initial canonical navigation and scope enforcement spec |

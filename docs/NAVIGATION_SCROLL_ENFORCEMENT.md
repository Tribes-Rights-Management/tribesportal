# Navigation & Scroll State Enforcement — Canonical Rules v1.0

> **Status**: LOCKED (Platform-Wide Enforcement)  
> **Scope**: All navigation, routing, and scroll behavior  
> **Last Updated**: 2026-01-17

---

## Purpose

These rules ensure predictable, intentional navigation across the Tribes platform. Every page load must feel anchored and composed.

---

## A. Scroll Position Rules (Global)

### Implementation

Every route change resets scroll position to top via `useScrollReset` hook in all layout components:
- `AppLayout.tsx`
- `SystemConsoleLayout.tsx`
- `ModuleLayout.tsx`

### Rules

1. Every route change must reset scroll to top of primary content container
2. No page may inherit scroll position from previous route
3. Enforced centrally at layout level, not per-page
4. Uses `requestAnimationFrame` to ensure DOM is ready

---

## B. Scope-Safe Navigation Rules

### Implementation

Route metadata in `useRouteMetadata.ts` declares:
- **scope**: system | organization | user | auth | public
- **parentPath**: Explicit parent route (not browser history)
- **label**: Human-readable route name

### Back Navigation Behavior

| From | Back → To |
|------|-----------|
| Member Details | Active Users |
| Authority Record | Member Details |
| Organization Settings | Organization Overview |
| Permissions | Active Users |

### Prohibited

- ❌ Jump from scoped detail to global directory
- ❌ Cross scope boundaries (org → system) via back button
- ❌ Browser-history-only back behavior

---

## C. Route Ownership

Each page declares:
- Owning scope (System, Organization, User)
- Valid parent route

If user lands outside valid scope → redirect to scoped parent.

---

## D. Design Invariant

> "Every page load must feel intentional, anchored, and composed."

If a user asks "Why did I land here instead of the top?" — the system has failed.

---

## E. Files Implementing This Spec

| File | Purpose |
|------|---------|
| `src/hooks/useScrollReset.ts` | Centralized scroll reset on route change |
| `src/hooks/useRouteMetadata.ts` | Route scope and parent declarations |
| `src/layouts/AppLayout.tsx` | Applies scroll reset to main container |
| `src/layouts/SystemConsoleLayout.tsx` | Applies scroll reset to main container |
| `src/layouts/ModuleLayout.tsx` | Applies scroll reset to main container |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-17 | Initial enforcement spec |

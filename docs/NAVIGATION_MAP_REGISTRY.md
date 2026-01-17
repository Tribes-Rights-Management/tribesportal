# Navigation Map Registry & Deep-Link Safety — Canonical Rules v1.0

> **Status**: LOCKED (Platform-Wide Enforcement)  
> **Scope**: All navigation, routing, deep-link access  
> **Last Updated**: 2026-01-17

---

## Purpose

These rules ensure deterministic, scope-aware, and consistent navigation across the Tribes platform. Navigation is **structural, not contextual**. Browser history must never determine back behavior.

---

## A. Navigation Map Registry

### Core Principle

Every route declares exactly one logical parent route. Routes without explicit parent are root-level only.

### Implementation

Canonical registry in `src/hooks/useRouteMetadata.ts`:

```typescript
interface RouteDefinition {
  scope: RouteScope; // "system" | "organization" | "user" | "auth" | "public"
  parentPath: string | null;
  label: string;
  requiredRoles?: ("admin" | "auditor" | "user")[];
  requiredPermission?: string;
  breadcrumbs?: string[];
}
```

### Parent Mapping Examples

| Route | Parent | Scope |
|-------|--------|-------|
| `/admin` | null (root) | system |
| `/admin/users` | `/admin` | system |
| `/admin/users/:userId` | `/admin/users` | system |
| `/admin/users/:userId/permissions` | `/admin/users/:userId` | system |
| `/licensing` | null (root) | organization |
| `/licensing/requests` | `/licensing` | organization |
| `/portal/agreements` | `/portal` | organization |

---

## B. Back Navigation Enforcement

### Rules

1. **Back arrow always navigates to declared parent** — never browser history
2. **Back behavior never relies on referrer or stack depth**
3. **Back navigation never skips levels** — always immediate parent
4. **Cross-scope back navigation prohibited** — requires explicit transition

### Component

Use `<BackButton />` from `src/components/ui/back-button.tsx`:

```tsx
import { BackButton } from "@/components/ui/back-button";

// In page header
<BackButton showLabel />
```

---

## C. Scope Integrity

### Scope Isolation Rules

| Scope | May Link To | Must Not Link To |
|-------|-------------|------------------|
| `system` | system, user | organization (without transition) |
| `organization` | organization, user | system (without transition) |
| `user` | user, organization, system | — |
| `auth` | any (post-auth redirect) | — |
| `public` | any | — |

### Cross-Scope Transitions

Cross-scope navigation requires:
- Explicit CTA (e.g., "Enter Workspace" modal)
- Confirmation of intent
- Full navigation state reset

---

## D. Deep-Link Safety & Validation

### Core Principle

No page may render unless the user has:
1. Valid authentication
2. Valid scope access
3. Valid authority/role
4. Valid parent context

### Implementation

Use `useDeepLinkValidation` hook from `src/hooks/useDeepLinkValidation.ts`:

```typescript
const { isValid, invalidReason, redirectPath } = useDeepLinkValidation({
  autoRedirect: true // Automatically redirect on invalid
});
```

### Validation Order

1. Check if route is registered
2. Validate authentication (for non-public routes)
3. Validate profile exists and is active
4. Validate scope access
5. Validate required roles
6. Validate required permissions

### On Validation Failure

- Redirect to nearest valid parent (never upward past scope)
- Never expose partial UI, data, or controls
- Optionally generate audit event

---

## E. Entry Normalization

All route entries (including deep links) must:

1. Reset scroll position to top (`scrollTop = 0`)
2. Reset layout state
3. Render from top boundary
4. Never inherit scroll position from previous page

This is enforced via `useScrollReset` in all layout components.

---

## F. Mobile Parity

Mobile and desktop share the **same navigation graph**:

- Same parent mappings
- Same scope rules
- Same back behavior
- No mobile-only shortcuts or collapses

---

## G. Route Registration Requirement

Any new route MUST be registered in the navigation map registry.

### Registration Checklist

- [ ] Route added to `routeRegistry` in `useRouteMetadata.ts`
- [ ] `parentPath` explicitly declared
- [ ] `scope` correctly set
- [ ] `requiredRoles` or `requiredPermission` defined if protected
- [ ] `breadcrumbs` array populated for UI

### Unregistered Route Behavior

Routes not registered:
- Fail safely
- Redirect to nearest valid parent
- No partial rendering

---

## H. Files Implementing This Spec

| File | Purpose |
|------|---------|
| `src/hooks/useRouteMetadata.ts` | Canonical route registry and navigation utilities |
| `src/hooks/useDeepLinkValidation.ts` | Deep-link validation hook |
| `src/hooks/useScrollReset.ts` | Scroll position reset on route change |
| `src/components/ui/back-button.tsx` | Scope-safe back button component |
| `src/layouts/*.tsx` | Layouts apply scroll reset via `useScrollReset` |

---

## I. What This Gives You

After this enforcement:

✅ Back arrows always go where users expect  
✅ Pages always load from the top  
✅ No one lands in the wrong scope  
✅ Authority surfaces impossible to access accidentally  
✅ Desktop and mobile behavior match  
✅ Future features inherit safety by default  

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-17 | Initial Navigation Map Registry and Deep-Link Safety spec |

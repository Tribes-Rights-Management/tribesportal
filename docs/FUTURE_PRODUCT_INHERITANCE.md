# Future Product Inheritance Rules — Canonical Spec v1.0

> **Status**: LOCKED (Platform-Wide Enforcement)  
> **Scope**: All new features, modules, and products  
> **Last Updated**: 2026-01-17

---

## Purpose

Any new product, module, or feature added to the Tribes platform must inherit the established governance, navigation, and authority architecture. This ensures platform integrity is maintained as the system scales.

---

## Mandatory Declarations

Every new product/module MUST declare:

### 1. Scope Declaration

```typescript
scope: "system" | "organization"
```

- **System**: Company-level governance (System Console)
- **Organization**: Workspace-scoped operations

### 2. Authority Requirements

```typescript
requiredRoles?: ("admin" | "auditor" | "user")[];
requiredPermission?: Permission;
```

All access is **default-deny**. Permissions must be explicitly granted.

### 3. Navigation Inheritance

New routes MUST be registered in `src/hooks/useRouteMetadata.ts`:

```typescript
"/new-module": {
  scope: "organization",
  parentPath: null,
  label: "New Module",
  requiredPermission: "newmodule.view",
  breadcrumbs: ["New Module"]
}
```

### 4. Audit Requirements

All sensitive actions MUST:
- Generate immutable audit events via `log_audit_event()`
- Include correlation IDs for cross-workspace tracing
- Never allow UPDATE/DELETE on audit records

### 5. Mobile Behavior

Declare mobile strategy:
- **Full flow**: All operations available
- **Read-only**: Inspection only, no primary actions
- **Restricted**: Specific features hidden with "Available on desktop" notice

---

## Inherited Rules (Non-Negotiable)

### Navigation

- Back navigation uses explicit parent declarations, never browser history
- Cross-scope transitions require explicit CTAs
- No workspace selector in System Console

### Authority

- Billing authority separate from operational authority
- No user may configure billing AND submit payments at same scope
- All authority changes are rare governance events

### Mobile

- 44px minimum touch targets
- Secondary text uses `line-clamp-2`
- Tables collapse to vertical card stacks
- Modals become bottom sheets

### Audit

- All exports are append-only with watermarks
- Generation of disclosure packs restricted to Platform Executives
- External auditors have read-only access only

---

## Registration Checklist

Before shipping any new feature:

- [ ] Route registered in `useRouteMetadata.ts`
- [ ] `parentPath` explicitly declared
- [ ] `scope` correctly set
- [ ] `requiredRoles` or `requiredPermission` defined
- [ ] Audit logging for sensitive actions
- [ ] Mobile behavior validated
- [ ] No cross-scope navigation without explicit transition

---

## Enforcement

Any attempt to:
- Ship unregistered routes
- Bypass default-deny permissions
- Allow cross-scope drift
- Skip audit logging for governance actions

**Must be blocked.**

---

## Implementation Files

| File | Purpose |
|------|---------|
| `src/hooks/useRouteMetadata.ts` | Route registry |
| `src/hooks/useRoleAccess.tsx` | Permission resolution |
| `src/hooks/useScopeTransition.ts` | Scope boundary enforcement |
| `src/hooks/useBillingAuthority.ts` | Financial governance |
| `docs/BILLING_PAYMENTS_GOVERNANCE.md` | Billing hierarchy spec |
| `docs/NAVIGATION_MAP_REGISTRY.md` | Navigation rules |

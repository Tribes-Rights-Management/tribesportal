# Navigation & Future Product Enforcement — Canonical Rules v1.0

> **Status**: LOCKED (Platform-Wide Enforcement)  
> **Scope**: All navigation, routing, and future product development  
> **Last Updated**: 2026-01-17

---

## Purpose

These rules are authoritative and must not be bypassed by UI shortcuts, routing hacks, or future feature additions. Any new product, feature, or module touching users, navigation, or data must inherit these constraints by default.

---

## A. Navigation Scope Enforcement

### Scope Isolation Rules

| Surface | Scope | May Display | Must Not Display |
|---------|-------|-------------|------------------|
| System Console | Company-level | Audit, Security, Disclosures, Governance | Licensing, Client Portal, Org data |
| Licensing Workspace | Organization | Licensing nav, org-scoped data | System Console links, other orgs |
| Client Portal Workspace | Organization | Portal nav, org-scoped data | System Console links, other orgs |

### Rendering Rules

| Rule | Enforcement |
|------|-------------|
| Scope before navigation | Resolve scope before rendering any nav items |
| No optimistic rendering | Never show nav items that may be unauthorized |
| No partial nav states | Either fully authorized or fully hidden |
| Role-based pruning | Use `useRoleAccess` to filter visible items |

### Route Guard Requirements

| Layer | Enforcement |
|-------|-------------|
| Client-side | `RoleProtectedRoute` checks before render |
| Server-side | RLS policies enforce data access |
| Both layers | Must agree; client is convenience, server is truth |

---

## B. Scope Hierarchy

```
COMPANY LEVEL (System Console)
│
├── /admin/* routes
├── Governance surfaces only
├── No product navigation
└── Platform Executive access required

ORGANIZATION LEVEL (Workspaces)
│
├── /app/licensing/* routes
│   └── Licensing Workspace
│       └── Org-scoped data only
│
├── /app/publishing/* routes
│   └── Client Portal Workspace
│       └── Org-scoped data only
│
└── Active membership required

USER LEVEL (Self-service)
│
├── /account/* routes
├── Profile preferences only
└── No authority control
```

---

## C. Organization Switching

### Context Change Rules

| Rule | Implementation |
|------|----------------|
| Explicit switch required | `WorkspaceSelectorModal` is the only entry point |
| Context reset on switch | Clear navigation state, re-evaluate permissions |
| No blended contexts | One active workspace at a time |
| No auto-selection | User must explicitly choose workspace |

### Permission Re-evaluation

When switching organizations:

1. Clear cached permissions
2. Fetch new membership status
3. Validate `allowed_contexts` for new org
4. Re-render navigation based on new scope
5. Redirect to workspace landing if current route unauthorized

### Access Requirements

| Requirement | Check |
|-------------|-------|
| Active membership | `status = 'active'` in `tenant_memberships` |
| Context authorization | `allowed_contexts` includes target context |
| Route permission | Role grants access to specific route |

---

## D. Future Product Inheritance

### Scope Declaration (Required)

Every new feature must declare exactly one scope:

| Scope | Description | Example Features |
|-------|-------------|------------------|
| `system` | Company-level governance | Audit logs, Security settings, Disclosures |
| `organization` | Org-scoped operations | Licensing requests, Portal documents |
| `user` | Self-service only | Profile preferences, Notification settings |

### Authority Model Inheritance

| Rule | Enforcement |
|------|-------------|
| No independent permissions | Must use existing `useRoleAccess` system |
| No custom role checks | Must use `hasPermission()` from hook |
| No direct RLS bypasses | Must use established helper functions |
| No shadow permission tables | All permissions in canonical tables |

### Prohibited Patterns

| Pattern | Why Prohibited |
|---------|----------------|
| Feature-specific role tables | Fragments authority model |
| Inline permission checks | Bypasses centralized enforcement |
| Optimistic UI for permissions | May show unauthorized content |
| Cross-scope data joins | Breaks tenant isolation |
| Feature-level auth tokens | Creates parallel auth systems |

### Authority Mutation Centralization

| Rule | Implementation |
|------|----------------|
| Single authority service | All mutations through `authority_events` |
| No feature-level grants | Features cannot grant/revoke access |
| Audit trail required | All changes logged with actor |
| Approval flow required | High-risk changes need dual control |

---

## E. Cross-Scope Data Rules

### Prohibited Access Patterns

| Pattern | Why Prohibited |
|---------|----------------|
| Org A querying Org B data | Tenant isolation violation |
| Feature joining across orgs | Data leakage risk |
| User accessing other user's data | Privacy violation |
| Workspace accessing System Console data | Scope boundary violation |

### Permitted Aggregation (System Console Only)

Platform Executives may view:

| Data Type | Scope | Access Mode |
|-----------|-------|-------------|
| Aggregate counts | All orgs | Read-only |
| Audit logs | All orgs | Read-only |
| Authority events | All orgs | Read-only |
| Security metrics | Platform | Read-only |

**Key constraint**: Aggregated data is read-only and displayed in System Console only.

---

## F. Implementation Checklist

### Before Adding Any Navigation

- [ ] Scope declared (system / organization / user)
- [ ] `useRoleAccess` integration complete
- [ ] Route guard added (`RoleProtectedRoute`)
- [ ] RLS policies cover new tables
- [ ] Navigation item uses `shouldRenderNavItem()`

### Before Adding Any Feature

- [ ] Scope inheritance documented
- [ ] No custom permission system created
- [ ] Authority mutations use centralized service
- [ ] Cross-scope queries blocked by RLS
- [ ] Audit logging integrated

### Before Adding Any Product

- [ ] Product scope declared in architecture doc
- [ ] Permission namespace added to `useRoleAccess`
- [ ] Navigation items registered with scope guards
- [ ] Route guards enforce membership requirements
- [ ] Mobile parity confirmed

---

## G. Enforcement Hierarchy

| Priority | Check | Failure Mode |
|----------|-------|--------------|
| 1 | Server-side RLS | Query returns empty / error |
| 2 | Client-side route guard | Redirect to access restricted |
| 3 | Navigation pruning | Nav item not rendered |
| 4 | UI surface pruning | Component not rendered |

All layers must pass. Client-side is UX convenience; server-side is security truth.

---

## H. Related Documents

| Document | Purpose |
|----------|---------|
| `PLATFORM_ARCHITECTURE.md` | System/Workspace hierarchy |
| `AUTHORITY_GOVERNANCE_DECISIONS.md` | Authority enforcement rules |
| `useRoleAccess.tsx` | Permission checking hook |
| `RoleProtectedRoute.tsx` | Route guard component |
| `WorkspaceSelectorModal.tsx` | Context switching UI |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-17 | Initial navigation and product inheritance rules |

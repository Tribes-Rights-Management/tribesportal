# Authority & Governance Enforcement — Canonical Rules v1.0

> **Status**: LOCKED (Platform-Wide Enforcement)  
> **Scope**: All users, roles, permissions, and access surfaces  
> **Last Updated**: 2026-01-17

---

## Purpose

These rules are authoritative and must not be bypassed by UI shortcuts, inline edits, or future feature additions. Any new feature touching users, permissions, roles, or access must inherit these constraints by default.

---

## A. Roles and Scopes

| Role | Scope | Description |
|------|-------|-------------|
| Platform Executive | System Console | Company-level governance, global oversight |
| Tribes Admin | Internal Workspace | Operational authority, org membership management |
| Organization Admin | Organization only | Org-scoped user and role management |
| Standard Member | Self only | Profile preferences, no authority control |

---

## B. Global Invariants

These rules apply universally:

| Rule | Enforcement |
|------|-------------|
| No self-editing of authority | `actor.id !== target.id` required |
| Authority history is immutable | Database triggers prevent UPDATE/DELETE |
| All changes generate events | `authority_events` table, append-only |
| Inspection is default | Read-only until explicit edit intent |
| Authority flows top-down | Platform → Workspace → Organization |
| Organizations are sandboxed | No cross-org visibility without platform grant |
| Editing is rare and deliberate | Single CTA: "Propose Authority Change" |

---

## C. Editing Permissions Matrix

### Platform Executive

| Action | Allowed |
|--------|---------|
| Assign platform/system roles | ✓ |
| Suspend or reactivate accounts | ✓ |
| Grant cross-organization access | ✓ |
| Revoke cross-organization access | ✓ |
| Approve high-risk authority changes | ✓ |
| View all authority history | ✓ |
| Export authority records | ✓ |

### Tribes Admin (Internal Workspace)

| Action | Allowed |
|--------|---------|
| Manage organization memberships | ✓ |
| Assign org-scoped roles | ✓ |
| Handle approvals (if delegated) | ✓ |
| Assign platform/system roles | ✗ (unless delegated) |
| View cross-org history | ✗ |

### Organization Admin

| Action | Allowed |
|--------|---------|
| Manage users within org | ✓ |
| Assign roles within org | ✓ |
| View org authority history | ✓ |
| Affect platform-level access | ✗ |
| View other orgs' history | ✗ |

### Standard Member

| Action | Allowed |
|--------|---------|
| Edit profile preferences | ✓ |
| Edit own authority | ✗ |
| Edit own role | ✗ |
| Edit own access status | ✗ |
| View own authority history | ✓ |

---

## D. UI Enforcement Rules

### Default States

| Element | State | Reason |
|---------|-------|--------|
| Authority fields | Read-only | Inspection is default |
| Role assignments | Read-only | Requires explicit intent |
| Access status | Read-only | Governance decision |
| Membership status | Read-only | Admin-controlled |

### Prohibited Patterns

| Pattern | Why Prohibited |
|---------|----------------|
| Inline toggles for authority | Accidental changes |
| Dropdown edits for roles | Too casual for governance |
| Auto-save on authority fields | Silent changes |
| Bulk authority changes without review | Audit trail gaps |

### Required Patterns

| Pattern | Implementation |
|---------|----------------|
| Single explicit CTA | "Propose Authority Change" button |
| Disabled control microcopy | "Role changes require admin approval" |
| Confirmation dialog | `AppModal` with diff preview |
| Audit reason field | Required for all changes |

---

## E. Visibility Rules

| Role | Own History | Org History | Platform History | All Orgs |
|------|-------------|-------------|------------------|----------|
| Platform Executive | ✓ | ✓ | ✓ | ✓ |
| Tribes Admin | ✓ | ✓ | ✗ | ✗ |
| Organization Admin | ✓ | ✓ | ✗ | ✗ |
| Standard Member | ✓ | ✗ | ✗ | ✗ |

---

## F. Export Rules

| Rule | Specification |
|------|---------------|
| Who can export | Platform Executives only |
| Export logging | Every export generates authority event |
| Export format | PDF primary, CSV secondary |
| Export content | Timeline, actors, scopes, decisions |
| Prohibited exports | Internal IDs, system notes, cross-org combined data |

---

## G. Authority Hierarchy (Canonical Model)

```
SYSTEM CONSOLE (Company-Level)
│
├── Platform Executive
│   ├── Global governance
│   ├── Platform roles
│   ├── Cross-org authority
│   └── Audit + exports
│
└── Tribes Admin (Internal Workspace)
    ├── Operational authority
    ├── Org membership management
    ├── Org-scoped role assignment
    └── Approval handling (if delegated)

ORGANIZATION WORKSPACES (Isolated)
│
├── Tribes Licensing (Org)
│   ├── Org Admin
│   │   ├── Manage users in Licensing
│   │   ├── Assign Licensing roles
│   │   └── View org authority history
│   │
│   └── Members
│       └── Licensing access only
│
└── Tribes Client Portal (Org)
    ├── Org Admin
    │   ├── Manage users in Client Portal
    │   ├── Assign Client roles
    │   └── View org authority history
    │
    └── Members
        └── Client access only
```

---

## H. Key Invariants (Memorize)

1. **Authority flows top-down** — Platform → Workspace → Organization
2. **Organizations are sandboxed** — No cross-org visibility without explicit grant
3. **Platform authority ≠ organization authority** — Different scopes, different powers
4. **History is permanent** — Append-only, no rewrites
5. **Editing is rare, deliberate, and logged** — Single CTA, audit trail required

---

## I. Locked Governance Decisions

### Decision 1: Per-Change Approval Model

**✅ Use Per-Change Approval for high-risk authority changes**

- Every high-risk authority change is reviewed and approved individually
- Approval is tied to a specific change, not a general editing session
- Each action stands on its own in the audit trail

| Change | Approval Required |
|--------|-------------------|
| Grant Org Admin | Yes (individual) |
| Remove Export Rights | Yes (individual) |
| Add View-only access | No |

### Decision 2: Event-Based Authority Timeline

**✅ Use Event-Based Authority Timeline as the primary history view**

A chronological record of authority **events**, not raw diffs.

Each entry answers:
- **Who** did what
- **To whom** it was done
- **When** it happened
- **Why** (reason, if provided)
- **With what approval** (approver, if applicable)

### Decision 3: Governance System Posture

**✅ Treat authority management as a governance system, not SaaS settings**

| Aspect | Governance System ✅ | SaaS Settings ❌ |
|--------|---------------------|-----------------|
| Tone | Formal, institutional | Casual, helpful |
| Changes | Deliberate, reviewed | Instant, reversible |
| History | Immutable record | Optional logs |
| Language | "Proposed", "Approved" | "Saved", "Updated" |

---

## J. Enforcement Checklist

Before shipping any feature that touches authority:

- [ ] Self-editing blocked (`actor.id !== target.id`)
- [ ] Authority fields are read-only by default
- [ ] Single "Propose Authority Change" CTA (not inline edits)
- [ ] Confirmation dialog with diff preview
- [ ] Audit reason field required
- [ ] Authority event generated on change
- [ ] Visibility respects role scope
- [ ] Export actions logged
- [ ] Mobile parity with desktop

---

## K. Exception Process

To modify a locked decision:

1. Document the proposed change and rationale
2. Review with Platform Executive(s)
3. Assess impact on audit trail and compliance
4. Update all dependent specs if approved
5. Log decision change in version history

---

## L. Related Documents

| Document | Purpose |
|----------|---------|
| `AUTHORITY_UX_CANON.md` | UI rendering rules |
| `AUTHORITY_VIEW_SPEC.md` | Page layout specifications |
| `AUTHORITY_APPROVAL_MODEL.md` | Dual-control workflow |
| `AUTHORITY_HISTORY_VISIBILITY.md` | Role-scoped visibility |
| `AUTHORITY_HISTORY_TIMELINE.md` | Event-based timeline spec |
| `AUTHORITY_EXPORT_RETENTION.md` | Export and retention rules |
| `AUTHORITY_DISASTER_RECOVERY.md` | DR guarantees |
| `AUTHORITY_IMPLEMENTATION_READINESS.md` | Implementation timing |
| `IMMUTABLE_AUTHORITY_EVENTS.md` | Database immutability |
| `EDIT_AUTHORITY_GOVERNANCE.md` | Edit flow contract |
| `HIGH_RISK_AUTHORITY_CHANGES.md` | Risk classification |
| `PERMISSIONS_DIFF_SPEC.md` | Diff view requirements |
| `APPROVAL_UI_LANGUAGE.md` | Institutional copy |
| `REQUIRED_AUTHORITY_EXPORTS.md` | Required export formats |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-17 | Initial locked decisions |
| 1.1 | 2026-01-17 | Consolidated enforcement rules, hierarchy diagram, complete permissions matrix |

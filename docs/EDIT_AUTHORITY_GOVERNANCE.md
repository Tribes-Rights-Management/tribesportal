# Edit Authority Flow — UX + Governance Contract v1.0

> **Status**: CANONICAL  
> **Scope**: All authority modification workflows  
> **Last Updated**: 2026-01-17

---

## Purpose

Enable intentional, auditable changes to user authority without allowing accidental or implicit permission drift.

---

## Core Principles

1. **Authority changes are rare, deliberate, and reviewable**
2. **Inspection is always the default state**
3. **Editing is an explicit mode, never inline or ambient**

---

## A. Authorization Matrix

### Who Can Edit Authority

| Actor | Platform Authority | Organization Authority |
|-------|-------------------|------------------------|
| Platform Executive | ✓ Full | ✓ Full |
| Org Admin | ✗ None | ✓ Own org only |
| Tenant User | ✗ None | ✗ None |
| Viewer | ✗ None | ✗ None |

### Self-Edit Prohibition

**No one can edit their own authority.**

This is a hard constraint. If `actor.id === target.id`, the edit flow must not be available.

---

## B. Entry Conditions

An Edit Authority flow may **only** be entered if:

1. The viewer has sufficient privileges (see matrix above)
2. The target user is not the viewer
3. The action is initiated explicitly via a primary CTA

### CTA Language (Canonical)

```
"Propose Authority Change"
```

Not:
- "Edit"
- "Modify"
- "Update permissions"

The word "Propose" signals that this is a deliberate, reviewable action.

---

## C. Flow Structure

### Step 1: Current State Summary

Display before any changes:

- Platform role
- Organization memberships
- Effective capabilities (grouped by scope)

**Rule**: This is read-only. No controls.

### Step 2: Proposed Changes

Permitted modifications:

- Add / remove organization memberships
- Change organization role
- Modify context access (Publishing, Licensing)

**Prohibited**:

- Raw capability toggling (unless required for advanced scenarios)
- Inline edits
- Auto-save

### Step 3: Review Step (Required)

Before confirmation, display:

- Human-readable summary of impact
- Permissions Diff View (see separate spec)
- Any cascading effects disclosed

**Rule**: This step cannot be skipped.

### Step 4: Confirm with Intent

Requirements:

- Explicit confirmation button with clear language
- Optional reason field (stored for audit)
- Processing state with backdrop lock

**Confirmation Button Language**:

```
"Confirm Authority Change"
```

---

## D. Hard Prohibitions

| ❌ Prohibited | Why |
|--------------|-----|
| Inline edits on inspection screens | Conflates viewing and editing |
| Auto-save | Prevents review and audit |
| Silent cascades | Changes must be disclosed |
| Dropdowns in read-only views | Creates false editability |
| Self-modification | Prevents privilege escalation |

---

## E. Audit Requirements

Every authority change **must** record:

| Field | Description |
|-------|-------------|
| `actor_id` | Who made the change |
| `actor_email` | Email of the actor |
| `target_user_id` | User whose authority changed |
| `timestamp` | UTC timestamp |
| `before_state` | JSON snapshot of previous authority |
| `after_state` | JSON snapshot of new authority |
| `reason` | Optional reason provided by actor |
| `correlation_id` | Links related audit events |

### Audit Action Types

```typescript
type AuthorityAuditAction =
  | 'authority_change_proposed'
  | 'authority_change_confirmed'
  | 'authority_change_rejected'
  | 'authority_change_reverted';
```

---

## F. UI Component Contract

### Propose Authority Change Button

```tsx
// Only renders if:
// 1. Viewer has sufficient privileges
// 2. Target is not the viewer
<Button
  variant="outline"
  onClick={onProposeChange}
  disabled={isCurrentUser || !hasEditAuthority}
>
  Propose Authority Change
</Button>
```

### Confirmation Dialog

Must use `AppModal` with:

- `preventsClose={processing}` during submission
- Clear impact statement
- Permissions Diff View embedded
- Reason field (optional)

---

## G. Future Extensions

This contract supports future additions without modification:

- **Dual Control**: Require second approver for sensitive changes
- **Approval Workflows**: Route changes through approval queue
- **External Auditor Review**: Notify auditors of authority changes
- **Time-Limited Authority**: Automatic expiration of grants

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-17 | Initial governance contract |

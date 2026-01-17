# Authority View Specification v1.0

> **Status**: CANONICAL  
> **Scope**: All member, role, permission, and authority-related views  
> **Last Updated**: 2026-01-17

---

## Overview

This specification governs the presentation of user authority across the Tribes platform. All authority-related views must conform to this hierarchy and these rules to ensure institutional consistency, semantic clarity, and governance integrity.

---

## Canonical Authority Hierarchy

Authority is represented in exactly **four layers**, in this order only:

| Layer | Scope | Mutability |
|-------|-------|------------|
| 1. Identity | User account | Immutable |
| 2. Platform Authority | System-wide | Admin-controlled |
| 3. Organization Memberships | Tenant-scoped | Admin-controlled |
| 4. Governance & Audit | Reference | Read-only |

**Rule**: This hierarchy must never be reordered, merged, or omitted.

---

## Member Details (Parent View)

### Purpose
Member Details is the **authoritative summary view** for a user. It provides a complete overview of identity and authority without exposing edit controls to unauthorized viewers.

### File Reference
`src/components/admin/MemberDetailsSheet.tsx`

### Section 1: Identity

**Fields**:
- Email (monospace, full display)
- Account Status (pill: Active / Suspended / Revoked)
- Account Created (formatted date)

**Rules**:
- ❌ Identity fields are **never** rendered as form inputs
- ❌ No disabled inputs for display-only data
- ✅ Use read-only text rows and status pills

### Section 2: Platform Authority

**Fields**:
- Platform Role (single value, displayed as pill)
- Helper text explaining role scope

**Self-View Rule**:
```
"You cannot modify your own access."
```

**Other-View Rule**:
```
"Platform-level authority applies across all organizations."
```

**Navigation**:
- "View Authority Record" action opens child sheet

### Section 3: Organization Memberships

**Layout**: Each organization rendered as a distinct card

**Card Contents**:
- Organization Name (header)
- Organization Role (pill)
- Context Access (Publishing, Licensing badges)
- Membership Status (pill)

**Rules**:
- ❌ No tables inside cards
- ❌ No horizontal scrolling
- ✅ Vertical stacking only

### Section 4: Governance

**Default State**: Collapsed

**Contents**:
- Record Created timestamp
- Audit statement: "Authority changes are logged and timestamped."

**Rules**:
- Visually de-emphasized (muted colors, smaller type)
- No operational controls

---

## Authority Record (Child View)

### Purpose
Authority Record is a **detailed inspection view** showing the complete capability matrix. It is NOT an editor unless explicitly unlocked.

### File Reference
`src/components/admin/AuthorityRecordSheet.tsx`

### Navigation Rules

| Action | Result |
|--------|--------|
| Open Authority Record | Opens from Member Details |
| Back navigation | Returns to Member Details |
| Close | Closes to Member Details |

**Critical**: Never route directly back to Member Directory. The navigation stack must be preserved.

### Layout Requirements

- Full-height sheet (mobile: bottom sheet, desktop: side panel)
- Single-column layout
- Vertical scrolling only
- ❌ No horizontal scrolling sections

### Content Order

1. **User Identity Summary** (read-only header)
2. **Platform-Level Capabilities**
3. **Organization-Level Capabilities** (one section per org)
4. **Audit Metadata** (last, de-emphasized)

### Capabilities Presentation

**Display Format**: Informational labels, not interactive controls

```tsx
// ✅ CORRECT: Label presentation
<div className="px-3 py-1.5 text-[12px] rounded">
  View
</div>

// ❌ WRONG: Button or toggle
<button onClick={...}>View</button>
<Switch checked={canView} />
```

**Grouping**:
1. Platform-level capabilities (derived from `platform_role`)
2. Organization-level capabilities (derived from `portal_role` per tenant)

**Standard Capabilities**:
- View
- Submit
- Approve
- Execute
- Export
- Administer

**Visual States**:
- Granted: Elevated background, full opacity
- Not granted: Transparent, reduced opacity (40-50%)

---

## Prohibitions (Global)

These rules apply to ALL authority-related views:

| ❌ Prohibited | ✅ Required Alternative |
|--------------|------------------------|
| Disabled form inputs for display | Read-only text rows |
| Grid-button layouts on mobile | Vertical label lists |
| Permissions as toggles/switches | Informational pills |
| Mixing audit with operations | Separate sections |
| Empty gray bars | Status pills or text |
| Horizontal scroll containers | Vertical stacking |

---

## Role-Based View Behavior

### Self-Viewing
- All fields read-only
- Lock message displayed
- No edit actions available

### Viewing Other Users (Non-Admin)
- All fields read-only
- No lock message needed
- No edit actions available

### Viewing Other Users (Platform Admin)
- Fields remain read-only by default
- "Enter Edit Mode" action available (when implemented)
- Confirmation dialogs required for changes

---

## Semantic Rules

### Status Pill Colors

```typescript
const getStatusColor = (status: MembershipStatus) => {
  switch (status) {
    case "active":
      return { bg: "rgba(34, 197, 94, 0.15)", text: "#4ade80" };
    case "pending":
      return { bg: "rgba(234, 179, 8, 0.15)", text: "#facc15" };
    case "suspended":
      return { bg: "rgba(249, 115, 22, 0.15)", text: "#fb923c" };
    case "revoked":
    case "denied":
      return { bg: "rgba(239, 68, 68, 0.15)", text: "#f87171" };
  }
};
```

### Role Formatting

```typescript
// Platform roles
"platform_admin" → "Platform Administrator"
"platform_user" → "Platform User"
"external_auditor" → "External Auditor"

// Organization roles
"tenant_admin" → "Administrator"
"tenant_user" → "Member"
"viewer" → "Viewer"
```

---

## Audit Metadata Standards

**Required Fields**:
- Record Created (timestamp)
- Last Modified (timestamp, when available)

**Optional Fields**:
- Granted By (actor email)
- Granted On (timestamp)

**Statement** (always display):
```
"Authority changes are logged and timestamped."
```

---

## Mobile Integrity

### Minimum Tap Targets
All interactive elements: 44px minimum

### Typography
- Section headers: 10px uppercase, 0.08em tracking
- Labels: 11-12px, muted color
- Values: 13-15px, primary/secondary color
- Monospace for emails and timestamps

### Wrapping
- `line-clamp-2` for secondary descriptions
- `break-all` for emails
- `break-words` for long values

---

## Implementation Checklist

When building or reviewing authority views, verify:

- [ ] Hierarchy follows Identity → Platform → Organization → Governance
- [ ] No disabled inputs for display-only data
- [ ] Status values use pills, not form controls
- [ ] Capabilities shown as labels, not buttons
- [ ] Navigation preserves stack (Authority Record → Member Details)
- [ ] Mobile layout is single-column, vertical
- [ ] Audit section is collapsed by default
- [ ] Self-view includes lock message
- [ ] All tap targets ≥ 44px

---

## Related Files

- `src/components/admin/MemberDetailsSheet.tsx`
- `src/components/admin/AuthorityRecordSheet.tsx`
- `src/pages/admin/PermissionsPage.tsx`
- `src/components/admin/CapabilitiesMatrix.tsx`
- `src/components/admin/AuditMetadata.tsx`

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-17 | Initial specification |

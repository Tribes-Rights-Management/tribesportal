# Authority UX Canon v1.0

> **Status**: CANONICAL  
> **Scope**: All user, membership, and authority-related views  
> **Last Updated**: 2026-01-17

---

## Purpose

This is the conceptual contract the Tribes application must obey.  
Everything else is implementation detail.

---

## A. Authority Model (Canonical)

### Identity
- Immutable user identity (email, name, creation date)
- Never editable in admin UI
- Display-only

### Membership
- Relationship between a user and an organization
- Multiple memberships allowed
- Memberships **inherit** authority, they do not define it

### Authority
- Assignment of role + scope + capabilities
- Exists at:
  - **Platform level** (system-wide)
  - **Organization level** (tenant-scoped)
- Authority is **inspectable by default**, editable only via explicit workflow

### Capabilities
- Atomic permissions: View, Submit, Approve, Execute, Export, Administer
- Always grouped by scope
- Never shown as form controls unless in edit mode

---

## B. Page Intent Definitions

### Member Directory

**Purpose**: Directory listing for user discovery

**Rules**:
- Display-only listing (no inline editing)
- Status and role shown as pills
- Row click opens Member Details
- No disabled inputs
- Mobile: Vertical card list

---

### Member Details

**Purpose**: Quick identity + status overview

**Rules**:
- No editable controls (read-only by default)
- No disabled inputs
- Status shown as pill
- CTA allowed: "View Authority Record"
- Structured sections:
  1. Identity
  2. Platform Authority
  3. Organization Memberships
  4. Governance (collapsed)

---

### Authority Record

**Purpose**: Immutable inspection surface

**Rules**:
- Read-only by default
- No form elements
- No grey placeholder bars
- Structured as vertical sections:
  1. Identity Summary
  2. Current Authority (Platform)
  3. Scope Assignments (Organizations)
  4. Capabilities Matrix (labels, not buttons)
  5. Audit Metadata (collapsed)

---

## C. UI Prohibitions (Non-Negotiable)

The system must **never** use:

| ❌ Prohibited | Why |
|--------------|-----|
| Disabled inputs to display data | Creates visual confusion |
| Horizontal scrolling for admin data | Mobile integrity violation |
| Grid button layouts for permissions on mobile | Unusable on small screens |
| Grey bars with no semantic meaning | Visual noise |
| Back navigation that skips hierarchy | Navigation contract violation |

---

## D. Navigation Law

Routing must always follow this hierarchy:

```
Member Directory
  └── Member Details
        └── Authority Record
```

### Rules

| Rule | Implementation |
|------|----------------|
| Back navigation | Returns to immediate parent only |
| No level skipping | Authority Record → Member Details (never → Member Directory) |
| Stack preservation | Parent views remain mounted |

---

## E. Component Semantic Rules

### Status Display

**Always use pills, never form controls:**

```tsx
// ✅ CORRECT
<span 
  className="px-2.5 py-1 rounded text-[12px]"
  style={{ 
    backgroundColor: getStatusColor(status).bg,
    color: getStatusColor(status).text,
  }}
>
  {formatStatus(status)}
</span>

// ❌ WRONG
<Select value={status} disabled>
  <SelectTrigger>...</SelectTrigger>
</Select>
```

### Role Display

**Always use pills or text, never disabled selects:**

```tsx
// ✅ CORRECT
<span className="px-2.5 py-1 rounded text-[12px]">
  {formatRole(role)}
</span>

// ❌ WRONG
<Select value={role} disabled>
  <SelectTrigger>...</SelectTrigger>
</Select>
```

### Capabilities Display

**Always use labels, never buttons or toggles:**

```tsx
// ✅ CORRECT
<div className="flex flex-wrap gap-2">
  {capabilities.map((cap) => (
    <span key={cap} className="px-2.5 py-1 rounded text-[11px]">
      {cap}
    </span>
  ))}
</div>

// ❌ WRONG
<div className="grid grid-cols-3 gap-2">
  {capabilities.map((cap) => (
    <button key={cap} onClick={...}>{cap}</button>
  ))}
</div>
```

---

## F. Mobile-Specific Rules

### Layout
- Single-column only
- Vertical stacking
- No horizontal scroll containers

### Touch Targets
- Minimum 44px height for all interactive elements
- Full-width buttons in forms

### Typography
- Primary text: 15px
- Secondary text: 13px with line-clamp-2 (wrap, never truncate to one line)
- Labels: 11-12px uppercase

---

## G. Applied Pages

This canon applies consistently to:

- `UserDirectoryPage` (Member Directory)
- `MemberDetailsSheet` (Member Details)
- `AuthorityRecordSheet` (Authority Record)
- `PermissionsPage` (Authority Record - full page variant)
- `TenantsPage` (Organization listing)
- `ApprovalsPage` (Access approval queue)

---

## H. Enforcement Checklist

When building or reviewing authority-related views:

- [ ] No disabled inputs for display-only data
- [ ] Status values use pills, not form controls
- [ ] Role values use pills, not form controls
- [ ] Capabilities shown as labels, not buttons
- [ ] Navigation returns to immediate parent
- [ ] Mobile layout is single-column, vertical
- [ ] No horizontal scrolling on mobile
- [ ] Secondary text wraps (line-clamp-2), never truncates
- [ ] All tap targets ≥ 44px
- [ ] Audit metadata is last and de-emphasized

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-17 | Initial canon |

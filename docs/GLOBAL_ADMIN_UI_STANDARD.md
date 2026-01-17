# Global Admin UI Standard v1.0

> **Status**: CANONICAL  
> **Scope**: All admin, system, and governance views  
> **Last Updated**: 2026-01-17

---

## Purpose

Admin and system views must communicate **authority**, **structure**, and **trust**.  
They must never resemble consumer settings pages or editable forms unless explicitly intended.

This standard applies to:
- Member management
- Role management
- Organization administration
- Approval flows
- System console pages
- All governance surfaces

---

## Semantic Rules (Non-Negotiable)

### Display-Only Data

Read-only data must **NEVER** be rendered as:

| ❌ Prohibited | Why |
|--------------|-----|
| Disabled inputs | Implies editability that doesn't exist |
| Empty grey bars | Creates visual confusion |
| Faux form controls | Misleads user expectations |
| Greyed-out selects | Suggests broken functionality |

**Required alternatives:**

| ✅ Correct Pattern | Use Case |
|-------------------|----------|
| Text rows | Simple key-value display |
| Definition lists | Grouped metadata |
| Status pills | State values (Active, Pending, etc.) |
| Read-only cards | Grouped entity data |

### Editable Controls

Editable controls (inputs, selects, toggles) are **only permitted** when:

1. The user has explicit permission to edit the data
2. The UI is in an explicit "edit" state (mode toggle or dedicated edit view)

**Default state is always read-only.**

---

## Visual Hierarchy & Scannability

### Authority Hierarchy

Every admin page must clearly distinguish three layers:

```
┌─────────────────────────────────────┐
│  PRIMARY AUTHORITY                  │  ← What governs
│  (Role, Status, Identity)           │
├─────────────────────────────────────┤
│  SECONDARY SCOPE                    │  ← Where it applies
│  (Organizations, Contexts)          │
├─────────────────────────────────────┤
│  REFERENCE METADATA                 │  ← Audit / History
│  (Timestamps, Actors)               │
└─────────────────────────────────────┘
```

### Visual Priority Order

Content must be styled in this priority sequence:

1. **Headers** — Largest, boldest, primary color
2. **Values** — Clear, readable, secondary emphasis
3. **Helper text** — Smaller, muted, explanatory
4. **Audit metadata** — Smallest, most muted, de-emphasized

### Typography Scale

```css
/* Headers */
.admin-section-header {
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--platform-text-muted);
}

/* Values */
.admin-value {
  font-size: 14-15px;
  color: var(--platform-text);
}

/* Helper text */
.admin-helper {
  font-size: 12px;
  color: var(--platform-text-muted);
}

/* Audit metadata */
.admin-audit {
  font-size: 11-12px;
  font-family: monospace;
  color: var(--platform-text-secondary);
}
```

---

## Audit Metadata Rules

### Placement
- **Always last** in the layout
- **Never interleaved** with controls or operational data
- Collapsed by default when not primary content

### Styling
- Visually de-emphasized (muted colors, smaller type)
- Use monospace for timestamps
- Group in dedicated section with clear boundary

### Required Statement
All audit sections must include:
```
"Changes are logged and timestamped."
```

---

## Mobile Admin Rules

### Prohibitions

| ❌ Never on Mobile |
|-------------------|
| Grid-button permission layouts |
| Horizontal scrolling containers |
| Side-by-side card layouts |
| Multi-column data displays |

### Requirements

| ✅ Required on Mobile |
|----------------------|
| Single-column layout |
| Vertical stacking only |
| Grouped labels for capabilities |
| Visible section headers during scroll |
| Minimum 44px tap targets |

### Capabilities Presentation

```tsx
// ✅ CORRECT: Vertical label list
<div className="flex flex-wrap gap-2">
  <span className="px-2.5 py-1 rounded text-[11px]">View</span>
  <span className="px-2.5 py-1 rounded text-[11px]">Submit</span>
  <span className="px-2.5 py-1 rounded text-[11px]">Export</span>
</div>

// ❌ WRONG: Grid of buttons
<div className="grid grid-cols-3">
  <button>View</button>
  <button>Submit</button>
  <button>Export</button>
</div>
```

---

## Navigation Contract

### Stack Integrity

Child admin views must return to their **immediate parent** — never skip levels.

```
Member Directory
    └── Member Details      ← Back returns here
            └── Authority Record
```

### Navigation Rules

| Rule | Implementation |
|------|----------------|
| Back navigation | Returns to immediate parent |
| Close action | Closes current view only |
| Stack preservation | Parent view remains mounted |
| Deep linking | Must reconstruct proper stack |

### Anti-patterns

```tsx
// ❌ WRONG: Skipping to root
<Link to="/admin/users">Back</Link>  // From Authority Record

// ✅ CORRECT: Return to parent
<button onClick={() => setAuthorityRecordOpen(false)}>Back</button>
```

---

## Component Reuse Requirements

### Shared Admin Components

These components are **canonical** and must be reused:

| Component | Purpose | Location |
|-----------|---------|----------|
| `AdminListRow` | Mobile list items | `src/components/admin/AdminListRow.tsx` |
| `MemberDetailsSheet` | Member summary view | `src/components/admin/MemberDetailsSheet.tsx` |
| `AuthorityRecordSheet` | Capability inspection | `src/components/admin/AuthorityRecordSheet.tsx` |
| `PermissionConfirmDialog` | Authority change confirmation | `src/components/admin/PermissionConfirmDialog.tsx` |
| `AuditMetadata` | Timestamp display | `src/components/admin/AuditMetadata.tsx` |
| `CapabilitiesMatrix` | Read-only capability display | `src/components/admin/CapabilitiesMatrix.tsx` |

### Anti-patterns

```tsx
// ❌ WRONG: Reimplementing shared patterns
const MyCustomMemberCard = () => { ... }

// ✅ CORRECT: Using shared component
import { AdminListRow } from "@/components/admin/AdminListRow";
```

---

## Status Pill Standards

### Colors

```typescript
const STATUS_COLORS = {
  active: { bg: "rgba(34, 197, 94, 0.15)", text: "#4ade80" },
  pending: { bg: "rgba(234, 179, 8, 0.15)", text: "#facc15" },
  suspended: { bg: "rgba(249, 115, 22, 0.15)", text: "#fb923c" },
  revoked: { bg: "rgba(239, 68, 68, 0.15)", text: "#f87171" },
  denied: { bg: "rgba(239, 68, 68, 0.15)", text: "#f87171" },
  default: { bg: "rgba(255,255,255,0.06)", text: "var(--platform-text)" },
};
```

### Sizing

```css
.status-pill {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
```

---

## Card & Panel Standards

### Elevated Surfaces

All admin content must sit on elevated surfaces, never directly on the page canvas.

```tsx
// Standard admin card
<div
  className="rounded-lg p-5"
  style={{ 
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--platform-border)',
  }}
>
  {/* Content */}
</div>
```

### Section Separation

Use visual boundaries between sections:

```tsx
// Border separator
<div style={{ borderTop: '1px solid var(--platform-border)' }} />

// Or spacing
<div className="space-y-8">
  <section>...</section>
  <section>...</section>
</div>
```

---

## Read-Only Value Rows

### Standard Pattern

```tsx
// Key-value row
<div className="flex items-center justify-between">
  <span 
    className="text-[12px]"
    style={{ color: 'var(--platform-text-muted)' }}
  >
    Label
  </span>
  <span 
    className="text-[14px]"
    style={{ color: 'var(--platform-text)' }}
  >
    Value
  </span>
</div>
```

### With Status Pill

```tsx
<div className="flex items-center justify-between">
  <span className="text-[12px]" style={{ color: 'var(--platform-text-muted)' }}>
    Status
  </span>
  <div 
    className="inline-flex items-center px-2.5 py-1 rounded text-[12px] font-medium"
    style={{ 
      backgroundColor: getStatusColor(status).bg,
      color: getStatusColor(status).text,
    }}
  >
    {formatStatus(status)}
  </div>
</div>
```

---

## Collapsible Sections

### Default Collapsed

Governance and audit sections should be collapsed by default:

```tsx
<Collapsible open={governanceOpen} onOpenChange={setGovernanceOpen}>
  <CollapsibleTrigger asChild>
    <button className="w-full flex items-center justify-between py-3">
      <span className="text-[10px] font-medium uppercase tracking-[0.08em]">
        Governance
      </span>
      {governanceOpen ? <ChevronDown /> : <ChevronRight />}
    </button>
  </CollapsibleTrigger>
  <CollapsibleContent>
    {/* Audit metadata */}
  </CollapsibleContent>
</Collapsible>
```

---

## Self-View Rules

When a user views their own record:

1. All fields remain read-only
2. Display lock message: `"You cannot modify your own access."`
3. Hide all edit actions
4. Authority Record remains accessible (inspection only)

---

## Compliance Checklist

When building or reviewing admin views, verify:

- [ ] No disabled inputs for display-only data
- [ ] No empty grey bars or faux controls
- [ ] Hierarchy: Primary → Secondary → Reference
- [ ] Audit metadata is last and de-emphasized
- [ ] Mobile layout is single-column, vertical
- [ ] Navigation returns to immediate parent
- [ ] Shared components are reused
- [ ] Status values use pills, not form controls
- [ ] All tap targets ≥ 44px
- [ ] No horizontal scrolling on mobile

---

## Related Specifications

- [Authority View Spec](./AUTHORITY_VIEW_SPEC.md) — Member/permission views
- [UI Modal Standard](./UI_MODAL_STANDARD.md) — Modal/sheet patterns
- [Platform Architecture](./PLATFORM_ARCHITECTURE.md) — System hierarchy

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-17 | Initial specification |

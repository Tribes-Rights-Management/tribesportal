# Permissions Diff View — Semantic Contract v1.0

> **Status**: CANONICAL  
> **Scope**: All authority change review surfaces  
> **Last Updated**: 2026-01-17

---

## Purpose

Make authority changes obvious, explainable, and defensible.

---

## Core Question

The diff answers one question:

> **"What is different now, and why does it matter?"**

---

## A. What Is Diffed (Semantic, Not Mechanical)

### Included

| Category | Examples |
|----------|----------|
| Access Scopes | Publishing, Licensing, Platform |
| Roles | Added, removed, or changed |
| Effective Capabilities | Grouped by scope, human-readable |

### Excluded

| Category | Why |
|----------|-----|
| Raw boolean flags | Implementation noise |
| Internal permission IDs | Not human-readable |
| Capability checksums | Developer concern only |
| Unchanged system defaults | Irrelevant to decision |

---

## B. Diff Structure

The diff is presented as three sections:

### 1. Added

Human-readable grants:

```
Publishing: Submit & View
Licensing: Request licenses
Organization: Acme Music → Member
```

### 2. Removed

Human-readable removals:

```
Approval authority (Platform)
Organization: Legacy Corp → Removed
```

### 3. Unchanged

- **Collapsed by default**
- Only shown on expand
- De-emphasized visually

---

## C. Readability Rules

| Rule | Implementation |
|------|----------------|
| Read like sentences | "Can now submit publishing requests" |
| Group by scope first | Platform → Org → Context |
| No abbreviations | "Publishing" not "PUB" |
| No internal terms | "Submit" not "licensing.submit" |
| Use impact language | "Will lose approval authority" |

---

## D. Visual Presentation

### Added Items

```tsx
<div className="flex items-start gap-3 py-2">
  <Plus className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
  <span className="text-[14px] text-foreground">
    Publishing: Submit & View
  </span>
</div>
```

### Removed Items

```tsx
<div className="flex items-start gap-3 py-2">
  <Minus className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
  <span className="text-[14px] text-foreground">
    Approval authority (Platform)
  </span>
</div>
```

### Unchanged Section

```tsx
<Collapsible>
  <CollapsibleTrigger className="text-[12px] text-muted-foreground">
    Show unchanged ({unchangedCount})
  </CollapsibleTrigger>
  <CollapsibleContent>
    {/* Muted, de-emphasized list */}
  </CollapsibleContent>
</Collapsible>
```

---

## E. Usage Points

The Permissions Diff View appears in:

| Context | Trigger |
|---------|---------|
| Edit Authority review step | Before confirmation |
| Approval flows | When reviewing pending changes |
| Audit history views | When inspecting past changes |
| Activity log detail | When expanding authority events |

---

## F. Non-Goals

This is **not**:

- A comparison tool for debugging
- A developer-facing diff
- A raw data inspector
- A real-time change tracker

**It is for decision-makers.**

---

## G. Data Contract

### Input Format

```typescript
interface AuthorityDiffInput {
  before: {
    platformRole: PlatformRole;
    memberships: OrganizationMembership[];
    capabilities: EffectiveCapability[];
  };
  after: {
    platformRole: PlatformRole;
    memberships: OrganizationMembership[];
    capabilities: EffectiveCapability[];
  };
}
```

### Output Format

```typescript
interface AuthorityDiff {
  added: DiffItem[];
  removed: DiffItem[];
  unchanged: DiffItem[];
}

interface DiffItem {
  scope: 'platform' | 'organization' | 'context';
  category: 'role' | 'membership' | 'capability';
  label: string; // Human-readable
  organizationName?: string; // If org-scoped
}
```

---

## H. Sentence Templates

### Role Changes

| Change Type | Template |
|-------------|----------|
| Platform role added | "Platform authority: {role}" |
| Platform role removed | "Platform authority removed" |
| Platform role changed | "Platform authority: {oldRole} → {newRole}" |

### Membership Changes

| Change Type | Template |
|-------------|----------|
| Membership added | "Organization: {orgName} → {role}" |
| Membership removed | "Organization: {orgName} → Removed" |
| Role changed | "Organization: {orgName} → {oldRole} → {newRole}" |

### Capability Changes

| Change Type | Template |
|-------------|----------|
| Capability granted | "{scope}: {capabilities}" |
| Capability revoked | "{scope}: {capabilities} (removed)" |

---

## I. Accessibility

- Use semantic list markup (`<ul>`, `<li>`)
- Include `aria-label` on diff sections
- Ensure color is not the only indicator (icons required)
- Support screen reader announcements for change counts

---

## J. Integration with Audit

When a Permissions Diff is displayed:

1. Log view event if inspecting historical change
2. Include diff summary in authority change audit record
3. Preserve diff data for compliance export

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-17 | Initial semantic contract |

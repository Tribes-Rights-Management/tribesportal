# User Journey & UX Affordances — Canonical Reference v1.0

> **Status**: LOCKED (Platform-Wide Reference)  
> **Scope**: End-to-end user experience, navigation, and governance UX  
> **Last Updated**: 2026-01-17

---

## Purpose

This document proves the system is coherent, humane, and institutional—not heavy. It defines how governance becomes invisible strength, not friction.

---

## Part 1: Canonical User Journey

### 1. Login → Scope Resolution

**What happens (invisible to user)**:

| Step | System Action |
|------|---------------|
| 1 | User signs in |
| 2 | Resolve `platform_role` |
| 3 | Resolve `org_memberships[]` |
| 4 | Check `last_active_scope` (if any) |

**What the user experiences**:

| Experience | Status |
|------------|--------|
| Choice screens | None |
| Error states | None |
| Wrong navigation flash | None |

**Landing logic**:

| Role | Landing Surface |
|------|-----------------|
| Platform Executive | System Console (`/admin`) |
| Org Admin only | Their org workspace |
| Multi-org user | Last active workspace |
| No active membership | Access Pending (`/auth/unauthorized`) |

> **UX signal**: This feels calm, not complex.

---

### 2. System Console (Executives Only)

**What the user sees**:

| Element | Content |
|---------|---------|
| Header | "SYSTEM CONSOLE" |
| Layout | Neutral, restrained |
| Product links | None (no Licensing, no Client Portal) |

**Primary actions**:

- View governance overview
- Review audits
- Manage users at company level
- Export records

> **UX signal**: "This is oversight, not operations." Nothing here feels like day-to-day work.

---

### 3. Entering an Organization Workspace

**How it happens**:

1. User opens Workspace Switcher
2. Selects organization
3. Label uses "Workspace" terminology:
   - "Enter Workspace: Tribes Licensing"

**What changes**:

| Element | Before | After |
|---------|--------|-------|
| Navigation | System Console nav | Org-specific nav |
| Header subtitle | "SYSTEM CONSOLE" | "WORKSPACE · Licensing" |
| System Console links | Visible | Hidden |
| Workspace context bar | Hidden | Visible |

> **UX signal**: This feels like crossing a boundary, not clicking a tab.

---

### 4. Organization Workspace

**What the user sees**:

| Element | Content |
|---------|---------|
| Navigation | Org-specific only |
| Actions | Familiar product actions |
| Authority surfaces | Present but restrained |

**Authority UX posture**:

| Element | State |
|---------|-------|
| Roles | Visible (read-only) |
| History | Visible (read-only) |
| Editing | Gated behind explicit CTA |

**Prohibited patterns**:

- Inline toggles
- Auto-save on authority fields
- Accidental changes

---

### 5. Attempting a Restricted Action

**What happens**:

| Step | System Behavior |
|------|-----------------|
| 1 | Control is disabled or hidden |
| 2 | Microcopy explains restriction |
| 3 | No alerts, no friction |

**Correct microcopy**:

```
"This action is restricted to organization administrators."
```

**Prohibited microcopy**:

```
"You don't have permission"
"Access denied"
"Error: insufficient privileges"
```

> **UX signal**: Calm, not punitive.

---

### 6. Switching Contexts

**Rules**:

| Action | Behavior |
|--------|----------|
| Switch orgs | Reset navigation state |
| Return to System Console | Explicit action required |
| State leakage | None permitted |
| Mixed scopes | Never displayed |

**User never wonders**:

> "Where am I right now?"

---

## Part 2: UI Affordances

### 1. Default Read-Only Is a Feature

**Design posture**:

| Element | Treatment |
|---------|-----------|
| Authority fields | Intentionally static appearance |
| Typography | "Record" feel, not "form" feel |
| Spacing | Generous, settled |

**Implementation**:

```tsx
// Correct: Read-only value row
<div className="flex justify-between py-3 border-b border-border">
  <span className="text-muted-foreground">Role</span>
  <span className="font-medium">Organization Admin</span>
</div>

// Wrong: Disabled input
<Input value="Organization Admin" disabled />
```

> **Result**: Users trust what they see because it doesn't look editable.

---

### 2. Editing Is a Mode, Not a State

**Pattern**:

| Step | Action |
|------|--------|
| 1 | Single CTA: "Propose Authority Change" |
| 2 | Visual mode change |
| 3 | Gravity introduced |
| 4 | Importance signaled |

**Implementation**:

```tsx
// Inspection mode (default)
<AuthorityRecord user={user} />
<Button variant="outline" onClick={enterEditMode}>
  Propose Authority Change
</Button>

// Edit mode (explicit)
<AuthorityChangeForm 
  user={user} 
  onCancel={exitEditMode}
  onConfirm={submitChange}
/>
```

> **Precedent**: This is how Stripe, banks, and internal finance tools behave.

---

### 3. Language Removes Anxiety

**Prohibited phrases**:

| Phrase | Why Prohibited |
|--------|----------------|
| "You don't have permission" | Accusatory |
| "Access denied" | Hostile |
| "Error" | Technical |
| "Oops" | Casual |
| "Sorry" | Apologetic |

**Correct phrases**:

| Context | Phrase |
|---------|--------|
| Restricted action | "This setting affects access and responsibility." |
| Disabled control | "Changes are restricted to authorized administrators." |
| Role explanation | "This role determines available actions within this workspace." |

> **Result**: Feels institutional, not punitive.

---

### 4. Navigation Confirms, Never Teaches

**Principle**: Users don't learn the system from menus. Menus confirm where they already are.

**Header always answers**:

| Question | Answer Source |
|----------|---------------|
| Who am I? | Avatar / email |
| Where am I? | Context label |
| What scope is this? | Subtitle (System Console / Workspace · Org) |

**Implementation**:

```tsx
<header className="h-14 border-b border-border">
  <div className="flex items-center justify-between">
    <span className="text-xs tracking-widest text-muted-foreground">
      SYSTEM CONSOLE
    </span>
    <Avatar user={user} />
  </div>
</header>
```

> **Validation**: If a user must think, the system failed.

---

### 5. Mobile Feels Equivalent, Not Reduced

**Same on mobile**:

| Element | Parity |
|---------|--------|
| Scopes | ✓ Same |
| Rules | ✓ Same |
| Boundaries | ✓ Same |
| Permissions | ✓ Same |

**Ergonomic differences only**:

| Desktop | Mobile |
|---------|--------|
| Side navigation | Stacked navigation |
| Centered modals | Bottom sheets |
| Hover tooltips | Tap to reveal |

**Prohibited mobile patterns**:

| Pattern | Why Prohibited |
|---------|----------------|
| Hidden permissions | Governance parity required |
| "Lite" experience | Reduces institutional trust |
| Horizontal scrolling | Mobile integrity violation |

---

## Part 3: Validation Criteria

### This System Achieves:

| Goal | How |
|------|-----|
| Prevents accidental authority drift | Read-only default, explicit edit mode |
| Scales to staff, partners, auditors | Role-scoped visibility, clean boundaries |
| Keeps UX calm and minimal | No alerts, institutional language |
| Makes governance inevitable, not imposed | Invisible strength, not friction |

### Trust Signals:

| Signal | Implementation |
|--------|----------------|
| Static authority fields | "This is a record, not a form" |
| Explicit mode switching | "Editing is deliberate" |
| Institutional language | "This is permanent infrastructure" |
| Scope clarity | "I always know where I am" |

---

## Part 4: Quick Reference

### Landing Logic

```
IF platform_role = 'platform_admin' → /admin
ELSE IF active_memberships.length = 1 → that workspace
ELSE IF last_active_scope exists → restore it
ELSE → workspace selector
```

### Scope Transition

```
System Console ←→ Workspace (explicit action required)
Workspace A ←→ Workspace B (resets navigation)
```

### Authority Edit Flow

```
Inspection (default) → CTA click → Edit mode → Review → Confirm → Event logged
```

---

## Part 5: Enterprise Onboarding Readiness

### Onboarding Posture

Enterprise onboarding signals **authority, clarity, and restraint** — not guidance or persuasion.

### Required Components

#### 1. Workspace Entry (`WorkspaceInitialization`)

On first entry to any workspace:

```tsx
<WorkspaceInitialization
  workspaceName="Client Portal"
  workspaceRole="Organization Admin"
  scopeDescription="Manage agreements, view statements, and submit payments."
  onContinue={() => navigateToWorkspace()}
/>
```

**Must display**:
- Explicit scope declaration ("You are entering: Client Portal")
- Explicit role confirmation ("Your role: Organization Admin")
- Read-only posture until first deliberate action

#### 2. First-Session Guardrails (`FirstSessionGuardrails`)

For new users:

```tsx
<FirstSessionGuardrails
  entryPoints={[
    { id: "docs", label: "Documents", description: "View agreements", icon: "documents", href: "/portal/documents" },
    { id: "settings", label: "Configuration", description: "Account settings", icon: "settings", href: "/portal/settings" },
  ]}
  onNavigate={(href) => navigate(href)}
/>
```

**Rules**:
- No automatic navigation into actions
- No forced tours or tooltips
- Clear, minimal entry points only

#### 3. Authority Transparency

Every authenticated view must communicate:

| Element | Display |
|---------|---------|
| What you can do | Visible capabilities list |
| What you cannot do | Visible restrictions (not hidden) |
| How to request changes | Contact instruction or CTA |

#### 4. External Partner Onboarding (`ExternalPartnerView`)

For auditors, licensees, and external partners:

```tsx
<ExternalPartnerView
  partnerType="auditor"
  accessLevel="Read-only access to licensing activity"
  expiresAt="2026-03-15"
  resources={[...]}
  onSelectResource={(href) => navigate(href)}
/>
```

**Rules**:
- Minimal, scoped UI
- Explicit scope labeling
- No platform discovery
- No admin affordances

### Prohibitions

| Prohibited | Reason |
|------------|--------|
| Gamification | Undermines institutional authority |
| Onboarding tours | Creates false familiarity |
| Progressive disclosure | Obscures authority boundaries |
| Celebratory language | Inappropriate for governance |
| Auto-navigation | Removes user agency |

---

## Related Documents

| Document | Purpose |
|----------|---------|
| `AUTHORITY_GOVERNANCE_DECISIONS.md` | Authority enforcement rules |
| `NAVIGATION_PRODUCT_INHERITANCE.md` | Navigation scope rules |
| `AUTHORITY_UX_CANON.md` | UI rendering rules |
| `GLOBAL_ADMIN_UI_STANDARD.md` | Admin view standards |
| `OPERATIONAL_SAFETY_CONTINUITY.md` | Notification and escalation rules |
| `institutional-copy.ts` | Canonical microcopy |

---

## Implementation Files

| File | Purpose |
|------|---------|
| `src/components/onboarding/WorkspaceInitialization.tsx` | Workspace entry component |
| `src/components/onboarding/ExternalPartnerView.tsx` | External partner onboarding |
| `src/components/onboarding/FirstSessionGuardrails.tsx` | First-session guardrails |
| `src/constants/institutional-copy.ts` | Onboarding copy constants |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-17 | Initial user journey and UX affordances |
| 1.1 | 2026-01-17 | Added enterprise onboarding readiness (Part 5) |

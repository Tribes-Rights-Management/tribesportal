# Authority History Visibility Rules v1.0

> **Status**: LOCKED  
> **Scope**: All authority event access controls  
> **Last Updated**: 2026-01-17

---

## Objective

Ensure authority history is transparent to those accountable, while remaining restricted, minimal, and non-leaky.

---

## Core Principle

> **You may only see authority history for scopes you are responsible for.**

No global visibility by default. No curiosity access.

---

## A. Visibility by Role

### Platform Executive

| Access | Scope |
|--------|-------|
| View | All platform-level authority events |
| View | All organization-level authority events |
| Filter by | Organization, User, Event type, Date range |
| Edit/Delete | ❌ Never |

**This is oversight, not operation.**

---

### Organization Admin

| Access | Scope |
|--------|-------|
| View | Authority events within their organization only |
| Can see | Who changed what, When, Approval status |
| Cannot see | Platform-level authority events |
| Cannot see | Other organizations' history |

---

### Standard Members

| Access | Scope |
|--------|-------|
| View | Only their own authority history |
| Scope | Read-only |
| Peer visibility | ❌ None |

---

### External Auditors (Future-Ready)

| Access | Scope |
|--------|-------|
| View | Read-only authority history |
| Scope | Limited to assigned scope |
| UI affordances | ❌ No action buttons |
| Labeling | Watermarked / clearly labeled as read-only |

---

## B. Visibility Matrix

| Role | Own History | Org History | Platform History | All Orgs |
|------|-------------|-------------|------------------|----------|
| Platform Executive | ✓ | ✓ | ✓ | ✓ |
| Organization Admin | ✓ | ✓ | ✗ | ✗ |
| Standard Member | ✓ | ✗ | ✗ | ✗ |
| External Auditor | ✓ (if assigned) | ✓ (if assigned) | ✓ (if assigned) | ✗ |

---

## C. RLS Policy Implementation

### Platform Executive Access

```sql
CREATE POLICY "platform_exec_view_all_authority_events"
ON authority_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.platform_role = 'platform_admin'
  )
);
```

### Organization Admin Access

```sql
CREATE POLICY "org_admin_view_org_authority_events"
ON authority_events
FOR SELECT
TO authenticated
USING (
  -- Only events within their organization
  organization_id IN (
    SELECT tenant_id FROM tenant_memberships
    WHERE user_id = auth.uid()
    AND role = 'tenant_admin'
    AND status = 'active'
  )
  -- Exclude platform-level events
  AND scope = 'organization'
);
```

### Standard Member Access

```sql
CREATE POLICY "member_view_own_authority_events"
ON authority_events
FOR SELECT
TO authenticated
USING (
  target_user_id = auth.uid()
);
```

### External Auditor Access

```sql
CREATE POLICY "auditor_view_assigned_authority_events"
ON authority_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.platform_role = 'external_auditor'
  )
  -- Auditors see all (read-only, no write policies exist for this role)
);
```

---

## D. Explicit Prohibitions

| ❌ Prohibited | Why |
|--------------|-----|
| Cross-org browsing | Data isolation |
| "View all users" for non-execs | Scope violation |
| Export unless authorized | See Export Rules |
| Peer authority comparison | Privacy |
| Bulk download of history | Leakage risk |

---

## E. UI Enforcement

### Platform Executive View

```tsx
// Full history with filters
<AuthorityTimeline
  filters={{
    organization: true,
    user: true,
    eventType: true,
    dateRange: true,
  }}
  scope="all"
/>
```

### Organization Admin View

```tsx
// Org-scoped history only
<AuthorityTimeline
  filters={{
    user: true,
    eventType: true,
    dateRange: true,
  }}
  scope="organization"
  organizationId={currentOrgId}
/>
```

### Standard Member View

```tsx
// Own history only
<AuthorityTimeline
  filters={{
    eventType: true,
    dateRange: true,
  }}
  scope="self"
  targetUserId={currentUserId}
/>
```

### External Auditor View

```tsx
// Read-only, watermarked
<AuthorityTimeline
  readOnly={true}
  watermark="Auditor View — Read Only"
  scope={assignedScope}
/>
```

---

## F. Navigation Access Points

| Role | Access Point |
|------|--------------|
| Platform Executive | System Console → Authority History |
| Organization Admin | Organization Settings → Authority History |
| Standard Member | Account → My Authority History |
| External Auditor | Auditor Console → Authority History |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-17 | Initial visibility rules |

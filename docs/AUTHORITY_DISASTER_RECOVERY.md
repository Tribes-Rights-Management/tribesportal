# Authority Disaster Recovery — Minimum Guarantees v1.0

> **Status**: LOCKED (Implement Immediately)  
> **Scope**: Authority data protection and recovery  
> **Last Updated**: 2026-01-17

---

## Purpose

Define the irreducible baseline for authority data protection. Anything less creates future legal and operational risk.

---

## A. Authority Data Classification

### Tier-0 Data (Non-Negotiable)

Authority data is classified as **Tier-0**, meaning:

| Priority | Data Type |
|----------|-----------|
| 1 (Highest) | Authority history |
| 2 | Product data |
| 3 | UI state |
| 4 | Analytics |

> **If something must survive, this must survive.**

---

## B. Structural Guarantees (Lock Immediately)

### 1. Append-Only Authority Log

| Rule | Implementation |
|------|----------------|
| No UPDATEs | Database trigger prevents |
| No DELETEs | Database trigger prevents |
| Every correction = new event | Application layer enforces |

### 2. Immutable Identifiers

The following can **never** change once written:

| Identifier | Why Immutable |
|------------|---------------|
| `user_id` | Target identity |
| `actor_id` | Attribution |
| `organization_id` | Scope boundary |
| `scope` | Platform/org classification |
| `correlation_id` | Chain linkage |

### 3. Timestamped at Write

| Rule | Implementation |
|------|----------------|
| Server-side timestamp only | `DEFAULT now()` |
| Never client-controlled | No timestamp in INSERT payload |
| UTC timezone | Consistent global reference |

### 4. Separation from Product Tables

| Rule | Implementation |
|------|----------------|
| Dedicated table | `authority_events` |
| No mixing with features | Not embedded in licensing/publishing tables |
| Separate backup policy | Can be restored independently |

---

## C. Backup Posture (Minimum Viable)

### What You Need Now

| Requirement | Specification |
|-------------|---------------|
| Automated backups | Daily minimum |
| Retention | ≥ 30 days |
| Restore capability | Read-only snapshots |
| Cold restore | Acceptable at this phase |

### What You Don't Need Yet

| Feature | Status |
|---------|--------|
| Multi-region replication | Deferred |
| Real-time sync | Deferred |
| Hot standby | Deferred |
| Sub-minute RPO | Deferred |

---

## D. Recovery Promise

### The Benchmark Statement

Tribes must be able to honestly say:

> **"We can always reconstruct who had authority, when, and why — even if the app is temporarily unavailable."**

This is the standard by which DR readiness is measured.

---

## E. Database Implementation

### Authority Events Table Structure

```sql
CREATE TABLE public.authority_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correlation_id TEXT NOT NULL DEFAULT public.generate_correlation_id(),
  
  -- Event classification
  event_type TEXT NOT NULL,
  event_label TEXT NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('platform', 'organization')),
  
  -- Actor (who performed the action)
  actor_id UUID NOT NULL,
  actor_email TEXT NOT NULL,
  
  -- Target (who was affected)
  target_user_id UUID NOT NULL,
  target_user_email TEXT NOT NULL,
  
  -- Organization context (if applicable)
  organization_id UUID,
  organization_name TEXT,
  
  -- Change details
  change_summary TEXT NOT NULL,
  before_state JSONB,
  after_state JSONB,
  reason TEXT,
  
  -- Approval tracking
  requires_approval BOOLEAN DEFAULT false,
  approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'declined', 'expired')),
  approved_by UUID,
  approved_by_email TEXT,
  approved_at TIMESTAMPTZ,
  
  -- Immutable timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Immutability Triggers

```sql
-- Prevent UPDATE
CREATE OR REPLACE FUNCTION prevent_authority_event_update()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Authority events are immutable and cannot be updated';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER authority_events_no_update
BEFORE UPDATE ON public.authority_events
FOR EACH ROW
EXECUTE FUNCTION prevent_authority_event_update();

-- Prevent DELETE
CREATE OR REPLACE FUNCTION prevent_authority_event_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Authority events are immutable and cannot be deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER authority_events_no_delete
BEFORE DELETE ON public.authority_events
FOR EACH ROW
EXECUTE FUNCTION prevent_authority_event_delete();
```

### RLS Policies

```sql
-- Enable RLS
ALTER TABLE public.authority_events ENABLE ROW LEVEL SECURITY;

-- Platform executives see all
CREATE POLICY "platform_exec_view_all"
ON public.authority_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.platform_role = 'platform_admin'
  )
);

-- Org admins see org events
CREATE POLICY "org_admin_view_org_events"
ON public.authority_events FOR SELECT
USING (
  organization_id IN (
    SELECT tenant_id FROM tenant_memberships
    WHERE user_id = auth.uid()
    AND role = 'tenant_admin'
    AND status = 'active'
  )
  AND scope = 'organization'
);

-- Users see own events
CREATE POLICY "user_view_own_events"
ON public.authority_events FOR SELECT
USING (target_user_id = auth.uid());

-- Insert only via authenticated
CREATE POLICY "authenticated_insert"
ON public.authority_events FOR INSERT
TO authenticated
WITH CHECK (actor_id = auth.uid());
```

---

## F. Verification Checklist

Before claiming DR readiness, confirm:

- [ ] `authority_events` table created
- [ ] UPDATE trigger active and tested
- [ ] DELETE trigger active and tested
- [ ] RLS policies applied
- [ ] Daily backups configured
- [ ] 30-day retention confirmed
- [ ] Restore procedure documented
- [ ] Restore tested at least once

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-17 | Initial DR guarantees |

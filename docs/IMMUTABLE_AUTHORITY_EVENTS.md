# Immutable Authority Events — Non-Negotiable Rules v1.0

> **Status**: LOCKED (Database-Level Enforcement Required)  
> **Scope**: All authority event storage and display  
> **Last Updated**: 2026-01-17

---

## Purpose

Protect the system's credibility as a system of record.

Authority events are **legal artifacts**, not convenience data.

---

## Core Principle

> **Audit integrity > convenience, always.**

---

## A. What Is Immutable

Once recorded, the following can **never** be edited or deleted:

| Field | Why Immutable |
|-------|---------------|
| Authority grants | Legal record of access given |
| Authority removals | Legal record of access revoked |
| Approval decisions | Accountability for approvers |
| Rejections | Accountability for reviewers |
| Automatic revocations | System behavior evidence |
| Actor identity | Attribution cannot change |
| Timestamp | Temporal integrity |
| Target user | Subject cannot change |
| Scope (platform/org) | Context cannot change |
| Correlation ID | Chain integrity |
| Reason (if provided) | Intent record |

---

## B. What Can Change (Safely)

These are display-layer concerns that do not affect record integrity:

| Field | Why Safe |
|-------|----------|
| Display labels | UI copy updates (e.g., "Org Admin" → "Organization Administrator") |
| User display names | Name changes don't alter identity (user_id remains constant) |
| UI grouping | How records are presented |
| UI filtering | Which records are shown |
| Formatting | Date formats, capitalization |

---

## C. What Is Never Allowed

| Action | Why Prohibited |
|--------|----------------|
| Editing history entries | Destroys audit integrity |
| Soft-deleting authority events | Creates gaps in record |
| Backdating | Falsifies timeline |
| Reassigning actors | Falsifies attribution |
| "Fixing" mistakes silently | Hides errors from audit |
| Bulk deletion | Data destruction |
| Overwriting timestamps | Temporal fraud |

---

## D. Error Correction Protocol

### If an error occurs:

**A new authority event must correct the previous one.**

That is the rule.

### Example: Wrong Role Granted

1. ❌ Do NOT edit the original event
2. ✅ Create a new revocation event: "Authority revoked (correction)"
3. ✅ Create a new grant event with correct role

### Example: Wrong User Targeted

1. ❌ Do NOT modify the original event
2. ✅ Revoke from incorrect user: "Authority revoked (incorrect assignment)"
3. ✅ Grant to correct user: "Authority granted"

### Correction Event Template

```
Authority revoked (correction)

Original grant on Jan 14, 2026 was issued in error.
Corrected by: [Actor]
Reason: [Explanation]
```

---

## E. Database Enforcement

### Trigger: Prevent Updates

```sql
CREATE OR REPLACE FUNCTION prevent_authority_event_update()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Authority events are immutable and cannot be updated';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER authority_events_no_update
BEFORE UPDATE ON authority_events
FOR EACH ROW
EXECUTE FUNCTION prevent_authority_event_update();
```

### Trigger: Prevent Deletes

```sql
CREATE OR REPLACE FUNCTION prevent_authority_event_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Authority events are immutable and cannot be deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER authority_events_no_delete
BEFORE DELETE ON authority_events
FOR EACH ROW
EXECUTE FUNCTION prevent_authority_event_delete();
```

### RLS: Insert Only

```sql
-- No SELECT restriction (read by authorized roles)
-- No UPDATE allowed (trigger blocks)
-- No DELETE allowed (trigger blocks)

CREATE POLICY "authority_events_insert_only"
ON authority_events
FOR INSERT
TO authenticated
WITH CHECK (
  -- Only system functions can insert
  -- Or authorized actors via approved workflows
  auth.uid() IS NOT NULL
);
```

---

## F. Retention Rules

### Standard Retention

- Authority events: **Permanent** (never deleted)
- Correlation chains: **Permanent** (never broken)

### Legal Hold

- If `legal_hold = true` on any related record, all associated events are locked from any administrative action

### Archival

- Events older than 7 years may be moved to cold storage
- Original records remain intact
- Archive process creates new audit event: "Records archived"

---

## G. Display Rules

### In Timeline Views

- Events are **always displayed chronologically**
- Correction events appear in sequence, not as replacements
- Original events are never hidden

### In Diff Views

- Show the correction chain, not a "clean" history
- Auditors must see the full sequence

### Example Timeline

```
Jan 15, 2026 • 9:15 AM
Adam Carpenter revoked Org Admin from Jordan Smith
Reason: "Correction: Role granted in error on Jan 14"

Jan 14, 2026 • 10:32 AM
Adam Carpenter granted Org Admin to Jordan Smith
Approved by Sarah Lee
```

---

## H. API Enforcement

### Event Creation Endpoint

```typescript
// POST /api/authority-events
// Returns: 201 Created with event ID
// No PATCH or DELETE endpoints exist

interface CreateAuthorityEventRequest {
  event_type: AuthorityEventType;
  target_user_id: string;
  change_details: ChangeDetails;
  reason?: string;
}

// Response includes immutable fields
interface AuthorityEventResponse {
  id: string;
  correlation_id: string;
  created_at: string; // Server-generated, not client-provided
  actor_id: string; // Extracted from auth context
  actor_email: string; // Extracted from auth context
  // ... other fields
}
```

### Attempted Modification Response

```json
{
  "error": "IMMUTABLE_RECORD",
  "message": "Authority events cannot be modified. Create a correction event instead.",
  "documentation": "https://docs.tribes.app/authority-events/corrections"
}
```

---

## I. Audit Verification

### Integrity Check Query

```sql
-- Verify no gaps in sequence
SELECT 
  id,
  correlation_id,
  created_at,
  LAG(created_at) OVER (ORDER BY created_at) as prev_created_at
FROM authority_events
WHERE created_at - LAG(created_at) OVER (ORDER BY created_at) > interval '1 second'
ORDER BY created_at;
```

### Chain Completeness Check

```sql
-- Verify all events in a chain exist
SELECT correlation_id, COUNT(*) as event_count
FROM authority_events
GROUP BY correlation_id
HAVING COUNT(*) < 2; -- Proposals should have at least 2 events
```

---

## J. Exception: Platform Emergency

In extraordinary circumstances (legal order, data breach remediation):

1. Action requires **two Platform Executives**
2. Creates a special audit event: `emergency_action`
3. Logs all details including legal justification
4. Notifies all Platform Executives
5. Cannot be reversed

This is not a workaround. This is a documented emergency protocol.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-17 | Initial immutability rules |

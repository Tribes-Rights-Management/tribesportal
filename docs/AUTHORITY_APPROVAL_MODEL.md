# Authority Change Approval Model v1.0

> **Status**: CANONICAL  
> **Scope**: Dual-control workflows for authority modifications  
> **Last Updated**: 2026-01-17

---

## Purpose

A second layer of control that prevents unilateral authority changes for sensitive actions.

Instead of:
> "I changed this."

The system records:
> "I proposed this. Someone else approved it."

---

## Why This Exists

Authority changes are **governance events**, not settings changes.

Approval:
- Prevents abuse
- Reduces mistakes
- Creates institutional trust
- Protects the company, not just the UI

---

## A. Core Flow

```
┌─────────────────┐
│  User proposes  │
│ authority change│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ System creates  │
│ pending_change  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Second eligible │
│ user reviews    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌────────┐
│Approve│ │Decline │
└───┬───┘ └───┬────┘
    │         │
    ▼         ▼
┌───────┐ ┌────────┐
│ Apply │ │ Discard│
└───────┘ └────────┘
```

**No approval → no change.**

---

## B. Approval Authority Matrix

| Change Scope | Who Can Approve |
|--------------|-----------------|
| Platform-level authority | Platform Executives only |
| Organization-level authority | Org Admins (different from proposer) |
| Cross-org access | Platform Executives only |

### Hard Constraints

1. **No one approves their own changes**
   - `proposer.id !== approver.id` (enforced at DB level)

2. **No one approves changes to themselves**
   - `target.id !== approver.id`

3. **Approver must have equal or higher authority**
   - Platform changes require Platform Executive
   - Org changes require Org Admin or higher

---

## C. Pending Change Record

### Schema Contract

```typescript
interface PendingAuthorityChange {
  id: string;
  correlation_id: string;
  
  // Target
  target_user_id: string;
  target_user_email: string;
  
  // Proposer
  proposed_by: string;
  proposed_by_email: string;
  proposed_at: string; // UTC
  
  // Change details
  change_type: AuthorityChangeType;
  change_scope: 'platform' | 'organization';
  organization_id?: string;
  
  // State snapshots
  before_state: AuthoritySnapshot;
  after_state: AuthoritySnapshot;
  
  // Metadata
  reason?: string;
  risk_level: 'high' | 'critical';
  
  // Status
  status: 'pending' | 'approved' | 'declined' | 'expired' | 'cancelled';
  
  // Resolution
  resolved_by?: string;
  resolved_by_email?: string;
  resolved_at?: string;
  resolution_reason?: string;
  
  // Expiration
  expires_at: string; // Auto-expire after 7 days
}
```

### Change Types

```typescript
type AuthorityChangeType =
  | 'platform_role_grant'
  | 'platform_role_revoke'
  | 'org_admin_grant'
  | 'org_admin_revoke'
  | 'cross_org_access_grant'
  | 'cross_org_access_revoke'
  | 'approval_authority_grant'
  | 'export_authority_grant'
  | 'last_admin_removal';
```

---

## D. Approval Queue

### Location

Pending changes appear in:
- Platform Administration → Pending Approvals
- Organization Settings → Pending Changes (org-scoped only)

### Queue Display

```tsx
// Each pending change shows:
<PendingChangeCard>
  <Header>
    <TargetUser email={change.target_user_email} />
    <ChangeType label={formatChangeType(change.change_type)} />
  </Header>
  
  <PermissionsDiffView
    before={change.before_state}
    after={change.after_state}
  />
  
  <Metadata>
    <ProposedBy email={change.proposed_by_email} />
    <ProposedAt timestamp={change.proposed_at} />
    <ExpiresAt timestamp={change.expires_at} />
  </Metadata>
  
  <Actions>
    <ApproveButton />
    <DeclineButton />
  </Actions>
</PendingChangeCard>
```

---

## E. Approval Flow

### Step 1: Review

Approver sees:
- Target user identity
- Proposer identity
- Permissions Diff (semantic, human-readable)
- Proposer's reason (if provided)
- Time remaining before expiration

### Step 2: Decision

Two options:
1. **Approve** → Change takes effect immediately
2. **Decline** → Change is discarded, proposer notified

### Step 3: Confirm

Before action:
- Confirmation dialog with impact statement
- Optional reason field for audit
- Processing lock during submission

---

## F. Notifications

| Event | Notify |
|-------|--------|
| Change proposed | Target user, Eligible approvers |
| Change approved | Proposer, Target user |
| Change declined | Proposer |
| Change expired | Proposer |
| Change cancelled | Eligible approvers |

---

## G. Audit Trail

Every pending change records:

| Event | Fields |
|-------|--------|
| Proposed | `actor`, `target`, `before`, `after`, `reason`, `timestamp` |
| Approved | `approver`, `timestamp`, `reason` |
| Declined | `approver`, `timestamp`, `reason` |
| Expired | `timestamp` |
| Cancelled | `actor`, `timestamp`, `reason` |

### Correlation

All events for a single change share a `correlation_id`, enabling full chain reconstruction.

---

## H. Expiration Rules

- Pending changes expire after **7 days**
- Expired changes are marked `status: 'expired'`
- Expired changes cannot be approved or declined
- Proposer must re-submit if still needed

---

## I. Cancellation

The proposer can cancel their pending change:
- Before approval/decline
- Logs cancellation event
- Removes from approval queue

---

## J. Edge Cases

### Multiple Pending Changes for Same User

- Allowed, but each requires separate approval
- Approver sees all pending changes for context
- Conflicting changes are flagged

### Proposer Loses Authority Before Approval

- Change remains pending
- Approver can still approve/decline
- Logged with context

### Approver Loses Authority Before Acting

- Change remains pending
- Other eligible approvers can act
- If no eligible approvers remain, change expires

---

## K. Future Extensions

This model supports:
- **Escalation**: Auto-escalate after N days
- **Delegation**: Temporary approval authority
- **Batch Approval**: Approve multiple low-risk changes
- **External Auditor Review**: Notify auditors of sensitive approvals

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-17 | Initial approval model |

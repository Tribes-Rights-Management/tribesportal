# Authority History Timeline — Specification v1.0

> **Status**: CANONICAL  
> **Scope**: All authority event history displays  
> **Last Updated**: 2026-01-17

---

## Purpose

Define how authority changes are recorded and displayed over time as a human-readable, auditor-friendly timeline.

---

## Core Principle

The timeline is an **event log**, not a **diff viewer**.

Each entry answers:
- **Who** performed the action
- **What** was the action
- **To whom** it was applied
- **When** it occurred
- **Why** (if reason provided)
- **With what approval** (if applicable)

---

## A. Event Structure

### Schema Contract

```typescript
interface AuthorityEvent {
  id: string;
  correlation_id: string;
  
  // Action
  event_type: AuthorityEventType;
  event_label: string; // Human-readable action
  
  // Actor
  actor_id: string;
  actor_email: string;
  actor_role: string;
  
  // Target
  target_user_id: string;
  target_user_email: string;
  
  // Context
  organization_id?: string;
  organization_name?: string;
  scope: 'platform' | 'organization';
  
  // Details
  change_summary: string; // Human-readable summary
  reason?: string;
  
  // Approval (if applicable)
  requires_approval: boolean;
  approval_status?: 'pending' | 'approved' | 'declined';
  approved_by?: string;
  approved_by_email?: string;
  approved_at?: string;
  
  // Timestamps
  created_at: string;
  
  // Reference
  diff_snapshot?: AuthorityDiff; // Internal reference only
}
```

### Event Types

```typescript
type AuthorityEventType =
  // Proposals
  | 'authority_proposed'
  | 'authority_approved'
  | 'authority_declined'
  | 'authority_expired'
  | 'authority_cancelled'
  
  // Direct changes (low-risk)
  | 'authority_granted'
  | 'authority_revoked'
  | 'authority_modified'
  
  // Special
  | 'authority_override'; // Emergency bypass
```

---

## B. Timeline Display

### Entry Layout

```tsx
<TimelineEntry>
  {/* Timestamp */}
  <TimelineDate>
    Jan 14, 2026 • 10:32 AM UTC
  </TimelineDate>
  
  {/* Primary action */}
  <TimelineAction>
    <ActorName>Adam Carpenter</ActorName>
    <ActionVerb>proposed adding</ActionVerb>
    <ChangeDescription>Org Admin</ChangeDescription>
    <Preposition>to</Preposition>
    <TargetName>Jordan Smith</TargetName>
  </TimelineAction>
  
  {/* Reason (if provided) */}
  {reason && (
    <TimelineReason>
      "{reason}"
    </TimelineReason>
  )}
  
  {/* Approval (if applicable) */}
  {approval && (
    <TimelineApproval>
      <ApprovalStatus>Approved by</ApprovalStatus>
      <ApproverName>Sarah Lee</ApproverName>
      <ApprovalDate>Jan 14, 2026 • 2:15 PM UTC</ApprovalDate>
    </TimelineApproval>
  )}
</TimelineEntry>
```

### Visual Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│ Jan 14, 2026 • 10:32 AM UTC                             │
│                                                         │
│ Adam Carpenter proposed adding Org Admin to Jordan Smith│
│ "Promoted to lead publishing operations"                │
│                                                         │
│ ✓ Approved by Sarah Lee                                 │
│   Jan 14, 2026 • 2:15 PM UTC                            │
└─────────────────────────────────────────────────────────┘
```

---

## C. Sentence Templates

### Proposal Events

| Event | Template |
|-------|----------|
| `authority_proposed` | "{actor} proposed {action} {change} to {target}" |
| `authority_approved` | "Approved by {approver}" |
| `authority_declined` | "Declined by {approver}" |
| `authority_expired` | "Proposal expired without approval" |
| `authority_cancelled` | "{actor} cancelled the proposal" |

### Direct Change Events

| Event | Template |
|-------|----------|
| `authority_granted` | "{actor} granted {change} to {target}" |
| `authority_revoked` | "{actor} revoked {change} from {target}" |
| `authority_modified` | "{actor} modified {target}'s {scope} authority" |

### Action Verbs

| Change Type | Verb |
|-------------|------|
| Role grant | "adding" |
| Role revoke | "removing" |
| Capability grant | "granting" |
| Capability revoke | "revoking" |
| Membership add | "adding to" |
| Membership remove | "removing from" |

---

## D. Timeline Filtering

### Available Filters

| Filter | Options |
|--------|---------|
| Time range | Last 7 days, 30 days, 90 days, Custom |
| Event type | Proposals, Approvals, Direct changes, All |
| Scope | Platform, Organization, All |
| Status | Pending, Completed, Declined, All |
| Actor | Search by name/email |
| Target | Search by name/email |

### Default View

- Time range: Last 30 days
- Event type: All
- Scope: All
- Status: All
- Sorted: Newest first

---

## E. Timeline Grouping

Events are grouped by date:

```
─── Today ───────────────────────────────────────────────
  [Event 1]
  [Event 2]

─── Yesterday ───────────────────────────────────────────
  [Event 3]

─── Jan 12, 2026 ────────────────────────────────────────
  [Event 4]
  [Event 5]
```

---

## F. Detail Expansion

Each timeline entry can expand to show:

1. **Full diff** (for technical review)
2. **Correlation chain** (related events)
3. **Audit metadata** (IP, user agent, etc.)

```tsx
<Collapsible>
  <CollapsibleTrigger>
    View details
  </CollapsibleTrigger>
  <CollapsibleContent>
    <PermissionsDiffView
      before={event.diff_snapshot.before}
      after={event.diff_snapshot.after}
    />
    <CorrelationChainLink id={event.correlation_id} />
    <AuditMetadata event={event} />
  </CollapsibleContent>
</Collapsible>
```

---

## G. Status Indicators

### Pending Approval

```tsx
<Badge variant="warning" className="bg-amber-500/10 text-amber-500">
  Pending Approval
</Badge>
```

### Approved

```tsx
<span className="text-emerald-500 flex items-center gap-1">
  <Check className="h-3.5 w-3.5" />
  Approved
</span>
```

### Declined

```tsx
<span className="text-red-400 flex items-center gap-1">
  <X className="h-3.5 w-3.5" />
  Declined
</span>
```

### Expired

```tsx
<span className="text-muted-foreground flex items-center gap-1">
  <Clock className="h-3.5 w-3.5" />
  Expired
</span>
```

---

## H. Access Control

| Role | Can View |
|------|----------|
| Platform Executive | All events, all scopes |
| Org Admin | Events within their org |
| External Auditor | All events (read-only) |
| Tenant User | Own events only |

---

## I. Export

Timeline can be exported for compliance:

- **Format**: CSV, JSON
- **Includes**: All visible events with metadata
- **Excludes**: Internal diff snapshots
- **Watermarked**: Export includes generation timestamp and actor

---

## J. Mobile Display

On mobile:
- Single-column layout
- Collapsible entries
- Touch-friendly tap targets (44px minimum)
- Swipe for actions (if applicable)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-17 | Initial timeline specification |

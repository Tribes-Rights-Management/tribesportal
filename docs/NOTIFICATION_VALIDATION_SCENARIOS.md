# Notification Validation Scenarios

> Real-world workflow stress validation for notification integrity.

---

## Validation Rules (Non-Negotiable)

1. Notifications must NOT disappear prematurely
2. Escalations must NOT reset on acknowledgment
3. Mobile and desktop behavior must match exactly
4. All transitions must emit audit events

---

## Scenario 1: Licensing Delay

**Setup:**
- New licensing request submitted
- Recipient does not act for 48 hours

**Expected Behavior:**
1. ✓ Notification created immediately
2. ✓ No action for 48 hours
3. ✓ Escalation triggers at SLA threshold
4. ✓ Notification remains visible until resolved
5. ✓ Executive visibility occurs at 72-hour threshold
6. ✓ Resolution only when request is approved or declined

**Failure Conditions:**
- ✗ Notification disappears before resolution
- ✗ Escalation timer resets on acknowledgment
- ✗ Executive never receives visibility event

---

## Scenario 2: Payment Failure

**Setup:**
- Invoice payment attempt fails
- Org Admin receives notification

**Expected Behavior:**
1. ✓ Org Admin notified immediately
2. ✓ Reminder at 24 hours (if unresolved)
3. ✓ Escalation at 72 hours
4. ✓ Notification resolves ONLY when:
   - Payment succeeds, OR
   - Invoice is voided, OR
   - Manual resolution by authorized actor

**Failure Conditions:**
- ✗ Admin can dismiss without resolution
- ✗ Escalation stops on acknowledgment
- ✗ Notification auto-resolves without payment

---

## Scenario 3: Authority Change

**Setup:**
- Authority change proposed
- Notification sent to approver

**Expected Behavior:**
1. ✓ Approver receives notification immediately
2. ✓ Approver acknowledges (reads) the notification
3. ✓ Acknowledgment does NOT stop escalation timer
4. ✓ Escalation continues until:
   - Proposal is approved, OR
   - Proposal is rejected
5. ✓ Resolution occurs ONLY after approval/rejection
6. ✓ Audit trail captures all transitions

**Failure Conditions:**
- ✗ Acknowledgment treated as resolution
- ✗ Approver can dismiss without acting
- ✗ Escalation stops before decision

---

## Scenario 4: Executive Oversight

**Setup:**
- Escalated notification reaches executive
- Executive views the event

**Expected Behavior:**
1. ✓ Executive sees full event context
2. ✓ Executive sees escalation history
3. ✓ Executive CANNOT resolve directly unless:
   - They have the required authority, AND
   - The underlying action permits executive override
4. ✓ Viewing is logged as access event
5. ✓ Resolution still requires appropriate actor

**Failure Conditions:**
- ✗ Executive can dismiss escalation
- ✗ Viewing auto-resolves the notification
- ✗ Audit trail incomplete

---

## Semantic Definitions

### Acknowledged
- The user has **seen and recognized** the notification
- Does **NOT** imply action has been taken
- Does **NOT** stop escalation timers

### Resolved
- The **underlying event** has been completed
- Requires **appropriate authority** to complete
- Automatically closes the notification

---

## UI Enforcement Rules

| Action | Effect |
|--------|--------|
| "Mark as read" | Acknowledgment only |
| "Resolve" button | PROHIBITED (no direct resolve) |
| Resolution | Outcome-driven only |
| Escalated items | Cannot be acknowledged away |

---

## Retention Timeline

```
Day 0      → Notification created
Day N      → Acknowledged (read_at set)
Day M      → Resolved (resolved_at set by outcome)
Day M+90   → Archived (moved to notification_archive)
Never      → Deleted (critical categories retained forever)
```

---

## Critical Retention Categories

These notification types are **never deleted**:

| Category | Types |
|----------|-------|
| `critical_authority` | authority_change_proposal, membership_change |
| `critical_financial` | payment_failure, refund_initiated |
| `critical_security` | security_event |

---

## Validation Checklist

Before release, verify each scenario:

- [ ] Licensing delay: 48h escalation fires correctly
- [ ] Payment failure: 72h escalation with reminders
- [ ] Authority change: Acknowledgment ≠ resolution
- [ ] Executive oversight: Cannot bypass resolution
- [ ] Mobile behavior: Identical to desktop
- [ ] Audit events: All transitions logged
- [ ] Archive function: 90-day retention working
- [ ] Critical retention: Never-delete enforced

---

*Document Authority: This specification governs all notification validation.*

# Approval UI Language — Canonical Copy v1.0

> **Status**: LOCKED  
> **Scope**: All authority approval surfaces  
> **Last Updated**: 2026-01-17

---

## Purpose

Ensure every approval moment communicates gravity, clarity, and intent—not convenience.

---

## Tone Rules

| ✅ Required | ❌ Prohibited |
|-------------|--------------|
| Neutral | Friendly |
| Formal | Casual |
| Non-urgent | Pressuring |
| Declarative | Encouraging |
| Restrained | Celebratory |

---

## A. Approval Dialog — Canonical Copy

### Title

```
Approve Authority Change
```

Not:
- "Confirm approval"
- "Are you sure?"
- "Approve request"

### Summary Line

```
You are approving a change to user authority. This action alters access and responsibility.
```

### Change Description Label

```
Proposed change
```

### Change Description Example

```
Add Organization Administrator access for Jordan Smith within Tribes Licensing.
```

### Diff Section Label

```
Impact summary
```

### Primary CTA

```
Approve change
```

**Button style**: Outline or secondary variant. Never primary-accented.

### Secondary Action

```
Cancel
```

### Reason Field Label (Optional)

```
Reason for approval (optional)
```

---

## B. Decline Dialog — Canonical Copy

### Title

```
Decline Authority Change
```

### Summary Line

```
You are declining a proposed change to user authority. The proposer will be notified.
```

### Primary CTA

```
Decline change
```

### Secondary Action

```
Cancel
```

### Reason Field Label (Required)

```
Reason for declining
```

---

## C. Post-Action Confirmations

### After Approval

```
Authority change approved.
This action has been recorded in the audit log.
```

### After Decline

```
Authority change declined.
This action has been recorded in the audit log.
```

### After Cancellation (by proposer)

```
Proposal cancelled.
This action has been recorded in the audit log.
```

---

## D. Notification Copy

### To Proposer (Approved)

```
Your proposed authority change has been approved.

Change: Add Organization Administrator access for Jordan Smith
Approved by: Sarah Lee
Date: Jan 14, 2026
```

### To Proposer (Declined)

```
Your proposed authority change has been declined.

Change: Add Organization Administrator access for Jordan Smith
Declined by: Sarah Lee
Reason: [Reason provided by approver]
Date: Jan 14, 2026
```

### To Target User (Change Applied)

```
Your authority has been modified.

Change: Organization Administrator access added for Tribes Licensing
Modified by: Adam Carpenter
Date: Jan 14, 2026

Contact your administrator if you have questions about this change.
```

---

## E. Button Styling Rules

### Approve Button

```tsx
<Button variant="outline" className="border-border">
  Approve change
</Button>
```

**Never**:
- Green background
- Primary accent color
- "Success" styling

### Decline Button

```tsx
<Button variant="outline" className="text-red-400 border-red-400/30">
  Decline change
</Button>
```

### Cancel Button

```tsx
<Button variant="ghost" className="text-muted-foreground">
  Cancel
</Button>
```

---

## F. Prohibited Language

| ❌ Never Use | Why |
|-------------|-----|
| "Success!" | Celebratory |
| "Done!" | Casual |
| "Great choice" | Gamification |
| "Are you sure?" | Doubt-inducing |
| "Undo" | Implies reversibility |
| "Oops" | Unprofessional |
| Emojis | Non-institutional |
| Exclamation marks | Over-eager |

---

## G. Error States

### Approval Failed

```
Authority change could not be processed.
The approval was not applied. Please try again or contact support.
```

### Change Expired

```
This authority change has expired.
The proposal was not approved within the required timeframe and is no longer valid.
```

### Insufficient Authority

```
You do not have authority to approve this change.
This action requires [Platform Executive / Org Admin] privileges.
```

---

## H. Implementation Reference

```tsx
// Canonical approval dialog structure
<AppModal
  open={open}
  onOpenChange={onOpenChange}
  title="Approve Authority Change"
  description="You are approving a change to user authority. This action alters access and responsibility."
  preventsClose={processing}
>
  <AppModalBody>
    <div className="space-y-4">
      <div>
        <Label className="text-[11px] uppercase text-muted-foreground tracking-wide">
          Proposed change
        </Label>
        <p className="text-[14px] text-foreground mt-1">
          {changeDescription}
        </p>
      </div>
      
      <div>
        <Label className="text-[11px] uppercase text-muted-foreground tracking-wide">
          Impact summary
        </Label>
        <PermissionsDiffView
          before={change.before_state}
          after={change.after_state}
        />
      </div>
      
      <div>
        <Label className="text-[11px] uppercase text-muted-foreground tracking-wide">
          Reason for approval (optional)
        </Label>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Optional"
          className="mt-1"
        />
      </div>
    </div>
  </AppModalBody>
  
  <AppModalFooter>
    <AppModalAction
      onClick={handleApprove}
      loading={processing}
      loadingText="Processing…"
      variant="outline"
    >
      Approve change
    </AppModalAction>
    <AppModalCancel onClick={onOpenChange.bind(null, false)}>
      Cancel
    </AppModalCancel>
  </AppModalFooter>
</AppModal>
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-17 | Initial canonical copy |

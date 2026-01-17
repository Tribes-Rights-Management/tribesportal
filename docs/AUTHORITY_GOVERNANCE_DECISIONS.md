# Authority Governance Decisions — Locked v1.0

> **Status**: LOCKED (Do Not Modify Without Executive Review)  
> **Scope**: Foundational governance architecture decisions  
> **Last Updated**: 2026-01-17

---

## Purpose

This document records irreversible architectural decisions for the Tribes authority system. These decisions shape all implementation and cannot be changed without executive review.

---

## Decision 1: Per-Change Approval Model

### Decision

**✅ Use Per-Change Approval for high-risk authority changes**

### What This Means

- Every high-risk authority change is reviewed and approved individually
- Approval is tied to a specific change, not a general editing session
- Each action stands on its own in the audit trail

### Example

| Change | Approval Required |
|--------|-------------------|
| Grant Org Admin | Yes (individual) |
| Remove Export Rights | Yes (individual) |
| Add View-only access | No |

### Rationale

- Authority changes are rare but consequential
- Creates a precise, defensible audit trail
- Prevents "approval fatigue" from bulk reviews
- Matches how institutional systems operate (banks, custodians, platforms)

### Rejected Alternative: Per-Session Approval

| Aspect | Why Rejected |
|--------|--------------|
| Blurs responsibility | Multiple changes under one approval |
| Harder audits | Can't trace individual decisions |
| Unintended overreach | Session scope unclear |
| Wrong audience | Better for bulk ops, not governance |

**Note**: Per-session approval may be added later for internal ops tooling, but not for authority governance.

---

## Decision 2: Event-Based Authority Timeline

### Decision

**✅ Use Event-Based Authority Timeline as the primary history view**

### What This Means

A chronological record of authority **events**, not raw diffs.

Each entry answers:
- **Who** did what
- **To whom** it was done
- **When** it happened
- **Why** (reason, if provided)
- **With what approval** (approver, if applicable)

### Example Entry

```
Jan 14, 2026 • 10:32 AM UTC

Adam Carpenter proposed adding Org Admin to Jordan Smith
Reason: "Promoted to lead publishing operations"

Approved by Sarah Lee
Jan 14, 2026 • 2:15 PM UTC
```

### Rationale

- Human-readable for executives and auditors
- Explains intent, not just data changes
- Matches institutional review processes
- Becomes the defensible system of record

### Secondary Artifact: State Diffs

State diffs (before/after snapshots) are retained as:
- Internal reference data
- Correlation chain evidence
- Technical audit support

**But never the primary UI.**

| Aspect | Event Timeline | State Diff |
|--------|---------------|------------|
| Audience | Executives, auditors | Developers, forensics |
| Readability | High | Low |
| Intent visible | Yes | No |
| Primary display | Yes | No |

---

## Decision 3: Governance System Posture

### Decision

**✅ Treat authority management as a governance system, not SaaS settings**

### What This Means

| Aspect | Governance System ✅ | SaaS Settings ❌ |
|--------|---------------------|-----------------|
| Tone | Formal, institutional | Casual, helpful |
| Changes | Deliberate, reviewed | Instant, reversible |
| History | Immutable record | Optional logs |
| Audience | Executives, auditors | End users |
| Language | "Proposed", "Approved" | "Saved", "Updated" |

### Implementation Impact

- No "Save" buttons (use "Confirm Authority Change")
- No inline edits (use explicit edit mode)
- No silent updates (all changes logged with actor)
- No undo (changes are events, not states)

---

## Decision Summary

| Decision | Choice | Alternative Rejected |
|----------|--------|---------------------|
| Approval model | Per-change | Per-session |
| History display | Event-based timeline | State diff only |
| System posture | Governance system | SaaS settings |

---

## Enforcement

These decisions are enforced via:

1. **Documentation**: Canonical specs reference these decisions
2. **Code Review**: PRs must comply or cite exception
3. **Component Contracts**: UI primitives enforce patterns
4. **Audit**: Non-compliant implementations flagged

---

## Exception Process

To modify a locked decision:

1. Document the proposed change and rationale
2. Review with Platform Executive(s)
3. Assess impact on audit trail and compliance
4. Update all dependent specs if approved
5. Log decision change in version history

---

## Related Documents

| Document | Purpose |
|----------|---------|
| `AUTHORITY_UX_CANON.md` | UI/UX rules for authority views |
| `AUTHORITY_VIEW_SPEC.md` | Page layout specifications |
| `EDIT_AUTHORITY_GOVERNANCE.md` | Edit flow contract |
| `PERMISSIONS_DIFF_SPEC.md` | Diff display semantics |
| `AUTHORITY_APPROVAL_MODEL.md` | Dual-control workflow |
| `HIGH_RISK_AUTHORITY_CHANGES.md` | Risk classification |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-17 | Initial locked decisions |

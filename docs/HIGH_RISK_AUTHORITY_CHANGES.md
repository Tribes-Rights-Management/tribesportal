# High-Risk Authority Changes — Definition v1.0

> **Status**: CANONICAL  
> **Scope**: Classification of authority changes requiring approval  
> **Last Updated**: 2026-01-17

---

## Purpose

Define which authority changes require dual-control approval vs. immediate effect.

---

## Core Principle

> If everything needs approval → friction  
> If nothing needs approval → danger

This classification gives you:
- **Speed** where safe
- **Control** where it matters

---

## A. What Makes a Change "High-Risk"

Any change that:

| Criterion | Example |
|-----------|---------|
| Expands control significantly | Granting Platform Admin |
| Removes safeguards | Removing last Org Admin |
| Alters governance responsibility | Granting approval authority |
| Is difficult to reverse | Cross-org access |
| Has financial implications | Export or reporting access |

---

## B. Risk Classification Matrix

### Always High-Risk (Approval Required)

These changes **always** require dual-control approval:

| Change | Risk Justification |
|--------|-------------------|
| Grant Platform Admin/Executive | Grants company-wide control |
| Revoke Platform Admin/Executive | Removes governance layer |
| Grant Org Admin | Grants organizational control |
| Revoke Org Admin | Removes organizational governance |
| Grant cross-org access | Expands visibility beyond boundaries |
| Revoke cross-org access | May break established workflows |
| Grant approval authority | Creates new governance actor |
| Grant export authority | Enables data extraction |
| Remove user's last admin role | Leaves organization ungoverned |

### Conditionally High-Risk (Context-Dependent)

These changes **may** require approval based on context:

| Change | Approval Required When |
|--------|------------------------|
| Grant licensing execution rights | Target is not already a trusted operator |
| Grant financial/reporting access | Organization has sensitive data |
| Change role for multi-role user | Could create conflicting authorities |
| Modify context access (Publishing/Licensing) | Target has broad existing access |

### Low-Risk (No Approval Needed)

These changes take effect immediately:

| Change | Why Low-Risk |
|--------|--------------|
| Grant view-only access | No control implications |
| Adjust non-governing roles | No governance impact |
| Grant temporary access with expiration | Self-limiting |
| Add user to public context | No sensitive operations |
| Update display name or metadata | Non-authority change |

---

## C. Risk Level Enum

```typescript
type AuthorityChangeRiskLevel = 
  | 'low'        // Immediate effect
  | 'high'       // Requires approval
  | 'critical';  // Requires approval + notification to all Platform Executives
```

---

## D. Risk Evaluation Function

```typescript
function evaluateChangeRisk(
  change: ProposedAuthorityChange
): AuthorityChangeRiskLevel {
  
  // Critical: Platform-level changes
  if (change.scope === 'platform') {
    return 'critical';
  }
  
  // High: Admin role changes
  if (
    change.type.includes('admin') ||
    change.type.includes('cross_org') ||
    change.type.includes('approval_authority') ||
    change.type.includes('export_authority') ||
    change.type.includes('last_admin')
  ) {
    return 'high';
  }
  
  // High: Conditional checks
  if (change.type === 'licensing_execution_grant') {
    if (!isExistingTrustedOperator(change.targetUserId)) {
      return 'high';
    }
  }
  
  // Default: Low risk
  return 'low';
}
```

---

## E. Approval Routing by Risk Level

| Risk Level | Approval Required | Notification |
|------------|-------------------|--------------|
| Low | No | None |
| High | Yes (one approver) | Eligible approvers |
| Critical | Yes (one approver) | All Platform Executives |

---

## F. Override Mechanisms

### Emergency Override

In exceptional circumstances, a Platform Executive can bypass approval with:
- Explicit acknowledgment of override
- Mandatory reason field
- Immediate notification to all other Platform Executives
- Flagged in audit log as `override: true`

### Downgrade Request

An Org Admin can request a high-risk change be treated as low-risk:
- Requires Platform Executive approval
- Logged as policy exception
- Time-limited (single use)

---

## G. Change Type Reference

### Platform-Level Changes

| Change Type | Risk Level | Approval By |
|-------------|------------|-------------|
| `platform_admin_grant` | Critical | Platform Executive |
| `platform_admin_revoke` | Critical | Platform Executive |
| `platform_user_grant` | Low | — |
| `platform_user_revoke` | Low | — |
| `external_auditor_grant` | High | Platform Executive |
| `external_auditor_revoke` | High | Platform Executive |

### Organization-Level Changes

| Change Type | Risk Level | Approval By |
|-------------|------------|-------------|
| `org_admin_grant` | High | Platform Executive or different Org Admin |
| `org_admin_revoke` | High | Platform Executive or different Org Admin |
| `org_user_grant` | Low | — |
| `org_user_revoke` | Low | — |
| `viewer_grant` | Low | — |
| `viewer_revoke` | Low | — |

### Capability-Level Changes

| Change Type | Risk Level | Approval By |
|-------------|------------|-------------|
| `approval_authority_grant` | High | Platform Executive |
| `approval_authority_revoke` | High | Platform Executive |
| `export_authority_grant` | High | Platform Executive or Org Admin |
| `export_authority_revoke` | Low | — |
| `execution_authority_grant` | Conditional | Depends on context |
| `execution_authority_revoke` | Low | — |

### Context-Level Changes

| Change Type | Risk Level | Approval By |
|-------------|------------|-------------|
| `cross_org_access_grant` | High | Platform Executive |
| `cross_org_access_revoke` | High | Platform Executive |
| `licensing_context_grant` | Low | — |
| `licensing_context_revoke` | Low | — |
| `publishing_context_grant` | Low | — |
| `publishing_context_revoke` | Low | — |

---

## H. UI Indicators

### In Edit Authority Flow

Display risk level to proposer:

```tsx
{riskLevel === 'high' && (
  <Alert variant="warning">
    <AlertTriangle className="h-4 w-4" />
    <span>This change requires approval from another administrator.</span>
  </Alert>
)}

{riskLevel === 'critical' && (
  <Alert variant="destructive">
    <Shield className="h-4 w-4" />
    <span>This change requires Platform Executive approval and will notify all executives.</span>
  </Alert>
)}
```

### In Approval Queue

Badge pending changes by risk:

```tsx
<Badge variant={riskLevel === 'critical' ? 'destructive' : 'warning'}>
  {riskLevel === 'critical' ? 'Critical' : 'High Risk'}
</Badge>
```

---

## I. Composability

These layers work together:

| Layer | Purpose | Document |
|-------|---------|----------|
| Edit Authority Flow | How changes are made | `EDIT_AUTHORITY_GOVERNANCE.md` |
| Permissions Diff View | What changed | `PERMISSIONS_DIFF_SPEC.md` |
| Approval Model | Who must agree | `AUTHORITY_APPROVAL_MODEL.md` |
| High-Risk Rules | When approval is required | This document |

You can:
- Ship edit + diff without approval
- Add approval later without redesign
- Tighten risk thresholds as you scale

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-17 | Initial risk classification |

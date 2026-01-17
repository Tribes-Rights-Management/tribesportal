# Billing & Payments Governance Architecture

**Status**: LOCKED — Canonical Architecture  
**Scope**: Platform-wide billing and payments governance  
**Owner**: Platform Architecture

---

## 1. Core Principle

**Billing authority is separate from operational authority.**  
**System Console governs money. It never moves money.**

---

## 2. Canonical Billing Hierarchy (Non-Negotiable)

### A. System Console — Financial Governance Only

**Purpose**: Company-level oversight. No transactional actions.

**Allowed Content**:
- Billing plans & pricing rules
- Revenue overview (aggregate, read-only)
- Invoices across all organizations (read-only)
- Payment provider configuration (keys, webhooks, environments)
- Tax configuration
- Refund authority policies
- Regulatory/audit export packs

**Explicit Prohibitions**:
- ❌ No payment submission
- ❌ No org-scoped billing actions
- ❌ No client payment methods
- ❌ No per-user transactions

**Access**: Platform Executive only

---

### B. Organization Workspaces — Financial Operations

Billing actions occur only inside an organization workspace and are strictly scoped.

#### Tribes Admin (Organization)

| Action | Org Admin | Member |
|--------|-----------|--------|
| View invoices | ✅ | ✅ |
| Pay invoices | ✅ | ✅ |
| Update payment method | ✅ | ❌ |
| View payment history | ✅ | ✅ |
| Download receipts/statements | ✅ | ✅ |

**Disallowed**:
- ❌ Modify pricing
- ❌ View platform revenue
- ❌ View other organizations
- ❌ Access payment provider configuration

#### Licensing (Organization)

| Action | Org Admin | Member |
|--------|-----------|--------|
| View licensing fees | ✅ | ✅ |
| Submit payment for licenses | ✅ | ✅ |
| View license payment history | ✅ | ✅ |
| Download receipts | ✅ | ✅ |

**Disallowed**:
- ❌ Change pricing
- ❌ View non-licensing billing
- ❌ View other organizations

---

## 3. Authority Enforcement Matrix

| Action | Platform Exec | Tribes Admin (Org) | Org Admin | Member |
|--------|---------------|-------------------|-----------|--------|
| Configure pricing | ✅ | ❌ | ❌ | ❌ |
| Connect payment provider | ✅ | ❌ | ❌ | ❌ |
| View platform revenue | ✅ | ❌ | ❌ | ❌ |
| View org invoices | 🔒 (all orgs) | 🔒 (own org) | ✅ | ✅ |
| Pay invoice | ❌ | ❌ | ✅ | ✅ |
| Update payment method | ❌ | ❌ | ✅ | ❌ |
| Issue refunds | ✅ | ❌ | ❌ | ❌ |
| Export financial records | ✅ | ❌ | ❌ | ❌ |

🔒 = visible only within allowed scope

---

## 4. Navigation Locking

### System Console Navigation

```
System Console
 ├─ Governance
 ├─ Security
 ├─ Audit
 └─ Billing (Governance Only)
     ├─ Plans & Pricing
     ├─ Revenue Overview
     ├─ Invoices (All Orgs, Read-only)
     └─ Payment Providers
```

**Rules**:
- No links to Client Portal or Licensing payments
- No org switching inside Billing
- Billing governance never appears inside org navigation

### Organization Navigation

```
Tribes Admin (Org)
 ├─ Dashboard
 ├─ Documents
 └─ Payments
     ├─ Invoices
     ├─ Payment Methods
     └─ History

Licensing (Org)
 ├─ Dashboard
 ├─ Requests
 ├─ Licenses
 └─ Payments
     ├─ Fees
     └─ Receipts
```

---

## 5. UI & UX Enforcement

1. **Visual Authority Signal**: Billing sections must visually signal financial authority
2. **Explicit Intent**: Payment actions require explicit intent (no auto-charges)
3. **No Inline Edits**: No inline editing for pricing or plans
4. **Destructive Confirmation**: Refunds require confirmation + audit logging
5. **Platform Parity**: Mobile and desktop behavior must be identical in authority enforcement

---

## 6. Processor-Agnostic Design (Critical)

Payment providers (e.g., Stripe):
- Must be abstracted behind a `PaymentService`
- Must never define authority
- Must never appear in user navigation
- Must inherit all rules above automatically

**Rule**: Swapping payment providers must not require UI or authority changes.

---

## 7. Audit & Compliance

1. Every payment, refund, invoice, or configuration change emits an immutable event
2. Financial exports are append-only
3. System Console can generate regulatory disclosure packs without touching org data

---

## 8. Permission Namespace

### System Console (platform scope)
- `billing:configure_pricing`
- `billing:connect_provider`
- `billing:view_revenue`
- `billing:view_all_invoices`
- `billing:issue_refunds`
- `billing:export_financial`

### Organization Workspace (org scope)
- `billing:view_invoices`
- `billing:pay_invoices`
- `billing:manage_payment_methods`
- `billing:view_history`
- `billing:download_receipts`

---

## 9. Future Feature Inheritance

Any future feature involving:
- Billing
- Payments
- Invoices
- Pricing
- Refunds
- Financial exports

**MUST** inherit this hierarchy and authority model by default.

**No exceptions. No shortcuts.**

---

## 10. Implementation Files

- `src/hooks/useBillingAuthority.ts` — Permission resolution
- `src/services/PaymentService.ts` — Processor abstraction
- `src/pages/admin/billing/` — System Console billing governance
- `src/pages/portal/billing/` — Org-level billing operations
- `src/pages/licensing/billing/` — Licensing payment operations

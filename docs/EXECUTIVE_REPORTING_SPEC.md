# Executive Reporting, Board Summaries & Compliance Mapping

> Institutional oversight surfaces for Platform Executives.

---

## Access Control

| Role | Executive Reporting | Board Summaries | Compliance Mapping |
|------|---------------------|-----------------|-------------------|
| Platform Executive | Full access | Create & download | Full access |
| External Auditor | N/A | View only (if granted) | Read-only, time-bound |
| All others | No access | No access | No access |

---

## Phase 1: Executive Reporting Dashboards

**Location:** `/admin/reporting`

**Purpose:** Calm, factual visibility into system health, governance, and risk.

### Dashboard Sections

1. **Governance Health**
   - Authority changes (30/90 days)
   - Pending approvals
   - Escalations by category
   - Average resolution time

2. **Financial Oversight**
   - Aggregate revenue (no per-org drill-down by default)
   - Outstanding invoices (count + total)
   - Payment failures (trend)
   - Refund activity (count + amount)

3. **Operational Signals**
   - Licensing request volume
   - Time-to-decision metrics
   - Messaging volume (governed only)

4. **Security & Risk**
   - Auth failures
   - Elevated access events
   - Incident flags

### Rules
- ✓ Read-only (no operational actions)
- ✓ Time-range filters only
- ✓ Every metric links to detail view
- ✗ No charts implying performance targets
- ✗ No gamification
- ✗ No inline actions

---

## Phase 2: Board-Ready Summaries

**Location:** `/admin/reporting/summaries`

**Purpose:** Generate formal, static summaries for board decks and due diligence.

### Summary Packs

| Pack | Contents |
|------|----------|
| Governance & Authority | Authority changes, role assignments, approval decisions |
| Financial Overview | Revenue, invoicing, payments, refund activity |
| Licensing Activity | Request volume, approvals, agreement status |
| Risk & Compliance | Security events, escalations, audit posture |

### Format Requirements
- PDF and CSV
- Timestamped
- Versioned
- Immutable once generated
- Clear scope declaration on every page
- Plain language labels (no internal jargon)

### Content Rules
- Aggregated only
- No user-level detail unless explicitly approved
- Every generation logged
- Access history recorded
- No edits or regenerations without new version

---

## Phase 3: Formal Compliance Mapping

**Location:** `/admin/reporting/compliance`

**Purpose:** Map system behavior to compliance controls WITHOUT claiming certification.

### Compliance Domains

| Domain | Controls |
|--------|----------|
| Access Control | Role-based enforcement, least privilege, MFA |
| Change Management | Dual-control, version control |
| Audit Logging | Immutable trail, access logging, correlation |
| Financial Controls | Invoice-contract lineage, refund governance |
| Incident Response | Security notifications, escalation SLAs |
| Data Retention | Soft delete, backup manifests, notification retention |

### Required Artifacts

1. **Control Matrix**
   - Control ID
   - Description
   - System surface(s)
   - Evidence source
   - Status (Enforced / Partial / Manual / Out of Scope)

2. **Evidence Index**
   - Authority events
   - Billing lineage
   - Notification escalations
   - Export logs
   - Backup snapshots

3. **Attestation Notes**
   - What Tribes enforces
   - What is manual
   - What is out of scope

### Rules
- ✗ No "certified" language
- ✗ No marketing claims
- ✓ Mapping reflects real system behavior
- ✓ Evidence retrievable on demand

---

## Global Enforcement Rules

All reporting surfaces must:

1. **Declare scope** - System or Organization level
2. **Be read-only** - No operational controls
3. **Generate audit events** - Every view, download, generation logged
4. **Support mobile parity** - Identical behavior on all devices
5. **Avoid operational controls** - No actions that modify system state

---

## Navigation Structure

```
/admin
├── reporting (Executive Reporting Dashboard)
│   ├── summaries (Board Summaries)
│   └── compliance (Compliance Mapping)
├── data-room (Data Room Exports)
└── disclosures (Regulatory Disclosures)
```

---

## Future Considerations

Any new reporting features must:
- Declare audience (Executive / Board / Auditor)
- Declare scope (System / Org)
- Be read-only by default
- Generate audit events
- Avoid operational controls

---

*Document Authority: This specification governs all executive reporting surfaces.*

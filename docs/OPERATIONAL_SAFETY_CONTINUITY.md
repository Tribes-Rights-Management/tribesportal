# Operational Safety & Continuity Layer

> **Authority**: This document defines the operational safety, notification, API access, and disaster recovery posture for the Tribes platform.

---

## Overview

The Operational Safety & Continuity Layer provides three critical capabilities:

1. **Notifications & Escalation**: Automated alerting with SLA-based escalation
2. **Read-Only API Access**: Scoped, auditable API tokens for external systems
3. **Disaster Recovery**: Immutable backup manifests and recovery event tracking

---

## Phase 1: Notifications & Escalation

### Notification Types

| Type | Description | Default Priority |
|------|-------------|------------------|
| `authority_change_proposal` | Authority change requires approval | High |
| `licensing_request` | New licensing request submitted | Normal |
| `payment_failure` | Payment processing failed | Critical |
| `refund_initiated` | Refund has been initiated | High |
| `approval_timeout` | Approval deadline approaching | High |
| `security_event` | Security-relevant event detected | Critical |
| `export_completed` | Data room export ready | Normal |
| `membership_change` | Membership status changed | Normal |

### Escalation Rules

- **Platform Executives** configure escalation rules
- Rules define SLA (minutes) before escalation
- Escalation targets are **role-based**, not user-specific
- Every escalation generates an audit event

### Authority Matrix

| Role | Capabilities |
|------|--------------|
| Platform Executive | Configure rules, view all notifications |
| Tribes Admin | Receive operational notifications |
| Org Admin | Receive org-scoped notifications only |
| Member | Receive informational notifications only |

### Constraints

- Notifications are **append-only** (cannot be deleted)
- Every notification and escalation generates audit events
- Mobile and desktop parity required

---

## Phase 2: Read-Only API Access

### API Token Properties

| Property | Description |
|----------|-------------|
| `scope` | `platform_read` or `organization_read` |
| `expires_at` | Time-bound expiration (required) |
| `granted_to_email` | Explicit grant recipient |
| `status` | `active`, `revoked`, or `expired` |

### Use Cases

- Accounting system integration
- Analytics platforms
- External auditor data access
- Partner visibility dashboards

### Security Constraints

1. **Read-only only** - No writes permitted
2. **Scope-aware** - API consumers only access authorized data
3. **Logged** - Every API call is recorded
4. **Time-bound** - All tokens expire
5. **No existence leaks** - Restricted data is invisible

### Token Format

```
tribes_<64-character-hex-string>
```

Token is shown **once** at creation. Only the hash is stored.

---

## Phase 3: Disaster Recovery Posture

### Critical Tables

The following tables require backup protection:

- `audit_logs` - Immutable audit trail
- `access_logs` - Record access history
- `contracts` - Legal agreements
- `invoices` - Financial records
- `payments` - Transaction records
- `refunds` - Refund history
- `user_profiles` - Identity data
- `tenant_memberships` - Authorization data
- `tenants` - Organization data
- `notifications` - Communication history
- `escalation_events` - Escalation audit trail
- `api_tokens` - API access grants
- `api_access_logs` - API audit trail
- `data_room_exports` - Disclosure records

### Recovery Event Types

| Type | Description |
|------|-------------|
| `backup_created` | New backup generated |
| `backup_verified` | Backup integrity confirmed |
| `restore_initiated` | Recovery process started |
| `restore_completed` | Recovery completed successfully |
| `restore_failed` | Recovery process failed |
| `integrity_check` | Data integrity verification |

### Recovery Targets

| Metric | Target | Description |
|--------|--------|-------------|
| **RPO** | 24 hours | Maximum data loss window |
| **RTO** | 4 hours | Maximum recovery time |

### Constraints

1. **Recovery events are immutable** - Cannot be modified or deleted
2. **Rollbacks never rewrite history** - New events are created
3. **Recovery actions restricted to Platform Executives**
4. **Every recovery operation generates audit records**

---

## Enforcement Clause

All future features, integrations, and products **MUST** inherit:

- Notification rules
- Escalation paths
- API scope rules
- Disaster recovery posture

**No exceptions. No retrofitting.**

---

## Database Schema

### Notifications

```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY,
  recipient_id UUID NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id),
  notification_type notification_type NOT NULL,
  priority notification_priority NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  record_type TEXT,
  record_id UUID,
  correlation_id TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL
);
```

### API Tokens

```sql
CREATE TABLE public.api_tokens (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  scope api_token_scope NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id),
  granted_by UUID NOT NULL,
  granted_to_email TEXT NOT NULL,
  status api_token_status NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL
);
```

### Recovery Events

```sql
CREATE TABLE public.recovery_events (
  id UUID PRIMARY KEY,
  event_type recovery_event_type NOT NULL,
  initiated_by UUID NOT NULL,
  target_tables TEXT[] NOT NULL,
  backup_id TEXT,
  restore_point TIMESTAMPTZ,
  status TEXT NOT NULL,
  details JSONB,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  error_message TEXT
);
```

---

## Audit Trail

All operations in this layer generate audit events:

- Notification created
- Notification read
- Escalation triggered
- Escalation resolved
- API token created
- API token revoked
- API access logged
- Integrity check initiated
- Backup verified

---

## Notification Language Lock

### Tone Principles

All notifications MUST be:

- **Neutral** — No emotional language
- **Precise** — Clear, specific statements
- **Calm** — No urgency theater
- **Non-marketing** — No promotional tone
- **Non-emotional** — No exclamation points

### Canonical Copy

| Category | Example |
|----------|---------|
| Informational | "A licensing request has been submitted and is awaiting review." |
| Action Required | "A licensing request requires your review." |
| Escalation | "This item has not been addressed within the expected review window and has been escalated." |
| Executive Visibility | "This event has been escalated for executive awareness." |
| Financial | "An invoice payment attempt was unsuccessful." |
| Authority | "A change to user authority has been proposed and requires approval." |

### Prohibited Language

The following terms are **prohibited** in all notifications:

- "Urgent"
- "ASAP"
- "Don't forget"
- Emojis
- Friendly nudges
- Marketing language
- Exclamation points

### Enforcement

- No feature may introduce custom notification copy outside this standard
- Notification language must remain consistent across in-app and email surfaces
- Use `validateNotificationLanguage()` from `src/constants/notification-language.ts`

---

## Enterprise Onboarding Posture

### Principles

Onboarding must signal **authority, clarity, and restraint** — not guidance or persuasion.

### Required Elements

#### Workspace Entry

- Explicit scope declaration (e.g., "You are entering: Client Portal")
- Explicit role confirmation (e.g., "Your role: Organization Admin")
- Read-only posture until the first deliberate action

#### First-Session Guardrails

- No automatic navigation into actions
- No forced tours or tooltips
- Clear, minimal entry points only

#### Authority Transparency

- Visible "What you can do" indicators
- Visible "What you cannot do" indicators
- Clear instruction for requesting authority changes

#### Compliance Signals

- Authority history available (read-only)
- Contracts versioned and traceable
- Billing actions tied to governing agreements

#### External Partner Onboarding

- Minimal, scoped UI
- Explicit scope labeling
- No platform discovery
- No admin affordances

### Prohibitions

- **No gamification**
- **No onboarding tours**
- **No progressive disclosure** unless explicitly requested

---

## Implementation Files

| File | Purpose |
|------|---------|
| `src/constants/escalation-sla-defaults.ts` | Default SLA configurations |
| `src/constants/notification-language.ts` | Notification templates and language lock |
| `src/hooks/useNotifications.ts` | Notification management hooks |
| `src/hooks/useApiTokens.ts` | API token management hooks |
| `src/hooks/useDisasterRecovery.ts` | Recovery event tracking hooks |
| `src/components/onboarding/WorkspaceInitialization.tsx` | Workspace entry component |
| `src/components/onboarding/ExternalPartnerView.tsx` | External partner onboarding |
| `src/components/onboarding/FirstSessionGuardrails.tsx` | First-session guardrails |
| `supabase/functions/api-gateway/index.ts` | Read-only API gateway |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-17 | Initial specification |
| 1.1 | 2026-01-17 | Added notification language lock and enterprise onboarding posture |

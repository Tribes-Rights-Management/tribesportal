# TRIBES PLATFORM ARCHITECTURE

## Master Enforcement Directive — Locked as Canonical

This document defines the immutable architecture rules for the Tribes platform.
Any deviation from these rules is a regression and must be rejected.

---

## I. Final Hierarchy (Locked)

TRIBES exists at **two layers only**:

### 1. Company Layer (NOT a Workspace)

| Surface | Purpose | Access |
|---------|---------|--------|
| **System Console** | Governance, audit, compliance, security | `platform_owner`, `external_auditor` (read-only) |

**System Console is NOT an organization or workspace.**
It must never appear in the workspace/org switcher.

### 2. Workspace Layer (Operating Environments)

| Workspace | Purpose | Roles |
|-----------|---------|-------|
| **Tribes Team** | Internal operations | `tribes_team_admin`, `tribes_team_staff` |
| **Licensing** | External licensees | `licensing_user` |
| **Tribes Admin** | Administration clients | `portal_client_admin`, `portal_client_user` |

Workspaces are the ONLY entities selectable via the switcher.

---

## II. System Console (Company Layer)

### Rename and Enforce
- ~~"Tribes Platform"~~ → **"System Console"**

### Purpose
Company-level governance and oversight only.

### Who Can Access
- `platform_owner` (executives / super admins) — Full access
- `external_auditor` — Read-only access

### What System Console May Contain
- ✅ Governance dashboards
- ✅ Security posture
- ✅ Audit logs
- ✅ Regulatory disclosures
- ✅ Cross-workspace reporting
- ✅ Correlation views

### What System Console Must NEVER Contain
- ❌ Licensing
- ❌ Tribes Admin
- ❌ Operational queues
- ❌ Catalogs
- ❌ Requests
- ❌ Client or licensee actions

### Navigation Rules
- No product navigation
- No workspace switcher
- Accessed only via user/profile menu
- UI must feel sparse, supervisory, and non-operational

---

## III. Workspaces (Operating Layer)

Workspaces represent operating environments.
They own operational data and workflows.

### A. Tribes Team (Internal Operations)

**Who:**
- `tribes_team_admin`
- `tribes_team_staff`

**What:**
- Review and approve requests
- Operational queues
- Messaging triage
- Limited cross-workspace visibility based on role

### B. Licensing (External Licensees)

**Who:**
- `licensing_user`

**What:**
- Submit licensing requests
- View own request history
- View agreements
- Licensing-only messaging

### C. Tribes Admin (Administration Clients)

**Who:**
- `portal_client_admin`
- `portal_client_user`

**What:**
- Contracts and records
- Song submissions
- Status tracking
- Client messaging
- Payments (later, provider-based)

### Workspace Rules
- No workspace can see another workspace's data
- No workspace can access System Console features
- Products only exist inside workspaces

---

## IV. Role-Based Access (Strict)

### Company-Level Roles

| Role | Access |
|------|--------|
| `platform_owner` | Full System Console access, optional workspace access |
| `external_auditor` | Read-only System Console, read-only approved workspace views, no actions/messaging/configuration |

### Workspace Roles

| Role | Workspace |
|------|-----------|
| `tribes_team_admin` | Tribes Team |
| `tribes_team_staff` | Tribes Team |
| `licensing_user` | Licensing |
| `portal_client_admin` | Tribes Admin |
| `portal_client_user` | Tribes Admin |

### Access Rules
- **Default deny** — Access must be explicitly granted
- **All routes guarded** — Access restricted, never 404
- **All privileged actions logged** — Immutable audit trail
- **RLS enforced** — By workspace + role

---

## V. Mobile Navigation & Behavior (Locked)

### Global Mobile Rules
- Mobile is not a scaled desktop
- One primary action per screen
- No horizontal scrolling tables for core workflows
- No hover-only actions
- No precision configuration on mobile

### System Console (Mobile)
- Read-only governance, audit, disclosures
- No workspace switcher
- No operational tools

### Tribes Team (Mobile)
- Queues, approvals, messages, alerts
- No configuration or bulk operations

### Licensing (Mobile)
- Excellent full flow: submit → status → agreement → message

### Tribes Admin (Mobile)
- Excellent full flow: records → submit → status → message
- Payments view-only until integrated

### If a Feature is Not Mobile-Appropriate
- Hide it entirely
- Show restrained notice: "This action is available on desktop."

---

## VI. Org/Workspace Switcher Rules

### Switcher Label
**"Workspace"** (not "Organization")

### Behavior
- Lists ONLY operating workspaces
- Never lists System Console
- Switching workspaces changes data scope everywhere

### Helper Copy
> "Workspaces represent separate operating environments."

---

## VII. Future Product Add-On Guardrails

Every new module MUST declare:

### 1. Placement
- Company-level (System Console)
- Workspace-level
- Cross-workspace read-only

### 2. Permissions
- New permission namespace
- Default deny
- Explicit role mapping

### 3. Data Model
- No duplication of canonical entities
- Scoped views only
- Correlation IDs propagate

### 4. Audit
- All privileged actions logged
- Actor, timestamp, correlation_id required

### 5. Mobile
- Allowed / read-only / hidden explicitly defined
- Table collapse strategy declared

**If a module cannot satisfy these rules, it cannot ship.**

---

## Final Enforcement Rule

| Rule | Meaning |
|------|---------|
| Company governance ≠ operational work | System Console is oversight, not operations |
| System Console ≠ workspace | Never listed in switcher, no products |
| Products exist only inside workspaces | No operational surfaces in System Console |
| Mobile is first-class | Not an afterthought |
| Nothing ships without permissions, logs, and scope | Non-negotiable |

---

## File References

| File | Purpose |
|------|---------|
| `src/layouts/SystemConsoleLayout.tsx` | Company-level layout |
| `src/components/app/GlobalHeader.tsx` | Workspace navigation |
| `src/hooks/useRoleAccess.tsx` | Permission enforcement |
| `src/constants/institutional-copy.ts` | Canonical copy |
| `src/styles/tokens.ts` | Design tokens |

---

*End of directive.*

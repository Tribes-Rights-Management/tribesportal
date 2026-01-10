# Tribes RLS Coverage Audit

## Overview

This document tracks the Row Level Security (RLS) implementation status across all tenant-scoped tables in the Tribes platform. Every table follows one of four security templates to ensure consistent, auditable access control.

## Security Templates

### Template A — Access Control (Highest Sensitivity)
- **Purpose**: Membership and role management
- **SELECT**: User can read own memberships; managers can read tenant memberships
- **INSERT/UPDATE**: `tenant_owner`, `internal_admin` only
- **DELETE**: `internal_admin` only (platform admin via soft delete)

### Template L — Licensing Tables
- **Purpose**: Licensing workflow data accessible to licensing users
- **SELECT**: Any active member (`is_active_member(tenant_id)`)
- **INSERT**: `licensing_user`, `publishing_admin`, `tenant_owner`, `internal_admin`
- **UPDATE**: `publishing_admin`, `tenant_owner`, `internal_admin`
- **DELETE**: `tenant_owner`, `internal_admin`

### Template P — Publishing Tables
- **Purpose**: Publishing data restricted from licensing-only users
- **SELECT**: Publishing-capable roles only (`has_publishing_access(tenant_id)`)
- **INSERT/UPDATE**: `publishing_admin`, `tenant_owner`, `internal_admin`
- **DELETE**: `tenant_owner`, `internal_admin`

### Template S — Shared Tables
- **Purpose**: Cross-context resources (documents, notes)
- **SELECT**: Any active member (`is_active_member(tenant_id)`)
- **INSERT/UPDATE**: `publishing_admin`, `tenant_owner`, `internal_admin`
- **DELETE**: `tenant_owner`, `internal_admin`

---

## Coverage Checklist

| Table | tenant_id | RLS Enabled | Template | SELECT | INSERT | UPDATE | DELETE | Status |
|-------|-----------|-------------|----------|--------|--------|--------|--------|--------|
| `tenants` | PK | ✅ | A | ✅ | ✅ | ✅ | ❌ (no delete) | ✅ Complete |
| `tenant_memberships` | ✅ FK | ✅ | A | ✅ | ✅ | ✅ | ✅ (platform admin) | ✅ Complete |
| `membership_roles` | via FK | ✅ | A | ✅ | ✅ | ✅ | ✅ | ✅ Complete |
| `license_requests` | ✅ FK | ✅ | L | ✅ | ✅ | ✅ | ✅ | ✅ Complete |
| `licenses` | ✅ FK | ✅ | L | ✅ | ✅ | ✅ | ✅ | ✅ Complete |
| `works` | ✅ FK | ✅ | P | ✅ | ✅ | ✅ | ✅ | ✅ Complete |
| `splits` | ✅ FK | ✅ | P | ✅ | ✅ | ✅ | ✅ | ✅ Complete |
| `registrations` | ✅ FK | ✅ | P | ✅ | ✅ | ✅ | ✅ | ✅ Complete |
| `statements` | ✅ FK | ✅ | P | ✅ | ✅ | ✅ | ✅ | ✅ Complete |
| `payments` | ✅ FK | ✅ | P | ✅ | ✅ | ✅ | ✅ | ✅ Complete |
| `documents` | ✅ FK | ✅ | S | ✅ | ✅ | ✅ | ✅ | ✅ Complete |
| `tenant_notes` | ✅ FK | ✅ | S | ✅ | ✅ | ✅ | ✅ | ✅ Complete |

---

## Non-Tenant Tables (Platform-Level)

| Table | RLS Enabled | Access Control | Status |
|-------|-------------|----------------|--------|
| `user_profiles` | ✅ | User reads own; admin reads all | ✅ Complete |
| `user_roles` | ✅ | User reads own; admin manages | ✅ Complete |
| `context_permissions` | ✅ | Authenticated read; admin write | ✅ Complete |
| `audit_logs` | ✅ | Platform admin + tenant member read; no user write | ✅ Complete |
| `contact_submissions` | ✅ | Platform admin only; insert via edge function | ✅ Complete |
| `data_catalog_tables` | ✅ | Platform admin only | ✅ Complete |
| `data_catalog_columns` | ✅ | Platform admin only | ✅ Complete |

---

## Helper Functions

| Function | Purpose | Security |
|----------|---------|----------|
| `is_active_member(tenant_id)` | Core tenant gate - requires `status='active'` | SECURITY DEFINER |
| `has_tenant_role(tenant_id, role)` | Check single role in tenant | SECURITY DEFINER |
| `has_any_tenant_role(tenant_id, roles[])` | Check any role from array | SECURITY DEFINER |
| `has_publishing_access(tenant_id)` | Publishing-capable roles gate | SECURITY DEFINER |
| `can_manage_memberships(tenant_id)` | Approval authority check | SECURITY DEFINER |
| `is_platform_admin(user_id)` | Platform admin check | SECURITY DEFINER |
| `get_user_tenant_ids(user_id)` | Active tenant IDs for user | SECURITY DEFINER |

---

## Security Guarantees

### ✅ Tenant Isolation
- All tenant-scoped tables require `tenant_id`
- All SELECT policies verify active membership in the specific tenant
- No cross-tenant data leakage possible via RLS

### ✅ Approval Gate
- `is_active_member()` requires `memberships.status = 'active'`
- Users with `invited` or `suspended` status receive zero tenant data
- Approval is enforced at database level, not UI level

### ✅ Role-Based Access Control
- Write operations are role-gated, not context-gated
- Publishing tables blocked from licensing-only users
- Membership management restricted to owners/admins

### ✅ Context Separation
- Licensing users can read licensing data, cannot see publishing data
- Publishing admins have cross-context visibility
- Read-only role provides limited read access to both contexts

---

## Verification Queries

### Check RLS is enabled on all tables
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

### List all RLS policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Verify helper functions exist
```sql
SELECT proname, prosecdef 
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace 
AND proname IN ('is_active_member', 'has_tenant_role', 'has_any_tenant_role', 'has_publishing_access', 'can_manage_memberships');
```

---

## Audit Log

| Date | Action | Tables Affected | Reviewer |
|------|--------|-----------------|----------|
| 2026-01-10 | Initial RLS implementation | All tenant tables | System |
| 2026-01-10 | Added Template A/L/P/S policies | 12 tables | System |

---

*Last updated: 2026-01-10*

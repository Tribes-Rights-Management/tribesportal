# Schema Canon — Tribes Rights Management

> **Purpose**: Definitive classification of every table in the database.
> New code MUST reference canonical tables. Legacy tables exist but should NOT be used for new features.
> Last updated: 2026-02-07

---

## Classification Key

| Label | Meaning | Action |
|-------|---------|--------|
| **CANONICAL** | Correct, actively used table | Use in new code |
| **LEGACY** | From earlier build phase, superseded | Do NOT reference in new code |
| **SYSTEM** | Infrastructure (audit, security, recovery) | Keep, rarely touch |
| **JUNCTION** | Relationship/association table | Keep |
| **STUB** | Created but empty or barely used | Drop candidate |
| **VIEW** | Database view, not a table | Read-only |

---

## Identity & Access (8 tables)

| Table | Cols | Classification | Notes |
|-------|------|---------------|-------|
| `user_profiles` | 11 | **CANONICAL** | Primary user identity. Has `platform_role`, `status`, `can_manage_help`. Keyed by separate `id` + `user_id` (references `auth.users`). |
| `tenant_memberships` | 10 | **CANONICAL** | Links users to tenants with `role` (portal_role), `allowed_contexts`, `default_context`. |
| `tenants` | 5 | **CANONICAL** | Multi-tenant root. `name`, `slug`. |
| `company_users` | 8 | **CANONICAL** | Internal staff/team members. Has `role` (company_user_role), `deactivated_at` for soft disable. |
| `user_preferences` | 18 | **CANONICAL** | UI preferences, notification settings, timezone, density mode. Keyed by `user_id`. |
| `platform_user_capabilities` | 6 | **CANONICAL** | Fine-grained capability flags (e.g., `can_manage_help`). Keyed by `user_id`. |
| `tenant_ui_policies` | 4 | **CANONICAL** | Tenant-level UI density policies. |
| `access_requests` | 9 | **CANONICAL** | Platform access requests with `status` (access_request_status), `tenant_hint`. |

---

## Client & Organization Management (7 tables)

| Table | Cols | Classification | Notes |
|-------|------|---------------|-------|
| `client_accounts` | 17 | **CANONICAL** | Client entities (companies/individuals). Has address, `status` (client_account_status), `trolley_recipient_id` for payouts. |
| `client_account_members` | 13 | **CANONICAL** | Links users to client accounts with `role` (client_member_role) and granular permissions (`can_submit_songs`, `can_view_contracts`, etc.). |
| `client_ipi_numbers` | 9 | **CANONICAL** | IPI numbers associated with client accounts. Supports multiple IPIs per client with `is_primary` flag. |
| `client_invitations` | 9 | **CANONICAL** | Invitations for external clients to join accounts. Has `token`, `expires_at`. |
| `invitations` | 17 | **CANONICAL** | Organization-level invitations with module grants (`grant_admin_module`, `grant_licensing_module`), `admin_access_level`. |
| `module_access` | 10 | **CANONICAL** | Tracks which users have access to which modules (`module_type`) at which `access_level`, per organization. |
| `pro_organizations` | 8 | **CANONICAL** | Performing Rights Organizations registry (ASCAP, BMI, etc.). Reference data. |

---

## Song Catalog & Rights (10 tables)

| Table | Cols | Classification | Notes |
|-------|------|---------------|-------|
| `songs` | 16 | **CANONICAL** | Master song registry. `title`, `iswc`, `alternate_titles[]`, `metadata` (JSONB), `source_queue_id` links to submission origin. |
| `writers` | 23 | **CANONICAL** | Master writer registry. Synced to Algolia. Has `ipi_number`, `pro`, `pro_member_id`, `is_controlled`, `territories[]`. |
| `publishers` | 28 | **CANONICAL** | Publisher registry. `legal_name`, `ipi_number`, `pro`, `is_controlled`, `territories[]`, `publisher_type`. |
| `song_writers` | 10 | **JUNCTION** | Links songs → writers. `ownership_percentage`, `share_type`, `writer_role`, temporal (`effective_from`/`to`). |
| `song_publishers` | 11 | **JUNCTION** | Links songs → publishers. `ownership_percentage`, `publisher_role`, `administered_by`, temporal. |
| `song_interested_parties` | 9 | **JUNCTION** | Links songs → interested parties (broader than writers). `share_percentage`, `controlled`, `territory`. |
| `interested_parties` | 10 | **CANONICAL** | Broader rights holder registry (beyond writers). `party_type` (interested_party_type enum), linked to `client_account_id`. |
| `interested_party_ipi_numbers` | 6 | **JUNCTION** | IPI numbers for interested parties. `is_primary` flag. |
| `song_versions` | 11 | **CANONICAL** | Immutable version history for songs. `version_number`, `interested_parties_snapshot` (JSONB), `change_summary`. |
| `song_visibility_overrides` | 7 | **CANONICAL** | Explicit visibility grants/revocations for specific client accounts on specific songs. |

---

## Song Submission Queue (1 table)

| Table | Cols | Classification | Notes |
|-------|------|---------------|-------|
| `song_queue` | 17 | **CANONICAL** | Submission workflow. `submitted_data` (JSONB snapshot), `current_data` (JSONB, updated on revision), `status` (song_queue_status), `approved_song_id` links to final song record. Supports revision cycle. |

---

## Licensing (4 tables)

| Table | Cols | Classification | Notes |
|-------|------|---------------|-------|
| `licensing_requests` | 13 | **CANONICAL** | License request workflow. `status` (licensing_request_status), `correlation_id` for audit chain, tenant-scoped. |
| `licensing_agreements` | 11 | **CANONICAL** | Executed agreements. `status` (agreement_status), linked to `request_id`, `correlation_id`. |
| `licensing_access_requests` | 11 | **CANONICAL** | Requests from external parties to access the licensing portal. Separate from `access_requests` (platform-level). |
| `portal_agreements` | 6 | **CANONICAL** | Client-facing view of agreements. Lighter schema than `licensing_agreements`. |

---

## Billing & Financial (6 tables)

| Table | Cols | Classification | Notes |
|-------|------|---------------|-------|
| `contracts` | 17 | **CANONICAL** | Governing agreements. Versioned (`version`, `version_hash`), supports `parent_contract_id` for amendments. |
| `contract_associations` | 8 | **JUNCTION** | Links contracts → client accounts. `is_signatory`, `signature_required`, `signed_at`. |
| `invoices` | 21 | **CANONICAL** | Financial invoices. `contract_id` + `contract_version_hash` for lineage integrity. `correlation_id`. |
| `invoice_line_items` | 8 | **CANONICAL** | Line items per invoice. `quantity`, `unit_amount`, `amount`. |
| `payments` | 16 | **CANONICAL** | Payment records. `provider_payment_id`, `provider_charge_id` for Stripe/processor linkage. |
| `refunds` | 12 | **CANONICAL** | Refund records. `reason` (refund_reason enum), linked to `payment_id`. |

---

## Help Center (7 tables + 2 views)

| Table | Cols | Classification | Notes |
|-------|------|---------------|-------|
| `help_articles` | 10 | **CANONICAL** | Help Workstation articles. `status` (help_article_status), `search_vector` for full-text search, `content` (TipTap HTML). |
| `help_categories` | 7 | **CANONICAL** | Help article categories. `icon`, `slug`. |
| `help_audiences` | 8 | **CANONICAL** | Audience segments (e.g., "Songwriters", "Licensees"). `is_active`, `position` for ordering. |
| `help_article_audiences` | 8 | **JUNCTION** | Links articles → audiences via categories. Supports `title_override`, `content_override` per audience. |
| `help_category_audiences` | 5 | **JUNCTION** | Links categories → audiences with `position` ordering. |
| `v_help_articles_by_audience` | 13 | **VIEW** | Denormalized view: articles with audience/category context. |
| `v_help_categories_by_audience` | 9 | **VIEW** | Denormalized view: categories with audience context. |
| `articles` | 12 | **LEGACY** | ⚠️ From help widget era (migration 1). Superseded by `help_articles`. Has `body` (plain text) vs `content` (TipTap HTML). Do NOT use for new features. |
| `categories` | 8 | **LEGACY** | ⚠️ From help widget era. Superseded by `help_categories`. Has `parent_id` (hierarchical) vs flat model in `help_categories`. |

---

## Support & Messaging (7 tables)

| Table | Cols | Classification | Notes |
|-------|------|---------------|-------|
| `support_tickets` | 12 | **CANONICAL** | Email-based support tickets. `mailgun_message_id` for threading, `from_email`, `from_name`. |
| `ticket_messages` | 7 | **CANONICAL** | Messages within support ticket threads. `role` (agent/customer), `mailgun_message_id`. |
| `support_knowledge_base` | 8 | **CANONICAL** | AI knowledge base for support triage. `embedding` for vector search, `category`. |
| `messages` | 13 | **LEGACY** | ⚠️ From help widget contact form. Has `search_query`, `searched_articles` (JSONB). Superseded by `support_tickets` + `ticket_messages` for new support flows. |
| `searches` | 7 | **LEGACY** | ⚠️ From help widget search tracking. Superseded by `search_query_log` for platform-wide search analytics. |
| `chat_conversations` | 3 | **LEGACY** | ⚠️ From help widget AI chat. May still be active if chat widget is live on public site. |
| `chat_messages` | 6 | **LEGACY** | ⚠️ From help widget AI chat responses. `article_references` (JSONB). |

---

## Search Infrastructure (3 tables)

| Table | Cols | Classification | Notes |
|-------|------|---------------|-------|
| `search_index` | 11 | **CANONICAL** | Unified search index. `entity_type`, `entity_id`, `search_vector`, `content_summary`. Tenant-scoped. |
| `search_query_log` | 9 | **CANONICAL** | Search analytics. `entity_types_searched[]`, `result_count`, `duration_ms`. |
| `searches` | 7 | **LEGACY** | (See Support & Messaging above) |

---

## Audit, Compliance & Security (6 tables)

| Table | Cols | Classification | Notes |
|-------|------|---------------|-------|
| `audit_logs` | 14 | **SYSTEM** | Immutable audit trail. `action` (audit_action enum), `correlation_id`, `actor_email` (denormalized). NO updates or deletes. |
| `access_logs` | 9 | **SYSTEM** | Record-level access tracking. `access_type`, `record_type`, `correlation_id`. |
| `api_tokens` | 14 | **SYSTEM** | Read-only API tokens for external integrations. `scope` (api_token_scope), `token_hash`. |
| `api_access_logs` | 11 | **SYSTEM** | API usage tracking per token. `endpoint`, `response_status`, `response_time_ms`. |
| `disclosure_exports` | 13 | **SYSTEM** | Regulatory disclosure packs. `watermark` for integrity. |
| `data_room_exports` | 21 | **SYSTEM** | Data room export packs with broader scope. `content_manifest` (JSONB), `assigned_auditors[]`. |

**Note:** Both `disclosure_exports` and `data_room_exports` exist. `data_room_exports` is the more complete implementation. Consider consolidating in a future migration.

---

## Notifications & Escalations (4 tables)

| Table | Cols | Classification | Notes |
|-------|------|---------------|-------|
| `notifications` | 20 | **CANONICAL** | Active notifications. `requires_resolution`, `retention_category`, `acknowledged_at` ≠ `resolved_at`. |
| `notification_archive` | 20 | **CANONICAL** | Archived notifications (mirror schema). Moved here by `archive_old_notifications()` function. |
| `escalation_rules` | 10 | **CANONICAL** | SLA-based escalation configuration. `sla_minutes`, `notification_type`, `escalation_target_role`. |
| `escalation_events` | 10 | **CANONICAL** | Escalation event log. `escalated_to_role`, `resolved_at`. |

---

## Disaster Recovery (2 tables)

| Table | Cols | Classification | Notes |
|-------|------|---------------|-------|
| `backup_manifests` | 11 | **SYSTEM** | Backup metadata. `tables_included[]`, `record_counts` (JSONB), `file_hash`. |
| `recovery_events` | 11 | **SYSTEM** | Recovery event log. `event_type` (recovery_event_type), `target_tables[]`. |

---

## Portal (Client-Facing) (2 tables)

| Table | Cols | Classification | Notes |
|-------|------|---------------|-------|
| `portal_documents` | 6 | **CANONICAL** | Documents shared with clients via portal. `document_type`, `document_url`. |
| `portal_statements` | 5 | **CANONICAL** | Royalty statements for client portal. `statement_period`, `statement_url`. |

---

## AI & Configuration (3 tables)

| Table | Cols | Classification | Notes |
|-------|------|---------------|-------|
| `ai_agent_config` | 4 | **CANONICAL** | Key-value config for AI features. `config_key`, `config_value`. |
| `system_prompts` | 8 | **CANONICAL** | Versioned system prompts for AI features. `prompt_key`, `version`, `is_active`, `performance_notes`. |
| `voice_transcripts` | 10 | **CANONICAL** | Voice-to-text results for song submissions. `parsed_title`, `parsed_writers[]`, `was_corrected`. |

---

## Standalone / Widget (1 table)

| Table | Cols | Classification | Notes |
|-------|------|---------------|-------|
| `widget_settings` | 6 | **LEGACY** | ⚠️ From help widget era. `chat_enabled`, `primary_color`, `welcome_message`. Not used by current Help Workstation. |

---

## Data Room (1 table)

| Table | Cols | Classification | Notes |
|-------|------|---------------|-------|
| `data_room_access_log` | 7 | **SYSTEM** | Tracks who accessed data room exports. `access_type`, `ip_address`, `user_agent`. |

---

## Summary

| Classification | Count | Tables |
|---------------|-------|--------|
| CANONICAL | 42 | Core business tables actively in use |
| JUNCTION | 7 | Relationship/association tables |
| SYSTEM | 9 | Audit, security, recovery infrastructure |
| LEGACY | 7 | `articles`, `categories`, `messages`, `searches`, `chat_conversations`, `chat_messages`, `widget_settings` |
| VIEW | 2 | `v_help_articles_by_audience`, `v_help_categories_by_audience` |
| **STUB** | 0 | All tables appear to have purpose (some may be empty) |

**Total: 71 tables, 769 columns**

---

## Legacy Table Migration Plan (Post-MVP)

| Legacy Table | Canonical Replacement | Migration Complexity | Data at Risk |
|-------------|----------------------|---------------------|-------------|
| `articles` | `help_articles` | Low — different schemas, likely no shared data | Check if widget still writes here |
| `categories` | `help_categories` | Low — same | Check if widget still writes here |
| `messages` | `support_tickets` + `ticket_messages` | Medium — different structure | Existing messages need migration |
| `searches` | `search_query_log` | Low — analytics only | Can archive |
| `chat_conversations` | None (deprecate) | Low | Archive if any data exists |
| `chat_messages` | None (deprecate) | Low | Archive if any data exists |
| `widget_settings` | None (deprecate) | None | Single row, not used |

**Migration strategy:** Don't DROP tables yet. Add a comment `-- LEGACY: superseded by X` to each. Remove frontend references first, then archive data, then drop tables in a dedicated cleanup migration.

/**
 * FORMAL COMPLIANCE MAPPING
 * 
 * Purpose: Map Tribes' actual system behavior to recognized compliance controls
 * WITHOUT claiming certification.
 * 
 * RULES:
 * - No "certified" language
 * - No marketing claims
 * - Mapping must reflect real system behavior
 * - Evidence must be retrievable on demand
 * 
 * ACCESS:
 * - Platform Executives: Full access
 * - External Auditors: Read-only, time-bound
 */

import { useState } from "react";
import { Shield, Check, Minus, ExternalLink, FileText, Database, Clock, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ComplianceControl {
  id: string;
  domain: string;
  description: string;
  systemSurface: string;
  evidenceSource: string;
  status: "enforced" | "partial" | "manual" | "out_of_scope";
  notes?: string;
}

interface AttestationNote {
  category: "enforced" | "manual" | "out_of_scope";
  description: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPLIANCE CONTROL MATRIX
// ═══════════════════════════════════════════════════════════════════════════

const COMPLIANCE_CONTROLS: ComplianceControl[] = [
  // Access Control & Least Privilege
  {
    id: "AC-1",
    domain: "Access Control",
    description: "Role-based access enforcement",
    systemSurface: "user_profiles, tenant_memberships, RLS policies",
    evidenceSource: "audit_logs, access_logs",
    status: "enforced",
  },
  {
    id: "AC-2",
    domain: "Access Control",
    description: "Least privilege principle",
    systemSurface: "Permission namespaces, surface pruning",
    evidenceSource: "tenant_memberships.allowed_contexts",
    status: "enforced",
  },
  {
    id: "AC-3",
    domain: "Access Control",
    description: "Multi-factor authentication",
    systemSurface: "Supabase Auth",
    evidenceSource: "Auth configuration",
    status: "partial",
    notes: "Available but not enforced by default",
  },
  
  // Change Management
  {
    id: "CM-1",
    domain: "Change Management",
    description: "Authority change dual-control",
    systemSurface: "pending_authority_changes, approval workflow",
    evidenceSource: "audit_logs (record_approved/rejected)",
    status: "enforced",
  },
  {
    id: "CM-2",
    domain: "Change Management",
    description: "Version control for contracts",
    systemSurface: "contracts.version, contracts.version_hash",
    evidenceSource: "Contract lineage chain",
    status: "enforced",
  },
  
  // Audit Logging
  {
    id: "AL-1",
    domain: "Audit Logging",
    description: "Immutable audit trail",
    systemSurface: "audit_logs (append-only)",
    evidenceSource: "Database triggers prevent UPDATE/DELETE",
    status: "enforced",
  },
  {
    id: "AL-2",
    domain: "Audit Logging",
    description: "Access logging",
    systemSurface: "access_logs, api_access_logs",
    evidenceSource: "Log retention policies",
    status: "enforced",
  },
  {
    id: "AL-3",
    domain: "Audit Logging",
    description: "Correlation ID tracking",
    systemSurface: "correlation_id across all tables",
    evidenceSource: "get_correlation_chain function",
    status: "enforced",
  },
  
  // Financial Controls
  {
    id: "FC-1",
    domain: "Financial Controls",
    description: "Invoice-contract lineage",
    systemSurface: "invoices.contract_id, invoices.contract_version_hash",
    evidenceSource: "get_payment_lineage function",
    status: "enforced",
  },
  {
    id: "FC-2",
    domain: "Financial Controls",
    description: "Refund governance",
    systemSurface: "refunds table, executive-only access",
    evidenceSource: "RLS policies, audit_logs",
    status: "enforced",
  },
  
  // Incident Response
  {
    id: "IR-1",
    domain: "Incident Response",
    description: "Security event notifications",
    systemSurface: "notifications (security_event type)",
    evidenceSource: "escalation_events",
    status: "enforced",
  },
  {
    id: "IR-2",
    domain: "Incident Response",
    description: "Escalation SLAs",
    systemSurface: "escalation_rules, check_escalations function",
    evidenceSource: "escalation_events.status",
    status: "enforced",
  },
  
  // Data Retention & Recovery
  {
    id: "DR-1",
    domain: "Data Retention",
    description: "Soft delete with legal hold",
    systemSurface: "deleted_at, legal_hold columns",
    evidenceSource: "Database schema",
    status: "enforced",
  },
  {
    id: "DR-2",
    domain: "Data Retention",
    description: "Backup manifests",
    systemSurface: "backup_manifests, recovery_events",
    evidenceSource: "Backup verification logs",
    status: "enforced",
  },
  {
    id: "DR-3",
    domain: "Data Retention",
    description: "Notification retention (90 days + archive)",
    systemSurface: "notifications, notification_archive",
    evidenceSource: "archive_old_notifications function",
    status: "enforced",
  },
];

const ATTESTATION_NOTES: AttestationNote[] = [
  { category: "enforced", description: "Access control via RLS policies at database level" },
  { category: "enforced", description: "Audit logs are append-only with immutable triggers" },
  { category: "enforced", description: "Authority changes require dual-control approval" },
  { category: "enforced", description: "Financial records maintain contract lineage" },
  { category: "enforced", description: "Escalation SLAs with automated notifications" },
  { category: "manual", description: "MFA enrollment is user-initiated" },
  { category: "manual", description: "External auditor access grants are time-bound" },
  { category: "manual", description: "Data room export approval is executive-only" },
  { category: "out_of_scope", description: "Physical infrastructure security (managed by Supabase)" },
  { category: "out_of_scope", description: "Network-level DDoS protection" },
  { category: "out_of_scope", description: "Payment card data handling (PCI scope delegated to Stripe)" },
];

const EVIDENCE_INDEX = [
  { name: "Authority Events", table: "audit_logs", filter: "action IN ('access_granted', 'access_revoked')" },
  { name: "Billing Lineage", table: "get_payment_lineage()", filter: "By payment ID" },
  { name: "Notification Escalations", table: "escalation_events", filter: "status, escalated_at" },
  { name: "Export Logs", table: "data_room_exports", filter: "requested_at, completed_at" },
  { name: "Backup Snapshots", table: "backup_manifests", filter: "created_at, verified_at" },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function StatusBadge({ status }: { status: ComplianceControl["status"] }) {
  const config = {
    enforced: { label: "Enforced", bg: "rgba(34, 197, 94, 0.15)", color: "#22c55e" },
    partial: { label: "Partial", bg: "rgba(251, 191, 36, 0.15)", color: "#fbbf24" },
    manual: { label: "Manual", bg: "rgba(156, 163, 175, 0.15)", color: "#9ca3af" },
    out_of_scope: { label: "Out of Scope", bg: "rgba(107, 114, 128, 0.1)", color: "#6b7280" },
  }[status];

  return (
    <span 
      className="text-[10px] uppercase tracking-wide font-medium px-2 py-0.5 rounded"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  );
}

function ControlRow({ control }: { control: ComplianceControl }) {
  return (
    <div 
      className="grid grid-cols-12 gap-4 py-3 px-4 border-b last:border-b-0 items-start"
      style={{ borderColor: 'var(--tribes-border)' }}
    >
      <div className="col-span-1">
        <span 
          className="text-[11px] font-mono"
          style={{ color: 'var(--tribes-text-muted)' }}
        >
          {control.id}
        </span>
      </div>
      <div className="col-span-3">
        <p 
          className="text-[12px]"
          style={{ color: 'var(--tribes-text)' }}
        >
          {control.description}
        </p>
        {control.notes && (
          <p 
            className="text-[10px] mt-1"
            style={{ color: 'var(--tribes-text-muted)' }}
          >
            {control.notes}
          </p>
        )}
      </div>
      <div className="col-span-3">
        <p 
          className="text-[11px] font-mono"
          style={{ color: 'var(--tribes-text-secondary)' }}
        >
          {control.systemSurface}
        </p>
      </div>
      <div className="col-span-3">
        <p 
          className="text-[11px]"
          style={{ color: 'var(--tribes-text-muted)' }}
        >
          {control.evidenceSource}
        </p>
      </div>
      <div className="col-span-2 flex justify-end">
        <StatusBadge status={control.status} />
      </div>
    </div>
  );
}

function EvidenceIndexRow({ item }: { item: typeof EVIDENCE_INDEX[0] }) {
  return (
    <div 
      className="flex items-center justify-between py-3 px-4 border-b last:border-b-0"
      style={{ borderColor: 'var(--tribes-border)' }}
    >
      <div className="flex items-center gap-3">
        <Database size={14} style={{ color: 'var(--tribes-text-muted)' }} />
        <div>
          <p 
            className="text-[13px]"
            style={{ color: 'var(--tribes-text)' }}
          >
            {item.name}
          </p>
          <p 
            className="text-[11px] font-mono"
            style={{ color: 'var(--tribes-text-muted)' }}
          >
            {item.table}
          </p>
        </div>
      </div>
      <span 
        className="text-[11px]"
        style={{ color: 'var(--tribes-text-muted)' }}
      >
        {item.filter}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function ComplianceMappingPage() {
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  
  const domains = [...new Set(COMPLIANCE_CONTROLS.map(c => c.domain))];
  const filteredControls = selectedDomain === "all" 
    ? COMPLIANCE_CONTROLS 
    : COMPLIANCE_CONTROLS.filter(c => c.domain === selectedDomain);

  return (
    <div className="w-full max-w-[1040px] mx-auto px-4 sm:px-6 py-8">
      <PageHeader 
        title="Compliance Mapping"
        description="System behavior mapped to recognized compliance controls"
      />

      {/* Disclaimer */}
      <div 
        className="flex items-start gap-3 p-4 rounded-lg mb-6"
        style={{ 
          backgroundColor: 'rgba(251, 191, 36, 0.08)',
          border: '1px solid rgba(251, 191, 36, 0.2)',
        }}
      >
        <AlertTriangle size={16} style={{ color: '#fbbf24', flexShrink: 0, marginTop: 2 }} />
        <p 
          className="text-[12px]"
          style={{ color: 'var(--tribes-text-secondary)' }}
        >
          This mapping reflects actual system behavior and is provided for audit reference only. 
          It does not constitute a certification claim.
        </p>
      </div>

      <Tabs defaultValue="matrix" className="space-y-6">
        <TabsList>
          <TabsTrigger value="matrix">Control Matrix</TabsTrigger>
          <TabsTrigger value="evidence">Evidence Index</TabsTrigger>
          <TabsTrigger value="attestation">Attestation Notes</TabsTrigger>
        </TabsList>

        {/* Control Matrix Tab */}
        <TabsContent value="matrix">
          {/* Domain Filter */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Button
              variant={selectedDomain === "all" ? "outline" : "ghost"}
              size="sm"
              onClick={() => setSelectedDomain("all")}
              className="h-7 px-3 text-[11px] rounded-full"
            >
              All Domains
            </Button>
            {domains.map((domain) => (
              <Button
                key={domain}
                variant={selectedDomain === domain ? "outline" : "ghost"}
                size="sm"
                onClick={() => setSelectedDomain(domain)}
                className="h-7 px-3 text-[11px] rounded-full"
              >
                {domain}
              </Button>
            ))}
          </div>

          {/* Matrix Table */}
          <div 
            className="rounded-lg border overflow-hidden"
            style={{ 
              backgroundColor: 'var(--tribes-panel-bg)',
              borderColor: 'var(--tribes-border)',
            }}
          >
            {/* Header */}
            <div 
              className="grid grid-cols-12 gap-4 py-2 px-4 border-b"
              style={{ 
                borderColor: 'var(--tribes-border)',
                backgroundColor: 'rgba(255,255,255,0.02)',
              }}
            >
              <span className="col-span-1 text-[10px] uppercase tracking-wider" style={{ color: 'var(--tribes-text-muted)' }}>ID</span>
              <span className="col-span-3 text-[10px] uppercase tracking-wider" style={{ color: 'var(--tribes-text-muted)' }}>Control</span>
              <span className="col-span-3 text-[10px] uppercase tracking-wider" style={{ color: 'var(--tribes-text-muted)' }}>System Surface</span>
              <span className="col-span-3 text-[10px] uppercase tracking-wider" style={{ color: 'var(--tribes-text-muted)' }}>Evidence Source</span>
              <span className="col-span-2 text-[10px] uppercase tracking-wider text-right" style={{ color: 'var(--tribes-text-muted)' }}>Status</span>
            </div>
            
            {/* Rows */}
            {filteredControls.map((control) => (
              <ControlRow key={control.id} control={control} />
            ))}
          </div>
        </TabsContent>

        {/* Evidence Index Tab */}
        <TabsContent value="evidence">
          <div 
            className="rounded-lg border"
            style={{ 
              backgroundColor: 'var(--tribes-panel-bg)',
              borderColor: 'var(--tribes-border)',
            }}
          >
            <div 
              className="flex items-center gap-2 px-4 py-3 border-b"
              style={{ borderColor: 'var(--tribes-border)' }}
            >
              <Database size={14} style={{ color: 'var(--tribes-text-muted)' }} />
              <span 
                className="text-[11px] uppercase tracking-wider font-medium"
                style={{ color: 'var(--tribes-text-muted)' }}
              >
                Evidence Sources
              </span>
            </div>
            {EVIDENCE_INDEX.map((item, idx) => (
              <EvidenceIndexRow key={idx} item={item} />
            ))}
          </div>
        </TabsContent>

        {/* Attestation Notes Tab */}
        <TabsContent value="attestation">
          <div className="space-y-4">
            {/* What Tribes Enforces */}
            <div 
              className="rounded-lg border"
              style={{ 
                backgroundColor: 'var(--tribes-panel-bg)',
                borderColor: 'var(--tribes-border)',
              }}
            >
              <div 
                className="flex items-center gap-2 px-4 py-3 border-b"
                style={{ borderColor: 'var(--tribes-border)' }}
              >
                <Check size={14} style={{ color: '#22c55e' }} />
                <span 
                  className="text-[11px] uppercase tracking-wider font-medium"
                  style={{ color: 'var(--tribes-text-muted)' }}
                >
                  What Tribes Enforces
                </span>
              </div>
              <div className="px-4 py-3">
                <ul className="space-y-2">
                  {ATTESTATION_NOTES.filter(n => n.category === "enforced").map((note, idx) => (
                    <li 
                      key={idx} 
                      className="text-[12px] flex items-start gap-2"
                      style={{ color: 'var(--tribes-text-secondary)' }}
                    >
                      <span style={{ color: '#22c55e' }}>•</span>
                      {note.description}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* What Is Manual */}
            <div 
              className="rounded-lg border"
              style={{ 
                backgroundColor: 'var(--tribes-panel-bg)',
                borderColor: 'var(--tribes-border)',
              }}
            >
              <div 
                className="flex items-center gap-2 px-4 py-3 border-b"
                style={{ borderColor: 'var(--tribes-border)' }}
              >
                <Minus size={14} style={{ color: '#9ca3af' }} />
                <span 
                  className="text-[11px] uppercase tracking-wider font-medium"
                  style={{ color: 'var(--tribes-text-muted)' }}
                >
                  What Is Manual
                </span>
              </div>
              <div className="px-4 py-3">
                <ul className="space-y-2">
                  {ATTESTATION_NOTES.filter(n => n.category === "manual").map((note, idx) => (
                    <li 
                      key={idx} 
                      className="text-[12px] flex items-start gap-2"
                      style={{ color: 'var(--tribes-text-secondary)' }}
                    >
                      <span style={{ color: '#9ca3af' }}>•</span>
                      {note.description}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* What Is Out of Scope */}
            <div 
              className="rounded-lg border"
              style={{ 
                backgroundColor: 'var(--tribes-panel-bg)',
                borderColor: 'var(--tribes-border)',
              }}
            >
              <div 
                className="flex items-center gap-2 px-4 py-3 border-b"
                style={{ borderColor: 'var(--tribes-border)' }}
              >
                <ExternalLink size={14} style={{ color: '#6b7280' }} />
                <span 
                  className="text-[11px] uppercase tracking-wider font-medium"
                  style={{ color: 'var(--tribes-text-muted)' }}
                >
                  What Is Out of Scope
                </span>
              </div>
              <div className="px-4 py-3">
                <ul className="space-y-2">
                  {ATTESTATION_NOTES.filter(n => n.category === "out_of_scope").map((note, idx) => (
                    <li 
                      key={idx} 
                      className="text-[12px] flex items-start gap-2"
                      style={{ color: 'var(--tribes-text-secondary)' }}
                    >
                      <span style={{ color: '#6b7280' }}>•</span>
                      {note.description}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div 
        className="mt-8 text-center text-[10px]"
        style={{ color: 'var(--tribes-text-muted)' }}
      >
        This mapping is for audit reference only and does not constitute certification.
      </div>
    </div>
  );
}

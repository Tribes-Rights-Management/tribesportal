/**
 * EXECUTIVE REPORTING DASHBOARD
 * 
 * Purpose: Calm, factual visibility into system health, governance, and risk.
 * 
 * RULES:
 * - Read-only (no operational actions)
 * - No charts that imply performance targets
 * - No gamification
 * - Time-range filters only
 * - Every metric links to a read-only detail view
 * 
 * ACCESS: Platform Executives only
 * LOCATION: System Console
 */

import { useState } from "react";
import { ChevronRight, Shield, DollarSign, FileText, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { AppPageLayout } from "@/components/app-ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface MetricRow {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "stable";
  linkTo?: string;
}

interface ReportSection {
  title: string;
  icon: typeof Shield;
  metrics: MetricRow[];
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA (Replace with real queries)
// ═══════════════════════════════════════════════════════════════════════════

const GOVERNANCE_METRICS: MetricRow[] = [
  { label: "Authority changes (30 days)", value: 12, linkTo: "/admin/chain" },
  { label: "Authority changes (90 days)", value: 34, linkTo: "/admin/chain" },
  { label: "Pending approvals", value: 3, linkTo: "/admin/approvals" },
  { label: "Escalations by category", value: "2 Active", linkTo: "/admin/approvals" },
  { label: "Average resolution time", value: "18.4 hours" },
];

const FINANCIAL_METRICS: MetricRow[] = [
  { label: "Aggregate revenue (period)", value: "$124,500.00", linkTo: "/admin/billing/revenue" },
  { label: "Outstanding invoices", value: "8 ($12,400)", linkTo: "/admin/billing/invoices" },
  { label: "Payment failures (trend)", value: "3 this period", trend: "down", linkTo: "/admin/billing/invoices" },
  { label: "Refund activity", value: "2 ($1,200)", linkTo: "/admin/billing/refunds" },
];

const OPERATIONAL_METRICS: MetricRow[] = [
  { label: "Licensing request volume", value: 45, linkTo: "/admin/disclosures" },
  { label: "Time-to-decision (avg)", value: "2.3 days" },
  { label: "Governed messaging volume", value: 128 },
];

const SECURITY_METRICS: MetricRow[] = [
  { label: "Auth failures (period)", value: 7, linkTo: "/admin/security" },
  { label: "Elevated access events", value: 4, linkTo: "/admin/security" },
  { label: "Incident flags", value: "None" },
];

const REPORT_SECTIONS: ReportSection[] = [
  { title: "Governance Health", icon: Shield, metrics: GOVERNANCE_METRICS },
  { title: "Financial Oversight", icon: DollarSign, metrics: FINANCIAL_METRICS },
  { title: "Operational Signals", icon: FileText, metrics: OPERATIONAL_METRICS },
  { title: "Security & Risk", icon: AlertTriangle, metrics: SECURITY_METRICS },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function MetricRowItem({ metric }: { metric: MetricRow }) {
  const content = (
    <div 
      className={cn(
        "flex items-center justify-between py-3 px-4",
        "border-b last:border-b-0",
        metric.linkTo && "hover:bg-white/[0.02] cursor-pointer"
      )}
      style={{ borderColor: 'var(--tribes-border)' }}
    >
      <span 
        className="text-[13px]"
        style={{ color: 'var(--tribes-text-secondary)' }}
      >
        {metric.label}
      </span>
      <div className="flex items-center gap-2">
        <span 
          className="text-[13px] font-medium"
          style={{ color: 'var(--tribes-text)' }}
        >
          {metric.value}
        </span>
        {metric.linkTo && (
          <ChevronRight size={14} style={{ color: 'var(--tribes-text-muted)' }} />
        )}
      </div>
    </div>
  );

  if (metric.linkTo) {
    return <Link to={metric.linkTo}>{content}</Link>;
  }
  return content;
}

function ReportSectionPanel({ section }: { section: ReportSection }) {
  const Icon = section.icon;
  
  return (
    <div 
      className="rounded-lg border"
      style={{ 
        backgroundColor: 'var(--tribes-panel-bg)',
        borderColor: 'var(--tribes-border)',
      }}
    >
      {/* Section Header */}
      <div 
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: 'var(--tribes-border)' }}
      >
        <Icon size={14} style={{ color: 'var(--tribes-text-muted)' }} />
        <span 
          className="text-[11px] uppercase tracking-wider font-medium"
          style={{ color: 'var(--tribes-text-muted)' }}
        >
          {section.title}
        </span>
      </div>
      
      {/* Metrics */}
      <div>
        {section.metrics.map((metric, idx) => (
          <MetricRowItem key={idx} metric={metric} />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function ExecutiveReportingPage() {
  const [timeRange, setTimeRange] = useState("30d");

  return (
    <AppPageLayout title="Executive Reporting">

      {/* Time Range Filter */}
      <div className="flex items-center justify-end mb-6">
        <div className="flex items-center gap-2">
          <span 
            className="text-[11px] uppercase tracking-wider"
            style={{ color: 'var(--tribes-text-muted)' }}
          >
            Period
          </span>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger 
              className="w-[140px] h-8 text-[12px]"
              style={{ 
                backgroundColor: 'var(--tribes-panel-bg)',
                borderColor: 'var(--tribes-border)',
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="ytd">Year to date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Report Sections */}
      <div className="space-y-6">
        {REPORT_SECTIONS.map((section) => (
          <ReportSectionPanel key={section.title} section={section} />
        ))}
      </div>

      {/* Footer Note */}
      <div 
        className="mt-8 text-center text-[11px]"
        style={{ color: 'var(--tribes-text-muted)' }}
      >
        Data reflects the selected period. All metrics link to read-only detail views.
      </div>
    </AppPageLayout>
  );
}

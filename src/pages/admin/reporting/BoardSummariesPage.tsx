/**
 * BOARD-READY SUMMARIES
 * 
 * Purpose: Generate formal, static summaries suitable for board decks,
 * partners, and due diligence.
 * 
 * RULES:
 * - Generated, not live
 * - PDF and CSV formats
 * - Timestamped and versioned
 * - Immutable once generated
 * - Aggregated only (no user-level detail unless approved)
 * - Every generation logged as audit event
 * 
 * ACCESS: 
 * - Create & download: Platform Executives
 * - View only: External Auditors (if granted)
 */

import { useState } from "react";
import { FileText, Download, Clock, Shield, DollarSign, Scale, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleAccess } from "@/hooks/useRoleAccess";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface SummaryPack {
  id: string;
  type: "governance" | "financial" | "licensing" | "compliance";
  title: string;
  description: string;
  icon: typeof FileText;
}

interface GeneratedSummary {
  id: string;
  packType: string;
  generatedAt: string;
  generatedBy: string;
  periodStart: string;
  periodEnd: string;
  version: number;
  fileUrl: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const SUMMARY_PACKS: SummaryPack[] = [
  {
    id: "governance",
    type: "governance",
    title: "Governance & Authority Summary",
    description: "Authority changes, role assignments, and approval decisions",
    icon: Shield,
  },
  {
    id: "financial",
    type: "financial",
    title: "Financial Overview Summary",
    description: "Revenue, invoicing, payments, and refund activity",
    icon: DollarSign,
  },
  {
    id: "licensing",
    type: "licensing",
    title: "Licensing Activity Summary",
    description: "Request volume, approvals, and agreement status",
    icon: FileText,
  },
  {
    id: "compliance",
    type: "compliance",
    title: "Risk & Compliance Summary",
    description: "Security events, escalations, and audit posture",
    icon: Scale,
  },
];

// Mock previously generated summaries
const MOCK_GENERATED: GeneratedSummary[] = [
  {
    id: "1",
    packType: "governance",
    generatedAt: "2026-01-15T10:30:00Z",
    generatedBy: "admin@tribes.com",
    periodStart: "2025-10-01",
    periodEnd: "2025-12-31",
    version: 1,
    fileUrl: null,
  },
  {
    id: "2",
    packType: "financial",
    generatedAt: "2026-01-10T14:00:00Z",
    generatedBy: "admin@tribes.com",
    periodStart: "2025-10-01",
    periodEnd: "2025-12-31",
    version: 2,
    fileUrl: null,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function SummaryPackCard({ pack, onGenerate }: { pack: SummaryPack; onGenerate: () => void }) {
  const Icon = pack.icon;
  const { isExternalAuditor } = useRoleAccess();
  
  return (
    <div 
      className="rounded-lg border p-4"
      style={{ 
        backgroundColor: 'var(--tribes-panel-bg)',
        borderColor: 'var(--tribes-border)',
      }}
    >
      <div className="flex items-start gap-3">
        <div 
          className="p-2 rounded"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
        >
          <Icon size={16} style={{ color: 'var(--tribes-text-muted)' }} />
        </div>
        <div className="flex-1">
          <h3 
            className="text-[14px] font-medium mb-1"
            style={{ color: 'var(--tribes-text)' }}
          >
            {pack.title}
          </h3>
          <p 
            className="text-[12px] mb-3"
            style={{ color: 'var(--tribes-text-muted)' }}
          >
            {pack.description}
          </p>
          {!isExternalAuditor && (
            <Button
              variant="outline"
              size="sm"
              onClick={onGenerate}
              className="text-[12px] h-7"
            >
              Generate Summary
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function GeneratedSummaryRow({ summary }: { summary: GeneratedSummary }) {
  const pack = SUMMARY_PACKS.find(p => p.id === summary.packType);
  
  return (
    <div 
      className="flex items-center justify-between py-3 px-4 border-b last:border-b-0"
      style={{ borderColor: 'var(--tribes-border)' }}
    >
      <div className="flex items-center gap-3">
        <FileText size={14} style={{ color: 'var(--tribes-text-muted)' }} />
        <div>
          <p 
            className="text-[13px] font-medium"
            style={{ color: 'var(--tribes-text)' }}
          >
            {pack?.title || summary.packType}
          </p>
          <p 
            className="text-[11px]"
            style={{ color: 'var(--tribes-text-muted)' }}
          >
            {format(new Date(summary.periodStart), "MMM d, yyyy")} – {format(new Date(summary.periodEnd), "MMM d, yyyy")} • v{summary.version}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p 
            className="text-[11px]"
            style={{ color: 'var(--tribes-text-muted)' }}
          >
            {format(new Date(summary.generatedAt), "MMM d, yyyy 'at' h:mm a")}
          </p>
          <p 
            className="text-[10px]"
            style={{ color: 'var(--tribes-text-muted)' }}
          >
            by {summary.generatedBy}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
        >
          <Download size={14} style={{ color: 'var(--tribes-text-muted)' }} />
        </Button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function BoardSummariesPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("q4-2025");
  const { isExternalAuditor } = useRoleAccess();

  const handleGenerate = (packId: string) => {
    // TODO: Implement summary generation
    console.log("Generating summary:", packId, "for period:", selectedPeriod);
  };

  return (
    <div className="w-full max-w-[1040px] mx-auto px-4 sm:px-6 py-8">
      <PageHeader 
        title="Board Summaries"
        description="Formal summaries for board decks, partners, and due diligence"
      />

      {/* Period Selector */}
      {!isExternalAuditor && (
        <div className="flex items-center gap-3 mb-6">
          <span 
            className="text-[11px] uppercase tracking-wider"
            style={{ color: 'var(--tribes-text-muted)' }}
          >
            Generate for period
          </span>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger 
              className="w-[180px] h-8 text-[12px]"
              style={{ 
                backgroundColor: 'var(--tribes-panel-bg)',
                borderColor: 'var(--tribes-border)',
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="q4-2025">Q4 2025</SelectItem>
              <SelectItem value="q3-2025">Q3 2025</SelectItem>
              <SelectItem value="q2-2025">Q2 2025</SelectItem>
              <SelectItem value="fy-2025">FY 2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Summary Pack Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {SUMMARY_PACKS.map((pack) => (
          <SummaryPackCard 
            key={pack.id} 
            pack={pack} 
            onGenerate={() => handleGenerate(pack.id)}
          />
        ))}
      </div>

      {/* Previously Generated */}
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
          <Clock size={14} style={{ color: 'var(--tribes-text-muted)' }} />
          <span 
            className="text-[11px] uppercase tracking-wider font-medium"
            style={{ color: 'var(--tribes-text-muted)' }}
          >
            Previously Generated
          </span>
        </div>
        
        {MOCK_GENERATED.length > 0 ? (
          <div>
            {MOCK_GENERATED.map((summary) => (
              <GeneratedSummaryRow key={summary.id} summary={summary} />
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <p 
              className="text-[13px]"
              style={{ color: 'var(--tribes-text-muted)' }}
            >
              No summaries have been generated.
            </p>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div 
        className="mt-6 text-[10px] text-center"
        style={{ color: 'var(--tribes-text-muted)' }}
      >
        Generated summaries are immutable and versioned. Every generation is logged for audit purposes.
      </div>
    </div>
  );
}

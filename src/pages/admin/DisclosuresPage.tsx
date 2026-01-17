import { useState, useEffect } from "react";
import { PlatformLayout } from "@/layouts/PlatformLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
  TableEmptyRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AppModal,
  AppModalBody,
} from "@/components/ui/app-modal";
import { toast } from "sonner";
import { Download, FileText, Loader2, Eye, ChevronRight } from "lucide-react";
import { EMPTY_STATES, AUDIT_COPY, MOBILE_COPY } from "@/constants/institutional-copy";

/**
 * REGULATORY DISCLOSURE WORKFLOW — SYSTEM CONSOLE
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * GOVERNANCE RULES (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 1. GENERATION: Platform admins only can generate disclosure export packs
 * 2. VIEWING: External auditors have read-only access to completed exports
 * 3. IMMUTABILITY: Exports are generated from immutable audit logs only
 * 4. REPRODUCIBILITY: Same parameters always produce consistent results
 * 5. AUDIT TRAIL: Every generation is logged with actor, timestamp, scope
 * 6. MOBILE: Read-only inspection on mobile, no generation actions
 * 
 * EXPORT CONTENTS:
 * - Scope definition (date range, workspace(s), event types)
 * - Correlation IDs for all included records
 * - Actor identity and role at time of action
 * - Timestamps and event ordering
 * ═══════════════════════════════════════════════════════════════════════════
 */

type ExportType = 
  | 'licensing_activity' 
  | 'approval_history' 
  | 'agreement_registry'
  | 'billing_payments'
  | 'refund_history'
  | 'access_audit';

interface DisclosureExport {
  id: string;
  export_type: ExportType;
  status: 'generating' | 'completed' | 'failed';
  generated_by: string;
  generated_at: string;
  completed_at: string | null;
  watermark: string;
  file_name: string | null;
  parameters: Record<string, any>;
  record_count: number | null;
  error_message: string | null;
}

interface GeneratorProfile {
  email: string;
  full_name: string | null;
  platform_role: string;
}

const EXPORT_TYPE_LABELS: Record<ExportType, string> = {
  licensing_activity: 'Licensing Activity Pack',
  approval_history: 'Approval History Pack',
  agreement_registry: 'Agreement Registry Pack',
  billing_payments: 'Billing & Payments Ledger',
  refund_history: 'Refund History Pack',
  access_audit: 'Access Audit Pack',
};

const EXPORT_TYPE_DESCRIPTIONS: Record<ExportType, string> = {
  licensing_activity: 'Licensing requests, approvals, and agreements within the specified date range.',
  approval_history: 'All approval and rejection events with actor attribution from immutable audit logs.',
  agreement_registry: 'Complete catalog of active, expired, and terminated agreements.',
  billing_payments: 'Complete billing ledger including invoices, payments, and payment methods across all organizations.',
  refund_history: 'Chronological record of all refunds with actor, amount, reason, and transaction reference.',
  access_audit: 'Record access and download events including actor, timestamp, and record identifiers.',
};

export default function DisclosuresPage() {
  const { isPlatformAdmin } = useAuth();
  const { isExternalAuditor, isReadOnlyMode } = useRoleAccess();
  const isMobile = useIsMobile();
  
  const [exports, setExports] = useState<DisclosureExport[]>([]);
  const [generatorProfiles, setGeneratorProfiles] = useState<Record<string, GeneratorProfile>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // Detail modal state
  const [selectedExport, setSelectedExport] = useState<DisclosureExport | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
  // Form state
  const [selectedType, setSelectedType] = useState<ExportType>('licensing_activity');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchExports();
  }, []);

  async function fetchExports() {
    setLoading(true);
    const { data, error } = await supabase
      .from('disclosure_exports')
      .select('*')
      .order('generated_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching exports:', error);
      toast.error('Failed to load disclosure exports');
    } else {
      const exportData = (data as DisclosureExport[]) || [];
      setExports(exportData);
      
      // Fetch generator profiles for attribution
      const generatorIds = [...new Set(exportData.map(e => e.generated_by))];
      if (generatorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id, email, full_name, platform_role')
          .in('user_id', generatorIds);
        
        if (profiles) {
          const profileMap: Record<string, GeneratorProfile> = {};
          profiles.forEach(p => {
            profileMap[p.user_id] = {
              email: p.email,
              full_name: p.full_name,
              platform_role: p.platform_role,
            };
          });
          setGeneratorProfiles(profileMap);
        }
      }
    }
    setLoading(false);
  }

  async function handleGenerateExport() {
    if (!isPlatformAdmin) {
      toast.error('Platform administrator role required');
      return;
    }

    if (isMobile) {
      toast.error('Export generation is available on desktop only');
      return;
    }

    setGenerating(true);

    try {
      const parameters: Record<string, any> = {};
      if (startDate) parameters.start_date = startDate;
      if (endDate) parameters.end_date = endDate;

      const { data, error } = await supabase.functions.invoke('generate-disclosure-export', {
        body: {
          export_type: selectedType,
          parameters
        }
      });

      if (error) {
        console.error('Export generation error:', error);
        toast.error('Failed to generate export');
        return;
      }

      if (data?.success) {
        // Download the export data
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.watermark}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success(`Export generated: ${data.record_count} records`);
        
        // Refresh the list
        fetchExports();
      } else {
        toast.error(data?.error || 'Export generation failed');
      }
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Export generation failed');
    } finally {
      setGenerating(false);
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  }

  function formatShortDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function getStatusText(status: string): string {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'generating':
        return 'Generating';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  }

  function getGeneratorDisplay(userId: string): string {
    const profile = generatorProfiles[userId];
    if (profile) {
      return profile.full_name || profile.email;
    }
    return userId.slice(0, 8) + '...';
  }

  function getGeneratorRole(userId: string): string {
    const profile = generatorProfiles[userId];
    if (profile) {
      return profile.platform_role === 'platform_admin' ? 'Platform Administrator' : profile.platform_role;
    }
    return 'Unknown';
  }

  function getScopeDisplay(exp: DisclosureExport): string {
    const params = exp.parameters;
    const parts: string[] = [];
    
    if (params.start_date && params.end_date) {
      parts.push(`${formatShortDate(params.start_date)} – ${formatShortDate(params.end_date)}`);
    } else if (params.start_date) {
      parts.push(`From ${formatShortDate(params.start_date)}`);
    } else if (params.end_date) {
      parts.push(`Until ${formatShortDate(params.end_date)}`);
    } else {
      parts.push('All time');
    }
    
    return parts.join(' · ');
  }

  function openExportDetail(exp: DisclosureExport) {
    setSelectedExport(exp);
    setDetailOpen(true);
  }

  // Check if user has access (platform admin or external auditor)
  const hasAccess = isPlatformAdmin || isExternalAuditor;
  const canGenerate = isPlatformAdmin && !isMobile && !isReadOnlyMode;

  if (!hasAccess) {
    return (
      <PlatformLayout maxWidth="wide">
        <div className="py-12 text-center">
          <p 
            className="text-[14px]"
            style={{ color: 'hsl(var(--platform-text-muted))' }}
          >
            Access restricted. Platform administrator or auditor role required.
          </p>
        </div>
      </PlatformLayout>
    );
  }

  return (
    <PlatformLayout maxWidth="wide" elevated>
      {/* Header */}
      <div className="mb-8">
        <h1 
          className="text-[18px] font-medium mb-1"
          style={{ color: 'hsl(var(--platform-text))' }}
        >
          Regulatory Disclosures
        </h1>
        <p 
          className="text-[14px]"
          style={{ color: 'hsl(var(--platform-text-muted))' }}
        >
          Generate standardized disclosure export packs for regulatory and audit requirements
        </p>
      </div>

      {/* Mobile Read-Only Notice */}
      {isMobile && (
        <div 
          className="mb-6 px-4 py-3 rounded-md"
          style={{ 
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid hsl(var(--platform-border))'
          }}
        >
          <p 
            className="text-[13px]"
            style={{ color: 'hsl(var(--platform-text-muted))' }}
          >
            {MOBILE_COPY.SYSTEM_CONSOLE_READ_ONLY}
          </p>
        </div>
      )}

      {/* External Auditor Notice */}
      {isExternalAuditor && !isPlatformAdmin && (
        <div 
          className="mb-6 px-4 py-3 rounded-md"
          style={{ 
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid hsl(var(--platform-border))'
          }}
        >
          <p 
            className="text-[13px]"
            style={{ color: 'hsl(var(--platform-text-muted))' }}
          >
            Read-only access to completed disclosure exports.
            Export generation requires Platform Administrator authorization.
          </p>
        </div>
      )}

      {/* Export Generation Panel - Admin Only, Desktop Only */}
      {canGenerate && (
        <div 
          className="mb-8 p-6 rounded-md"
          style={{ 
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid hsl(var(--platform-border))'
          }}
        >
          <h3 
            className="text-[14px] font-medium mb-4"
            style={{ color: 'hsl(var(--platform-text))' }}
          >
            Generate Disclosure Export
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label 
                htmlFor="export-type" 
                className="text-[12px] uppercase tracking-wide mb-2 block"
                style={{ color: 'hsl(var(--platform-text-muted))' }}
              >
                Export Type
              </Label>
              <Select value={selectedType} onValueChange={(v) => setSelectedType(v as ExportType)}>
                <SelectTrigger 
                  id="export-type"
                  className="bg-transparent border-[hsl(var(--platform-border))]"
                  style={{ color: 'hsl(var(--platform-text))' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="licensing_activity">Licensing Activity Pack</SelectItem>
                  <SelectItem value="approval_history">Approval History Pack</SelectItem>
                  <SelectItem value="agreement_registry">Agreement Registry Pack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label 
                htmlFor="start-date"
                className="text-[12px] uppercase tracking-wide mb-2 block"
                style={{ color: 'hsl(var(--platform-text-muted))' }}
              >
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-[hsl(var(--platform-border))]"
                style={{ color: 'hsl(var(--platform-text))' }}
              />
            </div>

            <div>
              <Label 
                htmlFor="end-date"
                className="text-[12px] uppercase tracking-wide mb-2 block"
                style={{ color: 'hsl(var(--platform-text-muted))' }}
              >
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-[hsl(var(--platform-border))]"
                style={{ color: 'hsl(var(--platform-text))' }}
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleGenerateExport}
                disabled={generating}
                className="w-full bg-white text-black hover:bg-gray-100"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Export
                  </>
                )}
              </Button>
            </div>
          </div>

          <p 
            className="text-[13px] line-clamp-2 break-words"
            style={{ color: 'hsl(var(--platform-text-muted))', lineHeight: '1.45' }}
          >
            {EXPORT_TYPE_DESCRIPTIONS[selectedType]}
          </p>
        </div>
      )}

      {/* Exports Table */}
      <div className="mb-4">
        <h3 
          className="text-[12px] uppercase tracking-wide mb-3"
          style={{ color: 'hsl(var(--platform-text-muted))' }}
        >
          Generated Exports
        </h3>
      </div>

      <Table density="compact">
        <TableHeader>
          <TableRow>
            <TableHead>Watermark</TableHead>
            <TableHead>Export Type</TableHead>
            <TableHead>Scope</TableHead>
            <TableHead>Generated By</TableHead>
            <TableHead className="text-right" numeric>Records</TableHead>
            <TableHead status>Status</TableHead>
            <TableHead>Generated</TableHead>
            <TableHead className="text-center w-20">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <span style={{ color: 'hsl(var(--platform-text-muted))' }}>
                  Loading exports
                </span>
              </TableCell>
            </TableRow>
          ) : exports.length === 0 ? (
            <TableEmptyRow 
              colSpan={8} 
              title={EMPTY_STATES.NO_DATA.title}
              description={EMPTY_STATES.NO_DATA.description}
            />
          ) : (
            exports.map((exp) => (
              <TableRow key={exp.id} clickable onClick={() => openExportDetail(exp)}>
                <TableCell>
                  <code 
                    className="text-[11px] font-mono"
                    style={{ color: 'hsl(var(--platform-text))' }}
                  >
                    {exp.watermark}
                  </code>
                </TableCell>
                <TableCell>
                  <span 
                    className="text-[13px]"
                    style={{ color: 'hsl(var(--platform-text))' }}
                  >
                    {EXPORT_TYPE_LABELS[exp.export_type]}
                  </span>
                </TableCell>
                <TableCell>
                  <span 
                    className="text-[12px]"
                    style={{ color: 'hsl(var(--platform-text-muted))' }}
                  >
                    {getScopeDisplay(exp)}
                  </span>
                </TableCell>
                <TableCell>
                  <span 
                    className="text-[13px]"
                    style={{ color: 'hsl(var(--platform-text))' }}
                  >
                    {getGeneratorDisplay(exp.generated_by)}
                  </span>
                </TableCell>
                <TableCell className="text-right" numeric>
                  <span style={{ color: 'hsl(var(--platform-text))' }}>
                    {exp.record_count ?? '—'}
                  </span>
                </TableCell>
                <TableCell status>
                  <span 
                    className="text-[13px]"
                    style={{ color: 'hsl(var(--platform-text-muted))' }}
                  >
                    {getStatusText(exp.status)}
                  </span>
                </TableCell>
                <TableCell>
                  <span 
                    className="text-[12px]"
                    style={{ color: 'hsl(var(--platform-text-muted))' }}
                  >
                    {formatDate(exp.generated_at)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      openExportDetail(exp);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" style={{ color: 'hsl(var(--platform-text-muted))' }} />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Audit Notice */}
      <div 
        className="mt-8 px-4 py-3 rounded-md"
        style={{ 
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: '1px solid hsl(var(--platform-border))'
        }}
      >
        <p 
          className="text-[13px]"
          style={{ color: 'hsl(var(--platform-text-muted))' }}
        >
          {AUDIT_COPY.EXPORT_LOGGED} Exports are generated from immutable audit logs. 
          Export schemas are locked and cannot be altered per request.
        </p>
      </div>

      {/* Export Detail Modal */}
      <AppModal 
        open={detailOpen} 
        onOpenChange={setDetailOpen}
        title="Disclosure Export Details"
        maxWidth="lg"
      >
        <AppModalBody>
          {selectedExport && (
            <div className="space-y-6">
              {/* Watermark */}
              <div>
                <Label 
                  className="text-[11px] uppercase tracking-wide mb-1 block"
                  style={{ color: 'hsl(var(--platform-text-muted))' }}
                >
                  Watermark
                </Label>
                <code 
                  className="text-[14px] font-mono"
                  style={{ color: 'hsl(var(--platform-text))' }}
                >
                  {selectedExport.watermark}
                </code>
              </div>

              {/* Export Type */}
              <div>
                <Label 
                  className="text-[11px] uppercase tracking-wide mb-1 block"
                  style={{ color: 'hsl(var(--platform-text-muted))' }}
                >
                  Export Type
                </Label>
                <p 
                  className="text-[14px]"
                  style={{ color: 'hsl(var(--platform-text))' }}
                >
                  {EXPORT_TYPE_LABELS[selectedExport.export_type]}
                </p>
                <p 
                  className="text-[12px] mt-1 leading-relaxed"
                  style={{ color: 'hsl(var(--platform-text-muted))' }}
                >
                  {EXPORT_TYPE_DESCRIPTIONS[selectedExport.export_type]}
                </p>
              </div>

              {/* Scope Definition */}
              <div 
                className="p-4 rounded-md"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid hsl(var(--platform-border))'
                }}
              >
                <Label 
                  className="text-[11px] uppercase tracking-wide mb-3 block"
                  style={{ color: 'hsl(var(--platform-text-muted))' }}
                >
                  Scope Definition
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span 
                      className="text-[11px] uppercase tracking-wide block mb-1"
                      style={{ color: 'hsl(var(--platform-text-muted))' }}
                    >
                      Date Range
                    </span>
                    <span 
                      className="text-[13px]"
                      style={{ color: 'hsl(var(--platform-text))' }}
                    >
                      {selectedExport.parameters.start_date 
                        ? formatShortDate(selectedExport.parameters.start_date)
                        : 'All time'}
                      {' – '}
                      {selectedExport.parameters.end_date
                        ? formatShortDate(selectedExport.parameters.end_date)
                        : 'Present'}
                    </span>
                  </div>
                  <div>
                    <span 
                      className="text-[11px] uppercase tracking-wide block mb-1"
                      style={{ color: 'hsl(var(--platform-text-muted))' }}
                    >
                      Record Count
                    </span>
                    <span 
                      className="text-[13px]"
                      style={{ color: 'hsl(var(--platform-text))' }}
                    >
                      {selectedExport.record_count ?? '—'} records
                    </span>
                  </div>
                </div>
              </div>

              {/* Generation Attribution */}
              <div 
                className="p-4 rounded-md"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid hsl(var(--platform-border))'
                }}
              >
                <Label 
                  className="text-[11px] uppercase tracking-wide mb-3 block"
                  style={{ color: 'hsl(var(--platform-text-muted))' }}
                >
                  Generation Record
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span 
                      className="text-[11px] uppercase tracking-wide block mb-1"
                      style={{ color: 'hsl(var(--platform-text-muted))' }}
                    >
                      Generated By
                    </span>
                    <span 
                      className="text-[13px] block"
                      style={{ color: 'hsl(var(--platform-text))' }}
                    >
                      {getGeneratorDisplay(selectedExport.generated_by)}
                    </span>
                    <span 
                      className="text-[11px]"
                      style={{ color: 'hsl(var(--platform-text-muted))' }}
                    >
                      {getGeneratorRole(selectedExport.generated_by)}
                    </span>
                  </div>
                  <div>
                    <span 
                      className="text-[11px] uppercase tracking-wide block mb-1"
                      style={{ color: 'hsl(var(--platform-text-muted))' }}
                    >
                      Generated At
                    </span>
                    <span 
                      className="text-[13px]"
                      style={{ color: 'hsl(var(--platform-text))' }}
                    >
                      {formatDate(selectedExport.generated_at)}
                    </span>
                  </div>
                  {selectedExport.completed_at && (
                    <div>
                      <span 
                        className="text-[11px] uppercase tracking-wide block mb-1"
                        style={{ color: 'hsl(var(--platform-text-muted))' }}
                      >
                        Completed At
                      </span>
                      <span 
                        className="text-[13px]"
                        style={{ color: 'hsl(var(--platform-text))' }}
                      >
                        {formatDate(selectedExport.completed_at)}
                      </span>
                    </div>
                  )}
                  <div>
                    <span 
                      className="text-[11px] uppercase tracking-wide block mb-1"
                      style={{ color: 'hsl(var(--platform-text-muted))' }}
                    >
                      Status
                    </span>
                    <span 
                      className="text-[13px]"
                      style={{ color: 'hsl(var(--platform-text))' }}
                    >
                      {getStatusText(selectedExport.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Message if Failed */}
              {selectedExport.status === 'failed' && selectedExport.error_message && (
                <div 
                  className="p-4 rounded-md"
                  style={{ 
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    border: '1px solid rgba(220, 38, 38, 0.3)'
                  }}
                >
                  <Label 
                    className="text-[11px] uppercase tracking-wide mb-2 block"
                    style={{ color: 'hsl(var(--platform-text-muted))' }}
                  >
                    Error
                  </Label>
                  <p 
                    className="text-[13px]"
                    style={{ color: 'hsl(var(--platform-text))' }}
                  >
                    {selectedExport.error_message}
                  </p>
                </div>
              )}

              {/* Download Action (if completed, not on mobile) */}
              {selectedExport.status === 'completed' && !isMobile && (
                <div className="flex justify-end pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.info('Export data available at time of generation. Re-download requires regeneration.');
                    }}
                    className="border-[hsl(var(--platform-border))]"
                    style={{ color: 'hsl(var(--platform-text))' }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Export
                  </Button>
                </div>
              )}

              {/* Mobile notice */}
              {isMobile && selectedExport.status === 'completed' && (
                <p 
                  className="text-[12px] text-center"
                  style={{ color: 'hsl(var(--platform-text-muted))' }}
                >
                  Download available on desktop.
                </p>
              )}
            </div>
          )}
        </AppModalBody>
      </AppModal>
    </PlatformLayout>
  );
}

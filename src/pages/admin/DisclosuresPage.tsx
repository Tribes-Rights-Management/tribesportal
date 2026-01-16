import { useState, useEffect } from "react";
import { PlatformLayout, InstitutionalHeader } from "@/layouts/PlatformLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
import { toast } from "sonner";
import { Download, FileText, Loader2 } from "lucide-react";
import { EMPTY_STATES, AUDIT_COPY } from "@/constants/institutional-copy";

type ExportType = 'licensing_activity' | 'approval_history' | 'agreement_registry';

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

const EXPORT_TYPE_LABELS: Record<ExportType, string> = {
  licensing_activity: 'Licensing Activity Pack',
  approval_history: 'Approval History Pack',
  agreement_registry: 'Agreement Registry Pack',
};

const EXPORT_TYPE_DESCRIPTIONS: Record<ExportType, string> = {
  licensing_activity: 'Includes licensing requests, approvals, and agreements within the specified date range.',
  approval_history: 'Includes all approval and rejection events with actor attribution.',
  agreement_registry: 'Complete catalog of active, expired, and terminated agreements.',
};

export default function DisclosuresPage() {
  const { isPlatformAdmin } = useAuth();
  const [exports, setExports] = useState<DisclosureExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
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
      setExports((data as DisclosureExport[]) || []);
    }
    setLoading(false);
  }

  async function handleGenerateExport() {
    if (!isPlatformAdmin) {
      toast.error('Platform administrator role required');
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
        toast.success(`Export generated: ${data.record_count} records`);
        
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

  function getStatusStyle(status: string): string {
    switch (status) {
      case 'completed':
        return 'text-[hsl(var(--platform-text))]';
      case 'generating':
        return 'text-[hsl(var(--platform-text-muted))]';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-[hsl(var(--platform-text-muted))]';
    }
  }

  return (
    <PlatformLayout maxWidth="wide">
      <InstitutionalHeader 
        title="Regulatory Disclosures"
        description="Generate standardized disclosure export packs for regulatory and audit requirements"
      />

      {/* Export Generation Panel - Admin Only */}
      {isPlatformAdmin && (
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
            className="text-[13px]"
            style={{ color: 'hsl(var(--platform-text-muted))' }}
          >
            {EXPORT_TYPE_DESCRIPTIONS[selectedType]}
          </p>
        </div>
      )}

      {/* Notice for non-admins */}
      {!isPlatformAdmin && (
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
            You have read-only access to completed disclosure exports.
            Export generation requires Platform Administrator authorization.
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Watermark</TableHead>
            <TableHead>Export Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Records</TableHead>
            <TableHead>Generated</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <span style={{ color: 'hsl(var(--platform-text-muted))' }}>
                  Loading exports
                </span>
              </TableCell>
            </TableRow>
          ) : exports.length === 0 ? (
            <TableEmptyRow 
              colSpan={6} 
              title={EMPTY_STATES.NO_DATA.title}
              description={EMPTY_STATES.NO_DATA.description}
            />
          ) : (
            exports.map((exp) => (
              <TableRow key={exp.id}>
                <TableCell>
                  <code 
                    className="text-[12px] font-mono"
                    style={{ color: 'hsl(var(--platform-text))' }}
                  >
                    {exp.watermark}
                  </code>
                </TableCell>
                <TableCell>
                  <span style={{ color: 'hsl(var(--platform-text))' }}>
                    {EXPORT_TYPE_LABELS[exp.export_type]}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`text-[13px] capitalize ${getStatusStyle(exp.status)}`}>
                    {exp.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span style={{ color: 'hsl(var(--platform-text))' }}>
                    {exp.record_count ?? '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <span 
                    className="text-[13px]"
                    style={{ color: 'hsl(var(--platform-text-muted))' }}
                  >
                    {formatDate(exp.generated_at)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {exp.status === 'completed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3"
                      onClick={() => {
                        // Re-download would require stored file - for now show toast
                        toast.info('Export data available at time of generation');
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  {exp.status === 'failed' && (
                    <span 
                      className="text-[12px]"
                      style={{ color: 'hsl(var(--platform-text-muted))' }}
                    >
                      {exp.error_message || 'Generation failed'}
                    </span>
                  )}
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
          {AUDIT_COPY.EXPORT_LOGGED} Export schemas are locked and cannot be altered per request.
        </p>
      </div>
    </PlatformLayout>
  );
}

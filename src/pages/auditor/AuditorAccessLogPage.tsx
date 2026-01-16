import { useState, useEffect } from "react";
import { PlatformLayout, InstitutionalHeader } from "@/layouts/PlatformLayout";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell,
  TableEmptyRow 
} from "@/components/ui/table";
import { EMPTY_STATES } from "@/constants/institutional-copy";

/**
 * AUDITOR ACCESS LOG PAGE — READ-ONLY VIEW
 * 
 * Displays access log (record views/downloads) for external auditors.
 * All action buttons are hidden. Read-only inspection only.
 */

interface AccessLogEntry {
  id: string;
  user_email: string;
  access_type: string;
  record_type: string;
  record_id: string;
  accessed_at: string;
}

export default function AuditorAccessLogPage() {
  const { isExternalAuditor, isPlatformAdmin } = useRoleAccess();
  const [entries, setEntries] = useState<AccessLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const hasAccess = isExternalAuditor || isPlatformAdmin;

  useEffect(() => {
    if (!hasAccess) return;
    async function fetchAccessLogs() {
      setLoading(true);
      const { data, error } = await supabase
        .from('access_logs')
        .select('id, user_email, access_type, record_type, record_id, accessed_at')
        .order('accessed_at', { ascending: false })
        .limit(500);

      if (error) {
        console.error('Error fetching access logs:', error);
        setLoading(false);
        return;
      }

      setEntries(data ?? []);
      setLoading(false);
    }

    fetchAccessLogs();
  }, [hasAccess]);

  if (!hasAccess) {
    return <Navigate to="/app/restricted" replace />;
  }

  return (
    <PlatformLayout maxWidth="wide">
      <InstitutionalHeader 
        title="Access Log"
        description="Record access and download events"
      />

      <div 
        className="mb-4 px-4 py-3 rounded-md"
        style={{ 
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--platform-border)'
        }}
      >
        <p 
          className="text-[13px]"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          This log records all record access events including views and downloads.
          Entries are timestamped in UTC and cannot be modified.
        </p>
      </div>

      <div 
        style={{ 
          border: '1px solid var(--platform-border)',
          borderRadius: '6px',
          overflow: 'hidden'
        }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp (UTC)</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Access Type</TableHead>
              <TableHead>Record Type</TableHead>
              <TableHead>Record ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableEmptyRow 
                colSpan={5} 
                title="Retrieving records..."
                description="Loading access log."
              />
            ) : entries.length === 0 ? (
              <TableEmptyRow 
                colSpan={5} 
                title={EMPTY_STATES.NO_DATA.title}
                description="Access events will appear here once records are viewed."
              />
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell muted className="font-mono text-[12px]">
                    {formatTimestamp(entry.accessed_at)}
                  </TableCell>
                  <TableCell>{entry.user_email}</TableCell>
                  <TableCell>{formatAccessType(entry.access_type)}</TableCell>
                  <TableCell muted>{entry.record_type}</TableCell>
                  <TableCell muted className="font-mono text-[11px]">
                    {entry.record_id.slice(0, 8)}...
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </PlatformLayout>
  );
}

function formatTimestamp(isoString: string): string {
  try {
    return new Date(isoString).toISOString().replace('T', ' ').slice(0, 19);
  } catch {
    return isoString;
  }
}

function formatAccessType(type: string): string {
  const typeMap: Record<string, string> = {
    'view': 'Viewed',
    'download': 'Downloaded',
    'export': 'Exported',
  };
  return typeMap[type.toLowerCase()] ?? type;
}

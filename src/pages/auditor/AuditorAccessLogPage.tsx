import { useState, useEffect } from "react";
import { PlatformPageLayout, PlatformTable, PlatformTableHeader, PlatformTableBody, PlatformTableRow, PlatformTableHead, PlatformTableCell, PlatformTableEmpty } from "@/components/platform-ui";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
    return <Navigate to="/restricted" replace />;
  }

  return (
    <PlatformPageLayout
      title="Access Log"
      backLink={{ to: "/auditor", label: "Auditor Portal" }}
    >
      <p className="text-sm text-muted-foreground mb-4">
        Record access and download events
      </p>

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

      <PlatformTable columns={["25%", "20%", "15%", "20%", "20%"]}>
        <PlatformTableHeader>
          <PlatformTableRow header>
            <PlatformTableHead>Timestamp (UTC)</PlatformTableHead>
            <PlatformTableHead>User</PlatformTableHead>
            <PlatformTableHead>Access Type</PlatformTableHead>
            <PlatformTableHead>Record Type</PlatformTableHead>
            <PlatformTableHead>Record ID</PlatformTableHead>
          </PlatformTableRow>
        </PlatformTableHeader>
        <PlatformTableBody>
          {loading ? (
            <PlatformTableEmpty colSpan={5}>
              <p className="text-sm text-muted-foreground">Retrieving records...</p>
              <p className="text-xs text-muted-foreground mt-1">Loading access log.</p>
            </PlatformTableEmpty>
          ) : entries.length === 0 ? (
            <PlatformTableEmpty colSpan={5}>
              <p className="text-sm text-muted-foreground">{EMPTY_STATES.NO_DATA.title}</p>
              <p className="text-xs text-muted-foreground mt-1">Access events will appear here once records are viewed.</p>
            </PlatformTableEmpty>
          ) : (
            entries.map((entry) => (
              <PlatformTableRow key={entry.id}>
                <PlatformTableCell mono muted>
                  {formatTimestamp(entry.accessed_at)}
                </PlatformTableCell>
                <PlatformTableCell>{entry.user_email}</PlatformTableCell>
                <PlatformTableCell>{formatAccessType(entry.access_type)}</PlatformTableCell>
                <PlatformTableCell muted>{entry.record_type}</PlatformTableCell>
                <PlatformTableCell mono muted>
                  {entry.record_id.slice(0, 8)}...
                </PlatformTableCell>
              </PlatformTableRow>
            ))
          )}
        </PlatformTableBody>
      </PlatformTable>
    </PlatformPageLayout>
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

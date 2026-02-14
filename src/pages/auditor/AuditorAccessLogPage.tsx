import { useState, useEffect } from "react";
import { AppPageLayout } from "@/components/app-ui";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppTable, AppTableHeader, AppTableBody, AppTableRow, AppTableHead, AppTableCell, AppTableEmpty } from "@/components/app-ui/AppTable";
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
    <AppPageLayout
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

      <AppTable columns={["25%", "20%", "15%", "20%", "20%"]}>
        <AppTableHeader>
          <AppTableRow header>
            <AppTableHead>Timestamp (UTC)</AppTableHead>
            <AppTableHead>User</AppTableHead>
            <AppTableHead>Access Type</AppTableHead>
            <AppTableHead>Record Type</AppTableHead>
            <AppTableHead>Record ID</AppTableHead>
          </AppTableRow>
        </AppTableHeader>
        <AppTableBody>
          {loading ? (
            <AppTableEmpty colSpan={5}>
              <p className="text-sm text-muted-foreground">Retrieving records...</p>
              <p className="text-xs text-muted-foreground mt-1">Loading access log.</p>
            </AppTableEmpty>
          ) : entries.length === 0 ? (
            <AppTableEmpty colSpan={5}>
              <p className="text-sm text-muted-foreground">{EMPTY_STATES.NO_DATA.title}</p>
              <p className="text-xs text-muted-foreground mt-1">Access events will appear here once records are viewed.</p>
            </AppTableEmpty>
          ) : (
            entries.map((entry) => (
              <AppTableRow key={entry.id}>
                <AppTableCell mono muted>
                  {formatTimestamp(entry.accessed_at)}
                </AppTableCell>
                <AppTableCell>{entry.user_email}</AppTableCell>
                <AppTableCell>{formatAccessType(entry.access_type)}</AppTableCell>
                <AppTableCell muted>{entry.record_type}</AppTableCell>
                <AppTableCell mono muted>
                  {entry.record_id.slice(0, 8)}...
                </AppTableCell>
              </AppTableRow>
            ))
          )}
        </AppTableBody>
      </AppTable>
    </AppPageLayout>
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
import { useState, useEffect } from "react";
import { AppPageLayout } from "@/components/app-ui";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  ActivityLog, 
  ActivityLogEntry, 
  ACTIVITY_VERBS, 
  ACTIVITY_RESULTS 
} from "@/components/ui/activity-log";

/**
 * AUDITOR ACTIVITY LOG PAGE — IMMUTABLE READ-ONLY VIEW
 * 
 * Displays the complete activity log for external auditors.
 * No export or filtering ad-hoc — only viewing.
 */

export default function AuditorActivityLogPage() {
  const { isExternalAuditor, isPlatformAdmin } = useRoleAccess();
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const hasAccess = isExternalAuditor || isPlatformAdmin;

  useEffect(() => {
    if (!hasAccess) return;
    async function fetchAuditLogs() {
      setLoading(true);
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          id,
          created_at,
          actor_email,
          actor_type,
          action,
          action_label,
          record_type,
          record_id,
          tenant_id,
          details
        `)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        console.error('Error fetching audit logs:', error);
        setLoading(false);
        return;
      }

      // Map to ActivityLogEntry format
      const mappedEntries: ActivityLogEntry[] = (data ?? []).map((log) => ({
        id: log.id,
        timestamp: log.created_at,
        actor: log.actor_email ?? log.actor_type ?? 'System',
        action: mapActionToVerb(log.action) as any,
        object: log.record_type ?? 'Record',
        objectId: log.record_id ?? undefined,
        scope: undefined,
        result: ACTIVITY_RESULTS.SUCCESS as any,
        details: log.action_label,
      }));

      setEntries(mappedEntries);
      setLoading(false);
    }

    fetchAuditLogs();
  }, [hasAccess]);

  if (!hasAccess) {
    return <Navigate to="/app/restricted" replace />;
  }

  return (
    <AppPageLayout
      title="Activity Log"
      backLink={{ to: "/auditor", label: "Auditor Portal" }}
    >
      <p className="text-sm text-muted-foreground mb-4">
        Immutable record of all platform actions
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
          This log is append-only and cannot be modified or deleted. 
          All entries are permanent and timestamped in UTC.
        </p>
      </div>

      <ActivityLog 
        entries={entries}
        loading={loading}
        // No export for auditors — read-only
      />
    </AppPageLayout>
  );
}

/**
 * Map database action enum to display verb
 */
function mapActionToVerb(action: string): string {
  const verbMap: Record<string, string> = {
    'record_created': ACTIVITY_VERBS.CREATED,
    'record_updated': ACTIVITY_VERBS.UPDATED,
    'record_approved': ACTIVITY_VERBS.APPROVED,
    'record_rejected': ACTIVITY_VERBS.DECLINED,
    'access_granted': ACTIVITY_VERBS.GRANTED,
    'access_revoked': ACTIVITY_VERBS.REVOKED,
    'export_generated': ACTIVITY_VERBS.EXPORTED,
    'document_uploaded': ACTIVITY_VERBS.SUBMITTED,
    'document_removed': 'Removed',
    'login': ACTIVITY_VERBS.LOGGED_IN,
    'logout': ACTIVITY_VERBS.LOGGED_OUT,
    'record_viewed': ACTIVITY_VERBS.VIEWED,
  };
  return verbMap[action] ?? action;
}

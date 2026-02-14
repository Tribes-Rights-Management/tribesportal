import { useState, useEffect } from "react";
import { AppPageLayout } from "@/components/app-ui";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppTable, AppTableHeader, AppTableBody, AppTableRow, AppTableHead, AppTableCell, AppTableEmpty } from "@/components/app-ui/AppTable";
import { EMPTY_STATES } from "@/constants/institutional-copy";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * AUDITOR LICENSING PAGE — READ-ONLY VIEW
 * 
 * Displays licensing requests and agreements for external auditors.
 * All action buttons are hidden. Read-only inspection only.
 */

interface LicensingRequest {
  id: string;
  work_title: string | null;
  status: string;
  territory: string | null;
  usage_type: string | null;
  requester_email: string | null;
  created_at: string;
  updated_at: string;
}

interface LicensingAgreement {
  id: string;
  agreement_title: string;
  status: string;
  effective_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export default function AuditorLicensingPage() {
  const { isExternalAuditor, isPlatformAdmin } = useRoleAccess();
  const [requests, setRequests] = useState<LicensingRequest[]>([]);
  const [agreements, setAgreements] = useState<LicensingAgreement[]>([]);
  const [loading, setLoading] = useState(true);

  const hasAccess = isExternalAuditor || isPlatformAdmin;

  useEffect(() => {
    if (!hasAccess) return;
    async function fetchData() {
      setLoading(true);
      
      const [requestsRes, agreementsRes] = await Promise.all([
        supabase
          .from('licensing_requests')
          .select('id, work_title, status, territory, usage_type, requester_email, created_at, updated_at')
          .order('created_at', { ascending: false })
          .limit(200),
        supabase
          .from('licensing_agreements')
          .select('id, agreement_title, status, effective_date, end_date, created_at, updated_at')
          .order('created_at', { ascending: false })
          .limit(200),
      ]);

      if (requestsRes.data) setRequests(requestsRes.data);
      if (agreementsRes.data) setAgreements(agreementsRes.data);
      setLoading(false);
    }

    fetchData();
  }, [hasAccess]);

  if (!hasAccess) {
    return <Navigate to="/app/restricted" replace />;
  }

  return (
    <AppPageLayout
      title="Licensing Records"
      backLink={{ to: "/auditor", label: "Auditor Portal" }}
    >
      <p className="text-sm text-muted-foreground mb-4">
        Requests, agreements, and approval history
      </p>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList 
          className="mb-6"
          style={{ 
            backgroundColor: 'transparent',
            border: '1px solid var(--platform-border)',
            borderRadius: '6px',
            padding: '4px'
          }}
        >
          <TabsTrigger 
            value="requests"
            className="text-[13px] px-4 py-2 data-[state=active]:bg-white/[0.06]"
          >
            Requests ({requests.length})
          </TabsTrigger>
          <TabsTrigger 
            value="agreements"
            className="text-[13px] px-4 py-2 data-[state=active]:bg-white/[0.06]"
          >
            Agreements ({agreements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <AppTable columns={["22%", "10%", "12%", "12%", "18%", "13%", "13%"]}>
            <AppTableHeader>
              <AppTableRow header>
                <AppTableHead>Work Title</AppTableHead>
                <AppTableHead>Status</AppTableHead>
                <AppTableHead>Territory</AppTableHead>
                <AppTableHead>Usage Type</AppTableHead>
                <AppTableHead>Requester</AppTableHead>
                <AppTableHead>Submitted</AppTableHead>
                <AppTableHead>Last Updated</AppTableHead>
              </AppTableRow>
            </AppTableHeader>
            <AppTableBody>
              {loading ? (
                <AppTableEmpty colSpan={7}>
                  <p className="text-sm text-muted-foreground">Retrieving records...</p>
                  <p className="text-xs text-muted-foreground mt-1">Loading licensing requests.</p>
                </AppTableEmpty>
              ) : requests.length === 0 ? (
                <AppTableEmpty colSpan={7}>
                  <p className="text-sm text-muted-foreground">{EMPTY_STATES.LICENSING_REQUESTS.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{EMPTY_STATES.LICENSING_REQUESTS.description}</p>
                </AppTableEmpty>
              ) : (
                requests.map((req) => (
                  <AppTableRow key={req.id}>
                    <AppTableCell>{req.work_title ?? '—'}</AppTableCell>
                    <AppTableCell>
                      <StatusBadge status={req.status} />
                    </AppTableCell>
                    <AppTableCell muted>{req.territory ?? '—'}</AppTableCell>
                    <AppTableCell muted>{req.usage_type ?? '—'}</AppTableCell>
                    <AppTableCell muted>{req.requester_email ?? '—'}</AppTableCell>
                    <AppTableCell muted>{formatDate(req.created_at)}</AppTableCell>
                    <AppTableCell muted>{formatDate(req.updated_at)}</AppTableCell>
                  </AppTableRow>
                ))
              )}
            </AppTableBody>
          </AppTable>
        </TabsContent>

        <TabsContent value="agreements">
          <AppTable columns={["25%", "12%", "16%", "16%", "16%", "15%"]}>
            <AppTableHeader>
              <AppTableRow header>
                <AppTableHead>Agreement Title</AppTableHead>
                <AppTableHead>Status</AppTableHead>
                <AppTableHead>Effective Date</AppTableHead>
                <AppTableHead>End Date</AppTableHead>
                <AppTableHead>Created</AppTableHead>
                <AppTableHead>Last Updated</AppTableHead>
              </AppTableRow>
            </AppTableHeader>
            <AppTableBody>
              {loading ? (
                <AppTableEmpty colSpan={6}>
                  <p className="text-sm text-muted-foreground">Retrieving records...</p>
                  <p className="text-xs text-muted-foreground mt-1">Loading licensing agreements.</p>
                </AppTableEmpty>
              ) : agreements.length === 0 ? (
                <AppTableEmpty colSpan={6}>
                  <p className="text-sm text-muted-foreground">{EMPTY_STATES.LICENSING_AGREEMENTS.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{EMPTY_STATES.LICENSING_AGREEMENTS.description}</p>
                </AppTableEmpty>
              ) : (
                agreements.map((agr) => (
                  <AppTableRow key={agr.id}>
                    <AppTableCell>{agr.agreement_title}</AppTableCell>
                    <AppTableCell>
                      <StatusBadge status={agr.status} />
                    </AppTableCell>
                    <AppTableCell muted>{agr.effective_date ?? '—'}</AppTableCell>
                    <AppTableCell muted>{agr.end_date ?? '—'}</AppTableCell>
                    <AppTableCell muted>{formatDate(agr.created_at)}</AppTableCell>
                    <AppTableCell muted>{formatDate(agr.updated_at)}</AppTableCell>
                  </AppTableRow>
                ))
              )}
            </AppTableBody>
          </AppTable>
        </TabsContent>
      </Tabs>
    </AppPageLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span 
      className="text-[12px] font-medium capitalize"
      style={{ color: 'var(--platform-text-secondary)' }}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toISOString().slice(0, 10);
  } catch {
    return isoString;
  }
}
import { useState, useEffect } from "react";
import { PlatformPageLayout, PlatformTable, PlatformTableHeader, PlatformTableBody, PlatformTableRow, PlatformTableHead, PlatformTableCell, PlatformTableEmpty } from "@/components/platform-ui";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
    return <Navigate to="/restricted" replace />;
  }

  return (
    <PlatformPageLayout
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
          <PlatformTable columns={["22%", "10%", "12%", "12%", "18%", "13%", "13%"]}>
            <PlatformTableHeader>
              <PlatformTableRow header>
                <PlatformTableHead>Work Title</PlatformTableHead>
                <PlatformTableHead>Status</PlatformTableHead>
                <PlatformTableHead>Territory</PlatformTableHead>
                <PlatformTableHead>Usage Type</PlatformTableHead>
                <PlatformTableHead>Requester</PlatformTableHead>
                <PlatformTableHead>Submitted</PlatformTableHead>
                <PlatformTableHead>Last Updated</PlatformTableHead>
              </PlatformTableRow>
            </PlatformTableHeader>
            <PlatformTableBody>
              {loading ? (
                <PlatformTableEmpty colSpan={7}>
                  <p className="text-sm text-muted-foreground">Retrieving records...</p>
                  <p className="text-xs text-muted-foreground mt-1">Loading licensing requests.</p>
                </PlatformTableEmpty>
              ) : requests.length === 0 ? (
                <PlatformTableEmpty colSpan={7}>
                  <p className="text-sm text-muted-foreground">{EMPTY_STATES.LICENSING_REQUESTS.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{EMPTY_STATES.LICENSING_REQUESTS.description}</p>
                </PlatformTableEmpty>
              ) : (
                requests.map((req) => (
                  <PlatformTableRow key={req.id}>
                    <PlatformTableCell>{req.work_title ?? '—'}</PlatformTableCell>
                    <PlatformTableCell>
                      <StatusBadge status={req.status} />
                    </PlatformTableCell>
                    <PlatformTableCell muted>{req.territory ?? '—'}</PlatformTableCell>
                    <PlatformTableCell muted>{req.usage_type ?? '—'}</PlatformTableCell>
                    <PlatformTableCell muted>{req.requester_email ?? '—'}</PlatformTableCell>
                    <PlatformTableCell muted>{formatDate(req.created_at)}</PlatformTableCell>
                    <PlatformTableCell muted>{formatDate(req.updated_at)}</PlatformTableCell>
                  </PlatformTableRow>
                ))
              )}
            </PlatformTableBody>
          </PlatformTable>
        </TabsContent>

        <TabsContent value="agreements">
          <PlatformTable columns={["25%", "12%", "16%", "16%", "16%", "15%"]}>
            <PlatformTableHeader>
              <PlatformTableRow header>
                <PlatformTableHead>Agreement Title</PlatformTableHead>
                <PlatformTableHead>Status</PlatformTableHead>
                <PlatformTableHead>Effective Date</PlatformTableHead>
                <PlatformTableHead>End Date</PlatformTableHead>
                <PlatformTableHead>Created</PlatformTableHead>
                <PlatformTableHead>Last Updated</PlatformTableHead>
              </PlatformTableRow>
            </PlatformTableHeader>
            <PlatformTableBody>
              {loading ? (
                <PlatformTableEmpty colSpan={6}>
                  <p className="text-sm text-muted-foreground">Retrieving records...</p>
                  <p className="text-xs text-muted-foreground mt-1">Loading licensing agreements.</p>
                </PlatformTableEmpty>
              ) : agreements.length === 0 ? (
                <PlatformTableEmpty colSpan={6}>
                  <p className="text-sm text-muted-foreground">{EMPTY_STATES.LICENSING_AGREEMENTS.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{EMPTY_STATES.LICENSING_AGREEMENTS.description}</p>
                </PlatformTableEmpty>
              ) : (
                agreements.map((agr) => (
                  <PlatformTableRow key={agr.id}>
                    <PlatformTableCell>{agr.agreement_title}</PlatformTableCell>
                    <PlatformTableCell>
                      <StatusBadge status={agr.status} />
                    </PlatformTableCell>
                    <PlatformTableCell muted>{agr.effective_date ?? '—'}</PlatformTableCell>
                    <PlatformTableCell muted>{agr.end_date ?? '—'}</PlatformTableCell>
                    <PlatformTableCell muted>{formatDate(agr.created_at)}</PlatformTableCell>
                    <PlatformTableCell muted>{formatDate(agr.updated_at)}</PlatformTableCell>
                  </PlatformTableRow>
                ))
              )}
            </PlatformTableBody>
          </PlatformTable>
        </TabsContent>
      </Tabs>
    </PlatformPageLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="text-xs font-medium capitalize text-muted-foreground">
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

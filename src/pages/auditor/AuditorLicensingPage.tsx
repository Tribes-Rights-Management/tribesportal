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
    <PlatformLayout maxWidth="wide">
      <InstitutionalHeader 
        title="Licensing Records"
        description="Requests, agreements, and approval history"
      />

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
                  <TableHead>Work Title</TableHead>
                  <TableHead status>Status</TableHead>
                  <TableHead>Territory</TableHead>
                  <TableHead>Usage Type</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableEmptyRow 
                    colSpan={7} 
                    title="Retrieving records..."
                    description="Loading licensing requests."
                  />
                ) : requests.length === 0 ? (
                  <TableEmptyRow 
                    colSpan={7} 
                    title={EMPTY_STATES.LICENSING_REQUESTS.title}
                    description={EMPTY_STATES.LICENSING_REQUESTS.description}
                  />
                ) : (
                  requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>{req.work_title ?? '—'}</TableCell>
                      <TableCell status>
                        <StatusBadge status={req.status} />
                      </TableCell>
                      <TableCell muted>{req.territory ?? '—'}</TableCell>
                      <TableCell muted>{req.usage_type ?? '—'}</TableCell>
                      <TableCell muted>{req.requester_email ?? '—'}</TableCell>
                      <TableCell muted>{formatDate(req.created_at)}</TableCell>
                      <TableCell muted>{formatDate(req.updated_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="agreements">
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
                  <TableHead>Agreement Title</TableHead>
                  <TableHead status>Status</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableEmptyRow 
                    colSpan={6} 
                    title="Retrieving records..."
                    description="Loading licensing agreements."
                  />
                ) : agreements.length === 0 ? (
                  <TableEmptyRow 
                    colSpan={6} 
                    title={EMPTY_STATES.LICENSING_AGREEMENTS.title}
                    description={EMPTY_STATES.LICENSING_AGREEMENTS.description}
                  />
                ) : (
                  agreements.map((agr) => (
                    <TableRow key={agr.id}>
                      <TableCell>{agr.agreement_title}</TableCell>
                      <TableCell status>
                        <StatusBadge status={agr.status} />
                      </TableCell>
                      <TableCell muted>{agr.effective_date ?? '—'}</TableCell>
                      <TableCell muted>{agr.end_date ?? '—'}</TableCell>
                      <TableCell muted>{formatDate(agr.created_at)}</TableCell>
                      <TableCell muted>{formatDate(agr.updated_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </PlatformLayout>
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

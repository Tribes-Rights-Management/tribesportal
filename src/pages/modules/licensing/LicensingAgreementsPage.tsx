import { useAuth } from "@/contexts/AuthContext";
import { useLicensingAgreements, useLicensingAgreement } from "@/hooks/useLicensingData";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { InstitutionalEmptyPanel, InstitutionalLoadingState, SystemErrorState } from "@/components/ui/institutional-states";
import { PageHeader } from "@/components/ui/page-header";
import { TenantSelector } from "@/components/app/TenantSelector";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { ExternalLink } from "lucide-react";

/**
 * LICENSING MODULE — AGREEMENTS
 * 
 * Route: /licensing/agreements
 * Permission: licensing.view
 * 
 * Table with columns: agreement_title, status, effective_date, end_date
 * Detail view when ?id= is present
 */

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "default";
    case "draft":
      return "secondary";
    case "expired":
    case "terminated":
      return "destructive";
    default:
      return "outline";
  }
}

function AgreementDetailView({ agreementId }: { agreementId: string }) {
  const { data: agreement, isLoading, error } = useLicensingAgreement(agreementId);
  const { hasPermission } = useRoleAccess();
  const canManage = hasPermission("licensing.manage");

  if (isLoading) {
    return <InstitutionalLoadingState message="Loading agreement details" />;
  }

  if (error || !agreement) {
    return (
      <SystemErrorState 
        title="Unable to load agreement"
        description="The agreement may not exist or you may not have access."
      />
    );
  }

  return (
    <div 
      className="rounded overflow-hidden"
      style={{
        backgroundColor: "var(--platform-surface)",
        border: "1px solid var(--platform-border)",
      }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[16px] font-medium text-[--platform-text]">
            {agreement.agreement_title}
          </h2>
          <Badge variant={getStatusVariant(agreement.status)}>
            {agreement.status}
          </Badge>
        </div>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-[13px]">
          <div>
            <dt className="text-[--platform-text-muted] mb-1">Effective Date</dt>
            <dd className="text-[--platform-text]">
              {agreement.effective_date 
                ? format(new Date(agreement.effective_date), "MMM d, yyyy")
                : "—"
              }
            </dd>
          </div>
          <div>
            <dt className="text-[--platform-text-muted] mb-1">End Date</dt>
            <dd className="text-[--platform-text]">
              {agreement.end_date 
                ? format(new Date(agreement.end_date), "MMM d, yyyy")
                : "—"
              }
            </dd>
          </div>
          <div>
            <dt className="text-[--platform-text-muted] mb-1">Created</dt>
            <dd className="text-[--platform-text]">
              {format(new Date(agreement.created_at), "MMM d, yyyy 'at' h:mm a")}
            </dd>
          </div>
          <div>
            <dt className="text-[--platform-text-muted] mb-1">Last Updated</dt>
            <dd className="text-[--platform-text]">
              {format(new Date(agreement.updated_at), "MMM d, yyyy 'at' h:mm a")}
            </dd>
          </div>
          {agreement.document_url && (
            <div className="md:col-span-2">
              <dt className="text-[--platform-text-muted] mb-1">Document</dt>
              <dd>
                <a 
                  href={agreement.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[--platform-text] hover:underline"
                >
                  View document
                  <ExternalLink className="h-3 w-3" />
                </a>
              </dd>
            </div>
          )}
        </dl>

        {canManage && (
          <p className="text-[12px] text-[--platform-text-muted] mt-6 pt-4 border-t border-[--platform-border]">
            Edit functionality will be available once the module is fully connected.
          </p>
        )}
      </div>
    </div>
  );
}

export default function LicensingAgreementsPage() {
  const { activeTenant, tenantMemberships } = useAuth();
  const { data: agreements, isLoading, error } = useLicensingAgreements();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("id");

  // No tenant selected
  if (!activeTenant) {
    return (
      <div className="p-6 md:p-8 max-w-[1040px] mx-auto">
        <PageHeader 
          title="Agreements"
          description="Active and historical licensing agreements"
        />
        {tenantMemberships.length > 1 ? (
          <div className="mt-8">
            <p className="text-[13px] text-[--platform-text-muted] mb-4">
              Select an organization to view agreements.
            </p>
            <TenantSelector />
          </div>
        ) : (
          <div className="mt-8">
            <InstitutionalEmptyPanel
              title="No organization available"
              description="You are not a member of any organization."
            />
          </div>
        )}
      </div>
    );
  }

  // Detail view
  if (selectedId) {
    return (
      <div className="p-6 md:p-8 max-w-[1040px] mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setSearchParams({})}
            className="text-[13px] text-[--platform-text-muted] hover:text-[--platform-text] transition-colors"
          >
            ← Back to agreements
          </button>
        </div>
        <AgreementDetailView agreementId={selectedId} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-[1040px] mx-auto">
        <PageHeader 
          title="Agreements"
          description="Active and historical licensing agreements"
        />
        <div className="mt-8">
          <InstitutionalLoadingState message="Loading agreements" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-[1040px] mx-auto">
        <PageHeader 
          title="Agreements"
          description="Active and historical licensing agreements"
        />
        <div className="mt-8">
          <SystemErrorState 
            title="Unable to load agreements"
            description="Please try again or contact support if the issue persists."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1040px] mx-auto">
      <div className="flex items-start justify-between gap-4 mb-8">
        <PageHeader 
          title="Agreements"
          description="Active and historical licensing agreements"
        />
        {tenantMemberships.length > 1 && <TenantSelector />}
      </div>

      {agreements && agreements.length > 0 ? (
        <div 
          className="rounded overflow-hidden"
          style={{
            backgroundColor: "var(--platform-surface)",
            border: "1px solid var(--platform-border)",
          }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agreement Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>End Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agreements.map((agreement) => (
                <TableRow 
                  key={agreement.id}
                  className="cursor-pointer"
                  onClick={() => setSearchParams({ id: agreement.id })}
                >
                  <TableCell>
                    {agreement.agreement_title}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(agreement.status)}>
                      {agreement.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[--platform-text-muted]">
                    {agreement.effective_date 
                      ? format(new Date(agreement.effective_date), "MMM d, yyyy")
                      : "—"
                    }
                  </TableCell>
                  <TableCell className="text-[--platform-text-muted]">
                    {agreement.end_date 
                      ? format(new Date(agreement.end_date), "MMM d, yyyy")
                      : "—"
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <InstitutionalEmptyPanel
          title="No agreements available"
          description="Licensing agreements will appear once executed."
        />
      )}
    </div>
  );
}

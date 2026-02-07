import { useAuth } from "@/contexts/AuthContext";
import { useLicensingAgreements, useLicensingAgreement } from "@/hooks/useLicensingData";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { TenantSelector } from "@/components/app/TenantSelector";
import { useSearchParams } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { format } from "date-fns";
import {
  AppPageLayout,
  AppCard,
  AppCardBody,
  AppTable,
  AppTableHeader,
  AppTableBody,
  AppTableRow,
  AppTableHead,
  AppTableCell,
  AppTableBadge,
  AppEmptyState,
  AppButton,
} from "@/components/app-ui";
import { InstitutionalLoadingState, SystemErrorState } from "@/components/ui/institutional-states";

/**
 * LICENSING MODULE — AGREEMENTS
 * 
 * Route: /licensing/agreements
 * Permission: licensing.view
 */

type BadgeVariant = "default" | "success" | "warning" | "error" | "info";

function getStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case "active":
      return "success";
    case "draft":
      return "warning";
    case "expired":
    case "terminated":
      return "error";
    default:
      return "default";
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
    <AppCard>
      <AppCardBody className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[16px] font-medium text-foreground">
            {agreement.agreement_title}
          </h2>
          <AppTableBadge variant={getStatusVariant(agreement.status)}>
            {agreement.status}
          </AppTableBadge>
        </div>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-[13px]">
          <div>
            <dt className="text-muted-foreground mb-1">Effective Date</dt>
            <dd className="text-foreground">
              {agreement.effective_date 
                ? format(new Date(agreement.effective_date), "MMM d, yyyy")
                : "—"
              }
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground mb-1">End Date</dt>
            <dd className="text-foreground">
              {agreement.end_date 
                ? format(new Date(agreement.end_date), "MMM d, yyyy")
                : "—"
              }
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground mb-1">Created</dt>
            <dd className="text-foreground">
              {format(new Date(agreement.created_at), "MMM d, yyyy 'at' h:mm a")}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground mb-1">Last Updated</dt>
            <dd className="text-foreground">
              {format(new Date(agreement.updated_at), "MMM d, yyyy 'at' h:mm a")}
            </dd>
          </div>
          {agreement.document_url && (
            <div className="md:col-span-2">
              <dt className="text-muted-foreground mb-1">Document</dt>
              <dd>
                <a 
                  href={agreement.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-foreground hover:underline"
                >
                  View document
                  <ExternalLink className="h-3 w-3" />
                </a>
              </dd>
            </div>
          )}
        </dl>

        {canManage && (
          <p className="text-[12px] text-muted-foreground mt-6 pt-4 border-t border-border">
            Edit functionality will be available once the module is fully connected.
          </p>
        )}
      </AppCardBody>
    </AppCard>
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
      <AppPageLayout title="Agreements">
        <AppCard>
          <AppCardBody className="p-6 md:p-8">
            {tenantMemberships.length > 1 ? (
              <div>
                <p className="text-[13px] text-muted-foreground mb-4">
                  Select an organization to view agreements.
                </p>
                <TenantSelector />
              </div>
            ) : (
              <AppEmptyState
                icon="folder"
                message="No organization available"
                description="You are not a member of any organization."
              />
            )}
          </AppCardBody>
        </AppCard>
      </AppPageLayout>
    );
  }

  // Detail view
  if (selectedId) {
    return (
      <AppPageLayout
        title="Agreement Detail"
        backLink={{ to: "/licensing/agreements", label: "Back to agreements" }}
      >
        <AgreementDetailView agreementId={selectedId} />
      </AppPageLayout>
    );
  }

  if (isLoading) {
    return (
      <AppPageLayout title="Agreements">
        <AppCard>
          <AppCardBody className="p-6 md:p-8">
            <InstitutionalLoadingState message="Loading agreements" />
          </AppCardBody>
        </AppCard>
      </AppPageLayout>
    );
  }

  if (error) {
    return (
      <AppPageLayout title="Agreements">
        <AppCard>
          <AppCardBody className="p-6 md:p-8">
            <SystemErrorState 
              title="Unable to load agreements"
              description="Please try again or contact support if the issue persists."
            />
          </AppCardBody>
        </AppCard>
      </AppPageLayout>
    );
  }

  return (
    <AppPageLayout
      title="Agreements"
      action={tenantMemberships.length > 1 ? <TenantSelector /> : undefined}
    >
      <AppCard>
        <AppCardBody className="p-6 md:p-8">
          {agreements && agreements.length > 0 ? (
            <AppTable>
              <AppTableHeader>
                <AppTableRow header>
                  <AppTableHead>Agreement Title</AppTableHead>
                  <AppTableHead>Status</AppTableHead>
                  <AppTableHead>Effective Date</AppTableHead>
                  <AppTableHead>End Date</AppTableHead>
                </AppTableRow>
              </AppTableHeader>
              <AppTableBody>
                {agreements.map((agreement) => (
                  <AppTableRow 
                    key={agreement.id}
                    clickable
                    onClick={() => setSearchParams({ id: agreement.id })}
                  >
                    <AppTableCell>
                      {agreement.agreement_title}
                    </AppTableCell>
                    <AppTableCell>
                      <AppTableBadge variant={getStatusVariant(agreement.status)}>
                        {agreement.status}
                      </AppTableBadge>
                    </AppTableCell>
                    <AppTableCell muted>
                      {agreement.effective_date 
                        ? format(new Date(agreement.effective_date), "MMM d, yyyy")
                        : "—"
                      }
                    </AppTableCell>
                    <AppTableCell muted>
                      {agreement.end_date 
                        ? format(new Date(agreement.end_date), "MMM d, yyyy")
                        : "—"
                      }
                    </AppTableCell>
                  </AppTableRow>
                ))}
              </AppTableBody>
            </AppTable>
          ) : (
            <AppEmptyState
              icon="file"
              message="No agreements available"
              description="Licensing agreements will appear once executed."
            />
          )}
        </AppCardBody>
      </AppCard>
    </AppPageLayout>
  );
}

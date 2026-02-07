import { useAuth } from "@/contexts/AuthContext";
import { useLicensingRequests, useLicensingAgreements } from "@/hooks/useLicensingData";
import { TenantSelector } from "@/components/app/TenantSelector";
import { Link } from "react-router-dom";
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
  AppSectionHeader,
} from "@/components/app-ui";
import { InstitutionalLoadingState, SystemErrorState } from "@/components/ui/institutional-states";

/**
 * LICENSING MODULE — OVERVIEW (LANDING PAGE)
 * 
 * Route: /licensing
 * Permission: licensing.view
 */

type BadgeVariant = "default" | "success" | "warning" | "error" | "info";

function getStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case "approved":
    case "active":
      return "success";
    case "draft":
    case "pending":
      return "warning";
    case "rejected":
    case "cancelled":
    case "terminated":
    case "expired":
      return "error";
    default:
      return "default";
  }
}

export default function LicensingOverview() {
  const { activeTenant, tenantMemberships } = useAuth();
  const { data: requests, isLoading: requestsLoading, error: requestsError } = useLicensingRequests();
  const { data: agreements, isLoading: agreementsLoading, error: agreementsError } = useLicensingAgreements();

  // No tenant selected
  if (!activeTenant) {
    return (
      <AppPageLayout title="Overview">
        <AppCard>
          <AppCardBody className="p-6 md:p-8">
            {tenantMemberships.length > 1 ? (
              <div>
                <p className="text-[13px] text-muted-foreground mb-4">
                  Select an organization to view licensing data.
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

  const isLoading = requestsLoading || agreementsLoading;
  const hasError = requestsError || agreementsError;

  if (isLoading) {
    return (
      <AppPageLayout title="Overview">
        <AppCard>
          <AppCardBody className="p-6 md:p-8">
            <InstitutionalLoadingState message="Loading licensing data" />
          </AppCardBody>
        </AppCard>
      </AppPageLayout>
    );
  }

  if (hasError) {
    return (
      <AppPageLayout title="Overview">
        <AppCard>
          <AppCardBody className="p-6 md:p-8">
            <SystemErrorState 
              title="Unable to load licensing data"
              description="Please try again or contact support if the issue persists."
            />
          </AppCardBody>
        </AppCard>
      </AppPageLayout>
    );
  }

  return (
    <AppPageLayout
      title="Overview"
      action={tenantMemberships.length > 1 ? <TenantSelector /> : undefined}
    >
      <AppCard>
        <AppCardBody className="p-6 md:p-8">
          {/* Requests Section */}
          <section className="mb-10">
            <AppSectionHeader title="Requests" />
            
            {requests && requests.length > 0 ? (
              <AppTable>
                <AppTableHeader>
                  <AppTableRow header>
                    <AppTableHead>Work Title</AppTableHead>
                    <AppTableHead>Status</AppTableHead>
                    <AppTableHead>Created</AppTableHead>
                  </AppTableRow>
                </AppTableHeader>
                <AppTableBody>
                  {requests.map((request) => (
                    <AppTableRow key={request.id} clickable>
                      <AppTableCell>
                        <Link 
                          to={`/licensing/requests?id=${request.id}`}
                          className="hover:underline"
                        >
                          {request.work_title || "Untitled Request"}
                        </Link>
                      </AppTableCell>
                      <AppTableCell>
                        <AppTableBadge variant={getStatusVariant(request.status)}>
                          {request.status.replace("_", " ")}
                        </AppTableBadge>
                      </AppTableCell>
                      <AppTableCell muted>
                        {format(new Date(request.created_at), "MMM d, yyyy")}
                      </AppTableCell>
                    </AppTableRow>
                  ))}
                </AppTableBody>
              </AppTable>
            ) : (
              <AppEmptyState
                icon="inbox"
                message="No requests available"
                description="Licensing requests will appear once submitted."
              />
            )}
          </section>

          {/* Agreements Section */}
          <section>
            <AppSectionHeader title="Agreements" />
            
            {agreements && agreements.length > 0 ? (
              <AppTable>
                <AppTableHeader>
                  <AppTableRow header>
                    <AppTableHead>Agreement Title</AppTableHead>
                    <AppTableHead>Status</AppTableHead>
                    <AppTableHead>Effective Date</AppTableHead>
                  </AppTableRow>
                </AppTableHeader>
                <AppTableBody>
                  {agreements.map((agreement) => (
                    <AppTableRow key={agreement.id} clickable>
                      <AppTableCell>
                        <Link 
                          to={`/licensing/agreements?id=${agreement.id}`}
                          className="hover:underline"
                        >
                          {agreement.agreement_title}
                        </Link>
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
          </section>
        </AppCardBody>
      </AppCard>
    </AppPageLayout>
  );
}

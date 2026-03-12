import { useAuth } from "@/contexts/AuthContext";
import { useLicensingRequests, useLicensingAgreements } from "@/hooks/useLicensingData";
import { TenantSelector } from "@/components/app/TenantSelector";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  PlatformPageLayout,
  PlatformCard,
  PlatformCardBody,
  PlatformTable,
  PlatformTableHeader,
  PlatformTableBody,
  PlatformTableRow,
  PlatformTableHead,
  PlatformTableCell,
  PlatformTableBadge,
  PlatformEmptyState,
  PlatformSectionHeader,
} from "@/components/platform-ui";
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
      <PlatformPageLayout title="Overview">
        <PlatformCard>
          <PlatformCardBody className="p-6 md:p-8">
            {tenantMemberships.length > 1 ? (
              <div>
                <p className="text-[13px] text-muted-foreground mb-4">
                  Select an organization to view licensing data.
                </p>
                <TenantSelector />
              </div>
            ) : (
              <PlatformEmptyState
                icon="folder"
                message="No organization available"
                description="You are not a member of any organization."
              />
            )}
          </PlatformCardBody>
        </PlatformCard>
      </PlatformPageLayout>
    );
  }

  const isLoading = requestsLoading || agreementsLoading;
  const hasError = requestsError || agreementsError;

  if (isLoading) {
    return (
      <PlatformPageLayout title="Overview">
        <PlatformCard>
          <PlatformCardBody className="p-6 md:p-8">
            <InstitutionalLoadingState message="Loading licensing data" />
          </PlatformCardBody>
        </PlatformCard>
      </PlatformPageLayout>
    );
  }

  if (hasError) {
    return (
      <PlatformPageLayout title="Overview">
        <PlatformCard>
          <PlatformCardBody className="p-6 md:p-8">
            <SystemErrorState 
              title="Unable to load licensing data"
              description="Please try again or contact support if the issue persists."
            />
          </PlatformCardBody>
        </PlatformCard>
      </PlatformPageLayout>
    );
  }

  return (
    <PlatformPageLayout
      title="Overview"
      action={tenantMemberships.length > 1 ? <TenantSelector /> : undefined}
    >
      <PlatformCard>
        <PlatformCardBody className="p-6 md:p-8">
          {/* Requests Section */}
          <section className="mb-10">
            <PlatformSectionHeader title="Requests" />
            
            {requests && requests.length > 0 ? (
              <PlatformTable>
                <PlatformTableHeader>
                  <PlatformTableRow header>
                    <PlatformTableHead>Work Title</PlatformTableHead>
                    <PlatformTableHead>Status</PlatformTableHead>
                    <PlatformTableHead>Created</PlatformTableHead>
                  </PlatformTableRow>
                </PlatformTableHeader>
                <PlatformTableBody>
                  {requests.map((request) => (
                    <PlatformTableRow key={request.id} clickable>
                      <PlatformTableCell>
                        <Link 
                          to={`/licensing/requests?id=${request.id}`}
                          className="hover:underline"
                        >
                          {request.work_title || "Untitled Request"}
                        </Link>
                      </PlatformTableCell>
                      <PlatformTableCell>
                        <PlatformTableBadge variant={getStatusVariant(request.status)}>
                          {request.status.replace("_", " ")}
                        </PlatformTableBadge>
                      </PlatformTableCell>
                      <PlatformTableCell muted>
                        {format(new Date(request.created_at), "MMM d, yyyy")}
                      </PlatformTableCell>
                    </PlatformTableRow>
                  ))}
                </PlatformTableBody>
              </PlatformTable>
            ) : (
              <PlatformEmptyState
                icon="inbox"
                message="No requests available"
                description="Licensing requests will appear once submitted."
              />
            )}
          </section>

          {/* Agreements Section */}
          <section>
            <PlatformSectionHeader title="Agreements" />
            
            {agreements && agreements.length > 0 ? (
              <PlatformTable>
                <PlatformTableHeader>
                  <PlatformTableRow header>
                    <PlatformTableHead>Agreement Title</PlatformTableHead>
                    <PlatformTableHead>Status</PlatformTableHead>
                    <PlatformTableHead>Effective Date</PlatformTableHead>
                  </PlatformTableRow>
                </PlatformTableHeader>
                <PlatformTableBody>
                  {agreements.map((agreement) => (
                    <PlatformTableRow key={agreement.id} clickable>
                      <PlatformTableCell>
                        <Link 
                          to={`/licensing/agreements?id=${agreement.id}`}
                          className="hover:underline"
                        >
                          {agreement.agreement_title}
                        </Link>
                      </PlatformTableCell>
                      <PlatformTableCell>
                        <PlatformTableBadge variant={getStatusVariant(agreement.status)}>
                          {agreement.status}
                        </PlatformTableBadge>
                      </PlatformTableCell>
                      <PlatformTableCell muted>
                        {agreement.effective_date 
                          ? format(new Date(agreement.effective_date), "MMM d, yyyy")
                          : "—"
                        }
                      </PlatformTableCell>
                    </PlatformTableRow>
                  ))}
                </PlatformTableBody>
              </PlatformTable>
            ) : (
              <PlatformEmptyState
                icon="file"
                message="No agreements available"
                description="Licensing agreements will appear once executed."
              />
            )}
          </section>
        </PlatformCardBody>
      </PlatformCard>
    </PlatformPageLayout>
  );
}

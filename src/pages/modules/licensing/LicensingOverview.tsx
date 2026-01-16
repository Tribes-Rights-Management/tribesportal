import { useAuth } from "@/contexts/AuthContext";
import { useLicensingRequests, useLicensingAgreements } from "@/hooks/useLicensingData";
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
import { Link } from "react-router-dom";

/**
 * LICENSING MODULE — OVERVIEW (LANDING PAGE)
 * 
 * Route: /licensing
 * Permission: licensing.view
 * 
 * All content is rendered on elevated surfaces above the page background.
 * Page background matches the public website (#0A0A0B via --platform-canvas).
 */

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "approved":
    case "active":
      return "default";
    case "draft":
    case "pending":
      return "secondary";
    case "rejected":
    case "cancelled":
    case "terminated":
    case "expired":
      return "destructive";
    default:
      return "outline";
  }
}

export default function LicensingOverview() {
  const { activeTenant, tenantMemberships } = useAuth();
  const { data: requests, isLoading: requestsLoading, error: requestsError } = useLicensingRequests();
  const { data: agreements, isLoading: agreementsLoading, error: agreementsError } = useLicensingAgreements();

  // No tenant selected
  if (!activeTenant) {
    return (
      <div 
        className="min-h-full py-8 md:py-10 px-4 md:px-6"
        style={{ backgroundColor: 'var(--platform-canvas)' }}
      >
        <div 
          className="max-w-[1040px] mx-auto rounded-lg p-6 md:p-8"
          style={{
            backgroundColor: 'var(--platform-surface)',
            border: '1px solid var(--platform-border)',
          }}
        >
          <PageHeader 
            title="Licensing"
            description="Manage licensing requests and agreements"
          />
          {tenantMemberships.length > 1 ? (
            <div className="mt-8">
              <p className="text-[13px] text-[--platform-text-muted] mb-4">
                Select an organization to view licensing data.
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
      </div>
    );
  }

  const isLoading = requestsLoading || agreementsLoading;
  const hasError = requestsError || agreementsError;

  if (isLoading) {
    return (
      <div 
        className="min-h-full py-8 md:py-10 px-4 md:px-6"
        style={{ backgroundColor: 'var(--platform-canvas)' }}
      >
        <div 
          className="max-w-[1040px] mx-auto rounded-lg p-6 md:p-8"
          style={{
            backgroundColor: 'var(--platform-surface)',
            border: '1px solid var(--platform-border)',
          }}
        >
          <PageHeader 
            title="Licensing"
            description="Manage licensing requests and agreements"
          />
          <div className="mt-8">
            <InstitutionalLoadingState message="Loading licensing data" />
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div 
        className="min-h-full py-8 md:py-10 px-4 md:px-6"
        style={{ backgroundColor: 'var(--platform-canvas)' }}
      >
        <div 
          className="max-w-[1040px] mx-auto rounded-lg p-6 md:p-8"
          style={{
            backgroundColor: 'var(--platform-surface)',
            border: '1px solid var(--platform-border)',
          }}
        >
          <PageHeader 
            title="Licensing"
            description="Manage licensing requests and agreements"
          />
          <div className="mt-8">
            <SystemErrorState 
              title="Unable to load licensing data"
              description="Please try again or contact support if the issue persists."
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-full py-8 md:py-10 px-4 md:px-6"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      {/* Main content card - elevated surface above page background */}
      <div 
        className="max-w-[1040px] mx-auto rounded-lg"
        style={{
          backgroundColor: 'var(--platform-surface)',
          border: '1px solid var(--platform-border)',
        }}
      >
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 mb-8">
            <PageHeader 
              title="Licensing"
              description="Manage licensing requests and agreements"
            />
            {tenantMemberships.length > 1 && <TenantSelector />}
          </div>

          {/* Requests Section */}
          <section className="mb-10">
            <h2 className="text-[14px] font-medium text-[--platform-text] mb-4">
              Requests
            </h2>
            
            {requests && requests.length > 0 ? (
              <div 
                className="rounded overflow-hidden"
                style={{
                  backgroundColor: "var(--platform-surface-2)",
                  border: "1px solid var(--platform-border)",
                }}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Work Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <Link 
                            to={`/licensing/requests?id=${request.id}`}
                            className="hover:underline"
                          >
                            {request.work_title || "Untitled Request"}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(request.status)}>
                            {request.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[--platform-text-muted]">
                          {format(new Date(request.created_at), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <InstitutionalEmptyPanel
                title="No requests available"
                description="Licensing requests will appear once submitted."
              />
            )}
          </section>

          {/* Agreements Section */}
          <section>
            <h2 className="text-[14px] font-medium text-[--platform-text] mb-4">
              Agreements
            </h2>
            
            {agreements && agreements.length > 0 ? (
              <div 
                className="rounded overflow-hidden"
                style={{
                  backgroundColor: "var(--platform-surface-2)",
                  border: "1px solid var(--platform-border)",
                }}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agreement Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Effective Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agreements.map((agreement) => (
                      <TableRow key={agreement.id}>
                        <TableCell>
                          <Link 
                            to={`/licensing/agreements?id=${agreement.id}`}
                            className="hover:underline"
                          >
                            {agreement.agreement_title}
                          </Link>
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
          </section>
        </div>
      </div>
    </div>
  );
}

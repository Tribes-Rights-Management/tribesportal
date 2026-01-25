import { useAuth } from "@/contexts/AuthContext";
import { usePortalDocuments, usePortalAgreements, usePortalStatements } from "@/hooks/usePortalData";
import { TenantSelector } from "@/components/app/TenantSelector";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { PageContainer } from "@/components/ui/page-container";
import {
  AppPageHeader,
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
 * CLIENT PORTAL MODULE — OVERVIEW (LANDING PAGE)
 * 
 * Route: /portal
 * Permission: portal.view
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

export default function PortalOverview() {
  const { activeTenant, tenantMemberships } = useAuth();
  const { data: documents, isLoading: docsLoading, error: docsError } = usePortalDocuments();
  const { data: agreements, isLoading: agreementsLoading, error: agreementsError } = usePortalAgreements();
  const { data: statements, isLoading: statementsLoading, error: statementsError } = usePortalStatements();

  // No tenant selected
  if (!activeTenant) {
    return (
      <PageContainer maxWidth="wide">
        <AppCard>
          <AppCardBody className="p-6 md:p-8">
            <AppPageHeader 
              eyebrow="PORTAL"
              title="Client Portal"
              description="Access your statements, agreements, and documents"
            />
            {tenantMemberships.length > 1 ? (
              <div className="mt-8">
                <p className="text-[13px] text-muted-foreground mb-4">
                  Select an organization to view your portal.
                </p>
                <TenantSelector />
              </div>
            ) : (
              <div className="mt-8">
                <AppEmptyState
                  icon="folder"
                  message="No organization available"
                  description="You are not a member of any organization."
                />
              </div>
            )}
          </AppCardBody>
        </AppCard>
      </PageContainer>
    );
  }

  const isLoading = docsLoading || agreementsLoading || statementsLoading;
  const hasError = docsError || agreementsError || statementsError;

  if (isLoading) {
    return (
      <PageContainer maxWidth="wide">
        <AppCard>
          <AppCardBody className="p-6 md:p-8">
            <AppPageHeader 
              eyebrow="PORTAL"
              title="Client Portal"
              description="Access your statements, agreements, and documents"
            />
            <div className="mt-8">
              <InstitutionalLoadingState message="Loading portal data" />
            </div>
          </AppCardBody>
        </AppCard>
      </PageContainer>
    );
  }

  if (hasError) {
    return (
      <PageContainer maxWidth="wide">
        <AppCard>
          <AppCardBody className="p-6 md:p-8">
            <AppPageHeader 
              eyebrow="PORTAL"
              title="Client Portal"
              description="Access your statements, agreements, and documents"
            />
            <div className="mt-8">
              <SystemErrorState 
                title="Unable to load portal data"
                description="Please try again or contact support if the issue persists."
              />
            </div>
          </AppCardBody>
        </AppCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="wide">
      <AppCard>
        <AppCardBody className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 mb-8">
            <AppPageHeader 
              eyebrow="PORTAL"
              title="Client Portal"
              description="Access your statements, agreements, and documents"
            />
            {tenantMemberships.length > 1 && <TenantSelector />}
          </div>

          {/* Statements Section */}
          <section className="mb-10">
            <AppSectionHeader title="Statements" />
            
            {statements && statements.length > 0 ? (
              <div>
                <AppTable>
                  <AppTableHeader>
                    <AppTableRow header>
                      <AppTableHead>Period</AppTableHead>
                      <AppTableHead>Created</AppTableHead>
                    </AppTableRow>
                  </AppTableHeader>
                  <AppTableBody>
                    {statements.slice(0, 5).map((statement) => (
                      <AppTableRow key={statement.id} clickable>
                        <AppTableCell>
                          <Link 
                            to={`/portal/statements?id=${statement.id}`}
                            className="hover:underline"
                          >
                            {statement.statement_period}
                          </Link>
                        </AppTableCell>
                        <AppTableCell muted>
                          {format(new Date(statement.created_at), "MMM d, yyyy")}
                        </AppTableCell>
                      </AppTableRow>
                    ))}
                  </AppTableBody>
                </AppTable>
                {statements.length > 5 && (
                  <div className="px-4 py-3 border-t border-border">
                    <Link 
                      to="/portal/statements"
                      className="text-[13px] text-muted-foreground hover:text-foreground"
                    >
                      View all statements →
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <AppEmptyState
                icon="file"
                message="No statements available"
                description="Statements will appear once processed."
              />
            )}
          </section>

          {/* Agreements Section */}
          <section className="mb-10">
            <AppSectionHeader title="Agreements" />
            
            {agreements && agreements.length > 0 ? (
              <div>
                <AppTable>
                  <AppTableHeader>
                    <AppTableRow header>
                      <AppTableHead>Agreement Title</AppTableHead>
                      <AppTableHead>Status</AppTableHead>
                    </AppTableRow>
                  </AppTableHeader>
                  <AppTableBody>
                    {agreements.slice(0, 5).map((agreement) => (
                      <AppTableRow key={agreement.id} clickable>
                        <AppTableCell>
                          <Link 
                            to={`/portal/agreements?id=${agreement.id}`}
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
                      </AppTableRow>
                    ))}
                  </AppTableBody>
                </AppTable>
                {agreements.length > 5 && (
                  <div className="px-4 py-3 border-t border-border">
                    <Link 
                      to="/portal/agreements"
                      className="text-[13px] text-muted-foreground hover:text-foreground"
                    >
                      View all agreements →
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <AppEmptyState
                icon="file"
                message="No agreements available"
                description="Agreements will appear once executed."
              />
            )}
          </section>

          {/* Documents Section */}
          <section>
            <AppSectionHeader title="Documents" />
            
            {documents && documents.length > 0 ? (
              <div>
                <AppTable>
                  <AppTableHeader>
                    <AppTableRow header>
                      <AppTableHead>Title</AppTableHead>
                      <AppTableHead>Type</AppTableHead>
                      <AppTableHead>Created</AppTableHead>
                    </AppTableRow>
                  </AppTableHeader>
                  <AppTableBody>
                    {documents.slice(0, 5).map((doc) => (
                      <AppTableRow key={doc.id} clickable>
                        <AppTableCell>
                          <Link 
                            to={`/portal/documents?id=${doc.id}`}
                            className="hover:underline"
                          >
                            {doc.title}
                          </Link>
                        </AppTableCell>
                        <AppTableCell muted>
                          {doc.document_type || "—"}
                        </AppTableCell>
                        <AppTableCell muted>
                          {format(new Date(doc.created_at), "MMM d, yyyy")}
                        </AppTableCell>
                      </AppTableRow>
                    ))}
                  </AppTableBody>
                </AppTable>
                {documents.length > 5 && (
                  <div className="px-4 py-3 border-t border-border">
                    <Link 
                      to="/portal/documents"
                      className="text-[13px] text-muted-foreground hover:text-foreground"
                    >
                      View all documents →
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <AppEmptyState
                icon="file"
                message="No documents available"
                description="Documents will appear once uploaded."
              />
            )}
          </section>
        </AppCardBody>
      </AppCard>
    </PageContainer>
  );
}

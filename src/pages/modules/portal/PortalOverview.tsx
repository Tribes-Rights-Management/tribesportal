import { useAuth } from "@/contexts/AuthContext";
import { usePortalDocuments, usePortalAgreements, usePortalStatements } from "@/hooks/usePortalData";
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
 * CLIENT PORTAL MODULE — OVERVIEW (LANDING PAGE)
 * 
 * Route: /portal
 * Permission: portal.view
 * 
 * All content is rendered on elevated surfaces above the page background.
 * Page background matches the public website (#0A0A0B via --platform-canvas).
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

export default function PortalOverview() {
  const { activeTenant, tenantMemberships } = useAuth();
  const { data: documents, isLoading: docsLoading, error: docsError } = usePortalDocuments();
  const { data: agreements, isLoading: agreementsLoading, error: agreementsError } = usePortalAgreements();
  const { data: statements, isLoading: statementsLoading, error: statementsError } = usePortalStatements();

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
            title="Client Portal"
            description="Access your statements, agreements, and documents"
          />
          {tenantMemberships.length > 1 ? (
            <div className="mt-8">
              <p className="text-[13px] text-[--platform-text-muted] mb-4">
                Select an organization to view your portal.
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

  const isLoading = docsLoading || agreementsLoading || statementsLoading;
  const hasError = docsError || agreementsError || statementsError;

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
            title="Client Portal"
            description="Access your statements, agreements, and documents"
          />
          <div className="mt-8">
            <InstitutionalLoadingState message="Loading portal data" />
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
            title="Client Portal"
            description="Access your statements, agreements, and documents"
          />
          <div className="mt-8">
            <SystemErrorState 
              title="Unable to load portal data"
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
              title="Client Portal"
              description="Access your statements, agreements, and documents"
            />
            {tenantMemberships.length > 1 && <TenantSelector />}
          </div>

          {/* Statements Section */}
          <section className="mb-10">
            <h2 className="text-[14px] font-medium text-[--platform-text] mb-4">
              Statements
            </h2>
            
            {statements && statements.length > 0 ? (
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
                      <TableHead>Period</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statements.slice(0, 5).map((statement) => (
                      <TableRow key={statement.id}>
                        <TableCell>
                          <Link 
                            to={`/portal/statements?id=${statement.id}`}
                            className="hover:underline"
                          >
                            {statement.statement_period}
                          </Link>
                        </TableCell>
                        <TableCell className="text-[--platform-text-muted]">
                          {format(new Date(statement.created_at), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {statements.length > 5 && (
                  <div className="px-4 py-3 border-t border-[--platform-border]">
                    <Link 
                      to="/portal/statements"
                      className="text-[13px] text-[--platform-text-muted] hover:text-[--platform-text]"
                    >
                      View all statements →
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <InstitutionalEmptyPanel
                title="No statements available"
                description="Statements will appear once processed."
              />
            )}
          </section>

          {/* Agreements Section */}
          <section className="mb-10">
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agreements.slice(0, 5).map((agreement) => (
                      <TableRow key={agreement.id}>
                        <TableCell>
                          <Link 
                            to={`/portal/agreements?id=${agreement.id}`}
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {agreements.length > 5 && (
                  <div className="px-4 py-3 border-t border-[--platform-border]">
                    <Link 
                      to="/portal/agreements"
                      className="text-[13px] text-[--platform-text-muted] hover:text-[--platform-text]"
                    >
                      View all agreements →
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <InstitutionalEmptyPanel
                title="No agreements available"
                description="Agreements will appear once executed."
              />
            )}
          </section>

          {/* Documents Section */}
          <section>
            <h2 className="text-[14px] font-medium text-[--platform-text] mb-4">
              Documents
            </h2>
            
            {documents && documents.length > 0 ? (
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
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.slice(0, 5).map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <Link 
                            to={`/portal/documents?id=${doc.id}`}
                            className="hover:underline"
                          >
                            {doc.title}
                          </Link>
                        </TableCell>
                        <TableCell className="text-[--platform-text-muted]">
                          {doc.document_type || "—"}
                        </TableCell>
                        <TableCell className="text-[--platform-text-muted]">
                          {format(new Date(doc.created_at), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {documents.length > 5 && (
                  <div className="px-4 py-3 border-t border-[--platform-border]">
                    <Link 
                      to="/portal/documents"
                      className="text-[13px] text-[--platform-text-muted] hover:text-[--platform-text]"
                    >
                      View all documents →
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <InstitutionalEmptyPanel
                title="No documents available"
                description="Documents will appear once uploaded."
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

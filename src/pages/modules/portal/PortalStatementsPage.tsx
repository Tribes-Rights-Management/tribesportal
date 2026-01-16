import { InstitutionalEmptyPanel } from "@/components/ui/institutional-states";
import { PageHeader } from "@/components/ui/page-header";

/**
 * CLIENT PORTAL MODULE — STATEMENTS
 * 
 * Route: /portal/statements
 * Permission: portal.view
 */
export default function PortalStatementsPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1040px] mx-auto">
      <PageHeader 
        title="Statements"
        description="Royalty and payment statements"
      />
      
      <div className="mt-8">
        <InstitutionalEmptyPanel
          title="No statements available"
          description="Statements will appear once transactions are processed."
        />
      </div>
    </div>
  );
}

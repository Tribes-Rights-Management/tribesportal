import { InstitutionalEmptyPanel } from "@/components/ui/institutional-states";
import { PageHeader } from "@/components/ui/page-header";

/**
 * CLIENT PORTAL MODULE — OVERVIEW (LANDING PAGE)
 * 
 * Route: /portal
 * Permission: portal.view
 * 
 * Institutional placeholder until data is connected.
 */
export default function PortalOverview() {
  return (
    <div className="p-6 md:p-8 max-w-[1040px] mx-auto">
      <PageHeader 
        title="Client Portal"
        description="Access your statements, agreements, and documents"
      />
      
      <div className="mt-8">
        <InstitutionalEmptyPanel
          title="No records available"
          description="This area will populate once data is available and permissions are granted."
        />
        <p className="text-[13px] text-[--platform-text-muted] mt-4 text-center">
          This module may not be enabled for your organization.
        </p>
      </div>
    </div>
  );
}

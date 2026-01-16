import { InstitutionalEmptyPanel } from "@/components/ui/institutional-states";
import { PageHeader } from "@/components/ui/page-header";
import { EMPTY_STATE_COPY } from "@/styles/tokens";

/**
 * LICENSING MODULE — OVERVIEW (LANDING PAGE)
 * 
 * Route: /licensing
 * Permission: licensing.view
 * 
 * Institutional placeholder until data is connected.
 */
export default function LicensingOverview() {
  return (
    <div className="p-6 md:p-8 max-w-[1040px] mx-auto">
      <PageHeader 
        title="Licensing"
        description="Manage licensing requests and agreements"
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

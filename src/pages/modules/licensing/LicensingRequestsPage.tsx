import { InstitutionalEmptyPanel } from "@/components/ui/institutional-states";
import { PageHeader } from "@/components/ui/page-header";

/**
 * LICENSING MODULE — REQUESTS
 * 
 * Route: /licensing/requests
 * Permission: licensing.view
 */
export default function LicensingRequestsPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1040px] mx-auto">
      <PageHeader 
        title="License Requests"
        description="Review and manage incoming licensing requests"
      />
      
      <div className="mt-8">
        <InstitutionalEmptyPanel
          title="No requests available"
          description="License requests will appear once submitted."
        />
      </div>
    </div>
  );
}

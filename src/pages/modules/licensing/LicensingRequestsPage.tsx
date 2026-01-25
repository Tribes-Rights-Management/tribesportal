import { PageContainer } from "@/components/ui/page-container";
import {
  AppPageHeader,
  AppCard,
  AppCardBody,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * LICENSING MODULE — REQUESTS
 * 
 * Route: /licensing/requests
 * Permission: licensing.view
 */
export default function LicensingRequestsPage() {
  return (
    <PageContainer maxWidth="wide">
      <AppCard>
        <AppCardBody className="p-6 md:p-8">
          <AppPageHeader 
            eyebrow="LICENSING"
            title="License Requests"
            description="Review and manage incoming licensing requests"
          />
          
          <div className="mt-8">
            <AppEmptyState
              icon="inbox"
              message="No requests available"
              description="License requests will appear once submitted."
            />
          </div>
        </AppCardBody>
      </AppCard>
    </PageContainer>
  );
}

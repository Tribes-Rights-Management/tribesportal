import { PageContainer } from "@/components/ui/page-container";
import {
  AppPageHeader,
  AppCard,
  AppCardBody,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * CLIENT PORTAL MODULE — AGREEMENTS
 * 
 * Route: /portal/agreements
 * Permission: portal.view
 */
export default function PortalAgreementsPage() {
  return (
    <PageContainer maxWidth="wide">
      <AppCard>
        <AppCardBody className="p-6 md:p-8">
          <AppPageHeader 
            eyebrow="PORTAL"
            title="Agreements"
            description="Your active agreements and contracts"
          />
          
          <div className="mt-8">
            <AppEmptyState
              icon="file"
              message="No agreements available"
              description="Your agreements will appear once they are established."
            />
          </div>
        </AppCardBody>
      </AppCard>
    </PageContainer>
  );
}

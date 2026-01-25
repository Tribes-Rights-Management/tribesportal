import { PageContainer } from "@/components/ui/page-container";
import {
  AppPageHeader,
  AppCard,
  AppCardBody,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * CLIENT PORTAL MODULE — STATEMENTS
 * 
 * Route: /portal/statements
 * Permission: portal.view
 */
export default function PortalStatementsPage() {
  return (
    <PageContainer maxWidth="wide">
      <AppCard>
        <AppCardBody className="p-6 md:p-8">
          <AppPageHeader 
            eyebrow="PORTAL"
            title="Statements"
            description="Royalty and payment statements"
          />
          
          <div className="mt-8">
            <AppEmptyState
              icon="file"
              message="No statements available"
              description="Statements will appear once transactions are processed."
            />
          </div>
        </AppCardBody>
      </AppCard>
    </PageContainer>
  );
}

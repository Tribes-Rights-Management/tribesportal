import { PageHeader } from "@/components/ui/page-header";
import { PageContainer } from "@/components/ui/page-container";
import { AppCard, AppCardBody } from "@/components/app-ui/AppCard";

/**
 * RIGHTS CONTRACTS PAGE
 * 
 * Contract management within the Rights module.
 */
export default function RightsContractsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Contracts"
      />
      
      <AppCard>
        <AppCardBody>
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Contract management functionality coming soon.
            </p>
          </div>
        </AppCardBody>
      </AppCard>
    </PageContainer>
  );
}

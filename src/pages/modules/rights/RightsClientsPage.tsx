import { PageHeader } from "@/components/ui/page-header";
import { PageContainer } from "@/components/ui/page-container";
import { AppCard, AppCardBody } from "@/components/app-ui/AppCard";

/**
 * RIGHTS CLIENTS PAGE
 * 
 * Client management within the Rights module.
 */
export default function RightsClientsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Clients"
        description="Manage client accounts and relationships"
      />
      
      <AppCard>
        <AppCardBody>
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Client management functionality coming soon.
            </p>
          </div>
        </AppCardBody>
      </AppCard>
    </PageContainer>
  );
}

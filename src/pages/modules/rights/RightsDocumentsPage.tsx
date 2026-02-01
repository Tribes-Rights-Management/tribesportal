import { PageHeader } from "@/components/ui/page-header";
import { PageContainer } from "@/components/ui/page-container";
import { AppCard, AppCardBody } from "@/components/app-ui/AppCard";

/**
 * RIGHTS DOCUMENTS PAGE
 * 
 * Document management within the Rights module.
 */
export default function RightsDocumentsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Documents"
        description="Client documents and files"
      />
      
      <AppCard>
        <AppCardBody>
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Document management functionality coming soon.
            </p>
          </div>
        </AppCardBody>
      </AppCard>
    </PageContainer>
  );
}

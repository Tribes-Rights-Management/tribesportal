import { PageHeader } from "@/components/ui/page-header";
import { PageContainer } from "@/components/ui/page-container";
import { AppCard, AppCardBody } from "@/components/app-ui/AppCard";

/**
 * RIGHTS SETTINGS PAGE
 * 
 * Settings for the Rights module.
 */
export default function RightsSettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Rights module configuration"
      />
      
      <AppCard>
        <AppCardBody>
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Settings functionality coming soon.
            </p>
          </div>
        </AppCardBody>
      </AppCard>
    </PageContainer>
  );
}

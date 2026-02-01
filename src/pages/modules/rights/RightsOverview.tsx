import { PageHeader } from "@/components/ui/page-header";
import { PageContainer } from "@/components/ui/page-container";
import { AppStatCard, AppStatCardGrid } from "@/components/app-ui/AppStatCard";
import { AppCard, AppCardBody } from "@/components/app-ui/AppCard";

/**
 * RIGHTS OVERVIEW PAGE
 * 
 * Dashboard for the Rights module showing client and contract metrics.
 */
export default function RightsOverview() {
  return (
    <PageContainer>
      <PageHeader
        title="Overview"
      />
      
      {/* Stats row */}
      <AppStatCardGrid columns={4} className="mb-6">
        <AppStatCard
          label="Active Clients"
          value="—"
        />
        <AppStatCard
          label="Active Contracts"
          value="—"
        />
        <AppStatCard
          label="Pending Reviews"
          value="—"
        />
        <AppStatCard
          label="Documents"
          value="—"
        />
      </AppStatCardGrid>

      {/* Placeholder content */}
      <AppCard>
        <AppCardBody>
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Rights management functionality coming soon.
            </p>
          </div>
        </AppCardBody>
      </AppCard>
    </PageContainer>
  );
}

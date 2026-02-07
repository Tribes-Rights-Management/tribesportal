import { CreditCard } from "lucide-react";

import {
  AppPageLayout,
  AppSection,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * TRIBES ADMIN ROYALTIES PAGE
 * 
 * Placeholder for Trolley integration.
 */

export default function TribesAdminRoyaltiesPage() {
  return (
    <AppPageLayout title="Royalties" backLink={{ to: "/admin", label: "Dashboard" }}>
      <AppSection spacing="md">
        <div className="flex items-center justify-center min-h-[400px]">
          <AppEmptyState
            customIcon={<CreditCard className="h-8 w-8" />}
            message="Royalty payments powered by Trolley — integration coming soon"
            size="lg"
          />
        </div>
      </AppSection>
    </AppPageLayout>
  );
}

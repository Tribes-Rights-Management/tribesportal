import { CreditCard } from "lucide-react";

import {
  PlatformPageLayout,
  PlatformSection,
  PlatformEmptyState,
} from "@/components/platform-ui";

/**
 * TRIBES ADMIN ROYALTIES PAGE
 * 
 * Placeholder for Trolley integration.
 */

export default function TribesAdminRoyaltiesPage() {
  return (
    <PlatformPageLayout title="Royalties" backLink={{ to: "/admin", label: "Dashboard" }}>
      <PlatformSection spacing="md">
        <div className="flex items-center justify-center min-h-[400px]">
          <PlatformEmptyState
            customIcon={<CreditCard className="h-8 w-8" />}
            message="Royalty payments powered by Trolley — integration coming soon"
            size="lg"
          />
        </div>
      </PlatformSection>
    </PlatformPageLayout>
  );
}
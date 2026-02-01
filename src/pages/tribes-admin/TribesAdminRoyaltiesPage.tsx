import { CreditCard } from "lucide-react";

import {
  AppPageHeader,
  AppPageContainer,
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
    <AppPageContainer maxWidth="xl">
      <AppPageHeader
        eyebrow="Tribes Admin"
        title="Royalties"
        description="Royalty payments and distributions"
        backLink={{ to: "/tribes-admin", label: "Dashboard" }}
      />

      <AppSection spacing="md">
        <div className="flex items-center justify-center min-h-[400px]">
          <AppEmptyState
            customIcon={<CreditCard className="h-8 w-8" />}
            message="Royalty payments powered by Trolley — integration coming soon"
            size="lg"
          />
        </div>
      </AppSection>
    </AppPageContainer>
  );
}

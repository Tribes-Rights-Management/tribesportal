import { useNavigate } from "react-router-dom";

import {
  AppPageHeader,
  AppPageContainer,
  AppSection,
  AppListCard,
  AppListRow,
} from "@/components/app-ui";

/**
 * TRIBES ADMIN SETTINGS PAGE
 * 
 * Settings hub with links to account settings.
 */

export default function TribesAdminSettingsPage() {
  const navigate = useNavigate();

  return (
    <AppPageContainer maxWidth="lg">
      <AppPageHeader
        eyebrow="Tribes Admin"
        title="Settings"
        description="Manage your account and preferences"
        backLink={{ to: "/admin", label: "Dashboard" }}
      />

      <AppSection spacing="md">
        <AppListCard title="Account">
          <AppListRow
            title="Profile"
            subtitle="Manage your personal information"
            onClick={() => navigate("/account/profile")}
            showChevron
          />
          <AppListRow
            title="Security"
            subtitle="Password and authentication settings"
            onClick={() => navigate("/account/security")}
            showChevron
          />
          <AppListRow
            title="Preferences"
            subtitle="Theme, notifications, and display options"
            onClick={() => navigate("/account/preferences")}
            showChevron
          />
        </AppListCard>
      </AppSection>
    </AppPageContainer>
  );
}

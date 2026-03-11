import { useNavigate } from "react-router-dom";

import {
  PlatformPageLayout,
  PlatformSection,
  PlatformListCard,
  PlatformListRow,
} from "@/components/platform-ui";

/**
 * TRIBES ADMIN SETTINGS PAGE
 * 
 * Settings hub with links to account settings.
 */

export default function TribesAdminSettingsPage() {
  const navigate = useNavigate();

  return (
    <PlatformPageLayout
      title="Settings"
      backLink={{ to: "/admin", label: "Dashboard" }}
    >
      <PlatformSection spacing="md">
        <PlatformListCard title="Account">
          <PlatformListRow
            title="Profile"
            subtitle="Manage your personal information"
            onClick={() => navigate("/account/profile")}
            showChevron
          />
          <PlatformListRow
            title="Security"
            subtitle="Password and authentication settings"
            onClick={() => navigate("/account/security")}
            showChevron
          />
          <PlatformListRow
            title="Preferences"
            subtitle="Theme, notifications, and display options"
            onClick={() => navigate("/account/preferences")}
            showChevron
          />
        </PlatformListCard>
      </PlatformSection>
    </PlatformPageLayout>
  );
}
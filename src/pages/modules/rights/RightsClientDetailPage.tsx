import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PlatformPageLayout, PlatformEmptyState, PlatformTableBadge } from "@/components/platform-ui";
import ClientOverviewTab from "./partials/client/ClientOverviewTab";
import ClientDocumentsTab from "./partials/client/ClientDocumentsTab";
import ClientTeamTab from "./partials/client/ClientTeamTab";
import ClientSettingsTab from "./partials/client/ClientSettingsTab";

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "documents", label: "Documents" },
  { key: "team", label: "Team" },
  { key: "settings", label: "Settings" },
];

const statusVariant: Record<string, "default" | "warning"> = {
  active: "default",
  suspended: "warning",
};

export default function RightsClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: client, isLoading } = useQuery({
    queryKey: ["client-detail", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_accounts")
        .select("*")
        .eq("id", clientId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });

  if (isLoading) {
    return (
      <PlatformPageLayout title="Loading..." backLink={{ to: "/rights/clients", label: "Back to Clients" }}>
        <PlatformEmptyState message="Loading client details..." size="lg" />
      </PlatformPageLayout>
    );
  }

  if (!client) {
    return (
      <PlatformPageLayout title="Client Not Found" backLink={{ to: "/rights/clients", label: "Back to Clients" }}>
        <PlatformEmptyState message="Client not found" description="This client may have been removed." size="lg" />
      </PlatformPageLayout>
    );
  }

  return (
    <PlatformPageLayout
      title={client.name}
      backLink={{ to: "/rights/clients", label: "Back to Clients" }}
    >
      {/* Status + email bar */}
      <div className="flex items-center gap-3 mb-6">
        <PlatformTableBadge variant={statusVariant[client.status] || "default"}>
          {client.status}
        </PlatformTableBadge>
        {client.primary_email && (
          <span className="text-sm text-muted-foreground">{client.primary_email}</span>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-[var(--border-subtle)] mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === tab.key
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1F2937] rounded-t" />
            )}
          </button>
        ))}
      </div>

      {activeTab === "overview" && <ClientOverviewTab client={client} />}
      {activeTab === "documents" && <ClientDocumentsTab clientId={client.id} />}
      {activeTab === "team" && <ClientTeamTab clientId={client.id} />}
      {activeTab === "settings" && <ClientSettingsTab client={client} />}
    </PlatformPageLayout>
  );
}
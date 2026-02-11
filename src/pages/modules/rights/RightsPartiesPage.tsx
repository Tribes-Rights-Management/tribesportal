import { useSearchParams } from "react-router-dom";
import { AppPageContainer, AppPageHeader } from "@/components/app-ui";
import WritersTabContent from "./partials/WritersTabContent";
import PublishersTabContent from "./partials/PublishersTabContent";
import DealsTabContent from "./partials/DealsTabContent";

const tabs = [
  { key: "writers", label: "Writers" },
  { key: "publishers", label: "Publishers" },
  { key: "deals", label: "Deals" },
];

export default function RightsPartiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "writers";

  return (
    <AppPageContainer>
      <AppPageHeader title="Parties" />

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border mt-2 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSearchParams({ tab: tab.key })}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === tab.key
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground rounded-t" />
            )}
          </button>
        ))}
      </div>

      {activeTab === "writers" && <WritersTabContent />}
      {activeTab === "publishers" && <PublishersTabContent />}
      {activeTab === "deals" && <DealsTabContent />}
    </AppPageContainer>
  );
}

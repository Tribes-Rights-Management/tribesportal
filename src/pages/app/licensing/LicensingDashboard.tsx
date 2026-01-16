import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { StatusIndicator } from "@/components/app/StatusIndicator";
import { DASHBOARD_LABELS } from "@/styles/tokens";

/**
 * LICENSING DASHBOARD — STATUS VIEW
 * 
 * Dashboard Rules:
 * - Status over summary
 * - Show counts, states, alerts
 * - No charts for storytelling
 * - No KPIs as motivation
 * - Communicate operational state, not performance
 */
export default function LicensingDashboard() {
  const { activeTenant } = useAuth();

  return (
    <div className="p-6 max-w-5xl">
      <PageHeader 
        title="Licensing"
        description={activeTenant?.tenant_name}
      />

      {/* Status indicators - operational state */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <StatusIndicator 
          label={DASHBOARD_LABELS.ACTIVE_LICENSES} 
          count={0} 
        />
        <StatusIndicator 
          label={DASHBOARD_LABELS.PENDING_REQUESTS} 
          count={0}
          level="warning"
        />
        <StatusIndicator 
          label={DASHBOARD_LABELS.LICENSING_HOLDS} 
          count={0}
        />
        <StatusIndicator 
          label={DASHBOARD_LABELS.CATALOG_ITEMS} 
          count={0}
        />
      </div>

      {/* Operational alerts - flat, text-only */}
      <div className="mt-6 bg-white border border-[#E8E8E8] rounded-md">
        <div className="px-4 py-3 border-b border-[#E8E8E8]">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#6B6B6B]">
            {DASHBOARD_LABELS.REQUIRES_ACTION}
          </h2>
        </div>
        <div className="px-4 py-4">
          <p className="text-[13px] text-[#6B6B6B]">
            No items require action.
          </p>
        </div>
      </div>
    </div>
  );
}

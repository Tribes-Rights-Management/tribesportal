import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { StatusIndicator } from "@/components/app/StatusIndicator";
import { DASHBOARD_LABELS } from "@/styles/tokens";

/**
 * PUBLISHING DASHBOARD — INSTITUTIONAL STATUS VIEW
 * 
 * Dashboard Rules:
 * - Status over summary
 * - Show counts, states, alerts
 * - No charts for storytelling
 * - No KPIs as motivation
 * - Communicate operational state, not performance
 * - Dark theme using platform tokens
 */
export default function PublishingDashboard() {
  const { activeTenant } = useAuth();

  return (
    <div 
      className="p-6"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <div className="max-w-[960px]">
        <PageHeader 
          title="Publishing"
          description={activeTenant?.tenant_name}
        />

        {/* Status indicators - operational state */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatusIndicator 
            label={DASHBOARD_LABELS.TOTAL_WORKS} 
            count={0} 
          />
          <StatusIndicator 
            label={DASHBOARD_LABELS.UNREGISTERED_WORKS} 
            count={0}
            level="warning"
          />
          <StatusIndicator 
            label={DASHBOARD_LABELS.PENDING_REGISTRATIONS} 
            count={0}
          />
          <StatusIndicator 
            label={DASHBOARD_LABELS.PENDING_DOCUMENTATION} 
            count={0}
          />
        </div>

        {/* Operational alerts - flat, text-only */}
        <div 
          className="mt-6 rounded"
          style={{ 
            backgroundColor: 'var(--platform-surface)',
            border: '1px solid var(--platform-border)'
          }}
        >
          <div 
            className="px-4 py-3"
            style={{ borderBottom: '1px solid var(--platform-border)' }}
          >
            <h2 
              className="text-[11px] font-medium uppercase tracking-[0.04em]"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              {DASHBOARD_LABELS.REQUIRES_ACTION}
            </h2>
          </div>
          <div className="px-4 py-4">
            <p 
              className="text-[13px]"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              No items require action.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

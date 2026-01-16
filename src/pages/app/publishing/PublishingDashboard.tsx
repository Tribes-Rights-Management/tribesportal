import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/panel";

/**
 * Publishing Dashboard - Institutional mode
 * 
 * DESIGN: Dense, functional, no decoration
 */
export default function PublishingDashboard() {
  const { activeTenant } = useAuth();

  return (
    <div className="p-6 max-w-5xl">
      <PageHeader 
        title="Publishing"
        description={activeTenant?.tenant_name}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Works" value={0} />
        <StatCard label="Pending Registrations" value={0} />
        <StatCard label="Statements" value={0} />
      </div>

      <div className="mt-6 bg-white border border-[#E8E8E8] rounded-md p-4">
        <h2 className="text-[14px] font-medium text-[#111]">Recent Activity</h2>
        <p className="mt-3 text-[13px] text-[#6B6B6B]">
          No records available.
        </p>
      </div>
    </div>
  );
}

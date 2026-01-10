import { useAuth } from "@/contexts/AuthContext";

export default function LicensingDashboard() {
  const { activeTenant, profile } = useAuth();

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-[24px] font-medium text-[#0A0A0A] tracking-[-0.02em]">
          Licensing Dashboard
        </h1>
        <p className="mt-2 text-[15px] text-[#71717A]">
          {activeTenant?.tenant_name} — Licensing Portal
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 border border-[#E4E4E7] rounded-lg bg-white">
          <p className="text-[13px] text-[#71717A] font-medium uppercase tracking-wide">
            Active Requests
          </p>
          <p className="mt-2 text-[32px] font-medium text-[#0A0A0A]">0</p>
        </div>
        <div className="p-6 border border-[#E4E4E7] rounded-lg bg-white">
          <p className="text-[13px] text-[#71717A] font-medium uppercase tracking-wide">
            Pending Licenses
          </p>
          <p className="mt-2 text-[32px] font-medium text-[#0A0A0A]">0</p>
        </div>
        <div className="p-6 border border-[#E4E4E7] rounded-lg bg-white">
          <p className="text-[13px] text-[#71717A] font-medium uppercase tracking-wide">
            Catalog Items
          </p>
          <p className="mt-2 text-[32px] font-medium text-[#0A0A0A]">0</p>
        </div>
      </div>

      <div className="mt-8 p-6 border border-[#E4E4E7] rounded-lg bg-[#FAFAFA]">
        <h2 className="text-[15px] font-medium text-[#0A0A0A]">Recent Activity</h2>
        <p className="mt-4 text-[13px] text-[#71717A]">
          No recent activity to display.
        </p>
      </div>
    </div>
  );
}

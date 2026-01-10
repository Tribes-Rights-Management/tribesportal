import { useAuth } from "@/contexts/AuthContext";

export default function PublishingSettings() {
  const { profile, activeTenant } = useAuth();

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-[24px] font-medium text-[#0A0A0A] tracking-[-0.02em]">
          Settings
        </h1>
        <p className="mt-2 text-[15px] text-[#71717A]">
          Publishing portal preferences and configuration.
        </p>
      </div>

      <div className="space-y-6">
        <div className="p-6 border border-[#E4E4E7] rounded-lg bg-white">
          <h2 className="text-[15px] font-medium text-[#0A0A0A]">Account</h2>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-[13px]">
              <span className="text-[#71717A]">Email</span>
              <span className="text-[#0A0A0A]">{profile?.email}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[#71717A]">Organization</span>
              <span className="text-[#0A0A0A]">{activeTenant?.tenant_name}</span>
            </div>
          </div>
        </div>

        <div className="p-6 border border-[#E4E4E7] rounded-lg bg-[#FAFAFA]">
          <p className="text-[13px] text-[#71717A]">
            Additional settings will be available here.
          </p>
        </div>
      </div>
    </div>
  );
}

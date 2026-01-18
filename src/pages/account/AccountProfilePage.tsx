import { useAuth } from "@/contexts/AuthContext";
import { DetailRow, DetailRowGroup } from "@/components/ui/detail-row";

/**
 * ACCOUNT PROFILE PAGE
 * 
 * Route: /account/profile
 * 
 * Shows identity and organizational association.
 * Read-only fields if managed by organization policy.
 */

function SectionPanel({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div 
      className={`rounded overflow-hidden ${className}`}
      style={{ 
        backgroundColor: 'var(--platform-surface)',
        border: '1px solid var(--platform-border)'
      }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div 
      className="px-4 py-4 sm:px-6"
      style={{ borderBottom: '1px solid var(--platform-border)' }}
    >
      <h2 
        className="text-[15px] font-medium"
        style={{ color: 'var(--platform-text)' }}
      >
        {title}
      </h2>
      <p 
        className="text-[13px] mt-0.5"
        style={{ color: 'var(--platform-text-secondary)' }}
      >
        {description}
      </p>
    </div>
  );
}

export default function AccountProfilePage() {
  const { profile, activeTenant } = useAuth();

  // Derive role display
  const roleDisplay = profile?.platform_role === 'platform_admin' 
    ? 'Platform Administrator' 
    : 'User';

  return (
    <div 
      className="py-6 md:py-10 px-4 md:px-6"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <div className="max-w-[800px]">
        {/* Header */}
        <div className="mb-6 md:mb-10">
          <h1 
            className="text-[22px] md:text-[28px] font-semibold tracking-[-0.02em]"
            style={{ color: 'var(--platform-text)' }}
          >
            Profile
          </h1>
          <p 
            className="text-[14px] md:text-[15px] mt-0.5"
            style={{ color: 'var(--platform-text-secondary)' }}
          >
            Identity and workspace association
          </p>
        </div>

        {/* Profile Information */}
        <SectionPanel>
          <SectionHeader 
            title="Profile Information" 
            description="Your identity and access details"
          />
          <DetailRowGroup>
            <DetailRow 
              label="Full name" 
              value={profile?.full_name} 
            />
            <DetailRow 
              label="Email address" 
              value={profile?.email} 
              copyable
              helpText="Managed by workspace policy"
            />
            <DetailRow 
              label="Role" 
              value={roleDisplay} 
              variant="role"
              helpText="Managed by workspace policy"
            />
            <DetailRow 
              label="Workspace" 
              value={activeTenant?.tenant_name} 
              helpText="Managed by workspace policy"
            />
          </DetailRowGroup>
        </SectionPanel>

        {/* Footer notice */}
        <p 
          className="mt-4 md:mt-6 text-[12px] md:text-[13px]"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          Profile information is governed by workspace policies. 
          Contact your administrator for access-related changes.
        </p>
      </div>
    </div>
  );
}

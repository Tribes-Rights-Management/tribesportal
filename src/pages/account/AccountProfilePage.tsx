import { useAuth } from "@/contexts/AuthContext";

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
      className="px-6 py-4"
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

function DataRow({ 
  label, 
  value, 
  managed = false 
}: { 
  label: string; 
  value: string | null | undefined; 
  managed?: boolean;
}) {
  return (
    <div 
      className="px-6 py-3 flex items-start justify-between gap-4"
      style={{ borderBottom: '1px solid var(--platform-border)' }}
    >
      <dt 
        className="text-[13px] shrink-0"
        style={{ color: 'var(--platform-text-secondary)' }}
      >
        {label}
      </dt>
      <dd className="text-right min-w-0 flex-1">
        <span 
          className="text-[13px] break-words"
          style={{ color: 'var(--platform-text)', lineHeight: '1.45' }}
        >
          {value || "—"}
        </span>
        {managed && (
          <span 
            className="block text-[11px] mt-0.5"
            style={{ color: 'var(--platform-text-muted)', lineHeight: '1.45' }}
          >
            Managed by workspace policy
          </span>
        )}
      </dd>
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
      className="py-10 px-6"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <div className="max-w-[800px] mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 
            className="text-[28px] font-semibold tracking-[-0.02em]"
            style={{ color: 'var(--platform-text)' }}
          >
            Profile
          </h1>
          <p 
            className="text-[15px] mt-0.5"
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
          <dl>
            <DataRow label="Full name" value={profile?.full_name} />
            <DataRow label="Email address" value={profile?.email} managed />
            <DataRow label="Role" value={roleDisplay} managed />
            <DataRow label="Workspace" value={activeTenant?.tenant_name} managed />
          </dl>
        </SectionPanel>

        {/* Footer notice */}
        <p 
          className="mt-6 text-[13px]"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          Profile information is governed by workspace policies. 
          Contact your administrator for access-related changes.
        </p>
      </div>
    </div>
  );
}

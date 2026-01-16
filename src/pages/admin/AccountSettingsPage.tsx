import { ArrowLeft, Monitor, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * ACCOUNT SETTINGS PAGE — INSTITUTIONAL GOVERNANCE SURFACE
 * 
 * Design Rules:
 * - Real page, never a 404
 * - Graceful degradation over error states
 * - Functional sections only (no placeholders, no "Coming Soon")
 * - Institutional, restrained styling
 * - Read-only organizational data where applicable
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
            Managed by organization policy
          </span>
        )}
      </dd>
    </div>
  );
}

export default function AccountSettingsPage() {
  const { profile, activeTenant } = useAuth();

  // Derive role display
  const roleDisplay = profile?.platform_role === 'platform_admin' 
    ? 'Platform Administrator' 
    : 'User';

  return (
    <div 
      className="min-h-full py-10 px-6"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <div className="max-w-[800px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <Link 
            to="/admin" 
            className="h-8 w-8 rounded flex items-center justify-center transition-colors"
            style={{ color: 'var(--platform-text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 
              className="text-[28px] font-semibold tracking-[-0.02em]"
              style={{ color: 'var(--platform-text)' }}
            >
              Account Settings
            </h1>
            <p 
              className="text-[15px] mt-0.5"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              Profile, preferences, and security configuration
            </p>
          </div>
        </div>

        {/* Profile Information */}
        <SectionPanel className="mb-6">
          <SectionHeader 
            title="Profile Information" 
            description="Identity and organizational association"
          />
          <dl>
            <DataRow label="Full name" value={profile?.full_name} />
            <DataRow label="Email address" value={profile?.email} managed />
            <DataRow label="Role" value={roleDisplay} managed />
            <DataRow label="Organization" value={activeTenant?.tenant_name} managed />
          </dl>
        </SectionPanel>

        {/* Security */}
        <SectionPanel className="mb-6">
          <SectionHeader 
            title="Security" 
            description="Authentication and session management"
          />
          <div className="px-6 py-4">
            <div className="flex items-start gap-3 mb-4">
              <div 
                className="h-8 w-8 rounded flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                <Monitor className="h-4 w-4" style={{ color: 'var(--platform-text-secondary)' }} />
              </div>
              <div>
                <p 
                  className="text-[13px] font-medium"
                  style={{ color: 'var(--platform-text)' }}
                >
                  Authentication method
                </p>
                <p 
                  className="text-[13px] mt-0.5"
                  style={{ color: 'var(--platform-text-secondary)' }}
                >
                  Magic Link (email verification)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div 
                className="h-8 w-8 rounded flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                <Clock className="h-4 w-4" style={{ color: 'var(--platform-text-secondary)' }} />
              </div>
              <div>
                <p 
                  className="text-[13px] font-medium"
                  style={{ color: 'var(--platform-text)' }}
                >
                  Session status
                </p>
                <p 
                  className="text-[13px] mt-0.5"
                  style={{ color: 'var(--platform-text-secondary)' }}
                >
                  Active session on this device
                </p>
              </div>
            </div>
          </div>
        </SectionPanel>

        {/* Preferences */}
        <SectionPanel>
          <SectionHeader 
            title="Preferences" 
            description="Operational settings"
          />
          <dl>
            <DataRow label="Time zone" value="System default (auto-detected)" />
            <DataRow label="Date format" value="ISO 8601 (YYYY-MM-DD)" />
            <DataRow label="Notifications" value="Email notifications enabled" />
          </dl>
        </SectionPanel>

        {/* Footer notice */}
        <p 
          className="mt-6 text-[13px]"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          Account configuration is governed by organizational policies. 
          Contact your administrator for access-related changes.
        </p>
      </div>
    </div>
  );
}

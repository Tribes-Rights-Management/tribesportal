import { useAuth } from "@/contexts/AuthContext";
import { Monitor, Clock, KeyRound, ShieldCheck } from "lucide-react";

/**
 * ACCOUNT SECURITY PAGE
 * 
 * Route: /account/security
 * 
 * Authentication and session management.
 * Session list, sign out controls, security status.
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

function SecurityRow({ 
  icon: Icon, 
  title, 
  description,
  status
}: { 
  icon: React.ElementType;
  title: string;
  description: string;
  status?: string;
}) {
  return (
    <div 
      className="px-6 py-4 flex items-start gap-3"
      style={{ borderBottom: '1px solid var(--platform-border)' }}
    >
      <div 
        className="h-8 w-8 rounded flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      >
        <Icon className="h-4 w-4" style={{ color: 'var(--platform-text-secondary)' }} />
      </div>
      <div className="flex-1">
        <p 
          className="text-[13px] font-medium"
          style={{ color: 'var(--platform-text)' }}
        >
          {title}
        </p>
        <p 
          className="text-[13px] mt-0.5"
          style={{ color: 'var(--platform-text-secondary)' }}
        >
          {description}
        </p>
      </div>
      {status && (
        <span 
          className="text-[12px] px-2 py-1 rounded shrink-0"
          style={{ 
            backgroundColor: 'rgba(255,255,255,0.05)',
            color: 'var(--platform-text-muted)'
          }}
        >
          {status}
        </span>
      )}
    </div>
  );
}

export default function AccountSecurityPage() {
  const { signOut } = useAuth();

  const handleSignOutAll = async () => {
    await signOut();
    window.location.href = "/auth/sign-in";
  };

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
            Security
          </h1>
          <p 
            className="text-[14px] md:text-[15px] mt-0.5"
            style={{ color: 'var(--platform-text-secondary)' }}
          >
            Authentication and session management
          </p>
        </div>

        {/* Authentication Method */}
        <SectionPanel className="mb-4 md:mb-6">
          <SectionHeader 
            title="Authentication" 
            description="How you sign in to the platform"
          />
          <SecurityRow 
            icon={KeyRound}
            title="Magic Link"
            description="Authentication is performed via secure email verification."
            status="Active"
          />
          <SecurityRow 
            icon={ShieldCheck}
            title="Two-Factor Authentication"
            description="Additional security layer for account access."
            status="Not configured"
          />
        </SectionPanel>

        {/* Active Sessions */}
        <SectionPanel className="mb-4 md:mb-6">
          <SectionHeader 
            title="Sessions" 
            description="Active sessions across devices"
          />
          <SecurityRow 
            icon={Monitor}
            title="Current session"
            description="This device is currently active."
            status="Active"
          />
          <SecurityRow 
            icon={Clock}
            title="Session status"
            description="Your session will remain active until you sign out."
          />
        </SectionPanel>

        {/* Session Actions */}
        <SectionPanel>
          <SectionHeader 
            title="Session Actions" 
            description="Manage your active sessions"
          />
          <div className="px-4 md:px-6 py-4">
            <button
              onClick={handleSignOutAll}
              className="text-[13px] font-medium px-4 py-2.5 rounded transition-colors min-h-[44px]"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'var(--platform-text)',
                border: '1px solid var(--platform-border)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
              }}
            >
              Sign out all sessions
            </button>
            <p 
              className="text-[12px] mt-3"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              This will sign you out from all devices and require re-authentication.
            </p>
          </div>
        </SectionPanel>

        {/* Footer notice */}
        <p 
          className="mt-4 md:mt-6 text-[12px] md:text-[13px]"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          Security settings are managed at the platform level. 
          Contact your administrator for policy changes.
        </p>
      </div>
    </div>
  );
}

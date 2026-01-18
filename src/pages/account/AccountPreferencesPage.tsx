import { Bell, Globe, Calendar } from "lucide-react";

/**
 * ACCOUNT PREFERENCES PAGE
 * 
 * Route: /account/preferences
 * 
 * Operational settings: notifications, timezone, date format.
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

function PreferenceRow({ 
  icon: Icon, 
  title, 
  value
}: { 
  icon: React.ElementType;
  title: string;
  value: string;
}) {
  return (
    <div 
      className="px-6 py-4 flex items-center justify-between gap-4"
      style={{ borderBottom: '1px solid var(--platform-border)' }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="h-8 w-8 rounded flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
        >
          <Icon className="h-4 w-4" style={{ color: 'var(--platform-text-secondary)' }} />
        </div>
        <span 
          className="text-[13px] font-medium"
          style={{ color: 'var(--platform-text)' }}
        >
          {title}
        </span>
      </div>
      <span 
        className="text-[13px]"
        style={{ color: 'var(--platform-text-secondary)' }}
      >
        {value}
      </span>
    </div>
  );
}

export default function AccountPreferencesPage() {
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
            Preferences
          </h1>
          <p 
            className="text-[14px] md:text-[15px] mt-0.5"
            style={{ color: 'var(--platform-text-secondary)' }}
          >
            Operational settings and display options
          </p>
        </div>

        {/* Notifications */}
        <SectionPanel className="mb-4 md:mb-6">
          <SectionHeader 
            title="Notifications" 
            description="How you receive updates"
          />
          <PreferenceRow 
            icon={Bell}
            title="Email notifications"
            value="Enabled"
          />
        </SectionPanel>

        {/* Regional */}
        <SectionPanel>
          <SectionHeader 
            title="Regional" 
            description="Time and date display"
          />
          <PreferenceRow 
            icon={Globe}
            title="Time zone"
            value="System default (auto-detected)"
          />
          <PreferenceRow 
            icon={Calendar}
            title="Date format"
            value="ISO 8601 (YYYY-MM-DD)"
          />
        </SectionPanel>

        {/* Footer notice */}
        <p 
          className="mt-4 md:mt-6 text-[12px] md:text-[13px]"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          Some preferences may be governed by workspace policies.
        </p>
      </div>
    </div>
  );
}

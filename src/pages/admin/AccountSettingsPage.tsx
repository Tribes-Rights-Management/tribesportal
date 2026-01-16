import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * ACCOUNT SETTINGS PAGE — INSTITUTIONAL PLACEHOLDER
 * 
 * Design Rules:
 * - Real page, never a 404
 * - Graceful degradation over error states
 * - Disabled sections with "Coming soon" labels
 * - Institutional, restrained styling
 */
export default function AccountSettingsPage() {
  const sections = [
    {
      title: "Profile Information",
      description: "Name, email, and contact details",
      available: false,
    },
    {
      title: "Security",
      description: "Password, two-factor authentication, and session management",
      available: false,
    },
    {
      title: "Preferences",
      description: "Notification settings and display options",
      available: false,
    },
    {
      title: "Connected Accounts",
      description: "Linked authentication providers and integrations",
      available: false,
    },
  ];

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

        {/* Settings Sections */}
        <div 
          className="rounded overflow-hidden"
          style={{ 
            backgroundColor: 'var(--platform-surface)',
            border: '1px solid var(--platform-border)'
          }}
        >
          {sections.map((section, index) => (
            <div
              key={section.title}
              className="px-6 py-5"
              style={{ 
                borderTop: index > 0 ? '1px solid var(--platform-border)' : undefined,
                opacity: section.available ? 1 : 0.6
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 
                    className="text-[15px] font-medium"
                    style={{ color: 'var(--platform-text)' }}
                  >
                    {section.title}
                  </h3>
                  <p 
                    className="text-[13px] mt-0.5"
                    style={{ color: 'var(--platform-text-secondary)' }}
                  >
                    {section.description}
                  </p>
                </div>
                {!section.available && (
                  <span 
                    className="text-[11px] font-medium uppercase tracking-[0.04em] px-2 py-1 rounded"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: 'var(--platform-text-muted)'
                    }}
                  >
                    Coming soon
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info notice */}
        <p 
          className="mt-6 text-[13px]"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          Account configuration is managed through organizational policies. 
          Contact your administrator for access-related changes.
        </p>
      </div>
    </div>
  );
}

import { PlatformLayout, InstitutionalHeader } from "@/layouts/PlatformLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { AUDIT_COPY, FOOTER_COPY } from "@/constants/institutional-copy";
import { Navigate } from "react-router-dom";

/**
 * EXTERNAL AUDITOR LANDING PAGE — READ-ONLY GOVERNANCE ACCESS
 * 
 * Purpose:
 * Allow third parties (auditors, legal counsel, acquirers) to inspect
 * records without influencing the system.
 * 
 * Permissions:
 * - View immutable activity logs
 * - View licensing records and agreements
 * - View approval history and metadata
 * - View disclosure exports once generated
 * 
 * PROHIBITED:
 * - Create, edit, approve, decline, submit, message, or export ad-hoc data
 * - Access account settings
 * - Access internal messaging
 * - Access configuration or security controls
 */

export default function AuditorLanding() {
  const { profile } = useAuth();
  const { isExternalAuditor, isPlatformAdmin } = useRoleAccess();

  // Redirect non-auditors to appropriate location
  if (!isExternalAuditor && !isPlatformAdmin) {
    return <Navigate to="/app/restricted" replace />;
  }

  return (
    <PlatformLayout maxWidth="medium">
      <InstitutionalHeader 
        title="Auditor Access"
        description="Read-only access for external review and compliance verification"
      />

      {/* Purpose Statement */}
      <section 
        className="mb-8 p-6 rounded-md"
        style={{ 
          backgroundColor: 'var(--platform-surface)',
          border: '1px solid var(--platform-border)'
        }}
      >
        <h2 
          className="text-[11px] font-medium uppercase tracking-[0.04em] mb-3"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          Access Scope
        </h2>
        <p 
          className="text-[14px] leading-relaxed"
          style={{ color: 'var(--platform-text-secondary)' }}
        >
          This access level provides read-only visibility into platform records, 
          activity logs, licensing history, and approval workflows. Data cannot be 
          modified, exported ad-hoc, or deleted through this interface.
        </p>
        <p 
          className="text-[12px] mt-4"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          {AUDIT_COPY.ACCESS_LOGGED}
        </p>
      </section>

      {/* Available Sections */}
      <section className="space-y-1">
        <h2 
          className="text-[11px] font-medium uppercase tracking-[0.04em] mb-4"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          Available Records
        </h2>

        <AuditorNavItem 
          href="/auditor/activity"
          label="Activity Log"
          description="Immutable record of all platform actions"
        />
        <AuditorNavItem 
          href="/auditor/licensing"
          label="Licensing Records"
          description="Requests, agreements, and approval history"
        />
        <AuditorNavItem 
          href="/auditor/access"
          label="Access Log"
          description="Record access and download events"
        />
        <AuditorNavItem 
          href="/auditor/chain"
          label="Correlation Chain"
          description="Trace related actions across the platform"
        />
      </section>

      {/* Auditor Identity */}
      <section 
        className="mt-10 pt-6"
        style={{ borderTop: '1px solid var(--platform-border)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p 
              className="text-[11px] font-medium uppercase tracking-[0.04em] mb-1"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              Authenticated as
            </p>
            <p 
              className="text-[14px]"
              style={{ color: 'var(--platform-text)' }}
            >
              {profile?.email ?? 'Unknown'}
            </p>
            <p 
              className="text-[12px] mt-0.5"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              External Auditor
            </p>
          </div>
          <div 
            className="px-3 py-1.5 rounded-md text-[12px] font-medium"
            style={{ 
              backgroundColor: 'hsl(var(--muted) / 0.5)',
              color: 'var(--platform-text-secondary)'
            }}
          >
            Read-Only Access
          </div>
        </div>
      </section>
    </PlatformLayout>
  );
}

function AuditorNavItem({ 
  href, 
  label, 
  description 
}: { 
  href: string; 
  label: string; 
  description: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center justify-between py-4 group"
      style={{ borderBottom: '1px solid var(--platform-border)' }}
    >
      <div>
        <p 
          className="text-[15px] font-medium group-hover:opacity-80 transition-opacity"
          style={{ color: 'var(--platform-text)' }}
        >
          {label}
        </p>
        <p 
          className="text-[13px] mt-0.5"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          {description}
        </p>
      </div>
      <svg 
        className="w-4 h-4 opacity-40 group-hover:opacity-70 transition-opacity"
        style={{ color: 'var(--platform-text)' }}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
      </svg>
    </a>
  );
}

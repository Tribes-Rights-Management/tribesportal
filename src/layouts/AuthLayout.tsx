import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * AuthLayout - Institutional Access Gateway
 * 
 * DESIGN STANDARD (AUTHORITATIVE — SECTION 2):
 * - Full-height viewport
 * - Neutral background (#F7F7F8) — not pure white, not dark
 * - Centered access panel (420px fixed width)
 * - Panel radius: 12px max
 * - Single soft shadow OR 1px border — not both
 * 
 * This is an access gateway, not a sign-in form.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div 
      className="min-h-dvh w-full flex items-center justify-center px-6 py-12"
      style={{ backgroundColor: 'var(--auth-bg)' }}
    >
      {/* Access Panel — fixed width, subtle elevation */}
      <div 
        className="w-full"
        style={{ 
          maxWidth: 'var(--auth-panel-width)',
          backgroundColor: 'var(--auth-panel-bg)',
          borderRadius: '12px',
          border: '1px solid var(--auth-panel-border)',
          padding: '40px 32px',
        }}
      >
        {children}
      </div>
    </div>
  );
}

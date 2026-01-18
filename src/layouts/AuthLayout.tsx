import { ReactNode, useEffect } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * AuthLayout — Institutional System Boundary (CANONICAL)
 * 
 * DESIGN STANDARD (NON-NEGOTIABLE):
 * - Full-bleed dark background matching marketing site
 * - NO cards, NO floating containers, NO soft shadows
 * - Content embedded in infrastructure, not placed on top
 * - Vertical composition, anchored slightly above center
 * - Left-aligned text block (not centered card)
 * 
 * This is an access threshold, not a sign-in form.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  // Prevent body scroll on auth routes
  useEffect(() => {
    document.body.classList.add("auth-no-scroll");
    return () => document.body.classList.remove("auth-no-scroll");
  }, []);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center overflow-x-clip"
      style={{ 
        // Derives from canonical tribes-theme.css tokens (LOCKED)
        backgroundColor: 'var(--tribes-bg)',
        background: 'var(--auth-canvas-gradient)',
        // Safe area aware padding
        paddingLeft: 'max(24px, env(safe-area-inset-left, 24px))',
        paddingRight: 'max(24px, env(safe-area-inset-right, 24px))',
      }}
    >
      {/* 
        Auth content container — no card, no elevation
        Width constrained, left-aligned text, embedded in dark canvas
      */}
      <div 
        className="w-full"
        style={{ 
          maxWidth: '380px',
          // Anchor slightly above center
          marginBottom: '5vh',
        }}
      >
        {children}
      </div>
    </div>
  );
}

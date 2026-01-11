import { ReactNode, useEffect } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * System-level auth layout - centered access surface
 * Premium Apple-grade: soft muted background, centered card
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  // Add/remove body class to prevent scroll on auth pages
  useEffect(() => {
    document.body.classList.add("auth-no-scroll");
    return () => {
      document.body.classList.remove("auth-no-scroll");
    };
  }, []);

  return (
    <div className="min-h-dvh h-dvh overflow-hidden flex items-center justify-center bg-muted">
      <div className="w-full max-w-[420px] px-6">
        <div className="bg-background rounded-2xl p-8 shadow-sm border border-border/50">
          {children}
        </div>
      </div>
    </div>
  );
}

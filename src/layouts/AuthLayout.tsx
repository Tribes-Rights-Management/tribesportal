import { ReactNode, useEffect } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Premium auth layout - Northwestern Mutual / Apple grade
 * Isolated from app shell - no header, no navigation
 * Uses CSS variables for light/dark theme support
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  useEffect(() => {
    document.body.classList.add("auth-no-scroll");
    return () => {
      document.body.classList.remove("auth-no-scroll");
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10 overflow-auto"
      style={{ background: "var(--bg)" }}
    >
      <div className="w-full" style={{ maxWidth: "min(440px, calc(100vw - 32px))" }}>
        <div 
          className="rounded-[18px] px-6 py-8 sm:px-8 sm:py-10"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

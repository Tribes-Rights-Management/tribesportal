import { ReactNode, useEffect } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Premium auth layout - Northwestern Mutual / Apple grade
 * Isolated from app shell - no header, no navigation
 * Light mode only - institutional aesthetic
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
      style={{ background: "#f5f5f5" }}
    >
      <div className="w-full" style={{ maxWidth: "min(440px, calc(100vw - 32px))" }}>
        <div 
          className="rounded-[18px] px-6 py-8 sm:px-8 sm:py-10"
          style={{
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.10)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

import { ReactNode, useEffect } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * AuthLayout - Institutional-grade auth shell
 * Light mode only. No header, no navigation.
 * 
 * LOCKED DESIGN TOKENS:
 * - Background: #F5F5F7
 * - Card: max-width 420px, radius 20px, white bg, border #E5E5EA, soft shadow
 * - Card padding: 32px desktop / 24px mobile
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
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-auto"
      style={{ background: "#F5F5F7" }}
    >
      <div 
        className="w-full"
        style={{ maxWidth: "min(420px, calc(100vw - 32px))" }}
      >
        <div 
          className="rounded-[20px] px-6 py-6 sm:px-8 sm:py-8"
          style={{
            background: "#ffffff",
            border: "1px solid #E5E5EA",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

import { ReactNode, useEffect } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Premium auth layout - Apple/Northwestern Mutual grade
 * Isolated from app shell - no header, no navigation
 * Light mode only - institutional aesthetic
 * 
 * Specs:
 * - Background: #F5F5F7 (Apple gray)
 * - Card: white, 420px max, 20px radius, subtle border/shadow
 * - Inputs: 44px height, 12px radius
 * - Primary button: near-black (#111), 44px height
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
          className="rounded-[20px] px-7 py-8 sm:px-8 sm:py-10"
          style={{
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

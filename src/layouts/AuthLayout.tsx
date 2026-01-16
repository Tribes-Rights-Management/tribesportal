import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * AuthLayout - Institutional system boundary
 * 
 * DESIGN STANDARD (AUTHORITATIVE):
 * - Full-viewport dark environment
 * - NO card UI, NO SaaS containers
 * - Typography-driven, content constrained by max-width column
 * - Continuous with tribesrightsmanagement.com
 * - This is a system gate, not a welcome page
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-dvh w-full bg-[#0A0A0B] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-[380px]">
        {children}
      </div>
    </div>
  );
}

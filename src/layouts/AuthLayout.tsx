import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * System-level auth layout - centered access surface
 * Fintech-grade: no scroll, no decoration, precise centering
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen h-screen overflow-hidden flex items-center justify-center bg-white">
      <div className="w-full max-w-[420px] px-6">
        {children}
      </div>
    </div>
  );
}

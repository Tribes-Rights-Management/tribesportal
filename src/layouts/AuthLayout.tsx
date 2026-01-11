import { ReactNode, useEffect } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * System-level auth layout - centered access surface
 * Marketing site alignment: 100dvh viewport, no scroll, dead-center
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
    <div className="min-h-dvh h-dvh overflow-hidden flex items-center justify-center bg-white">
      <div className="w-full max-w-[420px] px-6">
        {children}
      </div>
    </div>
  );
}

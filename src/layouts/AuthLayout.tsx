import { ReactNode, useEffect } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * System-level auth layout - centered access surface
 * Apple-grade: soft neutral gray background (#F5F5F7), white card
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  useEffect(() => {
    document.body.classList.add("auth-no-scroll");
    return () => {
      document.body.classList.remove("auth-no-scroll");
    };
  }, []);

  return (
    <div className="min-h-dvh h-dvh overflow-hidden flex items-center justify-center bg-app-surface">
      <div className="w-full max-w-[420px] px-6">
        <div className="bg-background rounded-2xl p-8 shadow-sm border border-border/40">
          {children}
        </div>
      </div>
    </div>
  );
}

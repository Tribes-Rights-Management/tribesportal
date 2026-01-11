import { ReactNode, useEffect } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Premium auth layout - Northwestern Mutual / Apple grade
 * Neutral shell with restrained card, no vignettes or gradients
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  useEffect(() => {
    document.body.classList.add("auth-no-scroll");
    return () => {
      document.body.classList.remove("auth-no-scroll");
    };
  }, []);

  return (
    <div className="min-h-dvh h-dvh overflow-hidden flex items-center justify-center bg-[#f5f5f5] dark:bg-zinc-950 px-6 py-14">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-white/5 rounded-2xl p-8 shadow-sm dark:shadow-none border border-zinc-200 dark:border-white/10">
          {children}
        </div>
      </div>
    </div>
  );
}

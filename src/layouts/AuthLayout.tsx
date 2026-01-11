import { ReactNode, useEffect } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Premium auth layout - Northwestern Mutual / Apple grade
 * Isolated from app shell - no header, no navigation
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
    // Full viewport wrapper that paints its own background to override global dark baseline
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f5f5f5] dark:bg-[#0b0b0c] px-4 py-10 overflow-auto">
      <div className="w-full max-w-[420px]">
        {/* Card: white in light, dark neutral in dark */}
        <div 
          className="
            bg-white dark:bg-[#111214] 
            rounded-2xl 
            px-6 py-8 sm:px-8 sm:py-10
            border border-black/10 dark:border-white/10
            shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.45)]
          "
        >
          {children}
        </div>
      </div>
    </div>
  );
}

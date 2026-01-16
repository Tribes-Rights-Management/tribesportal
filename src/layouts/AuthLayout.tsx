import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * AuthLayout - Premium institutional-grade auth shell
 * 
 * LOCKED DESIGN TOKENS:
 * - Page background: #F5F5F7
 * - Card: max-w-[420px], rounded-[20px], white bg
 * - Card border: black/5
 * - Card shadow: 0_14px_40px_rgba(0,0,0,0.08)
 * - Padding: 40px desktop / 28px mobile
 * 
 * Light mode only. Centered vertically and horizontally.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-dvh w-full bg-[#F5F5F7] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px] rounded-[20px] bg-white border border-black/5 shadow-[0_14px_40px_rgba(0,0,0,0.08)] px-7 py-9 sm:px-10 sm:py-10">
        {children}
      </div>
    </div>
  );
}

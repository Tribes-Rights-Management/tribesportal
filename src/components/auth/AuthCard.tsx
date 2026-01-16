import React from "react";

/**
 * AuthCard - Premium institutional-grade auth card shell
 * 
 * LOCKED DESIGN TOKENS:
 * - Max width: 420px
 * - Radius: 20px
 * - Background: white
 * - Border: subtle black/5
 * - Shadow: 0_14px_40px_rgba(0,0,0,0.08)
 * - Padding: 40px desktop / 28px mobile
 */
export function AuthCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh w-full bg-[#F5F5F7] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px] rounded-[20px] bg-white border border-black/5 shadow-[0_14px_40px_rgba(0,0,0,0.08)] px-7 py-9 sm:px-10 sm:py-10">
        {children}
      </div>
    </div>
  );
}

import React from "react";

/**
 * AuthCard - Institutional-grade auth card shell
 * 
 * LOCKED DESIGN TOKENS (INSTITUTIONAL STANDARD):
 * - Max width: 400px
 * - Radius: 14px (NOT pill-like)
 * - Background: white
 * - Border: 1px neutral gray
 * - Shadow: barely perceptible
 * - Padding: 40px
 * - Page background: #F6F6F5 (flat, neutral, receding)
 */
export function AuthCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh w-full bg-[#F6F6F5] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[400px] rounded-[14px] bg-white border border-[#E5E5E5] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-10">
        {children}
      </div>
    </div>
  );
}

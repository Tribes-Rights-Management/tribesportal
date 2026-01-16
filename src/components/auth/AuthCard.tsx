import React from "react";

/**
 * AuthCard - Institutional access terminal
 * 
 * DESIGN STANDARD (AUTHORITATIVE):
 * - Background: dark, near-black (#0A0A0A) - continuous with marketing site
 * - Panel: off-white/warm gray (#FAFAF8), NOT pure white
 * - Border: thin, understated, darker than SaaS
 * - Radius: restrained (12px) - NOT bubbly
 * - Shadow: nearly imperceptible
 * - Max width: 420px
 * - Padding: generous but disciplined
 * 
 * This is a controlled access terminal, not a signup card.
 */
export function AuthCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh w-full bg-[#0A0A0A] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px] rounded-[12px] bg-[#FAFAF8] border border-[#2A2A2A] shadow-[0_1px_2px_rgba(0,0,0,0.2)] px-10 py-10">
        {children}
      </div>
    </div>
  );
}

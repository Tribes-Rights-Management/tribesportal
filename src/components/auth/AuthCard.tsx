import React from "react";

/**
 * AuthCard - Institutional access terminal
 * 
 * DESIGN STANDARD (AUTHORITATIVE):
 * - Background: near-black charcoal (#121214) - continuous with marketing site
 * - Panel: dark elevated surface (#1C1C1F), NOT white
 * - Border: subtle dark border for separation
 * - Radius: restrained (10px) - institutional, not bubbly
 * - Shadow: subtle dark elevation
 * - Max width: 420px
 * - Padding: controlled, deliberate
 * 
 * This is a controlled access terminal, not a signup card.
 */
export function AuthCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh w-full bg-[#121214] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px] rounded-[10px] bg-[#1C1C1F] border border-[#2A2A2C] shadow-[0_8px_32px_rgba(0,0,0,0.4)] px-8 py-10">
        {children}
      </div>
    </div>
  );
}

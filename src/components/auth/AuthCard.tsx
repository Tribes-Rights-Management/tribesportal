import React from "react";

/**
 * AuthCard - Institutional dark access terminal
 * 
 * DESIGN STANDARD (AUTHORITATIVE - DARK):
 * - Background: near-black charcoal (#111214) - marketing site palette
 * - Panel: slightly lighter charcoal (#1A1A1C)
 * - Borders: muted gray, low contrast
 * - Radius: minimal (10px) - NOT bubbly
 * - Shadow: subtle depth only
 * 
 * This is a controlled access terminal, not a signup card.
 * No light mode. No theme toggle.
 */
export function AuthCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh w-full bg-[#111214] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[400px] rounded-[10px] bg-[#1A1A1C] border border-[#2A2A2C] px-10 py-10">
        {children}
      </div>
    </div>
  );
}

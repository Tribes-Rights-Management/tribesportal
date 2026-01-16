import React from "react";

/**
 * PrimaryButton - Institutional dark command button
 * 
 * DESIGN STANDARD (AUTHORITATIVE - DARK):
 * - Background: lighter charcoal when enabled, darker when disabled
 * - Text: soft light gray, perfectly centered
 * - No pill shapes, no glow, no hover theatrics
 * - Feels like a system action: deliberate, final, logged
 */
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export function PrimaryButton({ 
  className = "", 
  loading, 
  children, 
  disabled,
  ...rest 
}: Props) {
  const isDisabled = disabled || loading;
  
  return (
    <button
      {...rest}
      disabled={isDisabled}
      className={[
        "w-full h-11 rounded-lg",
        "inline-flex items-center justify-center",
        "px-6",
        "text-[15px] font-medium tracking-[-0.01em]",
        isDisabled 
          ? "bg-[#2A2A2C] text-[#555] cursor-not-allowed" 
          : "bg-[#E8E8E6] text-[#111214] hover:bg-[#D8D8D6]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8E8E6]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A1C]",
        className,
      ].join(" ")}
    >
      <span className="min-w-0 text-center whitespace-nowrap">
        {loading ? "Please wait…" : children}
      </span>
    </button>
  );
}

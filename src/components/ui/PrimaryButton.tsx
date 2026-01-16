import React from "react";

/**
 * PrimaryButton - Bulletproof premium button
 * 
 * LOCKED SPECS:
 * - Height: 44px (h-11)
 * - Radius: 12px
 * - Background: #111 (near-black)
 * - Label: ALWAYS centered via flex + justify-center
 * - Padding: px-5 minimum (prevents edge-touching)
 * - Focus: subtle ring-black/20
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
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={[
        "w-full h-11 rounded-[12px]",
        "bg-[#111] text-white",
        "inline-flex items-center justify-center",
        "px-5",
        "text-[15px] font-medium",
        "shadow-[0_1px_0_rgba(0,0,0,0.25)]",
        "hover:bg-black active:bg-[#0B0B0B]",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F5F7]",
        "transition-colors duration-150",
        className,
      ].join(" ")}
    >
      <span className="min-w-0 text-center whitespace-nowrap">
        {loading ? "Please wait…" : children}
      </span>
    </button>
  );
}

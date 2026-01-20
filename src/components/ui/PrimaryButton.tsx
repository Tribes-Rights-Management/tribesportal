import React from "react";
import { Loader2 } from "lucide-react";

/**
 * PRIMARY BUTTON — INSTITUTIONAL DESIGN (LOCKED)
 * 
 * Border-based, monochromatic, sophisticated.
 * White border on transparent background.
 * Think: Financial terminal, not SaaS dashboard.
 */

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingText?: string;
  minWidth?: string;
};

export function PrimaryButton({
  className = "",
  loading,
  loadingText = "Processing",
  minWidth,
  children,
  disabled,
  ...rest
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        h-11 px-5 text-[14px] font-medium tracking-[0.01em]
        rounded-[6px] whitespace-nowrap select-none
        transition-all duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2
        ${isDisabled ? "opacity-40 cursor-not-allowed" : "hover:bg-white/[0.08] active:bg-white/[0.12]"}
        ${className}
      `}
      style={{
        backgroundColor: "transparent",
        border: "1px solid #FFFFFF",
        color: "#FFFFFF",
        minWidth,
      }}
      disabled={isDisabled}
      aria-busy={loading}
      {...rest}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
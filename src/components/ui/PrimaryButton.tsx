import React from "react";
import { Loader2 } from "lucide-react";

/**
 * PrimaryButton - Institutional command button (System Console)
 * 
 * DESIGN STANDARD (AUTHORITATIVE):
 * - Background: elevated dark surface (#252528 enabled), muted (#1E1E20 disabled)
 * - Border: subtle 1px (rgba(255,255,255,0.10))
 * - Text: high-contrast (#E8E8E6 enabled), muted (#6B6B6B disabled)
 * - Height: 44px
 * - Radius: 12px - institutional
 * - Padding: generous horizontal
 * - NO gradient, NO glow, NO animation except spinner
 * 
 * Tone: Executing an instruction, not requesting permission.
 */
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingText?: string;
  /** Fixed minimum width to prevent layout shift between states */
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
      {...rest}
      disabled={isDisabled}
      aria-busy={loading}
      className={[
        "h-11 rounded-xl",
        "inline-flex items-center justify-center gap-2",
        "px-5",
        "text-[14px] font-medium tracking-[-0.01em]",
        isDisabled 
          ? "cursor-not-allowed" 
          : "hover:brightness-110 active:brightness-95",
        "transition-all duration-100",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1C1C1F]",
        className,
      ].join(" ")}
      style={{ 
        backgroundColor: isDisabled ? '#1E1E20' : '#252528',
        border: `1px solid ${isDisabled ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.10)'}`,
        color: isDisabled ? '#6B6B6B' : '#E8E8E6',
        minWidth: minWidth,
      }}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'inherit' }} />
          <span className="whitespace-nowrap">{loadingText}</span>
        </>
      ) : (
        <span className="inline-flex items-center gap-2 whitespace-nowrap">
          {children}
        </span>
      )}
    </button>
  );
}
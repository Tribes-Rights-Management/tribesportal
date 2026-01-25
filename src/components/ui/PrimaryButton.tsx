import React from "react";
import { Loader2 } from "lucide-react";
import { Button, ButtonProps } from "./button";
import { cn } from "@/lib/utils";

/**
 * PRIMARY BUTTON — INSTITUTIONAL DESIGN (LOCKED)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * MERCURY/STRIPE-LIKE NEUTRAL BUTTON (NO BLACK FILLS)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Wrapper around the unified Button component.
 * Uses variant="default" which is now neutral grey (not black).
 */

type Props = Omit<ButtonProps, 'variant'> & {
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
  style,
  ...rest
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Button
      variant="default"
      className={cn(className)}
      style={{ minWidth, ...style }}
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
    </Button>
  );
}

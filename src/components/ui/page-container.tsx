import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * CANONICAL PAGE CONTAINER — OVERFLOW-PROOF LAYOUT PRIMITIVE
 * 
 * All page content MUST be wrapped in this container to prevent horizontal overflow.
 * 
 * Features:
 * - Width clamped to 100% (never 100vw)
 * - Safe-area-aware padding
 * - Optional max-width constraints
 * - Flex-child overflow protection (min-w-0)
 * 
 * Usage:
 * <PageContainer>
 *   <YourPageContent />
 * </PageContainer>
 */

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum content width */
  maxWidth?: "narrow" | "medium" | "wide" | "full";
  /** Horizontal padding variant */
  padding?: "default" | "compact" | "none";
  /** Whether to apply safe area insets */
  safeArea?: boolean;
  /** Additional wrapper for scroll reset */
  scrollRef?: React.RefObject<HTMLDivElement>;
}

const maxWidthMap = {
  narrow: "640px",
  medium: "800px",
  wide: "960px",
  full: "100%",
} as const;

export function PageContainer({
  children,
  maxWidth = "wide",
  padding = "default",
  safeArea = true,
  scrollRef,
  className,
  style,
  ...props
}: PageContainerProps) {
  const paddingStyles = React.useMemo(() => {
    if (padding === "none") return {};
    
    const base = padding === "compact" ? "12px" : "16px";
    
    if (safeArea) {
      return {
        paddingLeft: `max(${base}, env(safe-area-inset-left, ${base}))`,
        paddingRight: `max(${base}, env(safe-area-inset-right, ${base}))`,
      };
    }
    
    return {
      paddingLeft: base,
      paddingRight: base,
    };
  }, [padding, safeArea]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        // Core overflow protection
        "w-full max-w-full",
        // Flex child protection
        "min-w-0",
        className
      )}
      style={{
        ...paddingStyles,
        ...style,
      }}
      {...props}
    >
      <div
        className="w-full min-w-0"
        style={{
          maxWidth: maxWidthMap[maxWidth],
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * FLEX ROW CONTAINER — Prevents long content from pushing width
 * 
 * Use this for any horizontal layout containing text (emails, IDs, descriptions).
 * Automatically applies min-w-0 to prevent flex overflow.
 */
interface FlexRowProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: number;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
}

export function FlexRow({
  children,
  gap = 3,
  align = "center",
  justify = "start",
  className,
  ...props
}: FlexRowProps) {
  const alignMap = {
    start: "items-start",
    center: "items-center", 
    end: "items-end",
    stretch: "items-stretch",
  };
  
  const justifyMap = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
  };

  return (
    <div
      className={cn(
        "flex min-w-0 w-full",
        alignMap[align],
        justifyMap[justify],
        `gap-${gap}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * TEXT CONTAINER — Ensures text wraps properly without overflow
 * 
 * Use for any text that might be long (emails, descriptions, IDs).
 * Provides proper word-breaking and optional truncation.
 */
interface TextContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Truncate to single line with ellipsis */
  truncate?: boolean;
  /** Maximum lines before truncation (requires truncate=false) */
  maxLines?: number;
}

export function TextContainer({
  children,
  truncate = false,
  maxLines,
  className,
  style,
  ...props
}: TextContainerProps) {
  const textStyles: React.CSSProperties = {
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    hyphens: "auto",
    ...style,
  };

  if (truncate) {
    return (
      <div
        className={cn("min-w-0 truncate", className)}
        style={textStyles}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (maxLines) {
    return (
      <div
        className={cn("min-w-0", className)}
        style={{
          ...textStyles,
          display: "-webkit-box",
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn("min-w-0", className)}
      style={textStyles}
      {...props}
    >
      {children}
    </div>
  );
}

export default PageContainer;

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PAGE CONTAINER — CANONICAL OVERFLOW-PROOF LAYOUT PRIMITIVE (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * All page content MUST be wrapped in this container to prevent horizontal overflow.
 *
 * IMPORTANT:
 * - This component MUST NOT implement route-based scroll resets.
 * - Scroll reset is enforced centrally at layout level via `useScrollReset`.
 *
 * FEATURES:
 * - Width clamped to 100% (never 100vw)
 * - Safe-area-aware padding (mobile Safari)
 * - Optional max-width constraints
 * - Flex-child overflow protection (min-w-0)
 *
 * RULES:
 * - Never use 100vw inside this container
 * - All children must use min-w-0 for flex layouts with text
 * - Pages must NOT define their own outer horizontal padding
 *
 * Usage:
 * <PageContainer>
 *   <PageShell title="..." />
 *   <YourPageContent />
 * </PageContainer>
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Layout variant: settings enforces a 720px content column within a 1120px shell. */
  variant?: "standard" | "settings";
  /** Maximum content width (standard variant only) */
  maxWidth?: "narrow" | "medium" | "wide" | "full";
  /** Horizontal padding variant */
  padding?: "default" | "compact" | "none";
  /** Whether to apply safe area insets */
  safeArea?: boolean;
}

const maxWidthMap = {
  // Settings / tight column
  narrow: "720px",
  // Default reading width
  medium: "960px",
  // Canonical app max width
  wide: "1120px",
  // Full bleed (still width: 100%, never 100vw)
  full: "100%",
} as const;

export function PageContainer({
  children,
  variant = "standard",
  maxWidth = "wide",
  padding = "default",
  safeArea = true,
  className,
  style,
  ...props
}: PageContainerProps) {
  const paddingStyles = React.useMemo(() => {
    if (padding === "none") return {};

    // Runtime layout contract:
    // - Mobile: 16px
    // - Tablet/Desktop: 24px
    // Defined via CSS var in index.css (single source of truth).
    const base = padding === "compact" ? "12px" : "var(--page-pad-x, 16px)";

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

  const outerMaxWidth = variant === "settings" ? maxWidthMap.wide : maxWidthMap[maxWidth];

  return (
    <div
      className={cn(
        // Core overflow protection
        "w-full max-w-full overflow-x-clip",
        // Flex child protection
        "min-w-0",
        // Fill available vertical space
        "flex-1",
        // Vertical padding
        "py-6 sm:py-10",
        className
      )}
      style={{
        backgroundColor: "var(--platform-canvas)",
        ...paddingStyles,
        ...style,
      }}
      {...props}
    >
      <div className="w-full min-w-0 mx-auto" style={{ maxWidth: outerMaxWidth }}>
        {variant === "settings" ? (
          <div className="w-full min-w-0 mx-auto" style={{ maxWidth: maxWidthMap.narrow }}>
            {children}
          </div>
        ) : (
          children
        )}
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

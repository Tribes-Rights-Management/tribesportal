import { useNavigate } from "react-router-dom";
import { BRAND } from "@/config/layout";

/**
 * TRIBES LOGO — STANDARDIZED BRAND COMPONENT
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * SINGLE source of truth for the Tribes wordmark logo.
 * 
 * USE THIS COMPONENT EVERYWHERE. Do not create custom logo implementations.
 * 
 * Variants:
 * - "button" (default): Clickable, navigates to /workspaces
 * - "static": Non-interactive, for public pages or footers
 * 
 * Size is FIXED and cannot be overridden:
 * - Height: 20px
 * - Max width: 80px
 * ═══════════════════════════════════════════════════════════════════════════════
 */

interface TribesLogoProps {
  /** "button" = clickable (default), "static" = non-interactive */
  variant?: "button" | "static";
  /** Override navigation target (default: /workspaces) */
  href?: string;
  /** Additional class names for the container */
  className?: string;
}

export function TribesLogo({ 
  variant = "button", 
  href = "/workspaces",
  className = "",
}: TribesLogoProps) {
  const navigate = useNavigate();

  const logoImage = (
    <img
      src={BRAND.LOGO_URL}
      alt="Tribes"
      className="dark:invert"
      style={{ 
        height: BRAND.LOGO_HEIGHT,
        width: "auto",
        maxWidth: BRAND.LOGO_MAX_WIDTH,
      }}
    />
  );

  if (variant === "static") {
    return (
      <div 
        className={`flex items-center ${className}`}
        style={{ height: BRAND.LOGO_BUTTON_HEIGHT }}
      >
        {logoImage}
      </div>
    );
  }

  // Button variant (default)
  return (
    <button
      onClick={() => navigate(href)}
      className={`flex items-center rounded-lg hover:bg-[var(--muted-wash)] transition-colors ${className}`}
      style={{ 
        height: BRAND.LOGO_BUTTON_HEIGHT,
        paddingLeft: BRAND.LOGO_BUTTON_PADDING_X,
        paddingRight: BRAND.LOGO_BUTTON_PADDING_X,
      }}
      aria-label="Go to workspaces"
    >
      {logoImage}
    </button>
  );
}

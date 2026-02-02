import { useNavigate } from "react-router-dom";
import { BRAND } from "@/config/layout";

/**
 * TRIBES LOGO — STANDARDIZED BRAND COMPONENT
 * 
 * SINGLE source of truth for the Tribes wordmark logo.
 * USE THIS COMPONENT EVERYWHERE.
 * 
 * ALIGNMENT: The button has px-3 (12px) left padding to align the logo
 * with SideNav item text (which uses px-3 inside a px-2 container).
 * 
 * Variants:
 * - "button" (default): Clickable, navigates to /workspaces
 * - "static": Non-interactive, for public pages or footers
 */

interface TribesLogoProps {
  variant?: "button" | "static";
  href?: string;
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
        className={`flex items-center h-9 px-3 ${className}`}
      >
        {logoImage}
      </div>
    );
  }

  // Button variant (default)
  // px-3 (12px) aligns logo with nav item text
  return (
    <button
      onClick={() => navigate(href)}
      className={`flex items-center h-9 px-3 rounded-lg hover:bg-[var(--muted-wash)] transition-colors ${className}`}
      aria-label="Go to workspaces"
    >
      {logoImage}
    </button>
  );
}

import { Link } from "react-router-dom";
import { BRAND } from "@/lib/brand";
import { getCopyrightLine } from "@/lib/copyright";
import { CONTENT_CONTAINER_CLASS } from "@/lib/layout";
import { THEME_DARK_BG } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
  disableLinks?: boolean;
  hideLinks?: boolean;
  /** Use "compact" for root temp page to preserve original spacing */
  variant?: "standard" | "compact";
}

export function Footer({ 
  className, 
  disableLinks = false, 
  hideLinks = false,
  variant = "standard" 
}: FooterProps) {
  const isStandard = variant === "standard";
  
  // Link styles with Apple-grade timing
  const linkClass = "text-[13px] leading-relaxed transition-opacity duration-150 ease-out opacity-70 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/20 focus-visible:outline-offset-2";

  // Footer wrapper classes based on variant
  const footerWrapperClass = isStandard 
    ? "footer-padding-standard" 
    : "footer-padding";

  // Nav grid classes based on variant
  const navGridClass = isStandard
    ? "flex flex-col gap-[var(--footer-group-gap-mobile)] md:grid md:grid-cols-3 md:gap-x-[var(--footer-column-gap-tablet)] lg:gap-x-[var(--footer-column-gap-desktop)]"
    : "grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-3 md:gap-x-16";

  // Group spacing classes based on variant
  const groupClass = isStandard
    ? "flex flex-col"
    : "space-y-3";

  // Label classes based on variant
  const labelClass = isStandard
    ? "text-[11px] font-medium uppercase tracking-[0.12em] text-white/40 footer-label-spacing"
    : "text-[11px] font-medium uppercase tracking-[0.12em] text-white/40 mb-4";

  // Link wrapper classes based on variant
  const linkWrapperClass = isStandard
    ? "flex flex-col"
    : "";

  // Link class for standard variant (gap between links)
  const getLinkSpacingClass = (idx: number) => 
    isStandard && idx > 0 ? "footer-link-spacing" : "";

  // Signature block classes based on variant
  const signatureClass = isStandard
    ? "footer-signature-spacing"
    : "pt-8 border-t border-white/10";

  const renderGroup = (
    label: string,
    links: { to?: string; label: string; disabled?: boolean }[],
    extraClass?: string
  ) => (
    <div className={cn(groupClass, extraClass)}>
      <p className={labelClass}>{label}</p>
      <div className={linkWrapperClass}>
        {links.map((link, idx) => (
          link.disabled || disableLinks ? (
            <span 
              key={link.label} 
              className={cn("text-[13px] text-white/50 block", getLinkSpacingClass(idx))}
            >
              {link.label}
            </span>
          ) : (
            <Link 
              key={link.label}
              to={link.to!} 
              className={cn(linkClass, "text-white block", getLinkSpacingClass(idx))}
            >
              {link.label}
            </Link>
          )
        ))}
      </div>
    </div>
  );

  return (
    <footer 
      className={cn(footerWrapperClass, className)} 
      style={{ backgroundColor: THEME_DARK_BG }}
    >
      <div className={CONTENT_CONTAINER_CLASS}>
        {/* Navigation Links */}
        {!hideLinks && (
          <nav>
            <div className={navGridClass}>
              {renderGroup("Access", [
                { to: "/portal", label: "Client Portal" },
                { to: "/licensing-account", label: "Licensing Access" },
              ])}
              {renderGroup("Company", [
                { to: "/how-publishing-admin-works", label: "How Administration Works" },
                { to: "/how-licensing-works", label: "How Licensing Works" },
                { to: "/contact", label: "Contact" },
              ])}
              {renderGroup("Legal", [
                { to: "/privacy", label: "Privacy Policy" },
                { to: "/terms", label: "Terms of Use" },
              ])}
            </div>
          </nav>
        )}

        {/* Brand + Copyright — bottom of footer */}
        <div className={signatureClass}>
          <span 
            className="text-[13px] md:text-[14px] font-bold uppercase text-white block"
            style={{ fontWeight: 700, letterSpacing: '0.04em' }}
          >
            {BRAND.wordmark}
          </span>
          <p className="text-[11px] text-white/50 mt-1.5">
            {getCopyrightLine()}
          </p>
        </div>
      </div>
    </footer>
  );
}
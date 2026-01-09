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
}

export function Footer({ className, disableLinks = false, hideLinks = false }: FooterProps) {
  // Shared link styles with Apple-grade timing
  const baseLinkClass = "text-[13px] leading-relaxed transition-opacity duration-150 ease-out focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/20 focus-visible:outline-offset-2";
  const infoLinkClass = cn(baseLinkClass, "text-white/80 hover:text-white");
  const legalLinkClass = cn(baseLinkClass, "text-white/50 hover:text-white/70");

  return (
    <footer className={cn("pt-12 pb-10 md:pt-14 md:pb-8", className)} style={{ backgroundColor: THEME_DARK_BG }}>
      <div className={CONTENT_CONTAINER_CLASS}>
        {/* Brand + Copyright — tight vertical stack */}
        <div className="mb-8 md:mb-6">
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

        {/* Navigation Links — Premium mobile grid, single row on desktop */}
        {!hideLinks && (
          <nav>
            {disableLinks ? (
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 md:flex md:flex-wrap md:gap-x-6 md:gap-y-2">
                <span className="text-[13px] text-white/50">How Administration Works</span>
                <span className="text-[13px] text-white/50">How Licensing Works</span>
                <span className="text-[13px] text-white/50">Privacy Policy</span>
                <span className="text-[13px] text-white/50">Terms of Use</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 md:flex md:flex-wrap md:gap-x-6 md:gap-y-2">
                {/* Left column on mobile: Informational links */}
                <Link to="/how-publishing-admin-works" className={infoLinkClass}>
                  How Administration Works
                </Link>
                <Link to="/how-licensing-works" className={infoLinkClass}>
                  How Licensing Works
                </Link>
                {/* Right column on mobile: Legal links */}
                <Link to="/privacy" className={legalLinkClass}>
                  Privacy Policy
                </Link>
                <Link to="/terms" className={legalLinkClass}>
                  Terms of Use
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </footer>
  );
}

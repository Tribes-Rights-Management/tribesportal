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
  const baseLinkClass = "text-[13px] transition-opacity duration-150 ease-out focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/20 focus-visible:outline-offset-2";
  const infoLinkClass = cn(baseLinkClass, "text-white/85 hover:opacity-100");
  const legalLinkClass = cn(baseLinkClass, "text-white/55 hover:opacity-100");

  return (
    <footer className={cn("pt-14 pb-8", className)} style={{ backgroundColor: THEME_DARK_BG }}>
      <div className={CONTENT_CONTAINER_CLASS}>
        {/* Brand + Copyright — tight vertical stack */}
        <div className="mb-6">
          <span 
            className="text-[13px] md:text-[14px] font-bold uppercase text-white block"
            style={{ fontWeight: 700, letterSpacing: '0.04em' }}
          >
            {BRAND.wordmark}
          </span>
          <p className="text-[11px] text-white/55 mt-1">
            {getCopyrightLine()}
          </p>
        </div>

        {/* Navigation Links — single row, split hierarchy */}
        {!hideLinks && (
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {disableLinks ? (
              <>
                <span className="text-[13px] text-white/55">How Administration Works</span>
                <span className="text-[13px] text-white/55">How Licensing Works</span>
                <span className="text-[13px] text-white/55">Privacy Policy</span>
                <span className="text-[13px] text-white/55">Terms of Use</span>
              </>
            ) : (
              <>
                {/* Informational links — higher opacity */}
                <Link to="/how-publishing-admin-works" className={infoLinkClass}>
                  How Administration Works
                </Link>
                <Link to="/how-licensing-works" className={infoLinkClass}>
                  How Licensing Works
                </Link>
                {/* Legal links — lower opacity */}
                <Link to="/privacy" className={legalLinkClass}>
                  Privacy Policy
                </Link>
                <Link to="/terms" className={legalLinkClass}>
                  Terms of Use
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </footer>
  );
}

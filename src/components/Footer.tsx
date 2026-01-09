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
  // Link styles with Apple-grade timing
  const linkClass = "text-[13px] leading-relaxed transition-opacity duration-150 ease-out opacity-70 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/20 focus-visible:outline-offset-2";

  return (
    <footer className={cn("py-16 md:py-20", className)} style={{ backgroundColor: THEME_DARK_BG }}>
      <div className={CONTENT_CONTAINER_CLASS}>
        {/* Navigation Links — 3-column desktop, 2-column mobile grid */}
        {!hideLinks && (
          <nav className="mb-12 md:mb-16">
            {disableLinks ? (
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-3 md:gap-x-16">
                {/* Access Column */}
                <div className="space-y-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/40 mb-4">Access</p>
                  <span className="text-[13px] text-white/50 block">Request a License</span>
                  <span className="text-[13px] text-white/50 block">Client Portal</span>
                </div>
                {/* Company Column */}
                <div className="space-y-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/40 mb-4">Company</p>
                  <span className="text-[13px] text-white/50 block">How Administration Works</span>
                  <span className="text-[13px] text-white/50 block">How Licensing Works</span>
                  <span className="text-[13px] text-white/50 block">Contact</span>
                </div>
                {/* Legal Column */}
                <div className="space-y-3 col-span-2 md:col-span-1 mt-6 md:mt-0">
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/40 mb-4">Legal</p>
                  <span className="text-[13px] text-white/50 block">Privacy Policy</span>
                  <span className="text-[13px] text-white/50 block">Terms of Use</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-3 md:gap-x-16">
                {/* Access Column */}
                <div className="space-y-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/40 mb-4">Access</p>
                  <Link to="/services" className={cn(linkClass, "text-white block")}>
                    Request a License
                  </Link>
                  <Link to="/portal" className={cn(linkClass, "text-white block")}>
                    Client Portal
                  </Link>
                </div>
                {/* Company Column */}
                <div className="space-y-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/40 mb-4">Company</p>
                  <Link to="/how-publishing-admin-works" className={cn(linkClass, "text-white block")}>
                    How Administration Works
                  </Link>
                  <Link to="/how-licensing-works" className={cn(linkClass, "text-white block")}>
                    How Licensing Works
                  </Link>
                  <Link to="/contact" className={cn(linkClass, "text-white block")}>
                    Contact
                  </Link>
                </div>
                {/* Legal Column */}
                <div className="space-y-3 col-span-2 md:col-span-1 mt-6 md:mt-0">
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/40 mb-4">Legal</p>
                  <Link to="/privacy" className={cn(linkClass, "text-white block")}>
                    Privacy Policy
                  </Link>
                  <Link to="/terms" className={cn(linkClass, "text-white block")}>
                    Terms of Use
                  </Link>
                </div>
              </div>
            )}
          </nav>
        )}

        {/* Brand + Copyright — bottom of footer */}
        <div className="pt-8 border-t border-white/10">
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
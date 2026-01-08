import { Link } from "react-router-dom";
import { BRAND } from "@/lib/brand";
import { getCopyrightLine } from "@/lib/copyright";
import { CONTENT_CONTAINER_CLASS } from "@/lib/layout";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
  disableLinks?: boolean;
  hideLinks?: boolean;
}

export function Footer({ className, disableLinks = false, hideLinks = false }: FooterProps) {
  return (
    <footer className={cn("pt-16 pb-10 bg-[#111214]", className)}>
      <div className={CONTENT_CONTAINER_CLASS}>
        {/* Brand + Copyright */}
        <div className="mb-8">
          <p className="text-sm font-semibold tracking-tight text-white/80 mb-2">
            {BRAND.wordmark}
          </p>
          <p className="text-xs text-white/50">
            {getCopyrightLine()}
          </p>
        </div>

        {/* Navigation Links - Horizontal row */}
        {!hideLinks && (
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {disableLinks ? (
              <>
                <span className="text-sm text-white/50">Privacy</span>
                <span className="text-sm text-white/50">Terms</span>
                <span className="text-sm text-white/50">Contact</span>
              </>
            ) : (
              <>
                <Link 
                  to="/privacy" 
                  className="text-sm text-white/50 hover:text-white/80 transition-colors"
                >
                  Privacy
                </Link>
                <Link 
                  to="/terms" 
                  className="text-sm text-white/50 hover:text-white/80 transition-colors"
                >
                  Terms
                </Link>
                <Link 
                  to="/contact" 
                  className="text-sm text-white/50 hover:text-white/80 transition-colors"
                >
                  Contact
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </footer>
  );
}

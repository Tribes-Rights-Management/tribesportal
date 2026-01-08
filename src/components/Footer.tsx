import { Link } from "react-router-dom";
import { BRAND } from "@/lib/brand";
import { getCopyrightLine } from "@/lib/copyright";
import { cn } from "@/lib/utils";

interface FooterProps {
  variant?: "full" | "minimal";
  className?: string;
}

export function Footer({ variant = "full", className }: FooterProps) {
  if (variant === "minimal") {
    return (
      <footer className={cn("border-t border-border/50 py-6", className)}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12">
          <p className="text-xs text-muted-foreground text-center">
            {getCopyrightLine()}
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className={cn("border-t border-border/50 py-12", className)}>
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-base font-semibold tracking-tight">{BRAND.wordmark}</span>
            <p className="text-sm text-muted-foreground mt-2">
              Rights licensing made simple.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-medium mb-3">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/how-licensing-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Services
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/our-approach" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Our Approach
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 pt-6">
          <p className="text-xs text-muted-foreground">
            {getCopyrightLine()}
          </p>
        </div>
      </div>
    </footer>
  );
}

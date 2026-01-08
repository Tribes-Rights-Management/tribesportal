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
      <footer className={cn("py-8", className)}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12">
          <p className="text-xs text-muted-foreground">
            {getCopyrightLine()}
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className={cn("pt-16 pb-10", className)}>
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12">
        {/* Brand + Copyright */}
        <div className="mb-8">
          <p className="text-sm font-semibold tracking-tight text-foreground mb-2">
            {BRAND.wordmark}
          </p>
          <p className="text-xs text-muted-foreground">
            {getCopyrightLine()}
          </p>
        </div>

        {/* Navigation Links - Horizontal row */}
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <Link 
            to="/privacy" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy
          </Link>
          <Link 
            to="/terms" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms
          </Link>
          <Link 
            to="/contact" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}

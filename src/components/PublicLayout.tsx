import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { Footer } from "@/components/Footer";

interface PublicLayoutProps {
  children: ReactNode;
  footerVariant?: "full" | "minimal";
}

export function PublicLayout({ children, footerVariant = "full" }: PublicLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 flex items-center justify-between h-14">
          <Link to="/" className="flex items-center">
            <span className="text-base font-semibold tracking-tight">{BRAND.wordmark}</span>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/services" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Services
            </Link>
            <Link 
              to="/our-approach" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Our Approach
            </Link>
            <Link 
              to="/auth" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -mr-2 text-foreground"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-border/50 py-4">
            <div className="max-w-[1200px] mx-auto px-4 flex flex-col gap-4">
              <Link 
                to="/services" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Services
              </Link>
              <Link 
                to="/our-approach" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Our Approach
              </Link>
              <Link 
                to="/licensing-account" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Request Access
              </Link>
              <Link 
                to="/contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </Link>
              <Link 
                to="/auth" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* Main */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <Footer variant={footerVariant} />
    </div>
  );
}

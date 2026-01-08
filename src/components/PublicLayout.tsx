import { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { Footer } from "@/components/Footer";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerDark, setHeaderDark] = useState(true);
  const mainRef = useRef<HTMLElement>(null);
  const location = useLocation();

  // Check if we're on a page that starts with a dark hero
  const darkHeroPages = ["/", "/marketing"];
  const startsWithDarkHero = darkHeroPages.includes(location.pathname);

  useEffect(() => {
    if (!startsWithDarkHero) {
      setHeaderDark(false);
      return;
    }

    const handleScroll = () => {
      // Find all sections and determine which one is at the top
      const sections = document.querySelectorAll('section[data-theme]');
      const headerHeight = 56; // h-14 = 56px
      
      let isDark = true; // Default to dark for pages with dark heroes
      
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        // Check if this section is at or above the header
        if (rect.top <= headerHeight && rect.bottom > headerHeight) {
          isDark = section.getAttribute('data-theme') === 'dark';
        }
      });
      
      // If no sections with data-theme, check scroll position
      if (sections.length === 0) {
        // Assume first ~400px is dark hero
        isDark = window.scrollY < 400;
      }
      
      setHeaderDark(isDark);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [startsWithDarkHero, location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const headerBg = headerDark ? "bg-[#111214]" : "bg-background";
  const textColor = headerDark ? "text-white" : "text-foreground";
  const mutedColor = headerDark ? "text-white/60 hover:text-white/90" : "text-muted-foreground hover:text-foreground";
  const borderColor = headerDark ? "border-white/10" : "border-border/50";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className={`sticky top-0 z-50 transition-colors duration-300 ${headerBg} ${borderColor} border-b`}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 flex items-center justify-between h-14">
          <Link to="/" className="flex items-center">
            <span className={`text-base font-semibold tracking-tight ${textColor}`}>{BRAND.wordmark}</span>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/services" 
              className={`text-sm transition-colors ${mutedColor}`}
            >
              Services
            </Link>
            <Link 
              to="/our-approach" 
              className={`text-sm transition-colors ${mutedColor}`}
            >
              Our Approach
            </Link>
            <Link 
              to="/auth" 
              className={`text-sm transition-colors ${mutedColor}`}
            >
              Sign in
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 -mr-2 ${textColor}`}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu - Right slide-in drawer */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Drawer */}
            <nav className="fixed top-0 right-0 h-screen w-[280px] bg-[#111214] z-50 md:hidden flex flex-col">
              {/* Close button */}
              <div className="flex justify-end p-5">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white/60 hover:text-white"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Section 1: Primary actions */}
              <div className="flex flex-col px-6 pt-4 gap-6">
                <Link 
                  to="/auth" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-white"
                >
                  Client Sign In
                </Link>
                <Link 
                  to="/contact" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base text-white/60 hover:text-white/90"
                >
                  Contact
                </Link>
              </div>
              
              {/* Section 2: Orientation */}
              <div className="flex flex-col px-6 pt-10 gap-6">
                <Link 
                  to="/our-approach" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base text-white/60 hover:text-white/90"
                >
                  Our Approach
                </Link>
                <Link 
                  to="/how-it-works" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base text-white/60 hover:text-white/90"
                >
                  How It Works
                </Link>
              </div>
              
              {/* Section 3: Secondary info */}
              <div className="flex flex-col px-6 pt-10 gap-6">
                <Link 
                  to="/services" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base text-white/60 hover:text-white/90"
                >
                  Services
                </Link>
                <Link 
                  to="/licensing" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base text-white/60 hover:text-white/90"
                >
                  Licensing
                </Link>
              </div>
              
              {/* Section 4: Utility footer */}
              <div className="mt-auto px-6 pb-10">
                <div className="border-t border-white/10 pt-6 flex flex-col gap-4">
                  <Link 
                    to="/privacy" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm text-white/40 hover:text-white/60"
                  >
                    Privacy
                  </Link>
                  <Link 
                    to="/terms" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm text-white/40 hover:text-white/60"
                  >
                    Terms
                  </Link>
                </div>
              </div>
            </nav>
          </>
        )}
      </header>

      {/* Main */}
      <main ref={mainRef} className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

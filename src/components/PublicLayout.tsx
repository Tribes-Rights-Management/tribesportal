import { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { CONTENT_CONTAINER_CLASS } from "@/lib/layout";
import { Footer } from "@/components/Footer";
import tribesLogoWhite from "@/assets/tribes-logo-white.svg";

interface PublicLayoutProps {
  children: ReactNode;
  logoOnly?: boolean;
  disableFooterLinks?: boolean;
  hideFooterLinks?: boolean;
  mobileContactAnchor?: string;
}

export function PublicLayout({ children, logoOnly = false, disableFooterLinks = false, hideFooterLinks = false, mobileContactAnchor }: PublicLayoutProps) {
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

  // Lock body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [mobileMenuOpen]);
  const headerBg = headerDark ? "bg-[#111214]" : "bg-background";
  const textColor = headerDark ? "text-white" : "text-foreground";
  const mutedColor = headerDark ? "text-white/60 hover:text-white/90" : "text-muted-foreground hover:text-foreground";
  const borderColor = headerDark ? "border-white/10" : "border-border/50";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className={`sticky top-0 z-50 transition-colors duration-300 ${headerBg} ${borderColor} border-b`}>
        <div className={`${CONTENT_CONTAINER_CLASS} flex items-center justify-between h-14`}>
          <Link to="/" className="flex items-center">
            <img 
              src={tribesLogoWhite} 
              alt={BRAND.wordmark}
              className={`h-[20px] w-auto ${headerDark ? '' : 'invert'}`}
              onError={(e) => {
                // Fallback to text wordmark if image fails
                const target = e.currentTarget;
                target.style.display = 'none';
                const fallback = document.createElement('span');
                fallback.className = `text-base font-semibold tracking-tight ${textColor}`;
                fallback.textContent = BRAND.wordmark;
                target.parentNode?.appendChild(fallback);
              }}
            />
          </Link>
          
          {!logoOnly && (
            <>
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
            </>
          )}

          {/* Contact Link (logoOnly mode with anchor - visible on all screen sizes) */}
          {logoOnly && mobileContactAnchor && (
            <button
              onClick={() => {
                document.getElementById(mobileContactAnchor)?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`text-sm transition-colors ${mutedColor}`}
            >
              Contact
            </button>
          )}
        </div>

        {/* Mobile Menu - Right slide-in drawer */}
        {!logoOnly && (
          <>
            {/* Backdrop */}
            <div 
              className={`fixed inset-0 bg-black/70 z-40 md:hidden transition-opacity duration-250 ease-out ${
                mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            
            {/* Drawer */}
            <nav 
              className={`fixed top-0 right-0 h-screen w-[80%] max-w-[320px] bg-black z-50 md:hidden flex flex-col transition-transform duration-250 ease-out ${
                mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
              aria-label="Mobile navigation"
            >
              {/* Close button */}
              <div className="flex justify-end p-5">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white/60 hover:text-white transition-opacity"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Top group */}
              <div className="flex flex-col px-6 pt-2 gap-5">
                <Link 
                  to="/auth" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[15px] font-medium text-white/95 hover:text-white transition-opacity"
                >
                  Client Sign In
                </Link>
                <Link 
                  to="/contact" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[15px] font-light text-white/80 hover:text-white transition-opacity"
                >
                  Contact
                </Link>
                <Link 
                  to="/services" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[15px] font-light text-white/80 hover:text-white transition-opacity"
                >
                  Services
                </Link>
              </div>
              
              {/* Middle group */}
              <div className="flex flex-col px-6 pt-8 gap-5">
                <Link 
                  to="/licensing-account" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[15px] font-light text-white/80 hover:text-white transition-opacity"
                >
                  Request Licensing Access
                </Link>
                <Link 
                  to="/service-inquiry" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[15px] font-light text-white/80 hover:text-white transition-opacity"
                >
                  Inquire About Services
                </Link>
              </div>
              
              {/* Bottom legal group */}
              <div className="mt-auto px-6 pb-10">
                <div className="border-t border-white/10 pt-6 flex flex-col gap-4">
                  <Link 
                    to="/privacy" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-light text-white/50 hover:text-white/70 transition-opacity"
                  >
                    Privacy Policy
                  </Link>
                  <Link 
                    to="/terms" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-light text-white/50 hover:text-white/70 transition-opacity"
                  >
                    Terms of Use
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
      <Footer disableLinks={disableFooterLinks} hideLinks={hideFooterLinks} />
    </div>
  );
}

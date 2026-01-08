import { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { CONTENT_CONTAINER_CLASS } from "@/lib/layout";
import { Footer } from "@/components/Footer";
import { DesktopSidebar } from "@/components/DesktopSidebar";

interface PublicLayoutProps {
  children: ReactNode;
  logoOnly?: boolean;
  disableFooterLinks?: boolean;
  hideFooterLinks?: boolean;
  mobileContactAnchor?: string;
}

export function PublicLayout({ children, logoOnly = false, disableFooterLinks = false, hideFooterLinks = false, mobileContactAnchor }: PublicLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(false);
  const [headerDark, setHeaderDark] = useState(true);
  const mainRef = useRef<HTMLElement>(null);
  const location = useLocation();

  // Root landing page exception - no desktop sidebar
  const isRootPage = location.pathname === "/";

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
      const headerHeight = 64; // md:h-16 for desktop
      
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
    setDesktopSidebarOpen(false);
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
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setDesktopSidebarOpen(false);
      }
    };
    if (mobileMenuOpen || desktopSidebarOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [mobileMenuOpen, desktopSidebarOpen]);
  const headerBg = headerDark ? "bg-[#111214]" : "bg-background";
  const textColor = headerDark ? "text-white" : "text-foreground";
  const mutedColor = headerDark ? "text-white/60 hover:text-white/90" : "text-muted-foreground hover:text-foreground";
  const borderColor = headerDark ? "border-white/10" : "border-border/50";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className={`sticky top-0 z-50 transition-colors duration-300 ${headerBg} ${borderColor} border-b`}>
        <div className={`${CONTENT_CONTAINER_CLASS} flex items-center justify-between h-14 md:h-16`}>
          {/* Left-aligned wordmark */}
          <Link to="/" className="flex items-center">
            <span 
              className={`text-[15px] md:text-[17px] font-bold tracking-[-0.02em] uppercase ${textColor}`}
            >
              {BRAND.wordmark}
            </span>
          </Link>
          
          {/* Root page: Contact link on right */}
          {!logoOnly && isRootPage && (
            <Link 
              to="/contact" 
              className={`hidden md:block text-sm transition-colors ${mutedColor}`}
            >
              Contact
            </Link>
          )}

          {/* Non-root pages: Hamburger menu trigger on right (desktop) */}
          {!logoOnly && !isRootPage && (
            <button
              onClick={() => setDesktopSidebarOpen(true)}
              className={`hidden md:flex p-2 -mr-2 transition-colors ${mutedColor}`}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          )}

          {/* Mobile Menu Button - all non-logoOnly pages */}
          {!logoOnly && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 -mr-2 ${textColor}`}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}

          {/* Contact Link (logoOnly mode with anchor - visible on all screen sizes) */}
          {logoOnly && mobileContactAnchor && (
            <button
              onClick={() => {
                document.getElementById(mobileContactAnchor)?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`text-sm leading-none transition-colors ${mutedColor}`}
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
                  to="/services" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[15px] font-light text-white/80 hover:text-white transition-opacity"
                >
                  Services
                </Link>
                <Link 
                  to="/our-approach" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[15px] font-light text-white/80 hover:text-white transition-opacity"
                >
                  Our Approach
                </Link>
                <Link 
                  to="/how-publishing-admin-works" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[15px] font-light text-white/80 hover:text-white transition-opacity"
                >
                  How Administration Works
                </Link>
                <Link 
                  to="/how-licensing-works" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[15px] font-light text-white/80 hover:text-white transition-opacity"
                >
                  How Licensing Works
                </Link>
                <Link 
                  to="/auth" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[15px] font-light text-white/80 hover:text-white transition-opacity"
                >
                  Sign In
                </Link>
                <Link 
                  to="/contact" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[15px] font-light text-white/80 hover:text-white transition-opacity"
                >
                  Contact
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

        {/* Desktop Sidebar - only for non-root pages */}
        {!logoOnly && !isRootPage && (
          <DesktopSidebar
            isOpen={desktopSidebarOpen}
            onClose={() => setDesktopSidebarOpen(false)}
          />
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

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

  // HEADER COLOR RULE (LOCKED)
  // White header → legal, policy, documentation, reference pages
  // Black header → marketing, positioning, narrative pages
  // This separation is intentional — restraint signals maturity
  const whiteHeaderPages = [
    "/privacy",
    "/terms", 
    "/data-retention",
    "/how-licensing-works",
    "/how-publishing-admin-works",
  ];
  const usesWhiteHeader = whiteHeaderPages.includes(location.pathname);

  // Dark hero pages get scroll-aware header color transitions
  const darkHeroPages = ["/", "/marketing", "/our-approach", "/services", "/contact", "/licensing-account", "/services/inquiry"];
  const startsWithDarkHero = !usesWhiteHeader && darkHeroPages.includes(location.pathname);

  useEffect(() => {
    if (!startsWithDarkHero) {
      setHeaderDark(false);
      return;
    }

    const handleScroll = () => {
      // Find all sections and determine which one is at the top
      const sections = document.querySelectorAll('section[data-theme]');
      const headerHeight = 64; // Desktop header height
      
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
  const mutedColor = headerDark ? "text-white/60" : "text-muted-foreground";
  const borderStyle = headerDark 
    ? "border-b border-white/[0.06]" 
    : "border-b border-foreground/[0.06]";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header - 64px desktop, 56px mobile - Institutional grade lock */}
      <header className={`sticky top-0 z-50 ${headerBg} ${borderStyle}`}>
        <div className={`${CONTENT_CONTAINER_CLASS} flex items-center justify-between h-14 md:h-16`}>
          {/* Left-aligned wordmark - institutional weight + tracking */}
          <Link 
            to="/" 
            className={`flex items-center transition-opacity duration-150 ease-out hover:opacity-100 ${headerDark ? 'opacity-90' : 'opacity-90'}`}
          >
            <span 
              className={`text-[15px] md:text-[17px] font-bold uppercase ${textColor}`}
              style={{ fontWeight: 700, letterSpacing: '0.04em' }}
            >
              {BRAND.wordmark}
            </span>
          </Link>
          
          {/* Root page: Contact link on right */}
          {!logoOnly && isRootPage && (
            <Link 
              to="/contact" 
              className={`hidden md:block text-[13px] transition-opacity duration-150 ease-out opacity-60 hover:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 ${headerDark ? 'text-white focus-visible:outline-white/20' : 'text-foreground focus-visible:outline-foreground/15'}`}
            >
              Contact
            </Link>
          )}

          {/* Non-root pages: Hamburger menu trigger on right (desktop) */}
          {!logoOnly && !isRootPage && (
            <button
              onClick={() => setDesktopSidebarOpen(true)}
              className={`hidden md:flex p-2 -mr-2 transition-opacity duration-150 ease-out opacity-70 hover:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 ${headerDark ? 'text-white focus-visible:outline-white/20' : 'text-foreground focus-visible:outline-foreground/15'}`}
              aria-label="Open menu"
            >
              <Menu size={20} strokeWidth={1.75} />
            </button>
          )}

          {/* Mobile Menu Button - all non-logoOnly pages */}
          {!logoOnly && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 -mr-2 transition-opacity duration-150 ease-out opacity-80 hover:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 ${headerDark ? 'text-white focus-visible:outline-white/20' : 'text-foreground focus-visible:outline-foreground/15'}`}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
            </button>
          )}

          {/* Contact Link (logoOnly mode with anchor - visible on all screen sizes) */}
          {logoOnly && mobileContactAnchor && (
            <button
              onClick={() => {
                document.getElementById(mobileContactAnchor)?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`text-[13px] leading-none transition-opacity duration-150 ease-out opacity-60 hover:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 ${headerDark ? 'text-white focus-visible:outline-white/20' : 'text-foreground focus-visible:outline-foreground/15'}`}
            >
              Contact
            </button>
          )}
        </div>

        {/* Mobile Menu - Full-screen slide-in drawer */}
        {!logoOnly && (
          <>
            {/* Backdrop with blur */}
            <div 
              className={`fixed inset-0 z-40 md:hidden transition-opacity duration-220 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
                mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              style={{
                backgroundColor: 'rgba(0,0,0,0.35)',
                backdropFilter: mobileMenuOpen ? 'blur(10px)' : 'blur(0px)',
                WebkitBackdropFilter: mobileMenuOpen ? 'blur(10px)' : 'blur(0px)',
              }}
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            
            {/* Drawer - Full width on mobile */}
            <nav 
              className={`fixed top-0 right-0 h-screen w-full bg-black z-50 md:hidden flex flex-col transition-transform duration-220 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:duration-0 ${
                mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
              style={{
                paddingTop: 'env(safe-area-inset-top)',
                paddingBottom: 'env(safe-area-inset-bottom)',
                paddingRight: 'env(safe-area-inset-right)',
                paddingLeft: 'env(safe-area-inset-left)',
              }}
              aria-label="Mobile navigation"
            >
              {/* Close button */}
              <div className="flex justify-end p-5">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white/60 hover:opacity-85 transition-opacity duration-160 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/25 focus-visible:outline-offset-2"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Primary links */}
              <div className="flex flex-col px-6 pt-2 gap-5">
                <Link 
                  to="/auth" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[15px] font-semibold text-white hover:opacity-85 transition-opacity duration-160"
                >
                  Client Sign In
                </Link>
              </div>

              {/* Services section */}
              <div className="px-6 mt-10">
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-white/50 mb-4">
                  Services
                </p>
                <div className="flex flex-col gap-4">
                  <Link 
                    to="/services" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[15px] font-light text-white/80 hover:opacity-85 transition-opacity duration-160"
                  >
                    Services
                  </Link>
                  <Link 
                    to="/licensing-account" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[15px] font-light text-white/80 hover:opacity-85 transition-opacity duration-160"
                  >
                    Request Licensing Access
                  </Link>
                  <Link 
                    to="/services/inquiry" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[15px] font-light text-white/80 hover:opacity-85 transition-opacity duration-160"
                  >
                    Inquire About Services
                  </Link>
                  <Link 
                    to="/contact" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[15px] font-light text-white/80 hover:opacity-85 transition-opacity duration-160"
                  >
                    Contact
                  </Link>
                </div>
              </div>
              
              {/* Bottom legal group */}
              <div className="mt-auto px-6 pb-10">
                <div className="border-t border-white/10 pt-6 flex flex-col gap-4">
                  <Link 
                    to="/privacy" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-light text-white/50 hover:opacity-85 transition-opacity duration-160"
                  >
                    Privacy Policy
                  </Link>
                  <Link 
                    to="/terms" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-light text-white/50 hover:opacity-85 transition-opacity duration-160"
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

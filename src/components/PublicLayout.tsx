import { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { CONTENT_CONTAINER_CLASS } from "@/lib/layout";
import { THEME_DARK_BG, THEME_LIGHT_BG, OVERLAY_BACKDROP, MOTION_TIMING } from "@/lib/theme";
import { Footer } from "@/components/Footer";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { FooterSpacer } from "@/components/FooterSpacer";

interface PublicLayoutProps {
  children: ReactNode;
  logoOnly?: boolean;
  disableFooterLinks?: boolean;
  hideFooterLinks?: boolean;
  mobileContactAnchor?: string;
  /** Use dark theme background (bg-[#111214]) for the entire page to prevent white fall-through */
  darkBackground?: boolean;
}

export function PublicLayout({ children, logoOnly = false, disableFooterLinks = false, hideFooterLinks = false, mobileContactAnchor, darkBackground = false }: PublicLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const location = useLocation();

  // Root landing page exception - no desktop sidebar, dark header integrated with hero
  const isRootPage = location.pathname === "/";
  const isMarketingPage = location.pathname === "/marketing";

  // GLOBAL HEADER RULE (LOCKED - INSTITUTIONAL GRADE)
  // Root (/) AND /marketing: Black header, white logo, integrated with hero
  // All other pages: White header, black logo, black hamburger, subtle divider
  // NO scroll-based color switching. NO exceptions.
  const headerDark = isRootPage || isMarketingPage;

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

  // Header styling - institutional grade, uses theme constants
  const headerBgStyle = headerDark ? { backgroundColor: THEME_DARK_BG } : { backgroundColor: THEME_LIGHT_BG };
  const textColor = headerDark ? "text-white" : "text-foreground";
  // Subtle institutional divider: very light gray for white header, subtle white for dark
  const borderStyle = headerDark 
    ? "border-b border-white/[0.06]" 
    : "border-b border-[#e5e5e5]";

  // Theme zone background - uses authoritative colors from theme.ts
  // Dark pages keep the global dark baseline; light pages explicitly paint white
  const pageBackgroundStyle = darkBackground 
    ? { backgroundColor: THEME_DARK_BG } 
    : { backgroundColor: THEME_LIGHT_BG };

  return (
    <div 
      className="min-h-dvh pb-safe flex flex-col"
      style={pageBackgroundStyle}
    >
      {/* Header - 64px desktop, 56px mobile - Institutional grade lock */}
      {/* NON-STICKY: scrolls away for institutional calm (LOCKED) */}
      {/* Header content container MUST match hero container for perfect left-rail alignment */}
      <header className={`relative z-50 ${borderStyle}`} style={headerBgStyle}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-10 flex items-center justify-between h-14 md:h-16">
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
          
          {/* Root or marketing page: Contact link on right */}
          {!logoOnly && (isRootPage || isMarketingPage) && (
            <Link 
              to="/contact" 
              className={`hidden md:block text-[13px] transition-opacity duration-150 ease-out opacity-60 hover:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 ${headerDark ? 'text-white focus-visible:outline-white/20' : 'text-foreground focus-visible:outline-foreground/15'}`}
            >
              Contact
            </Link>
          )}

          {/* Non-marketing pages: Hamburger menu trigger on right (desktop) */}
          {!logoOnly && !isRootPage && !isMarketingPage && (
            <button
              onClick={() => setDesktopSidebarOpen(true)}
              className={`hidden md:flex p-2 -mr-2 transition-opacity duration-150 ease-out opacity-70 hover:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 ${headerDark ? 'text-white focus-visible:outline-white/20' : 'text-foreground focus-visible:outline-foreground/15'}`}
              aria-label="Open menu"
            >
              <Menu size={20} strokeWidth={1.75} />
            </button>
          )}

          {/* Mobile Menu Button - hamburger icon only (LOCKED) */}
          {!logoOnly && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 -mr-2 transition-opacity duration-150 ease-out opacity-80 hover:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 ${headerDark ? 'text-white focus-visible:outline-white/20' : 'text-foreground focus-visible:outline-foreground/15'}`}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <Menu size={20} strokeWidth={1.75} />
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
            {/* Backdrop with blur - uses theme constants */}
            <div 
              className={`fixed inset-0 z-40 md:hidden ${
                mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              style={{
                backgroundColor: OVERLAY_BACKDROP.color,
                backdropFilter: mobileMenuOpen ? `blur(${OVERLAY_BACKDROP.blur})` : 'blur(0px)',
                WebkitBackdropFilter: mobileMenuOpen ? `blur(${OVERLAY_BACKDROP.blur})` : 'blur(0px)',
                transition: `opacity ${MOTION_TIMING.enter}ms ${MOTION_TIMING.easing}`,
              }}
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            
            {/* Drawer - Full width on mobile, white background (INSTITUTIONAL LOCK) */}
            <nav 
              className={`fixed top-0 right-0 h-screen w-full z-50 md:hidden flex flex-col motion-reduce:duration-0 ${
                mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
              style={{
                backgroundColor: THEME_LIGHT_BG,
                paddingTop: 'env(safe-area-inset-top)',
                paddingBottom: 'env(safe-area-inset-bottom)',
                paddingRight: 'env(safe-area-inset-right)',
                paddingLeft: 'env(safe-area-inset-left)',
                transition: `transform ${MOTION_TIMING.enter}ms ${MOTION_TIMING.easing}`,
              }}
              aria-label="Mobile navigation"
            >
              {/* Close button - institutional styling */}
              <div className="flex justify-end px-6 pt-6 pb-4">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[13px] text-foreground/50 transition-opacity duration-150 ease-out hover:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-foreground/15 focus-visible:outline-offset-2"
                  aria-label="Close menu"
                >
                  Close
                </button>
              </div>
              
              {/* Primary links - institutional styling */}
              <div className="flex flex-col px-6 pt-4 gap-5">
                <Link 
                  to="/auth" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[15px] font-semibold text-foreground transition-opacity duration-150 ease-out hover:opacity-70"
                >
                  Client Sign In
                </Link>
              </div>

              {/* Services section - institutional styling */}
              <div className="px-6 mt-10">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-foreground/40 mb-4">
                  Services
                </p>
                <div className="flex flex-col gap-4">
                  <Link 
                    to="/services" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[15px] text-foreground/80 transition-opacity duration-150 ease-out hover:opacity-100"
                  >
                    Services
                  </Link>
                  <Link 
                    to="/licensing-account" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[15px] text-foreground/80 transition-opacity duration-150 ease-out hover:opacity-100"
                  >
                    Request Licensing Access
                  </Link>
                  <Link 
                    to="/services/inquiry" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[15px] text-foreground/80 transition-opacity duration-150 ease-out hover:opacity-100"
                  >
                    Inquire About Services
                  </Link>
                  <Link 
                    to="/contact" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[15px] text-foreground/80 transition-opacity duration-150 ease-out hover:opacity-100"
                  >
                    Contact
                  </Link>
                </div>
              </div>
              
              {/* Bottom legal group - institutional styling */}
              <div className="mt-auto px-6 pb-10">
                <div className="border-t border-foreground/[0.06] pt-6 flex flex-col gap-3">
                  <Link 
                    to="/privacy" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[13px] text-foreground/50 transition-opacity duration-150 ease-out hover:opacity-100"
                  >
                    Privacy Policy
                  </Link>
                  <Link 
                    to="/terms" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[13px] text-foreground/50 transition-opacity duration-150 ease-out hover:opacity-100"
                  >
                    Terms of Use
                  </Link>
                </div>
              </div>
            </nav>
          </>
        )}

        {/* Desktop Sidebar - only for non-marketing pages */}
        {!logoOnly && !isRootPage && !isMarketingPage && (
          <DesktopSidebar
            isOpen={desktopSidebarOpen}
            onClose={() => setDesktopSidebarOpen(false)}
          />
        )}
      </header>

      {/* Main - flex-1 ensures content expands to fill viewport */}
      <main ref={mainRef} className="flex-1 flex flex-col">
        {children}
        {/* Footer Spacer - prevents white fall-through when content is short */}
        <FooterSpacer isDark={darkBackground} />
      </main>

      {/* Footer — root page uses compact variant to preserve original layout */}
      <Footer 
        disableLinks={disableFooterLinks} 
        hideLinks={hideFooterLinks} 
        variant={isRootPage ? "compact" : "standard"}
      />
    </div>
  );
}

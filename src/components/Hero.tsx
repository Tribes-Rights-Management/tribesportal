import { Link } from "react-router-dom";
import { CONTENT_CONTAINER_CLASS } from "@/lib/layout";
import { THEME_DARK_BG } from "@/lib/theme";

interface HeroProps {
  /** If provided, renders a button that scrolls to the anchor. Otherwise renders a Link to /our-approach */
  contactAnchor?: string;
}

/**
 * HERO COMPONENT — GLOBAL STANDARD (LOCKED)
 * 
 * This hero is used on root (/) and /marketing pages only.
 * It must be pixel-perfect identical on both.
 * 
 * Mobile behavior (LOCKED):
 * - Full viewport height (min-height: 100svh with fallbacks)
 * - Black background fills entire screen
 * - No white section visible on initial load
 * - Content vertically centered
 * 
 * Desktop behavior (LOCKED):
 * - Full viewport height minus header
 * - Content vertically centered
 * 
 * Typography (LOCKED - do not modify):
 * - H1: 40px/56px/72px, font-medium, -0.015em tracking
 * - Eyebrow: 14px, uppercase, 0.08em tracking
 * - Subhead: 16px/18px, font-light, 45% white opacity
 */
export function Hero({ contactAnchor }: HeroProps) {
  const scrollToContact = () => {
    if (contactAnchor) {
      document.getElementById(contactAnchor)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section 
      data-theme="dark"
      data-hero-section
      className="relative flex flex-col justify-center pb-[env(safe-area-inset-bottom)]"
      style={{ 
        backgroundColor: THEME_DARK_BG,
        /* Full viewport height - cascading fallbacks for all browsers */
        minHeight: 'calc(100vh - var(--header-h, 56px))',
        /* Explicit width prevents flex shrinking in certain contexts */
        width: '100%',
      }}
    >
      {/* CSS for svh/dvh support - ensures full viewport on mobile Safari */}
      <style>{`
        /* Mobile-first: full viewport height on all devices */
        [data-hero-section] {
          min-height: calc(100vh - var(--header-h, 56px));
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        @supports (min-height: 100svh) {
          [data-hero-section] {
            min-height: calc(100svh - var(--header-h, 56px)) !important;
          }
        }
        @supports (min-height: 100dvh) {
          [data-hero-section] {
            min-height: calc(100dvh - var(--header-h, 56px)) !important;
          }
        }
      `}</style>
      
      {/* Content container - uses identical sizing to header for perfect left-rail alignment */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-10 py-12 md:py-24 lg:py-32">
        <div className="max-w-[640px]">
          {/* Eyebrow */}
          <p className="text-sm font-medium tracking-[0.08em] text-[#C9C9CC] mb-14">
            TRIBES
          </p>

          {/* H1 - Institutional weight, refined letter-spacing */}
          <h1 className="text-[40px] md:text-[56px] lg:text-[72px] font-medium leading-[1.08] tracking-[-0.015em] text-white mb-8">
            Rights management, built to last.
          </h1>

          {/* Secondary supporting line - Quiet, subordinate */}
          <p className="text-base md:text-lg font-light text-white/45 leading-[1.5] tracking-[0.01em] mb-16">
            Publishing administration, built for precision.
          </p>

          {/* Divider */}
          <div className="w-16 h-px bg-white/10 mb-10" />

          {/* CTA Link */}
          {contactAnchor ? (
            <button
              onClick={scrollToContact}
              className="text-sm text-white/75 hover:text-white/85 transition-opacity duration-150 ease-out underline underline-offset-4 decoration-white/30"
            >
              Contact
            </button>
          ) : (
            <Link
              to="/our-approach"
              className="text-xs text-white/55 hover:text-white/85 transition-opacity duration-150 ease-out underline underline-offset-4 decoration-white/20"
            >
              Our approach
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

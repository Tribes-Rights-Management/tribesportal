import { useEffect } from "react";
import { Link } from "react-router-dom";
import { THEME_LIGHT_BG, OVERLAY_BACKDROP, MOTION_TIMING } from "@/lib/theme";

interface DesktopSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DesktopSidebar({ isOpen, onClose }: DesktopSidebarProps) {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop - Institutional grade: uses theme constants */}
      <div
        className={`fixed inset-0 z-40 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{
          backgroundColor: OVERLAY_BACKDROP.color,
          backdropFilter: isOpen ? `blur(${OVERLAY_BACKDROP.blur})` : 'blur(0px)',
          WebkitBackdropFilter: isOpen ? `blur(${OVERLAY_BACKDROP.blur})` : 'blur(0px)',
          transition: `opacity ${MOTION_TIMING.enter}ms ${MOTION_TIMING.easing}`,
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Panel - 420px desktop, full-width mobile, no border/shadow */}
      <aside
        className={`fixed top-0 right-0 h-screen w-full md:w-[420px] z-50 flex flex-col motion-reduce:duration-0 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          backgroundColor: THEME_LIGHT_BG,
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingRight: 'env(safe-area-inset-right)',
          transition: `transform ${MOTION_TIMING.enter}ms ${MOTION_TIMING.easing}`,
        }}
        aria-label="Desktop navigation"
      >
        {/* Header with Close button - institutional styling */}
        <div className="flex justify-end px-8 pt-6 pb-4">
          <button
            onClick={onClose}
            className="text-[13px] text-foreground/50 transition-opacity duration-150 ease-out hover:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-foreground/15 focus-visible:outline-offset-2"
          >
            Close
          </button>
        </div>

        {/* Navigation Links - Institutional grade spacing and hierarchy */}
        <nav className="flex flex-col flex-1 px-8 pt-6">
          {/* Primary Section */}
          <div className="flex flex-col gap-5">
            {/* Client Sign In - Bold/emphasized */}
            <Link
              to="/auth"
              onClick={onClose}
              className="text-[15px] font-semibold text-foreground transition-opacity duration-150 ease-out hover:opacity-70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-foreground/15 focus-visible:outline-offset-2"
            >
              Client Sign In
            </Link>
          </div>

          <div className="mt-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-foreground/40 mb-4">
              Services
            </p>
            <div className="flex flex-col gap-4">
              <Link
                to="/services"
                onClick={onClose}
                className="text-[15px] text-foreground/80 transition-opacity duration-150 ease-out hover:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-foreground/15 focus-visible:outline-offset-2"
              >
                Services
              </Link>
              <Link
                to="/licensing-account"
                onClick={onClose}
                className="text-[15px] text-foreground/80 transition-opacity duration-150 ease-out hover:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-foreground/15 focus-visible:outline-offset-2"
              >
                Request Licensing Access
              </Link>
              <Link
                to="/services/inquiry"
                onClick={onClose}
                className="text-[15px] text-foreground/80 transition-opacity duration-150 ease-out hover:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-foreground/15 focus-visible:outline-offset-2"
              >
                Inquire About Services
              </Link>
              <Link
                to="/contact"
                onClick={onClose}
                className="text-[15px] text-foreground/80 transition-opacity duration-150 ease-out hover:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-foreground/15 focus-visible:outline-offset-2"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Divider - subtle, no harsh contrast */}
          <div className="border-t border-foreground/[0.06] mt-10 mb-6" />

          {/* Secondary/Footer Links - reduced hierarchy */}
          <div className="flex flex-col gap-3">
            <Link
              to="/privacy"
              onClick={onClose}
              className="text-[13px] text-foreground/50 transition-opacity duration-150 ease-out hover:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-foreground/15 focus-visible:outline-offset-2"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              onClick={onClose}
              className="text-[13px] text-foreground/50 transition-opacity duration-150 ease-out hover:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-foreground/15 focus-visible:outline-offset-2"
            >
              Terms of Use
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
}

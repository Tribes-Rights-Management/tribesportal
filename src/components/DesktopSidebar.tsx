import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import FocusTrap from "focus-trap-react";
import { THEME_LIGHT_BG, OVERLAY_BACKDROP, MOTION_TIMING } from "@/lib/theme";

interface DesktopSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DesktopSidebar({ isOpen, onClose }: DesktopSidebarProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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

  // Focus close button on open
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  return (
    <>
      {/* Backdrop - Institutional grade: subtle blur, de-emphasizes without obscuring */}
      <div
        className={`fixed inset-0 z-40 hidden md:block ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{
          backgroundColor: OVERLAY_BACKDROP.color,
          backdropFilter: isOpen ? `blur(${OVERLAY_BACKDROP.blur})` : 'blur(0px)',
          WebkitBackdropFilter: isOpen ? `blur(${OVERLAY_BACKDROP.blur})` : 'blur(0px)',
          transition: `opacity ${isOpen ? MOTION_TIMING.enter : MOTION_TIMING.exit}ms ${MOTION_TIMING.easing}`,
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Panel - Focus trapped, 420px desktop */}
      <FocusTrap active={isOpen} focusTrapOptions={{ allowOutsideClick: true }}>
        <aside
          className={`fixed top-0 right-0 h-screen w-[420px] z-50 hidden md:flex flex-col motion-reduce:duration-0 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{
            backgroundColor: THEME_LIGHT_BG,
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
            paddingRight: 'env(safe-area-inset-right)',
            transition: `transform ${isOpen ? MOTION_TIMING.enter : MOTION_TIMING.exit}ms ${MOTION_TIMING.easing}`,
          }}
          aria-label="Desktop navigation"
          aria-modal="true"
          role="dialog"
        >
          {/* Header with Close button - institutional styling */}
          <div className="flex justify-end px-8 pt-6 pb-4">
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="text-[13px] text-foreground/50 transition-opacity duration-150 ease-out hover:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-foreground/15 focus-visible:outline-offset-2"
            >
              Close
            </button>
          </div>

        {/* Navigation Links - Clean vertical list, no section headers */}
        <nav className="flex flex-col flex-1 px-8 pt-6">
          <div className="flex flex-col gap-5">
            <Link
              to="/auth"
              onClick={onClose}
              className="text-[15px] font-semibold text-foreground transition-opacity duration-150 ease-out hover:opacity-70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-foreground/15 focus-visible:outline-offset-2"
            >
              Client Sign In
            </Link>
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

          {/* Divider */}
          <div className="border-t border-foreground/[0.06] mt-8 mb-5" />

          {/* Footer Links */}
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
      </FocusTrap>
    </>
  );
}

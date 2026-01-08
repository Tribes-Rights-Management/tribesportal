import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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

  return (
    <>
      {/* Backdrop - subtle overlay */}
      <div
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-200 ease-out ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 right-0 h-screen w-[320px] bg-white z-50 flex flex-col shadow-xl transition-transform duration-250 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Desktop navigation"
      >
        {/* Header with Close button */}
        <div className="flex justify-end px-6 pt-5 pb-2">
          <button
            onClick={onClose}
            className="text-sm text-muted-foreground hover:text-foreground transition-opacity"
          >
            Close
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col flex-1 px-6 pt-4">
          {/* Primary Section */}
          <div className="flex flex-col gap-4">
            <Link
              to="/auth"
              onClick={onClose}
              className="text-[15px] font-medium text-foreground hover:opacity-70 transition-opacity"
            >
              Client Sign In
            </Link>
            <Link
              to="/services"
              onClick={onClose}
              className="text-[15px] text-foreground hover:opacity-70 transition-opacity"
            >
              Services
            </Link>
            <Link
              to="/licensing-account"
              onClick={onClose}
              className="text-[15px] text-foreground hover:opacity-70 transition-opacity"
            >
              Request Licensing Access
            </Link>
            <Link
              to="/service-inquiry"
              onClick={onClose}
              className="text-[15px] text-foreground hover:opacity-70 transition-opacity"
            >
              Inquire About Services
            </Link>
            <Link
              to="/contact"
              onClick={onClose}
              className="text-[15px] text-foreground hover:opacity-70 transition-opacity"
            >
              Contact
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-border mt-8 mb-6" />

          {/* Secondary/Footer Links */}
          <div className="flex flex-col gap-3">
            <Link
              to="/privacy"
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-opacity"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-opacity"
            >
              Terms of Use
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
}

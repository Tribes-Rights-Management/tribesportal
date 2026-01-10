import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Unified auth layout wrapper for all authentication surfaces.
 * Provides consistent container, spacing, and footer positioning.
 */
export function AuthLayout({ children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      <div className="w-full max-w-[440px]">
        {children}
      </div>
      
      {/* Footer - positioned at bottom on taller screens */}
      {footer && (
        <div className="mt-auto pt-12 pb-8">
          {footer}
        </div>
      )}
    </div>
  );
}

/**
 * Standard auth page header with title and optional subtitle.
 */
interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-[24px] sm:text-[28px] font-semibold text-foreground tracking-[-0.02em] leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 text-sm text-black/60 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/**
 * Standard auth footer text (muted, small).
 */
export function AuthFooter({ children }: { children: ReactNode }) {
  return (
    <p className="text-[12px] text-black/40 text-center">
      {children}
    </p>
  );
}

/**
 * Secondary action link styling for auth pages.
 */
interface AuthSecondaryActionProps {
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  children: ReactNode;
}

export function AuthSecondaryAction({ onClick, href, disabled, children }: AuthSecondaryActionProps) {
  const baseClasses = "text-[13px] text-black/60 hover:text-black transition-colors disabled:opacity-50 focus:outline-none focus-visible:underline";
  
  if (href) {
    return (
      <a href={href} className={baseClasses}>
        {children}
      </a>
    );
  }
  
  return (
    <button 
      type="button" 
      onClick={onClick} 
      disabled={disabled}
      className={baseClasses}
    >
      {children}
    </button>
  );
}

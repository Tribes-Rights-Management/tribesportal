/**
 * FooterSpacer Component
 * 
 * Creates breathing room between content and footer when content is short.
 * Theme-aware: uses the correct background color based on page theme.
 * 
 * USAGE:
 * - Add at the end of main content, before the footer
 * - Set isDark={true} for dark-themed pages
 * - This ensures no white fall-through on mobile
 */

import { THEME_DARK_BG, THEME_LIGHT_BG, FOOTER_SPACER } from "@/lib/theme";

interface FooterSpacerProps {
  /** Use dark theme background */
  isDark?: boolean;
}

export function FooterSpacer({ isDark = false }: FooterSpacerProps) {
  return (
    <div
      className="w-full"
      style={{
        backgroundColor: isDark ? THEME_DARK_BG : THEME_LIGHT_BG,
        minHeight: `${FOOTER_SPACER.mobile}px`,
      }}
      aria-hidden="true"
    >
      {/* Responsive height via media query would be ideal, but inline style suffices */}
      <style>{`
        @media (min-width: 768px) {
          [data-footer-spacer] {
            min-height: ${FOOTER_SPACER.desktop}px !important;
          }
        }
      `}</style>
      <div data-footer-spacer className="w-full h-full" />
    </div>
  );
}

import { FOOTER_COPY } from "@/constants/institutional-copy";

/**
 * APP FOOTER — INSTITUTIONAL GLOBAL FOOTER
 * 
 * Displays copyright and audit logging notice.
 * Used across all authenticated surfaces.
 */
export function AppFooter() {
  const currentYear = new Date().getFullYear();
  const copyright = FOOTER_COPY.COPYRIGHT.replace("{year}", currentYear.toString());
  
  return (
    <footer 
      className="py-4 px-6"
      style={{ borderTop: '1px solid var(--platform-border)' }}
    >
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p 
          className="text-[12px]"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          {copyright}
        </p>
        <p 
          className="text-[11px]"
          style={{ color: 'var(--platform-text-muted)', opacity: 0.6 }}
        >
          {FOOTER_COPY.AUDIT_NOTICE}
        </p>
      </div>
    </footer>
  );
}

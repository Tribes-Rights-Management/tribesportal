import { ReactNode } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { CONTENT_CONTAINER_CLASS } from "@/lib/layout";

/**
 * BODY PAGE LAYOUT — GLOBAL STANDARD (LOCKED)
 * 
 * This component enforces a single, institutional-grade layout standard
 * for ALL non-root marketing and body pages.
 * 
 * Typography scale (locked):
 * - H1: 32px mobile / 40px desktop, semibold, -0.015em tracking
 * - Lede: 16px, muted-foreground, 1.65 line-height
 * - H2: 20px, medium weight
 * 
 * Spacing (locked):
 * - Header to content: pt-12 (48px)
 * - H1 to lede: mb-3 (12px)
 * - Lede to first section: mb-10 (40px)
 * - Section gap: space-y-10 (40px)
 * 
 * NO page-specific overrides allowed.
 * Pages using this layout: /services, /privacy, /terms, /our-approach,
 * /how-publishing-admin-works, /how-licensing-works, etc.
 */

interface ContentPageLayoutProps {
  children: ReactNode;
  /** Page title - renders as locked H1 */
  title?: string;
  /** Page lede/subtitle - renders below H1 with locked styling */
  lede?: string;
  /** @deprecated Use 'lede' instead */
  description?: string;
}

export function ContentPageLayout({ children, title, lede, description }: ContentPageLayoutProps) {
  // Support legacy 'description' prop but prefer 'lede'
  const ledeText = lede || description;

  return (
    <PublicLayout>
      {/* Body page spacing: tight top gap after header (LOCKED) */}
      <section className="pt-12 pb-16 md:pb-20">
        <div className={CONTENT_CONTAINER_CLASS}>
          <div className="max-w-[700px]">
            {/* H1 — Locked typography from index.css, mb-3 spacing */}
            {title && (
              <h1 className="text-foreground mb-3">
                {title}
              </h1>
            )}
            {/* Lede — 16px, muted, mb-10 to first section */}
            {ledeText && (
              <p className="text-base text-muted-foreground leading-relaxed mb-10">
                {ledeText}
              </p>
            )}
            {/* Content area — prose styling removed for explicit control */}
            <div className="space-y-10">
              {children}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

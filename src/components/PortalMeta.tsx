import { useEffect } from "react";

interface PortalMetaProps {
  title?: string;
}

/**
 * Sets portal-specific meta tags for authenticated pages.
 * Uses the same canonical OG image as all other pages (non-regression lock).
 */
export function PortalMeta({ title }: PortalMetaProps) {
  useEffect(() => {
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');

    const portalTitle = title ? `${title} | TRIBES Portal` : "TRIBES | Portal";
    const portalDescription = "Tribes Rights Management Platform";

    // Store original values for cleanup
    const originals = {
      ogTitle: ogTitle?.getAttribute("content"),
      ogDescription: ogDescription?.getAttribute("content"),
      twitterTitle: twitterTitle?.getAttribute("content"),
      twitterDescription: twitterDescription?.getAttribute("content"),
    };

    // Set portal-specific title/description (OG image remains canonical - do not change)
    ogTitle?.setAttribute("content", portalTitle);
    ogDescription?.setAttribute("content", portalDescription);
    twitterTitle?.setAttribute("content", portalTitle);
    twitterDescription?.setAttribute("content", portalDescription);

    // Update document title
    document.title = portalTitle;

    // Cleanup: restore original values when component unmounts
    return () => {
      if (originals.ogTitle) ogTitle?.setAttribute("content", originals.ogTitle);
      if (originals.ogDescription) ogDescription?.setAttribute("content", originals.ogDescription);
      if (originals.twitterTitle) twitterTitle?.setAttribute("content", originals.twitterTitle);
      if (originals.twitterDescription) twitterDescription?.setAttribute("content", originals.twitterDescription);
    };
  }, [title]);

  return null;
}

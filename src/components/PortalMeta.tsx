import { useEffect } from "react";

interface PortalMetaProps {
  title?: string;
}

/**
 * Sets portal-specific Open Graph meta tags for authenticated pages.
 * Uses the portal OG image variant instead of the public marketing image.
 */
export function PortalMeta({ title }: PortalMetaProps) {
  useEffect(() => {
    const ogImage = document.querySelector('meta[property="og:image"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');

    const portalTitle = title ? `${title} | TRIBES Portal` : "TRIBES | Portal";
    const portalDescription = "Tribes Rights Management Platform";
    const portalImage = "/og-portal.png";

    // Store original values for cleanup
    const originals = {
      ogImage: ogImage?.getAttribute("content"),
      ogTitle: ogTitle?.getAttribute("content"),
      ogDescription: ogDescription?.getAttribute("content"),
      twitterImage: twitterImage?.getAttribute("content"),
      twitterTitle: twitterTitle?.getAttribute("content"),
      twitterDescription: twitterDescription?.getAttribute("content"),
    };

    // Set portal-specific values
    ogImage?.setAttribute("content", portalImage);
    ogTitle?.setAttribute("content", portalTitle);
    ogDescription?.setAttribute("content", portalDescription);
    twitterImage?.setAttribute("content", portalImage);
    twitterTitle?.setAttribute("content", portalTitle);
    twitterDescription?.setAttribute("content", portalDescription);

    // Update document title
    document.title = portalTitle;

    // Cleanup: restore original values when component unmounts
    return () => {
      if (originals.ogImage) ogImage?.setAttribute("content", originals.ogImage);
      if (originals.ogTitle) ogTitle?.setAttribute("content", originals.ogTitle);
      if (originals.ogDescription) ogDescription?.setAttribute("content", originals.ogDescription);
      if (originals.twitterImage) twitterImage?.setAttribute("content", originals.twitterImage);
      if (originals.twitterTitle) twitterTitle?.setAttribute("content", originals.twitterTitle);
      if (originals.twitterDescription) twitterDescription?.setAttribute("content", originals.twitterDescription);
    };
  }, [title]);

  return null;
}

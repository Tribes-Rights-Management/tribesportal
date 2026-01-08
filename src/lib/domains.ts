/**
 * Domain Configuration for TRIBES
 *
 * This file manages the split between:
 * - Marketing site: tribesrightsmanagement.com
 * - App (authenticated): app.tribesrightsmanagement.com
 */

// Production domains
const MARKETING_DOMAIN = "tribesrightsmanagement.com";
const APP_DOMAIN = "app.tribesrightsmanagement.com";

// Development/preview patterns
const PREVIEW_PATTERNS = [
  "localhost",
  "127.0.0.1",
  ".lovableproject.com",
  ".lovable.app",
  ".vercel.app",
  ".netlify.app",
];

/**
 * Check if we're in a development/preview environment
 */
export function isPreviewEnvironment(): boolean {
  const hostname = window.location.hostname;
  return PREVIEW_PATTERNS.some(pattern =>
    pattern.startsWith(".")
      ? hostname.endsWith(pattern)
      : hostname.includes(pattern)
  );
}

/**
 * Check if we're on the marketing domain
 */
export function isMarketingDomain(): boolean {
  const hostname = window.location.hostname;

  // In preview, treat as combined (allow all routes)
  if (isPreviewEnvironment()) {
    return true;
  }

  return hostname === MARKETING_DOMAIN || hostname === `www.${MARKETING_DOMAIN}`;
}

/**
 * Check if we're on the app subdomain
 */
export function isAppDomain(): boolean {
  const hostname = window.location.hostname;

  // In preview, treat as combined (allow all routes)
  if (isPreviewEnvironment()) {
    return true;
  }

  return hostname === APP_DOMAIN;
}

/**
 * Get the full URL for the marketing site
 */
export function getMarketingSiteUrl(path: string = "/"): string {
  if (isPreviewEnvironment()) {
    // In preview, use relative paths
    return path;
  }
  return `https://${MARKETING_DOMAIN}${path}`;
}

/**
 * Get the full URL for the app
 */
export function getAppUrl(path: string = "/", redirect?: string): string {
  if (isPreviewEnvironment()) {
    // In preview, use relative paths
    if (redirect) {
      return `${path}?redirect=${encodeURIComponent(redirect)}`;
    }
    return path;
  }

  let url = `https://${APP_DOMAIN}${path}`;
  if (redirect) {
    url += `?redirect=${encodeURIComponent(redirect)}`;
  }
  return url;
}

/**
 * Get sign-in URL for the app
 */
export function getSignInUrl(redirect?: string): string {
  return getAppUrl("/auth", redirect);
}

/**
 * Marketing site routes (served on root domain only)
 */
export const MARKETING_ROUTES = [
  "/",
  "/our-approach",
  "/services",
  "/inquire",
  "/licensing",
  "/contact",
  "/how-licensing-works",
  "/how-publishing-administration-works",
  "/privacy",
  "/terms",
] as const;

/**
 * App routes (served on app subdomain only)
 */
export const APP_ROUTES_PREFIXES = [
  "/auth",
  "/portal",
  "/admin",
  "/request",
] as const;

/**
 * Check if a path is a marketing route
 */
export function isMarketingRoute(path: string): boolean {
  const normalizedPath = path.split("?")[0]; // Remove query params
  return MARKETING_ROUTES.includes(normalizedPath as any);
}

/**
 * Check if a path is an app route
 */
export function isAppRoute(path: string): boolean {
  const normalizedPath = path.split("?")[0]; // Remove query params
  return APP_ROUTES_PREFIXES.some(prefix => normalizedPath.startsWith(prefix));
}

/**
 * Check if the current route should be accessible on the current domain
 */
export function isRouteAccessible(path: string): boolean {
  // In preview, all routes are accessible
  if (isPreviewEnvironment()) {
    return true;
  }

  // On marketing domain, only marketing routes are accessible
  if (isMarketingDomain()) {
    return isMarketingRoute(path);
  }

  // On app domain, only app routes are accessible
  if (isAppDomain()) {
    return isAppRoute(path);
  }

  // Unknown domain, allow access
  return true;
}

/**
 * Get redirect URL if on wrong domain
 */
export function getCorrectDomainUrl(path: string): string | null {
  if (isPreviewEnvironment()) {
    return null; // No redirect needed in preview
  }

  if (isMarketingDomain() && isAppRoute(path)) {
    return getAppUrl(path);
  }

  if (isAppDomain() && isMarketingRoute(path)) {
    return getMarketingSiteUrl(path);
  }

  return null;
}

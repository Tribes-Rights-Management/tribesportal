import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useMemo } from "react";

/**
 * ROUTE METADATA HOOK — SCOPE-SAFE NAVIGATION
 * 
 * Purpose: Enforce scope-safe back navigation per Navigation Enforcement Spec.
 * 
 * Rules:
 * - Back navigation must return to immediate parent view, not a higher-level directory
 * - Never jump across scopes (org → system or system → org) unless explicit
 * - Back navigation must resolve using explicit parent route metadata, not browser history alone
 * 
 * Examples:
 * - Member Details → back → Active Users
 * - Authority Record → back → Member Details
 * - Organization Settings → back → Organization Overview
 */

// Route ownership and parent declarations
// Each route declares its scope and valid parent
export type RouteScope = "system" | "organization" | "user" | "auth" | "public";

interface RouteDefinition {
  scope: RouteScope;
  parentPath: string | null;
  label: string;
}

// Canonical route metadata registry
const routeRegistry: Record<string, RouteDefinition> = {
  // Auth routes (no back navigation)
  "/auth/sign-in": { scope: "auth", parentPath: null, label: "Sign In" },
  "/auth/check-email": { scope: "auth", parentPath: "/auth/sign-in", label: "Check Email" },
  "/auth/error": { scope: "auth", parentPath: "/auth/sign-in", label: "Error" },
  "/auth/callback": { scope: "auth", parentPath: null, label: "Callback" },
  "/auth/link-expired": { scope: "auth", parentPath: "/auth/sign-in", label: "Link Expired" },
  "/auth/unauthorized": { scope: "auth", parentPath: null, label: "Unauthorized" },

  // System Console routes (company-level governance)
  "/admin": { scope: "system", parentPath: null, label: "System Console" },
  "/admin/approvals": { scope: "system", parentPath: "/admin", label: "Approvals" },
  "/admin/tenants": { scope: "system", parentPath: "/admin", label: "Workspaces" },
  "/admin/users": { scope: "system", parentPath: "/admin", label: "Active Users" },
  "/admin/users/:userId/permissions": { scope: "system", parentPath: "/admin/users", label: "Permissions" },
  "/admin/settings": { scope: "system", parentPath: "/admin", label: "Settings" },
  "/admin/rls-audit": { scope: "system", parentPath: "/admin", label: "RLS Audit" },
  "/admin/security": { scope: "system", parentPath: "/admin", label: "Security" },
  "/admin/security/rls": { scope: "system", parentPath: "/admin/security", label: "RLS Policies" },
  "/admin/security/auth": { scope: "system", parentPath: "/admin/security", label: "Auth Review" },
  "/admin/security/sessions": { scope: "system", parentPath: "/admin/security", label: "Sessions" },
  "/admin/disclosures": { scope: "system", parentPath: "/admin", label: "Disclosures" },
  "/admin/chain": { scope: "system", parentPath: "/admin", label: "Correlation Chain" },

  // Auditor routes (read-only external)
  "/auditor": { scope: "system", parentPath: null, label: "Auditor Portal" },
  "/auditor/activity": { scope: "system", parentPath: "/auditor", label: "Activity Log" },
  "/auditor/licensing": { scope: "system", parentPath: "/auditor", label: "Licensing" },
  "/auditor/access": { scope: "system", parentPath: "/auditor", label: "Access Log" },
  "/auditor/chain": { scope: "system", parentPath: "/auditor", label: "Correlation Chain" },

  // Licensing module (organization-scoped)
  "/licensing": { scope: "organization", parentPath: null, label: "Licensing" },
  "/licensing/requests": { scope: "organization", parentPath: "/licensing", label: "Requests" },
  "/licensing/agreements": { scope: "organization", parentPath: "/licensing", label: "Agreements" },

  // Portal module (organization-scoped)
  "/portal": { scope: "organization", parentPath: null, label: "Tribes Admin" },
  "/portal/agreements": { scope: "organization", parentPath: "/portal", label: "Agreements" },
  "/portal/statements": { scope: "organization", parentPath: "/portal", label: "Statements" },
  "/portal/documents": { scope: "organization", parentPath: "/portal", label: "Documents" },

  // Legacy app routes (organization-scoped)
  "/app/licensing": { scope: "organization", parentPath: null, label: "Licensing" },
  "/app/licensing/catalog": { scope: "organization", parentPath: "/app/licensing", label: "Catalog" },
  "/app/licensing/requests": { scope: "organization", parentPath: "/app/licensing", label: "Requests" },
  "/app/licensing/licenses": { scope: "organization", parentPath: "/app/licensing", label: "Licenses" },
  "/app/licensing/reports": { scope: "organization", parentPath: "/app/licensing", label: "Reports" },
  "/app/licensing/documents": { scope: "organization", parentPath: "/app/licensing", label: "Documents" },
  "/app/licensing/settings": { scope: "organization", parentPath: "/app/licensing", label: "Settings" },

  "/app/publishing": { scope: "organization", parentPath: null, label: "Publishing" },
  "/app/publishing/catalog": { scope: "organization", parentPath: "/app/publishing", label: "Catalog" },
  "/app/publishing/works": { scope: "organization", parentPath: "/app/publishing", label: "Works" },
  "/app/publishing/splits": { scope: "organization", parentPath: "/app/publishing", label: "Splits" },
  "/app/publishing/registrations": { scope: "organization", parentPath: "/app/publishing", label: "Registrations" },
  "/app/publishing/statements": { scope: "organization", parentPath: "/app/publishing", label: "Statements" },
  "/app/publishing/payments": { scope: "organization", parentPath: "/app/publishing", label: "Payments" },
  "/app/publishing/documents": { scope: "organization", parentPath: "/app/publishing", label: "Documents" },
  "/app/publishing/access-requests": { scope: "organization", parentPath: "/app/publishing", label: "Access Requests" },
  "/app/publishing/settings": { scope: "organization", parentPath: "/app/publishing", label: "Settings" },

  // Account routes (user-scoped)
  "/account": { scope: "user", parentPath: null, label: "Account" },
  "/account/profile": { scope: "user", parentPath: "/account", label: "Profile" },
  "/account/security": { scope: "user", parentPath: "/account", label: "Security" },
  "/account/preferences": { scope: "user", parentPath: "/account", label: "Preferences" },
};

/**
 * Match a pathname to a route definition, handling dynamic segments
 */
function matchRoute(pathname: string): RouteDefinition | null {
  // First try exact match
  if (routeRegistry[pathname]) {
    return routeRegistry[pathname];
  }

  // Try matching with dynamic segments
  for (const [pattern, definition] of Object.entries(routeRegistry)) {
    if (pattern.includes(":")) {
      const patternParts = pattern.split("/");
      const pathParts = pathname.split("/");

      if (patternParts.length === pathParts.length) {
        const matches = patternParts.every((part, i) => 
          part.startsWith(":") || part === pathParts[i]
        );
        if (matches) {
          return definition;
        }
      }
    }
  }

  return null;
}

/**
 * Hook for scope-safe navigation
 */
export function useRouteMetadata() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentRoute = useMemo(() => {
    return matchRoute(location.pathname);
  }, [location.pathname]);

  const scope = currentRoute?.scope ?? "public";
  const parentPath = currentRoute?.parentPath;
  const label = currentRoute?.label ?? "";

  /**
   * Navigate back to parent route (scope-safe)
   * Uses explicit parent metadata, not browser history
   */
  const navigateToParent = useCallback(() => {
    if (parentPath) {
      navigate(parentPath);
    }
  }, [parentPath, navigate]);

  /**
   * Check if back navigation is available
   */
  const canNavigateBack = Boolean(parentPath);

  /**
   * Get the parent route label for display
   */
  const parentLabel = useMemo(() => {
    if (!parentPath) return null;
    const parentRoute = matchRoute(parentPath);
    return parentRoute?.label ?? null;
  }, [parentPath]);

  return {
    scope,
    parentPath,
    label,
    parentLabel,
    canNavigateBack,
    navigateToParent,
    currentRoute,
  };
}

/**
 * Get route scope for a given path (static utility)
 */
export function getRouteScope(pathname: string): RouteScope {
  const route = matchRoute(pathname);
  return route?.scope ?? "public";
}

/**
 * Check if navigation between two paths crosses scope boundaries
 */
export function crossesScopeBoundary(fromPath: string, toPath: string): boolean {
  const fromScope = getRouteScope(fromPath);
  const toScope = getRouteScope(toPath);
  
  // Crossing between system and organization is a boundary violation
  if (fromScope === "system" && toScope === "organization") return true;
  if (fromScope === "organization" && toScope === "system") return true;
  
  return false;
}

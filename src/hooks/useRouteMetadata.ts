import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useMemo } from "react";

/**
 * NAVIGATION MAP REGISTRY — CANONICAL ROUTING ENFORCEMENT
 * 
 * Core Principle:
 * Navigation is structural, not contextual. Browser history must never determine back behavior.
 * 
 * Rules:
 * 1. Every route declares exactly one logical parent route
 * 2. Back arrow always navigates to declared parent (not browser history)
 * 3. System Console routes may only link to other System Console routes
 * 4. Organization-scoped routes must never link directly to system-level routes
 * 5. Cross-scope navigation requires explicit transition
 * 6. Mobile and desktop share the same navigation graph
 * 
 * Routes without explicit parent are root-level only (null parentPath).
 * Unregistered routes fail safely and redirect to nearest valid parent.
 */

// Route ownership and parent declarations
export type RouteScope = "system" | "organization" | "user" | "auth" | "public";

/** Entry intent type - how the route should be accessed */
export type EntryIntent = 
  | "navigation"      // Standard navigation CTA (link, button)
  | "deep-link"       // Direct URL access allowed
  | "explicit-only"   // Requires explicit CTA with intent tracking
  | "redirect";       // Only accessible via system redirect

export interface RouteDefinition {
  scope: RouteScope;
  parentPath: string | null;
  label: string;
  /** Required roles for access (validated at deep-link) */
  requiredRoles?: ("admin" | "auditor" | "user")[];
  /** Required permission for module access */
  requiredPermission?: string;
  /** Breadcrumb chain for UI rendering */
  breadcrumbs?: string[];
  /** How this route should be accessed */
  entryIntent?: EntryIntent;
  /** Whether this is a governance/authority page requiring deliberate entry */
  isGovernancePage?: boolean;
}

/**
 * CANONICAL ROUTE REGISTRY
 * 
 * This is the authoritative navigation map for the Tribes platform.
 * Any new route MUST be registered here with explicit parent declaration.
 * Routes not registered will redirect to their nearest valid parent.
 */
export const routeRegistry: Record<string, RouteDefinition> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // AUTH ROUTES (Scope: auth)
  // No back navigation for auth flows
  // ═══════════════════════════════════════════════════════════════════════════
  "/auth/sign-in": { 
    scope: "auth", 
    parentPath: null, 
    label: "Sign In",
    breadcrumbs: ["Sign In"]
  },
  "/auth/check-email": { 
    scope: "auth", 
    parentPath: "/auth/sign-in", 
    label: "Check Email",
    breadcrumbs: ["Sign In", "Check Email"]
  },
  "/auth/error": { 
    scope: "auth", 
    parentPath: "/auth/sign-in", 
    label: "Error",
    breadcrumbs: ["Sign In", "Error"]
  },
  "/auth/callback": { 
    scope: "auth", 
    parentPath: null, 
    label: "Callback"
  },
  "/auth/link-expired": { 
    scope: "auth", 
    parentPath: "/auth/sign-in", 
    label: "Link Expired",
    breadcrumbs: ["Sign In", "Link Expired"]
  },
  "/auth/unauthorized": { 
    scope: "auth", 
    parentPath: null, 
    label: "Unauthorized"
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SYSTEM CONSOLE ROUTES (Scope: system)
  // Company-level governance only
  // Access: platform_admin, external_auditor (read-only)
  // ═══════════════════════════════════════════════════════════════════════════
  "/admin": { 
    scope: "system", 
    parentPath: null, 
    label: "Governance Overview",
    requiredRoles: ["admin", "auditor"],
    breadcrumbs: ["System Console"]
  },
  "/admin/approvals": { 
    scope: "system", 
    parentPath: "/admin", 
    label: "Approvals",
    requiredRoles: ["admin"],
    breadcrumbs: ["System Console", "Approvals"]
  },
  "/admin/tenants": { 
    scope: "system", 
    parentPath: "/admin", 
    label: "Workspaces",
    requiredRoles: ["admin"],
    breadcrumbs: ["System Console", "Workspaces"]
  },
  "/admin/users": { 
    scope: "system", 
    parentPath: "/admin", 
    label: "Active Users",
    requiredRoles: ["admin"],
    breadcrumbs: ["System Console", "Active Users"]
  },
  "/admin/users/:userId": { 
    scope: "system", 
    parentPath: "/admin/users", 
    label: "Member Details",
    requiredRoles: ["admin"],
    breadcrumbs: ["System Console", "Active Users", "Member Details"]
  },
  "/admin/users/:userId/permissions": { 
    scope: "system", 
    parentPath: "/admin/users/:userId", 
    label: "Permissions",
    requiredRoles: ["admin"],
    breadcrumbs: ["System Console", "Active Users", "Member Details", "Permissions"]
  },
  "/admin/users/:userId/authority": { 
    scope: "system", 
    parentPath: "/admin/users/:userId", 
    label: "Authority Record",
    requiredRoles: ["admin"],
    breadcrumbs: ["System Console", "Active Users", "Member Details", "Authority Record"]
  },
  "/admin/settings": { 
    scope: "system", 
    parentPath: "/admin", 
    label: "Settings",
    requiredRoles: ["admin"],
    breadcrumbs: ["System Console", "Settings"]
  },
  "/admin/rls-audit": { 
    scope: "system", 
    parentPath: "/admin", 
    label: "RLS Audit",
    requiredRoles: ["admin"],
    breadcrumbs: ["System Console", "RLS Audit"]
  },
  "/admin/security": { 
    scope: "system", 
    parentPath: "/admin", 
    label: "Security",
    requiredRoles: ["admin"],
    breadcrumbs: ["System Console", "Security"]
  },
  "/admin/security/rls": { 
    scope: "system", 
    parentPath: "/admin/security", 
    label: "RLS Policies",
    requiredRoles: ["admin"],
    breadcrumbs: ["System Console", "Security", "RLS Policies"]
  },
  "/admin/security/auth": { 
    scope: "system", 
    parentPath: "/admin/security", 
    label: "Auth Review",
    requiredRoles: ["admin"],
    breadcrumbs: ["System Console", "Security", "Auth Review"]
  },
  "/admin/security/sessions": { 
    scope: "system", 
    parentPath: "/admin/security", 
    label: "Sessions",
    requiredRoles: ["admin"],
    breadcrumbs: ["System Console", "Security", "Sessions"]
  },
  "/admin/disclosures": { 
    scope: "system", 
    parentPath: "/admin", 
    label: "Disclosures",
    requiredRoles: ["admin", "auditor"],
    breadcrumbs: ["System Console", "Disclosures"]
  },
  "/admin/chain": { 
    scope: "system", 
    parentPath: "/admin", 
    label: "Correlation Chain",
    requiredRoles: ["admin", "auditor"],
    breadcrumbs: ["System Console", "Correlation Chain"]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SYSTEM CONSOLE — FINANCIAL GOVERNANCE (Scope: system)
  // Access: platform_admin only
  // ─────────────────────────────────────────────────────────────────────────
  "/admin/billing": { 
    scope: "system", 
    parentPath: "/admin", 
    label: "Financial Governance",
    requiredRoles: ["admin"],
    breadcrumbs: ["System Console", "Financial Governance"],
    isGovernancePage: true
  },
  "/admin/billing/revenue": { 
    scope: "system", 
    parentPath: "/admin/billing", 
    label: "Revenue Overview",
    requiredRoles: ["admin"],
    breadcrumbs: ["System Console", "Financial Governance", "Revenue Overview"]
  },
  "/admin/billing/plans": { 
    scope: "system", 
    parentPath: "/admin/billing", 
    label: "Plans & Pricing",
    requiredRoles: ["admin"],
    breadcrumbs: ["System Console", "Financial Governance", "Plans & Pricing"],
    isGovernancePage: true
  },
  "/admin/billing/invoices": { 
    scope: "system", 
    parentPath: "/admin/billing", 
    label: "Invoice Ledger",
    requiredRoles: ["admin", "auditor"],
    breadcrumbs: ["System Console", "Financial Governance", "Invoice Ledger"]
  },
  "/admin/billing/providers": { 
    scope: "system", 
    parentPath: "/admin/billing", 
    label: "Payment Providers",
    requiredRoles: ["admin"],
    breadcrumbs: ["System Console", "Financial Governance", "Payment Providers"],
    isGovernancePage: true
  },
  "/admin/billing/refunds": { 
    scope: "system", 
    parentPath: "/admin/billing", 
    label: "Refunds",
    requiredRoles: ["admin"],
    breadcrumbs: ["System Console", "Financial Governance", "Refunds"],
    isGovernancePage: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EXTERNAL AUDITOR ROUTES (Scope: system, read-only)
  // Access: external_auditor, platform_admin
  // ═══════════════════════════════════════════════════════════════════════════
  "/auditor": { 
    scope: "system", 
    parentPath: null, 
    label: "Auditor Portal",
    requiredRoles: ["auditor", "admin"],
    breadcrumbs: ["Auditor Portal"]
  },
  "/auditor/activity": { 
    scope: "system", 
    parentPath: "/auditor", 
    label: "Activity Log",
    requiredRoles: ["auditor", "admin"],
    breadcrumbs: ["Auditor Portal", "Activity Log"]
  },
  "/auditor/licensing": { 
    scope: "system", 
    parentPath: "/auditor", 
    label: "Licensing",
    requiredRoles: ["auditor", "admin"],
    breadcrumbs: ["Auditor Portal", "Licensing"]
  },
  "/auditor/access": { 
    scope: "system", 
    parentPath: "/auditor", 
    label: "Access Log",
    requiredRoles: ["auditor", "admin"],
    breadcrumbs: ["Auditor Portal", "Access Log"]
  },
  "/auditor/chain": { 
    scope: "system", 
    parentPath: "/auditor", 
    label: "Correlation Chain",
    requiredRoles: ["auditor", "admin"],
    breadcrumbs: ["Auditor Portal", "Correlation Chain"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LICENSING MODULE (Scope: organization)
  // Access: licensing.view, licensing.manage, licensing.approve
  // ═══════════════════════════════════════════════════════════════════════════
  "/licensing": { 
    scope: "organization", 
    parentPath: null, 
    label: "Licensing Overview",
    requiredPermission: "licensing.view",
    breadcrumbs: ["Licensing"]
  },
  "/licensing/requests": { 
    scope: "organization", 
    parentPath: "/licensing", 
    label: "Requests",
    requiredPermission: "licensing.view",
    breadcrumbs: ["Licensing", "Requests"]
  },
  "/licensing/requests/:requestId": { 
    scope: "organization", 
    parentPath: "/licensing/requests", 
    label: "Request Details",
    requiredPermission: "licensing.view",
    breadcrumbs: ["Licensing", "Requests", "Request Details"]
  },
  "/licensing/agreements": { 
    scope: "organization", 
    parentPath: "/licensing", 
    label: "Agreements",
    requiredPermission: "licensing.view",
    breadcrumbs: ["Licensing", "Agreements"]
  },
  "/licensing/agreements/:agreementId": { 
    scope: "organization", 
    parentPath: "/licensing/agreements", 
    label: "Agreement Details",
    requiredPermission: "licensing.view",
    breadcrumbs: ["Licensing", "Agreements", "Agreement Details"]
  },
  "/licensing/payments": { 
    scope: "organization", 
    parentPath: "/licensing", 
    label: "Payments",
    requiredPermission: "licensing.view",
    breadcrumbs: ["Licensing", "Payments"]
  },
  "/licensing/payments/fees": { 
    scope: "organization", 
    parentPath: "/licensing/payments", 
    label: "License Fees",
    requiredPermission: "licensing.view",
    breadcrumbs: ["Licensing", "Payments", "License Fees"]
  },
  "/licensing/payments/receipts": { 
    scope: "organization", 
    parentPath: "/licensing/payments", 
    label: "Receipts",
    requiredPermission: "licensing.view",
    breadcrumbs: ["Licensing", "Payments", "Receipts"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TRIBES ADMIN MODULE (Scope: organization)
  // Access: portal.view, portal.download, portal.submit
  // ═══════════════════════════════════════════════════════════════════════════
  "/portal": { 
    scope: "organization", 
    parentPath: null, 
    label: "Tribes Admin Overview",
    requiredPermission: "portal.view",
    breadcrumbs: ["Tribes Admin"]
  },
  "/portal/agreements": { 
    scope: "organization", 
    parentPath: "/portal", 
    label: "Agreements",
    requiredPermission: "portal.view",
    breadcrumbs: ["Tribes Admin", "Agreements"]
  },
  "/portal/statements": { 
    scope: "organization", 
    parentPath: "/portal", 
    label: "Statements",
    requiredPermission: "portal.view",
    breadcrumbs: ["Tribes Admin", "Statements"]
  },
  "/portal/documents": { 
    scope: "organization", 
    parentPath: "/portal", 
    label: "Documents",
    requiredPermission: "portal.view",
    breadcrumbs: ["Tribes Admin", "Documents"]
  },
  "/portal/payments": { 
    scope: "organization", 
    parentPath: "/portal", 
    label: "Payments",
    requiredPermission: "portal.view",
    breadcrumbs: ["Tribes Admin", "Payments"]
  },
  "/portal/payments/invoices": { 
    scope: "organization", 
    parentPath: "/portal/payments", 
    label: "Invoices",
    requiredPermission: "portal.view",
    breadcrumbs: ["Tribes Admin", "Payments", "Invoices"]
  },
  "/portal/payments/methods": { 
    scope: "organization", 
    parentPath: "/portal/payments", 
    label: "Payment Methods",
    requiredPermission: "portal.view",
    breadcrumbs: ["Tribes Admin", "Payments", "Payment Methods"]
  },
  "/portal/payments/history": { 
    scope: "organization", 
    parentPath: "/portal/payments", 
    label: "Payment History",
    requiredPermission: "portal.view",
    breadcrumbs: ["Tribes Admin", "Payments", "Payment History"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEGACY APP ROUTES (Scope: organization)
  // Maintained for backward compatibility
  // ═══════════════════════════════════════════════════════════════════════════
  "/app": {
    scope: "organization",
    parentPath: null,
    label: "App",
    breadcrumbs: ["App"]
  },
  "/app/licensing": { 
    scope: "organization", 
    parentPath: null, 
    label: "Licensing",
    breadcrumbs: ["Licensing"]
  },
  "/app/licensing/catalog": { 
    scope: "organization", 
    parentPath: "/app/licensing", 
    label: "Catalog",
    breadcrumbs: ["Licensing", "Catalog"]
  },
  "/app/licensing/requests": { 
    scope: "organization", 
    parentPath: "/app/licensing", 
    label: "Requests",
    breadcrumbs: ["Licensing", "Requests"]
  },
  "/app/licensing/licenses": { 
    scope: "organization", 
    parentPath: "/app/licensing", 
    label: "Licenses",
    breadcrumbs: ["Licensing", "Licenses"]
  },
  "/app/licensing/reports": { 
    scope: "organization", 
    parentPath: "/app/licensing", 
    label: "Reports",
    breadcrumbs: ["Licensing", "Reports"]
  },
  "/app/licensing/documents": { 
    scope: "organization", 
    parentPath: "/app/licensing", 
    label: "Documents",
    breadcrumbs: ["Licensing", "Documents"]
  },
  "/app/licensing/settings": { 
    scope: "organization", 
    parentPath: "/app/licensing", 
    label: "Settings",
    breadcrumbs: ["Licensing", "Settings"]
  },
  "/app/publishing": { 
    scope: "organization", 
    parentPath: null, 
    label: "Publishing",
    breadcrumbs: ["Publishing"]
  },
  "/app/publishing/catalog": { 
    scope: "organization", 
    parentPath: "/app/publishing", 
    label: "Catalog",
    breadcrumbs: ["Publishing", "Catalog"]
  },
  "/app/publishing/works": { 
    scope: "organization", 
    parentPath: "/app/publishing", 
    label: "Works",
    breadcrumbs: ["Publishing", "Works"]
  },
  "/app/publishing/splits": { 
    scope: "organization", 
    parentPath: "/app/publishing", 
    label: "Splits",
    breadcrumbs: ["Publishing", "Splits"]
  },
  "/app/publishing/registrations": { 
    scope: "organization", 
    parentPath: "/app/publishing", 
    label: "Registrations",
    breadcrumbs: ["Publishing", "Registrations"]
  },
  "/app/publishing/statements": { 
    scope: "organization", 
    parentPath: "/app/publishing", 
    label: "Statements",
    breadcrumbs: ["Publishing", "Statements"]
  },
  "/app/publishing/payments": { 
    scope: "organization", 
    parentPath: "/app/publishing", 
    label: "Payments",
    breadcrumbs: ["Publishing", "Payments"]
  },
  "/app/publishing/documents": { 
    scope: "organization", 
    parentPath: "/app/publishing", 
    label: "Documents",
    breadcrumbs: ["Publishing", "Documents"]
  },
  "/app/publishing/access-requests": { 
    scope: "organization", 
    parentPath: "/app/publishing", 
    label: "Access Requests",
    breadcrumbs: ["Publishing", "Access Requests"]
  },
  "/app/publishing/settings": { 
    scope: "organization", 
    parentPath: "/app/publishing", 
    label: "Settings",
    breadcrumbs: ["Publishing", "Settings"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ACCOUNT ROUTES (Scope: user)
  // Available to all authenticated users
  // ═══════════════════════════════════════════════════════════════════════════
  "/account": { 
    scope: "user", 
    parentPath: null, 
    label: "Account",
    breadcrumbs: ["Account"]
  },
  "/account/profile": { 
    scope: "user", 
    parentPath: "/account", 
    label: "Profile",
    breadcrumbs: ["Account", "Profile"]
  },
  "/account/security": { 
    scope: "user", 
    parentPath: "/account", 
    label: "Security",
    breadcrumbs: ["Account", "Security"]
  },
  "/account/preferences": { 
    scope: "user", 
    parentPath: "/account", 
    label: "Preferences",
    breadcrumbs: ["Account", "Preferences"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ACCESS STATE ROUTES (Scope: public)
  // Boundary screens for access control
  // ═══════════════════════════════════════════════════════════════════════════
  "/app/pending": {
    scope: "public",
    parentPath: null,
    label: "Pending Approval",
    breadcrumbs: ["Pending Approval"]
  },
  "/app/no-access": {
    scope: "public",
    parentPath: null,
    label: "No Access",
    breadcrumbs: ["No Access"]
  },
  "/app/suspended": {
    scope: "public",
    parentPath: null,
    label: "Access Suspended",
    breadcrumbs: ["Access Suspended"]
  },
  "/app/restricted": {
    scope: "public",
    parentPath: null,
    label: "Access Restricted",
    breadcrumbs: ["Access Restricted"]
  },
  "/restricted": {
    scope: "public",
    parentPath: null,
    label: "Access Restricted",
    breadcrumbs: ["Access Restricted"]
  },
};

/**
 * Match a pathname to a route definition, handling dynamic segments
 */
export function matchRoute(pathname: string): RouteDefinition | null {
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
 * Get the pattern that matched (with dynamic segments)
 */
export function getMatchedPattern(pathname: string): string | null {
  // First try exact match
  if (routeRegistry[pathname]) {
    return pathname;
  }

  // Try matching with dynamic segments
  for (const pattern of Object.keys(routeRegistry)) {
    if (pattern.includes(":")) {
      const patternParts = pattern.split("/");
      const pathParts = pathname.split("/");

      if (patternParts.length === pathParts.length) {
        const matches = patternParts.every((part, i) => 
          part.startsWith(":") || part === pathParts[i]
        );
        if (matches) {
          return pattern;
        }
      }
    }
  }

  return null;
}

/**
 * Check if a route is registered in the navigation map
 */
export function isRegisteredRoute(pathname: string): boolean {
  return matchRoute(pathname) !== null;
}

/**
 * Get nearest valid parent for unregistered routes
 * Walks up the path hierarchy to find a registered parent
 */
export function getNearestValidParent(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  
  // Walk up the path hierarchy
  while (parts.length > 0) {
    parts.pop();
    const parentPath = "/" + parts.join("/");
    
    if (parentPath === "/") {
      break;
    }
    
    if (matchRoute(parentPath)) {
      return parentPath;
    }
  }
  
  // Default fallbacks by prefix
  if (pathname.startsWith("/admin")) return "/admin";
  if (pathname.startsWith("/auditor")) return "/auditor";
  if (pathname.startsWith("/licensing")) return "/licensing";
  if (pathname.startsWith("/portal")) return "/portal";
  if (pathname.startsWith("/app/licensing")) return "/app/licensing";
  if (pathname.startsWith("/app/publishing")) return "/app/publishing";
  if (pathname.startsWith("/app")) return "/app";
  if (pathname.startsWith("/account")) return "/account";
  
  // Ultimate fallback
  return "/";
}

/**
 * Resolve parent path with dynamic segments filled in
 */
export function resolveParentPath(pathname: string, parentPattern: string | null): string | null {
  if (!parentPattern) return null;
  
  // If no dynamic segments, return as-is
  if (!parentPattern.includes(":")) {
    return parentPattern;
  }
  
  // Extract dynamic values from current path
  const pattern = getMatchedPattern(pathname);
  if (!pattern) return parentPattern;
  
  const patternParts = pattern.split("/");
  const pathParts = pathname.split("/");
  const parentParts = parentPattern.split("/");
  
  // Build resolved parent path
  const resolved = parentParts.map((part, i) => {
    if (part.startsWith(":")) {
      // Find the same param in the current pattern
      const paramIndex = patternParts.findIndex(p => p === part);
      if (paramIndex !== -1 && pathParts[paramIndex]) {
        return pathParts[paramIndex];
      }
    }
    return part;
  });
  
  return resolved.join("/");
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

  const isRegistered = useMemo(() => {
    return isRegisteredRoute(location.pathname);
  }, [location.pathname]);

  const scope = currentRoute?.scope ?? "public";
  const parentPattern = currentRoute?.parentPath;
  const label = currentRoute?.label ?? "";
  const breadcrumbs = currentRoute?.breadcrumbs ?? [];
  const requiredRoles = currentRoute?.requiredRoles;
  const requiredPermission = currentRoute?.requiredPermission;

  // Resolve parent path with actual dynamic values
  const parentPath = useMemo(() => {
    return resolveParentPath(location.pathname, parentPattern ?? null);
  }, [location.pathname, parentPattern]);

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
    if (!parentPattern) return null;
    const parentRoute = routeRegistry[parentPattern];
    return parentRoute?.label ?? null;
  }, [parentPattern]);

  /**
   * Redirect to nearest valid parent (for unregistered routes)
   */
  const redirectToNearestParent = useCallback(() => {
    const nearestParent = getNearestValidParent(location.pathname);
    navigate(nearestParent, { replace: true });
  }, [location.pathname, navigate]);

  return {
    scope,
    parentPath,
    parentPattern,
    label,
    parentLabel,
    breadcrumbs,
    canNavigateBack,
    navigateToParent,
    currentRoute,
    isRegistered,
    redirectToNearestParent,
    requiredRoles,
    requiredPermission,
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

/**
 * Validate if a scope transition is allowed
 */
export function isValidScopeTransition(fromScope: RouteScope, toScope: RouteScope): boolean {
  // Same scope is always valid
  if (fromScope === toScope) return true;
  
  // Auth can transition to anywhere
  if (fromScope === "auth") return true;
  
  // Public can transition to anywhere
  if (fromScope === "public") return true;
  
  // User scope can access itself and organization
  if (fromScope === "user" && (toScope === "user" || toScope === "organization")) return true;
  
  // Organization scope stays in organization or user
  if (fromScope === "organization" && (toScope === "organization" || toScope === "user")) return true;
  
  // System scope stays in system or user
  if (fromScope === "system" && (toScope === "system" || toScope === "user")) return true;
  
  // Cross-scope transitions require explicit action (not allowed via normal navigation)
  return false;
}

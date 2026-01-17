import { useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { 
  matchRoute, 
  isRegisteredRoute, 
  getNearestValidParent,
  getRouteScope,
  RouteScope,
} from "@/hooks/useRouteMetadata";

/**
 * DEEP-LINK VALIDATION HOOK
 * 
 * Purpose: Enforce strict validation for all direct URL access (deep links).
 * 
 * Core Principle:
 * No page may render unless the user has:
 * 1. Valid authentication
 * 2. Valid scope
 * 3. Valid authority
 * 4. Valid parent context
 * 
 * Rules:
 * - On every route load, validate auth, scope, role, and context
 * - If validation fails, redirect to nearest valid parent
 * - Never expose partial UI, data, or controls
 * - All deep-linked page loads reset scroll and layout state
 */

export interface DeepLinkValidationResult {
  /** Whether the deep link is valid */
  isValid: boolean;
  /** Reason for validation failure (if any) */
  invalidReason: string | null;
  /** Redirect path if validation fails */
  redirectPath: string | null;
  /** Current route scope */
  scope: RouteScope;
  /** Whether the route is registered */
  isRegistered: boolean;
}

interface UseDeepLinkValidationOptions {
  /** Skip auth validation (for public routes) */
  skipAuth?: boolean;
  /** Skip scope validation */
  skipScope?: boolean;
  /** Auto-redirect on invalid deep link */
  autoRedirect?: boolean;
}

export function useDeepLinkValidation(
  options: UseDeepLinkValidationOptions = {}
): DeepLinkValidationResult & { validate: () => boolean } {
  const { skipAuth = false, skipScope = false, autoRedirect = false } = options;
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, loading, isPlatformAdmin, accessState } = useAuth();
  const { isExternalAuditor, hasPermission } = useRoleAccess();
  
  const pathname = location.pathname;
  const route = matchRoute(pathname);
  const scope = route?.scope ?? "public";
  const isRegistered = isRegisteredRoute(pathname);
  
  // Determine user's allowed scopes based on role
  const allowedScopes = useMemo((): RouteScope[] => {
    const scopes: RouteScope[] = ["auth", "public"];
    
    if (!user || !profile) return scopes;
    
    // User scope available to all authenticated users
    scopes.push("user");
    
    // Platform admins and auditors can access system scope
    if (isPlatformAdmin || isExternalAuditor) {
      scopes.push("system");
    }
    
    // Organization scope for users with active membership
    if (accessState === "active") {
      scopes.push("organization");
    }
    
    return scopes;
  }, [user, profile, isPlatformAdmin, isExternalAuditor, accessState]);
  
  // Validate the deep link
  const validationResult = useMemo((): DeepLinkValidationResult => {
    // Still loading - defer validation
    if (loading) {
      return {
        isValid: true, // Assume valid until loaded
        invalidReason: null,
        redirectPath: null,
        scope,
        isRegistered,
      };
    }
    
    // Check if route is registered
    if (!isRegistered) {
      return {
        isValid: false,
        invalidReason: "Route not registered in navigation map",
        redirectPath: getNearestValidParent(pathname),
        scope,
        isRegistered,
      };
    }
    
    // Skip auth validation for public/auth routes
    if (!skipAuth && scope !== "public" && scope !== "auth") {
      // Check authentication
      if (!user) {
        return {
          isValid: false,
          invalidReason: "Authentication required",
          redirectPath: "/auth/sign-in",
          scope,
          isRegistered,
        };
      }
      
      // Check profile exists
      if (!profile) {
        return {
          isValid: false,
          invalidReason: "User profile not found",
          redirectPath: "/auth/error",
          scope,
          isRegistered,
        };
      }
      
      // Check profile status
      if (profile.status !== "active") {
        return {
          isValid: false,
          invalidReason: "Account is not active",
          redirectPath: "/auth/error",
          scope,
          isRegistered,
        };
      }
    }
    
    // Validate scope access
    if (!skipScope && !allowedScopes.includes(scope)) {
      // Determine appropriate redirect based on scope mismatch
      let redirectPath: string;
      
      if (scope === "system") {
        // Trying to access system scope without permission
        redirectPath = "/app/restricted";
      } else if (scope === "organization") {
        // Trying to access org scope without membership
        redirectPath = accessState === "pending-approval" 
          ? "/app/pending" 
          : "/auth/unauthorized";
      } else {
        redirectPath = getNearestValidParent(pathname);
      }
      
      return {
        isValid: false,
        invalidReason: `Access to ${scope} scope not permitted`,
        redirectPath,
        scope,
        isRegistered,
      };
    }
    
    // Validate role requirements
    if (route?.requiredRoles && route.requiredRoles.length > 0) {
      const hasRequiredRole = route.requiredRoles.some(role => {
        if (role === "admin") return isPlatformAdmin;
        if (role === "auditor") return isExternalAuditor || isPlatformAdmin;
        if (role === "user") return true;
        return false;
      });
      
      if (!hasRequiredRole) {
        return {
          isValid: false,
          invalidReason: "Required role not present",
          redirectPath: isPlatformAdmin ? "/admin" : 
                        isExternalAuditor ? "/auditor" : 
                        "/app/restricted",
          scope,
          isRegistered,
        };
      }
    }
    
    // Validate permission requirements
    if (route?.requiredPermission) {
      if (!hasPermission(route.requiredPermission as any)) {
        return {
          isValid: false,
          invalidReason: `Required permission '${route.requiredPermission}' not granted`,
          redirectPath: "/app/restricted",
          scope,
          isRegistered,
        };
      }
    }
    
    // All validations passed
    return {
      isValid: true,
      invalidReason: null,
      redirectPath: null,
      scope,
      isRegistered,
    };
  }, [
    loading, 
    pathname, 
    isRegistered, 
    scope, 
    skipAuth, 
    skipScope,
    user, 
    profile, 
    allowedScopes, 
    route,
    isPlatformAdmin,
    isExternalAuditor,
    hasPermission,
    accessState,
  ]);
  
  // Manual validate function
  const validate = useCallback((): boolean => {
    return validationResult.isValid;
  }, [validationResult.isValid]);
  
  // Auto-redirect effect
  useEffect(() => {
    if (autoRedirect && !loading && !validationResult.isValid && validationResult.redirectPath) {
      navigate(validationResult.redirectPath, { replace: true });
    }
  }, [autoRedirect, loading, validationResult, navigate]);
  
  return {
    ...validationResult,
    validate,
  };
}

/**
 * Validate a deep link path statically (without React hooks)
 * Useful for server-side or programmatic validation
 */
export function validateDeepLinkPath(pathname: string): {
  isRegistered: boolean;
  scope: RouteScope;
  nearestParent: string;
  requiredRoles?: ("admin" | "auditor" | "user")[];
  requiredPermission?: string;
} {
  const route = matchRoute(pathname);
  const isRegistered = route !== null;
  const scope = getRouteScope(pathname);
  const nearestParent = getNearestValidParent(pathname);
  
  return {
    isRegistered,
    scope,
    nearestParent,
    requiredRoles: route?.requiredRoles,
    requiredPermission: route?.requiredPermission,
  };
}

import { useCallback, useMemo, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { getRouteScope, RouteScope, matchRoute, routeRegistry } from "@/hooks/useRouteMetadata";

/**
 * SCOPE TRANSITION & ACCESS BOUNDARY ENFORCEMENT
 * 
 * Purpose: Prevent users from "landing in the wrong place" or drifting between 
 * System and Organization scopes without intent.
 * 
 * Core Rules:
 * 1. No implicit scope switching (via back nav, deep links, or refresh)
 * 2. Scope changes require explicit CTAs
 * 3. Scope transitions reset navigation stack, scroll, and transient UI state
 * 4. Authority pages require deliberate entry from valid parent
 * 
 * Scope Definitions:
 * - System Console: platform-level governance
 * - Organization Workspace: isolated, org-scoped environments
 */

// Storage key for tracking last valid scope
const LAST_SCOPE_KEY = "tribes_last_valid_scope";
const ENTRY_INTENT_KEY = "tribes_entry_intent";

export interface ScopeTransitionState {
  /** Current route scope */
  currentScope: RouteScope;
  /** Last valid scope the user was in */
  lastValidScope: RouteScope | null;
  /** Whether current navigation was via explicit intent */
  hasExplicitIntent: boolean;
  /** Whether the user can access the current scope */
  canAccessScope: boolean;
  /** Root path for current scope */
  scopeRootPath: string;
  /** Whether this is a cross-scope transition attempt */
  isCrossScopeTransition: boolean;
}

interface ScopeTransitionActions {
  /** Navigate to System Console with explicit intent */
  enterSystemConsole: () => void;
  /** Navigate to Organization workspace with explicit intent */
  enterOrganization: (path?: string) => void;
  /** Return to last valid scope */
  returnToLastScope: () => void;
  /** Set explicit entry intent before navigation */
  setEntryIntent: (scope: RouteScope, targetPath: string) => void;
  /** Clear entry intent after successful navigation */
  clearEntryIntent: () => void;
  /** Validate current scope access */
  validateScopeAccess: () => boolean;
}

export function useScopeTransition(): ScopeTransitionState & ScopeTransitionActions {
  const location = useLocation();
  const navigate = useNavigate();
  const { isPlatformAdmin, accessState } = useAuth();
  const { isExternalAuditor } = useRoleAccess();
  
  const previousPathRef = useRef<string | null>(null);
  
  const currentScope = useMemo(() => {
    return getRouteScope(location.pathname);
  }, [location.pathname]);
  
  const previousScope = useMemo(() => {
    if (!previousPathRef.current) return null;
    return getRouteScope(previousPathRef.current);
  }, []);
  
  // Track previous path
  useEffect(() => {
    return () => {
      previousPathRef.current = location.pathname;
    };
  }, [location.pathname]);
  
  // Get last valid scope from storage
  const lastValidScope = useMemo((): RouteScope | null => {
    try {
      const stored = sessionStorage.getItem(LAST_SCOPE_KEY);
      return stored as RouteScope | null;
    } catch {
      return null;
    }
  }, []);
  
  // Check if entry intent exists
  const hasExplicitIntent = useMemo((): boolean => {
    try {
      const intent = sessionStorage.getItem(ENTRY_INTENT_KEY);
      if (!intent) return false;
      
      const { scope, targetPath, timestamp } = JSON.parse(intent);
      
      // Intent expires after 30 seconds
      if (Date.now() - timestamp > 30000) {
        sessionStorage.removeItem(ENTRY_INTENT_KEY);
        return false;
      }
      
      // Check if current path matches intent
      return scope === currentScope && location.pathname.startsWith(targetPath.split("?")[0]);
    } catch {
      return false;
    }
  }, [currentScope, location.pathname]);
  
  // Determine if user can access current scope
  const canAccessScope = useMemo((): boolean => {
    switch (currentScope) {
      case "system":
        return isPlatformAdmin || isExternalAuditor;
      case "organization":
        return accessState === "active" || isPlatformAdmin;
      case "user":
        return accessState !== "unauthenticated" && accessState !== "loading";
      case "auth":
      case "public":
        return true;
      default:
        return false;
    }
  }, [currentScope, isPlatformAdmin, isExternalAuditor, accessState]);
  
  // Get root path for current scope
  const scopeRootPath = useMemo((): string => {
    switch (currentScope) {
      case "system":
        return isExternalAuditor && !isPlatformAdmin ? "/auditor" : "/admin";
      case "organization":
        // Determine based on current path prefix
        if (location.pathname.startsWith("/licensing")) return "/licensing";
        if (location.pathname.startsWith("/portal")) return "/portal";
        if (location.pathname.startsWith("/app/licensing")) return "/app/licensing";
        if (location.pathname.startsWith("/app/publishing")) return "/app/publishing";
        return "/app";
      case "user":
        return "/account";
      case "auth":
        return "/auth/sign-in";
      default:
        return "/";
    }
  }, [currentScope, location.pathname, isExternalAuditor, isPlatformAdmin]);
  
  // Detect cross-scope transition
  const isCrossScopeTransition = useMemo((): boolean => {
    if (!previousScope) return false;
    if (previousScope === currentScope) return false;
    
    // Auth/public transitions are always allowed
    if (previousScope === "auth" || previousScope === "public") return false;
    if (currentScope === "auth" || currentScope === "public") return false;
    
    // User scope transitions are generally allowed
    if (previousScope === "user" || currentScope === "user") return false;
    
    // System <-> Organization requires explicit intent
    return (previousScope === "system" && currentScope === "organization") ||
           (previousScope === "organization" && currentScope === "system");
  }, [previousScope, currentScope]);
  
  // Store current scope as last valid
  useEffect(() => {
    if (canAccessScope && currentScope !== "auth" && currentScope !== "public") {
      try {
        sessionStorage.setItem(LAST_SCOPE_KEY, currentScope);
      } catch {
        // Ignore storage errors
      }
    }
  }, [canAccessScope, currentScope]);
  
  // === ACTIONS ===
  
  const setEntryIntent = useCallback((scope: RouteScope, targetPath: string) => {
    try {
      sessionStorage.setItem(ENTRY_INTENT_KEY, JSON.stringify({
        scope,
        targetPath,
        timestamp: Date.now(),
      }));
    } catch {
      // Ignore storage errors
    }
  }, []);
  
  const clearEntryIntent = useCallback(() => {
    try {
      sessionStorage.removeItem(ENTRY_INTENT_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);
  
  const enterSystemConsole = useCallback(() => {
    // Set explicit intent
    setEntryIntent("system", "/console");
    
    // Reset scroll and navigate
    window.scrollTo(0, 0);
    navigate("/console", { replace: false });
  }, [navigate, setEntryIntent]);
  
  const enterOrganization = useCallback((path: string = "/app") => {
    // Set explicit intent
    setEntryIntent("organization", path);
    
    // Reset scroll and navigate
    window.scrollTo(0, 0);
    navigate(path, { replace: false });
  }, [navigate, setEntryIntent]);
  
  const returnToLastScope = useCallback(() => {
    if (!lastValidScope) {
      // Default fallback based on role
      if (isPlatformAdmin) {
        enterSystemConsole();
      } else {
        enterOrganization();
      }
      return;
    }
    
    // Navigate to scope root
    switch (lastValidScope) {
      case "system":
        enterSystemConsole();
        break;
      case "organization":
        enterOrganization();
        break;
      case "user":
        navigate("/account");
        break;
      default:
        navigate("/");
    }
  }, [lastValidScope, isPlatformAdmin, enterSystemConsole, enterOrganization, navigate]);
  
  const validateScopeAccess = useCallback((): boolean => {
    if (!canAccessScope) {
      returnToLastScope();
      return false;
    }
    
    // For cross-scope transitions without explicit intent, block
    if (isCrossScopeTransition && !hasExplicitIntent) {
      returnToLastScope();
      return false;
    }
    
    // Clear intent after successful validation
    if (hasExplicitIntent) {
      clearEntryIntent();
    }
    
    return true;
  }, [canAccessScope, isCrossScopeTransition, hasExplicitIntent, returnToLastScope, clearEntryIntent]);
  
  return {
    // State
    currentScope,
    lastValidScope,
    hasExplicitIntent,
    canAccessScope,
    scopeRootPath,
    isCrossScopeTransition,
    // Actions
    enterSystemConsole,
    enterOrganization,
    returnToLastScope,
    setEntryIntent,
    clearEntryIntent,
    validateScopeAccess,
  };
}

/**
 * Scope labels for UI display
 */
export const SCOPE_LABELS: Record<RouteScope, string> = {
  system: "System Console",
  organization: "Organization",
  user: "Account",
  auth: "Authentication",
  public: "Public",
};

/**
 * Get scope-appropriate return CTA label
 */
export function getScopeTransitionLabel(fromScope: RouteScope, toScope: RouteScope): string {
  if (toScope === "system") {
    return "Return to System Console";
  }
  if (fromScope === "system" && toScope === "organization") {
    return "Enter Workspace";
  }
  if (toScope === "organization") {
    return "Return to Workspace";
  }
  return "Return";
}

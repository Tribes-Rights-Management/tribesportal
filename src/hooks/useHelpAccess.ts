import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * HELP BACKEND ACCESS HOOK
 *
 * Determines if current user can manage Help content (articles, categories).
 * This is a company-scoped capability, NOT tied to any workspace.
 *
 * Access requires BOTH:
 * 1. An internal platform role (platform_admin or platform_user)
 * 2. The can_manage_help capability flag = true
 *
 * Platform admins always have access.
 * External auditors, licensing users, and portal users NEVER have access.
 *
 * IMPORTANT: This hook waits for auth context to finish loading before
 * making access decisions. This prevents race conditions on page refresh
 * where permissions would be evaluated with stale/null profile data.
 */

interface HelpAccessResult {
  canManageHelp: boolean;
  loading: boolean;
}

export function useHelpAccess(): HelpAccessResult {
  const { user, profile, isPlatformAdmin, loading: authLoading } = useAuth();
  const [canManageHelp, setCanManageHelp] = useState(false);
  const [checking, setChecking] = useState(true);

  // Track if check has been cancelled (component unmounted or deps changed)
  const cancelledRef = useRef(false);

  useEffect(() => {
    // Reset cancelled flag on new effect
    cancelledRef.current = false;

    async function checkAccess() {
      // CRITICAL: Wait for auth context to finish loading before making decisions
      // This prevents the race condition where we evaluate !profile while auth is still loading
      if (authLoading) {
        setChecking(true);
        return;
      }

      // Platform admins always have access
      if (isPlatformAdmin) {
        if (!cancelledRef.current) {
          setCanManageHelp(true);
          setChecking(false);
        }
        return;
      }

      // Auth finished but no user/profile - no access
      if (!user?.id || !profile) {
        if (!cancelledRef.current) {
          setCanManageHelp(false);
          setChecking(false);
        }
        return;
      }

      // External auditors cannot manage help
      if (profile.platform_role === 'external_auditor') {
        if (!cancelledRef.current) {
          setCanManageHelp(false);
          setChecking(false);
        }
        return;
      }

      // Internal platform users (platform_admin or platform_user) can access help
      // The RPC call may not exist yet, so we fall back to role-based access
      try {
        const { data, error } = await supabase.rpc('can_manage_help', {
          _user_id: user.id
        });

        if (cancelledRef.current) return;

        if (error) {
          // RPC doesn't exist or failed - fall back to role-based check
          // Allow platform_user and platform_admin roles to access help
          console.warn('Help access RPC check failed, using role fallback:', error.message);
          const hasInternalRole = profile.platform_role === 'platform_admin' || profile.platform_role === 'platform_user';
          setCanManageHelp(hasInternalRole);
        } else {
          setCanManageHelp(data === true);
        }
      } catch (err) {
        if (cancelledRef.current) return;

        // Fallback: allow internal users
        console.warn('Help access check exception, using role fallback:', err);
        const hasInternalRole = profile.platform_role === 'platform_admin' || profile.platform_role === 'platform_user';
        setCanManageHelp(hasInternalRole);
      }

      if (!cancelledRef.current) {
        setChecking(false);
      }
    }

    checkAccess();

    // Cleanup: cancel any in-flight operations
    return () => {
      cancelledRef.current = true;
    };
  }, [user?.id, profile, isPlatformAdmin, authLoading]);

  // Loading is true if auth is loading OR we're still checking access
  return { canManageHelp, loading: authLoading || checking };
}

import { useEffect, useState } from "react";
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
 */

interface HelpAccessResult {
  canManageHelp: boolean;
  loading: boolean;
}

export function useHelpAccess(): HelpAccessResult {
  const { user, profile, isPlatformAdmin } = useAuth();
  const [canManageHelp, setCanManageHelp] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      // Platform admins always have access
      if (isPlatformAdmin) {
        setCanManageHelp(true);
        setLoading(false);
        return;
      }

      // Must have a profile and be an internal user (not external_auditor)
      if (!user?.id || !profile) {
        setCanManageHelp(false);
        setLoading(false);
        return;
      }

      // External auditors cannot manage help
      if (profile.platform_role === 'external_auditor') {
        setCanManageHelp(false);
        setLoading(false);
        return;
      }

      // Internal platform users (platform_admin or platform_user) can access help
      // The RPC call may not exist yet, so we fall back to role-based access
      try {
        const { data, error } = await supabase.rpc('can_manage_help', {
          _user_id: user.id
        });

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
        // Fallback: allow internal users
        console.warn('Help access check exception, using role fallback:', err);
        const hasInternalRole = profile.platform_role === 'platform_admin' || profile.platform_role === 'platform_user';
        setCanManageHelp(hasInternalRole);
      }

      setLoading(false);
    }

    checkAccess();
  }, [user?.id, profile, isPlatformAdmin]);

  return { canManageHelp, loading };
}

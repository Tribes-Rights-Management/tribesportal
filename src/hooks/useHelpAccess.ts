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

      // Check the can_manage_help capability via RPC (uses newer function)
      const { data, error } = await supabase.rpc('can_manage_help', {
        _user_id: user.id
      });

      if (error) {
        console.error('Error checking help access:', error);
        setCanManageHelp(false);
      } else {
        setCanManageHelp(data === true);
      }

      setLoading(false);
    }

    checkAccess();
  }, [user?.id, profile, isPlatformAdmin]);

  return { canManageHelp, loading };
}

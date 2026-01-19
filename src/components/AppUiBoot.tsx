import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { applyDensity } from "@/lib/density";

/**
 * AppUiBoot
 * - Applies UI density globally (html[data-ui-density])
 * - Loads tenant/workspace UI policy for the active tenant and enforces it
 * - Keeps behavior consistent across desktop + mobile
 */
export default function AppUiBoot() {
  const { activeTenant, user } = useAuth();
  const { preferences, setPolicyOverrides } = useUserPreferences();

  // 1) Load tenant policy when active tenant changes
  useEffect(() => {
    let cancelled = false;

    async function loadTenantPolicy() {
      if (!activeTenant?.tenant_id || !user?.id) {
        setPolicyOverrides({});
        return;
      }

      const { data, error } = await supabase
        .from("tenant_ui_policies")
        .select("ui_density_policy")
        .eq("tenant_id", activeTenant.tenant_id)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data?.ui_density_policy) {
        setPolicyOverrides({});
        return;
      }

      setPolicyOverrides({
        ui_density_mode: data.ui_density_policy as "comfortable" | "compact",
      });
    }

    loadTenantPolicy();
    return () => {
      cancelled = true;
    };
  }, [activeTenant?.tenant_id, user?.id, setPolicyOverrides]);

  // 2) Apply effective density to <html> globally
  useEffect(() => {
    const effective = preferences.ui_density_mode ?? "comfortable";
    applyDensity(effective);
  }, [preferences.ui_density_mode]);

  return null;
}

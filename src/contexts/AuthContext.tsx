import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { applyDensity, type DensityMode } from "@/lib/density";
import { toast } from "@/hooks/use-toast";

// Types from database enums
export type PlatformRole = Database["public"]["Enums"]["platform_role"];
export type PortalRole = Database["public"]["Enums"]["portal_role"];
export type PortalContext = Database["public"]["Enums"]["portal_context"];
export type MembershipStatus = Database["public"]["Enums"]["membership_status"];

export interface TenantMembership {
  id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_slug: string;
  status: MembershipStatus;
  role: PortalRole;
  allowed_contexts: PortalContext[];
  default_context: PortalContext | null;
}

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  platform_role: PlatformRole;
  status: MembershipStatus;
  created_at: string;
  ui_density_mode: DensityMode;
}

// Access state determines which page/route to show
export type AccessState = 
  | "loading"
  | "unauthenticated"
  | "no-profile"
  | "suspended-profile"
  | "no-access-request"     // User has zero memberships (never requested)
  | "pending-approval"      // User has memberships but all are pending/denied
  | "suspended-access"      // User has memberships but all are suspended/revoked
  | "active";               // User has at least one active membership

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  tenantMemberships: TenantMembership[];  // Only active memberships
  allMemberships: TenantMembership[];     // All memberships (any status)
  activeTenant: TenantMembership | null;
  activeContext: PortalContext | null;
  availableContexts: PortalContext[];
  loading: boolean;
  accessState: AccessState;
  isPlatformAdmin: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setActiveTenant: (tenantId: string) => void;
  setActiveContext: (context: PortalContext) => void;
  canAccessContext: (context: PortalContext) => boolean;
  hasPortalRole: (role: PortalRole) => boolean;
  setDensityMode: (mode: DensityMode) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACTIVE_TENANT_KEY = "tribes_active_tenant";
const CONTEXT_BY_TENANT_KEY = "tribes_context_by_tenant";

// Helper to get/set per-tenant context from localStorage
function getStoredContextForTenant(tenantId: string): PortalContext | null {
  try {
    const stored = localStorage.getItem(CONTEXT_BY_TENANT_KEY);
    if (stored) {
      const map = JSON.parse(stored) as Record<string, PortalContext>;
      return map[tenantId] || null;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

function setStoredContextForTenant(tenantId: string, context: PortalContext): void {
  try {
    const stored = localStorage.getItem(CONTEXT_BY_TENANT_KEY);
    const map = stored ? JSON.parse(stored) : {};
    map[tenantId] = context;
    localStorage.setItem(CONTEXT_BY_TENANT_KEY, JSON.stringify(map));
  } catch {
    // Ignore errors
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tenantMemberships, setTenantMemberships] = useState<TenantMembership[]>([]);
  const [allMemberships, setAllMemberships] = useState<TenantMembership[]>([]);
  const [activeTenant, setActiveTenantState] = useState<TenantMembership | null>(null);
  const [activeContext, setActiveContextState] = useState<PortalContext | null>(null);
  const [loading, setLoading] = useState(true);

  const isPlatformAdmin = profile?.platform_role === "platform_admin" && profile?.status === "active";

  // Derive available contexts from active tenant
  const availableContexts = activeTenant?.allowed_contexts ?? [];

  // Compute access state based on user, profile, and memberships
  const accessState: AccessState = (() => {
    if (loading) return "loading";
    if (!user) return "unauthenticated";
    if (!profile) return "no-profile";
    if (profile.status === "suspended" || profile.status === "revoked") return "suspended-profile";
    
    // Platform admins always have access
    if (isPlatformAdmin) return "active";
    
    // Check membership states
    if (allMemberships.length === 0) return "no-access-request";
    
    const hasActive = allMemberships.some(m => m.status === "active");
    if (hasActive) return "active";
    
    const hasPending = allMemberships.some(m => m.status === "pending");
    if (hasPending) return "pending-approval";
    
    // All memberships must be suspended/revoked/denied
    return "suspended-access";
  })();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Use setTimeout to avoid potential Supabase client deadlock
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setTenantMemberships([]);
          setAllMemberships([]);
          setActiveTenantState(null);
          setActiveContextState(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      // Fetch profile and ALL tenant memberships
      const [profileResult, allMembershipsResult, activeMembershipsResult] = await Promise.all([
        supabase
          .from("user_profiles")
          .select("id, user_id, email, full_name, platform_role, status, created_at, ui_density_mode")
          .eq("user_id", userId)
          .maybeSingle() as any,
        // Fetch ALL memberships (any status) for access state resolution
        supabase
          .from("tenant_memberships")
          .select(`
            id,
            tenant_id,
            status,
            role,
            allowed_contexts,
            default_context,
            tenants!inner(name, slug)
          `)
          .eq("user_id", userId),
        // Fetch only ACTIVE memberships for app access
        supabase
          .from("tenant_memberships")
          .select(`
            id,
            tenant_id,
            status,
            role,
            allowed_contexts,
            default_context,
            tenants!inner(name, slug)
          `)
          .eq("user_id", userId)
          .eq("status", "active")
      ]);

      if (profileResult.error || !profileResult.data) {
        console.error("Error fetching profile:", profileResult.error);
        setProfile(null);
        setLoading(false);
        return;
      }

      const densityMode = (profileResult.data.ui_density_mode ?? "comfortable") as DensityMode;
      
      const userProfile: UserProfile = {
        id: profileResult.data.id,
        user_id: profileResult.data.user_id,
        email: profileResult.data.email,
        full_name: profileResult.data.full_name,
        platform_role: profileResult.data.platform_role,
        status: profileResult.data.status,
        created_at: profileResult.data.created_at,
        ui_density_mode: densityMode,
      };
      setProfile(userProfile);
      
      // Apply density from user profile
      applyDensity(densityMode);

      // Process helper function
      const processMemberships = (data: any[]): TenantMembership[] => {
        return data.map((m: any) => ({
          id: m.id,
          tenant_id: m.tenant_id,
          tenant_name: m.tenants.name,
          tenant_slug: m.tenants.slug,
          status: m.status as MembershipStatus,
          role: m.role as PortalRole,
          allowed_contexts: (m.allowed_contexts || []) as PortalContext[],
          default_context: m.default_context as PortalContext | null,
        }));
      };

      // Store all memberships for access state resolution
      if (!allMembershipsResult.error && allMembershipsResult.data) {
        const all = processMemberships(allMembershipsResult.data);
        setAllMemberships(all);
      }
      
      // Process active tenant memberships for app access
      if (!activeMembershipsResult.error && activeMembershipsResult.data) {
        const memberships = processMemberships(activeMembershipsResult.data);
        setTenantMemberships(memberships);
        
        // Resolve active tenant
        const storedTenantId = localStorage.getItem(ACTIVE_TENANT_KEY);
        
        let selectedTenant = memberships.find(m => m.tenant_id === storedTenantId)
          || memberships[0]
          || null;
        
        setActiveTenantState(selectedTenant);

        // Resolve active context with priority
        if (selectedTenant) {
          const selectedContext = resolveContextForTenant(selectedTenant);
          
          setActiveContextState(selectedContext);
          if (selectedContext) {
            setStoredContextForTenant(selectedTenant.tenant_id, selectedContext);
          }
        }
      }
        
    } finally {
      setLoading(false);
    }
  }

  // Resolve context for a tenant using priority order
  const resolveContextForTenant = useCallback((tenant: TenantMembership): PortalContext | null => {
    const available = tenant.allowed_contexts;
    if (available.length === 0) return null;
    
    // If only one context, use it
    if (available.length === 1) return available[0];
    
    // Priority 1: Stored per-tenant preference
    const storedContext = getStoredContextForTenant(tenant.tenant_id);
    if (storedContext && available.includes(storedContext)) {
      return storedContext;
    }
    
    // Priority 2: Membership's default_context
    if (tenant.default_context && available.includes(tenant.default_context)) {
      return tenant.default_context;
    }
    
    // Priority 3: First available
    return available[0];
  }, []);

  const setActiveTenant = useCallback((tenantId: string) => {
    const tenant = tenantMemberships.find(m => m.tenant_id === tenantId);
    if (tenant) {
      setActiveTenantState(tenant);
      localStorage.setItem(ACTIVE_TENANT_KEY, tenantId);
      
      // Recompute active context for new tenant using priority order
      const currentContext = activeContext;
      if (currentContext && tenant.allowed_contexts.includes(currentContext)) {
        // Keep current context if valid, but update localStorage
        setStoredContextForTenant(tenantId, currentContext);
      } else {
        // Resolve using priority order
        const newContext = resolveContextForTenant(tenant);
        setActiveContextState(newContext);
        if (newContext) {
          setStoredContextForTenant(tenantId, newContext);
        }
      }
    }
  }, [tenantMemberships, activeContext, resolveContextForTenant]);

  const setActiveContext = useCallback((context: PortalContext) => {
    if (activeTenant?.allowed_contexts.includes(context)) {
      setActiveContextState(context);
      setStoredContextForTenant(activeTenant.tenant_id, context);
    }
  }, [activeTenant]);

  const canAccessContext = useCallback((context: PortalContext): boolean => {
    return activeTenant?.allowed_contexts.includes(context) ?? false;
  }, [activeTenant]);

  const hasPortalRole = useCallback((role: PortalRole): boolean => {
    return activeTenant?.role === role;
  }, [activeTenant]);

  const setDensityMode = useCallback(async (mode: DensityMode) => {
    if (!user?.id) return;

    // Apply instantly for responsive UI
    applyDensity(mode);

    // Persist to DB
    const { error } = await supabase
      .from("user_profiles")
      .update({ ui_density_mode: mode } as any)
      .eq("user_id", user.id);

    if (error) {
      // Revert to comfortable on failure (institutional safe default)
      applyDensity("comfortable");
      toast({ description: "Could not save preference", variant: "destructive" });
      return;
    }

    // Update local profile state so UI stays consistent
    setProfile((p) => (p ? { ...p, ui_density_mode: mode } : p));
  }, [user]);

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error as Error | null };
  };

  const refreshProfile = useCallback(async () => {
    if (user) {
      setLoading(true);
      await fetchProfile(user.id);
    }
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setTenantMemberships([]);
    setAllMemberships([]);
    setActiveTenantState(null);
    setActiveContextState(null);
    localStorage.removeItem(ACTIVE_TENANT_KEY);
    // Keep per-tenant context preferences for next login
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile,
      tenantMemberships,
      allMemberships,
      activeTenant,
      activeContext,
      availableContexts,
      loading,
      accessState,
      isPlatformAdmin,
      signInWithMagicLink, 
      signOut,
      refreshProfile,
      setActiveTenant,
      setActiveContext,
      canAccessContext,
      hasPortalRole,
      setDensityMode,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

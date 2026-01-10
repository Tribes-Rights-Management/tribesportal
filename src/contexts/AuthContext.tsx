import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Platform role (user_roles table - for platform-level admin)
export type UserRole = "admin" | "client" | "licensing";
export type UserStatus = "active" | "suspended";

// Portal roles (membership_roles table - per-tenant)
export type PortalRole = "tenant_owner" | "publishing_admin" | "licensing_user" | "read_only" | "internal_admin";
export type PortalContext = "licensing" | "publishing";
export type MembershipStatus = "active" | "suspended" | "invited";

export interface TenantMembership {
  id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_slug: string;
  status: MembershipStatus;
  portal_roles: PortalRole[];
  available_contexts: PortalContext[];
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole; // Platform role
  status: UserStatus;
  created_at: string;
  last_login_at: string | null;
  default_tenant_id: string | null;
  default_context: PortalContext | null;
}

// Access state determines which page/route to show
export type AccessState = 
  | "loading"
  | "unauthenticated"
  | "no-profile"
  | "suspended-profile"
  | "no-access-request"     // User has zero memberships (never requested)
  | "pending-approval"      // User has memberships but all are invited
  | "suspended-access"      // User has memberships but all are suspended
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
  setActiveTenant: (tenantId: string) => void;
  setActiveContext: (context: PortalContext) => void;
  canAccessContext: (context: PortalContext) => boolean;
  hasPortalRole: (role: PortalRole) => boolean;
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

  const isPlatformAdmin = profile?.role === "admin";

  // Derive available contexts from active tenant's roles
  const availableContexts = activeTenant?.available_contexts ?? [];

  // Compute access state based on user, profile, and memberships
  const accessState: AccessState = (() => {
    if (loading) return "loading";
    if (!user) return "unauthenticated";
    if (!profile) return "no-profile";
    if (profile.status === "suspended") return "suspended-profile";
    
    // Platform admins always have access
    if (isPlatformAdmin) return "active";
    
    // Check membership states
    if (allMemberships.length === 0) return "no-access-request";
    
    const hasActive = allMemberships.some(m => m.status === "active");
    if (hasActive) return "active";
    
    const hasInvited = allMemberships.some(m => m.status === "invited");
    if (hasInvited) return "pending-approval";
    
    // All memberships must be suspended
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
      // Fetch profile, role, and ALL tenant memberships (any status)
      const [profileResult, roleResult, allMembershipsResult, activeMembershipsResult] = await Promise.all([
        supabase
          .from("user_profiles")
          .select("id, email, status, created_at, last_login_at, default_tenant_id, default_context")
          .eq("id", userId)
          .is("deleted_at", null)
          .maybeSingle(),
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle(),
        // Fetch ALL memberships (any status) for access state resolution
        supabase
          .from("tenant_memberships")
          .select(`
            id,
            tenant_id,
            status,
            tenants!inner(legal_name, slug),
            membership_roles(role)
          `)
          .eq("user_id", userId)
          .is("deleted_at", null),
        // Fetch only ACTIVE memberships for app access
        supabase
          .from("tenant_memberships")
          .select(`
            id,
            tenant_id,
            status,
            tenants!inner(legal_name, slug),
            membership_roles(role)
          `)
          .eq("user_id", userId)
          .eq("status", "active")
          .is("deleted_at", null)
      ]);

      if (profileResult.error || !profileResult.data) {
        console.error("Error fetching profile:", profileResult.error);
        setProfile(null);
        setLoading(false);
        return;
      }

      if (roleResult.error || !roleResult.data) {
        console.error("Error fetching role:", roleResult.error);
        setProfile(null);
        setLoading(false);
        return;
      }

      // Fetch context permissions to map roles to contexts
      const { data: contextPerms } = await supabase
        .from("context_permissions")
        .select("role, context, allowed")
        .eq("allowed", true);

      const contextPermMap = new Map<string, PortalContext[]>();
      if (contextPerms) {
        contextPerms.forEach((perm) => {
          const existing = contextPermMap.get(perm.role) || [];
          existing.push(perm.context as PortalContext);
          contextPermMap.set(perm.role, existing);
        });
      }

      const combinedProfile: UserProfile = {
        ...profileResult.data,
        role: roleResult.data.role as UserRole,
        default_context: profileResult.data.default_context as PortalContext | null,
      };
      setProfile(combinedProfile);

      // Process helper function
      const processMemberships = (data: any[]): TenantMembership[] => {
        return data.map((m: any) => {
          const portalRoles = m.membership_roles?.map((mr: any) => mr.role as PortalRole) ?? [];
          
          // Derive available contexts from roles
          const contexts = new Set<PortalContext>();
          portalRoles.forEach((role: PortalRole) => {
            const roleContexts = contextPermMap.get(role) || [];
            roleContexts.forEach((ctx) => contexts.add(ctx));
          });

          return {
            id: m.id,
            tenant_id: m.tenant_id,
            tenant_name: m.tenants.legal_name,
            tenant_slug: m.tenants.slug,
            status: m.status as MembershipStatus,
            portal_roles: portalRoles,
            available_contexts: Array.from(contexts),
          };
        });
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
        const defaultTenantId = combinedProfile.default_tenant_id;
        
        let selectedTenant = memberships.find(m => m.tenant_id === storedTenantId)
          || memberships.find(m => m.tenant_id === defaultTenantId)
          || memberships[0]
          || null;
        
        setActiveTenantState(selectedTenant);

        // Resolve active context with priority
        if (selectedTenant) {
          const selectedContext = resolveContextForTenant(
            selectedTenant,
            combinedProfile.default_context
          );
          
          setActiveContextState(selectedContext);
          if (selectedContext) {
            setStoredContextForTenant(selectedTenant.tenant_id, selectedContext);
          }
        }
      }
      
      // Update last login
      await supabase
        .from("user_profiles")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", userId);
        
    } finally {
      setLoading(false);
    }
  }

  // Resolve context for a tenant using priority order
  const resolveContextForTenant = useCallback((
    tenant: TenantMembership,
    defaultContext: PortalContext | null
  ): PortalContext | null => {
    const available = tenant.available_contexts;
    if (available.length === 0) return null;
    
    // If only one context, use it
    if (available.length === 1) return available[0];
    
    // Priority 1: Stored per-tenant preference
    const storedContext = getStoredContextForTenant(tenant.tenant_id);
    if (storedContext && available.includes(storedContext)) {
      return storedContext;
    }
    
    // Priority 2: User's default_context from profile
    if (defaultContext && available.includes(defaultContext)) {
      return defaultContext;
    }
    
    // Priority 3: publishing_admin role → publishing
    if (tenant.portal_roles.includes("publishing_admin") && available.includes("publishing")) {
      return "publishing";
    }
    
    // Priority 4: First available (licensing by convention)
    return available.includes("licensing") ? "licensing" : available[0];
  }, []);

  const setActiveTenant = useCallback((tenantId: string) => {
    const tenant = tenantMemberships.find(m => m.tenant_id === tenantId);
    if (tenant) {
      setActiveTenantState(tenant);
      localStorage.setItem(ACTIVE_TENANT_KEY, tenantId);
      
      // Recompute active context for new tenant using priority order
      const currentContext = activeContext;
      if (currentContext && tenant.available_contexts.includes(currentContext)) {
        // Keep current context if valid, but update localStorage
        setStoredContextForTenant(tenantId, currentContext);
      } else {
        // Resolve using priority order
        const newContext = resolveContextForTenant(tenant, profile?.default_context ?? null);
        setActiveContextState(newContext);
        if (newContext) {
          setStoredContextForTenant(tenantId, newContext);
        }
      }
    }
  }, [tenantMemberships, activeContext, profile?.default_context, resolveContextForTenant]);

  const setActiveContext = useCallback((context: PortalContext) => {
    if (activeTenant?.available_contexts.includes(context)) {
      setActiveContextState(context);
      setStoredContextForTenant(activeTenant.tenant_id, context);
      
      // Persist to profile as default
      if (profile) {
        supabase
          .from("user_profiles")
          .update({ default_context: context })
          .eq("id", profile.id)
          .then(() => {});
      }
    }
  }, [activeTenant, profile]);

  const canAccessContext = useCallback((context: PortalContext): boolean => {
    return activeTenant?.available_contexts.includes(context) ?? false;
  }, [activeTenant]);

  const hasPortalRole = useCallback((role: PortalRole): boolean => {
    return activeTenant?.portal_roles.includes(role) ?? false;
  }, [activeTenant]);

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error as Error | null };
  };

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
      setActiveTenant,
      setActiveContext,
      canAccessContext,
      hasPortalRole,
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

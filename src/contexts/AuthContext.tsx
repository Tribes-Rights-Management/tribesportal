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

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  tenantMemberships: TenantMembership[];
  activeTenant: TenantMembership | null;
  activeContext: PortalContext | null;
  availableContexts: PortalContext[];
  loading: boolean;
  isPlatformAdmin: boolean;
  hasPendingApproval: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  setActiveTenant: (tenantId: string) => void;
  setActiveContext: (context: PortalContext) => void;
  canAccessContext: (context: PortalContext) => boolean;
  hasPortalRole: (role: PortalRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACTIVE_TENANT_KEY = "tribes_active_tenant";
const ACTIVE_CONTEXT_KEY = "tribes_active_context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tenantMemberships, setTenantMemberships] = useState<TenantMembership[]>([]);
  const [activeTenant, setActiveTenantState] = useState<TenantMembership | null>(null);
  const [activeContext, setActiveContextState] = useState<PortalContext | null>(null);
  const [loading, setLoading] = useState(true);

  const isPlatformAdmin = profile?.role === "admin";
  
  // User has memberships but none are active (all invited or suspended)
  const hasPendingApproval = tenantMemberships.length === 0 && user !== null && !loading && !isPlatformAdmin;

  // Derive available contexts from active tenant's roles
  const availableContexts = activeTenant?.available_contexts ?? [];

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
      // Fetch profile, role, and tenant memberships with their portal roles
      const [profileResult, roleResult, membershipsResult] = await Promise.all([
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
      
      // Process tenant memberships with portal roles
      if (!membershipsResult.error && membershipsResult.data) {
        const memberships: TenantMembership[] = membershipsResult.data.map((m: any) => {
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
        setTenantMemberships(memberships);
        
        // Resolve active tenant
        const storedTenantId = localStorage.getItem(ACTIVE_TENANT_KEY);
        const defaultTenantId = combinedProfile.default_tenant_id;
        
        let selectedTenant = memberships.find(m => m.tenant_id === storedTenantId)
          || memberships.find(m => m.tenant_id === defaultTenantId)
          || memberships[0]
          || null;
        
        setActiveTenantState(selectedTenant);

        // Resolve active context
        if (selectedTenant) {
          const storedContext = localStorage.getItem(ACTIVE_CONTEXT_KEY) as PortalContext | null;
          const defaultContext = combinedProfile.default_context;
          
          let selectedContext: PortalContext | null = null;
          
          if (storedContext && selectedTenant.available_contexts.includes(storedContext)) {
            selectedContext = storedContext;
          } else if (defaultContext && selectedTenant.available_contexts.includes(defaultContext)) {
            selectedContext = defaultContext;
          } else if (selectedTenant.available_contexts.length > 0) {
            selectedContext = selectedTenant.available_contexts[0];
          }
          
          setActiveContextState(selectedContext);
          if (selectedContext) {
            localStorage.setItem(ACTIVE_CONTEXT_KEY, selectedContext);
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

  const setActiveTenant = useCallback((tenantId: string) => {
    const tenant = tenantMemberships.find(m => m.tenant_id === tenantId);
    if (tenant) {
      setActiveTenantState(tenant);
      localStorage.setItem(ACTIVE_TENANT_KEY, tenantId);
      
      // Recompute active context for new tenant
      const currentContext = activeContext;
      if (currentContext && tenant.available_contexts.includes(currentContext)) {
        // Keep current context if valid
      } else if (tenant.available_contexts.length > 0) {
        // Switch to first available context
        const newContext = tenant.available_contexts[0];
        setActiveContextState(newContext);
        localStorage.setItem(ACTIVE_CONTEXT_KEY, newContext);
      } else {
        setActiveContextState(null);
        localStorage.removeItem(ACTIVE_CONTEXT_KEY);
      }
    }
  }, [tenantMemberships, activeContext]);

  const setActiveContext = useCallback((context: PortalContext) => {
    if (activeTenant?.available_contexts.includes(context)) {
      setActiveContextState(context);
      localStorage.setItem(ACTIVE_CONTEXT_KEY, context);
      
      // Optionally persist to profile
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
    setActiveTenantState(null);
    setActiveContextState(null);
    localStorage.removeItem(ACTIVE_TENANT_KEY);
    localStorage.removeItem(ACTIVE_CONTEXT_KEY);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile,
      tenantMemberships,
      activeTenant,
      activeContext,
      availableContexts,
      loading,
      isPlatformAdmin,
      hasPendingApproval,
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

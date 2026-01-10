import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "client" | "licensing";
export type UserStatus = "active" | "suspended";
export type MembershipRole = "admin" | "member" | "viewer";
export type MembershipStatus = "active" | "suspended" | "invited";

export interface TenantMembership {
  id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_slug: string;
  membership_role: MembershipRole;
  status: MembershipStatus;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  last_login_at: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  tenantMemberships: TenantMembership[];
  activeTenant: TenantMembership | null;
  loading: boolean;
  isPlatformAdmin: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  setActiveTenant: (tenantId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tenantMemberships, setTenantMemberships] = useState<TenantMembership[]>([]);
  const [activeTenant, setActiveTenantState] = useState<TenantMembership | null>(null);
  const [loading, setLoading] = useState(true);

  const isPlatformAdmin = profile?.role === "admin";

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
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      // Fetch profile, role, and tenant memberships in parallel
      const [profileResult, roleResult, membershipsResult] = await Promise.all([
        supabase
          .from("user_profiles")
          .select("id, email, status, created_at, last_login_at")
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
            membership_role,
            status,
            tenants!inner(legal_name, slug)
          `)
          .eq("user_id", userId)
          .eq("status", "active")
          .is("deleted_at", null)
      ]);

      if (profileResult.error || !profileResult.data) {
        console.error("Error fetching profile:", profileResult.error);
        setProfile(null);
      } else if (roleResult.error || !roleResult.data) {
        console.error("Error fetching role:", roleResult.error);
        setProfile(null);
      } else {
        const combinedProfile: UserProfile = {
          ...profileResult.data,
          role: roleResult.data.role as UserRole
        };
        setProfile(combinedProfile);
        
        // Process tenant memberships
        if (!membershipsResult.error && membershipsResult.data) {
          const memberships: TenantMembership[] = membershipsResult.data.map((m: any) => ({
            id: m.id,
            tenant_id: m.tenant_id,
            tenant_name: m.tenants.legal_name,
            tenant_slug: m.tenants.slug,
            membership_role: m.membership_role as MembershipRole,
            status: m.status as MembershipStatus,
          }));
          setTenantMemberships(memberships);
          
          // Set active tenant from localStorage or default to first
          const storedTenantId = localStorage.getItem("activeTenantId");
          const storedTenant = memberships.find(m => m.tenant_id === storedTenantId);
          setActiveTenantState(storedTenant || memberships[0] || null);
        }
        
        // Update last login
        await supabase
          .from("user_profiles")
          .update({ last_login_at: new Date().toISOString() })
          .eq("id", userId);
      }
    } finally {
      setLoading(false);
    }
  }

  const setActiveTenant = (tenantId: string) => {
    const tenant = tenantMemberships.find(m => m.tenant_id === tenantId);
    if (tenant) {
      setActiveTenantState(tenant);
      localStorage.setItem("activeTenantId", tenantId);
    }
  };

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
    localStorage.removeItem("activeTenantId");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile,
      tenantMemberships,
      activeTenant,
      loading,
      isPlatformAdmin,
      signInWithMagicLink, 
      signOut,
      setActiveTenant,
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

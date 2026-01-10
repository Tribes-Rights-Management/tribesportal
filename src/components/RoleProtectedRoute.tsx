import { Navigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function RoleProtectedRoute({ children, allowedRoles }: RoleProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // Authenticated but no profile (user not provisioned)
  if (!profile) {
    return <Navigate to="/auth/error" replace />;
  }

  // Account suspended
  if (profile.status !== "active") {
    return <Navigate to="/auth/error" replace />;
  }

  // Role not allowed
  if (!allowedRoles.includes(profile.role)) {
    // Redirect to their correct dashboard instead of error
    const roleRoutes: Record<UserRole, string> = {
      admin: "/admin",
      client: "/dashboard",
      licensing: "/licensing",
    };
    return <Navigate to={roleRoutes[profile.role]} replace />;
  }

  return <>{children}</>;
}

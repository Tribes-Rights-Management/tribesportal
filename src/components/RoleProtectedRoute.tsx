import { Navigate } from "react-router-dom";
import { useAuth, PlatformRole } from "@/contexts/AuthContext";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ("admin" | "user")[];
}

export default function RoleProtectedRoute({ children, allowedRoles }: RoleProtectedRouteProps) {
  const { user, profile, loading, isPlatformAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <p className="text-[14px] text-[#6B6B6B]">Loading data</p>
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

  // Check role: "admin" maps to platform_admin
  const isAdmin = isPlatformAdmin;
  const hasAccess = allowedRoles.includes("admin") ? isAdmin : true;

  if (!hasAccess) {
    // Redirect non-admins to app
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}

import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleAccess } from "@/hooks/useRoleAccess";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ("admin" | "user" | "auditor")[];
}

export default function RoleProtectedRoute({ children, allowedRoles }: RoleProtectedRouteProps) {
  const { user, profile, loading, isPlatformAdmin } = useAuth();
  const { isExternalAuditor } = useRoleAccess();

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

  // Check role access
  const isAdmin = isPlatformAdmin;
  const isAuditor = isExternalAuditor;

  // Determine if user has required role
  let hasAccess = false;
  
  if (allowedRoles.includes("admin") && isAdmin) {
    hasAccess = true;
  }
  if (allowedRoles.includes("admin") && isAuditor) {
    // External auditors have read-only access to System Console
    hasAccess = true;
  }
  if (allowedRoles.includes("auditor") && (isAuditor || isAdmin)) {
    // Platform admins can also access auditor routes
    hasAccess = true;
  }
  if (allowedRoles.includes("user")) {
    hasAccess = true;
  }

  if (!hasAccess) {
    // Redirect based on role
    if (isAuditor) {
      return <Navigate to="/auditor" replace />;
    }
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    // Non-privileged users go to app
    return <Navigate to="/app/restricted" replace />;
  }

  return <>{children}</>;
}

import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthSurface } from "@/components/auth/AuthSurface";
import { AuthLayout } from "@/layouts/AuthLayout";

/**
 * SignInPage - Entry point for authentication
 * Handles auth state checks and redirects, renders AuthSurface
 */
export default function SignInPage() {
  const { user, profile, loading } = useAuth();

  // If already authenticated with valid profile, redirect to appropriate dashboard
  if (!loading && user && profile) {
    if (profile.status !== "active") {
      return <Navigate to="/auth/error" replace />;
    }
    
    // Platform admins go to admin, everyone else goes to app
    if (profile.platform_role === "platform_admin") {
      return <Navigate to="/admin" replace />;
    }
    
    return <Navigate to="/app" replace />;
  }

  if (loading) {
    return (
      <AuthLayout>
        <p style={{ fontSize: '14px', color: '#8A8A8A' }}>
          Verifying access
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthSurface />
    </AuthLayout>
  );
}

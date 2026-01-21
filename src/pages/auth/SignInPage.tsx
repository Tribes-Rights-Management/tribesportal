import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthSurface } from "@/components/auth/AuthSurface";
import { AuthLayout } from "@/layouts/AuthLayout";
import { LOGOUT_REASONS } from "@/constants/session-timeout";

/**
 * SignInPage - Entry point for authentication
 * Handles auth state checks and redirects, renders AuthSurface
 */
export default function SignInPage() {
  const { user, profile, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const logoutReason = searchParams.get("reason");

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
        <p style={{ fontSize: '14px', color: 'var(--auth-body)' }}>
          Verifying access
        </p>
      </AuthLayout>
    );
  }

  // Determine logout message based on reason
  const getLogoutMessage = () => {
    switch (logoutReason) {
      case LOGOUT_REASONS.IDLE:
        return "Your session expired due to inactivity. Please sign in again.";
      case LOGOUT_REASONS.MAX_SESSION:
        return "Your session expired after 8 hours. Please sign in again.";
      case LOGOUT_REASONS.ABSOLUTE:
      case 'session-timeout': // Legacy support
      case 'session-limit':   // Legacy support
        return "Your session has expired. Please sign in again.";
      default:
        return null;
    }
  };

  const logoutMessage = getLogoutMessage();

  return (
    <AuthLayout>
      {logoutMessage && (
        <div 
          className="mb-6 py-3 px-4 rounded-md text-[13px]"
          style={{ 
            backgroundColor: 'var(--auth-input-bg)',
            color: 'var(--auth-body)',
            border: '1px solid var(--auth-input-border)'
          }}
        >
          {logoutMessage}
        </div>
      )}
      <AuthSurface />
    </AuthLayout>
  );
}

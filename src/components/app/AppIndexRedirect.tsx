import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Redirects /app to the active context dashboard.
 * This ensures /app always lands on the correct context-specific dashboard.
 */
export function AppIndexRedirect() {
  const { activeContext, hasPendingApproval, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[15px] text-[#71717A]">Loading...</p>
      </div>
    );
  }

  if (hasPendingApproval) {
    return <Navigate to="/app/pending" replace />;
  }

  if (activeContext) {
    return <Navigate to={`/app/${activeContext}`} replace />;
  }

  // Fallback - shouldn't happen if auth logic is correct
  return <Navigate to="/app/licensing" replace />;
}
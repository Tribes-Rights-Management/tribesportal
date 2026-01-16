import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Redirects /app to the active context dashboard.
 * This ensures /app always lands on the correct context-specific dashboard.
 */
export function AppIndexRedirect() {
  const { activeContext, accessState } = useAuth();

  if (accessState === "loading") {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[14px] text-[#6B6B6B]">Loading data</p>
      </div>
    );
  }

  // Route based on access state
  switch (accessState) {
    case "no-access-request":
      return <Navigate to="/app/no-access" replace />;
    case "pending-approval":
      return <Navigate to="/app/pending" replace />;
    case "suspended-access":
      return <Navigate to="/app/suspended" replace />;
  }

  if (activeContext) {
    return <Navigate to={`/app/${activeContext}`} replace />;
  }

  // Fallback - shouldn't happen if auth logic is correct
  return <Navigate to="/app/licensing" replace />;
}
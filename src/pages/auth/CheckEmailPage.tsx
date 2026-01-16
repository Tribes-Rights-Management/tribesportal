import { Navigate, useLocation } from "react-router-dom";

/**
 * CheckEmailPage - Redirect wrapper for backwards compatibility
 * Redirects to SignInPage with "sent" state for unified auth surface
 */
export default function CheckEmailPage() {
  const location = useLocation();
  const email = location.state?.email || "";

  // Redirect to SignInPage with sent state
  if (email) {
    return (
      <Navigate 
        to={`/auth/sign-in?sent=1&email=${encodeURIComponent(email)}`} 
        replace 
      />
    );
  }

  // No email - redirect to sign-in idle state
  return <Navigate to="/auth/sign-in" replace />;
}

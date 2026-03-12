import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PlatformButton } from "@/components/platform-ui";

/**
 * 404 PAGE — INSTITUTIONAL NOT FOUND (AUTHENTICATED USERS)
 * 
 * Replaces generic 404 with institutional language.
 * Directs users back to their appropriate workspace.
 * Uses unified PlatformButton for consistency.
 */
export default function NotFoundPage() {
  const navigate = useNavigate();
  const { user, isPlatformAdmin, activeContext, activeTenant } = useAuth();

  const handleReturnToWorkspace = () => {
    if (!user) {
      navigate("/auth/sign-in");
    } else if (isPlatformAdmin) {
      navigate("/admin");
    } else if (activeContext) {
      // Navigate to canonical workspace root based on context
      navigate(activeContext === "licensing" ? "/licensing" : "/admin");
    } else if (activeTenant) {
      navigate("/admin");
    } else {
      navigate("/auth/sign-in");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="max-w-[420px] w-full text-center">
        <h1 className="text-[22px] font-medium tracking-[-0.02em] mb-4 text-foreground">
          Page unavailable
        </h1>

        <p className="text-[14px] leading-relaxed mb-8 text-muted-foreground">
          This page does not exist or you do not have access to it.
        </p>

        <PlatformButton
          onClick={handleReturnToWorkspace}
          intent="primary"
          size="lg"
          fullWidth
        >
          Return to workspace
        </PlatformButton>

        <p className="text-[12px] mt-6 text-muted-foreground">
          If you believe this is an error, contact the Tribes team.
        </p>
      </div>
    </div>
  );
}

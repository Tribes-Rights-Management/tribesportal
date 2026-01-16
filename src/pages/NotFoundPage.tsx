import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * 404 PAGE — INSTITUTIONAL NOT FOUND (AUTHENTICATED USERS)
 * 
 * Replaces generic 404 with institutional language.
 * Directs users back to their appropriate workspace.
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
      navigate(`/app/${activeContext}`);
    } else if (activeTenant) {
      navigate("/portal");
    } else {
      navigate("/auth/sign-in");
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: 'var(--platform-canvas, #0A0A0B)' }}
    >
      <div className="max-w-[420px] w-full text-center">
        <h1 
          className="text-[22px] font-medium tracking-[-0.02em] mb-4"
          style={{ color: 'var(--platform-text, #E5E5E3)' }}
        >
          Page unavailable
        </h1>

        <p 
          className="text-[14px] leading-relaxed mb-8"
          style={{ color: 'var(--platform-text-secondary, #707070)' }}
        >
          This page does not exist or you do not have access to it.
        </p>

        <button
          onClick={handleReturnToWorkspace}
          className="w-full h-12 rounded text-[14px] font-medium transition-colors"
          style={{ 
            backgroundColor: 'var(--platform-text, #E5E5E3)',
            color: 'var(--platform-canvas, #0A0A0B)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          Return to workspace
        </button>

        <p 
          className="text-[12px] mt-6"
          style={{ color: 'var(--platform-text-muted, #505050)' }}
        >
          If you believe this is an error, contact the Tribes team.
        </p>
      </div>
    </div>
  );
}

import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ShieldX } from "lucide-react";

/**
 * ACCESS RESTRICTED PAGE — INSTITUTIONAL PERMISSION GATE
 * 
 * Shown when user attempts to access a route they don't have permission for.
 * This is NOT a 404 - it's a clear permission boundary.
 * 
 * Design Rules:
 * - Institutional, not apologetic
 * - Clear next action
 * - No "request access" prompts (access is controlled by admins)
 */

export default function AccessRestrictedPage() {
  const { isPlatformAdmin, activeContext, activeTenant } = useAuth();
  const navigate = useNavigate();

  const handleReturnToWorkspace = () => {
    if (isPlatformAdmin) {
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
      <div className="max-w-[380px] w-full text-center">
        {/* Icon */}
        <div 
          className="h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
        >
          <ShieldX className="h-6 w-6" style={{ color: 'var(--platform-text-muted, #707070)' }} />
        </div>

        {/* Heading */}
        <h1 
          className="text-[22px] font-medium tracking-[-0.02em] mb-3"
          style={{ color: 'var(--platform-text, #E5E5E3)' }}
        >
          Access restricted
        </h1>

        {/* Description */}
        <p 
          className="text-[14px] leading-relaxed mb-8"
          style={{ color: 'var(--platform-text-secondary, #707070)' }}
        >
          You do not have permission to access this area. 
          Access is controlled by workspace administrators.
        </p>

        {/* Primary Action */}
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

        {/* Contact Info */}
        <p 
          className="text-[12px] mt-6"
          style={{ color: 'var(--platform-text-muted, #505050)' }}
        >
          For access requests, contact your workspace administrator.
        </p>
      </div>
    </div>
  );
}

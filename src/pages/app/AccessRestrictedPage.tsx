import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

/**
 * ACCESS RESTRICTED PAGE — INSTITUTIONAL PERMISSION GATE
 * 
 * Shown when user attempts to access a route they don't have permission for.
 * This is NOT a 404 - it's a clear permission boundary.
 * 
 * Design Rules:
 * - Institutional, not apologetic
 * - Clear next action
 * - Request access only if applicable
 */

export default function AccessRestrictedPage() {
  const { isPlatformAdmin, activeContext, activeTenant } = useAuth();
  const navigate = useNavigate();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [reason, setReason] = useState("");

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

  const handleSubmitRequest = () => {
    // TODO: Implement actual access request submission
    setRequestSubmitted(true);
    setShowRequestForm(false);
  };

  // Request submitted confirmation
  if (requestSubmitted) {
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
            Request submitted
          </h1>

          <p 
            className="text-[14px] leading-relaxed mb-8"
            style={{ color: 'var(--platform-text-secondary, #707070)' }}
          >
            Your request has been received and is pending review. You will be notified once a decision has been made.
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
            Approval is required before access is granted.
          </p>
        </div>
      </div>
    );
  }

  // Request access form
  if (showRequestForm) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ backgroundColor: 'var(--platform-canvas, #0A0A0B)' }}
      >
        <div className="max-w-[420px] w-full">
          <div className="text-center mb-8">
            <h1 
              className="text-[22px] font-medium tracking-[-0.02em] mb-4"
              style={{ color: 'var(--platform-text, #E5E5E3)' }}
            >
              Request access
            </h1>

            <p 
              className="text-[14px] leading-relaxed"
              style={{ color: 'var(--platform-text-secondary, #707070)' }}
            >
              Submit a request for access to this workspace. Requests are reviewed by the Tribes team before access is granted.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label 
                className="block text-[13px] font-medium mb-2"
                style={{ color: 'var(--platform-text-secondary, #707070)' }}
              >
                Workspace requested
              </label>
              <div 
                className="h-11 px-4 flex items-center rounded"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--platform-border, #2A2A2C)',
                  color: 'var(--platform-text-muted, #505050)'
                }}
              >
                {activeTenant?.tenant_id ? "Current workspace" : "Unknown workspace"}
              </div>
            </div>

            <div>
              <label 
                className="block text-[13px] font-medium mb-2"
                style={{ color: 'var(--platform-text-secondary, #707070)' }}
              >
                Reason for access
                <span className="font-normal ml-1" style={{ color: 'var(--platform-text-muted, #505050)' }}>(optional)</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded resize-none text-[14px]"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--platform-border, #2A2A2C)',
                  color: 'var(--platform-text, #E5E5E3)'
                }}
                placeholder="Describe why you need access..."
              />
            </div>
          </div>

          <button
            onClick={handleSubmitRequest}
            className="w-full h-12 rounded text-[14px] font-medium transition-colors mb-3"
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
            Submit request
          </button>

          <button
            onClick={() => setShowRequestForm(false)}
            className="w-full h-12 rounded text-[14px] font-medium transition-colors"
            style={{ 
              backgroundColor: 'transparent',
              color: 'var(--platform-text-secondary, #707070)',
              border: '1px solid var(--platform-border, #2A2A2C)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--platform-text-muted, #505050)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--platform-border, #2A2A2C)';
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Default: Access restricted screen
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
          Access restricted
        </h1>

        <p 
          className="text-[14px] leading-relaxed mb-2"
          style={{ color: 'var(--platform-text-secondary, #707070)' }}
        >
          You do not currently have permission to access this workspace or section.
        </p>
        
        <p 
          className="text-[14px] leading-relaxed mb-8"
          style={{ color: 'var(--platform-text-secondary, #707070)' }}
        >
          Access to this area is managed by Tribes administrators to ensure proper authorization and data integrity.
        </p>

        {/* Primary Action */}
        <button
          onClick={handleReturnToWorkspace}
          className="w-full h-12 rounded text-[14px] font-medium transition-colors mb-3"
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

        {/* Secondary Action - Request Access (only if applicable) */}
        <button
          onClick={() => setShowRequestForm(true)}
          className="w-full h-12 rounded text-[14px] font-medium transition-colors"
          style={{ 
            backgroundColor: 'transparent',
            color: 'var(--platform-text-secondary, #707070)',
            border: '1px solid var(--platform-border, #2A2A2C)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--platform-text-muted, #505050)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--platform-border, #2A2A2C)';
          }}
        >
          Request access
        </button>

        {/* Footnote */}
        <p 
          className="text-[12px] mt-6"
          style={{ color: 'var(--platform-text-muted, #505050)' }}
        >
          All access requests are logged and reviewed.
        </p>
      </div>
    </div>
  );
}

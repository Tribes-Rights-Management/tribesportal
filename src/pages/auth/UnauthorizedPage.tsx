import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/layouts/AuthLayout";

/**
 * UnauthorizedPage — System boundary for pending authorization
 * 
 * DESIGN: Dark canvas, institutional language
 * Same surface as AuthSurface - no visual mode switch
 */
export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { profile, signOut, refreshProfile } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const colors = {
    heading: '#E8E8E6',
    body: '#8A8A8A',
    muted: '#5A5A5A',
    label: '#6A6A6A',
    buttonBg: '#E8E8E6',
    buttonText: '#0A0A0B',
    buttonHover: '#D0D0CE',
    buttonDisabledBg: 'rgba(255,255,255,0.08)',
    buttonDisabledText: '#5A5A5A',
  };

  const handleCheckAgain = async () => {
    setIsChecking(true);
    setHasChecked(false);

    try {
      await refreshProfile();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error checking access:", error);
      setHasChecked(true);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <AuthLayout>
      {/* System identifier */}
      <div style={{ marginBottom: '40px' }}>
        <span 
          style={{ 
            fontSize: '10px', 
            fontWeight: 500, 
            letterSpacing: '0.16em', 
            textTransform: 'uppercase',
            color: colors.muted,
          }}
        >
          Tribes Rights Management
        </span>
      </div>

      {/* Heading */}
      <h1 
        style={{ 
          fontSize: '28px', 
          fontWeight: 500, 
          lineHeight: 1.2,
          color: colors.heading,
          letterSpacing: '-0.02em',
          margin: 0,
        }}
      >
        Access pending
      </h1>

      {/* Body */}
      <p 
        style={{ 
          marginTop: '12px', 
          fontSize: '14px', 
          lineHeight: 1.5,
          color: colors.body,
        }}
      >
        Your account is awaiting authorization. You will be notified when access is granted.
      </p>

      {/* Account display */}
      {profile?.email && (
        <div style={{ marginTop: '32px' }}>
          <span style={{ fontSize: '13px', color: colors.label }}>Account: </span>
          <span style={{ fontSize: '13px', fontWeight: 500, color: colors.heading }}>{profile.email}</span>
        </div>
      )}

      {/* Status */}
      <div style={{ marginTop: '8px' }}>
        <span style={{ fontSize: '12px', color: colors.muted }}>Status: </span>
        <span style={{ fontSize: '12px', fontWeight: 500, color: colors.body }}>Pending authorization</span>
      </div>

      {/* Actions */}
      <div style={{ marginTop: '32px' }}>
        <button
          onClick={handleCheckAgain}
          disabled={isChecking}
          style={{
            width: '100%',
            height: '48px',
            borderRadius: '6px',
            fontSize: '15px',
            fontWeight: 500,
            border: 'none',
            cursor: isChecking ? 'not-allowed' : 'pointer',
            backgroundColor: isChecking ? colors.buttonDisabledBg : colors.buttonBg,
            color: isChecking ? colors.buttonDisabledText : colors.buttonText,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 100ms ease',
          }}
          onMouseOver={(e) => {
            if (!isChecking) {
              e.currentTarget.style.backgroundColor = colors.buttonHover;
            }
          }}
          onMouseOut={(e) => {
            if (!isChecking) {
              e.currentTarget.style.backgroundColor = colors.buttonBg;
            }
          }}
        >
          {isChecking ? "Checking" : "Check status"}
        </button>

        <button
          onClick={signOut}
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '8px 0',
            background: 'none',
            border: 'none',
            fontSize: '13px',
            color: colors.muted,
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'color 100ms ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = colors.body;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = colors.muted;
          }}
        >
          Sign out
        </button>
      </div>

      {/* Check feedback */}
      {hasChecked && (
        <p style={{ marginTop: '16px', fontSize: '13px', color: colors.muted }}>
          Authorization still pending.
        </p>
      )}

      {/* Contact */}
      <p 
        style={{ 
          marginTop: '48px', 
          fontSize: '12px', 
          lineHeight: 1.5,
          color: colors.muted,
        }}
      >
        Contact administrator for access assistance.
      </p>

      <p style={{ marginTop: '8px' }}>
        <a 
          href="mailto:contact@tribesassets.com"
          style={{
            fontSize: '12px',
            color: colors.muted,
            textDecoration: 'none',
            transition: 'color 100ms ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = colors.body;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = colors.muted;
          }}
        >
          contact@tribesassets.com
        </a>
      </p>
    </AuthLayout>
  );
}

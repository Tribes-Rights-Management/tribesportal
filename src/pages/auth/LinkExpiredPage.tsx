import { Link } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";

/**
 * LinkExpiredPage — System boundary for expired verification links
 * 
 * DESIGN: Dark canvas, institutional language
 * Same surface as AuthSurface - no visual mode switch
 */
export default function LinkExpiredPage() {
  const colors = {
    heading: '#E8E8E6',
    body: '#8A8A8A',
    muted: '#5A5A5A',
    buttonBg: '#E8E8E6',
    buttonText: '#0A0A0B',
    buttonHover: '#D0D0CE',
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

      {/* Heading — declarative, not apologetic */}
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
        Verification link expired
      </h1>

      {/* Body — procedural, neutral */}
      <p 
        style={{ 
          marginTop: '12px', 
          fontSize: '14px', 
          lineHeight: 1.5,
          color: colors.body,
        }}
      >
        This access link is no longer valid. Request a new verification link to continue.
      </p>

      {/* Action */}
      <div style={{ marginTop: '32px' }}>
        <Link
          to="/auth/sign-in"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '48px',
            borderRadius: '6px',
            backgroundColor: colors.buttonBg,
            color: colors.buttonText,
            fontSize: '15px',
            fontWeight: 500,
            textDecoration: 'none',
            transition: 'background-color 100ms ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = colors.buttonHover;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = colors.buttonBg;
          }}
        >
          Request new verification link
        </Link>
      </div>

      {/* Policy notice */}
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

      {/* Support */}
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

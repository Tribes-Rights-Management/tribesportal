import { Link } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";

/**
 * AuthErrorPage — System boundary for access restriction
 * 
 * DESIGN: Dark canvas, institutional language
 * Same surface as AuthSurface - no visual mode switch
 */
export default function AuthErrorPage() {
  const colors = {
    heading: '#E8E8E6',
    body: '#8A8A8A',
    muted: '#5A5A5A',
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
        Access restricted
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
        Your account is not authorized for access. Contact your administrator if you believe this is an error.
      </p>

      {/* Contact */}
      <p 
        style={{ 
          marginTop: '32px', 
          fontSize: '13px', 
          lineHeight: 1.5,
          color: colors.muted,
        }}
      >
        Contact administrator for access assistance.
      </p>

      {/* Support email */}
      <p style={{ marginTop: '8px' }}>
        <a 
          href="mailto:contact@tribesassets.com"
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: colors.heading,
            textDecoration: 'none',
            transition: 'opacity 100ms ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          contact@tribesassets.com
        </a>
      </p>

      {/* Back link */}
      <p style={{ marginTop: '48px' }}>
        <Link 
          to="/auth/sign-in"
          style={{
            fontSize: '13px',
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
          Return to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

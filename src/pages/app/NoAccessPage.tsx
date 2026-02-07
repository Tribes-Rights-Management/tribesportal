import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/layouts/AuthLayout";
import { SYSTEM_COPY } from "@/styles/tokens";
import { AppButton } from "@/components/app-ui";

/**
 * NoAccessPage - System boundary for accounts with no access record
 * 
 * DESIGN: Same dark environment as auth, institutional language
 */
export default function NoAccessPage() {
  const { profile, signOut } = useAuth();

  return (
    <AuthLayout>
      {/* System identifier */}
      <div className="mb-10 text-center">
        <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground">
          Tribes Rights Management System
        </span>
      </div>

      {/* Heading */}
      <h1 className="text-[22px] font-medium leading-[1.25] text-foreground text-center tracking-[-0.02em]">
        {SYSTEM_COPY.NO_ACCESS_TITLE}
      </h1>

      {/* Body */}
      <p className="mt-4 text-[14px] leading-[1.6] text-muted-foreground text-center">
        {SYSTEM_COPY.NO_ACCESS_BODY}
      </p>

      {/* Account display */}
      {profile?.email && (
        <div className="mt-8 text-center">
          <span className="text-[13px] text-muted-foreground">Account: </span>
          <span className="text-[13px] font-medium text-foreground">{profile.email}</span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-10 space-y-3">
        <AppButton
          variant="primary"
          size="lg"
          className="w-full h-[48px]"
          onClick={() => window.open("https://tribesassets.com/request-access", "_blank")}
        >
          Request access
        </AppButton>

        <AppButton
          variant="tertiary"
          onClick={signOut}
          className="w-full text-[13px]"
        >
          Sign out
        </AppButton>
      </div>

      {/* Contact */}
      <p className="mt-12 text-center text-[12px] leading-[1.5] text-muted-foreground">
        {SYSTEM_COPY.CONTACT_ADMIN}
      </p>

      <p className="mt-2 text-center">
        <a 
          href={`mailto:${SYSTEM_COPY.SUPPORT_EMAIL}`}
          className="text-[12px] text-muted-foreground hover:text-muted-foreground transition-colors duration-75"
        >
          {SYSTEM_COPY.SUPPORT_EMAIL}
        </a>
      </p>
    </AuthLayout>
  );
}

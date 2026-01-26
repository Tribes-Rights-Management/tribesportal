import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

/**
 * SHARED USER AVATAR — STRIPE-LEVEL CONSISTENCY
 * 
 * Centralized avatar component with size variants.
 * All headers and dropdowns must use this for consistency.
 * 
 * Sizes:
 * - sm: 28px (desktop headers)
 * - md: 32px (mobile headers)
 * - lg: 40px (profile pages)
 */

const userAvatarVariants = cva(
  "rounded-full shrink-0 inline-flex items-center justify-center font-medium uppercase focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] transition-colors duration-150",
  {
    variants: {
      size: {
        sm: "h-7 w-7 text-[10px]",
        md: "h-8 w-8 text-[10px]",
        lg: "h-10 w-10 text-[11px]",
      },
      variant: {
        default: "",
        dark: "",
        light: "",
      },
    },
    defaultVariants: {
      size: "sm",
      variant: "default",
    },
  }
);

interface UserAvatarProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof userAvatarVariants> {
  initials: string;
  asChild?: boolean;
}

const UserAvatar = React.forwardRef<HTMLButtonElement, UserAvatarProps>(
  ({ className, size, variant, initials, ...props }, ref) => {
    // Style mappings based on variant
    const styles = {
      default: {
        backgroundColor: "var(--muted-wash)",
        color: "var(--text)",
      },
      dark: {
        backgroundColor: "#2A2A2C",
        color: "rgba(255,255,255,0.7)",
      },
      light: {
        backgroundColor: "#E5E7EB",
        color: "#374151",
      },
    };

    const currentStyle = styles[variant || "default"];

    return (
      <button
        ref={ref}
        className={cn(userAvatarVariants({ size, variant, className }))}
        style={currentStyle}
        {...props}
      >
        {initials}
      </button>
    );
  }
);
UserAvatar.displayName = "UserAvatar";

// Utility to generate initials from profile
export function getInitialsFromProfile(profile?: { full_name?: string | null; email?: string | null }): string {
  if (profile?.full_name) {
    const parts = profile.full_name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (profile?.email) {
    return profile.email.slice(0, 2).toUpperCase();
  }
  return "U";
}

export { UserAvatar, userAvatarVariants };

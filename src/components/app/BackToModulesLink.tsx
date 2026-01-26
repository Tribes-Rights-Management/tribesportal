import { Link } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * BACK TO MODULES LINK — Navigation affordance
 * 
 * Renders a subtle link/button that returns to /workstations.
 * Used in workstation headers to provide navigation back to Modules Home.
 */

interface BackToModulesLinkProps {
  /** Render as icon-only (for tight headers) */
  iconOnly?: boolean;
  className?: string;
}

export function BackToModulesLink({ iconOnly = false, className }: BackToModulesLinkProps) {
  return (
    <Link
      to="/workspaces"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md transition-colors",
        "text-muted-foreground hover:text-foreground",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        iconOnly ? "p-1.5" : "px-2 py-1 text-[13px]",
        className
      )}
      style={{
        // @ts-ignore
        '--tw-ring-color': '#0071E3',
      }}
      title="Back to Modules"
    >
      <LayoutGrid className="h-4 w-4" strokeWidth={1.5} />
      {!iconOnly && <span>Modules</span>}
    </Link>
  );
}

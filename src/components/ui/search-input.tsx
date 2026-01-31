import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * SEARCH INPUT — Base Component (Single Source of Truth)
 * 
 * Standardized search field for use throughout the application.
 * Uses consistent 36px height, 16px icon, and proper padding.
 * 
 * For the global header search (with keyboard hints), use AppSearchInput.
 * For page-level search (simpler), use this SearchInput.
 */

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Additional wrapper className (for width/layout ONLY) */
  wrapperClassName?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, wrapperClassName, placeholder = "Search...", ...props }, ref) => {
    return (
      <div className={cn("relative", wrapperClassName)}>
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          strokeWidth={1.5}
        />
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          className={cn(
            // Base styles
            "h-9 w-full pl-9 pr-3",
            "text-[13px] text-foreground placeholder:text-muted-foreground",
            // Border and radius
            "bg-card border border-input rounded-lg",
            // Focus state
            "focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring",
            // Transitions
            "transition-colors",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";

export { SearchInput };

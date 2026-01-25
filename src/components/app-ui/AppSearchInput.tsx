import * as React from "react";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

/**
 * APP SEARCH INPUT — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL SEARCH INPUT COMPONENT (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Consistent search input with:
 * - Search icon
 * - Clear button when has value
 * - Keyboard shortcut hint (optional)
 * - Two variants: underline (minimal) and boxed (standard)
 * 
 * USAGE:
 *   <AppSearchInput
 *     placeholder="Search articles..."
 *     value={query}
 *     onChange={setQuery}
 *     onSubmit={handleSearch}
 *   />
 * 
 * ENFORCEMENT:
 * - All search inputs must use this component
 * - No one-off search styling
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface AppSearchInputProps {
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Submit handler (on Enter) */
  onSubmit?: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Visual variant */
  variant?: "underline" | "boxed";
  /** Show keyboard shortcut hint */
  showShortcut?: boolean;
  /** Shortcut key to display */
  shortcutKey?: string;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Additional className */
  className?: string;
}

export function AppSearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Search...",
  variant = "boxed",
  showShortcut = false,
  shortcutKey = "K",
  autoFocus = false,
  className,
}: AppSearchInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && onSubmit) {
      onSubmit();
    }
    if (e.key === "Escape") {
      onChange("");
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  const baseClasses = cn(
    "w-full text-[13px] text-foreground placeholder:text-muted-foreground/60",
    "focus:outline-none transition-colors duration-150",
    "bg-transparent"
  );

  const variantClasses = {
    underline: cn(
      "h-9 pl-7 pr-8",
      "border-0 border-b border-border",
      "focus:border-muted-foreground"
    ),
    boxed: cn(
      "h-9 pl-9 pr-9 rounded-lg",
      "border border-border bg-muted/40",
      "hover:border-muted-foreground/50",
      "focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20"
    ),
  };

  const iconPositionClasses = {
    underline: "left-0",
    boxed: "left-3",
  };

  return (
    <div className={cn("relative", className)}>
      <Search
        className={cn(
          "absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50",
          iconPositionClasses[variant]
        )}
        strokeWidth={1.25}
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(baseClasses, variantClasses[variant])}
      />
      
      {/* Clear button */}
      {value && (
        <button
          onClick={handleClear}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2",
            "p-1 rounded hover:bg-accent/50 transition-colors",
            "text-muted-foreground/50 hover:text-muted-foreground"
          )}
          type="button"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.25} />
        </button>
      )}

      {/* Keyboard shortcut hint */}
      {showShortcut && !value && (
        <div
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2",
            "flex items-center gap-0.5 text-[10px] text-muted-foreground/40"
          )}
        >
          <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/50 font-mono">
            ⌘
          </kbd>
          <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/50 font-mono">
            {shortcutKey}
          </kbd>
        </div>
      )}
    </div>
  );
}

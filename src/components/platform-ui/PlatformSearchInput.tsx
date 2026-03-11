import * as React from "react";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

/**
 * APP SEARCH INPUT — STRIPE-LIKE PILL SEARCH BAR (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL SEARCH INPUT COMPONENT (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * THIS IS THE ONLY SEARCH INPUT COMPONENT ALLOWED IN THE APP.
 * 
 * Stripe-like Visual Spec:
 * - Height: 40px (md), 36px (sm)
 * - Radius: fully rounded (rounded-full) — pill shape
 * - Background: var(--search-bg) — soft grey fill
 * - Border: none by default, subtle on focus
 * - Focus: ring-2 ring-[#0071E3] + white bg
 * - Optional keyboard hint (e.g., "/" or "⌘ K") as right-side keycap
 * 
 * USAGE:
 *   <AppSearchInput
 *     placeholder="Search..."
 *     value={query}
 *     onChange={setQuery}
 *     rightHint="/"
 *   />
 * 
 * ENFORCEMENT:
 * - All search inputs MUST use this component
 * - No hardcoded Search icons in pages
 * - No custom search input styling
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
  /** Right-side keyboard hint (e.g., "/" or "⌘ K") */
  rightHint?: string;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Size variant */
  size?: "sm" | "md";
  /** Additional className (for width/layout ONLY) */
  className?: string;
  /** Focus handler */
  onFocus?: () => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Aria label for accessibility */
  "aria-label"?: string;
}

export function AppSearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Search...",
  rightHint,
  autoFocus = false,
  size = "md",
  className,
  onFocus,
  onBlur,
  "aria-label": ariaLabel,
}: AppSearchInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);

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

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const heightClass = size === "sm" ? "h-9" : "h-11";

  return (
    <div className={cn("relative", className)}>
      {/* Search Icon - 16px, strokeWidth 1.5, vertically centered */}
      <Search
        className={cn(
          // NOTE: Tailwind spacing scale is customized in this project; use explicit px sizing.
          "absolute left-3.5 top-1/2 -translate-y-1/2 h-[16px] w-[16px] pointer-events-none transition-colors duration-150",
          isFocused ? "text-[#374151]" : "text-[#9CA3AF]"
        )}
        strokeWidth={1.5}
      />
      
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label={ariaLabel || placeholder}
        className={cn(
          // Base styles (Stripe-like pill)
          "w-full text-base sm:text-[13px] text-foreground", // 16px on mobile to prevent Safari zoom
          // Rounded corners: 8px (institutional, not playful)
          "rounded-lg",
          heightClass,
          "placeholder:text-[#9CA3AF]",
          // Background: light grey fill, white on focus
          "transition-all duration-150",
          // Very subtle border (or none)
          "border",
          // Focus: brand blue ring ONLY
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          // Padding for icons
          "pl-10",
          value ? "pr-9" : (rightHint ? "pr-14" : "pr-4")
        )}
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: isFocused ? 'var(--border-strong)' : 'var(--border-subtle)',
          boxShadow: isFocused ? '0 1px 3px rgba(0,0,0,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
        }}
      />
      
      {/* Clear button - shown when there's a value */}
      {value && (
        <button
          onClick={handleClear}
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2",
            "p-1 rounded-[6px] transition-colors",
            "text-muted-foreground/60 hover:text-muted-foreground hover:bg-[var(--muted-wash)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]"
          )}
          type="button"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      )}

      {/* Keyboard hint - shown when no value and hint is provided (Stripe-like keycap) */}
      {!value && rightHint && (
        <kbd
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2",
            "inline-flex items-center justify-center",
            "h-[22px] min-w-[22px] px-1.5 rounded-md",
            "text-xs font-medium text-[#6B7280]",
            "pointer-events-none select-none",
            "bg-white border border-[#E6E8EC]",
            "shadow-[0_1px_0_rgba(0,0,0,0.05)]"
          )}
        >
          {rightHint}
        </kbd>
      )}
    </div>
  );
}

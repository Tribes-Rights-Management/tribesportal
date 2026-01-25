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
 * THIS IS THE ONLY SEARCH INPUT COMPONENT ALLOWED IN THE APP.
 * 
 * Standards (DO NOT OVERRIDE):
 * - Height: h-9 (36px)
 * - Radius: rounded-md
 * - Background: bg-muted/40
 * - Border: border-transparent, hover:border-border
 * - Focus: ring-2 ring-[#0071E3] ring-offset-2
 * - Icons: 14px (h-3.5), strokeWidth 1.25, centered
 * 
 * USAGE:
 *   <AppSearchInput
 *     placeholder="Search articles..."
 *     value={query}
 *     onChange={setQuery}
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
  /** Show keyboard shortcut hint */
  showShortcut?: boolean;
  /** Shortcut key to display */
  shortcutKey?: string;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Additional className (for width/layout ONLY) */
  className?: string;
}

export function AppSearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Search...",
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

  return (
    <div className={cn("relative", className)}>
      {/* Search Icon - 14px, strokeWidth 1.25, vertically centered */}
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none"
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
        className={cn(
          // Base styles (LOCKED - do not override)
          "w-full h-9 text-sm text-foreground",
          "placeholder:text-muted-foreground/60",
          "bg-muted/40 rounded-md",
          "border border-transparent",
          "hover:border-border",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "transition-colors duration-150",
          // Padding for icons
          "pl-9 pr-9"
        )}
      />
      
      {/* Clear button - 14px, strokeWidth 1.25, vertically centered */}
      {value && (
        <button
          onClick={handleClear}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2",
            "p-1 rounded hover:bg-accent/50 transition-colors",
            "text-muted-foreground/60 hover:text-muted-foreground"
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

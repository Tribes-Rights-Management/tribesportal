/**
 * GLOBAL SEARCH DIALOG — iOS SPOTLIGHT-STYLE
 * 
 * Clean, minimal search interface inspired by iOS Spotlight.
 * - Full-width on mobile with slide-down animation
 * - Simple search with cancel button
 * - Clean result list with icons
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  FileText, 
  CreditCard, 
  Users, 
  Building2, 
  Receipt,
  Clock,
  X,
} from "lucide-react";
import { useSearch, SearchEntityType, SearchResult } from "@/hooks/useSearch";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// ENTITY ICONS & LABELS
// ═══════════════════════════════════════════════════════════════════════════

const ENTITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  contract: FileText,
  invoice: Receipt,
  payment: CreditCard,
  member: Users,
  organization: Building2,
};

const ENTITY_LABELS: Record<string, string> = {
  contract: "Contract",
  invoice: "Invoice",
  payment: "Payment",
  member: "Member",
  organization: "Organization",
};

// ═══════════════════════════════════════════════════════════════════════════
// RECENT SEARCHES (localStorage)
// ═══════════════════════════════════════════════════════════════════════════

const RECENT_SEARCHES_KEY = "tribes_recent_searches";
const MAX_RECENT_SEARCHES = 5;

interface RecentSearch {
  query: string;
  timestamp: number;
}

function getRecentSearches(): RecentSearch[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  if (!query.trim()) return;
  
  const searches = getRecentSearches();
  const filtered = searches.filter(s => s.query.toLowerCase() !== query.toLowerCase());
  const updated = [{ query, timestamp: Date.now() }, ...filtered].slice(0, MAX_RECENT_SEARCHES);
  
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

function clearRecentSearches() {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // Ignore storage errors
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const navigate = useNavigate();
  const { results, isLoading, search, clearSearch } = useSearch();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // Load recent searches on mount
  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches());
    }
  }, [open]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Execute search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      search({
        query: debouncedQuery,
        scopeType: "organization",
      });
    } else {
      clearSearch();
    }
  }, [debouncedQuery, search, clearSearch]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebouncedQuery("");
      clearSearch();
    }
  }, [open, clearSearch]);

  // Handle result click
  const handleResultClick = useCallback((result: SearchResult) => {
    // Save to recent searches
    addRecentSearch(query);
    
    onOpenChange(false);
    
    switch (result.entity_type) {
      case "contract":
        navigate(`/modules/contracts/${result.entity_id}`);
        break;
      case "invoice":
        navigate(`/modules/invoices/${result.entity_id}`);
        break;
      case "payment":
        navigate(`/modules/payments/${result.entity_id}`);
        break;
      case "member":
        navigate(`/admin/users/${result.entity_id}`);
        break;
      case "organization":
        navigate(`/admin/tenants/${result.entity_id}`);
        break;
    }
  }, [navigate, onOpenChange, query]);

  // Handle recent search click
  const handleRecentClick = (recentQuery: string) => {
    setQuery(recentQuery);
  };

  // Handle clear recent searches
  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange, open]);

  // Close handler
  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!open) return null;

  const hasQuery = query.trim().length > 0;
  const showRecentSearches = !hasQuery && recentSearches.length > 0;
  const showResults = hasQuery && results.length > 0;
  const showNoResults = hasQuery && !isLoading && results.length === 0;
  const showEmpty = !hasQuery && recentSearches.length === 0;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200"
        onClick={handleCancel}
      />
      
      {/* Search Panel */}
      <div 
        className={cn(
          "fixed inset-x-0 top-0 z-50",
          "bg-background",
          "animate-in slide-in-from-top-2 fade-in-0 duration-200",
          "safe-area-inset-top"
        )}
        style={{ 
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          {/* Search Input Container */}
          <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3 h-10">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className={cn(
                "flex-1 bg-transparent border-none outline-none",
                "text-base text-foreground placeholder:text-muted-foreground/60",
                "h-full"
              )}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="h-5 w-5 rounded-full bg-muted-foreground/20 flex items-center justify-center shrink-0"
              >
                <X className="h-3 w-3 text-muted-foreground" strokeWidth={2} />
              </button>
            )}
          </div>
          
          {/* Cancel Button */}
          <button
            type="button"
            onClick={handleCancel}
            className="text-[15px] font-medium text-primary shrink-0 py-2 -mr-1"
          >
            Cancel
          </button>
        </div>

        {/* Content Area */}
        <div 
          className="max-h-[60vh] overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Loading State */}
          {isLoading && (
            <div className="px-4 py-6 text-center">
              <p className="text-[14px] text-muted-foreground">Searching...</p>
            </div>
          )}

          {/* Recent Searches */}
          {showRecentSearches && !isLoading && (
            <div className="py-2">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
                  Recent
                </span>
                <button
                  type="button"
                  onClick={handleClearRecent}
                  className="text-[12px] text-primary"
                >
                  Clear
                </button>
              </div>
              <div>
                {recentSearches.map((recent, index) => (
                  <button
                    key={`${recent.query}-${index}`}
                    type="button"
                    onClick={() => handleRecentClick(recent.query)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 active:bg-muted transition-colors"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground/60 shrink-0" strokeWidth={1.5} />
                    <span className="text-[15px] text-foreground truncate">{recent.query}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {showResults && !isLoading && (
            <div className="py-2">
              {results.map((result, index) => {
                const Icon = ENTITY_ICONS[result.entity_type] || FileText;
                const isLast = index === results.length - 1;
                
                return (
                  <button
                    key={`${result.entity_type}-${result.entity_id}`}
                    type="button"
                    onClick={() => handleResultClick(result)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3",
                      "hover:bg-muted/50 active:bg-muted transition-colors",
                      !isLast && "border-b border-border/50"
                    )}
                  >
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[15px] font-medium text-foreground truncate">
                        {result.title}
                      </p>
                      <p className="text-[13px] text-muted-foreground truncate">
                        {ENTITY_LABELS[result.entity_type]}
                        {result.subtitle && ` · ${result.subtitle}`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {showNoResults && (
            <div className="px-4 py-12 text-center">
              <p className="text-[15px] text-foreground">No Results</p>
              <p className="text-[13px] text-muted-foreground mt-1">
                No matches found for "{query}"
              </p>
            </div>
          )}

          {/* Empty State (no query, no recent) */}
          {showEmpty && !isLoading && (
            <div className="px-4 py-12 text-center">
              <p className="text-[14px] text-muted-foreground">
                Search contracts, invoices, and more
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

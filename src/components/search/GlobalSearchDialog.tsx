/**
 * GLOBAL SEARCH DIALOG
 * 
 * Scope-safe search interface that respects authority boundaries.
 * Search results never reveal records outside the user's authorized scope.
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, CreditCard, Users, Building2, Receipt } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppSearchInput } from "@/components/app-ui";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearch, SearchEntityType, SearchScopeType, SearchResult } from "@/hooks/useSearch";
import { format } from "date-fns";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// ENTITY ICONS
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
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const navigate = useNavigate();
  const {
    results,
    isLoading,
    search,
    clearSearch,
    availableScopes,
    getAvailableEntityTypes,
    isPlatformAdmin,
    activeTenantId,
    activeTenantName,
  } = useSearch();

  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<SearchScopeType>("organization");
  const [entityType, setEntityType] = useState<SearchEntityType>("all");
  const [debouncedQuery, setDebouncedQuery] = useState("");

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
        scopeType: scope,
        entityTypes: entityType === "all" ? undefined : [entityType],
      });
    } else {
      clearSearch();
    }
  }, [debouncedQuery, scope, entityType, search, clearSearch]);

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
    onOpenChange(false);
    
    // Navigate based on entity type and scope
    const basePath = scope === "platform" ? "/admin" : "/modules";
    
    switch (result.entity_type) {
      case "contract":
        navigate(`${basePath}/contracts/${result.entity_id}`);
        break;
      case "invoice":
        navigate(`${basePath}/invoices/${result.entity_id}`);
        break;
      case "payment":
        navigate(`${basePath}/payments/${result.entity_id}`);
        break;
      case "member":
        navigate(`/admin/users/${result.entity_id}`);
        break;
      case "organization":
        navigate(`/admin/tenants/${result.entity_id}`);
        break;
    }
  }, [navigate, onOpenChange, scope]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange]);

  const availableEntityTypes = getAvailableEntityTypes(scope);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="sr-only">Search</DialogTitle>
          
          {/* Scope Indicator */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[12px] text-muted-foreground">Searching:</span>
            <Badge variant="outline" className="text-[11px]">
              {scope === "platform" ? "System Console" : activeTenantName || "Organization"}
            </Badge>
          </div>
          
          {/* Search Input */}
          <AppSearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search contracts, invoices, payments..."
            autoFocus
          />
          
          {/* Filters */}
          <div className="flex items-center gap-3 mt-3">
            {availableScopes.length > 1 && (
              <Select value={scope} onValueChange={(v) => setScope(v as SearchScopeType)}>
                <SelectTrigger className="w-[160px] h-8 text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableScopes.map((s) => (
                    <SelectItem key={s} value={s} className="text-[12px]">
                      {s === "platform" ? "System Console" : "Organization"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <Select value={entityType} onValueChange={(v) => setEntityType(v as SearchEntityType)}>
              <SelectTrigger className="w-[140px] h-8 text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[12px]">All types</SelectItem>
                {availableEntityTypes.map((type) => (
                  <SelectItem key={type} value={type} className="text-[12px]">
                    {ENTITY_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>
        
        {/* Results */}
        <div className="p-4 pt-3 border-t mt-3 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-[13px] text-muted-foreground">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((result) => {
                const Icon = ENTITY_ICONS[result.entity_type] || FileText;
                
                return (
                  <button
                    key={`${result.entity_type}-${result.entity_id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 text-left transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded bg-muted flex items-center justify-center">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-foreground truncate">
                          {result.title}
                        </span>
                        <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                          {ENTITY_LABELS[result.entity_type]}
                        </Badge>
                        {result.entity_status && (
                          <Badge variant="outline" className="text-[10px] flex-shrink-0">
                            {result.entity_status}
                          </Badge>
                        )}
                      </div>
                      {result.subtitle && (
                        <p className="text-[12px] text-muted-foreground truncate mt-0.5">
                          {result.subtitle}
                        </p>
                      )}
                      {result.entity_date && (
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {format(new Date(result.entity_date), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : query.trim() ? (
            <div className="text-center py-8">
              <p className="text-[13px] text-muted-foreground">
                No results found for "{query}"
              </p>
              <p className="text-[12px] text-muted-foreground mt-1">
                Results are limited to your authorized scope
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[13px] text-muted-foreground">
                Start typing to search
              </p>
              <p className="text-[12px] text-muted-foreground mt-1">
                Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[11px]">⌘K</kbd> to open search
              </p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-2 border-t bg-muted/30 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {results.length > 0 ? `${results.length} results` : "Search is scope-safe"}
          </span>
          <span className="text-[11px] text-muted-foreground">
            <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">ESC</kbd> to close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

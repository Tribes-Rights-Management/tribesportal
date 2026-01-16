import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

/**
 * LONG-SESSION UX — STATE PERSISTENCE UTILITIES
 * 
 * Purpose: Optimize for hours-long administrative use.
 * - Remember table sorting, filters, pagination per user
 * - Preserve scroll position on navigation return
 * - Do not reset views on refresh unless data changes
 */

const VIEW_STATE_PREFIX = "tribes_view_state_";
const SCROLL_STATE_PREFIX = "tribes_scroll_";

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE STATE PERSISTENCE
// ═══════════════════════════════════════════════════════════════════════════════

export interface TableViewState {
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  filters?: Record<string, string | string[]>;
  page?: number;
  pageSize?: number;
  searchQuery?: string;
}

interface UseTableViewStateOptions {
  tableId: string;
  defaultState?: Partial<TableViewState>;
}

/**
 * Persist table view state (sorting, filters, pagination) across sessions
 * 
 * Usage:
 * const { viewState, updateViewState, resetViewState } = useTableViewState({ tableId: "user-directory" });
 */
export function useTableViewState({ tableId, defaultState = {} }: UseTableViewStateOptions) {
  const { profile } = useAuth();
  const storageKey = `${VIEW_STATE_PREFIX}${tableId}_${profile?.user_id || "anon"}`;

  const [viewState, setViewState] = useState<TableViewState>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return { ...defaultState, ...JSON.parse(stored) };
      }
    } catch {
      // Ignore parse errors
    }
    return defaultState;
  });

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(viewState));
    } catch {
      // Ignore storage errors
    }
  }, [viewState, storageKey]);

  const updateViewState = useCallback((updates: Partial<TableViewState>) => {
    setViewState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetViewState = useCallback(() => {
    setViewState(defaultState);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore
    }
  }, [defaultState, storageKey]);

  return {
    viewState,
    updateViewState,
    resetViewState,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCROLL POSITION PERSISTENCE
// ═══════════════════════════════════════════════════════════════════════════════

interface UseScrollRestoreOptions {
  pageId: string;
  scrollContainerRef?: React.RefObject<HTMLElement>;
}

/**
 * Preserve scroll position on navigation return
 * 
 * Usage:
 * const { saveScrollPosition } = useScrollRestore({ pageId: "user-directory" });
 */
export function useScrollRestore({ pageId, scrollContainerRef }: UseScrollRestoreOptions) {
  const storageKey = `${SCROLL_STATE_PREFIX}${pageId}`;
  const hasRestored = useRef(false);

  // Restore scroll position on mount
  useEffect(() => {
    if (hasRestored.current) return;
    
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const scrollY = parseInt(stored, 10);
        const container = scrollContainerRef?.current || window;
        
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          if (scrollContainerRef?.current) {
            scrollContainerRef.current.scrollTop = scrollY;
          } else {
            window.scrollTo(0, scrollY);
          }
        });
      }
    } catch {
      // Ignore
    }
    
    hasRestored.current = true;
  }, [storageKey, scrollContainerRef]);

  const saveScrollPosition = useCallback(() => {
    try {
      const scrollY = scrollContainerRef?.current?.scrollTop ?? window.scrollY;
      sessionStorage.setItem(storageKey, String(scrollY));
    } catch {
      // Ignore
    }
  }, [storageKey, scrollContainerRef]);

  // Save on unmount
  useEffect(() => {
    return () => {
      saveScrollPosition();
    };
  }, [saveScrollPosition]);

  return { saveScrollPosition };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PANEL EXPANSION STATE
// ═══════════════════════════════════════════════════════════════════════════════

interface UsePanelStateOptions {
  panelId: string;
  defaultExpanded?: boolean;
}

/**
 * Persist panel expansion state
 * 
 * Usage:
 * const { isExpanded, toggle, setExpanded } = usePanelState({ panelId: "filters" });
 */
export function usePanelState({ panelId, defaultExpanded = false }: UsePanelStateOptions) {
  const storageKey = `${VIEW_STATE_PREFIX}panel_${panelId}`;

  const [isExpanded, setExpanded] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        return stored === "true";
      }
    } catch {
      // Ignore
    }
    return defaultExpanded;
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, String(isExpanded));
    } catch {
      // Ignore
    }
  }, [isExpanded, storageKey]);

  const toggle = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  return { isExpanded, toggle, setExpanded };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIDEBAR COLLAPSE STATE
// ═══════════════════════════════════════════════════════════════════════════════

const SIDEBAR_STATE_KEY = "tribes_sidebar_collapsed";

/**
 * Persist sidebar collapse state
 */
export function useSidebarState() {
  const [isCollapsed, setCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STATE_KEY);
      return stored === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STATE_KEY, String(isCollapsed));
    } catch {
      // Ignore
    }
  }, [isCollapsed]);

  const toggle = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  return { isCollapsed, toggle, setCollapsed };
}

/**
 * TRIBES ADMIN DATA HOOKS — Placeholder implementations
 * 
 * These hooks provide mock data structures for the Tribes Admin workstation.
 * Replace with actual Supabase queries when backend tables are created.
 */

interface DashboardStats {
  totalSongs: number;
  inQueue: number;
  needsAttention: number;
  pendingContracts: number;
}

interface DashboardAlert {
  id: string;
  message: string;
  variant: "info" | "warning" | "error";
}

interface QueueItem {
  id: string;
  title: string;
  artist: string;
  submittedAt: string;
  status: "pending" | "review" | "approved" | "rejected";
}

interface RecentSong {
  id: string;
  title: string;
  artist: string;
  addedAt: string;
}

interface CatalogSong {
  id: string;
  title: string;
  artist: string;
  iswc: string;
  status: "active" | "pending" | "inactive";
  addedAt: string;
}

/**
 * Dashboard data hook
 * Returns stats, alerts, queue items, and recent songs
 */
export function useTribesAdminDashboard() {
  const stats: DashboardStats = {
    totalSongs: 0,
    inQueue: 0,
    needsAttention: 0,
    pendingContracts: 0,
  };

  const alerts: DashboardAlert[] = [];
  const queueItems: QueueItem[] = [];
  const recentSongs: RecentSong[] = [];

  return {
    stats,
    alerts,
    queueItems,
    recentSongs,
    isLoading: false,
    error: null,
  };
}

/**
 * Song queue hook
 * Returns pending song submissions
 */
export function useSongQueue() {
  const data: QueueItem[] = [];

  return {
    data,
    isLoading: false,
    error: null,
  };
}

/**
 * Song catalog hook
 * Returns all songs in the catalog
 */
export function useSongCatalog() {
  const data: CatalogSong[] = [];

  return {
    data,
    isLoading: false,
    error: null,
  };
}

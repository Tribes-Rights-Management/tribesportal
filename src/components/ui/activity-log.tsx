import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AppTable, 
  AppTableHeader, 
  AppTableBody, 
  AppTableHead, 
  AppTableRow, 
  AppTableCell,
  AppTableEmpty 
} from "@/components/app-ui/AppTable";
import { EMPTY_STATES, BUTTON_LABELS } from "@/constants/institutional-copy";

/**
 * IMMUTABLE ACTIVITY LOG UI — INSTITUTIONAL TRUST SURFACE
 * 
 * OBJECTIVE:
 * Create a read-only, append-only record of system activity
 * that users trust as permanent.
 * 
 * WHAT GETS LOGGED:
 * - Access grants / revocations
 * - Submissions
 * - Approvals / declines
 * - Exports
 * - Login events (admin-visible)
 * - Configuration changes
 * 
 * WHAT NEVER HAPPENS:
 * - Logs are never editable
 * - Logs are never deletable
 * - Logs are never hidden from authorized admins
 * 
 * UI TONE:
 * - No icons
 * - No colors except subtle separators
 * - Should feel like bank audit software, not SaaS analytics
 */

/**
 * FORMAL VERBS ONLY (Standardized Language)
 */
export const ACTIVITY_VERBS = {
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  DECLINED: "Declined",
  GRANTED: "Granted",
  REVOKED: "Revoked",
  EXPORTED: "Exported",
  EXECUTED: "Executed",
  CREATED: "Created",
  UPDATED: "Updated",
  VIEWED: "Viewed",
  LOGGED_IN: "Logged in",
  LOGGED_OUT: "Logged out",
} as const;

export type ActivityVerb = typeof ACTIVITY_VERBS[keyof typeof ACTIVITY_VERBS];

/**
 * Activity result states
 */
export const ACTIVITY_RESULTS = {
  SUCCESS: "Success",
  BLOCKED: "Blocked",
  PENDING: "Pending",
} as const;

export type ActivityResult = typeof ACTIVITY_RESULTS[keyof typeof ACTIVITY_RESULTS];

export interface ActivityLogEntry {
  id: string;
  timestamp: string; // ISO 8601 UTC format
  actor: string; // User email or "System"
  action: ActivityVerb;
  object: string; // What was affected
  objectId?: string;
  scope?: string; // Workspace / organization
  result: ActivityResult;
  details?: string;
}

interface ActivityLogFilters {
  dateFrom?: string;
  dateTo?: string;
  actor?: string;
  action?: ActivityVerb;
  scope?: string;
}

interface ActivityLogProps {
  entries: ActivityLogEntry[];
  filters?: ActivityLogFilters;
  onFilterChange?: (filters: ActivityLogFilters) => void;
  onExport?: (format: "csv" | "pdf") => void;
  loading?: boolean;
  className?: string;
}

export function ActivityLog({
  entries,
  filters,
  onFilterChange,
  onExport,
  loading = false,
  className,
}: ActivityLogProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Filter Bar */}
      {onFilterChange && (
        <ActivityLogFilters 
          filters={filters} 
          onFilterChange={onFilterChange}
          onExport={onExport}
        />
      )}

      {/* Activity Table */}
      <AppTable columns={["18%", "18%", "12%", "22%", "15%", "15%"]}>
        <AppTableHeader>
          <AppTableRow header>
            <AppTableHead>Timestamp (UTC)</AppTableHead>
            <AppTableHead>Actor</AppTableHead>
            <AppTableHead>Action</AppTableHead>
            <AppTableHead>Object</AppTableHead>
            <AppTableHead>Scope</AppTableHead>
            <AppTableHead>Result</AppTableHead>
          </AppTableRow>
        </AppTableHeader>
        <AppTableBody>
          {loading ? (
            <AppTableEmpty colSpan={6}>
              Retrieving records…
            </AppTableEmpty>
          ) : entries.length === 0 ? (
            <AppTableEmpty colSpan={6}>
              <p className="text-sm text-muted-foreground">{EMPTY_STATES.NO_DATA.title}</p>
              <p className="text-xs text-muted-foreground mt-1">Activity records will appear here once actions are performed.</p>
            </AppTableEmpty>
          ) : (
            entries.map((entry) => (
              <ActivityLogRow key={entry.id} entry={entry} />
            ))
          )}
        </AppTableBody>
      </AppTable>

      {/* Export Note */}
      {onExport && entries.length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          Exports reflect the data as of the time generated. Export actions are logged.
        </p>
      )}
    </div>
  );
}

function ActivityLogRow({ entry }: { entry: ActivityLogEntry }) {
  return (
    <AppTableRow>
      <AppTableCell mono muted>
        {formatTimestamp(entry.timestamp)}
      </AppTableCell>
      <AppTableCell>
        {entry.actor}
      </AppTableCell>
      <AppTableCell>
        {entry.action}
      </AppTableCell>
      <AppTableCell>
        {entry.object}
        {entry.objectId && (
          <span className="ml-2 font-mono text-xs text-muted-foreground">
            {entry.objectId.slice(0, 8)}
          </span>
        )}
      </AppTableCell>
      <AppTableCell muted>
        {entry.scope ?? '—'}
      </AppTableCell>
      <AppTableCell>
        <ActivityResultBadge result={entry.result} />
      </AppTableCell>
    </AppTableRow>
  );
}

function ActivityResultBadge({ result }: { result: ActivityResult }) {
  return (
    <span className={cn(
      "text-xs font-medium",
      result === ACTIVITY_RESULTS.BLOCKED ? "text-foreground" : "text-muted-foreground"
    )}>
      {result}
    </span>
  );
}

interface ActivityLogFiltersProps {
  filters?: ActivityLogFilters;
  onFilterChange: (filters: ActivityLogFilters) => void;
  onExport?: (format: "csv" | "pdf") => void;
}

function ActivityLogFilters({ 
  filters = {}, 
  onFilterChange,
  onExport 
}: ActivityLogFiltersProps) {
  return (
    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
      {/* Date Range */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          From
        </label>
        <Input
          type="date"
          value={filters.dateFrom ?? ''}
          onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })}
          className="h-9 px-3 py-1.5 text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          To
        </label>
        <Input
          type="date"
          value={filters.dateTo ?? ''}
          onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })}
          className="h-9 px-3 py-1.5 text-sm"
        />
      </div>

      {/* Actor Filter */}
      <Input
        type="text"
        placeholder="Filter by actor"
        value={filters.actor ?? ''}
        onChange={(e) => onFilterChange({ ...filters, actor: e.target.value })}
        className="h-9 px-3 py-1.5 text-sm flex-1 max-w-[200px]"
      />

      {/* Action Type Filter */}
      <select
        value={filters.action ?? ''}
        onChange={(e) => onFilterChange({ 
          ...filters, 
          action: e.target.value as ActivityVerb || undefined 
        })}
        className="px-3 py-1.5 text-sm rounded-md bg-background border border-border text-foreground"
      >
        <option value="">All actions</option>
        {Object.values(ACTIVITY_VERBS).map((verb) => (
          <option key={verb} value={verb}>{verb}</option>
        ))}
      </select>

      {/* Export Buttons */}
      {onExport && (
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('csv')}
          >
            {BUTTON_LABELS.EXPORT} CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('pdf')}
          >
            {BUTTON_LABELS.EXPORT} PDF
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Format ISO timestamp to readable UTC format
 */
function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toISOString().replace('T', ' ').slice(0, 19);
  } catch {
    return isoString;
  }
}

/**
 * ACTIVITY LOG COMPACT — Inline summary for dashboards
 */
interface ActivityLogCompactProps {
  entries: ActivityLogEntry[];
  maxEntries?: number;
  className?: string;
}

export function ActivityLogCompact({ 
  entries, 
  maxEntries = 5,
  className 
}: ActivityLogCompactProps) {
  const displayEntries = entries.slice(0, maxEntries);

  return (
    <div className={cn("w-full", className)}>
      {displayEntries.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">
          No recent activity
        </p>
      ) : (
        <div className="space-y-0">
          {displayEntries.map((entry) => (
            <div 
              key={entry.id}
              className="flex items-center justify-between py-3 border-b border-border"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-foreground">
                  {entry.action}
                </span>
                <span className="text-sm text-muted-foreground">
                  {entry.object}
                </span>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {formatTimestamp(entry.timestamp).slice(0, 10)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
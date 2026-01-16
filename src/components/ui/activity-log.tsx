import * as React from "react";
import { cn } from "@/lib/utils";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell,
  TableEmptyRow 
} from "@/components/ui/table";
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
      <div 
        style={{ 
          border: '1px solid var(--platform-border)',
          borderRadius: '6px',
          overflow: 'hidden'
        }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp (UTC)</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Object</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead status>Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableEmptyRow 
                colSpan={6} 
                title="Retrieving records..."
                description="Activity log is loading."
              />
            ) : entries.length === 0 ? (
              <TableEmptyRow 
                colSpan={6} 
                title={EMPTY_STATES.NO_DATA.title}
                description="Activity records will appear here once actions are performed."
              />
            ) : (
              entries.map((entry) => (
                <ActivityLogRow key={entry.id} entry={entry} />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Export Note */}
      {onExport && entries.length > 0 && (
        <p 
          className="mt-3 text-[12px]"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          Exports reflect the data as of the time generated. Export actions are logged.
        </p>
      )}
    </div>
  );
}

function ActivityLogRow({ entry }: { entry: ActivityLogEntry }) {
  return (
    <TableRow>
      <TableCell muted className="font-mono text-[12px]">
        {formatTimestamp(entry.timestamp)}
      </TableCell>
      <TableCell>
        {entry.actor}
      </TableCell>
      <TableCell>
        {entry.action}
      </TableCell>
      <TableCell>
        <span style={{ color: 'var(--platform-text)' }}>
          {entry.object}
        </span>
        {entry.objectId && (
          <span 
            className="ml-2 font-mono text-[11px]"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            {entry.objectId.slice(0, 8)}
          </span>
        )}
      </TableCell>
      <TableCell muted>
        {entry.scope ?? '—'}
      </TableCell>
      <TableCell status>
        <ActivityResultBadge result={entry.result} />
      </TableCell>
    </TableRow>
  );
}

function ActivityResultBadge({ result }: { result: ActivityResult }) {
  return (
    <span 
      className="text-[12px] font-medium"
      style={{ 
        color: result === ACTIVITY_RESULTS.BLOCKED 
          ? 'var(--platform-text-secondary)' 
          : 'var(--platform-text-muted)'
      }}
    >
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
    <div 
      className="flex items-center gap-4 mb-4 pb-4"
      style={{ borderBottom: '1px solid var(--platform-border)' }}
    >
      {/* Date Range */}
      <div className="flex items-center gap-2">
        <label 
          className="text-[12px] font-medium"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          From
        </label>
        <input
          type="date"
          value={filters.dateFrom ?? ''}
          onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })}
          className="px-3 py-1.5 text-[13px] rounded-md"
          style={{
            backgroundColor: 'var(--platform-surface)',
            border: '1px solid var(--platform-border)',
            color: 'var(--platform-text)',
          }}
        />
      </div>
      <div className="flex items-center gap-2">
        <label 
          className="text-[12px] font-medium"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          To
        </label>
        <input
          type="date"
          value={filters.dateTo ?? ''}
          onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })}
          className="px-3 py-1.5 text-[13px] rounded-md"
          style={{
            backgroundColor: 'var(--platform-surface)',
            border: '1px solid var(--platform-border)',
            color: 'var(--platform-text)',
          }}
        />
      </div>

      {/* Actor Filter */}
      <input
        type="text"
        placeholder="Filter by actor"
        value={filters.actor ?? ''}
        onChange={(e) => onFilterChange({ ...filters, actor: e.target.value })}
        className="px-3 py-1.5 text-[13px] rounded-md flex-1 max-w-[200px]"
        style={{
          backgroundColor: 'var(--platform-surface)',
          border: '1px solid var(--platform-border)',
          color: 'var(--platform-text)',
        }}
      />

      {/* Action Type Filter */}
      <select
        value={filters.action ?? ''}
        onChange={(e) => onFilterChange({ 
          ...filters, 
          action: e.target.value as ActivityVerb || undefined 
        })}
        className="px-3 py-1.5 text-[13px] rounded-md"
        style={{
          backgroundColor: 'var(--platform-surface)',
          border: '1px solid var(--platform-border)',
          color: 'var(--platform-text)',
        }}
      >
        <option value="">All actions</option>
        {Object.values(ACTIVITY_VERBS).map((verb) => (
          <option key={verb} value={verb}>{verb}</option>
        ))}
      </select>

      {/* Export Buttons */}
      {onExport && (
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => onExport('csv')}
            className="px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--platform-border)',
              color: 'var(--platform-text-secondary)',
            }}
          >
            {BUTTON_LABELS.EXPORT} CSV
          </button>
          <button
            onClick={() => onExport('pdf')}
            className="px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--platform-border)',
              color: 'var(--platform-text-secondary)',
            }}
          >
            {BUTTON_LABELS.EXPORT} PDF
          </button>
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
        <p 
          className="text-[13px] py-4"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          No recent activity
        </p>
      ) : (
        <div className="space-y-0">
          {displayEntries.map((entry) => (
            <div 
              key={entry.id}
              className="flex items-center justify-between py-3"
              style={{ borderBottom: '1px solid var(--platform-border)' }}
            >
              <div className="flex items-center gap-3">
                <span 
                  className="text-[13px]"
                  style={{ color: 'var(--platform-text)' }}
                >
                  {entry.action}
                </span>
                <span 
                  className="text-[13px]"
                  style={{ color: 'var(--platform-text-secondary)' }}
                >
                  {entry.object}
                </span>
              </div>
              <span 
                className="text-[12px] font-mono"
                style={{ color: 'var(--platform-text-muted)' }}
              >
                {formatTimestamp(entry.timestamp).slice(0, 10)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

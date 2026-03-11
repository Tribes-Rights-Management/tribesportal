import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { supabase } from "@/integrations/supabase/client";
import { 
  CorrelationChainView, 
  ChainEvent 
} from "@/components/ui/correlation-chain";
import { AppTable, AppTableHeader, AppTableBody, AppTableRow, AppTableHead, AppTableCell, AppTableEmpty } from "@/components/app-ui/AppTable";
import { AppPageLayout, AppSearchInput } from "@/components/app-ui";
import { ConsoleButton } from "@/components/console";
import { Search, Link2 } from "lucide-react";
import { EMPTY_STATES } from "@/constants/institutional-copy";

interface CorrelatedRecord {
  correlation_id: string;
  record_type: string;
  created_at: string;
  event_count: number;
}

export default function CorrelationChainPage() {
  const { isPlatformAdmin, isExternalAuditor } = useRoleAccess();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [correlationId, setCorrelationId] = useState(searchParams.get('id') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('id') || '');
  const [chainEvents, setChainEvents] = useState<ChainEvent[]>([]);
  const [recentCorrelations, setRecentCorrelations] = useState<CorrelatedRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const hasAccess = isPlatformAdmin || isExternalAuditor;

  useEffect(() => {
    if (hasAccess) {
      fetchRecentCorrelations();
    }
  }, [hasAccess]);

  useEffect(() => {
    const idFromParams = searchParams.get('id');
    if (idFromParams && hasAccess) {
      setCorrelationId(idFromParams);
      setSearchInput(idFromParams);
      fetchChain(idFromParams);
    }
  }, [searchParams, hasAccess]);

  async function fetchRecentCorrelations() {
    setLoadingRecent(true);
    
    const { data: requests, error: reqError } = await supabase
      .from('licensing_requests')
      .select('correlation_id, created_at')
      .not('correlation_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20);

    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select('correlation_id, record_type, created_at, action')
      .not('correlation_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (reqError) {
      console.error('Error fetching recent correlations:', reqError);
    }

    const uniqueCorrelations = new Map<string, CorrelatedRecord>();
    
    for (const req of requests || []) {
      if (req.correlation_id && !uniqueCorrelations.has(req.correlation_id)) {
        uniqueCorrelations.set(req.correlation_id, {
          correlation_id: req.correlation_id,
          record_type: 'licensing_request',
          created_at: req.created_at,
          event_count: 1,
        });
      }
    }

    for (const log of auditLogs || []) {
      if (log.correlation_id && !uniqueCorrelations.has(log.correlation_id)) {
        uniqueCorrelations.set(log.correlation_id, {
          correlation_id: log.correlation_id,
          record_type: log.record_type || log.action || 'audit_event',
          created_at: log.created_at,
          event_count: 1,
        });
      }
    }

    const sorted = Array.from(uniqueCorrelations.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20);

    setRecentCorrelations(sorted);
    setLoadingRecent(false);
  }

  async function fetchChain(id: string) {
    if (!id) return;
    
    setLoading(true);
    
    const { data, error } = await supabase.rpc('get_correlation_chain', {
      _correlation_id: id
    });

    if (error) {
      console.error('Error fetching correlation chain:', error);
      setChainEvents([]);
    } else {
      setChainEvents((data as ChainEvent[]) || []);
    }
    
    setLoading(false);
  }

  function handleSearch() {
    if (searchInput.trim()) {
      setSearchParams({ id: searchInput.trim() });
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  function handleSelectCorrelation(id: string) {
    setSearchParams({ id });
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (!hasAccess) {
    return (
      <AppPageLayout title="Correlation Chain" backLink={{ to: "/console", label: "System Console" }}>
        <div className="py-12 text-center">
          <p className="text-[14px]" style={{ color: 'var(--platform-text-muted)' }}>
            Access restricted. Platform administrator or auditor role required.
          </p>
        </div>
      </AppPageLayout>
    );
  }

  return (
    <AppPageLayout title="Correlation Chain" backLink={{ to: "/console", label: "System Console" }}>

      {/* Search */}
      <div 
        className="mb-8 p-4 rounded-md"
        style={{ 
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--platform-border)'
        }}
      >
        <div className="flex gap-3 items-center">
          <div className="flex-1">
            <AppSearchInput
              value={searchInput}
              onChange={(value) => setSearchInput(value)}
              placeholder="Enter correlation ID (e.g., CORR-20260116-143012-A1B2C3D4)"
              className="font-mono"
            />
          </div>
          <ConsoleButton
            intent="primary"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </ConsoleButton>
        </div>
      </div>

      {/* Chain View */}
      {correlationId && (
        <div className="mb-8">
          <CorrelationChainView
            correlationId={correlationId}
            events={chainEvents}
            loading={loading}
          />
        </div>
      )}

      {/* Recent Correlations Table */}
      {!correlationId && (
        <>
          <div className="mb-4">
            <h3 
              className="text-[12px] uppercase tracking-wide mb-3"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              Recent Correlated Records
            </h3>
          </div>

          <AppTable columns={["40%", "20%", "25%", "15%"]}>
            <AppTableHeader>
              <AppTableRow header>
                <AppTableHead>Correlation ID</AppTableHead>
                <AppTableHead>Record Type</AppTableHead>
                <AppTableHead>Created</AppTableHead>
                <AppTableHead align="center">Action</AppTableHead>
              </AppTableRow>
            </AppTableHeader>
            <AppTableBody>
              {loadingRecent ? (
                <AppTableEmpty colSpan={4}>
                  <span className="text-muted-foreground">
                    Loading records
                  </span>
                </AppTableEmpty>
              ) : recentCorrelations.length === 0 ? (
                <AppTableEmpty colSpan={4}>
                  <p className="text-sm text-muted-foreground">{EMPTY_STATES.NO_DATA.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">Correlation IDs are generated when records are created.</p>
                </AppTableEmpty>
              ) : (
                recentCorrelations.map((record) => (
                  <AppTableRow key={record.correlation_id} clickable>
                    <AppTableCell mono>
                        {record.correlation_id}
                    </AppTableCell>
                    <AppTableCell>
                        {record.record_type.replace(/_/g, ' ')}
                    </AppTableCell>
                    <AppTableCell muted>
                        {formatDate(record.created_at)}
                    </AppTableCell>
                    <AppTableCell align="center">
                      <ConsoleButton
                        intent="ghost"
                        size="sm"
                        className="h-8 px-3"
                        onClick={() => handleSelectCorrelation(record.correlation_id)}
                      >
                        <Link2 className="h-4 w-4 mr-1" />
                        View Chain
                      </ConsoleButton>
                    </AppTableCell>
                  </AppTableRow>
                ))
              )}
            </AppTableBody>
          </AppTable>
        </>
      )}

      {/* Audit Notice */}
      <div 
        className="mt-8 px-4 py-3 rounded-md"
        style={{ 
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--platform-border)'
        }}
      >
        <p 
          className="text-[13px]"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          Correlation chains provide a complete audit trail of related actions across the platform.
          This view is read-only and cannot be modified.
        </p>
      </div>
    </AppPageLayout>
  );
}

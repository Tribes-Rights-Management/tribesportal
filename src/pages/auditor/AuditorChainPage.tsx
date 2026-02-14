import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AppPageLayout } from "@/components/app-ui";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  CorrelationChainView, 
  ChainEvent 
} from "@/components/ui/correlation-chain";
import { AppTable, AppTableHeader, AppTableBody, AppTableRow, AppTableHead, AppTableCell, AppTableEmpty } from "@/components/app-ui/AppTable";
import { AppSearchInput } from "@/components/app-ui";
import { Button } from "@/components/ui/button";
import { Search, Link2 } from "lucide-react";
import { EMPTY_STATES } from "@/constants/institutional-copy";

/**
 * AUDITOR CORRELATION CHAIN PAGE — READ-ONLY
 * 
 * Allows external auditors to trace related actions across the platform.
 * No modification capabilities.
 */

interface CorrelatedRecord {
  correlation_id: string;
  record_type: string;
  created_at: string;
}

export default function AuditorChainPage() {
  const { isExternalAuditor, isPlatformAdmin } = useRoleAccess();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [correlationId, setCorrelationId] = useState(searchParams.get('id') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('id') || '');
  const [chainEvents, setChainEvents] = useState<ChainEvent[]>([]);
  const [recentCorrelations, setRecentCorrelations] = useState<CorrelatedRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const hasAccess = isExternalAuditor || isPlatformAdmin;

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
    
    const { data: requests, error } = await supabase
      .from('licensing_requests')
      .select('correlation_id, created_at')
      .not('correlation_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching recent correlations:', error);
      setLoadingRecent(false);
      return;
    }

    const uniqueCorrelations = new Map<string, CorrelatedRecord>();
    
    for (const req of requests || []) {
      if (req.correlation_id && !uniqueCorrelations.has(req.correlation_id)) {
        uniqueCorrelations.set(req.correlation_id, {
          correlation_id: req.correlation_id,
          record_type: 'licensing_request',
          created_at: req.created_at,
        });
      }
    }

    setRecentCorrelations(Array.from(uniqueCorrelations.values()));
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
    return <Navigate to="/app/restricted" replace />;
  }

  return (
    <AppPageLayout
      title="Correlation Chain"
      backLink={{ to: "/auditor", label: "Auditor Portal" }}
    >
      <p className="text-sm text-muted-foreground mb-4">
        Read-only view of related platform actions
      </p>

      {/* Read-only notice */}
      <div 
        className="mb-6 px-4 py-3 rounded-md"
        style={{ 
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--platform-border)'
        }}
      >
        <p 
          className="text-[13px]"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          This view is read-only. Correlation chains cannot be modified or deleted.
        </p>
      </div>

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
              placeholder="Enter correlation ID"
              className="font-mono"
            />
          </div>
          <Button
            variant="default"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
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
                  <span style={{ color: 'var(--platform-text-muted)' }}>
                    Loading records
                  </span>
                </AppTableEmpty>
              ) : recentCorrelations.length === 0 ? (
                <AppTableEmpty colSpan={4}>
                  <p className="text-sm text-muted-foreground">{EMPTY_STATES.NO_DATA.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">No correlated records available.</p>
                </AppTableEmpty>
              ) : (
                recentCorrelations.map((record) => (
                  <AppTableRow key={record.correlation_id} clickable>
                    <AppTableCell>
                      <code 
                        className="text-[12px] font-mono"
                        style={{ color: 'var(--platform-text)' }}
                      >
                        {record.correlation_id}
                      </code>
                    </AppTableCell>
                    <AppTableCell>
                      <span style={{ color: 'var(--platform-text)' }}>
                        {record.record_type.replace(/_/g, ' ')}
                      </span>
                    </AppTableCell>
                    <AppTableCell>
                      <span 
                        className="text-[13px]"
                        style={{ color: 'var(--platform-text-muted)' }}
                      >
                        {formatDate(record.created_at)}
                      </span>
                    </AppTableCell>
                    <AppTableCell align="center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3"
                        onClick={() => handleSelectCorrelation(record.correlation_id)}
                      >
                        <Link2 className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </AppTableCell>
                  </AppTableRow>
                ))
              )}
            </AppTableBody>
          </AppTable>
        </>
      )}
    </AppPageLayout>
  );
}

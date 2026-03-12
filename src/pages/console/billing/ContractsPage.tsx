/**
 * CONTRACTS PAGE — System Console
 * 
 * Platform-wide contract governance and lineage tracking.
 * Executive view of all contracts across organizations.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, ExternalLink, Filter } from "lucide-react";
import { format } from "date-fns";
import { PlatformPageLayout, PlatformTable, PlatformTableHeader, PlatformTableBody, PlatformTableRow, PlatformTableHead, PlatformTableCell, PlatformTableEmpty, PlatformSearchInput } from "@/components/platform-ui";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InstitutionalLoadingState } from "@/components/ui/institutional-states";
import { useAllContracts } from "@/hooks/useBillingLineage";
import { useBillingAuthority } from "@/hooks/useBillingAuthority";

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "default";
    case "draft":
      return "secondary";
    case "terminated":
    case "expired":
      return "destructive";
    default:
      return "outline";
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function ContractsPage() {
  const { data: contracts, isLoading } = useAllContracts();
  const { canViewAllInvoices } = useBillingAuthority();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter contracts
  const filteredContracts = (contracts || []).filter((contract: any) => {
    const matchesSearch = 
      contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.contract_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.tenant?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (!canViewAllInvoices) {
    return (
      <PlatformPageLayout title="Access Denied">
        <p className="text-muted-foreground">
          You do not have permission to view platform contracts.
        </p>
      </PlatformPageLayout>
    );
  }

  return (
    <PlatformPageLayout title="Contracts Registry" backLink={{ to: "/console/billing", label: "Billing" }}>

      {/* Filters */}
      <div 
        className="flex items-center gap-4 p-4 rounded-lg"
        style={{
          backgroundColor: "var(--platform-surface)",
          border: "1px solid var(--platform-border)",
        }}
      >
        <PlatformSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search contracts..."
          className="flex-1 max-w-sm"
        />
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="amended">Amended</SelectItem>
            <SelectItem value="terminated">Terminated</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contracts Table */}
      <div 
        className="rounded-lg overflow-hidden"
        style={{
          backgroundColor: "var(--platform-surface)",
          border: "1px solid var(--platform-border)",
        }}
      >
        {isLoading ? (
          <div className="p-6">
            <InstitutionalLoadingState message="Loading contracts..." />
          </div>
        ) : (
          <PlatformTable columns={["25%", "18%", "12%", "8%", "15%", "15%", "7%"]}>
            <PlatformTableHeader>
              <PlatformTableRow header>
                <PlatformTableHead>Contract</PlatformTableHead>
                <PlatformTableHead>Organization</PlatformTableHead>
                <PlatformTableHead>Status</PlatformTableHead>
                <PlatformTableHead>Version</PlatformTableHead>
                <PlatformTableHead>Effective Date</PlatformTableHead>
                <PlatformTableHead>Created</PlatformTableHead>
                <PlatformTableHead></PlatformTableHead>
              </PlatformTableRow>
            </PlatformTableHeader>
            <PlatformTableBody>
              {filteredContracts.length === 0 ? (
                <PlatformTableEmpty colSpan={7}>
                  <FileText className="h-6 w-6 text-muted-foreground mx-auto mb-2" strokeWidth={1.0} />
                  <p className="text-[13px] text-muted-foreground">
                    {searchQuery || statusFilter !== "all" 
                      ? "No contracts match your filters"
                      : "No contracts in the system"
                    }
                  </p>
                </PlatformTableEmpty>
              ) : (
                filteredContracts.map((contract: any) => (
                  <PlatformTableRow key={contract.id}>
                    <PlatformTableCell>
                      <div>
                        <p className="font-medium">
                          {contract.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {contract.contract_number}
                        </p>
                      </div>
                    </PlatformTableCell>
                    <PlatformTableCell>
                        {contract.tenant?.name || "—"}
                    </PlatformTableCell>
                    <PlatformTableCell>
                      <Badge variant={getStatusVariant(contract.status)} className="text-[11px]">
                        {contract.status}
                      </Badge>
                    </PlatformTableCell>
                    <PlatformTableCell muted>
                      v{contract.version}
                    </PlatformTableCell>
                    <PlatformTableCell muted>
                        {contract.effective_date 
                          ? format(new Date(contract.effective_date), "MMM d, yyyy")
                          : "—"
                        }
                    </PlatformTableCell>
                    <PlatformTableCell muted>
                      {format(new Date(contract.created_at), "MMM d, yyyy")}
                    </PlatformTableCell>
                    <PlatformTableCell>
                      <Link 
                        to={`/admin/billing/contracts/${contract.id}`}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </PlatformTableCell>
                  </PlatformTableRow>
                ))
              )}
            </PlatformTableBody>
          </PlatformTable>
        )}
      </div>
    </PlatformPageLayout>
  );
}

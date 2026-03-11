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
import { AppPageLayout } from "@/components/app-ui";
import { AppTable, AppTableHeader, AppTableBody, AppTableRow, AppTableHead, AppTableCell, AppTableEmpty } from "@/components/app-ui/AppTable";
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
import { AppSearchInput } from "@/components/app-ui";

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
      <AppPageLayout title="Access Denied">
        <p className="text-muted-foreground">
          You do not have permission to view platform contracts.
        </p>
      </AppPageLayout>
    );
  }

  return (
    <AppPageLayout title="Contracts Registry" backLink={{ to: "/console/billing", label: "Billing" }}>

      {/* Filters */}
      <div 
        className="flex items-center gap-4 p-4 rounded-lg"
        style={{
          backgroundColor: "var(--platform-surface)",
          border: "1px solid var(--platform-border)",
        }}
      >
        <AppSearchInput
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
          <AppTable columns={["25%", "18%", "12%", "8%", "15%", "15%", "7%"]}>
            <AppTableHeader>
              <AppTableRow header>
                <AppTableHead>Contract</AppTableHead>
                <AppTableHead>Organization</AppTableHead>
                <AppTableHead>Status</AppTableHead>
                <AppTableHead>Version</AppTableHead>
                <AppTableHead>Effective Date</AppTableHead>
                <AppTableHead>Created</AppTableHead>
                <AppTableHead></AppTableHead>
              </AppTableRow>
            </AppTableHeader>
            <AppTableBody>
              {filteredContracts.length === 0 ? (
                <AppTableEmpty colSpan={7}>
                  <FileText className="h-6 w-6 text-muted-foreground mx-auto mb-2" strokeWidth={1.0} />
                  <p className="text-[13px] text-muted-foreground">
                    {searchQuery || statusFilter !== "all" 
                      ? "No contracts match your filters"
                      : "No contracts in the system"
                    }
                  </p>
                </AppTableEmpty>
              ) : (
                filteredContracts.map((contract: any) => (
                  <AppTableRow key={contract.id}>
                    <AppTableCell>
                      <div>
                        <p className="font-medium">
                          {contract.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {contract.contract_number}
                        </p>
                      </div>
                    </AppTableCell>
                    <AppTableCell>
                        {contract.tenant?.name || "—"}
                    </AppTableCell>
                    <AppTableCell>
                      <Badge variant={getStatusVariant(contract.status)} className="text-[11px]">
                        {contract.status}
                      </Badge>
                    </AppTableCell>
                    <AppTableCell muted>
                      v{contract.version}
                    </AppTableCell>
                    <AppTableCell muted>
                        {contract.effective_date 
                          ? format(new Date(contract.effective_date), "MMM d, yyyy")
                          : "—"
                        }
                    </AppTableCell>
                    <AppTableCell muted>
                      {format(new Date(contract.created_at), "MMM d, yyyy")}
                    </AppTableCell>
                    <AppTableCell>
                      <Link 
                        to={`/admin/billing/contracts/${contract.id}`}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </AppTableCell>
                  </AppTableRow>
                ))
              )}
            </AppTableBody>
          </AppTable>
        )}
      </div>
    </AppPageLayout>
  );
}

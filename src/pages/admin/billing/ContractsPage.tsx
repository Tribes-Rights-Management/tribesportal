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
import { PageHeader } from "@/components/ui/page-header";
import { BackButton } from "@/components/ui/back-button";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
  TableEmptyRow 
} from "@/components/ui/table";
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
      <div className="p-6">
        <PageHeader title="Access Denied" />
        <p className="text-muted-foreground">
          You do not have permission to view platform contracts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <BackButton />
        <PageHeader 
          title="Contracts Registry" 
          description="Platform-wide contract governance and lineage tracking"
        />
      </div>

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="text-center py-8">
                      <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-[13px] text-muted-foreground">
                        {searchQuery || statusFilter !== "all" 
                          ? "No contracts match your filters"
                          : "No contracts in the system"
                        }
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredContracts.map((contract: any) => (
                  <TableRow key={contract.id}>
                    <TableCell>
                      <div>
                        <p className="text-[13px] font-medium text-[--platform-text]">
                          {contract.title}
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                          {contract.contract_number}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-[13px] text-[--platform-text]">
                        {contract.tenant?.name || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(contract.status)} className="text-[11px]">
                        {contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-[12px] text-muted-foreground">
                        v{contract.version}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[12px] text-[--platform-text]">
                        {contract.effective_date 
                          ? format(new Date(contract.effective_date), "MMM d, yyyy")
                          : "—"
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[12px] text-muted-foreground">
                        {format(new Date(contract.created_at), "MMM d, yyyy")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link 
                        to={`/admin/billing/contracts/${contract.id}`}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

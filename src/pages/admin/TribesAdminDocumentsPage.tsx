import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";

import {
  AppPageHeader,
  AppPageContainer,
  AppSection,
  AppTable,
  AppTableHeader,
  AppTableBody,
  AppTableRow,
  AppTableHead,
  AppTableCell,
  AppTableEmpty,
  AppTableBadge,
  AppFilterDrawer,
  AppFilterSection,
  AppFilterOption,
  AppFilterTrigger,
} from "@/components/app-ui";

/**
 * TRIBES ADMIN DOCUMENTS PAGE
 * 
 * Contracts and documents management with filter drawer pattern.
 */

type DocumentType = "all" | "contract" | "agreement" | "amendment" | "termination";
type DocumentStatus = "draft" | "pending" | "active" | "expired" | "terminated";
type SortOption = "date" | "title" | "party";

interface Document {
  id: string;
  title: string;
  type: Exclude<DocumentType, "all">;
  party: string;
  status: DocumentStatus;
  createdAt: string;
  expiresAt: string | null;
}

// Mock data
const mockDocuments: Document[] = [
  { id: "1", title: "Publishing Agreement - Luna Wave", type: "agreement", party: "Luna Wave", status: "active", createdAt: "2025-06-15T10:00:00Z", expiresAt: "2028-06-15T10:00:00Z" },
  { id: "2", title: "Sync License - The Frequency", type: "contract", party: "The Frequency", status: "pending", createdAt: "2026-01-20T14:30:00Z", expiresAt: null },
  { id: "3", title: "Amendment - Coastal Sounds", type: "amendment", party: "Coastal Sounds", status: "active", createdAt: "2025-09-10T09:15:00Z", expiresAt: null },
  { id: "4", title: "Publishing Contract - Urban Echo", type: "contract", party: "Urban Echo", status: "expired", createdAt: "2023-01-01T16:00:00Z", expiresAt: "2026-01-01T16:00:00Z" },
  { id: "5", title: "Termination Notice - Summit", type: "termination", party: "Summit", status: "terminated", createdAt: "2025-12-01T11:00:00Z", expiresAt: null },
];

const getStatusBadge = (status: DocumentStatus) => {
  switch (status) {
    case "active":
      return <AppTableBadge variant="success">Active</AppTableBadge>;
    case "pending":
      return <AppTableBadge variant="warning">Pending</AppTableBadge>;
    case "draft":
      return <AppTableBadge variant="default">Draft</AppTableBadge>;
    case "expired":
      return <AppTableBadge variant="warning">Expired</AppTableBadge>;
    case "terminated":
      return <AppTableBadge variant="error">Terminated</AppTableBadge>;
    default:
      return <AppTableBadge variant="default">{status}</AppTableBadge>;
  }
};

const getTypeLabel = (type: Document["type"]) => {
  switch (type) {
    case "contract":
      return "Contract";
    case "agreement":
      return "Agreement";
    case "amendment":
      return "Amendment";
    case "termination":
      return "Termination";
    default:
      return type;
  }
};

const typeOptions: { value: DocumentType; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "contract", label: "Contracts" },
  { value: "agreement", label: "Agreements" },
  { value: "amendment", label: "Amendments" },
  { value: "termination", label: "Terminations" },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "date", label: "Date Created" },
  { value: "title", label: "Title" },
  { value: "party", label: "Party" },
];

export default function TribesAdminDocumentsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  
  const typeFilter = (searchParams.get("type") as DocumentType) || "all";
  const sortBy = (searchParams.get("sort") as SortOption) || "date";

  const hasActiveFilters = typeFilter !== "all" || sortBy !== "date";

  const handleTypeChange = (value: DocumentType) => {
    if (value === "all") {
      searchParams.delete("type");
    } else {
      searchParams.set("type", value);
    }
    setSearchParams(searchParams);
  };

  const handleSortChange = (value: SortOption) => {
    if (value === "date") {
      searchParams.delete("sort");
    } else {
      searchParams.set("sort", value);
    }
    setSearchParams(searchParams);
  };

  const handleClearFilters = () => {
    searchParams.delete("type");
    searchParams.delete("sort");
    setSearchParams(searchParams);
  };

  // Filter documents
  let filteredDocuments = typeFilter === "all"
    ? mockDocuments
    : mockDocuments.filter(doc => doc.type === typeFilter);

  // Sort documents
  filteredDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title);
      case "party":
        return a.party.localeCompare(b.party);
      case "date":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <AppPageContainer maxWidth="xl">
      {/* Header Row: Title + Filter */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-semibold tracking-tight">Documents</h1>
        <AppFilterTrigger
          onClick={() => setFilterOpen(true)}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      <AppSection spacing="none">

        <AppTable columns={["25%", "12%", "18%", "15%", "15%", "15%"]}>
          <AppTableHeader>
            <AppTableRow>
              <AppTableHead>Document</AppTableHead>
              <AppTableHead>Type</AppTableHead>
              <AppTableHead>Party</AppTableHead>
              <AppTableHead align="center">Status</AppTableHead>
              <AppTableHead>Created</AppTableHead>
              <AppTableHead>Expires</AppTableHead>
            </AppTableRow>
          </AppTableHeader>
          <AppTableBody>
            {filteredDocuments.length === 0 ? (
              <AppTableEmpty colSpan={6}>
                <span className="text-muted-foreground text-sm">
                  {typeFilter !== "all" ? "No matching documents" : "No documents"}
                </span>
              </AppTableEmpty>
            ) : (
              filteredDocuments.map(doc => (
                <AppTableRow
                  key={doc.id}
                  clickable
                  onClick={() => navigate(`/admin/documents/${doc.id}`)}
                >
                  <AppTableCell className="font-medium">{doc.title}</AppTableCell>
                  <AppTableCell muted>{getTypeLabel(doc.type)}</AppTableCell>
                  <AppTableCell muted>{doc.party}</AppTableCell>
                  <AppTableCell align="center">{getStatusBadge(doc.status)}</AppTableCell>
                  <AppTableCell muted>
                    {format(new Date(doc.createdAt), "MMM d, yyyy")}
                  </AppTableCell>
                  <AppTableCell muted>
                    {doc.expiresAt ? format(new Date(doc.expiresAt), "MMM d, yyyy") : "—"}
                  </AppTableCell>
                </AppTableRow>
              ))
            )}
          </AppTableBody>
        </AppTable>
      </AppSection>

      <AppFilterDrawer
        open={filterOpen}
        onOpenChange={setFilterOpen}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      >
        <AppFilterSection title="Type">
          {typeOptions.map((opt) => (
            <AppFilterOption
              key={opt.value}
              label={opt.label}
              selected={typeFilter === opt.value}
              onClick={() => handleTypeChange(opt.value)}
            />
          ))}
        </AppFilterSection>

        <AppFilterSection title="Sort By">
          {sortOptions.map((opt) => (
            <AppFilterOption
              key={opt.value}
              label={opt.label}
              selected={sortBy === opt.value}
              onClick={() => handleSortChange(opt.value)}
            />
          ))}
        </AppFilterSection>
      </AppFilterDrawer>
    </AppPageContainer>
  );
}

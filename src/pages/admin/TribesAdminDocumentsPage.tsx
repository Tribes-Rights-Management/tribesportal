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
  AppPagination,
} from "@/components/app-ui";

/**
 * TRIBES ADMIN DOCUMENTS PAGE
 * 
 * Contracts and documents management with filter drawer pattern and pagination.
 */

const ITEMS_PER_PAGE = 50;

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

// Mock data - expanded for pagination demo
const mockDocuments: Document[] = Array.from({ length: 89 }, (_, i) => ({
  id: String(i + 1),
  title: [
    "Publishing Agreement",
    "Sync License",
    "Amendment",
    "Publishing Contract",
    "Termination Notice",
    "Master License",
    "Distribution Agreement",
    "Co-Publishing Deal",
    "Sub-Publishing Contract",
    "Administration Agreement",
  ][i % 10] + ` - ${["Luna Wave", "The Frequency", "Coastal Sounds", "Urban Echo", "Summit"][i % 5]}`,
  type: (["agreement", "contract", "amendment", "contract", "termination"] as const)[i % 5],
  party: ["Luna Wave", "The Frequency", "Coastal Sounds", "Urban Echo", "Summit"][i % 5],
  status: (["active", "pending", "active", "expired", "terminated"] as const)[i % 5],
  createdAt: new Date(2026, 0, 28 - (i % 30)).toISOString(),
  expiresAt: i % 3 === 0 ? new Date(2028, 0, 28 - (i % 30)).toISOString() : null,
}));

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
  const [currentPage, setCurrentPage] = useState(1);
  
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
    setCurrentPage(1);
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
    setCurrentPage(1);
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

  // Pagination
  const totalItems = filteredDocuments.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDocuments = filteredDocuments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  return (
    <AppPageContainer maxWidth="xl">
      {/* Header Row: Title + Count + Filter */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight">Documents</h1>
          <span className="text-[12px] text-muted-foreground">
            {totalItems} {totalItems === 1 ? "document" : "documents"}
          </span>
        </div>
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
            {paginatedDocuments.length === 0 ? (
              <AppTableEmpty colSpan={6}>
                <span className="text-muted-foreground text-sm">
                  {typeFilter !== "all" ? "No matching documents" : "No documents"}
                </span>
              </AppTableEmpty>
            ) : (
              paginatedDocuments.map(doc => (
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

        <AppPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
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

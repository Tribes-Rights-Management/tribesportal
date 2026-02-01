import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";

import {
  AppPageHeader,
  AppPageContainer,
  AppSection,
  AppSearchInput,
  AppSelect,
  AppTable,
  AppTableHeader,
  AppTableBody,
  AppTableRow,
  AppTableHead,
  AppTableCell,
  AppTableEmpty,
  AppTableBadge,
} from "@/components/app-ui";

/**
 * TRIBES ADMIN DOCUMENTS PAGE
 * 
 * Contracts and documents management with type filtering.
 */

type DocumentType = "all" | "contract" | "agreement" | "amendment" | "termination";
type DocumentStatus = "draft" | "pending" | "active" | "expired" | "terminated";

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

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "contract", label: "Contracts" },
  { value: "agreement", label: "Agreements" },
  { value: "amendment", label: "Amendments" },
  { value: "termination", label: "Terminations" },
];

export default function TribesAdminDocumentsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  
  const typeFilter = (searchParams.get("type") as DocumentType) || "all";

  const handleTypeChange = (value: string) => {
    if (value === "all") {
      searchParams.delete("type");
    } else {
      searchParams.set("type", value);
    }
    setSearchParams(searchParams);
  };

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.party.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <AppPageContainer maxWidth="xl">
      <AppPageHeader
        title="Documents"
        backLink={{ to: "/admin", label: "Dashboard" }}
      />

      <AppSection spacing="md">
        <div className="flex items-center gap-4 mb-4">
          <AppSearchInput
            placeholder="Search documents..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="max-w-sm"
          />
          <AppSelect
            value={typeFilter}
            onChange={handleTypeChange}
            options={typeOptions}
            className="w-40"
          />
        </div>

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
                  {searchQuery || typeFilter !== "all" ? "No matching documents" : "No documents"}
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
    </AppPageContainer>
  );
}

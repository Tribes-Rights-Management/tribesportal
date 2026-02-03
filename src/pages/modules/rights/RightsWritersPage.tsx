/**
 * RIGHTS WRITERS PAGE — STAFF WORKSTATION
 * 
 * Displays writers from Supabase 'writers' table with search and pagination.
 * Columns: NAME, PRO, IPI NUMBER, CONTROLLED
 */

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppPageContainer } from "@/components/app-ui/AppPageContainer";
import { AppPageHeader } from "@/components/app-ui/AppPageHeader";
import { AppSearchInput } from "@/components/app-ui/AppSearchInput";
import {
  AppTable,
  AppTableHeader,
  AppTableBody,
  AppTableRow,
  AppTableHead,
  AppTableCell,
  AppTableEmpty,
  AppTableBadge,
} from "@/components/app-ui/AppTable";
import { AppEmptyState } from "@/components/app-ui/AppEmptyState";
import { ChevronLeft, ChevronRight, PenTool } from "lucide-react";

interface Writer {
  id: string;
  name: string;
  pro: string | null;
  ipi_number: string | null;
  is_controlled: boolean | null;
}

const ITEMS_PER_PAGE = 50;

export default function RightsWritersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch writers from Supabase
  const { data: writers = [], isLoading } = useQuery({
    queryKey: ["writers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("writers")
        .select("id, name, pro, ipi_number, is_controlled")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      return (data || []) as Writer[];
    },
  });

  // Filter writers by search query
  const filteredWriters = useMemo(() => {
    if (!searchQuery.trim()) return writers;
    const query = searchQuery.toLowerCase();
    return writers.filter((writer) =>
      writer.name.toLowerCase().includes(query)
    );
  }, [writers, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredWriters.length / ITEMS_PER_PAGE);
  const paginatedWriters = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredWriters.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredWriters, currentPage]);

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <AppPageContainer maxWidth="xl">
      <AppPageHeader title="Writers" />

      {/* Search and count */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <AppSearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search writers..."
          className="max-w-sm"
        />
        <span className="text-sm text-muted-foreground">
          {filteredWriters.length} {filteredWriters.length === 1 ? "writer" : "writers"}
        </span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <span className="text-sm text-muted-foreground">Loading writers...</span>
        </div>
      ) : filteredWriters.length === 0 ? (
        <AppEmptyState
          customIcon={<PenTool className="h-6 w-6" strokeWidth={1.0} />}
          message={searchQuery ? "No writers found" : "No writers yet"}
          description={
            searchQuery
              ? "Try adjusting your search query"
              : "Writers will appear here once added to the catalogue"
          }
        />
      ) : (
        <>
          <AppTable columns={["40%", "20%", "25%", "15%"]}>
            <AppTableHeader>
              <AppTableRow header>
                <AppTableHead>Name</AppTableHead>
                <AppTableHead>PRO</AppTableHead>
                <AppTableHead>IPI Number</AppTableHead>
                <AppTableHead>Controlled</AppTableHead>
              </AppTableRow>
            </AppTableHeader>
            <AppTableBody>
              {paginatedWriters.map((writer) => (
                <AppTableRow key={writer.id}>
                  <AppTableCell>{writer.name}</AppTableCell>
                  <AppTableCell muted>{writer.pro || "—"}</AppTableCell>
                  <AppTableCell mono muted>
                    {writer.ipi_number || "—"}
                  </AppTableCell>
                  <AppTableCell>
                    {writer.is_controlled ? (
                      <AppTableBadge variant="success">Yes</AppTableBadge>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </AppTableCell>
                </AppTableRow>
              ))}
            </AppTableBody>
          </AppTable>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </AppPageContainer>
  );
}

/**
 * RIGHTS WRITERS PAGE — STAFF WORKSTATION
 * 
 * Displays writers from Supabase 'writers' table with search and pagination.
 * Columns: NAME, PRO, IPI NUMBER, (edit)
 */

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppPageContainer } from "@/components/app-ui/AppPageContainer";
import { AppPageHeader } from "@/components/app-ui/AppPageHeader";
import { AppSearchInput } from "@/components/app-ui/AppSearchInput";
import { AppButton } from "@/components/app-ui/AppButton";
import {
  AppTable,
  AppTableHeader,
  AppTableBody,
  AppTableRow,
  AppTableHead,
  AppTableCell,
} from "@/components/app-ui/AppTable";
import { AppEmptyState } from "@/components/app-ui/AppEmptyState";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, PenTool, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

interface Writer {
  id: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  pro: string | null;
  ipi_number: string | null;
  cae_number: string | null;
  email: string | null;
}

interface WriterFormData {
  name: string;
  first_name: string;
  last_name: string;
  pro: string;
  ipi_number: string;
  email: string;
}

const PRO_OPTIONS = [
  "ASCAP",
  "BMI",
  "SESAC",
  "GMR",
  "SOCAN",
  "PRS",
  "APRA",
  "GEMA",
  "SACEM",
  "NS",
];

const ITEMS_PER_PAGE = 50;

const emptyFormData: WriterFormData = {
  name: "",
  first_name: "",
  last_name: "",
  pro: "",
  ipi_number: "",
  email: "",
};

export default function RightsWritersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingWriter, setEditingWriter] = useState<Writer | null>(null);
  const [formData, setFormData] = useState<WriterFormData>(emptyFormData);

  const queryClient = useQueryClient();

  // Fetch writers from Supabase
  const { data: writers = [], isLoading } = useQuery({
    queryKey: ["writers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("writers")
        .select("id, name, first_name, last_name, pro, ipi_number, cae_number, email")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      return (data || []) as Writer[];
    },
  });

  // Save mutation (create or update)
  const saveMutation = useMutation({
    mutationFn: async (data: WriterFormData & { id?: string }) => {
      const payload = {
        name: data.name.trim(),
        first_name: data.first_name.trim() || null,
        last_name: data.last_name.trim() || null,
        pro: data.pro || null,
        ipi_number: data.ipi_number.trim() || null,
        email: data.email.trim() || null,
      };

      if (data.id) {
        // Update existing writer
        const { error } = await supabase
          .from("writers")
          .update(payload)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        // Create new writer
        const { error } = await supabase
          .from("writers")
          .insert({ ...payload, is_active: true });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["writers"] });
      setSheetOpen(false);
      setEditingWriter(null);
      setFormData(emptyFormData);
    },
    onError: (error) => {
      toast.error("Failed to save writer", {
        description: error.message,
      });
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

  // Open sheet for editing
  const handleEdit = (writer: Writer) => {
    setEditingWriter(writer);
    setFormData({
      name: writer.name || "",
      first_name: writer.first_name || "",
      last_name: writer.last_name || "",
      pro: writer.pro || "",
      ipi_number: writer.ipi_number || "",
      email: writer.email || "",
    });
    setSheetOpen(true);
  };

  // Open sheet for creating new writer
  const handleAddWriter = () => {
    setEditingWriter(null);
    setFormData(emptyFormData);
    setSheetOpen(true);
  };

  // Handle form submission
  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    saveMutation.mutate({
      ...formData,
      id: editingWriter?.id,
    });
  };

  // Get IPI display value (ipi_number or cae_number fallback)
  const getIpiDisplay = (writer: Writer) => {
    return writer.ipi_number || writer.cae_number || "—";
  };

  return (
    <AppPageContainer maxWidth="xl">
      <AppPageHeader
        title="Writers"
        action={
          <AppButton onClick={handleAddWriter}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Writer
          </AppButton>
        }
      />

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
          action={
            !searchQuery && (
              <AppButton onClick={handleAddWriter} variant="secondary" size="sm">
                <Plus className="h-4 w-4 mr-1.5" />
                Add Writer
              </AppButton>
            )
          }
        />
      ) : (
        <>
          <AppTable columns={["45%", "20%", "25%", "10%"]}>
            <AppTableHeader>
              <AppTableRow header>
                <AppTableHead>Name</AppTableHead>
                <AppTableHead>PRO</AppTableHead>
                <AppTableHead>IPI Number</AppTableHead>
                <AppTableHead align="right"></AppTableHead>
              </AppTableRow>
            </AppTableHeader>
            <AppTableBody>
              {paginatedWriters.map((writer) => (
                <AppTableRow key={writer.id}>
                  <AppTableCell>{writer.name}</AppTableCell>
                  <AppTableCell muted>{writer.pro || "—"}</AppTableCell>
                  <AppTableCell mono muted>
                    {getIpiDisplay(writer)}
                  </AppTableCell>
                  <AppTableCell align="right">
                    <button
                      onClick={() => handleEdit(writer)}
                      className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      aria-label="Edit writer"
                    >
                      <Pencil className="h-4 w-4" strokeWidth={1.5} />
                    </button>
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

      {/* Writer Edit/Create Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {editingWriter ? "Edit Writer" : "Add Writer"}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            {/* Name (required) */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Display name"
                className="h-10"
              />
            </div>

            {/* First Name / Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="first_name" className="text-xs">
                  First Name
                </Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="First"
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last_name" className="text-xs">
                  Last Name
                </Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Last"
                  className="h-10"
                />
              </div>
            </div>

            {/* PRO Dropdown */}
            <div className="space-y-1.5">
              <Label htmlFor="pro" className="text-xs">
                PRO
              </Label>
              <Select
                value={formData.pro}
                onValueChange={(value) => setFormData({ ...formData, pro: value })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select PRO" />
                </SelectTrigger>
                <SelectContent>
                  {PRO_OPTIONS.map((pro) => (
                    <SelectItem key={pro} value={pro}>
                      {pro}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* IPI Number */}
            <div className="space-y-1.5">
              <Label htmlFor="ipi_number" className="text-xs">
                IPI Number
              </Label>
              <Input
                id="ipi_number"
                value={formData.ipi_number}
                onChange={(e) => setFormData({ ...formData, ipi_number: e.target.value })}
                placeholder="e.g., 00123456789"
                className="h-10 font-mono"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="writer@example.com"
                className="h-10"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => setSheetOpen(false)}
                className="text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                {saveMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </AppPageContainer>
  );
}

import { useState, useEffect, useCallback } from "react";
import { Plus, Search } from "lucide-react";

import {
  AppPageLayout,
  AppButton,
  AppTable,
  AppTableHeader,
  AppTableBody,
  AppTableRow,
  AppTableHead,
  AppTableCell,
  AppTableEmpty,
  AppPagination,
  AppPanel,
  AppPanelFooter,
  AppAlert,
} from "@/components/app-ui";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * RIGHTS PUBLISHERS PAGE — Staff Management View
 *
 * Registry of all publishers from the `publishers` table.
 * Displays: Name, PRO (text abbreviation), IPI Number, Songs count
 */

const ITEMS_PER_PAGE = 50;

const PRO_OPTIONS = [
  "ASCAP", "BMI", "SESAC", "GMR", "SOCAN", "PRS", "APRA", "GEMA", "SACEM", "JASRAC",
];

interface Publisher {
  id: string;
  name: string;
  pro: string | null;
  ipi_number: string | null;
  email: string | null;
  is_active: boolean;
}

export default function RightsPublishersPage() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [songCountMap, setSongCountMap] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Publisher | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    pro: null as string | null,
    ipi_number: "",
    email: "",
  });

  // Fetch publishers + song counts
  const fetchPublishers = useCallback(async () => {
    setLoading(true);
    try {
      const [publishersRes, songCountsRes] = await Promise.all([
        supabase
          .from("publishers")
          .select("id, name, pro, ipi_number, email, is_active")
          .eq("is_active", true)
          .order("name", { ascending: true }),
        supabase
          .from("song_ownership")
          .select("publisher_id"),
      ]);

      if (publishersRes.error) throw publishersRes.error;
      setPublishers((publishersRes.data || []) as Publisher[]);

      // Build song count map by publisher_id
      const countMap = new Map<string, number>();
      ((songCountsRes.data || []) as { publisher_id: string }[]).forEach((sc) => {
        countMap.set(sc.publisher_id, (countMap.get(sc.publisher_id) || 0) + 1);
      });
      setSongCountMap(countMap);
    } catch (err) {
      console.error("Error fetching publishers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublishers();
  }, [fetchPublishers]);

  // Client-side filtering
  const filtered = searchQuery.trim()
    ? publishers.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : publishers;

  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const paged = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setEditing(null);
    setFormData({ name: "", pro: null, ipi_number: "", email: "" });
    setFormError(null);
    setPanelOpen(true);
  };

  const handleEdit = (publisher: Publisher) => {
    setEditing(publisher);
    setFormData({
      name: publisher.name,
      pro: publisher.pro || null,
      ipi_number: publisher.ipi_number || "",
      email: publisher.email || "",
    });
    setFormError(null);
    setPanelOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setFormError("Name is required");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      if (editing) {
        const { error } = await supabase
          .from("publishers")
          .update({
            name: formData.name.trim(),
            pro: formData.pro || null,
            ipi_number: formData.ipi_number?.trim() || null,
            email: formData.email.trim() || null,
          })
          .eq("id", editing.id);
        if (error) throw error;
        toast.success("Publisher updated");
      } else {
        const { error } = await supabase
          .from("publishers")
          .insert({
            name: formData.name.trim(),
            pro: formData.pro || null,
            ipi_number: formData.ipi_number?.trim() || null,
            email: formData.email.trim() || null,
            is_active: true,
          });
        if (error) throw error;
        toast.success("Publisher added");
      }

      setPanelOpen(false);
      fetchPublishers();
    } catch (err) {
      console.error("Error saving publisher:", err);
      setFormError("Failed to save publisher");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editing) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("publishers")
        .delete()
        .eq("id", editing.id);
      if (error) throw error;

      toast.success("Publisher deleted");
      setPanelOpen(false);
      fetchPublishers();
    } catch (err) {
      console.error("Error deleting publisher:", err);
      setFormError("Failed to delete publisher");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppPageLayout
      title="Publishers"
      action={
        <AppButton intent="secondary" size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          Add Publisher
        </AppButton>
      }
    >
      {/* Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search publishers..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full h-10 pl-9 pr-3 text-sm bg-transparent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-muted-foreground/20"
          />
        </div>
        <span className="text-[13px] text-muted-foreground">
          {totalCount.toLocaleString()} publishers
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="px-4 sm:px-0">
          <AppTable columns={["45%", "20%", "25%", "10%"]}>
            <AppTableHeader>
              <AppTableRow header>
                <AppTableHead className="pl-5">Name</AppTableHead>
                <AppTableHead>PRO</AppTableHead>
                <AppTableHead className="hidden sm:table-cell">IPI Number</AppTableHead>
                <AppTableHead className="text-right pr-10">Songs</AppTableHead>
              </AppTableRow>
            </AppTableHeader>
            <AppTableBody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground text-sm"
                  >
                    Loading...
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <AppTableEmpty colSpan={4}>
                  <p className="text-[13px] text-muted-foreground">
                    {searchQuery
                      ? "No publishers match your search"
                      : "No publishers in the system"}
                  </p>
                </AppTableEmpty>
              ) : (
                paged.map((publisher) => (
                  <AppTableRow
                    key={publisher.id}
                    clickable
                    onClick={() => handleEdit(publisher)}
                  >
                    <AppTableCell className="pl-5">{publisher.name}</AppTableCell>
                    <AppTableCell muted>{publisher.pro || "—"}</AppTableCell>
                    <AppTableCell muted className="hidden sm:table-cell">
                      {publisher.ipi_number || "—"}
                    </AppTableCell>
                    <AppTableCell muted className="text-right pr-10 tabular-nums">
                      {songCountMap.get(publisher.id) || 0}
                    </AppTableCell>
                  </AppTableRow>
                ))
              )}
            </AppTableBody>
          </AppTable>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4">
          <AppPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Edit/Add Panel */}
      <AppPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={editing ? "Edit publisher" : "New publisher"}
        description={
          editing
            ? "Update publisher details"
            : "Add a new publisher to the registry"
        }
        footer={
          <AppPanelFooter
            left={
              editing && (
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="text-xs text-destructive hover:text-destructive/80 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
                >
                  Delete publisher
                </button>
              )
            }
            onCancel={() => setPanelOpen(false)}
            onSubmit={handleSave}
            submitLabel={editing ? "Save Changes" : "Add Publisher"}
            submitting={saving}
          />
        }
      >
        <div className="space-y-4">
          {formError && <AppAlert variant="error" message={formError} />}

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Publisher name"
              className="w-full h-9 px-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
              PRO
            </label>
            <select
              value={formData.pro || ""}
              onChange={(e) =>
                setFormData({ ...formData, pro: e.target.value || null })
              }
              className="w-full h-9 px-3 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Not specified</option>
              {PRO_OPTIONS.map((pro) => (
                <option key={pro} value={pro}>
                  {pro}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
              IPI Number
            </label>
            <input
              type="text"
              value={formData.ipi_number}
              onChange={(e) =>
                setFormData({ ...formData, ipi_number: e.target.value })
              }
              placeholder="e.g., 00123456789"
              className="w-full h-9 px-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="publisher@example.com"
              className="w-full h-9 px-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </AppPanel>
    </AppPageLayout>
  );
}

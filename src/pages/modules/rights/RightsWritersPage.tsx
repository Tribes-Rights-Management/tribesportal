import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";

import {
  AppPageContainer,
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
  AppPageHeader,
} from "@/components/app-ui";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * RIGHTS WRITERS PAGE — Staff Management View
 * 
 * Master registry of all writers/composers/interested parties.
 * Displays: Name, PRO, IPI Number
 */

const ITEMS_PER_PAGE = 50;

interface Writer {
  id: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  pro: string | null;
  ipi_number: string | null;
  cae_number: string | null;
  email: string | null;
  created_at: string;
}

const PRO_OPTIONS = [
  { value: "", label: "Not specified" },
  { value: "ASCAP", label: "ASCAP" },
  { value: "BMI", label: "BMI" },
  { value: "SESAC", label: "SESAC" },
  { value: "GMR", label: "GMR" },
  { value: "SOCAN", label: "SOCAN" },
  { value: "PRS", label: "PRS" },
  { value: "APRA", label: "APRA" },
  { value: "GEMA", label: "GEMA" },
  { value: "SACEM", label: "SACEM" },
  { value: "NS", label: "NS (Not Specified)" },
];

export default function RightsWritersPage() {
  const [writers, setWriters] = useState<Writer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Writer | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    pro: "",
    ipi_number: "",
    email: "",
  });

  // Fetch writers from Supabase
  const fetchWriters = async () => {
    setLoading(true);
    
    try {
      // Build count query
      let countQuery = supabase
        .from('writers')
        .select('*', { count: 'exact', head: true });
      
      if (searchQuery.trim()) {
        countQuery = countQuery.ilike('name', `%${searchQuery.trim()}%`);
      }
      
      const { count } = await countQuery;
      setTotalCount(count || 0);

      // Fetch paginated data
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('writers')
        .select('id, name, first_name, last_name, pro, ipi_number, cae_number, email, created_at')
        .order('name', { ascending: true })
        .range(from, to);

      if (searchQuery.trim()) {
        query = query.ilike('name', `%${searchQuery.trim()}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching writers:', error);
        return;
      }

      setWriters(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWriters();
  }, [currentPage, searchQuery]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setEditing(null);
    setFormData({
      name: "",
      pro: "",
      ipi_number: "",
      email: "",
    });
    setFormError(null);
    setPanelOpen(true);
  };

  const handleEdit = (writer: Writer) => {
    setEditing(writer);
    setFormData({
      name: writer.name || "",
      pro: writer.pro || "",
      ipi_number: writer.ipi_number || writer.cae_number || "",
      email: writer.email || "",
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
        // Update existing
        const { error } = await supabase
          .from('writers')
          .update({
            name: formData.name.trim(),
            pro: formData.pro || null,
            ipi_number: formData.ipi_number.trim() || null,
            email: formData.email.trim() || null,
          })
          .eq('id', editing.id);

        if (error) throw error;
        toast.success('Writer updated');
      } else {
        // Create new
        const { error } = await supabase
          .from('writers')
          .insert({
            name: formData.name.trim(),
            pro: formData.pro || null,
            ipi_number: formData.ipi_number.trim() || null,
            email: formData.email.trim() || null,
          });

        if (error) throw error;
        toast.success('Writer added');
      }

      setPanelOpen(false);
      fetchWriters();
    } catch (err) {
      console.error('Error saving writer:', err);
      setFormError('Failed to save writer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editing) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('writers')
        .delete()
        .eq('id', editing.id);

      if (error) throw error;
      
      toast.success('Writer deleted');
      setPanelOpen(false);
      fetchWriters();
    } catch (err) {
      console.error('Error deleting writer:', err);
      setFormError('Failed to delete writer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppPageContainer maxWidth="xl">
      {/* Header */}
      <AppPageHeader
        title="Writers"
        action={
          <AppButton intent="primary" size="sm" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />
            Add Writer
          </AppButton>
        }
      />

      {/* Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search writers..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full h-10 pl-9 pr-3 text-sm bg-transparent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-muted-foreground/20"
          />
        </div>
        <span className="text-[13px] text-muted-foreground">
          {totalCount.toLocaleString()} writers
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-[500px] px-4 sm:px-0">
          <AppTable columns={["45%", "20%", "35%"]}>
            <AppTableHeader>
              <AppTableRow header>
                <AppTableHead>Name</AppTableHead>
                <AppTableHead>PRO</AppTableHead>
                <AppTableHead>IPI Number</AppTableHead>
              </AppTableRow>
            </AppTableHeader>
            <AppTableBody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center py-12 text-muted-foreground text-sm">
                    Loading...
                  </td>
                </tr>
              ) : writers.length === 0 ? (
                <AppTableEmpty colSpan={3}>
                  <p className="text-[13px] text-muted-foreground">
                    {searchQuery ? "No writers match your search" : "No writers in the system"}
                  </p>
                </AppTableEmpty>
              ) : (
                writers.map((writer) => (
                  <AppTableRow
                    key={writer.id}
                    clickable
                    onClick={() => handleEdit(writer)}
                  >
                    <AppTableCell>{writer.name}</AppTableCell>
                    <AppTableCell muted>{writer.pro || "—"}</AppTableCell>
                    <AppTableCell muted>{writer.ipi_number || writer.cae_number || "—"}</AppTableCell>
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
        title={editing ? "Edit writer" : "New writer"}
        description={editing ? "Update writer details" : "Add a new writer to the registry"}
        footer={
          <AppPanelFooter
            left={
              editing && (
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="text-xs text-destructive hover:text-destructive/80 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
                >
                  Delete writer
                </button>
              )
            }
            onCancel={() => setPanelOpen(false)}
            onSubmit={handleSave}
            submitLabel={editing ? "Save Changes" : "Add Writer"}
            submitting={saving}
          />
        }
      >
        <div className="space-y-4">
          {formError && (
            <AppAlert variant="error" message={formError} />
          )}

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Full name"
              className="w-full h-9 px-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
              PRO
            </label>
            <select
              value={formData.pro}
              onChange={(e) => setFormData({ ...formData, pro: e.target.value })}
              className="w-full h-9 px-3 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {PRO_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
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
              onChange={(e) => setFormData({ ...formData, ipi_number: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="writer@example.com"
              className="w-full h-9 px-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </AppPanel>
    </AppPageContainer>
  );
}

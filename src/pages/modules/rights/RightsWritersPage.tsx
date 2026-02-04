import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";

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
  AppSearchInput,
} from "@/components/app-ui";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * RIGHTS WRITERS PAGE — Staff Management View
 * 
 * Master registry of all writers/composers/interested parties.
 * Uses Algolia for fast, typo-tolerant search with Supabase fallback.
 */

const ITEMS_PER_PAGE = 50;
const ALGOLIA_APP_ID = "8WVEYVACJ3";
const ALGOLIA_SEARCH_KEY = "8d74d3b795b7d35a82f93d9af9b7535755ddc22419ab8d4495ceac0eebf5a6ad";
const ALGOLIA_INDEX = "writers";
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
  const [searchSource, setSearchSource] = useState<'algolia' | 'supabase'>('supabase');
  
  // Panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Writer | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    pro: "",
    ipi_number: "",
    email: "",
  });

  // Debounce search query for API calls
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Algolia search function
  const algoliaSearch = useCallback(async (query: string, page: number): Promise<{ hits: Writer[]; totalHits: number } | null> => {
    if (!query.trim()) return null;

    try {
      const response = await fetch(
        `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX}/query`,
        {
          method: 'POST',
          headers: {
            'X-Algolia-API-Key': ALGOLIA_SEARCH_KEY,
            'X-Algolia-Application-Id': ALGOLIA_APP_ID,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            page,
            hitsPerPage: ITEMS_PER_PAGE,
            attributesToRetrieve: ['objectID', 'name', 'first_name', 'last_name', 'pro', 'ipi_number', 'email', 'created_at'],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Algolia search failed: ${response.status}`);
      }

      const data = await response.json();

      const hits: Writer[] = data.hits.map((hit: { objectID: string; name: string; first_name: string | null; last_name: string | null; pro: string | null; ipi_number: string | null; email: string | null; created_at: string }) => ({
        id: hit.objectID,
        name: hit.name,
        first_name: hit.first_name,
        last_name: hit.last_name,
        pro: hit.pro,
        ipi_number: hit.ipi_number,
        cae_number: null,
        email: hit.email,
        created_at: hit.created_at,
      }));

      return { hits, totalHits: data.nbHits };
    } catch (err) {
      console.error('Algolia search error:', err);
      return null;
    }
  }, []);

  // Fetch writers - uses Algolia for search, Supabase for browsing
  const fetchWriters = useCallback(async () => {
    setLoading(true);
    
    try {
      // Try Algolia if has search query
      if (debouncedSearch.trim()) {
        const algoliaResult = await algoliaSearch(debouncedSearch, currentPage - 1);
        
        if (algoliaResult) {
          setWriters(algoliaResult.hits);
          setTotalCount(algoliaResult.totalHits);
          setSearchSource('algolia');
          setLoading(false);
          return;
        }
        // Fall through to Supabase if Algolia fails
      }

      // Supabase: for browsing or as fallback
      setSearchSource('supabase');

      // Build count query
      let countQuery = supabase
        .from('writers')
        .select('*', { count: 'exact', head: true });
      
      if (debouncedSearch.trim()) {
        countQuery = countQuery.ilike('name', `%${debouncedSearch.trim()}%`);
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

      if (debouncedSearch.trim()) {
        query = query.ilike('name', `%${debouncedSearch.trim()}%`);
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
  }, [currentPage, debouncedSearch, algoliaSearch]);

  useEffect(() => {
    fetchWriters();
  }, [fetchWriters]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleCreate = () => {
    setEditing(null);
    setFormData({
      first_name: "",
      last_name: "",
      pro: "",
      ipi_number: "",
      email: "",
    });
    setFormError(null);
    setPanelOpen(true);
  };

  const handleEdit = (writer: Writer) => {
    setEditing(writer);
    
    // Parse first/last from name if individual fields are empty
    let firstName = writer.first_name || "";
    let lastName = writer.last_name || "";
    
    if (!firstName && !lastName && writer.name) {
      const nameParts = writer.name.trim().split(/\s+/);
      firstName = nameParts[0] || "";
      lastName = nameParts.slice(1).join(' ') || "";
    }
    
    setFormData({
      first_name: firstName,
      last_name: lastName,
      pro: writer.pro || "",
      ipi_number: writer.ipi_number || writer.cae_number || "",
      email: writer.email || "",
    });
    setFormError(null);
    setPanelOpen(true);
  };

  const syncToAlgolia = async (action: 'upsert' | 'delete', writerId: string) => {
    try {
      await supabase.functions.invoke('sync-writers-algolia', {
        body: { action, writer_id: writerId },
      });
    } catch (err) {
      console.warn('Algolia sync failed (non-blocking):', err);
    }
  };

  const handleSave = async () => {
    const firstName = formData.first_name.trim();
    const lastName = formData.last_name.trim();
    
    if (!firstName) {
      setFormError("First name is required");
      return;
    }
    
    // Build full name from first + last
    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    
    setSaving(true);
    setFormError(null);

    try {
      if (editing) {
        // Update existing
        const { error } = await supabase
          .from('writers')
          .update({
            name: fullName,
            first_name: firstName || null,
            last_name: lastName || null,
            pro: formData.pro || null,
            ipi_number: formData.ipi_number.trim() || null,
            email: formData.email.trim() || null,
          })
          .eq('id', editing.id);

        if (error) throw error;
        
        // Sync to Algolia (non-blocking)
        syncToAlgolia('upsert', editing.id);
        
        toast.success('Writer updated');
      } else {
        // Create new
        const { data, error } = await supabase
          .from('writers')
          .insert({
            name: fullName,
            first_name: firstName || null,
            last_name: lastName || null,
            pro: formData.pro || null,
            ipi_number: formData.ipi_number.trim() || null,
            email: formData.email.trim() || null,
          })
          .select('id')
          .single();

        if (error) throw error;
        
        // Sync to Algolia (non-blocking)
        if (data?.id) {
          syncToAlgolia('upsert', data.id);
        }
        
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
      const writerId = editing.id;
      
      const { error } = await supabase
        .from('writers')
        .delete()
        .eq('id', writerId);

      if (error) throw error;
      
      // Sync deletion to Algolia (non-blocking)
      syncToAlgolia('delete', writerId);
      
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
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-semibold tracking-tight">Writers</h1>
        <AppButton intent="secondary" size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          Add Writer
        </AppButton>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4 mb-4">
        <AppSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search writers..."
          className="flex-1 max-w-sm"
        />
        <span className="text-[13px] text-muted-foreground">
          {totalCount.toLocaleString()} writers
          {debouncedSearch.trim() && searchSource === 'algolia' && (
            <span className="ml-1 text-xs opacity-60">(Algolia)</span>
          )}
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                First Name *
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="First name"
                className="w-full h-9 px-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                Last Name
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Last name"
                className="w-full h-9 px-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
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

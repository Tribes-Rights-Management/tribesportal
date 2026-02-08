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
import { useDebounce } from "@/hooks/useDebounce";

/**
 * RIGHTS WRITERS PAGE — Staff Management View
 * 
 * Master registry of all writers/composers/interested parties.
 * Uses Algolia for fast, typo-tolerant search.
 * Displays: Name, PRO, IPI Number
 */

const ITEMS_PER_PAGE = 50;

// Algolia configuration
const ALGOLIA_APP_ID = "8WVEYVACJ3";
const ALGOLIA_SEARCH_KEY = "00c22202043b8d20f009257782838d48";
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
  { value: "NS", label: "NS (No Society)" },
];

export default function RightsWritersPage() {
  const [writers, setWriters] = useState<Writer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [writerSongCountMap, setWriterSongCountMap] = useState<Map<string, number>>(new Map());
  
  // Debounce search query for Algolia
  const debouncedSearch = useDebounce(searchQuery, 300);
  
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

  // Sync writer to Algolia after create/update/delete
  const syncWriterToAlgolia = async (writerId: string, action: 'upsert' | 'delete' = 'upsert') => {
    try {
      await supabase.functions.invoke('sync-writers-algolia', {
        body: { action, writer_id: writerId }
      });
    } catch (err) {
      console.error('Failed to sync to Algolia:', err);
    }
  };

  // Algolia search function
  const searchAlgolia = useCallback(async (query: string, page: number) => {
    if (!ALGOLIA_SEARCH_KEY) {
      console.warn("Algolia search key not configured, falling back to Supabase");
      return null;
    }

    try {
      const response = await fetch(
        `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX}/query`,
        {
          method: "POST",
          headers: {
            "X-Algolia-API-Key": ALGOLIA_SEARCH_KEY,
            "X-Algolia-Application-Id": ALGOLIA_APP_ID,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            page: page - 1, // Algolia is 0-indexed
            hitsPerPage: ITEMS_PER_PAGE,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Algolia search failed");
      }

      const data = await response.json();
      return {
        hits: data.hits.map((hit: any) => ({
          id: hit.objectID,
          name: hit.name,
          first_name: hit.first_name,
          last_name: hit.last_name,
          pro: hit.pro,
          ipi_number: hit.ipi_number,
          cae_number: null,
          email: hit.email,
          created_at: "",
        })),
        totalCount: data.nbHits,
      };
    } catch (error) {
      console.error("Algolia search error:", error);
      return null;
    }
  }, []);

  // Fetch writers - uses Algolia for search, Supabase for browse
  const fetchWriters = useCallback(async () => {
    setLoading(true);
    
    try {
      // If searching and Algolia is available, use it
      if (debouncedSearch.trim()) {
        const algoliaResult = await searchAlgolia(debouncedSearch, currentPage);
        
        if (algoliaResult) {
          setWriters(algoliaResult.hits);
          setTotalCount(algoliaResult.totalCount);
          setLoading(false);
          return;
        }
      }

      // Fallback to Supabase (for browsing or if Algolia fails)
      let countQuery = supabase
        .from('writers')
        .select('*', { count: 'exact', head: true });
      
      if (debouncedSearch.trim()) {
        countQuery = countQuery.ilike('name', `%${debouncedSearch.trim()}%`);
      }
      
      const { count } = await countQuery;
      setTotalCount(count || 0);

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
  }, [currentPage, debouncedSearch, searchAlgolia]);

  // Fetch song counts per writer (once on mount)
  const fetchSongCounts = useCallback(async () => {
    try {
      const { data: songsData } = await supabase
        .from("songs")
        .select("metadata");

      const countMap = new Map<string, number>();
      (songsData || []).forEach((song) => {
        const writers: { name?: string }[] = (song.metadata as any)?.writers || [];
        writers.forEach((w) => {
          if (w.name) {
            const normalized = w.name.trim().toLowerCase();
            countMap.set(normalized, (countMap.get(normalized) || 0) + 1);
          }
        });
      });
      setWriterSongCountMap(countMap);
    } catch (err) {
      console.error("Error fetching song counts:", err);
    }
  }, []);

  useEffect(() => {
    fetchWriters();
  }, [fetchWriters]);

  useEffect(() => {
    fetchSongCounts();
  }, [fetchSongCounts]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

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
    
    // Try to get first/last name, fallback to parsing from name field
    let firstName = writer.first_name || "";
    let lastName = writer.last_name || "";
    
    // If no first/last name but we have a name, try to split it
    if (!firstName && !lastName && writer.name) {
      const nameParts = writer.name.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(" ");
      } else if (nameParts.length === 1) {
        // Single name goes in First Name field
        firstName = nameParts[0];
      }
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

  const handleSave = async () => {
    if (!formData.first_name.trim()) {
      setFormError("First name is required");
      return;
    }
    
    setSaving(true);
    setFormError(null);

    // Build full name from first + last
    const fullName = [formData.first_name.trim(), formData.last_name.trim()]
      .filter(Boolean)
      .join(" ");

    try {
      if (editing) {
        // Update existing
        const { error } = await supabase
          .from('writers')
          .update({
            name: fullName,
            first_name: formData.first_name.trim() || null,
            last_name: formData.last_name.trim() || null,
            pro: formData.pro || null,
            ipi_number: formData.ipi_number.trim() || null,
            email: formData.email.trim() || null,
          })
          .eq('id', editing.id);

        if (error) throw error;
        toast.success('Writer updated');
        syncWriterToAlgolia(editing.id, 'upsert');
      } else {
        // Create new
        const { data: newWriter, error } = await supabase
          .from('writers')
          .insert({
            name: fullName,
            first_name: formData.first_name.trim() || null,
            last_name: formData.last_name.trim() || null,
            pro: formData.pro || null,
            ipi_number: formData.ipi_number.trim() || null,
            email: formData.email.trim() || null,
          })
          .select('id')
          .single();

        if (error) throw error;

        // Sync new writer to Algolia
        if (newWriter?.id) {
          syncWriterToAlgolia(newWriter.id, 'upsert');
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
      const { error } = await supabase
        .from('writers')
        .delete()
        .eq('id', editing.id);

      if (error) throw error;
      
      toast.success('Writer deleted');
      syncWriterToAlgolia(editing.id, 'delete');
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
    <AppPageLayout
      title="Writers"
      action={
        <AppButton
          intent="secondary"
          size="sm"
          onClick={handleCreate}
        >
          <Plus className="h-4 w-4" />
          Add Writer
        </AppButton>
      }
    >

      {/* Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-4 mb-4">
        <div className="relative flex-1">
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
        <div className="px-4 sm:px-0">
          <AppTable columns={["40%", "20%", "20%", "20%"]}>
            <AppTableHeader>
              <AppTableRow header>
                <AppTableHead className="pl-5">Name</AppTableHead>
                <AppTableHead>PRO</AppTableHead>
                <AppTableHead className="hidden sm:table-cell">IPI Number</AppTableHead>
                <AppTableHead className="text-right pr-5">Songs</AppTableHead>
              </AppTableRow>
            </AppTableHeader>
            <AppTableBody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground text-sm">
                    Loading...
                  </td>
                </tr>
              ) : writers.length === 0 ? (
                <AppTableEmpty colSpan={4}>
                  <p className="text-[13px] text-muted-foreground">
                    {searchQuery ? "No writers match your search" : "No writers in the system"}
                  </p>
                </AppTableEmpty>
              ) : (
                writers.map((writer) => {
                  const songCount = writerSongCountMap.get(writer.name.trim().toLowerCase()) || 0;
                  return (
                    <AppTableRow
                      key={writer.id}
                      clickable
                      onClick={() => handleEdit(writer)}
                    >
                      <AppTableCell className="pl-5">{writer.name}</AppTableCell>
                      <AppTableCell muted>{writer.pro || "—"}</AppTableCell>
                      <AppTableCell muted className="hidden sm:table-cell">{writer.ipi_number || writer.cae_number || "—"}</AppTableCell>
                      <AppTableCell muted className="text-right pr-5 tabular-nums">{songCount}</AppTableCell>
                    </AppTableRow>
                  );
                })
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
                placeholder="First"
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
                placeholder="Last"
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
    </AppPageLayout>
  );
}

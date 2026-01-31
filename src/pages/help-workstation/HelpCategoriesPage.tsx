import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, X, AlertCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useHelpManagement, HelpCategory, HelpAudience } from "@/hooks/useHelpManagement";
import { useCategoryAudiences } from "@/hooks/useCategoryAudiences";
import { supabase } from "@/integrations/supabase/client";
import { AppButton, AppChip } from "@/components/app-ui";

/**
 * HELP CATEGORIES PAGE — INSTITUTIONAL DESIGN
 * With audience assignment support via help_category_audiences junction table.
 */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")   // Remove special characters
    .replace(/\s+/g, "-")        // Replace spaces with dashes
    .replace(/-+/g, "-")         // Replace multiple dashes with single dash
    .replace(/^-|-$/g, "");      // Trim dashes from start/end
}

interface CategoryWithMeta extends HelpCategory {
  article_count: number;
  audienceIds: string[];
}

export default function HelpCategoriesPage() {
  const {
    categories,
    categoriesLoading,
    categoriesError,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    audiences,
    fetchAudiences,
  } = useHelpManagement();

  const { fetchAudiencesForCategory, syncCategoryAudiences } = useCategoryAudiences();

  const [panelOpen, setPanelOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HelpCategory | null>(null);
  const [deleting, setDeleting] = useState<CategoryWithMeta | null>(null);
  const [saving, setSaving] = useState(false);
  const [articleCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Category-audience mappings for display
  const [categoryAudienceMap, setCategoryAudienceMap] = useState<Record<string, string[]>>({});

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [selectedAudienceIds, setSelectedAudienceIds] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchAudiences();
  }, [fetchCategories, fetchAudiences]);

  // Fetch all category-audience relationships for display
  useEffect(() => {
    async function loadCategoryAudiences() {
      const { data, error } = await supabase
        .from("help_category_audiences")
        .select("category_id, audience_id");

      if (!error && data) {
        const map: Record<string, string[]> = {};
        data.forEach(row => {
          if (!map[row.category_id]) {
            map[row.category_id] = [];
          }
          map[row.category_id].push(row.audience_id);
        });
        setCategoryAudienceMap(map);
      }
    }
    loadCategoryAudiences();
  }, [categories]);

  const categoriesWithMeta: CategoryWithMeta[] = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      article_count: articleCounts[cat.id] || 0,
      audienceIds: categoryAudienceMap[cat.id] || [],
    }));
  }, [categories, articleCounts, categoryAudienceMap]);

  // Get audience name by ID
  const getAudienceName = (audienceId: string) => {
    return audiences.find(a => a.id === audienceId)?.name || "Unknown";
  };

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(slugify(value));
  };

  const handleCreate = () => {
    setEditing(null);
    setName("");
    setSlug("");
    setSelectedAudienceIds([]);
    setFormError(null);
    setPanelOpen(true);
  };

  const handleEdit = async (cat: HelpCategory) => {
    setEditing(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setFormError(null);

    // Fetch existing audience links
    const audienceIds = await fetchAudiencesForCategory(cat.id);
    setSelectedAudienceIds(audienceIds);

    setPanelOpen(true);
  };

  const handleAudienceToggle = (audienceId: string) => {
    setSelectedAudienceIds(prev => {
      if (prev.includes(audienceId)) {
        return prev.filter(id => id !== audienceId);
      } else {
        return [...prev, audienceId];
      }
    });
  };

  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) {
      setFormError("Name and slug are required");
      return;
    }

    if (selectedAudienceIds.length === 0) {
      setFormError("Select at least one audience");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      let categoryId: string | null = null;

      if (editing) {
        const result = await updateCategory(editing.id, {
          name: name.trim(),
          slug: slug.trim(),
        });
        if (result) {
          categoryId = result.id;
        }
      } else {
        const result = await createCategory({
          name: name.trim(),
          slug: slug.trim(),
        });
        if (result) {
          categoryId = result.id;
        }
      }

      // Sync audience relationships
      if (categoryId) {
        await syncCategoryAudiences(categoryId, selectedAudienceIds);
        
        // Refresh data
        fetchCategories();
        
        // Update local map
        setCategoryAudienceMap(prev => ({
          ...prev,
          [categoryId!]: selectedAudienceIds,
        }));
        
        setPanelOpen(false);
      }
    } catch (err) {
      setFormError("Unable to save category");
    }

    setSaving(false);
  };

  const handleDeleteClick = (cat: CategoryWithMeta) => {
    setDeleting(cat);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleting) return;

    if (deleting.article_count > 0) {
      setError(`Cannot delete category with ${deleting.article_count} article${deleting.article_count > 1 ? 's' : ''}. Reassign or delete them first.`);
      setDeleteDialogOpen(false);
      setDeleting(null);
      return;
    }

    const success = await deleteCategory(deleting.id);
    if (success) {
      fetchCategories();
    }
    setDeleteDialogOpen(false);
    setDeleting(null);
  };

  const isLoading = categoriesLoading;
  const activeAudiences = audiences.filter(a => a.is_active);

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
            HELP WORKSTATION
          </p>
          <h1 className="text-[20px] font-medium text-foreground mb-1">Categories</h1>
          <p className="text-[13px] text-muted-foreground">{categories.length} categories</p>
        </div>
        <AppButton intent="primary" size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />
          New Category
        </AppButton>
      </div>

      {/* Error */}
      {(error || categoriesError) && (
        <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-destructive/10 border-l-2 border-destructive rounded-r">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-[12px] text-foreground">{error || categoriesError}</p>
            <button
              onClick={() => { setError(null); fetchCategories(); }}
              className="text-[11px] text-destructive hover:text-destructive/80 underline mt-1 flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground font-medium w-[25%]">Name</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground font-medium w-[20%]">Slug</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground font-medium w-[30%]">Audiences</th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground font-medium w-[15%]">Updated</th>
              <th className="w-[50px]"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-20">
                  <p className="text-[13px] text-muted-foreground">Loading categories...</p>
                </td>
              </tr>
            ) : categoriesWithMeta.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-20">
                  <p className="text-[13px] text-muted-foreground">No categories configured yet</p>
                </td>
              </tr>
            ) : (
              categoriesWithMeta.map(cat => (
                <tr
                  key={cat.id}
                  onClick={() => handleEdit(cat)}
                  className="border-b border-border/30 row-hover group"
                >
                  <td className="py-3 px-4 text-[13px] text-foreground">{cat.name}</td>
                  <td className="py-3 px-4 text-[12px] text-muted-foreground font-mono">{cat.slug}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1.5">
                      {cat.audienceIds.length === 0 ? (
                        <span className="text-[11px] text-muted-foreground italic">No audiences</span>
                      ) : (
                        cat.audienceIds.map(audienceId => (
                          <span
                            key={audienceId}
                            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary"
                          >
                            {getAudienceName(audienceId)}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-[12px] text-muted-foreground">
                    {format(new Date(cat.updated_at), "MMM d, yyyy")}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {cat.article_count === 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(cat); }}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete category"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Right-side Panel */}
      {panelOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setPanelOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-[500px] bg-background border-l border-border shadow-2xl z-50 flex flex-col">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div>
                <h2 className="text-[15px] font-medium text-foreground">
                  {editing ? "Edit category" : "New category"}
                </h2>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {editing ? "Update category details" : "Create a new category"}
                </p>
              </div>
              <AppButton 
                intent="ghost" 
                size="sm" 
                onClick={() => setPanelOpen(false)}
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </AppButton>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {formError && (
                <div className="flex items-start gap-3 px-4 py-3 bg-destructive/10 border-l-2 border-destructive rounded-r">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" strokeWidth={1.5} />
                  <p className="text-[12px] text-foreground">{formError}</p>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Category name"
                  className="w-full h-10 px-3 bg-card border border-border rounded text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {name ? `Slug: ${slugify(name)}` : "URL slug will be auto-generated from name"}
                </p>
              </div>

              {/* Audience Visibility Section */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                  Audience Visibility *
                </label>
                <div className="space-y-2">
                  {activeAudiences.length === 0 ? (
                    <p className="text-[12px] text-muted-foreground italic">No audiences available</p>
                  ) : (
                    activeAudiences.map(audience => (
                      <label
                        key={audience.id}
                        className="flex items-center gap-3 p-3 bg-card border border-border rounded cursor-pointer hover:border-primary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAudienceIds.includes(audience.id)}
                          onChange={() => handleAudienceToggle(audience.id)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                        />
                        <span className="text-[13px] text-foreground">{audience.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Panel Footer */}
            <div className="flex items-center justify-between px-6 py-5 border-t border-border">
              <div>
                {editing && (
                  <button
                    onClick={() => {
                      const catWithMeta = categoriesWithMeta.find(c => c.id === editing.id);
                      if (catWithMeta) {
                        handleDeleteClick(catWithMeta);
                        setPanelOpen(false);
                      }
                    }}
                    disabled={categoriesWithMeta.find(c => c.id === editing.id)?.article_count !== 0}
                    className="text-[12px] text-destructive hover:text-destructive/80 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
                  >
                    Delete category
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <AppButton intent="secondary" size="sm" onClick={() => setPanelOpen(false)}>Cancel</AppButton>
                <AppButton intent="primary" size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : editing ? "Save Changes" : "Create"}
                </AppButton>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation */}
      {deleteDialogOpen && deleting && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => { setDeleteDialogOpen(false); setDeleting(null); }} />
          <div className="fixed inset-y-0 right-0 w-[400px] bg-background border-l border-border shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="text-[15px] font-medium text-foreground">Delete category?</h2>
              <AppButton 
                intent="ghost" 
                size="sm" 
                onClick={() => { setDeleteDialogOpen(false); setDeleting(null); }}
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </AppButton>
            </div>

            <div className="flex-1 px-6 py-6">
              <p className="text-[13px] text-muted-foreground">
                {deleting.article_count > 0 ? (
                  <>
                    This category has <strong className="text-foreground">{deleting.article_count} article{deleting.article_count > 1 ? 's' : ''}</strong>.
                    You must reassign or delete them first.
                  </>
                ) : (
                  <>This will permanently delete "{deleting.name}". This action cannot be undone.</>
                )}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-5 border-t border-border">
              <AppButton intent="secondary" size="sm" onClick={() => { setDeleteDialogOpen(false); setDeleting(null); }}>
                Cancel
              </AppButton>
              <AppButton intent="danger" size="sm" onClick={handleDelete} disabled={deleting.article_count > 0}>
                Delete
              </AppButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

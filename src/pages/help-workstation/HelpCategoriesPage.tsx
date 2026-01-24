import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, X, AlertCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useHelpManagement, HelpCategory } from "@/hooks/useHelpManagement";
import { AppButton } from "@/components/app-ui";

/**
 * HELP CATEGORIES PAGE — INSTITUTIONAL DESIGN
 * Simplified to match actual database schema.
 */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

interface CategoryWithCount extends HelpCategory {
  article_count: number;
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
  } = useHelpManagement();

  const [panelOpen, setPanelOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HelpCategory | null>(null);
  const [deleting, setDeleting] = useState<CategoryWithCount | null>(null);
  const [saving, setSaving] = useState(false);
  const [articleCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const categoriesWithCounts: CategoryWithCount[] = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      article_count: articleCounts[cat.id] || 0,
    }));
  }, [categories, articleCounts]);

  useEffect(() => {
    if (!slugManual && name) {
      setSlug(slugify(name));
    }
  }, [name, slugManual]);

  const handleCreate = () => {
    setEditing(null);
    setName("");
    setSlug("");
    setSlugManual(false);
    setDescription("");
    setIcon("");
    setFormError(null);
    setPanelOpen(true);
  };

  const handleEdit = (cat: HelpCategory) => {
    setEditing(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setSlugManual(true);
    setDescription(cat.description || "");
    setIcon(cat.icon || "");
    setFormError(null);
    setPanelOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) {
      setFormError("Name and slug are required");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      if (editing) {
        const result = await updateCategory(editing.id, {
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          icon: icon.trim() || undefined,
        });
        if (result) {
          fetchCategories();
          setPanelOpen(false);
        }
      } else {
        const result = await createCategory({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          icon: icon.trim() || undefined,
        });
        if (result) {
          fetchCategories();
          setPanelOpen(false);
        }
      }
    } catch (err) {
      setFormError("Unable to save category");
    }

    setSaving(false);
  };

  const handleDeleteClick = (cat: CategoryWithCount) => {
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
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground font-medium w-[30%]">Name</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground font-medium w-[25%]">Slug</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground font-medium w-[15%]">Icon</th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground font-medium w-[20%]">Updated</th>
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
            ) : categoriesWithCounts.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-20">
                  <p className="text-[13px] text-muted-foreground">No categories configured yet</p>
                </td>
              </tr>
            ) : (
              categoriesWithCounts.map(cat => (
                <tr
                  key={cat.id}
                  onClick={() => handleEdit(cat)}
                  className="border-b border-border/30 row-hover group"
                >
                  <td className="py-3 px-4 text-[13px] text-foreground">{cat.name}</td>
                  <td className="py-3 px-4 text-[12px] text-muted-foreground font-mono">{cat.slug}</td>
                  <td className="py-3 px-4 text-[12px] text-muted-foreground">{cat.icon || "—"}</td>
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
              <button onClick={() => setPanelOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
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
                <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Category name"
                  className="w-full h-10 px-3 bg-card border border-border rounded text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Slug *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
                  placeholder="category-slug"
                  className="w-full h-10 px-3 bg-card border border-border rounded text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors font-mono"
                />
                <p className="text-[11px] text-muted-foreground mt-2">URL-friendly identifier</p>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description"
                  rows={3}
                  className="w-full px-3 py-2 bg-card border border-border rounded text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Icon (Lucide name)</label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="e.g., CheckCircle, CreditCard"
                  className="w-full h-10 px-3 bg-card border border-border rounded text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                />
              </div>
            </div>

            {/* Panel Footer */}
            <div className="flex items-center justify-between px-6 py-5 border-t border-border">
              <div>
                {editing && (
                  <button
                    onClick={() => {
                      const catWithCount = categoriesWithCounts.find(c => c.id === editing.id);
                      if (catWithCount) {
                        handleDeleteClick(catWithCount);
                        setPanelOpen(false);
                      }
                    }}
                    disabled={categoriesWithCounts.find(c => c.id === editing.id)?.article_count !== 0}
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
              <button onClick={() => { setDeleteDialogOpen(false); setDeleting(null); }} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
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

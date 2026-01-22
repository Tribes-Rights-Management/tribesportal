import { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2, X, AlertCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useHelpManagement, HelpCategory } from "@/hooks/useHelpManagement";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

/**
 * HELP CATEGORIES PAGE — INSTITUTIONAL DESIGN
 * 
 * Right-side panel for create/edit (not centered modal)
 * Inline errors (not toasts)
 * All icons: strokeWidth={1.5}
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
  const [articleCounts, setArticleCounts] = useState<Record<string, number>>({});
  const [countsLoading, setCountsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [sortOrder, setSortOrder] = useState(100);

  useEffect(() => {
    fetchCategories();
    fetchArticleCounts();
  }, [fetchCategories]);

  const fetchArticleCounts = async () => {
    setCountsLoading(true);
    const { data, error } = await supabase
      .from("help_articles")
      .select("category_id")
      .not("category_id", "is", null);

    if (error) {
      console.error("Error fetching article counts:", error);
      setCountsLoading(false);
      return;
    }

    const counts: Record<string, number> = {};
    data?.forEach(article => {
      if (article.category_id) {
        counts[article.category_id] = (counts[article.category_id] || 0) + 1;
      }
    });
    setArticleCounts(counts);
    setCountsLoading(false);
  };

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
    setSortOrder(100);
    setFormError(null);
    setPanelOpen(true);
  };

  const handleEdit = (cat: HelpCategory) => {
    setEditing(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setSlugManual(true);
    setSortOrder(cat.sort_order);
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
          sort_order: sortOrder,
        });
        if (result) {
          fetchCategories();
          setPanelOpen(false);
        }
      } else {
        const result = await createCategory({
          name: name.trim(),
          slug: slug.trim(),
          sort_order: sortOrder,
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

  const isLoading = categoriesLoading || countsLoading;

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium mb-2">
            HELP WORKSTATION
          </p>
          <h1 className="text-[20px] font-medium text-white mb-1">Categories</h1>
          <p className="text-[13px] text-[#AAAAAA]">{categories.length} categories</p>
          <p className="text-[12px] text-[#6B6B6B] mt-1">
            Define how Help articles are organized. Categories with articles cannot be deleted.
          </p>
        </div>
        <Button variant="default" size="sm" onClick={handleCreate}>
          <Plus className="h-3 w-3" strokeWidth={1} />
          New Category
        </Button>
      </div>

      {/* Inline Error */}
      {(error || categoriesError) && (
        <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-[#2A1A1A] border-l-2 border-[#7F1D1D] rounded-r">
          <AlertCircle className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-[12px] text-[#E5E5E5]">{error || categoriesError}</p>
            <button 
              onClick={() => { setError(null); fetchCategories(); }} 
              className="text-[11px] text-[#DC2626] hover:text-[#EF4444] underline mt-1 flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#1A1A1A] border border-[#303030] rounded">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#303030]">
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium w-[35%]">Name</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium w-[30%]">Slug</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium w-[15%]">Articles</th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium w-[20%]">Updated</th>
              <th className="w-[50px]"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-20">
                  <p className="text-[13px] text-[#6B6B6B]">Loading categories...</p>
                </td>
              </tr>
            ) : categoriesWithCounts.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-20">
                  <p className="text-[13px] text-[#6B6B6B]">No categories configured yet</p>
                </td>
              </tr>
            ) : (
              categoriesWithCounts.map(cat => (
                <tr
                  key={cat.id}
                  onClick={() => handleEdit(cat)}
                  className="border-b border-[#303030]/30 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 text-[13px] text-white">{cat.name}</td>
                  <td className="py-3 px-4 text-[12px] text-[#AAAAAA] font-mono">{cat.slug}</td>
                  <td className="py-3 px-4 text-[12px] text-[#8F8F8F]">{cat.article_count}</td>
                  <td className="py-3 px-4 text-right text-[12px] text-[#8F8F8F]">
                    {format(new Date(cat.updated_at), "MMM d, yyyy")}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {cat.article_count === 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(cat);
                        }}
                        className="p-1 text-[#6B6B6B] hover:text-[#DC2626] transition-colors opacity-0 group-hover:opacity-100"
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
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setPanelOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-[500px] bg-[#0A0A0A] border-l border-[#303030] shadow-2xl z-50 flex flex-col">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#303030]">
              <div>
                <h2 className="text-[15px] font-medium text-white">
                  {editing ? 'Edit category' : 'New category'}
                </h2>
                <p className="text-[11px] text-[#8F8F8F] mt-1">
                  {editing ? 'Update category details' : 'Create a new category for organizing articles'}
                </p>
              </div>
              <button onClick={() => setPanelOpen(false)} className="text-[#6B6B6B] hover:text-white transition-colors">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            
            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Form Error */}
              {formError && (
                <div className="flex items-start gap-3 px-4 py-3 bg-[#2A1A1A] border-l-2 border-[#7F1D1D] rounded-r">
                  <AlertCircle className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <p className="text-[12px] text-[#E5E5E5]">{formError}</p>
                </div>
              )}
              
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#6B6B6B] mb-2">Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Category name"
                  className="w-full h-10 px-3 bg-[#1A1A1A] border border-[#303030] rounded text-[13px] text-white placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#505050] transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#6B6B6B] mb-2">Slug</label>
                <input 
                  type="text" 
                  value={slug} 
                  onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }} 
                  placeholder="category-slug"
                  className="w-full h-10 px-3 bg-[#1A1A1A] border border-[#303030] rounded text-[13px] text-white placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#505050] transition-colors"
                />
                <p className="text-[11px] text-[#6B6B6B] mt-2">URL-friendly identifier</p>
              </div>
              
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#6B6B6B] mb-2">Sort order</label>
                <input 
                  type="number" 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 100)}
                  className="w-full h-10 px-3 bg-[#1A1A1A] border border-[#303030] rounded text-[13px] text-white focus:outline-none focus:border-[#505050] transition-colors"
                />
                <p className="text-[11px] text-[#6B6B6B] mt-2">Lower numbers appear first</p>
              </div>
            </div>
            
            {/* Panel Footer */}
            <div className="flex items-center justify-between px-6 py-5 border-t border-[#303030]">
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
                    className="text-[12px] text-[#DC2626] hover:text-[#EF4444] disabled:text-[#6B6B6B] disabled:cursor-not-allowed transition-colors"
                  >
                    Delete category
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPanelOpen(false)}>Cancel</Button>
                <Button variant="default" size="sm" onClick={handleSave} disabled={saving}>
                  {editing ? 'Save Changes' : 'Create'}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation - Right-side panel */}
      {deleteDialogOpen && deleting && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => { setDeleteDialogOpen(false); setDeleting(null); }}
          />
          <div className="fixed inset-y-0 right-0 w-[400px] bg-[#0A0A0A] border-l border-[#303030] shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#303030]">
              <h2 className="text-[15px] font-medium text-white">Delete category?</h2>
              <button onClick={() => { setDeleteDialogOpen(false); setDeleting(null); }} className="text-[#6B6B6B] hover:text-white transition-colors">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            
            <div className="flex-1 px-6 py-6">
              <p className="text-[13px] text-[#8F8F8F]">
                {deleting.article_count > 0 ? (
                  <>
                    This category has <strong className="text-white">{deleting.article_count} article{deleting.article_count > 1 ? 's' : ''}</strong>. 
                    You must reassign or delete them before deleting this category.
                  </>
                ) : (
                  <>This will permanently delete "{deleting.name}". This action cannot be undone.</>
                )}
              </p>
            </div>
            
            <div className="flex items-center justify-end gap-2 px-6 py-5 border-t border-[#303030]">
              <Button variant="outline" size="sm" onClick={() => { setDeleteDialogOpen(false); setDeleting(null); }}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting.article_count > 0}>
                Delete
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

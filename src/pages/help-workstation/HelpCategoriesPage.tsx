import { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useHelpManagement, HelpCategory } from "@/hooks/useHelpManagement";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * HELP CATEGORIES PAGE — INSTITUTIONAL DESIGN
 * 
 * Category management with:
 * - NO decorative icons
 * - Right-slide panel for create/edit
 * - Sharp corners (rounded-md)
 * - Dense layout
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
  const navigate = useNavigate();
  const {
    categories,
    categoriesLoading,
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

  // Article counts per category
  const [articleCounts, setArticleCounts] = useState<Record<string, number>>({});
  const [countsLoading, setCountsLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [sortOrder, setSortOrder] = useState(100);

  // Load categories and article counts
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

  // Merge categories with counts
  const categoriesWithCounts: CategoryWithCount[] = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      article_count: articleCounts[cat.id] || 0,
    }));
  }, [categories, articleCounts]);

  // Auto-generate slug
  useEffect(() => {
    if (!slugManual && name) {
      setSlug(slugify(name));
    }
  }, [name, slugManual]);

  // Open panel for create
  const handleCreate = () => {
    setEditing(null);
    setName("");
    setSlug("");
    setSlugManual(false);
    setSortOrder(100);
    setPanelOpen(true);
  };

  // Open panel for edit
  const handleEdit = (cat: HelpCategory) => {
    setEditing(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setSlugManual(true);
    setSortOrder(cat.sort_order);
    setPanelOpen(true);
  };

  // Save handler
  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) {
      toast({ description: "Name and slug are required", variant: "destructive" });
      return;
    }

    setSaving(true);

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

    setSaving(false);
  };

  // Delete handler
  const handleDeleteClick = (cat: CategoryWithCount) => {
    setDeleting(cat);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    
    if (deleting.article_count > 0) {
      toast({ 
        title: "Cannot delete category",
        description: `This category has ${deleting.article_count} article${deleting.article_count > 1 ? 's' : ''}. Reassign or delete them first.`,
        variant: "destructive" 
      });
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
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p 
            className="text-[10px] uppercase tracking-wider font-medium mb-1"
            style={{ color: '#6B6B6B' }}
          >
            Help Workstation
          </p>
          <h1 
            className="text-[20px] font-medium leading-tight"
            style={{ color: 'var(--platform-text)' }}
          >
            Categories
          </h1>
          <p 
            className="text-[13px] mt-1"
            style={{ color: '#AAAAAA' }}
          >
            {categories.length} {categories.length === 1 ? 'category' : 'categories'}
          </p>
        </div>
        <Button 
          variant="default"
          size="sm"
          onClick={handleCreate}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
          New Category
        </Button>
      </div>

      <p 
        className="text-[12px] mb-4"
        style={{ color: '#8F8F8F' }}
      >
        Define how Help articles are organized. Categories with articles cannot be deleted.
      </p>

      {/* Table */}
      {isLoading ? (
        <div className="py-12 text-center">
          <p className="text-[13px]" style={{ color: '#6B6B6B' }}>Loading categories...</p>
        </div>
      ) : (
        <div 
          className="rounded-md overflow-hidden"
          style={{ 
            backgroundColor: '#1A1A1A',
            border: '1px solid #303030'
          }}
        >
          {/* Table Header */}
          <div 
            className="grid grid-cols-12 gap-4 px-4 py-3 text-[11px] uppercase tracking-wider font-medium"
            style={{ 
              color: '#6B6B6B',
              borderBottom: '1px solid #303030',
            }}
          >
            <div className="col-span-4">Name</div>
            <div className="col-span-3">Slug</div>
            <div className="col-span-2 text-right">Articles</div>
            <div className="col-span-2 hidden md:block">Updated</div>
            <div className="col-span-1"></div>
          </div>
          
          {/* Table Body */}
          {categoriesWithCounts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[13px]" style={{ color: '#8F8F8F' }}>
                No categories configured yet
              </p>
            </div>
          ) : (
            categoriesWithCounts.map((cat, index) => (
              <div 
                key={cat.id}
                className="grid grid-cols-12 gap-4 px-4 py-3 items-center transition-colors"
                style={{ 
                  borderBottom: index < categoriesWithCounts.length - 1 ? '1px solid #303030' : 'none',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div className="col-span-4">
                  <span className="text-[13px] font-medium" style={{ color: 'white' }}>
                    {cat.name}
                  </span>
                </div>
                <div className="col-span-3">
                  <span className="text-[12px]" style={{ color: '#8F8F8F' }}>
                    /{cat.slug}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-[12px] tabular-nums" style={{ color: '#AAAAAA' }}>
                    {cat.article_count}
                  </span>
                </div>
                <div className="col-span-2 hidden md:block">
                  <span className="text-[12px]" style={{ color: '#8F8F8F' }}>
                    {format(new Date(cat.updated_at), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end gap-1">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="p-1.5 rounded hover:bg-white/[0.05] transition-colors"
                    style={{ color: '#AAAAAA' }}
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(cat)}
                    className="p-1.5 rounded hover:bg-white/[0.05] transition-colors"
                    style={{ color: '#AAAAAA' }}
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Category count footer */}
      {!isLoading && categoriesWithCounts.length > 0 && (
        <p 
          className="mt-4 text-[12px]"
          style={{ color: '#6B6B6B' }}
        >
          {categoriesWithCounts.length} categor{categoriesWithCounts.length !== 1 ? 'ies' : 'y'} total
        </p>
      )}

      {/* Right-side Create/Edit Panel */}
      {panelOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0,0,0,0.88)' }}
            onClick={() => setPanelOpen(false)}
          />
          
          {/* Panel */}
          <div 
            className="fixed inset-y-0 right-0 w-full max-w-md z-50 flex flex-col"
            style={{ 
              backgroundColor: '#0A0A0A',
              borderLeft: '1px solid #303030',
            }}
          >
            {/* Header */}
            <div 
              className="flex items-start justify-between p-5"
              style={{ borderBottom: '1px solid #303030' }}
            >
              <div>
                <h2 className="text-[16px] font-medium" style={{ color: 'white' }}>
                  {editing ? "Edit category" : "New category"}
                </h2>
                <p className="text-[12px] mt-0.5" style={{ color: '#8F8F8F' }}>
                  {editing ? "Update category details" : "Create a new category for organizing articles"}
                </p>
              </div>
              <button 
                onClick={() => setPanelOpen(false)}
                className="p-1.5 rounded hover:bg-white/[0.05] transition-colors"
                style={{ color: '#AAAAAA' }}
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="space-y-2">
                <label className="block text-[12px]" style={{ color: '#AAAAAA' }}>Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Category name"
                  className="h-10 w-full px-3 text-[13px] rounded-md transition-colors duration-100 focus:outline-none"
                  style={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #303030',
                    color: 'white',
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-[12px]" style={{ color: '#AAAAAA' }}>Slug</label>
                <input
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugManual(true);
                  }}
                  placeholder="category-slug"
                  className="h-10 w-full px-3 text-[13px] rounded-md transition-colors duration-100 focus:outline-none"
                  style={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #303030',
                    color: 'white',
                  }}
                />
                <p className="text-[11px]" style={{ color: '#6B6B6B' }}>
                  URL-friendly identifier
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-[12px]" style={{ color: '#AAAAAA' }}>Sort order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 100)}
                  className="h-10 w-full px-3 text-[13px] rounded-md transition-colors duration-100 focus:outline-none"
                  style={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #303030',
                    color: 'white',
                  }}
                />
                <p className="text-[11px]" style={{ color: '#6B6B6B' }}>
                  Lower numbers appear first
                </p>
              </div>
            </div>
            
            {/* Footer */}
            <div 
              className="p-5 flex justify-end gap-2"
              style={{ borderTop: '1px solid #303030' }}
            >
              <Button variant="outline" size="sm" onClick={() => setPanelOpen(false)}>
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={handleSave} disabled={saving}>
                {editing ? "Save" : "Create"}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Delete confirmation */}
      {deleteDialogOpen && deleting && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0,0,0,0.88)' }}
            onClick={() => {
              setDeleteDialogOpen(false);
              setDeleting(null);
            }}
          />
          
          {/* Dialog */}
          <div 
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-50 p-6 rounded-md"
            style={{ 
              backgroundColor: '#1A1A1A',
              border: '1px solid #303030',
            }}
          >
            <h3 className="text-[16px] font-medium mb-2" style={{ color: 'white' }}>
              Delete category?
            </h3>
            <p className="text-[13px] mb-5" style={{ color: '#8F8F8F' }}>
              {deleting.article_count > 0 ? (
                <>
                  This category has <strong>{deleting.article_count} article{deleting.article_count > 1 ? 's' : ''}</strong>. 
                  You must reassign or delete them before deleting this category.
                </>
              ) : (
                <>
                  This will permanently delete "{deleting.name}". This action cannot be undone.
                </>
              )}
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDeleting(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDelete}
                disabled={deleting.article_count > 0}
              >
                Delete
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

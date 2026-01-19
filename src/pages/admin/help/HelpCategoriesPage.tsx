import { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useHelpManagement, HelpCategory } from "@/hooks/useHelpManagement";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InstitutionalLoadingState } from "@/components/ui/institutional-states";
import { PageShell } from "@/components/ui/page-shell";
import { PageContainer } from "@/components/ui/page-container";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * HELP CATEGORIES PAGE — SYSTEM CONSOLE (INSTITUTIONAL TABLE-BASED)
 * 
 * Company-scoped category management for Help backend.
 * Categories are few, so table is simple but includes article counts.
 * Safe deletion: prevent delete if category has articles.
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

/** Institutional button component for admin surfaces */
function InstitutionalButton({ 
  children, 
  onClick, 
  variant = "primary",
  size = "default",
  disabled = false,
  className = "",
  type = "button"
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "tertiary";
  size?: "default" | "sm" | "xs" | "icon";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  const baseStyles = "inline-flex items-center justify-center gap-1.5 font-medium transition-colors duration-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20 disabled:opacity-40 disabled:cursor-not-allowed";
  
  const sizeStyles = {
    default: "h-8 px-3.5 text-[13px] rounded",
    sm: "h-7 px-3 text-[12px] rounded",
    xs: "h-6 px-2 text-[11px] rounded",
    icon: "h-7 w-7 rounded",
  };
  
  const variantStyles = {
    primary: {
      backgroundColor: 'var(--platform-text)',
      color: 'var(--platform-canvas)',
      border: 'none',
    },
    secondary: {
      backgroundColor: 'transparent',
      color: 'var(--platform-text-secondary)',
      border: '1px solid var(--platform-border)',
    },
    tertiary: {
      backgroundColor: 'transparent',
      color: 'var(--platform-text-muted)',
      border: '1px solid rgba(255,255,255,0.08)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--platform-text-secondary)',
      border: 'none',
    },
    destructive: {
      backgroundColor: 'transparent',
      color: 'rgb(239, 68, 68)',
      border: 'none',
    },
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${className}`}
      style={variantStyles[variant]}
    >
      {children}
    </button>
  );
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

  const [modalOpen, setModalOpen] = useState(false);
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

  // Open modal for create
  const handleCreate = () => {
    setEditing(null);
    setName("");
    setSlug("");
    setSlugManual(false);
    setSortOrder(100);
    setModalOpen(true);
  };

  // Open modal for edit
  const handleEdit = (cat: HelpCategory) => {
    setEditing(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setSlugManual(true);
    setSortOrder(cat.sort_order);
    setModalOpen(true);
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
        setModalOpen(false);
      }
    } else {
      const result = await createCategory({
        name: name.trim(),
        slug: slug.trim(),
        sort_order: sortOrder,
      });
      if (result) {
        fetchCategories();
        setModalOpen(false);
      }
    }

    setSaving(false);
  };

  // Delete handler with safety check
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
    <PageContainer variant="settings">
      <PageShell
        title="Categories"
        subtitle={`${categories.length} ${categories.length === 1 ? 'category' : 'categories'}`}
        backTo="/admin/help/articles"
      />

      {/* Header with CTA */}
      <div className="flex items-center justify-between mb-4">
        <p 
          className="text-[13px]"
          style={{ color: 'var(--platform-text-secondary)' }}
        >
          Define how Help articles are organized
        </p>
        <InstitutionalButton onClick={handleCreate}>
          <Plus className="h-3.5 w-3.5" />
          New category
        </InstitutionalButton>
      </div>

      {/* Content */}
      {isLoading ? (
        <InstitutionalLoadingState message="Loading categories" />
      ) : (
        <div 
          className="rounded overflow-hidden"
          style={{ 
            backgroundColor: 'var(--platform-surface)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Table density="compact">
            <TableHeader>
              <TableRow style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <TableHead className="min-w-[180px] text-[11px] font-medium uppercase tracking-wider">
                  Name
                </TableHead>
                <TableHead className="hidden sm:table-cell text-[11px] font-medium uppercase tracking-wider">
                  Slug
                </TableHead>
                <TableHead numeric className="hidden md:table-cell text-[11px] font-medium uppercase tracking-wider">
                  Articles
                </TableHead>
                <TableHead className="hidden lg:table-cell text-[11px] font-medium uppercase tracking-wider">
                  Updated
                </TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoriesWithCounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8">
                    <p 
                      className="text-[13px]"
                      style={{ color: 'var(--platform-text-secondary)' }}
                    >
                      No categories configured yet.
                    </p>
                  </td>
                </tr>
              ) : (
                categoriesWithCounts.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      <span className="font-medium text-[13px]" style={{ color: 'var(--platform-text)' }}>
                        {cat.name}
                      </span>
                    </TableCell>
                    <TableCell muted className="hidden sm:table-cell text-[12px]">
                      /{cat.slug}
                    </TableCell>
                    <TableCell numeric className="hidden md:table-cell text-[12px]">
                      {cat.article_count}
                    </TableCell>
                    <TableCell muted className="hidden lg:table-cell text-[12px]">
                      {format(new Date(cat.updated_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-0.5">
                        <InstitutionalButton
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(cat)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </InstitutionalButton>
                        <InstitutionalButton
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteClick(cat)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </InstitutionalButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent 
          className="sm:max-w-[420px]"
          style={{
            backgroundColor: 'var(--platform-surface)',
            borderColor: 'var(--platform-border)',
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--platform-text)' }}>
              {editing ? "Edit category" : "New category"}
            </DialogTitle>
            <DialogDescription style={{ color: 'var(--platform-text-secondary)' }}>
              {editing ? "Update category details" : "Create a new category for organizing articles"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name" style={{ color: 'var(--platform-text-secondary)' }}>
                Name
              </Label>
              <input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category name"
                className="h-8 w-full px-3 text-[13px] rounded transition-colors duration-100 focus:outline-none"
                style={{
                  backgroundColor: 'var(--platform-surface-2)',
                  border: '1px solid var(--platform-border)',
                  color: 'var(--platform-text)',
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-slug" style={{ color: 'var(--platform-text-secondary)' }}>
                Slug
              </Label>
              <input
                id="cat-slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugManual(true);
                }}
                placeholder="category-slug"
                className="h-8 w-full px-3 text-[13px] rounded transition-colors duration-100 focus:outline-none"
                style={{
                  backgroundColor: 'var(--platform-surface-2)',
                  border: '1px solid var(--platform-border)',
                  color: 'var(--platform-text)',
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-order" style={{ color: 'var(--platform-text-secondary)' }}>
                Sort order
              </Label>
              <input
                id="cat-order"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 100)}
                className="h-8 w-full px-3 text-[13px] rounded transition-colors duration-100 focus:outline-none"
                style={{
                  backgroundColor: 'var(--platform-surface-2)',
                  border: '1px solid var(--platform-border)',
                  color: 'var(--platform-text)',
                }}
              />
              <p className="text-[11px]" style={{ color: 'var(--platform-text-muted)' }}>
                Lower numbers appear first
              </p>
            </div>
          </div>
          <DialogFooter>
            <InstitutionalButton variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </InstitutionalButton>
            <InstitutionalButton onClick={handleSave} disabled={saving}>
              {editing ? "Save" : "Create"}
            </InstitutionalButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent
          style={{
            backgroundColor: 'var(--platform-surface)',
            borderColor: 'var(--platform-border)',
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: 'var(--platform-text)' }}>
              Delete category?
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: 'var(--platform-text-secondary)' }}>
              {deleting?.article_count && deleting.article_count > 0 ? (
                <>
                  This category has <strong>{deleting.article_count} article{deleting.article_count > 1 ? 's' : ''}</strong>. 
                  You must reassign or delete them before deleting this category.
                </>
              ) : (
                <>
                  This will permanently delete "{deleting?.name}". This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              style={{
                backgroundColor: 'var(--platform-surface-2)',
                borderColor: 'var(--platform-border)',
                color: 'var(--platform-text)',
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleting?.article_count !== undefined && deleting.article_count > 0}
              style={{
                backgroundColor: deleting?.article_count ? 'var(--platform-surface-2)' : 'hsl(0 62% 55%)',
                color: deleting?.article_count ? 'var(--platform-text-muted)' : 'white',
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

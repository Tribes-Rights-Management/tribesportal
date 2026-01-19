import { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
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
import { PageContainer } from "@/components/ui/page-container";
import { 
  AppButton, 
  AppSectionHeader 
} from "@/components/app-ui";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * HELP CATEGORIES PAGE — HELP WORKSTATION
 * 
 * Simple category management with:
 * - List with article counts
 * - Add/Edit/Delete actions
 * - Safe deletion (prevent if articles exist)
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
      <AppSectionHeader
        title="Categories"
        subtitle={`${categories.length} ${categories.length === 1 ? 'category' : 'categories'}`}
        actions={
          <AppButton 
            intent="primary"
            onClick={handleCreate}
            icon={<Plus className="h-4 w-4" />}
          >
            New Category
          </AppButton>
        }
      />

      <p className="text-sm text-muted-foreground mb-4">
        Define how Help articles are organized. Categories with articles cannot be deleted.
      </p>

      {/* Content */}
      {isLoading ? (
        <InstitutionalLoadingState message="Loading categories" />
      ) : (
        <div 
          className="rounded-lg overflow-hidden"
          style={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
          }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[44px]"></TableHead>
                <TableHead className="min-w-[180px] text-xs font-medium uppercase tracking-wider">
                  Name
                </TableHead>
                <TableHead className="hidden sm:table-cell text-xs font-medium uppercase tracking-wider">
                  Slug
                </TableHead>
                <TableHead className="hidden md:table-cell text-xs font-medium uppercase tracking-wider text-right">
                  Articles
                </TableHead>
                <TableHead className="hidden lg:table-cell text-xs font-medium uppercase tracking-wider">
                  Updated
                </TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoriesWithCounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      No categories configured yet.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                categoriesWithCounts.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{cat.name}</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      /{cat.slug}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-right">
                      {cat.article_count}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {format(new Date(cat.updated_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <AppButton
                          intent="ghost"
                          size="xs"
                          onClick={() => handleEdit(cat)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </AppButton>
                        <AppButton
                          intent="danger"
                          size="xs"
                          onClick={() => handleDeleteClick(cat)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </AppButton>
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
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit category" : "New category"}
            </DialogTitle>
            <DialogDescription>
              {editing ? "Update category details" : "Create a new category for organizing articles"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name</Label>
              <input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category name"
                className="h-10 w-full px-3 text-sm rounded-lg transition-colors duration-100 focus:outline-none"
                style={{
                  backgroundColor: 'hsl(var(--muted) / 0.3)',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-slug">Slug</Label>
              <input
                id="cat-slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugManual(true);
                }}
                placeholder="category-slug"
                className="h-10 w-full px-3 text-sm rounded-lg transition-colors duration-100 focus:outline-none"
                style={{
                  backgroundColor: 'hsl(var(--muted) / 0.3)',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-order">Sort order</Label>
              <input
                id="cat-order"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 100)}
                className="h-10 w-full px-3 text-sm rounded-lg transition-colors duration-100 focus:outline-none"
                style={{
                  backgroundColor: 'hsl(var(--muted) / 0.3)',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first
              </p>
            </div>
          </div>
          <DialogFooter>
            <AppButton intent="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </AppButton>
            <AppButton intent="primary" onClick={handleSave} disabled={saving}>
              {editing ? "Save" : "Create"}
            </AppButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleting?.article_count ? deleting.article_count > 0 : false}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { useHelpManagement, HelpCategory } from "@/hooks/useHelpManagement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { InstitutionalLoadingState, InstitutionalEmptyState } from "@/components/ui/institutional-states";
import { toast } from "@/hooks/use-toast";

/**
 * HELP CATEGORIES PAGE — SYSTEM CONSOLE
 * 
 * Company-scoped category management for Help backend.
 */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function HelpCategoriesPage() {
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
  const [deleting, setDeleting] = useState<HelpCategory | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [sortOrder, setSortOrder] = useState(100);

  // Load categories
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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

  // Delete handler
  const handleDelete = async () => {
    if (!deleting) return;
    const success = await deleteCategory(deleting.id);
    if (success) {
      fetchCategories();
    }
    setDeleteDialogOpen(false);
    setDeleting(null);
  };

  return (
    <div 
      className="min-h-full py-8 md:py-12 px-4 md:px-6"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <div 
        className="max-w-[720px] mx-auto rounded-lg"
        style={{
          backgroundColor: 'var(--platform-surface)',
          border: '1px solid var(--platform-border)',
        }}
      >
        <div className="p-6 md:p-8">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 
                  className="text-[20px] md:text-[24px] font-medium tracking-[-0.01em]"
                  style={{ color: 'var(--platform-text)' }}
                >
                  Categories
                </h1>
                <p 
                  className="text-[13px] mt-1"
                  style={{ color: 'var(--platform-text-muted)' }}
                >
                  Organize Help Center articles
                </p>
              </div>
              <Button onClick={handleCreate} size="sm" className="shrink-0">
                <Plus className="h-4 w-4 mr-1.5" />
                New category
              </Button>
            </div>
          </header>

          {/* Content */}
          {categoriesLoading ? (
            <InstitutionalLoadingState message="Loading categories" />
          ) : categories.length === 0 ? (
            <InstitutionalEmptyState
              title="No categories"
              description="Create your first category to organize articles."
            />
          ) : (
            <div 
              className="rounded-md overflow-hidden"
              style={{ 
                backgroundColor: 'var(--platform-surface-2)',
                border: '1px solid var(--platform-border)',
              }}
            >
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
                  style={{ borderBottom: '1px solid var(--platform-border)' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <GripVertical 
                      className="h-4 w-4 shrink-0 opacity-30"
                      style={{ color: 'var(--platform-text-muted)' }}
                    />
                    <div className="min-w-0">
                      <p 
                        className="text-[13px] md:text-[14px] truncate"
                        style={{ color: 'var(--platform-text)' }}
                      >
                        {cat.name}
                      </p>
                      <p 
                        className="text-[11px] truncate"
                        style={{ color: 'var(--platform-text-muted)', opacity: 0.7 }}
                      >
                        /{cat.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(cat)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => {
                        setDeleting(cat);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update category details" : "Create a new category for organizing articles"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugManual(true);
                }}
                placeholder="category-slug"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-order">Sort order</Label>
              <Input
                id="cat-order"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 100)}
              />
              <p className="text-[11px] text-muted-foreground">
                Lower numbers appear first
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete "{deleting?.name}". Articles in this category will become uncategorized. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

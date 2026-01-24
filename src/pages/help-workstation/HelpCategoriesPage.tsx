import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useHelpManagement, HelpCategory } from "@/hooks/useHelpManagement";

// Import from unified app-ui kit
import {
  AppButton,
  AppPageHeader,
  AppAlert,
  AppTable,
  AppTableHeader,
  AppTableBody,
  AppTableRow,
  AppTableHead,
  AppTableCell,
  AppTableEmpty,
  AppPanel,
  AppPanelFooter,
  AppInput,
  AppTextarea,
} from "@/components/app-ui";

/**
 * HELP CATEGORIES PAGE — UNIFIED DESIGN SYSTEM
 *
 * Uses canonical app-ui components for consistency.
 * No hardcoded colors - all styling via CSS variables.
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
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchArticleCounts();
  }, [fetchCategories]);

  const fetchArticleCounts = async () => {
    setCountsLoading(true);
    setArticleCounts({});
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

  const isLoading = categoriesLoading || countsLoading;

  return (
    <div className="flex-1 p-6 md:p-8">
      {/* Page Header */}
      <AppPageHeader
        eyebrow="Help Workstation"
        title="Categories"
        description={`${categories.length} categories. Categories with articles cannot be deleted.`}
        action={
          <AppButton variant="primary" size="sm" onClick={handleCreate}>
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            New Category
          </AppButton>
        }
      />

      {/* Error Alert */}
      {(error || categoriesError) && (
        <div className="mb-6">
          <AppAlert
            variant="error"
            message={error || categoriesError || "An error occurred"}
            onRetry={() => {
              setError(null);
              fetchCategories();
            }}
          />
        </div>
      )}

      {/* Table */}
      <AppTable>
        <AppTableHeader>
          <AppTableRow header>
            <AppTableHead width="30%">Name</AppTableHead>
            <AppTableHead width="25%">Slug</AppTableHead>
            <AppTableHead width="10%">Icon</AppTableHead>
            <AppTableHead width="15%">Articles</AppTableHead>
            <AppTableHead align="right" width="20%">Updated</AppTableHead>
            <AppTableHead width="50px">{""}</AppTableHead>
          </AppTableRow>
        </AppTableHeader>
        <AppTableBody>
          {isLoading ? (
            <AppTableEmpty colSpan={6}>
              <p className="text-[13px] text-muted-foreground">Loading categories...</p>
            </AppTableEmpty>
          ) : categoriesWithCounts.length === 0 ? (
            <AppTableEmpty colSpan={6}>
              <p className="text-[13px] text-muted-foreground">No categories configured yet</p>
            </AppTableEmpty>
          ) : (
            categoriesWithCounts.map(cat => (
              <AppTableRow
                key={cat.id}
                clickable
                onClick={() => handleEdit(cat)}
              >
                <AppTableCell>{cat.name}</AppTableCell>
                <AppTableCell muted className="font-mono">{cat.slug}</AppTableCell>
                <AppTableCell muted>{cat.icon || "—"}</AppTableCell>
                <AppTableCell muted>{cat.article_count}</AppTableCell>
                <AppTableCell align="right" muted>
                  {format(new Date(cat.updated_at), "MMM d, yyyy")}
                </AppTableCell>
                <AppTableCell align="right">
                  {cat.article_count === 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(cat);
                      }}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete category"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  )}
                </AppTableCell>
              </AppTableRow>
            ))
          )}
        </AppTableBody>
      </AppTable>

      {/* Create/Edit Panel */}
      <AppPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={editing ? "Edit category" : "New category"}
        description={editing ? "Update category details" : "Create a new category for organizing articles"}
        footer={
          <AppPanelFooter
            left={
              editing && (
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
              )
            }
            onCancel={() => setPanelOpen(false)}
            onSubmit={handleSave}
            submitLabel={editing ? "Save Changes" : "Create"}
            submitting={saving}
          />
        }
      >
        <div className="space-y-6">
          {/* Form Error */}
          {formError && (
            <AppAlert variant="error" message={formError} />
          )}

          <AppInput
            label="Name"
            value={name}
            onChange={setName}
            placeholder="Category name"
            required
          />

          <AppInput
            label="Slug"
            value={slug}
            onChange={(v) => {
              setSlug(v);
              setSlugManual(true);
            }}
            placeholder="category-slug"
            helperText="URL-friendly identifier"
            required
          />

          <AppTextarea
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="Brief description of this category"
            rows={3}
          />

          <AppInput
            label="Icon (Lucide name)"
            value={icon}
            onChange={setIcon}
            placeholder="e.g., CheckCircle, CreditCard"
            helperText="Enter a Lucide icon name"
          />
        </div>
      </AppPanel>

      {/* Delete Confirmation Panel */}
      <AppPanel
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleting(null);
        }}
        title="Delete category?"
        width="sm"
        footer={
          <div className="flex items-center gap-2">
            <AppButton
              variant="secondary"
              size="sm"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleting(null);
              }}
            >
              Cancel
            </AppButton>
            <AppButton
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting?.article_count !== 0}
            >
              Delete
            </AppButton>
          </div>
        }
      >
        <p className="text-[13px] text-muted-foreground">
          {deleting?.article_count && deleting.article_count > 0 ? (
            <>
              This category has <strong className="text-foreground">{deleting.article_count} article{deleting.article_count > 1 ? 's' : ''}</strong>.
              You must reassign or delete them before deleting this category.
            </>
          ) : (
            <>This will permanently delete "{deleting?.name}". This action cannot be undone.</>
          )}
        </p>
      </AppPanel>
    </div>
  );
}

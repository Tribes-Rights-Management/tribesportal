import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, X, AlertCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useHelpManagement, HelpCategory } from "@/hooks/useHelpManagement";
import { useCategoryAudiences } from "@/hooks/useCategoryAudiences";
import { useCategoryOrderByAudience, CategoryWithPosition } from "@/hooks/useCategoryOrderByAudience";
import { SortableCategoryCard } from "@/components/help/SortableCategoryCard";
import { supabase } from "@/integrations/supabase/client";
import {
  AppButton,
  AppTable,
  AppTableHeader,
  AppTableBody,
  AppTableRow,
  AppTableHead,
  AppTableCell,
  AppTableEmpty,
  AppCheckboxGroup,
  AppPageHeader,
  AppAlert,
  AppEmptyState,
  AppPanel,
  AppPanelFooter,
} from "@/components/app-ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * HELP CATEGORIES PAGE — INSTITUTIONAL DESIGN
 * With audience-based filtering and drag-and-drop reordering.
 */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
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
  const {
    categories: orderedCategories,
    loading: orderLoading,
    fetchCategoriesForAudience,
    updatePositions,
  } = useCategoryOrderByAudience();

  // Audience filter: empty string = "All Categories" view, selected = audience view with drag-drop
  const [selectedAudienceId, setSelectedAudienceId] = useState<string>("");

  // Panel/modal state
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

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeAudiences = useMemo(() => 
    audiences.filter(a => a.is_active).sort((a, b) => a.name.localeCompare(b.name)),
    [audiences]
  );

  const selectedAudience = audiences.find(a => a.id === selectedAudienceId);
  const isTableView = selectedAudienceId === "";

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

  // Load categories when audience filter changes
  useEffect(() => {
    if (selectedAudienceId) {
      fetchCategoriesForAudience(selectedAudienceId);
    }
  }, [selectedAudienceId, fetchCategoriesForAudience]);

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

  const handleEdit = async (cat: HelpCategory | CategoryWithPosition) => {
    const fullCategory = categories.find(c => c.id === cat.id);
    if (!fullCategory) return;

    setEditing(fullCategory);
    setName(fullCategory.name);
    setSlug(fullCategory.slug);
    setFormError(null);

    const audienceIds = await fetchAudiencesForCategory(fullCategory.id);
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

      if (categoryId) {
        await syncCategoryAudiences(categoryId, selectedAudienceIds);

        fetchCategories();

        setCategoryAudienceMap(prev => ({
          ...prev,
          [categoryId!]: selectedAudienceIds,
        }));

        if (selectedAudienceId) {
          fetchCategoriesForAudience(selectedAudienceId);
        }

        setPanelOpen(false);
      }
    } catch (err) {
      setFormError("Unable to save category");
    }

    setSaving(false);
  };

  const handleDeleteClick = (cat: CategoryWithMeta | CategoryWithPosition) => {
    const catWithMeta = categoriesWithMeta.find(c => c.id === cat.id);
    if (catWithMeta) {
      setDeleting(catWithMeta);
      setDeleteDialogOpen(true);
    }
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
      if (selectedAudienceId) {
        fetchCategoriesForAudience(selectedAudienceId);
      }
    }
    setDeleteDialogOpen(false);
    setDeleting(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && selectedAudienceId) {
      const oldIndex = orderedCategories.findIndex(c => c.id === active.id);
      const newIndex = orderedCategories.findIndex(c => c.id === over.id);

      const reordered = arrayMove(orderedCategories, oldIndex, newIndex);
      await updatePositions(selectedAudienceId, reordered);
    }
  };

  const isLoading = categoriesLoading || (selectedAudienceId && orderLoading);

  // Count categories for selected audience
  const linkedCategoryCount = selectedAudienceId ? orderedCategories.length : categories.length;

  return (
    <div className="flex-1 p-4 sm:p-6">
      {/* Page Header */}
      <AppPageHeader
        eyebrow="Help Workstation"
        title="Categories"
        description={
          selectedAudienceId && selectedAudience 
            ? `${linkedCategoryCount} categories linked to ${selectedAudience.name}`
            : `${categories.length} categories`
        }
        action={
          <AppButton intent="primary" size="sm" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />
            New Category
          </AppButton>
        }
      />

      {/* Error */}
      {(error || categoriesError) && (
        <div className="mb-6">
          <AppAlert
            variant="error"
            message={error || categoriesError || ""}
            onRetry={() => { setError(null); fetchCategories(); }}
          />
        </div>
      )}

      {/* Audience Filter - responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-4 mb-4">
        <span className="text-[12px] text-muted-foreground">Audience:</span>
        <Select
          value={selectedAudienceId || "all"}
          onValueChange={(value) => setSelectedAudienceId(value === "all" ? "" : value)}
        >
          <SelectTrigger className="h-10 w-full sm:w-[200px] text-sm border-border bg-transparent focus:ring-2 focus:ring-muted-foreground/20 focus:ring-offset-0">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-sm">
              All Categories
            </SelectItem>
            {activeAudiences.map((audience) => (
              <SelectItem 
                key={audience.id} 
                value={audience.id}
                className="text-sm"
              >
                {audience.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedAudienceId && (
          <span className="text-[11px] text-muted-foreground italic hidden sm:inline">
            Drag to reorder categories for this audience
          </span>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <AppEmptyState message="Loading categories..." size="lg" />
      ) : selectedAudienceId ? (
        /* By Audience View - Sortable Cards */
        orderedCategories.length === 0 ? (
          <AppEmptyState
            icon="folder"
            message={`No categories linked to ${selectedAudience?.name || "this audience"}.`}
            description="Create a category and assign it to this audience."
            size="lg"
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedCategories.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {orderedCategories.map((cat, index) => (
                <SortableCategoryCard
                  key={cat.id}
                  category={cat}
                  index={index}
                  onEdit={handleEdit}
                />
              ))}
            </SortableContext>
          </DndContext>
        )
      ) : (
        /* All Categories View - Table */
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-[500px] px-4 sm:px-0">
            <AppTable columns={["40%", "35%", "25%"]}>
              <AppTableHeader>
                <AppTableRow header>
                  <AppTableHead>Name</AppTableHead>
                  <AppTableHead className="hidden sm:table-cell">Audiences</AppTableHead>
                  <AppTableHead align="right">Updated</AppTableHead>
                </AppTableRow>
              </AppTableHeader>
              <AppTableBody>
                {categoriesWithMeta.length === 0 ? (
                  <AppTableEmpty colSpan={3}>
                    <p className="text-[13px] text-muted-foreground">No categories configured yet</p>
                  </AppTableEmpty>
                ) : (
                  categoriesWithMeta.map(cat => (
                    <AppTableRow
                      key={cat.id}
                      clickable
                      onClick={() => handleEdit(cat)}
                      className="group"
                    >
                      <AppTableCell>{cat.name}</AppTableCell>
                      <AppTableCell muted className="hidden sm:table-cell">
                        {cat.audienceIds.length === 0 ? (
                          <span className="italic">No audiences</span>
                        ) : (
                          cat.audienceIds.map(id => getAudienceName(id)).join(", ")
                        )}
                      </AppTableCell>
                      <AppTableCell align="right" muted>
                        <div className="flex items-center justify-end gap-2">
                          <span>{format(new Date(cat.updated_at), "MMM d, yyyy")}</span>
                          {cat.article_count === 0 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteClick(cat); }}
                              className="p-1 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete category"
                            >
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                          )}
                        </div>
                      </AppTableCell>
                    </AppTableRow>
                  ))
                )}
              </AppTableBody>
            </AppTable>
          </div>
        </div>
      )}

      {/* Right-side Panel */}
      <AppPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={editing ? "Edit category" : "New category"}
        description={editing ? "Update category details" : "Create a new category"}
        footer={
          <AppPanelFooter
            left={
              editing && (
                <button
                  onClick={() => {
                    const catWithMeta = categoriesWithMeta.find(c => c.id === editing.id);
                    if (catWithMeta) {
                      handleDeleteClick(catWithMeta);
                      setPanelOpen(false);
                    }
                  }}
                  disabled={categoriesWithMeta.find(c => c.id === editing.id)?.article_count !== 0}
                  className="text-xs text-destructive hover:text-destructive/80 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
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
        <div className="space-y-4">
          {formError && (
            <AppAlert variant="error" message={formError} />
          )}

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Category name"
              className="w-full h-9 px-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {name ? `Slug: ${slugify(name)}` : "URL slug will be auto-generated from name"}
            </p>
          </div>

          <AppCheckboxGroup
            label="Audience Visibility"
            required
            options={activeAudiences.map(a => ({ id: a.id, label: a.name }))}
            selected={selectedAudienceIds}
            onChange={setSelectedAudienceIds}
            direction="vertical"
          />
        </div>
      </AppPanel>

      {/* Delete Confirmation */}
      <AppPanel
        open={deleteDialogOpen && !!deleting}
        onClose={() => { setDeleteDialogOpen(false); setDeleting(null); }}
        title="Delete category?"
        width="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <AppButton intent="secondary" size="sm" onClick={() => { setDeleteDialogOpen(false); setDeleting(null); }}>
              Cancel
            </AppButton>
            <AppButton intent="danger" size="sm" onClick={handleDelete} disabled={deleting?.article_count !== undefined && deleting.article_count > 0}>
              Delete
            </AppButton>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          {deleting?.article_count && deleting.article_count > 0 ? (
            <>
              This category has <strong className="text-foreground">{deleting.article_count} article{deleting.article_count > 1 ? 's' : ''}</strong>.
              You must reassign or delete them first.
            </>
          ) : (
            <>This will permanently delete "{deleting?.name}". This action cannot be undone.</>
          )}
        </p>
      </AppPanel>
    </div>
  );
}

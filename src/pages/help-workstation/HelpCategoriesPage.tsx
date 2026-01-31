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
import { AppButton, AppSelect } from "@/components/app-ui";

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

type ViewMode = 'all' | 'byAudience';

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

  // View mode and audience filter
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [selectedAudienceId, setSelectedAudienceId] = useState<string>('');

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

  useEffect(() => {
    fetchCategories();
    fetchAudiences();
  }, [fetchCategories, fetchAudiences]);

  // Set default audience when audiences load and switching to byAudience view
  useEffect(() => {
    if (viewMode === 'byAudience' && !selectedAudienceId && activeAudiences.length > 0) {
      setSelectedAudienceId(activeAudiences[0].id);
    }
  }, [viewMode, selectedAudienceId, activeAudiences]);

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
    if (viewMode === 'byAudience' && selectedAudienceId) {
      fetchCategoriesForAudience(selectedAudienceId);
    }
  }, [viewMode, selectedAudienceId, fetchCategoriesForAudience]);

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

        if (viewMode === 'byAudience' && selectedAudienceId) {
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
      if (viewMode === 'byAudience' && selectedAudienceId) {
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

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'byAudience' && activeAudiences.length > 0 && !selectedAudienceId) {
      setSelectedAudienceId(activeAudiences[0].id);
    }
  };

  const isLoading = categoriesLoading || (viewMode === 'byAudience' && orderLoading);

  // Count categories for selected audience
  const linkedCategoryCount = viewMode === 'byAudience' ? orderedCategories.length : categories.length;

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
            HELP WORKSTATION
          </p>
          <h1 className="text-[20px] font-medium text-foreground mb-1">Categories</h1>
          <p className="text-[13px] text-muted-foreground">
            {viewMode === 'byAudience' && selectedAudience 
              ? `${linkedCategoryCount} categories linked to ${selectedAudience.name}`
              : `${categories.length} categories`
            }
          </p>
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

      {/* View Toggle */}
      <div className="flex items-center gap-4 mt-4 mb-4">
        <span className="text-[12px] text-muted-foreground">View:</span>
        
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            name="viewMode"
            checked={viewMode === 'all'}
            onChange={() => handleViewModeChange('all')}
            className="w-3.5 h-3.5"
          />
          <span className="text-[13px] text-foreground">All Categories</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            name="viewMode"
            checked={viewMode === 'byAudience'}
            onChange={() => handleViewModeChange('byAudience')}
            className="w-3.5 h-3.5"
          />
          <span className="text-[13px] text-foreground">By Audience:</span>
        </label>

        <AppSelect
          value={selectedAudienceId}
          onChange={setSelectedAudienceId}
          disabled={viewMode !== 'byAudience'}
          placeholder="Select audience..."
          options={activeAudiences.map(a => ({ value: a.id, label: a.name }))}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-20">
          <p className="text-[13px] text-muted-foreground">Loading categories...</p>
        </div>
      ) : viewMode === 'byAudience' ? (
        /* By Audience View - Sortable Cards */
        orderedCategories.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded">
            <p className="text-[13px] text-muted-foreground">
              No categories linked to {selectedAudience?.name || "this audience"}.
            </p>
            <p className="text-[12px] text-muted-foreground mt-1">
              Create a category and assign it to this audience.
            </p>
          </div>
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
        <div className="bg-card border border-border rounded">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Name</th>
                <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Slug</th>
                <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Audiences</th>
                <th className="text-right py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Updated</th>
                <th className="w-[50px]"></th>
              </tr>
            </thead>
            <tbody>
              {categoriesWithMeta.length === 0 ? (
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
                    className="border-b border-border/30 row-hover group cursor-pointer"
                  >
                    <td className="py-3 px-4 text-[13px] text-foreground">{cat.name}</td>
                    <td className="py-3 px-4 text-[12px] text-muted-foreground font-mono">{cat.slug}</td>
                    <td className="py-3 px-4 text-[13px] text-muted-foreground">
                      {cat.audienceIds.length === 0 ? (
                        <span className="italic">No audiences</span>
                      ) : (
                        cat.audienceIds.map(id => getAudienceName(id)).join(", ")
                      )}
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
      )}

      {/* Right-side Panel */}
      {panelOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setPanelOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-[500px] bg-background border-l border-border shadow-2xl z-50 flex flex-col">
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

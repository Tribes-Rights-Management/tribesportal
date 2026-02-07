import { useState, useEffect, useCallback } from "react";
import { Plus, GripVertical } from "lucide-react";
import {
  AppButton,
  AppPageLayout,
  AppAlert,
  AppEmptyState,
  AppPanel,
  AppPanelFooter,
  AppListCard,
  AppListRow,
} from "@/components/app-ui";
import { supabase } from "@/integrations/supabase/client";

/**
 * HELP AUDIENCES PAGE — Uses app-ui components consistently
 */

interface HelpAudience {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function HelpAudiencesPage() {
  const [audiences, setAudiences] = useState<HelpAudience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<HelpAudience | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [description, setDescription] = useState("");
  
  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const fetchAudiences = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await supabase
      .from("help_audiences")
      .select("*")
      .order("position", { ascending: true });
    
    if (fetchError) {
      console.error("Error fetching audiences:", fetchError);
      setError("Unable to load audiences");
      setLoading(false);
      return;
    }
    
    setAudiences(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAudiences();
  }, [fetchAudiences]);

  // Auto-generate slug from name
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
    setFormError(null);
    setPanelOpen(true);
  };

  const handleEdit = (audience: HelpAudience) => {
    setEditing(audience);
    setName(audience.name);
    setSlug(audience.slug);
    setSlugManual(true);
    setDescription(audience.description || "");
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
        const { error: updateError } = await supabase
          .from("help_audiences")
          .update({
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editing.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("help_audiences")
          .insert({
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim() || null,
            position: audiences.length,
            is_active: true,
          });

        if (insertError) throw insertError;
      }

      await fetchAudiences();
      setPanelOpen(false);
    } catch (err) {
      console.error("Error saving audience:", err);
      setFormError("Unable to save audience");
    }

    setSaving(false);
  };

  const handleToggleActive = async (audience: HelpAudience) => {
    const { error: updateError } = await supabase
      .from("help_audiences")
      .update({
        is_active: !audience.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", audience.id);

    if (updateError) {
      console.error("Error toggling audience:", updateError);
      setError("Unable to update audience");
      return;
    }

    await fetchAudiences();
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null || dragOverIndex === null || draggedIndex === dragOverIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder locally
    const newAudiences = [...audiences];
    const [removed] = newAudiences.splice(draggedIndex, 1);
    newAudiences.splice(dragOverIndex, 0, removed);

    // Update positions
    const updated = newAudiences.map((a, i) => ({ ...a, position: i }));
    setAudiences(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Save to database
    for (const audience of updated) {
      await supabase
        .from("help_audiences")
        .update({ position: audience.position })
        .eq("id", audience.id);
    }
  };

  const handleDelete = async () => {
    if (!editing) return;

    setSaving(true);
    const { error: deleteError } = await supabase
      .from("help_audiences")
      .delete()
      .eq("id", editing.id);

    if (deleteError) {
      console.error("Error deleting audience:", deleteError);
      setFormError("Unable to delete audience. It may have associated categories or articles.");
      setSaving(false);
      return;
    }

    await fetchAudiences();
    setPanelOpen(false);
    setSaving(false);
  };

  return (
    <AppPageLayout
      title="Audiences"
      backLink={{ to: "/help", label: "Overview" }}
      action={
        <AppButton intent="primary" size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />
          New Audience
        </AppButton>
      }
    >
      {/* Error */}
      {error && (
        <div className="mb-6">
          <AppAlert
            variant="error"
            message={error}
            onRetry={() => { setError(null); fetchAudiences(); }}
          />
        </div>
      )}

      {/* Audience List */}
      <div className="space-y-2">
        {loading ? (
          <AppEmptyState message="Loading audiences..." size="lg" />
        ) : audiences.length === 0 ? (
          <AppEmptyState
            icon="users"
            message="No audiences configured yet"
            size="lg"
          />
        ) : (
          audiences.map((audience, index) => (
            <div
              key={audience.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                bg-card border border-border/60 rounded-lg p-3
                ${draggedIndex === index ? "opacity-50" : ""}
                ${dragOverIndex === index ? "border-ring" : ""}
                cursor-grab active:cursor-grabbing transition-colors
              `}
            >
              <div className="flex items-start sm:items-center gap-3">
                {/* Drag handle */}
                <div className="text-muted-foreground hover:text-foreground transition-colors mt-0.5 sm:mt-0">
                  <GripVertical className="h-4 w-4" strokeWidth={1.5} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{audience.name}</span>
                    {!audience.is_active && (
                      <span className="text-2xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                        Inactive
                      </span>
                    )}
                  </div>
                  {audience.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{audience.description}</p>
                  )}
                </div>

                {/* Actions - stack on mobile */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleActive(audience); }}
                    className={`
                      text-xs px-2 py-1 rounded border transition-colors
                      ${audience.is_active
                        ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                        : "border-border text-muted-foreground hover:bg-accent/40"
                      }
                    `}
                  >
                    {audience.is_active ? "Active" : "Inactive"}
                  </button>
                  <AppButton
                    intent="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleEdit(audience); }}
                  >
                    Edit
                  </AppButton>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Right-side Panel */}
      <AppPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={editing ? "Edit audience" : "New audience"}
        description={editing ? "Update audience details" : "Create a new audience segment"}
        footer={
          <AppPanelFooter
            left={
              editing && (
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="text-xs text-destructive hover:text-destructive/80 disabled:text-muted-foreground transition-colors"
                >
                  Delete audience
                </button>
              )
            }
            onCancel={() => setPanelOpen(false)}
            onSubmit={handleSave}
            submitLabel={editing ? "Save Changes" : "Create Audience"}
            submitting={saving}
          />
        }
      >
        <div className="space-y-4">
          {/* Form Error */}
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
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Publishers"
              className="w-full h-9 px-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
              Slug * (URL-friendly, lowercase)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
              placeholder="publishers"
              className="w-full h-9 px-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors font-mono"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
              Description (internal use)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Help content for music publishers"
              rows={3}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors resize-none"
            />
          </div>
        </div>
      </AppPanel>
    </AppPageLayout>
  );
}

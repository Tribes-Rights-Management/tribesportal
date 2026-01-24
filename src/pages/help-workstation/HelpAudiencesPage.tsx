import { useState, useEffect, useCallback } from "react";
import { Plus, GripVertical, X, AlertCircle, RefreshCw } from "lucide-react";
import { AppButton } from "@/components/app-ui";
import { supabase } from "@/integrations/supabase/client";

/**
 * HELP AUDIENCES PAGE — INSTITUTIONAL DESIGN
 * 
 * Manage top-level audience segments for Help Center.
 * Drag to reorder, toggle active, edit/create audiences.
 * 
 * Typography: text-[20px] title, text-[13px] body, text-[10px] headers
 * All icons: strokeWidth={1.5}
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
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
            HELP WORKSTATION
          </p>
          <h1 className="text-[20px] font-medium text-foreground mb-1">Audiences</h1>
          <p className="text-[13px] text-muted-foreground">{audiences.length} audience segments</p>
          <p className="text-[12px] text-muted-foreground mt-1">
            Drag to reorder. This controls the header tab order on the public Help Center.
          </p>
        </div>
        <AppButton intent="primary" size="sm" onClick={handleCreate}>
          <Plus className="h-2 w-2" strokeWidth={1} />
          New Audience
        </AppButton>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-destructive/10 border-l-2 border-destructive rounded-r">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-[12px] text-foreground">{error}</p>
            <button
              onClick={() => { setError(null); fetchAudiences(); }}
              className="text-[11px] text-destructive hover:text-destructive/80 underline mt-1 flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Audience List */}
      <div className="space-y-2">
        {loading ? (
          <div className="py-20 text-center">
            <p className="text-[13px] text-muted-foreground">Loading audiences...</p>
          </div>
        ) : audiences.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[13px] text-muted-foreground">No audiences configured yet</p>
          </div>
        ) : (
          audiences.map((audience, index) => (
            <div
              key={audience.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                bg-card border border-border rounded p-4 row-hover
                ${draggedIndex === index ? "opacity-50" : ""}
                ${dragOverIndex === index ? "border-ring" : ""}
                cursor-grab active:cursor-grabbing
              `}
            >
              <div className="flex items-center gap-4">
                {/* Drag handle */}
                <div className="text-muted-foreground hover:text-foreground transition-colors">
                  <GripVertical className="h-4 w-4" strokeWidth={1.5} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14px] font-medium text-foreground">{audience.name}</h3>
                    {!audience.is_active && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        INACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">/{audience.slug}</p>
                  {audience.description && (
                    <p className="text-[12px] text-muted-foreground/70 mt-1">{audience.description}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleActive(audience); }}
                    className={`
                      text-[11px] px-3 py-1.5 rounded border transition-colors
                      ${audience.is_active
                        ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                        : "border-border text-muted-foreground hover:bg-white/5"
                      }
                    `}
                  >
                    {audience.is_active ? "Active" : "Inactive"}
                  </button>
                  <AppButton
                    intent="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleEdit(audience); }}
                    className="text-[12px] text-muted-foreground hover:text-foreground"
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
      {panelOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setPanelOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-[500px] bg-background border-l border-border shadow-2xl z-50 flex flex-col">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div>
                <h2 className="text-[15px] font-medium text-foreground">
                  {editing ? "Edit audience" : "New audience"}
                </h2>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {editing ? "Update audience details" : "Create a new audience segment"}
                </p>
              </div>
              <button
                onClick={() => setPanelOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Form Error */}
              {formError && (
                <div className="flex items-start gap-3 px-4 py-3 bg-destructive/10 border-l-2 border-destructive rounded-r">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" strokeWidth={1.5} />
                  <p className="text-[12px] text-foreground">{formError}</p>
                </div>
              )}

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Publishers"
                  className="w-full h-10 px-3 bg-card border border-border rounded text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                  Slug * (URL-friendly, lowercase)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
                  placeholder="publishers"
                  className="w-full h-10 px-3 bg-card border border-border rounded text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                  Description (internal use)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Help content for music publishers"
                  rows={3}
                  className="w-full px-3 py-2 bg-card border border-border rounded text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors resize-none"
                />
              </div>
            </div>

            {/* Panel Footer */}
            <div className="flex items-center justify-between px-6 py-5 border-t border-border">
              <div>
                {editing && (
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="text-[12px] text-destructive hover:text-destructive/80 disabled:text-muted-foreground transition-colors"
                  >
                    Delete audience
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <AppButton intent="secondary" size="sm" onClick={() => setPanelOpen(false)}>
                  Cancel
                </AppButton>
                <AppButton intent="primary" size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : editing ? "Save Changes" : "Create Audience"}
                </AppButton>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useHelpManagement, HelpArticle } from "@/hooks/useHelpManagement";
import { useCategoriesByAudience, CategoryForAudience } from "@/hooks/useCategoriesByAudience";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { AppButton, AppChip, AppSelect, AppCheckboxGroup } from "@/components/app-ui";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

/**
 * HELP ARTICLE EDITOR — Multi-Audience Support
 */

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

export default function HelpArticleEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";

  const {
    fetchArticleWithVersion,
    createArticle,
    createVersion,
    publishVersion,
    archiveArticle,
    restoreArticle,
    audiences,
    fetchAudiences,
    categories,
    fetchCategories,
  } = useHelpManagement();

  const {
    fetchCategoriesByAudience,
  } = useCategoriesByAudience();

  const [article, setArticle] = useState<HelpArticle | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showPublishValidation, setShowPublishValidation] = useState(false);

  const [title, setTitle] = useState("");
  const [bodyMd, setBodyMd] = useState("");
  const [status, setStatus] = useState<"draft" | "internal" | "published" | "archived">("draft");

  // Derive slug from title (always auto-generated)
  const slug = title ? slugify(title) : "untitled";

  // Multi-audience selection
  const [selectedAudienceIds, setSelectedAudienceIds] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [availableCategories, setAvailableCategories] = useState<CategoryForAudience[]>([]);

  // Derived state for publish readiness
  const canPublish = Boolean(selectedAudienceIds.length > 0 && selectedCategoryId);

  const activeAudiences = audiences.filter(a => a.is_active);

  useEffect(() => {
    fetchAudiences();
    fetchCategories();
  }, [fetchAudiences, fetchCategories]);

  // Update available categories when selected audiences change
  useEffect(() => {
    async function loadCategoriesForAudiences() {
      if (selectedAudienceIds.length === 0) {
        setAvailableCategories([]);
        return;
      }

      // Fetch categories for each selected audience and merge unique ones
      const allCats: CategoryForAudience[] = [];
      const seenIds = new Set<string>();

      for (const audId of selectedAudienceIds) {
        const cats = await fetchCategoriesByAudience(audId);
        for (const cat of cats) {
          if (!seenIds.has(cat.id)) {
            seenIds.add(cat.id);
            allCats.push(cat);
          }
        }
      }

      setAvailableCategories(allCats);

      // Clear category if it's no longer available
      if (selectedCategoryId && !seenIds.has(selectedCategoryId)) {
        setSelectedCategoryId("");
      }
    }
    loadCategoriesForAudiences();
  }, [selectedAudienceIds, fetchCategoriesByAudience, selectedCategoryId]);

  useEffect(() => {
    async function loadArticle() {
      if (isNew) return;
      setLoading(true);
      setLoadError(false);
      
      const art = await fetchArticleWithVersion(id!);
      if (!art) {
        setLoadError(true);
        setLoading(false);
        return;
      }
      
      setArticle(art);
      setTitle(art.title || "");
      setBodyMd(art.content || "");
      setStatus(art.status);

      // Load audience assignments for this article
      const { data: assignments } = await supabase
        .from("help_article_audiences")
        .select("audience_id, category_id")
        .eq("article_id", id!);

      if (assignments && assignments.length > 0) {
        const audIds = [...new Set(assignments.map(a => a.audience_id))];
        setSelectedAudienceIds(audIds);
        // Use the first assignment's category (they should all be the same)
        setSelectedCategoryId(assignments[0].category_id);
      }

      setLoading(false);
    }
    loadArticle();
  }, [id, isNew, fetchArticleWithVersion]);

  const handleAudienceToggle = (audienceId: string, checked: boolean) => {
    if (checked) {
      setSelectedAudienceIds(prev => [...prev, audienceId]);
    } else {
      setSelectedAudienceIds(prev => prev.filter(id => id !== audienceId));
    }
  };


  const handleSave = async () => {
    setValidationError(null);
    if (!title.trim()) { setValidationError("Title is required"); return; }
    if (!bodyMd.trim()) { setValidationError("Content is required"); return; }

    setSaving(true);
    
    let articleId: string | null = null;

    if (isNew) {
      const result = await createArticle({
        title: title.trim(),
        slug: slug.trim(),
        body_md: bodyMd,
      });
      if (result) {
        articleId = result.id;
      }
    } else {
      const versionId = await createVersion(id!, {
        title: title.trim(),
        slug: slug.trim(),
        body_md: bodyMd,
      });
      if (versionId) {
        articleId = id!;
        const art = await fetchArticleWithVersion(id!);
        if (art) setArticle(art);
      }
    }

    // Save multi-audience assignments
    if (articleId && selectedAudienceIds.length > 0 && selectedCategoryId) {
      // Clear existing audience associations
      await supabase
        .from("help_article_audiences")
        .delete()
        .eq("article_id", articleId);

      // Create new audience associations
      const audienceInserts = selectedAudienceIds.map(audienceId => ({
        article_id: articleId,
        audience_id: audienceId,
        category_id: selectedCategoryId,
        position: 0, // Position managed via drag-drop on list page
      }));

      await supabase
        .from("help_article_audiences")
        .insert(audienceInserts);
    }

    setSaving(false);

    if (isNew && articleId) {
      navigate(`/help/articles/${articleId}`);
    }
  };

  const handlePublish = async () => {
    if (!article) return;

    if (!canPublish) {
      setShowPublishValidation(true);
      return;
    }

    setPublishing(true);

    // Save multi-audience assignments before publishing
    await supabase
      .from("help_article_audiences")
      .delete()
      .eq("article_id", article.id);

    const audienceInserts = selectedAudienceIds.map(audienceId => ({
      article_id: article.id,
      audience_id: audienceId,
      category_id: selectedCategoryId,
      position: 0,
    }));

    await supabase
      .from("help_article_audiences")
      .insert(audienceInserts);

    const success = await publishVersion(article.id, article.id);
    if (success) {
      const art = await fetchArticleWithVersion(article.id);
      if (art) { setArticle(art); setStatus(art.status); }
    }
    setPublishing(false);
  };

  // Clear publish validation when fields are filled
  useEffect(() => {
    if (canPublish) {
      setShowPublishValidation(false);
    }
  }, [canPublish]);

  const handleArchive = async () => {
    if (!article) return;
    const success = await archiveArticle(article.id);
    if (success) {
      const art = await fetchArticleWithVersion(article.id);
      if (art) { setArticle(art); setStatus(art.status); }
    }
  };

  const handleRestore = async () => {
    if (!article) return;
    const success = await restoreArticle(article.id);
    if (success) {
      const art = await fetchArticleWithVersion(article.id);
      if (art) { setArticle(art); setStatus(art.status); }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <p className="text-[13px] text-muted-foreground">Loading article...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex-1 p-8">
        <div className="flex items-start gap-3 px-4 py-3 bg-destructive/10 border-l-2 border-destructive rounded-r max-w-md">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-[12px] text-foreground">Unable to load article</p>
            <AppButton 
              intent="tertiary" 
              size="xs"
              onClick={() => navigate("/help/articles")} 
              className="text-[11px] text-destructive hover:text-destructive/80 mt-1"
            >
              Back to articles
            </AppButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-6 py-3 border-b border-border flex items-center justify-between">
        <AppButton 
          intent="ghost" 
          size="sm" 
          onClick={() => navigate("/help/articles")}
          icon={<ArrowLeft className="h-4 w-4" strokeWidth={1.5} />}
        >
          Back to Articles
        </AppButton>
        <div className="flex items-center gap-2">
          {!isNew && status === "archived" ? (
            <AppButton intent="ghost" size="sm" onClick={handleRestore}>
              Restore
            </AppButton>
          ) : !isNew && (
            <AppButton intent="ghost" size="sm" onClick={handleArchive}>
              Archive
            </AppButton>
          )}
          {!isNew && status === "draft" && (
            <AppButton 
              intent="secondary" 
              size="sm" 
              onClick={handlePublish}
              disabled={publishing}
            >
              {publishing ? "Publishing..." : "Publish"}
            </AppButton>
          )}
          <AppButton intent="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </AppButton>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl space-y-3">
          {/* Validation Error */}
          {validationError && (
            <div className="flex items-start gap-3 px-4 py-3 bg-destructive/10 border-l-2 border-destructive rounded-r">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" strokeWidth={1.5} />
              <p className="text-[12px] text-foreground">{validationError}</p>
            </div>
          )}

          {/* Title + Status Row */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title"
              className="flex-1 h-9 px-3 bg-card border border-border rounded-lg text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {!isNew && (
              <AppChip 
                status={status === "published" ? "pass" : status === "archived" ? "fail" : "pending"}
                label={status.toUpperCase()}
              />
            )}
          </div>

          {/* URL preview */}
          <p className="text-[12px] text-muted-foreground">
            URL: /hc/[audience]/articles/{slug || "untitled"}
          </p>

          {/* Metadata Row - Compact */}
          <div className={cn(
            "flex items-start gap-6 p-4 border rounded-lg",
            showPublishValidation && (selectedAudienceIds.length === 0 || !selectedCategoryId) 
              ? "border-destructive bg-destructive/5" 
              : "border-border bg-muted/30"
          )}>
            {/* Audiences - Inline checkboxes */}
            <div className="flex-1">
              <AppCheckboxGroup
                label="Audiences"
                required
                options={activeAudiences.map(a => ({ id: a.id, label: a.name }))}
                selected={selectedAudienceIds}
                onChange={setSelectedAudienceIds}
                direction="horizontal"
                error={showPublishValidation && selectedAudienceIds.length === 0}
                errorMessage="Required"
              />
            </div>

            {/* Category dropdown */}
            <div className="w-[200px] shrink-0">
              <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">
                Category *
              </label>
              {selectedAudienceIds.length > 0 && availableCategories.length === 0 ? (
                <div className="h-9 flex items-center text-[12px] text-muted-foreground">
                  None available.{" "}
                  <Link to="/help/categories" className="text-primary hover:underline ml-1">
                    Create →
                  </Link>
                </div>
              ) : (
                <AppSelect
                  value={selectedCategoryId}
                  onChange={setSelectedCategoryId}
                  disabled={selectedAudienceIds.length === 0}
                  fullWidth
                  placeholder={selectedAudienceIds.length > 0 ? "Select category" : "Select audiences first"}
                  options={availableCategories.map(c => ({ value: c.id, label: c.name }))}
                  className={cn(
                    showPublishValidation && !selectedCategoryId && "border-destructive"
                  )}
                />
              )}
              {showPublishValidation && !selectedCategoryId && (
                <p className="text-[11px] text-destructive mt-1">Required</p>
              )}
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">
              Content
            </label>
            <div className="bg-card border border-border rounded-lg min-h-[400px]">
              <RichTextEditor content={bodyMd} onChange={setBodyMd} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

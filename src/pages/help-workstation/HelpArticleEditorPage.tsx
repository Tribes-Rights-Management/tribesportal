import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, MoreHorizontal } from "lucide-react";
import { useHelpManagement, HelpArticle } from "@/hooks/useHelpManagement";
import { useCategoriesByAudience, CategoryForAudience } from "@/hooks/useCategoriesByAudience";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { AppButton, AppChip, AppSelect, AppCheckboxGroup } from "@/components/app-ui";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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


  // Save as draft - only requires title
  const handleSaveDraft = async () => {
    setValidationError(null);
    if (!title.trim()) { 
      setValidationError("Title is required"); 
      return; 
    }

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
      // For existing articles, update without changing status
      const { error } = await supabase
        .from("help_articles")
        .update({
          title: title.trim(),
          slug: slug.trim(),
          content: bodyMd,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id!);

      if (!error) {
        articleId = id!;
        const art = await fetchArticleWithVersion(id!);
        if (art) setArticle(art);
      }
    }

    // Save multi-audience assignments if selected
    if (articleId && selectedAudienceIds.length > 0 && selectedCategoryId) {
      await supabase
        .from("help_article_audiences")
        .delete()
        .eq("article_id", articleId);

      const audienceInserts = selectedAudienceIds.map(audienceId => ({
        article_id: articleId,
        audience_id: audienceId,
        category_id: selectedCategoryId,
        position: 0,
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

  // Save and keep published status (for already published articles)
  const handleSavePublished = async () => {
    setValidationError(null);
    if (!title.trim()) { 
      setValidationError("Title is required"); 
      return; 
    }
    if (!bodyMd.trim()) { 
      setValidationError("Content is required to keep published"); 
      return; 
    }

    if (!canPublish) {
      setShowPublishValidation(true);
      return;
    }

    setSaving(true);
    
    const { error } = await supabase
      .from("help_articles")
      .update({
        title: title.trim(),
        slug: slug.trim(),
        content: bodyMd,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id!);

    if (!error) {
      // Update audience assignments
      await supabase
        .from("help_article_audiences")
        .delete()
        .eq("article_id", id!);

      const audienceInserts = selectedAudienceIds.map(audienceId => ({
        article_id: id!,
        audience_id: audienceId,
        category_id: selectedCategoryId,
        position: 0,
      }));

      await supabase
        .from("help_article_audiences")
        .insert(audienceInserts);

      const art = await fetchArticleWithVersion(id!);
      if (art) setArticle(art);
    }

    setSaving(false);
  };

  // Unpublish - revert to draft
  const handleUnpublish = async () => {
    if (!article) return;
    
    setSaving(true);
    
    const { error } = await supabase
      .from("help_articles")
      .update({
        status: "draft",
        published_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", article.id);

    if (!error) {
      const art = await fetchArticleWithVersion(article.id);
      if (art) { 
        setArticle(art); 
        setStatus(art.status); 
      }
    }

    setSaving(false);
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
      <div className="px-4 sm:px-6 py-3 border-b border-border flex items-center justify-between gap-2">
        {/* Back button - icon only on mobile, full on desktop */}
        <AppButton 
          intent="ghost" 
          size="sm" 
          onClick={() => navigate("/help/articles")}
          icon={<ArrowLeft className="h-4 w-4" strokeWidth={1.5} />}
          className="hidden sm:inline-flex"
        >
          Back to Articles
        </AppButton>
        <AppButton 
          intent="ghost" 
          size="sm" 
          onClick={() => navigate("/help/articles")}
          className="sm:hidden p-2"
          aria-label="Back to Articles"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        </AppButton>

        {/* Desktop: Full action row */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Archive/Restore actions */}
          {!isNew && status === "archived" ? (
            <AppButton intent="ghost" size="sm" onClick={handleRestore}>
              Restore
            </AppButton>
          ) : !isNew && status !== "archived" && (
            <AppButton intent="ghost" size="sm" onClick={handleArchive}>
              Archive
            </AppButton>
          )}

          {/* Draft articles: Save Draft + Publish */}
          {(isNew || status === "draft") && (
            <>
              <AppButton 
                intent="secondary" 
                size="sm" 
                onClick={handleSaveDraft}
                disabled={saving || !title.trim()}
              >
                {saving ? "Saving..." : "Save Draft"}
              </AppButton>
              <AppButton 
                intent="primary" 
                size="sm" 
                onClick={handlePublish}
                disabled={publishing || !title.trim() || !bodyMd.trim()}
              >
                {publishing ? "Publishing..." : "Publish"}
              </AppButton>
            </>
          )}

          {/* Published articles: Save + Unpublish */}
          {!isNew && status === "published" && (
            <>
              <AppButton 
                intent="ghost" 
                size="sm" 
                onClick={handleUnpublish}
                disabled={saving}
              >
                Unpublish
              </AppButton>
              <AppButton 
                intent="primary" 
                size="sm" 
                onClick={handleSavePublished}
                disabled={saving || !title.trim() || !bodyMd.trim()}
              >
                {saving ? "Saving..." : "Save"}
              </AppButton>
            </>
          )}

          {/* Internal articles: Save Draft + Publish */}
          {!isNew && status === "internal" && (
            <>
              <AppButton 
                intent="secondary" 
                size="sm" 
                onClick={handleSaveDraft}
                disabled={saving || !title.trim()}
              >
                {saving ? "Saving..." : "Save Draft"}
              </AppButton>
              <AppButton 
                intent="primary" 
                size="sm" 
                onClick={handlePublish}
                disabled={publishing || !title.trim() || !bodyMd.trim()}
              >
                {publishing ? "Publishing..." : "Publish"}
              </AppButton>
            </>
          )}
        </div>

        {/* Mobile: Primary action + overflow menu */}
        <div className="flex sm:hidden items-center gap-2">
          {/* Primary action button based on status */}
          {(isNew || status === "draft" || status === "internal") && (
            <AppButton 
              intent="primary" 
              size="sm" 
              onClick={handlePublish}
              disabled={publishing || !title.trim() || !bodyMd.trim()}
            >
              {publishing ? "..." : "Publish"}
            </AppButton>
          )}
          {!isNew && status === "published" && (
            <AppButton 
              intent="primary" 
              size="sm" 
              onClick={handleSavePublished}
              disabled={saving || !title.trim() || !bodyMd.trim()}
            >
              {saving ? "..." : "Save"}
            </AppButton>
          )}
          {!isNew && status === "archived" && (
            <AppButton intent="secondary" size="sm" onClick={handleRestore}>
              Restore
            </AppButton>
          )}

          {/* Overflow menu for secondary actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <AppButton intent="ghost" size="sm" className="p-2" aria-label="More actions">
                <MoreHorizontal className="h-4 w-4" />
              </AppButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[160px]">
              {(isNew || status === "draft" || status === "internal") && (
                <DropdownMenuItem 
                  onClick={handleSaveDraft}
                  disabled={saving || !title.trim()}
                >
                  Save Draft
                </DropdownMenuItem>
              )}
              {!isNew && status === "published" && (
                <DropdownMenuItem onClick={handleUnpublish} disabled={saving}>
                  Unpublish
                </DropdownMenuItem>
              )}
              {!isNew && status !== "archived" && (
                <DropdownMenuItem onClick={handleArchive}>
                  Archive
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        <div className="max-w-4xl space-y-3">
          {/* Validation Error */}
          {validationError && (
            <div className="flex items-start gap-3 px-4 py-3 bg-destructive/10 border-l-2 border-destructive rounded-r">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" strokeWidth={1.5} />
              <p className="text-[12px] text-foreground">{validationError}</p>
            </div>
          )}

          {/* Title + Status Row - stacks on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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
                className="self-start sm:self-auto"
              />
            )}
          </div>

          {/* URL preview */}
          <p className="text-[12px] text-muted-foreground">
            URL: /hc/[audience]/articles/{slug || "untitled"}
          </p>

          {/* Metadata Row - Responsive: stack on mobile, row on desktop */}
          <div className={cn(
            "flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 p-4 border rounded-lg",
            showPublishValidation && (selectedAudienceIds.length === 0 || !selectedCategoryId) 
              ? "border-destructive bg-destructive/5" 
              : "border-border bg-muted/30"
          )}>
            {/* Audiences - Inline checkboxes */}
            <div className="flex-1 min-w-0">
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

            {/* Category dropdown - full width on mobile, fixed on desktop */}
            <div className="w-full sm:w-[200px] shrink-0">
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

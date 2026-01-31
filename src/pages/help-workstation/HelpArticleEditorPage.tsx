import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, ChevronDown } from "lucide-react";
import { useHelpManagement, HelpArticle } from "@/hooks/useHelpManagement";
import { useArticleAudience } from "@/hooks/useArticleAudience";
import { useCategoriesByAudience, CategoryForAudience } from "@/hooks/useCategoriesByAudience";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { AppButton, AppChip } from "@/components/app-ui";
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

/**
 * HELP ARTICLE EDITOR — With Publishing Settings
 * 
 * Supports audience + category assignment via help_article_audiences junction table.
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
    audiences,
    fetchAudiences,
  } = useHelpManagement();

  const { 
    fetchAssignment, 
    saveAssignment,
  } = useArticleAudience();

  const {
    categories: audienceCategories,
    fetchCategoriesByAudience,
  } = useCategoriesByAudience();

  const [article, setArticle] = useState<HelpArticle | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [bodyMd, setBodyMd] = useState("");
  const [status, setStatus] = useState<"draft" | "internal" | "published" | "archived">("draft");

  // Publishing settings state
  const [selectedAudienceId, setSelectedAudienceId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [position, setPosition] = useState<number>(0);
  const [categoriesForAudience, setCategoriesForAudience] = useState<CategoryForAudience[]>([]);

  // Get active audiences
  const activeAudiences = audiences.filter(a => a.is_active);

  useEffect(() => {
    fetchAudiences();
  }, [fetchAudiences]);

  // Load article and its assignment
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
      setSlug(art.slug);
      setSlugManual(true);
      setBodyMd(art.content || "");
      setStatus(art.status);

      // Fetch existing audience assignment
      const assignment = await fetchAssignment(id!);
      if (assignment) {
        setSelectedAudienceId(assignment.audience_id);
        setSelectedCategoryId(assignment.category_id);
        setPosition(assignment.position);
        
        // Load categories for this audience
        const cats = await fetchCategoriesByAudience(assignment.audience_id);
        setCategoriesForAudience(cats);
      }

      setLoading(false);
    }
    loadArticle();
  }, [id, isNew, fetchArticleWithVersion, fetchAssignment, fetchCategoriesByAudience]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManual && title) {
      setSlug(slugify(title));
    }
  }, [title, slugManual]);

  // Handle audience change - load categories for selected audience
  const handleAudienceChange = async (audienceId: string) => {
    setSelectedAudienceId(audienceId);
    setSelectedCategoryId(""); // Reset category when audience changes
    
    if (audienceId) {
      const cats = await fetchCategoriesByAudience(audienceId);
      setCategoriesForAudience(cats);
    } else {
      setCategoriesForAudience([]);
    }
  };

  const handleSave = async () => {
    setValidationError(null);
    if (!title.trim()) { setValidationError("Title is required"); return; }
    if (!slug.trim()) { setValidationError("Slug is required"); return; }
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
        body_md: bodyMd,
      });
      if (versionId) {
        articleId = id!;
        const art = await fetchArticleWithVersion(id!);
        if (art) setArticle(art);
      }
    }

    // Save audience assignment if both audience and category are selected
    if (articleId && selectedAudienceId && selectedCategoryId) {
      await saveAssignment(articleId, selectedAudienceId, selectedCategoryId, position);
    }

    setSaving(false);

    if (isNew && articleId) {
      navigate(`/help-workstation/articles/${articleId}`);
    }
  };

  const handlePublish = async () => {
    if (!article) return;

    // Validate audience and category before publishing
    if (!selectedAudienceId || !selectedCategoryId) {
      setValidationError("Select an audience and category before publishing");
      setPublishDialogOpen(false);
      return;
    }

    setPublishing(true);

    // Save assignment first
    await saveAssignment(article.id, selectedAudienceId, selectedCategoryId, position);

    const success = await publishVersion(article.id, article.id);
    if (success) {
      const art = await fetchArticleWithVersion(article.id);
      if (art) { setArticle(art); setStatus(art.status); }
    }
    setPublishing(false);
    setPublishDialogOpen(false);
  };

  const handleArchive = async () => {
    if (!article) return;
    const success = await archiveArticle(article.id);
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
              onClick={() => navigate("/help-workstation/articles")} 
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
      <div className="px-8 py-4 border-b border-border flex items-center justify-between">
        <AppButton 
          intent="ghost" 
          size="sm" 
          onClick={() => navigate("/help-workstation/articles")}
          icon={<ArrowLeft className="h-4 w-4" strokeWidth={1.5} />}
        >
          Back to Articles
        </AppButton>
        <div className="flex items-center gap-2">
          {!isNew && status !== "archived" && (
            <AppButton intent="ghost" size="sm" onClick={handleArchive}>
              Archive
            </AppButton>
          )}
          {!isNew && status === "draft" && (
            <AppButton intent="secondary" size="sm" onClick={() => setPublishDialogOpen(true)}>
              Publish
            </AppButton>
          )}
          <AppButton intent="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </AppButton>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl">
          {/* Validation Error */}
          {validationError && (
            <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-destructive/10 border-l-2 border-destructive rounded-r">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" strokeWidth={1.5} />
              <p className="text-[12px] text-foreground">{validationError}</p>
            </div>
          )}

          {/* Status Badge */}
          {!isNew && (
            <div className="mb-6">
              <AppChip 
                status={status === "published" ? "pass" : status === "archived" ? "fail" : "pending"}
                label={status.toUpperCase()}
              />
            </div>
          )}

          {/* Title */}
          <div className="mb-6">
            <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title"
              className="w-full h-12 px-4 bg-card border border-border rounded text-[16px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Slug */}
          <div className="mb-6">
            <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
              placeholder="article-slug"
              className="w-full h-10 px-3 bg-card border border-border rounded text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono"
            />
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Content</label>
            <div className="bg-card border border-border rounded min-h-[400px]">
              <RichTextEditor content={bodyMd} onChange={setBodyMd} />
            </div>
          </div>

          {/* Publishing Settings Section */}
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-[13px] font-medium text-foreground mb-1">Publishing Settings</h3>
            <p className="text-[11px] text-muted-foreground mb-6">
              Assign this article to an audience and category for public visibility
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Audience Dropdown */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                  Audience
                </label>
                <div className="relative">
                  <select
                    value={selectedAudienceId}
                    onChange={(e) => handleAudienceChange(e.target.value)}
                    className="w-full h-10 px-3 pr-8 bg-card border border-border rounded text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
                  >
                    <option value="">Select audience</option>
                    {activeAudiences.map(audience => (
                      <option key={audience.id} value={audience.id}>
                        {audience.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    disabled={!selectedAudienceId}
                    className="w-full h-10 px-3 pr-8 bg-card border border-border rounded text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {selectedAudienceId ? "Select category" : "Select audience first"}
                    </option>
                    {categoriesForAudience.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                {selectedAudienceId && categoriesForAudience.length === 0 && (
                  <p className="text-[11px] text-muted-foreground mt-2 italic">
                    No categories linked to this audience
                  </p>
                )}
              </div>
            </div>

            {/* Position */}
            <div className="max-w-[120px]">
              <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={position}
                onChange={(e) => setPosition(parseInt(e.target.value) || 0)}
                min={0}
                className="w-full h-10 px-3 bg-card border border-border rounded text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <p className="text-[11px] text-muted-foreground mt-2">
                Lower numbers appear first
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Dialog */}
      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Publish Article?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {!selectedAudienceId || !selectedCategoryId ? (
                <span className="text-destructive">
                  You must select an audience and category before publishing.
                </span>
              ) : (
                "This will make the article visible on the public Help Center."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-border text-muted-foreground">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePublish} 
              disabled={publishing || !selectedAudienceId || !selectedCategoryId}
            >
              {publishing ? "Publishing..." : "Publish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

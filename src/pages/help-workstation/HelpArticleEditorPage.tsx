import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useHelpManagement, HelpArticle } from "@/hooks/useHelpManagement";
import { useArticleAudience } from "@/hooks/useArticleAudience";
import { useCategoriesByAudience, CategoryForAudience } from "@/hooks/useCategoriesByAudience";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { AppButton, AppChip, AppSelect } from "@/components/app-ui";
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
 * HELP ARTICLE EDITOR — Compact Layout
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

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [bodyMd, setBodyMd] = useState("");
  const [status, setStatus] = useState<"draft" | "internal" | "published" | "archived">("draft");

  const [selectedAudienceId, setSelectedAudienceId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [position, setPosition] = useState<number>(0);
  const [categoriesForAudience, setCategoriesForAudience] = useState<CategoryForAudience[]>([]);

  const activeAudiences = audiences.filter(a => a.is_active);
  const selectedAudience = activeAudiences.find(a => a.id === selectedAudienceId);

  useEffect(() => {
    fetchAudiences();
  }, [fetchAudiences]);

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
      setBodyMd(art.content || "");
      setStatus(art.status);

      const assignment = await fetchAssignment(id!);
      if (assignment) {
        setSelectedAudienceId(assignment.audience_id);
        setSelectedCategoryId(assignment.category_id);
        setPosition(assignment.position);
        const cats = await fetchCategoriesByAudience(assignment.audience_id);
        setCategoriesForAudience(cats);
      }

      setLoading(false);
    }
    loadArticle();
  }, [id, isNew, fetchArticleWithVersion, fetchAssignment, fetchCategoriesByAudience]);

  // Auto-generate slug from title
  useEffect(() => {
    if (isNew && title) {
      setSlug(slugify(title));
    }
  }, [title, isNew]);

  const handleAudienceChange = async (audienceId: string) => {
    setSelectedAudienceId(audienceId);
    setSelectedCategoryId("");
    
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

    if (articleId && selectedAudienceId && selectedCategoryId) {
      await saveAssignment(articleId, selectedAudienceId, selectedCategoryId, position);
    }

    setSaving(false);

    if (isNew && articleId) {
      navigate(`/help/articles/${articleId}`);
    }
  };

  const handlePublish = async () => {
    if (!article) return;

    if (!selectedAudienceId || !selectedCategoryId) {
      setValidationError("Select an audience and category before publishing");
      setPublishDialogOpen(false);
      return;
    }

    setPublishing(true);
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
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="max-w-4xl space-y-4">
          {/* Validation Error */}
          {validationError && (
            <div className="flex items-start gap-3 px-4 py-3 bg-destructive/10 border-l-2 border-destructive rounded-r">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" strokeWidth={1.5} />
              <p className="text-[12px] text-foreground">{validationError}</p>
            </div>
          )}

          {/* Title + Status Row */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title"
              className="flex-1 h-11 px-4 bg-card border border-border rounded text-[16px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {!isNew && (
              <AppChip 
                status={status === "published" ? "pass" : status === "archived" ? "fail" : "pending"}
                label={status.toUpperCase()}
              />
            )}
          </div>

          {/* Slug Row - Read-only helper text */}
          <div className="px-1">
            <span className="text-[12px] text-muted-foreground">
              URL: /hc/{selectedAudience?.slug || "[audience]"}/articles/{slug || "article-slug"}
            </span>
          </div>

          {/* Publishing Settings - Horizontal compact row */}
          <div className="flex flex-col gap-3 px-4 py-3 bg-muted/30 border border-border rounded md:flex-row md:items-end">
            <div className="flex-1">
              <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                Audience
              </label>
              <AppSelect
                value={selectedAudienceId}
                onChange={handleAudienceChange}
                fullWidth
                placeholder="Select audience"
                options={activeAudiences.map(a => ({ value: a.id, label: a.name }))}
              />
            </div>

            <div className="flex-1">
              <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                Category
              </label>
              {selectedAudienceId && categoriesForAudience.length === 0 ? (
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
                  disabled={!selectedAudienceId}
                  fullWidth
                  placeholder={selectedAudienceId ? "Select category" : "Select audience first"}
                  options={categoriesForAudience.map(c => ({ value: c.id, label: c.name }))}
                />
              )}
            </div>

            <div className="w-full md:w-20">
              <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                Order
              </label>
              <input
                type="number"
                value={position}
                onChange={(e) => setPosition(parseInt(e.target.value) || 0)}
                min={0}
                className="w-full h-9 px-3 bg-card border border-border rounded text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">
              Content
            </label>
            <div className="bg-card border border-border rounded min-h-[400px]">
              <RichTextEditor content={bodyMd} onChange={setBodyMd} />
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

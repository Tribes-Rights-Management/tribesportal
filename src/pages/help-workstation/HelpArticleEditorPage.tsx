import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, ChevronDown } from "lucide-react";
import { useHelpManagement, HelpArticle } from "@/hooks/useHelpManagement";
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
 * HELP ARTICLE EDITOR — Simplified to match database schema
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
    categories,
    fetchCategories,
  } = useHelpManagement();

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

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
      setLoading(false);
    }
    loadArticle();
  }, [id, isNew, fetchArticleWithVersion]);

  useEffect(() => {
    if (!slugManual && title) {
      setSlug(slugify(title));
    }
  }, [title, slugManual]);

  const handleSave = async () => {
    setValidationError(null);
    if (!title.trim()) { setValidationError("Title is required"); return; }
    if (!slug.trim()) { setValidationError("Slug is required"); return; }
    if (!bodyMd.trim()) { setValidationError("Content is required"); return; }

    setSaving(true);
    if (isNew) {
      const result = await createArticle({
        title: title.trim(),
        slug: slug.trim(),
        body_md: bodyMd,
      });
      if (result) {
        navigate(`/help-workstation/articles/${result.id}`);
      }
    } else {
      const versionId = await createVersion(id!, {
        title: title.trim(),
        body_md: bodyMd,
      });
      if (versionId) {
        const art = await fetchArticleWithVersion(id!);
        if (art) setArticle(art);
      }
    }
    setSaving(false);
  };

  const handlePublish = async () => {
    if (!article) return;
    setPublishing(true);
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
            <button onClick={() => navigate("/help-workstation/articles")} className="text-[11px] text-destructive hover:text-destructive/80 underline mt-1">
              Back to articles
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-8 py-4 border-b border-border flex items-center justify-between">
        <button onClick={() => navigate("/help-workstation/articles")} className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Back to Articles
        </button>
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
        </div>
      </div>

      {/* Publish Dialog */}
      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Publish Article?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will make the article visible on the public Help Center.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-border text-muted-foreground">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish} disabled={publishing}>
              {publishing ? "Publishing..." : "Publish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

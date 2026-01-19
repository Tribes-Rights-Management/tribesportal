import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Globe, Lock, Eye, Archive, History, Trash2, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { 
  useHelpManagement, 
  HelpArticle, 
  HelpArticleVersion, 
  HelpCategory 
} from "@/hooks/useHelpManagement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { InstitutionalLoadingState } from "@/components/ui/institutional-states";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

/**
 * HELP ARTICLE EDITOR — SYSTEM CONSOLE
 * 
 * Create/Edit article with Markdown body, immutable version history, and publish controls.
 * 
 * APPEND-ONLY VERSIONING:
 * - All edits create new versions (never overwrites)
 * - Editors always operate on a draft version
 * - Publishing sets published_version_id to selected version
 * - Versions are permanently readable to admins
 * 
 * Institutional tone: authoritative, neutral, calm.
 */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function HelpArticleEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";
  
  const {
    categories,
    fetchCategories,
    createArticle,
    createVersion,
    publishVersion,
    archiveArticle,
    restoreArticle,
    fetchArticleWithVersion,
    fetchVersions,
    deleteArticle,
  } = useHelpManagement();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [article, setArticle] = useState<HelpArticle | null>(null);
  const [versions, setVersions] = useState<HelpArticleVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);

  // Confirmation dialogs
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [summary, setSummary] = useState("");
  const [bodyMd, setBodyMd] = useState("");
  const [categoryId, setCategoryId] = useState<string>("none");
  const [visibility, setVisibility] = useState<"public" | "internal">("public");

  // Load categories
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Load article if editing
  useEffect(() => {
    async function loadArticle() {
      if (isNew) return;
      
      setLoading(true);
      const art = await fetchArticleWithVersion(id!);

      if (!art) {
        toast({ 
          title: "Unable to load article",
          description: "Please try again.", 
          variant: "destructive" 
        });
        navigate("/admin/help/articles");
        return;
      }

      setArticle(art);
      setTitle(art.title || "");
      setSlug(art.slug);
      setSlugManual(true);
      setSummary(art.summary || "");
      setBodyMd(art.body_md || "");
      setCategoryId(art.category_id || "none");
      setVisibility(art.visibility || "public");
      setLoading(false);
    }

    loadArticle();
  }, [id, isNew, navigate, fetchArticleWithVersion]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManual && title) {
      setSlug(slugify(title));
    }
  }, [title, slugManual]);

  // Load versions
  const loadVersions = useCallback(async () => {
    if (!article?.id) return;
    setVersionsLoading(true);
    const vers = await fetchVersions(article.id);
    setVersions(vers);
    setVersionsLoading(false);
  }, [article?.id, fetchVersions]);

  // Save handler - creates a new version (never overwrites)
  const handleSave = async () => {
    if (!title.trim() || !slug.trim() || !bodyMd.trim()) {
      toast({ 
        title: "Required fields missing",
        description: "Title, slug, and content are required.", 
        variant: "destructive" 
      });
      return;
    }

    setSaving(true);

    if (isNew) {
      const result = await createArticle({
        title: title.trim(),
        slug: slug.trim(),
        summary: summary.trim() || undefined,
        body_md: bodyMd,
        category_id: categoryId !== "none" ? categoryId : undefined,
        visibility,
      });
      if (result) {
        navigate(`/admin/help/articles/${result.id}`);
      }
    } else if (article) {
      // Create new version (append-only)
      const versionId = await createVersion(article.id, {
        title: title.trim(),
        summary: summary.trim() || undefined,
        body_md: bodyMd,
        category_id: categoryId !== "none" ? categoryId : null,
        visibility,
      });
      
      if (versionId) {
        // Refresh article data
        const updatedArticle = await fetchArticleWithVersion(article.id);
        if (updatedArticle) {
          setArticle(updatedArticle);
        }
      }
    }

    setSaving(false);
  };

  // Publish handler - publishes current version
  const handlePublish = async () => {
    if (!article?.current_version_id) return;
    
    setSaving(true);
    const success = await publishVersion(article.id, article.current_version_id);
    if (success) {
      setArticle({ 
        ...article, 
        status: "published", 
        published_at: new Date().toISOString(),
        published_version_id: article.current_version_id,
      });
    }
    setSaving(false);
    setPublishDialogOpen(false);
  };

  // Archive handler
  const handleArchive = async () => {
    if (!article) return;
    setSaving(true);
    const success = await archiveArticle(article.id);
    if (success) {
      setArticle({ ...article, status: "archived" });
    }
    setSaving(false);
    setArchiveDialogOpen(false);
  };

  // Restore handler (from archived to draft)
  const handleRestore = async () => {
    if (!article) return;
    setSaving(true);
    const success = await restoreArticle(article.id);
    if (success) {
      setArticle({ ...article, status: "draft" });
    }
    setSaving(false);
    setRestoreDialogOpen(false);
  };

  // Delete handler
  const handleDelete = async () => {
    if (!article) return;
    const success = await deleteArticle(article.id);
    if (success) {
      navigate("/admin/help/articles");
    }
  };

  // Get version author name (placeholder - would need user lookup)
  const getVersionAuthor = (version: HelpArticleVersion) => {
    return version.created_by ? "Staff" : "System";
  };

  if (loading) {
    return (
      <div 
        className="min-h-full flex items-center justify-center py-16"
        style={{ backgroundColor: 'var(--platform-canvas)' }}
      >
        <InstitutionalLoadingState message="Loading article" />
      </div>
    );
  }

  const isPublished = article?.status === "published";
  const isArchived = article?.status === "archived";
  const versionCount = versions.length;

  return (
    <div 
      className="min-h-full py-6 md:py-10 px-4 md:px-6"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <div className="max-w-[800px] mx-auto">
        {/* Header */}
        <header className="mb-6">
          <button
            onClick={() => navigate("/admin/help/articles")}
            className="flex items-center gap-1.5 text-[13px] mb-4 hover:opacity-70 transition-opacity"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Help articles
          </button>
          
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 
                className="text-[20px] md:text-[24px] font-medium"
                style={{ color: 'var(--platform-text)' }}
              >
                {isNew ? "New article" : "Edit article"}
              </h1>
              {article && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] ${
                      article.status === "published" 
                        ? "border-green-500/30 text-green-400" 
                        : article.status === "draft"
                        ? "border-yellow-500/30 text-yellow-400"
                        : "border-gray-500/30 text-gray-400"
                    }`}
                  >
                    {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                  </Badge>
                  {article.current_version_id && (
                    <span className="text-[11px]" style={{ color: 'var(--platform-text-muted)' }}>
                      Version {versionCount || 1}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Versions drawer */}
              {article && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" onClick={loadVersions}>
                      <History className="h-4 w-4 mr-1.5" />
                      Versions
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Version history</SheetTitle>
                    </SheetHeader>
                    <p className="text-[12px] mt-2 mb-4" style={{ color: 'var(--platform-text-muted)' }}>
                      All versions are immutable and retained permanently.
                    </p>
                    <div className="mt-4">
                      {versionsLoading ? (
                        <InstitutionalLoadingState message="Loading" />
                      ) : versions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No versions yet</p>
                      ) : (
                        <div className="space-y-3">
                          {versions.map((ver, index) => (
                            <div 
                              key={ver.id}
                              className="p-3 rounded-md"
                              style={{ 
                                backgroundColor: 'var(--platform-surface-2)',
                                border: ver.id === article.published_version_id 
                                  ? '1px solid var(--green-500, #22c55e)' 
                                  : '1px solid var(--platform-border)',
                              }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[13px] font-medium">
                                  Version {versions.length - index}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {ver.id === article.current_version_id && (
                                    <Badge variant="outline" className="text-[9px]">
                                      Current
                                    </Badge>
                                  )}
                                  {ver.id === article.published_version_id && (
                                    <Badge variant="outline" className="text-[9px] border-green-500/30 text-green-400">
                                      Published
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-[12px] font-medium mb-1 line-clamp-1">
                                {ver.title}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {format(new Date(ver.created_at), "MMM d, yyyy 'at' h:mm a")}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              )}
              
              <Button 
                variant="outline"
                onClick={() => navigate("/admin/help/articles")} 
                disabled={saving}
                size="sm"
              >
                Cancel
              </Button>
              
              <Button 
                onClick={handleSave} 
                disabled={saving}
                size="sm"
              >
                <Save className="h-4 w-4 mr-1.5" />
                Save draft
              </Button>
            </div>
          </div>
        </header>

        {/* Form */}
        <div 
          className="rounded-lg p-6 md:p-8 space-y-6"
          style={{
            backgroundColor: 'var(--platform-surface)',
            border: '1px solid var(--platform-border)',
          }}
        >
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short, descriptive headline"
              style={{ fontSize: '16px' }}
            />
            <p className="text-[11px]" style={{ color: 'var(--platform-text-muted)' }}>
              Displayed as the article headline.
            </p>
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugManual(true);
              }}
              placeholder="article-slug"
              style={{ fontSize: '16px' }}
            />
            <p className="text-[11px]" style={{ color: 'var(--platform-text-muted)' }}>
              URL path: /help/{slug || "..."}
            </p>
          </div>

          {/* Category + Visibility row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Uncategorized</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px]" style={{ color: 'var(--platform-text-muted)' }}>
                Used to organize articles in Help.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={(v) => setVisibility(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5" />
                      Public
                    </div>
                  </SelectItem>
                  <SelectItem value="internal">
                    <div className="flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5" />
                      Internal
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px]" style={{ color: 'var(--platform-text-muted)' }}>
                Public articles are accessible to all users.
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary">Summary (optional)</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief overview of the article"
              rows={2}
              style={{ fontSize: '16px' }}
            />
            <p className="text-[11px]" style={{ color: 'var(--platform-text-muted)' }}>
              Appears in search results and previews.
            </p>
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Content</Label>
            <Textarea
              id="body"
              value={bodyMd}
              onChange={(e) => setBodyMd(e.target.value)}
              placeholder="Main article content"
              rows={16}
              className="font-mono"
              style={{ fontSize: '14px' }}
            />
            <p className="text-[11px]" style={{ color: 'var(--platform-text-muted)' }}>
              Use clear language. Avoid internal terminology.
            </p>
          </div>
        </div>

        {/* Actions (non-new only) */}
        {article && (
          <div 
            className="mt-6 rounded-lg p-4 md:p-6"
            style={{
              backgroundColor: 'var(--platform-surface)',
              border: '1px solid var(--platform-border)',
            }}
          >
            <h3 
              className="text-[11px] font-medium uppercase tracking-[0.08em] mb-4"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              Article actions
            </h3>
            <div className="flex flex-wrap gap-3">
              {/* Publish */}
              {!isPublished && !isArchived && (
                <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={saving}>
                      <Eye className="h-4 w-4 mr-1.5" />
                      Publish
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Publish article</AlertDialogTitle>
                      <AlertDialogDescription>
                        This article will become publicly visible immediately.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handlePublish}>
                        Publish
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {/* Update (for already published articles) */}
              {isPublished && (
                <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={saving}>
                      <Eye className="h-4 w-4 mr-1.5" />
                      Update
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Update published article</AlertDialogTitle>
                      <AlertDialogDescription>
                        Your changes will be visible immediately.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handlePublish}>
                        Update
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {/* Archive */}
              {!isArchived && (
                <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={saving}>
                      <Archive className="h-4 w-4 mr-1.5" />
                      Archive
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Archive article</AlertDialogTitle>
                      <AlertDialogDescription>
                        This article will be removed from public view but retained for recordkeeping.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleArchive}>
                        Archive
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {/* Restore (for archived articles) */}
              {isArchived && (
                <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={saving}>
                      <RotateCcw className="h-4 w-4 mr-1.5" />
                      Restore
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Restore article</AlertDialogTitle>
                      <AlertDialogDescription>
                        This article will become visible again.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRestore}>
                        Restore
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {/* Delete */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete article</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{article.title}" and all its versions. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}

        {/* Footer meta - shows version info */}
        {article && versions.length > 0 && (
          <p 
            className="mt-6 text-[11px] text-center"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            Last updated by {getVersionAuthor(versions[0])} on {format(new Date(versions[0].created_at), "MMMM d, yyyy 'at' h:mm a")}
          </p>
        )}
        {article && versions.length === 0 && article.updated_at && (
          <p 
            className="mt-6 text-[11px] text-center"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            Last updated on {format(new Date(article.updated_at), "MMMM d, yyyy 'at' h:mm a")}
          </p>
        )}

        {/* Note about immutability */}
        {article && (
          <p 
            className="mt-2 text-[10px] text-center"
            style={{ color: 'var(--platform-text-muted)', opacity: 0.7 }}
          >
            Changes are logged and take effect immediately.
          </p>
        )}
      </div>
    </div>
  );
}
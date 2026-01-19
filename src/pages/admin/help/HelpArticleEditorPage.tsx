import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Globe, Lock, Eye, Archive, History, Trash2, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { useHelpManagement, HelpArticle, HelpArticleRevision, HelpCategory } from "@/hooks/useHelpManagement";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * HELP ARTICLE EDITOR — SYSTEM CONSOLE
 * 
 * Create/Edit article with Markdown body, revision history, and publish controls.
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
    updateArticle,
    deleteArticle,
    publishArticle,
    archiveArticle,
    fetchRevisions,
  } = useHelpManagement();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [article, setArticle] = useState<HelpArticle | null>(null);
  const [revisions, setRevisions] = useState<HelpArticleRevision[]>([]);
  const [revisionsLoading, setRevisionsLoading] = useState(false);

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
      const { data, error } = await supabase
        .from("help_articles")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast({ 
          title: "Unable to load article",
          description: "Please try again.", 
          variant: "destructive" 
        });
        navigate("/admin/help/articles");
        return;
      }

      const art = data as HelpArticle;
      setArticle(art);
      setTitle(art.title);
      setSlug(art.slug);
      setSlugManual(true);
      setSummary(art.summary || "");
      setBodyMd(art.body_md);
      setCategoryId(art.category_id || "none");
      setVisibility(art.visibility);
      setLoading(false);
    }

    loadArticle();
  }, [id, isNew, navigate]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManual && title) {
      setSlug(slugify(title));
    }
  }, [title, slugManual]);

  // Load revisions
  const loadRevisions = useCallback(async () => {
    if (!article?.id) return;
    setRevisionsLoading(true);
    const revs = await fetchRevisions(article.id);
    setRevisions(revs);
    setRevisionsLoading(false);
  }, [article?.id, fetchRevisions]);

  // Save handler (Save draft)
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
      const result = await updateArticle(article.id, {
        title: title.trim(),
        slug: slug.trim(),
        summary: summary.trim() || undefined,
        body_md: bodyMd,
        category_id: categoryId !== "none" ? categoryId : null,
        visibility,
      });
      if (result) {
        setArticle(result);
      }
    }

    setSaving(false);
  };

  // Publish handler
  const handlePublish = async () => {
    if (!article) return;
    setSaving(true);
    const success = await publishArticle(article.id);
    if (success) {
      setArticle({ ...article, status: "published", published_at: new Date().toISOString() });
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
    const result = await updateArticle(article.id, { status: "draft" });
    if (result) {
      setArticle({ ...article, status: "draft" });
      toast({
        title: "Article restored",
        description: "This article is visible again.",
      });
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
                  <span className="text-[11px]" style={{ color: 'var(--platform-text-muted)' }}>
                    v{article.version}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Revisions drawer */}
              {article && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" onClick={loadRevisions}>
                      <History className="h-4 w-4 mr-1.5" />
                      Revisions
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Revision history</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      {revisionsLoading ? (
                        <InstitutionalLoadingState message="Loading" />
                      ) : revisions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No revisions yet</p>
                      ) : (
                        <div className="space-y-3">
                          {revisions.map((rev) => (
                            <div 
                              key={rev.id}
                              className="p-3 rounded-md"
                              style={{ 
                                backgroundColor: 'var(--platform-surface-2)',
                                border: '1px solid var(--platform-border)',
                              }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[13px] font-medium">
                                  Version {rev.version}
                                </span>
                                <Badge variant="outline" className="text-[10px]">
                                  {rev.status}
                                </Badge>
                              </div>
                              <p className="text-[12px] text-muted-foreground">
                                {format(new Date(rev.created_at), "MMM d, yyyy 'at' h:mm a")}
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
                      <AlertDialogAction onClick={handleSave}>
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
                      This will permanently delete "{article.title}" and all its revisions. This cannot be undone.
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

        {/* Footer meta */}
        {article?.updated_at && (
          <p 
            className="mt-6 text-[11px] text-center"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            Last updated on {format(new Date(article.updated_at), "MMMM d, yyyy 'at' h:mm a")}
          </p>
        )}
      </div>
    </div>
  );
}

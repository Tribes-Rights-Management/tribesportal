import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Globe, Lock, Eye, Archive, History, Trash2 } from "lucide-react";
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
        toast({ description: "Article not found", variant: "destructive" });
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

  // Save handler
  const handleSave = async () => {
    if (!title.trim() || !slug.trim() || !bodyMd.trim()) {
      toast({ description: "Title, slug, and body are required", variant: "destructive" });
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
            Articles
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
                    {article.status}
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
                onClick={handleSave} 
                disabled={saving}
                size="sm"
              >
                <Save className="h-4 w-4 mr-1.5" />
                Save
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
              placeholder="Article title"
            />
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
            />
            <p className="text-[11px] text-muted-foreground">
              URL path: /help/{slug || "..."}
            </p>
          </div>

          {/* Category + Visibility row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary">Summary (optional)</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief description for search results"
              rows={2}
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Body (Markdown)</Label>
            <Textarea
              id="body"
              value={bodyMd}
              onChange={(e) => setBodyMd(e.target.value)}
              placeholder="Write your article content in Markdown..."
              rows={16}
              className="font-mono text-[13px]"
            />
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
              {article.status !== "published" && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePublish}
                  disabled={saving}
                >
                  <Eye className="h-4 w-4 mr-1.5" />
                  Publish
                </Button>
              )}
              {article.status !== "archived" && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleArchive}
                  disabled={saving}
                >
                  <Archive className="h-4 w-4 mr-1.5" />
                  Archive
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete article?</AlertDialogTitle>
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
      </div>
    </div>
  );
}

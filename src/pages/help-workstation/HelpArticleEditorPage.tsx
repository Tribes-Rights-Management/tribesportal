import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Send, Archive, RotateCcw, Clock, User, AlertCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useHelpManagement, HelpArticle, HelpArticleVersion } from "@/hooks/useHelpManagement";
import { PageContainer } from "@/components/ui/page-container";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { 
  AppButton, 
  AppChip, 
  AppCard,
  AppCardHeader,
  AppCardTitle,
  AppCardBody,
} from "@/components/app-ui";
import { InstitutionalLoadingState } from "@/components/ui/institutional-states";

/**
 * HELP ARTICLE EDITOR — HELP WORKSTATION
 * 
 * Full article editing with:
 * - Title, slug, category, visibility
 * - Markdown content editor
 * - Status transitions (Draft → Published → Archived)
 * - Version history
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
  } = useHelpManagement();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [article, setArticle] = useState<HelpArticle | null>(null);
  const [versions, setVersions] = useState<HelpArticleVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  
  // Inline error states (no toasts)
  const [loadError, setLoadError] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

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
      setSummary(art.summary || "");
      setBodyMd(art.body_md || "");
      setCategoryId(art.category_id || "none");
      setVisibility(art.visibility || "public");
      setLoading(false);
    }

    loadArticle();
  }, [id, isNew, fetchArticleWithVersion]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManual && title) {
      setSlug(slugify(title));
    }
  }, [title, slugManual]);

  // Load versions
  const loadVersions = useCallback(async () => {
    if (isNew || !id) return;
    setVersionsLoading(true);
    const v = await fetchVersions(id);
    setVersions(v);
    setVersionsLoading(false);
  }, [id, isNew, fetchVersions]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  // Handle save (create or update)
  const handleSave = async () => {
    // Clear previous validation error
    setValidationError(null);
    
    if (!title.trim()) {
      setValidationError("Title is required");
      return;
    }
    if (!slug.trim()) {
      setValidationError("Slug is required");
      return;
    }
    if (!bodyMd.trim()) {
      setValidationError("Content is required");
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
        navigate(`/help-workstation/articles/${result.id}`);
      }
    } else {
      // Create new version
      const versionId = await createVersion(id!, {
        title: title.trim(),
        summary: summary.trim() || undefined,
        body_md: bodyMd,
        category_id: categoryId !== "none" ? categoryId : null,
        visibility,
      });

      if (versionId) {
        // Reload article
        const art = await fetchArticleWithVersion(id!);
        if (art) setArticle(art);
        loadVersions();
      }
    }

    setSaving(false);
  };

  // Handle publish
  const handlePublish = async () => {
    if (!article?.current_version_id) return;
    
    setPublishing(true);
    const success = await publishVersion(article.id, article.current_version_id);
    
    if (success) {
      const art = await fetchArticleWithVersion(article.id);
      if (art) setArticle(art);
    }
    
    setPublishing(false);
    setPublishDialogOpen(false);
  };

  // Handle archive
  const handleArchive = async () => {
    if (!article) return;
    
    const success = await archiveArticle(article.id);
    if (success) {
      const art = await fetchArticleWithVersion(article.id);
      if (art) setArticle(art);
    }
    setArchiveDialogOpen(false);
  };

  // Handle restore
  const handleRestore = async () => {
    if (!article) return;
    
    const success = await restoreArticle(article.id);
    if (success) {
      const art = await fetchArticleWithVersion(article.id);
      if (art) setArticle(art);
    }
    setRestoreDialogOpen(false);
  };

  const getStatusChipStatus = (status: string) => {
    switch (status) {
      case "published": return "pass";
      case "draft": return "pending";
      case "archived": return "fail";
      default: return "pending";
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <InstitutionalLoadingState message="Loading article" />
      </PageContainer>
    );
  }

  // Load error state with inline error
  if (loadError && !isNew) {
    return (
      <PageContainer>
        <div className="flex items-center gap-4 mb-6">
          <AppButton 
            intent="ghost" 
            size="sm"
            onClick={() => navigate("/help-workstation/articles")}
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </AppButton>
        </div>
        <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-[#2A1A1A] border-l-2 border-[#7F1D1D] rounded-r max-w-lg">
          <AlertCircle className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-[12px] text-[#E5E5E5]">Unable to load article</p>
            <p className="text-[11px] text-[#8F8F8F] mt-1">
              The article may not exist or you don't have permission to access it.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="text-[11px] text-[#DC2626] hover:text-[#EF4444] underline mt-2 flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
              Try again
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <AppButton 
          intent="ghost" 
          size="sm"
          onClick={() => navigate("/help-workstation/articles")}
          icon={<ArrowLeft className="h-4 w-4" />}
        >
          Back
        </AppButton>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">
            {isNew ? "New Article" : (article?.title || "Untitled")}
          </h1>
          {!isNew && article && (
            <div className="flex items-center gap-2 mt-1">
              <AppChip 
                status={getStatusChipStatus(article.status)} 
                label={article.status.charAt(0).toUpperCase() + article.status.slice(1)}
              />
              <span className="text-xs text-muted-foreground">
                Last updated {format(new Date(article.updated_at), "MMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <AppButton 
            intent="secondary"
            onClick={handleSave}
            loading={saving}
            loadingText="Saving..."
            icon={<Save className="h-4 w-4" />}
          >
            Save Draft
          </AppButton>
          {!isNew && article?.status !== "published" && (
            <AppButton 
              intent="primary"
              onClick={() => setPublishDialogOpen(true)}
              icon={<Send className="h-4 w-4" />}
            >
              Publish
            </AppButton>
          )}
        </div>
      </div>

      {/* Validation Error - Inline */}
      {validationError && (
        <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-[#2A1A1A] border-l-2 border-[#7F1D1D] rounded-r max-w-lg">
          <AlertCircle className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-[12px] text-[#E5E5E5]">{validationError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <AppCard>
            <AppCardBody className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Article title"
                  className="h-10 w-full px-3 text-sm rounded-lg transition-colors duration-100 focus:outline-none"
                  style={{
                    backgroundColor: 'hsl(var(--muted) / 0.3)',
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--foreground))',
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/help/</span>
                  <input
                    id="slug"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setSlugManual(true);
                    }}
                    placeholder="article-slug"
                    className="h-10 flex-1 px-3 text-sm rounded-lg transition-colors duration-100 focus:outline-none"
                    style={{
                      backgroundColor: 'hsl(var(--muted) / 0.3)',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Summary (optional)</Label>
                <input
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief description for search results"
                  className="h-10 w-full px-3 text-sm rounded-lg transition-colors duration-100 focus:outline-none"
                  style={{
                    backgroundColor: 'hsl(var(--muted) / 0.3)',
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--foreground))',
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Content (Markdown)</Label>
                <Textarea
                  id="body"
                  value={bodyMd}
                  onChange={(e) => setBodyMd(e.target.value)}
                  placeholder="Write your article content in Markdown..."
                  className="min-h-[400px] font-mono text-sm"
                />
              </div>
            </AppCardBody>
          </AppCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Settings */}
          <AppCard>
            <AppCardHeader>
              <AppCardTitle>Settings</AppCardTitle>
            </AppCardHeader>
            <AppCardBody className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="h-10 w-full px-3 text-sm rounded-lg appearance-none cursor-pointer transition-colors duration-100 focus:outline-none"
                  style={{
                    backgroundColor: 'hsl(var(--muted) / 0.3)',
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--foreground))',
                  }}
                >
                  <option value="none">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <select
                  id="visibility"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="h-10 w-full px-3 text-sm rounded-lg appearance-none cursor-pointer transition-colors duration-100 focus:outline-none"
                  style={{
                    backgroundColor: 'hsl(var(--muted) / 0.3)',
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--foreground))',
                  }}
                >
                  <option value="public">Public</option>
                  <option value="internal">Internal only</option>
                </select>
              </div>
            </AppCardBody>
          </AppCard>

          {/* Actions */}
          {!isNew && article && (
            <AppCard>
              <AppCardHeader>
                <AppCardTitle>Actions</AppCardTitle>
              </AppCardHeader>
              <AppCardBody className="space-y-2">
                {article.status === "archived" ? (
                  <AppButton 
                    intent="secondary"
                    fullWidth
                    onClick={() => setRestoreDialogOpen(true)}
                    icon={<RotateCcw className="h-4 w-4" />}
                  >
                    Restore Article
                  </AppButton>
                ) : (
                  <AppButton 
                    intent="danger"
                    fullWidth
                    onClick={() => setArchiveDialogOpen(true)}
                    icon={<Archive className="h-4 w-4" />}
                  >
                    Archive Article
                  </AppButton>
                )}
              </AppCardBody>
            </AppCard>
          )}

          {/* Version History */}
          {!isNew && (
            <AppCard>
              <AppCardHeader>
                <AppCardTitle>Version History</AppCardTitle>
              </AppCardHeader>
              <AppCardBody>
                {versionsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : versions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No versions yet</p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {versions.slice(0, 10).map((version, index) => (
                      <div 
                        key={version.id}
                        className="flex items-start gap-2 text-xs"
                      >
                        <Clock className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium">
                            {index === 0 ? "Current version" : `Version`}
                          </p>
                          <p className="text-muted-foreground">
                            {format(new Date(version.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AppCardBody>
            </AppCard>
          )}
        </div>
      </div>

      {/* Publish Dialog */}
      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish article?</AlertDialogTitle>
            <AlertDialogDescription>
              This will make the article visible on the public Help Center. 
              You can archive it later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish} disabled={publishing}>
              {publishing ? "Publishing..." : "Publish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive article?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the article from the public Help Center. 
              The content will be retained for recordkeeping and can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore article?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the article as a draft. 
              You'll need to publish it again to make it visible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>Restore</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

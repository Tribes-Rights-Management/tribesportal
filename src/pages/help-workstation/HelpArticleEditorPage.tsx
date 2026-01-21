import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Send, Archive, RotateCcw, Clock, AlertCircle, RefreshCw, Bold, Italic, Link, List, ListOrdered, Heading2 } from "lucide-react";
import { format } from "date-fns";
import { useHelpManagement, HelpArticle, HelpArticleVersion } from "@/hooks/useHelpManagement";
import { PageContainer } from "@/components/ui/page-container";
import { Label } from "@/components/ui/label";
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
  const isNew = !id || id === "new";
  
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

  // Markdown toolbar helper
  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("body") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = bodyMd.substring(start, end);
    const newText = bodyMd.substring(0, start) + prefix + selectedText + suffix + bodyMd.substring(end);
    setBodyMd(newText);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <AppButton
            intent="ghost"
            size="sm"
            onClick={() => navigate("/help-workstation/articles")}
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </AppButton>
          {!isNew && article && (
            <div className="flex items-center gap-3">
              <AppChip
                status={getStatusChipStatus(article.status)}
                label={article.status.charAt(0).toUpperCase() + article.status.slice(1)}
              />
              <span className="text-xs text-gray-500">
                Updated {format(new Date(article.updated_at), "MMM d, yyyy")}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <AppButton
            intent="ghost"
            onClick={handleSave}
            loading={saving}
            loadingText="Saving..."
            icon={<Save className="h-4 w-4" />}
            className="text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300"
          >
            Save Draft
          </AppButton>
          {(!isNew && article?.status !== "published") || isNew ? (
            <AppButton
              intent="primary"
              onClick={isNew ? handleSave : () => setPublishDialogOpen(true)}
              loading={isNew ? saving : undefined}
              icon={<Send className="h-4 w-4" />}
            >
              {isNew ? "Create & Publish" : "Publish"}
            </AppButton>
          ) : null}
        </div>
      </div>

      {/* Validation Error - Inline */}
      {validationError && (
        <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-red-50 border-l-2 border-red-600 rounded-r-md max-w-xl">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" strokeWidth={1.5} />
          <p className="text-sm text-red-800">{validationError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-1">
          {/* Title Field - Large underline style */}
          <div className="py-4">
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled article"
              className="w-full text-2xl font-semibold text-gray-900 placeholder-gray-300 bg-transparent border-0 border-b border-gray-200 focus:border-gray-400 focus:outline-none focus:ring-0 pb-3 transition-colors"
            />
          </div>

          {/* Slug Field - Compact with prefix */}
          <div className="flex items-center gap-1 py-2">
            <span className="text-sm text-gray-400 select-none">/help/</span>
            <input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugManual(true);
              }}
              placeholder="article-slug"
              className="flex-1 text-sm text-gray-600 bg-transparent border-0 focus:outline-none focus:ring-0 px-1"
            />
          </div>

          {/* Summary Field */}
          <div className="py-3">
            <input
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Add a brief summary for search results..."
              className="w-full text-sm text-gray-600 placeholder-gray-300 bg-transparent border-0 focus:outline-none focus:ring-0"
            />
          </div>

          {/* Content Area with Toolbar */}
          <div className="mt-4 border border-gray-200 rounded-md overflow-hidden bg-white">
            {/* Markdown Toolbar */}
            <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={() => insertMarkdown("**", "**")}
                className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("*", "*")}
                className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </button>
              <div className="w-px h-4 bg-gray-200 mx-1" />
              <button
                type="button"
                onClick={() => insertMarkdown("## ")}
                className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                title="Heading"
              >
                <Heading2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("[", "](url)")}
                className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                title="Link"
              >
                <Link className="h-4 w-4" />
              </button>
              <div className="w-px h-4 bg-gray-200 mx-1" />
              <button
                type="button"
                onClick={() => insertMarkdown("- ")}
                className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("1. ")}
                className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </button>
              <span className="ml-auto text-xs text-gray-400">Markdown supported</span>
            </div>
            {/* Textarea */}
            <textarea
              id="body"
              value={bodyMd}
              onChange={(e) => setBodyMd(e.target.value)}
              placeholder="Write your article content here..."
              className="w-full min-h-[400px] p-4 text-sm text-gray-800 placeholder-gray-300 bg-white border-0 focus:outline-none focus:ring-0 resize-y font-mono leading-relaxed"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Settings Panel */}
          <div className="bg-gray-50 rounded-md p-4 space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Settings</h3>

            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-xs text-gray-600">Category</Label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-9 w-full px-3 text-sm rounded-md appearance-none cursor-pointer bg-white border border-gray-200 text-gray-700 focus:outline-none focus:border-gray-400 transition-colors"
              >
                <option value="none">No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="visibility" className="text-xs text-gray-600">Visibility</Label>
              <select
                id="visibility"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as "public" | "internal")}
                className="h-9 w-full px-3 text-sm rounded-md appearance-none cursor-pointer bg-white border border-gray-200 text-gray-700 focus:outline-none focus:border-gray-400 transition-colors"
              >
                <option value="public">Public</option>
                <option value="internal">Internal only</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          {!isNew && article && (
            <div className="bg-gray-50 rounded-md p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Actions</h3>
              {article.status === "archived" ? (
                <AppButton
                  intent="secondary"
                  fullWidth
                  size="sm"
                  onClick={() => setRestoreDialogOpen(true)}
                  icon={<RotateCcw className="h-3.5 w-3.5" />}
                  className="text-sm"
                >
                  Restore Article
                </AppButton>
              ) : (
                <AppButton
                  intent="ghost"
                  fullWidth
                  size="sm"
                  onClick={() => setArchiveDialogOpen(true)}
                  icon={<Archive className="h-3.5 w-3.5" />}
                  className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Archive Article
                </AppButton>
              )}
            </div>
          )}

          {/* Version History */}
          {!isNew && (
            <div className="bg-gray-50 rounded-md p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Version History</h3>
              {versionsLoading ? (
                <p className="text-xs text-gray-400">Loading...</p>
              ) : versions.length === 0 ? (
                <p className="text-xs text-gray-400">No versions yet</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {versions.slice(0, 10).map((version, index) => (
                    <div
                      key={version.id}
                      className="flex items-start gap-2 text-xs"
                    >
                      <Clock className="h-3 w-3 mt-0.5 text-gray-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-700">
                          {index === 0 ? "Current" : `v${versions.length - index}`}
                        </p>
                        <p className="text-gray-400">
                          {format(new Date(version.created_at), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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

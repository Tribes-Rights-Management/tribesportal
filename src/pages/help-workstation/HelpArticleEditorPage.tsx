import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, AlertCircle, RefreshCw, Bold, Italic, Link, List, ListOrdered, Heading2, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { useHelpManagement, HelpArticle, HelpArticleVersion } from "@/hooks/useHelpManagement";
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

  // Markdown toolbar helper
  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("body") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = bodyMd.substring(start, end);
    const newText = bodyMd.substring(0, start) + prefix + selectedText + suffix + bodyMd.substring(end);
    setBodyMd(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] p-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (loadError && !isNew) {
    return (
      <div className="min-h-screen bg-[#fafafa] p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/help-workstation/articles")}
            className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <div className="flex items-start gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-700">Unable to load article</p>
              <p className="text-gray-400 text-xs mt-1">The article may not exist or you don't have permission.</p>
              <button
                onClick={() => window.location.reload()}
                className="text-xs text-gray-500 hover:text-gray-700 underline mt-2 flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Top bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/help-workstation/articles")}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Articles</span>
            </button>
            {!isNew && article && (
              <>
                <span className="text-gray-300">/</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  article.status === 'published' ? 'bg-green-100 text-green-700' :
                  article.status === 'archived' ? 'bg-gray-100 text-gray-500' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {article.status}
                </span>
                <span className="text-xs text-gray-400">
                  · {format(new Date(article.updated_at), "MMM d")}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save draft"}
            </button>
            {(isNew || article?.status !== "published") && (
              <button
                onClick={isNew ? handleSave : () => setPublishDialogOpen(true)}
                disabled={saving}
                className="text-sm bg-gray-900 text-white px-3 py-1.5 hover:bg-gray-800 disabled:opacity-50"
              >
                {isNew ? "Publish" : "Publish"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Validation error */}
        {validationError && (
          <div className="mb-4 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {validationError}
          </div>
        )}

        <div className="flex gap-12">
          {/* Editor */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled"
              className="w-full text-3xl font-semibold text-gray-900 placeholder-gray-300 bg-transparent border-0 border-b border-transparent focus:border-gray-200 focus:outline-none pb-2 mb-3"
            />

            {/* Slug */}
            <div className="flex items-center gap-0.5 mb-4">
              <span className="text-xs text-gray-400">/help/</span>
              <input
                id="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugManual(true);
                }}
                placeholder="slug"
                className="text-xs text-gray-500 bg-transparent border-0 focus:outline-none"
              />
            </div>

            {/* Summary */}
            <input
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Add summary..."
              className="w-full text-sm text-gray-600 placeholder-gray-300 bg-transparent border-0 border-b border-transparent focus:border-gray-200 focus:outline-none pb-2 mb-6"
            />

            {/* Content area */}
            <div className="border-t border-gray-200">
              {/* Toolbar */}
              <div className="flex items-center gap-0.5 py-2 border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => insertMarkdown("**", "**")}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Bold"
                >
                  <Bold className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("*", "*")}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Italic"
                >
                  <Italic className="h-3.5 w-3.5" />
                </button>
                <span className="w-px h-3 bg-gray-200 mx-1" />
                <button
                  type="button"
                  onClick={() => insertMarkdown("## ")}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Heading"
                >
                  <Heading2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("[", "](url)")}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Link"
                >
                  <Link className="h-3.5 w-3.5" />
                </button>
                <span className="w-px h-3 bg-gray-200 mx-1" />
                <button
                  type="button"
                  onClick={() => insertMarkdown("- ")}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="List"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("1. ")}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Numbered list"
                >
                  <ListOrdered className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Textarea */}
              <textarea
                id="body"
                value={bodyMd}
                onChange={(e) => setBodyMd(e.target.value)}
                placeholder="Start writing..."
                className="w-full min-h-[450px] py-4 text-sm text-gray-700 placeholder-gray-300 bg-transparent border-0 focus:outline-none resize-none font-mono leading-relaxed"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-48 shrink-0">
            {/* Settings */}
            <div className="mb-6">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">Settings</p>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Category</p>
                  <div className="relative">
                    <select
                      id="category"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full text-sm text-gray-700 bg-transparent border-0 border-b border-gray-200 focus:border-gray-400 focus:outline-none pb-1 pr-8 appearance-none cursor-pointer"
                    >
                      <option value="none">None</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Visibility</p>
                  <div className="relative">
                    <select
                      id="visibility"
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as "public" | "internal")}
                      className="w-full text-sm text-gray-700 bg-transparent border-0 border-b border-gray-200 focus:border-gray-400 focus:outline-none pb-1 pr-8 appearance-none cursor-pointer"
                    >
                      <option value="public">Public</option>
                      <option value="internal">Internal</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            {!isNew && article && (
              <div className="mb-6 pt-4 border-t border-gray-200">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">Actions</p>
                {article.status === "archived" ? (
                  <button
                    onClick={() => setRestoreDialogOpen(true)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Restore article
                  </button>
                ) : (
                  <button
                    onClick={() => setArchiveDialogOpen(true)}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Archive article
                  </button>
                )}
              </div>
            )}

            {/* Version history */}
            {!isNew && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">History</p>
                {versionsLoading ? (
                  <p className="text-xs text-gray-400">Loading...</p>
                ) : versions.length === 0 ? (
                  <p className="text-xs text-gray-400">No versions</p>
                ) : (
                  <div className="space-y-2">
                    {versions.slice(0, 5).map((version, index) => (
                      <div key={version.id} className="flex items-center gap-2 text-xs">
                        <Clock className="h-3 w-3 text-gray-300" />
                        <span className="text-gray-500">
                          {index === 0 ? "Current" : format(new Date(version.created_at), "MMM d")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Publish Dialog */}
      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Publish article?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500">
              This will make it visible on the Help Center.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePublish}
              disabled={publishing}
              className="text-sm bg-gray-900 hover:bg-gray-800"
            >
              {publishing ? "Publishing..." : "Publish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Archive article?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500">
              This will remove it from the Help Center. You can restore it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive} className="text-sm bg-gray-900 hover:bg-gray-800">
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Restore article?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500">
              This will restore it as a draft.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} className="text-sm bg-gray-900 hover:bg-gray-800">
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

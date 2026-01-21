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
      <div className="flex-1 p-6">
        <p className="text-[13px] text-[#6B6B6B]">Loading...</p>
      </div>
    );
  }

  if (loadError && !isNew) {
    return (
      <div className="flex-1 p-6">
        <button
          onClick={() => navigate("/help-workstation/articles")}
          className="text-[12px] text-[#6B6B6B] hover:text-[#AAAAAA] mb-6 flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          Back
        </button>
        <div className="flex items-start gap-3 px-4 py-3 bg-[#2A1A1A] border-l-2 border-[#7F1D1D] rounded-r">
          <AlertCircle className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-[12px] text-[#E5E5E5]">Unable to load article</p>
            <p className="text-[11px] text-[#6B6B6B] mt-1">The article may not exist or you don't have permission.</p>
            <button
              onClick={() => window.location.reload()}
              className="text-[11px] text-[#DC2626] hover:text-[#EF4444] underline mt-2 flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Top bar */}
      <div className="border-b border-[#303030]">
        <div className="px-6 h-11 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/help-workstation/articles")}
              className="text-[12px] text-[#6B6B6B] hover:text-[#AAAAAA] flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>Articles</span>
            </button>
            {!isNew && article && (
              <>
                <span className="text-[#303030]">/</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  article.status === 'published' ? 'bg-[#059669]/20 text-[#34D399]' :
                  article.status === 'archived' ? 'bg-[#7F1D1D]/20 text-[#FCA5A5]' :
                  'bg-[#303030] text-[#AAAAAA]'
                }`}>
                  {article.status}
                </span>
                <span className="text-[11px] text-[#6B6B6B]">
                  · {format(new Date(article.updated_at), "MMM d")}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-[12px] text-[#6B6B6B] hover:text-[#AAAAAA] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save draft"}
            </button>
            {(isNew || article?.status !== "published") && (
              <button
                onClick={isNew ? handleSave : () => setPublishDialogOpen(true)}
                disabled={saving}
                className="text-[12px] bg-white text-[#0A0A0A] px-3 py-1 rounded hover:bg-[#E5E5E5] disabled:opacity-50"
              >
                {isNew ? "Publish" : "Publish"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="px-6 py-5">
        {/* Validation error */}
        {validationError && (
          <div className="mb-4 flex items-start gap-3 px-4 py-3 bg-[#2A1A1A] border-l-2 border-[#7F1D1D] rounded-r">
            <AlertCircle className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" strokeWidth={1.5} />
            <p className="text-[12px] text-[#E5E5E5]">{validationError}</p>
          </div>
        )}

        <div className="flex gap-8">
          {/* Editor */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled"
              className="w-full text-[24px] font-medium text-white placeholder:text-[#6B6B6B] bg-transparent border-0 border-b border-[#303030] focus:border-[#505050] focus:outline-none pb-2 mb-2"
            />

            {/* Slug */}
            <div className="flex items-center gap-0.5 mb-3">
              <span className="text-[11px] text-[#6B6B6B]">/help/</span>
              <input
                id="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugManual(true);
                }}
                placeholder="slug"
                className="text-[11px] text-[#8F8F8F] placeholder:text-[#505050] bg-transparent border-0 focus:outline-none"
              />
            </div>

            {/* Summary */}
            <input
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Add summary..."
              className="w-full text-[12px] text-[#AAAAAA] placeholder:text-[#505050] bg-transparent border-0 border-b border-[#303030] focus:border-[#505050] focus:outline-none pb-2 mb-5"
            />

            {/* Content area */}
            <div className="border border-[#303030] rounded">
              {/* Toolbar */}
              <div className="flex items-center gap-0 px-2 py-1.5 border-b border-[#303030]">
                <button
                  type="button"
                  onClick={() => insertMarkdown("**", "**")}
                  className="p-1.5 text-[#6B6B6B] hover:text-[#AAAAAA]"
                  title="Bold"
                >
                  <Bold className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("*", "*")}
                  className="p-1.5 text-[#6B6B6B] hover:text-[#AAAAAA]"
                  title="Italic"
                >
                  <Italic className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <span className="w-px h-3 bg-[#303030] mx-1" />
                <button
                  type="button"
                  onClick={() => insertMarkdown("## ")}
                  className="p-1.5 text-[#6B6B6B] hover:text-[#AAAAAA]"
                  title="Heading"
                >
                  <Heading2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("[", "](url)")}
                  className="p-1.5 text-[#6B6B6B] hover:text-[#AAAAAA]"
                  title="Link"
                >
                  <Link className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <span className="w-px h-3 bg-[#303030] mx-1" />
                <button
                  type="button"
                  onClick={() => insertMarkdown("- ")}
                  className="p-1.5 text-[#6B6B6B] hover:text-[#AAAAAA]"
                  title="List"
                >
                  <List className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("1. ")}
                  className="p-1.5 text-[#6B6B6B] hover:text-[#AAAAAA]"
                  title="Numbered list"
                >
                  <ListOrdered className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>

              {/* Textarea */}
              <textarea
                id="body"
                value={bodyMd}
                onChange={(e) => setBodyMd(e.target.value)}
                placeholder="Start writing..."
                className="w-full min-h-[400px] p-3 text-[13px] text-[#AAAAAA] placeholder:text-[#505050] bg-transparent border-0 focus:outline-none resize-none font-mono leading-relaxed"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-44 shrink-0 pl-6 border-l border-[#303030]">
            {/* Settings */}
            <div className="mb-5">
              <p className="text-[10px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-3">Settings</p>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-[#6B6B6B] uppercase tracking-wider mb-1">Category</p>
                  <div className="relative">
                    <select
                      id="category"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full h-8 pl-0 pr-6 text-[12px] text-[#AAAAAA] bg-transparent border-0 border-b border-[#303030] focus:border-[#505050] focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="none">None</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-0 top-2 h-3.5 w-3.5 text-[#6B6B6B] pointer-events-none" strokeWidth={1.5} />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-[#6B6B6B] uppercase tracking-wider mb-1">Visibility</p>
                  <div className="relative">
                    <select
                      id="visibility"
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as "public" | "internal")}
                      className="w-full h-8 pl-0 pr-6 text-[12px] text-[#AAAAAA] bg-transparent border-0 border-b border-[#303030] focus:border-[#505050] focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="public">Public</option>
                      <option value="internal">Internal</option>
                    </select>
                    <ChevronDown className="absolute right-0 top-2 h-3.5 w-3.5 text-[#6B6B6B] pointer-events-none" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            {!isNew && article && (
              <div className="mb-5 pt-4 border-t border-[#303030]">
                <p className="text-[10px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-3">Actions</p>
                {article.status === "archived" ? (
                  <button
                    onClick={() => setRestoreDialogOpen(true)}
                    className="text-[11px] text-[#6B6B6B] hover:text-[#AAAAAA]"
                  >
                    Restore article
                  </button>
                ) : (
                  <button
                    onClick={() => setArchiveDialogOpen(true)}
                    className="text-[11px] text-[#DC2626] hover:text-[#EF4444]"
                  >
                    Archive article
                  </button>
                )}
              </div>
            )}

            {/* Version history */}
            {!isNew && (
              <div className="pt-4 border-t border-[#303030]">
                <p className="text-[10px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-3">History</p>
                {versionsLoading ? (
                  <p className="text-[11px] text-[#6B6B6B]">Loading...</p>
                ) : versions.length === 0 ? (
                  <p className="text-[11px] text-[#6B6B6B]">No versions</p>
                ) : (
                  <div className="space-y-2">
                    {versions.slice(0, 5).map((version, index) => (
                      <div key={version.id} className="flex items-center gap-2 text-[11px]">
                        <Clock className="h-3 w-3 text-[#505050]" strokeWidth={1.5} />
                        <span className="text-[#8F8F8F]">
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
        <AlertDialogContent className="max-w-sm bg-[#0A0A0A] border border-[#303030]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[15px] text-white">Publish article?</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-[#8F8F8F]">
              This will make it visible on the Help Center.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-[12px] bg-transparent border border-[#303030] text-[#AAAAAA] hover:bg-[#1A1A1A] hover:text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePublish}
              disabled={publishing}
              className="text-[12px] bg-white text-[#0A0A0A] hover:bg-[#E5E5E5]"
            >
              {publishing ? "Publishing..." : "Publish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent className="max-w-sm bg-[#0A0A0A] border border-[#303030]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[15px] text-white">Archive article?</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-[#8F8F8F]">
              This will remove it from the Help Center. You can restore it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-[12px] bg-transparent border border-[#303030] text-[#AAAAAA] hover:bg-[#1A1A1A] hover:text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive} className="text-[12px] bg-[#DC2626] text-white hover:bg-[#B91C1C]">
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent className="max-w-sm bg-[#0A0A0A] border border-[#303030]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[15px] text-white">Restore article?</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-[#8F8F8F]">
              This will restore it as a draft.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-[12px] bg-transparent border border-[#303030] text-[#AAAAAA] hover:bg-[#1A1A1A] hover:text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} className="text-[12px] bg-white text-[#0A0A0A] hover:bg-[#E5E5E5]">
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

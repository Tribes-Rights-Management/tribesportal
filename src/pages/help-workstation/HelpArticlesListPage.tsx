import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, ArrowUpDown, ArrowUp, ArrowDown, AlertCircle, RefreshCw, ChevronDown, Search, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useHelpManagement, HelpArticle, HelpArticleStatus, HelpVisibility } from "@/hooks/useHelpManagement";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";

/**
 * HELP ARTICLES LIST — INSTITUTIONAL DESIGN
 *
 * Typography: text-[20px] title, text-[13px] body, text-[10px] headers
 * Spacing: p-8 page, mb-8 sections, gap-4 elements
 * All icons: strokeWidth={1.5}
 *
 * SEARCH FEATURES:
 * - Full-text search across title, body, summary
 * - 300ms debounce for performance
 * - Keyboard shortcuts: "/" to focus, Escape to clear
 * - Result highlighting
 */

const STATUS_OPTIONS: { value: HelpArticleStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const VISIBILITY_OPTIONS: { value: HelpVisibility | "all"; label: string }[] = [
  { value: "all", label: "All visibility" },
  { value: "public", label: "Public" },
  { value: "internal", label: "Internal" },
];

const PAGE_SIZE = 20;

type SortField = "title" | "updated_at";
type SortOrder = "asc" | "desc";

// Helper to highlight matching text
function highlightMatch(text: string, search: string): React.ReactNode {
  if (!search || !text) return text;

  const searchLower = search.toLowerCase();
  const textLower = text.toLowerCase();
  const index = textLower.indexOf(searchLower);

  if (index === -1) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + search.length);
  const after = text.slice(index + search.length);

  return (
    <>
      {before}
      <mark className="bg-[#60A5FA]/30 text-white px-0.5 rounded">{match}</mark>
      {after}
    </>
  );
}

// Helper to get a snippet of matching body text
function getBodySnippet(body: string | undefined, search: string): string | null {
  if (!body || !search) return null;

  const searchLower = search.toLowerCase();
  const bodyLower = body.toLowerCase();
  const index = bodyLower.indexOf(searchLower);

  if (index === -1) return null;

  // Get surrounding context (50 chars before, 100 chars after)
  const start = Math.max(0, index - 50);
  const end = Math.min(body.length, index + search.length + 100);

  let snippet = body.slice(start, end);

  // Clean up HTML tags
  snippet = snippet.replace(/<[^>]*>/g, '');

  // Add ellipsis if truncated
  if (start > 0) snippet = '...' + snippet;
  if (end < body.length) snippet = snippet + '...';

  return snippet;
}

export default function HelpArticlesListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    articles,
    articlesLoading,
    articlesError,
    fetchArticles,
    archiveArticle,
    restoreArticle,
    categories,
    fetchCategories,
  } = useHelpManagement();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const [statusFilter, setStatusFilter] = useState<HelpArticleStatus | "all">(
    (searchParams.get("status") as HelpArticleStatus) || "all"
  );
  const [visibilityFilter, setVisibilityFilter] = useState<HelpVisibility | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("updated_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Initial fetch
  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, [fetchArticles, fetchCategories]);

  // Fetch with debounced search and filters
  useEffect(() => {
    const filters: Record<string, unknown> = {};
    if (statusFilter !== "all") filters.status = statusFilter;
    if (visibilityFilter !== "all") filters.visibility = visibilityFilter;
    if (categoryFilter !== "all") filters.category_id = categoryFilter;
    if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();

    setIsSearching(true);
    fetchArticles(filters as any).finally(() => {
      setIsSearching(false);
    });
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, visibilityFilter, categoryFilter, fetchArticles]);

  // Show searching indicator when typing but debounce hasn't fired yet
  const showSearching = search !== debouncedSearch || isSearching;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // "/" to focus search (when not in an input)
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // Escape to clear search (when in search input)
      if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
        setSearch("");
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const sortedArticles = useMemo(() => {
    const sorted = [...articles].sort((a, b) => {
      let aVal: string | undefined;
      let bVal: string | undefined;

      if (sortField === "title") {
        aVal = a.title?.toLowerCase();
        bVal = b.title?.toLowerCase();
      } else {
        aVal = a.updated_at;
        bVal = b.updated_at;
      }

      if (!aVal && !bVal) return 0;
      if (!aVal) return sortOrder === "asc" ? -1 : 1;
      if (!bVal) return sortOrder === "asc" ? 1 : -1;

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [articles, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedArticles.length / PAGE_SIZE);
  const paginatedArticles = sortedArticles.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" strokeWidth={1.5} />;
    }
    return sortOrder === "asc"
      ? <ArrowUp className="h-3 w-3 ml-1" strokeWidth={1.5} />
      : <ArrowDown className="h-3 w-3 ml-1" strokeWidth={1.5} />;
  };

  const handleArchive = async (article: HelpArticle) => {
    await archiveArticle(article.id);
    fetchArticles();
  };

  const handleRestore = async (article: HelpArticle) => {
    await restoreArticle(article.id);
    fetchArticles();
  };

  const clearSearch = useCallback(() => {
    setSearch("");
    searchInputRef.current?.focus();
  }, []);

  // Check if a search match is in the body (not just title)
  const hasBodyMatch = useCallback((article: HelpArticle, searchTerm: string): boolean => {
    if (!searchTerm) return false;
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = article.title?.toLowerCase().includes(searchLower);
    const bodyMatch = article.body_md?.toLowerCase().includes(searchLower);
    return !titleMatch && !!bodyMatch;
  }, []);

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium mb-2">
            HELP WORKSTATION
          </p>
          <h1 className="text-[20px] font-medium text-white mb-1">Articles</h1>
          <p className="text-[13px] text-[#AAAAAA]">{sortedArticles.length} articles</p>
        </div>
        <Button variant="default" size="sm" onClick={() => navigate("/help-workstation/articles/new")}>
          <Plus className="h-2 w-2" strokeWidth={1} />
          New Article
        </Button>
      </div>

      {/* Inline Error */}
      {articlesError && (
        <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-[#2A1A1A] border-l-2 border-[#7F1D1D] rounded-r">
          <AlertCircle className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-[12px] text-[#E5E5E5]">{articlesError}</p>
            <button
              onClick={() => fetchArticles()}
              className="text-[11px] text-[#DC2626] hover:text-[#EF4444] underline mt-1 flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6 max-w-md relative">
        <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#505050]" strokeWidth={1} />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 pl-7 pr-8 bg-transparent border-0 border-b border-[#303030] text-[12px] text-[#E5E5E5] placeholder:text-[#505050] focus:outline-none focus:border-[#505050]"
        />
        {/* Clear button or loading indicator */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          {showSearching && search ? (
            <Loader2 className="h-3.5 w-3.5 text-[#6B6B6B] animate-spin" strokeWidth={1.5} />
          ) : search ? (
            <button
              onClick={clearSearch}
              className="p-1 text-[#6B6B6B] hover:text-[#AAAAAA] transition-colors"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          ) : (
            <span className="text-[10px] text-[#505050] font-mono">/</span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 pl-3 pr-8 bg-transparent border-0 border-b border-[#303030] text-[12px] text-[#AAAAAA] focus:outline-none focus:border-[#505050] appearance-none cursor-pointer"
          >
            <option value="all">All categories</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B6B6B] pointer-events-none" strokeWidth={1.5} />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-9 pl-3 pr-8 bg-transparent border-0 border-b border-[#303030] text-[12px] text-[#AAAAAA] focus:outline-none focus:border-[#505050] appearance-none cursor-pointer"
          >
            {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B6B6B] pointer-events-none" strokeWidth={1.5} />
        </div>
        <div className="relative">
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value as any)}
            className="h-9 pl-3 pr-8 bg-transparent border-0 border-b border-[#303030] text-[12px] text-[#AAAAAA] focus:outline-none focus:border-[#505050] appearance-none cursor-pointer"
          >
            {VISIBILITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B6B6B] pointer-events-none" strokeWidth={1.5} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1A1A1A] border border-[#303030] rounded">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#303030]">
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium w-[35%]">
                <button onClick={() => handleSort("title")} className="flex items-center hover:text-white transition-colors">
                  Title {getSortIcon("title")}
                </button>
              </th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium w-[20%]">Category</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium w-[15%]">Status</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium w-[15%]">Visibility</th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium w-[15%]">
                <button onClick={() => handleSort("updated_at")} className="flex items-center justify-end hover:text-white transition-colors ml-auto">
                  Updated {getSortIcon("updated_at")}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {articlesLoading && !showSearching ? (
              <tr>
                <td colSpan={5} className="text-center py-20">
                  <p className="text-[13px] text-[#6B6B6B]">Loading articles...</p>
                </td>
              </tr>
            ) : paginatedArticles.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-20">
                  {debouncedSearch ? (
                    <div>
                      <Search className="h-8 w-8 text-[#404040] mx-auto mb-3" strokeWidth={1} />
                      <p className="text-[13px] text-[#6B6B6B]">
                        No articles found for "<span className="text-[#AAAAAA]">{debouncedSearch}</span>"
                      </p>
                      <button
                        onClick={clearSearch}
                        className="text-[12px] text-[#60A5FA] hover:text-[#93C5FD] mt-2"
                      >
                        Clear search
                      </button>
                    </div>
                  ) : (
                    <p className="text-[13px] text-[#6B6B6B]">No articles yet</p>
                  )}
                </td>
              </tr>
            ) : (
              paginatedArticles.map(article => {
                const bodyMatch = hasBodyMatch(article, debouncedSearch);
                const bodySnippet = bodyMatch ? getBodySnippet(article.body_md, debouncedSearch) : null;

                return (
                  <tr
                    key={article.id}
                    onClick={() => navigate(`/help-workstation/articles/${article.id}`)}
                    className="border-b border-[#303030]/30 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] text-white">
                            {debouncedSearch
                              ? highlightMatch(article.title || "Untitled", debouncedSearch)
                              : (article.title || "Untitled")
                            }
                          </span>
                          {article.status === 'draft' && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#303030] text-[#AAAAAA]">DRAFT</span>
                          )}
                        </div>
                        {/* Show tags */}
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {article.tags.slice(0, 3).map(tag => (
                              <span
                                key={tag}
                                className="text-[10px] px-1.5 py-0.5 bg-[#252525] text-[#8F8F8F] rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {article.tags.length > 3 && (
                              <span className="text-[10px] text-[#6B6B6B]">
                                +{article.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        {/* Show body snippet if match is in body */}
                        {bodySnippet && (
                          <p className="text-[11px] text-[#6B6B6B] line-clamp-1">
                            {highlightMatch(bodySnippet, debouncedSearch)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[12px] text-[#AAAAAA]">{article.category?.name || "—"}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[11px] px-2 py-1 rounded ${
                        article.status === 'published' ? 'bg-[#059669]/20 text-[#34D399]' :
                        article.status === 'archived' ? 'bg-[#7F1D1D]/20 text-[#FCA5A5]' :
                        'bg-[#303030] text-[#AAAAAA]'
                      }`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[12px] text-[#AAAAAA]">{article.visibility || "public"}</td>
                    <td className="py-3 px-4 text-right text-[12px] text-[#8F8F8F]">
                      {format(new Date(article.updated_at), "MMM d, yyyy")}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-[12px] text-[#6B6B6B]">Page {currentPage} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

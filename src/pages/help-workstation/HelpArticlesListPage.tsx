import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Archive, Eye, Pencil, RotateCcw, AlertCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useHelpManagement, HelpArticle, HelpArticleStatus, HelpVisibility } from "@/hooks/useHelpManagement";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

/**
 * HELP ARTICLES LIST — INSTITUTIONAL DESIGN
 * 
 * Typography: text-[20px] title, text-[13px] body, text-[10px] headers
 * Spacing: p-8 page, mb-8 sections, gap-4 elements
 * All icons: strokeWidth={1.5}
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

export default function HelpArticlesListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    articles,
    articlesLoading,
    fetchArticles,
    archiveArticle,
    restoreArticle,
    categories,
    fetchCategories,
  } = useHelpManagement();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState<HelpArticleStatus | "all">(
    (searchParams.get("status") as HelpArticleStatus) || "all"
  );
  const [visibilityFilter, setVisibilityFilter] = useState<HelpVisibility | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("updated_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, [fetchArticles, fetchCategories]);

  useEffect(() => {
    const filters: Record<string, unknown> = {};
    if (statusFilter !== "all") filters.status = statusFilter;
    if (visibilityFilter !== "all") filters.visibility = visibilityFilter;
    if (categoryFilter !== "all") filters.category_id = categoryFilter;
    if (search.trim()) filters.search = search.trim();
    
    fetchArticles(filters as any);
    setCurrentPage(1);
  }, [search, statusFilter, visibilityFilter, categoryFilter, fetchArticles]);

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

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium mb-2">
            HELP WORKSTATION
          </p>
          <h1 className="text-[20px] font-medium text-white mb-1">Articles</h1>
          <p className="text-[13px] text-[#AAAAAA]">{sortedArticles.length} articles</p>
        </div>
        <Button variant="default" size="sm" onClick={() => navigate("/help-workstation/articles/new")}>
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
          New Article
        </Button>
      </div>

      {/* Inline Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-[#2A1A1A] border-l-2 border-[#7F1D1D] rounded-r">
          <AlertCircle className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-[12px] text-[#E5E5E5]">{error}</p>
            <button 
              onClick={() => { setError(null); fetchArticles(); }} 
              className="text-[11px] text-[#DC2626] hover:text-[#EF4444] underline mt-1 flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Filters - No search icon */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="search"
          placeholder="Search title or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-md h-9 px-3 bg-[#1A1A1A] border border-[#303030] rounded text-[12px] text-white placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#505050]"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 px-3 bg-[#1A1A1A] border border-[#303030] rounded text-[12px] text-white focus:outline-none focus:border-[#505050]"
        >
          <option value="all">All categories</option>
          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="h-9 px-3 bg-[#1A1A1A] border border-[#303030] rounded text-[12px] text-white focus:outline-none focus:border-[#505050]"
        >
          {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <select
          value={visibilityFilter}
          onChange={(e) => setVisibilityFilter(e.target.value as any)}
          className="h-9 px-3 bg-[#1A1A1A] border border-[#303030] rounded text-[12px] text-white focus:outline-none focus:border-[#505050]"
        >
          {VISIBILITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
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
            {articlesLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-20">
                  <p className="text-[13px] text-[#6B6B6B]">Loading articles...</p>
                </td>
              </tr>
            ) : paginatedArticles.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-20">
                  <p className="text-[13px] text-[#6B6B6B]">No articles yet</p>
                </td>
              </tr>
            ) : (
              paginatedArticles.map(article => (
                <tr 
                  key={article.id} 
                  onClick={() => navigate(`/help-workstation/articles/${article.id}`)}
                  className="border-b border-[#303030]/30 hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-white">{article.title || "Untitled"}</span>
                      {article.status === 'draft' && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#303030] text-[#AAAAAA]">DRAFT</span>
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
              ))
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

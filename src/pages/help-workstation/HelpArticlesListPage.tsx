import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Archive, Eye, Pencil, RotateCcw, ChevronRight } from "lucide-react";
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
import { AppChip } from "@/components/app-ui";

/**
 * HELP ARTICLES LIST — INSTITUTIONAL DESIGN
 * 
 * Table-based article management with:
 * - NO decorative icons
 * - No search icon in input
 * - Sharp corners (rounded-md)
 * - Dense layout
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

function getStatusChipStatus(status: HelpArticleStatus): "pending" | "pass" | "fail" {
  switch (status) {
    case "published": return "pass";
    case "draft": return "pending";
    case "archived": return "fail";
    default: return "pending";
  }
}

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

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState<HelpArticleStatus | "all">(
    (searchParams.get("status") as HelpArticleStatus) || "all"
  );
  const [visibilityFilter, setVisibilityFilter] = useState<HelpVisibility | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Sorting
  const [sortField, setSortField] = useState<SortField>("updated_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Load data
  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, [fetchArticles, fetchCategories]);

  // Apply filters
  useEffect(() => {
    const filters: Record<string, unknown> = {};
    if (statusFilter !== "all") filters.status = statusFilter;
    if (visibilityFilter !== "all") filters.visibility = visibilityFilter;
    if (categoryFilter !== "all") filters.category_id = categoryFilter;
    if (search.trim()) filters.search = search.trim();
    
    fetchArticles(filters as any);
    setCurrentPage(1);
  }, [search, statusFilter, visibilityFilter, categoryFilter, fetchArticles]);

  // Sorted and paginated data
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

  const hasFilters = search || statusFilter !== "all" || visibilityFilter !== "all" || categoryFilter !== "all";

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p 
            className="text-[10px] uppercase tracking-wider font-medium mb-1"
            style={{ color: '#6B6B6B' }}
          >
            Help Workstation
          </p>
          <h1 
            className="text-[20px] font-medium leading-tight"
            style={{ color: 'var(--platform-text)' }}
          >
            Articles
          </h1>
          <p 
            className="text-[13px] mt-1"
            style={{ color: '#AAAAAA' }}
          >
            {sortedArticles.length} {sortedArticles.length === 1 ? 'article' : 'articles'}
          </p>
        </div>
        <Button 
          variant="default"
          size="sm"
          onClick={() => navigate("/help-workstation/articles/new")}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
          New Article
        </Button>
      </div>

      {/* Filters Row - No search icon */}
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Search title or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 flex-1 px-3 text-[13px] rounded-md transition-colors duration-100 focus:outline-none"
          style={{
            backgroundColor: '#1A1A1A',
            border: '1px solid #303030',
            color: 'white',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#505050'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#303030'}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 px-3 text-[13px] rounded-md appearance-none cursor-pointer transition-colors duration-100 focus:outline-none"
          style={{
            backgroundColor: '#1A1A1A',
            border: '1px solid #303030',
            color: 'white',
            minWidth: '140px',
          }}
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="h-10 px-3 text-[13px] rounded-md appearance-none cursor-pointer transition-colors duration-100 focus:outline-none"
          style={{
            backgroundColor: '#1A1A1A',
            border: '1px solid #303030',
            color: 'white',
            minWidth: '120px',
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={visibilityFilter}
          onChange={(e) => setVisibilityFilter(e.target.value as any)}
          className="h-10 px-3 text-[13px] rounded-md appearance-none cursor-pointer transition-colors duration-100 focus:outline-none"
          style={{
            backgroundColor: '#1A1A1A',
            border: '1px solid #303030',
            color: 'white',
            minWidth: '120px',
          }}
        >
          {VISIBILITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {articlesLoading ? (
        <div className="py-12 text-center">
          <p className="text-[13px]" style={{ color: '#6B6B6B' }}>Loading articles...</p>
        </div>
      ) : (
        <div 
          className="rounded-md overflow-hidden"
          style={{ 
            backgroundColor: '#1A1A1A',
            border: '1px solid #303030'
          }}
        >
          {/* Table Header */}
          <div 
            className="grid grid-cols-12 gap-4 px-4 py-3 text-[11px] uppercase tracking-wider font-medium"
            style={{ 
              color: '#6B6B6B',
              borderBottom: '1px solid #303030',
            }}
          >
            <button 
              onClick={() => handleSort("title")}
              className="col-span-4 text-left flex items-center hover:text-white transition-colors"
            >
              Title
              {getSortIcon("title")}
            </button>
            <div className="col-span-2 hidden md:block">Category</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 hidden md:block">Visibility</div>
            <button 
              onClick={() => handleSort("updated_at")}
              className="col-span-2 hidden lg:flex items-center hover:text-white transition-colors"
            >
              Updated
              {getSortIcon("updated_at")}
            </button>
            <div className="col-span-1"></div>
          </div>
          
          {/* Table Body */}
          {paginatedArticles.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[13px]" style={{ color: '#8F8F8F' }}>
                {hasFilters ? "No articles match your search" : "No articles yet"}
              </p>
            </div>
          ) : (
            paginatedArticles.map((article, index) => (
              <div 
                key={article.id}
                className="grid grid-cols-12 gap-4 px-4 py-3 items-center cursor-pointer transition-colors"
                style={{ 
                  borderBottom: index < paginatedArticles.length - 1 ? '1px solid #303030' : 'none',
                }}
                onClick={() => navigate(`/help-workstation/articles/${article.id}`)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div className="col-span-4 min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: 'white' }}>
                    {article.title || "Untitled"}
                  </p>
                  <p className="text-[11px] truncate mt-0.5" style={{ color: '#8F8F8F' }}>
                    /{article.slug}
                  </p>
                </div>
                <div className="col-span-2 hidden md:block">
                  <span className="text-[12px]" style={{ color: '#8F8F8F' }}>
                    {article.category?.name || "—"}
                  </span>
                </div>
                <div className="col-span-2">
                  <AppChip 
                    status={getStatusChipStatus(article.status)} 
                    label={article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                  />
                </div>
                <div className="col-span-1 hidden md:block">
                  <span className="text-[12px] capitalize" style={{ color: '#8F8F8F' }}>
                    {article.visibility || "public"}
                  </span>
                </div>
                <div className="col-span-2 hidden lg:block">
                  <span className="text-[12px]" style={{ color: '#8F8F8F' }}>
                    {format(new Date(article.updated_at), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 rounded hover:bg-white/[0.05] transition-colors">
                        <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} style={{ color: '#AAAAAA' }} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/help-workstation/articles/${article.id}`)}>
                        <Pencil className="h-4 w-4 mr-2" strokeWidth={1.5} />
                        Edit
                      </DropdownMenuItem>
                      {article.status === "published" && (
                        <DropdownMenuItem onClick={() => window.open(`/help/articles/${article.slug}`, '_blank')}>
                          <Eye className="h-4 w-4 mr-2" strokeWidth={1.5} />
                          View Live
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {article.status === "archived" ? (
                        <DropdownMenuItem onClick={() => handleRestore(article)}>
                          <RotateCcw className="h-4 w-4 mr-2" strokeWidth={1.5} />
                          Restore
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          onClick={() => handleArchive(article)}
                          className="text-destructive"
                        >
                          <Archive className="h-4 w-4 mr-2" strokeWidth={1.5} />
                          Archive
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-[12px]" style={{ color: '#6B6B6B' }}>
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Archive, Eye, Pencil } from "lucide-react";
import { format } from "date-fns";
import { useHelpManagement, HelpArticle, HelpArticleStatus, HelpVisibility } from "@/hooks/useHelpManagement";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableEmptyRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InstitutionalLoadingState } from "@/components/ui/institutional-states";
import { PageShell } from "@/components/ui/page-shell";
import { PageContainer } from "@/components/ui/page-container";

/**
 * HELP ARTICLES PAGE — SYSTEM CONSOLE (INSTITUTIONAL TABLE-BASED)
 * 
 * Company-scoped article management for Help backend.
 * Access requires can_manage_help capability or platform_admin.
 * 
 * Features:
 * - Table-based layout for many articles
 * - Search, filter by status/category/visibility
 * - Sortable columns (title, updated)
 * - Client-side pagination
 * - Kebab menu per row
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

const STATUS_TOOLTIPS: Record<HelpArticleStatus, string> = {
  draft: "Not visible to users",
  published: "Visible on help.tribesrightsmanagement.com",
  archived: "Retained for recordkeeping",
};

const PAGE_SIZE = 20;

type SortField = "title" | "updated_at";
type SortOrder = "asc" | "desc";

function getStatusBadge(status: HelpArticleStatus) {
  // Muted, restrained colors - institutional grade
  const styles: Record<HelpArticleStatus, { bg: string; text: string; border: string }> = {
    published: { 
      bg: 'rgba(74, 222, 128, 0.08)', 
      text: 'rgba(74, 222, 128, 0.85)', 
      border: 'rgba(74, 222, 128, 0.2)' 
    },
    draft: { 
      bg: 'rgba(250, 204, 21, 0.06)', 
      text: 'rgba(250, 204, 21, 0.75)', 
      border: 'rgba(250, 204, 21, 0.15)' 
    },
    archived: { 
      bg: 'rgba(156, 163, 175, 0.06)', 
      text: 'rgba(156, 163, 175, 0.7)', 
      border: 'rgba(156, 163, 175, 0.15)' 
    },
  };
  const labels: Record<HelpArticleStatus, string> = {
    published: "Published",
    draft: "Draft",
    archived: "Archived",
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span 
          className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide rounded cursor-default"
          style={{
            backgroundColor: styles[status].bg,
            color: styles[status].text,
            border: `1px solid ${styles[status].border}`,
          }}
        >
          {labels[status]}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">{STATUS_TOOLTIPS[status]}</p>
      </TooltipContent>
    </Tooltip>
  );
}

/** Institutional button component for admin surfaces */
function InstitutionalButton({ 
  children, 
  onClick, 
  variant = "primary",
  size = "default",
  disabled = false,
  className = ""
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "tertiary";
  size?: "default" | "sm" | "xs" | "icon";
  disabled?: boolean;
  className?: string;
}) {
  const baseStyles = "inline-flex items-center justify-center gap-1.5 font-medium transition-colors duration-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20 disabled:opacity-40 disabled:cursor-not-allowed";
  
  const sizeStyles = {
    default: "h-8 px-3.5 text-[13px] rounded",
    sm: "h-7 px-3 text-[12px] rounded",
    xs: "h-6 px-2 text-[11px] rounded",
    icon: "h-7 w-7 rounded",
  };
  
  const variantStyles = {
    primary: {
      backgroundColor: 'var(--platform-text)',
      color: 'var(--platform-canvas)',
      border: 'none',
    },
    secondary: {
      backgroundColor: 'transparent',
      color: 'var(--platform-text-secondary)',
      border: '1px solid var(--platform-border)',
    },
    tertiary: {
      backgroundColor: 'transparent',
      color: 'var(--platform-text-muted)',
      border: '1px solid rgba(255,255,255,0.08)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--platform-text-secondary)',
      border: 'none',
    },
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${className}`}
      style={variantStyles[variant]}
    >
      {children}
    </button>
  );
}

export default function HelpArticlesPage() {
  const navigate = useNavigate();
  const {
    articles,
    articlesLoading,
    fetchArticles,
    archiveArticle,
    categories,
    fetchCategories,
  } = useHelpManagement();

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<HelpArticleStatus | "all">("all");
  const [visibilityFilter, setVisibilityFilter] = useState<HelpVisibility | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Sorting
  const [sortField, setSortField] = useState<SortField>("updated_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Load data on mount
  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, [fetchArticles, fetchCategories]);

  // Apply filters from UI to fetch
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
      return <ArrowUpDown className="h-3.5 w-3.5 ml-1.5 opacity-40" />;
    }
    return sortOrder === "asc" 
      ? <ArrowUp className="h-3.5 w-3.5 ml-1.5" /> 
      : <ArrowDown className="h-3.5 w-3.5 ml-1.5" />;
  };

  const handleArchive = async (article: HelpArticle) => {
    await archiveArticle(article.id);
    fetchArticles();
  };

  const hasFilters = search || statusFilter !== "all" || visibilityFilter !== "all" || categoryFilter !== "all";

  return (
    <PageContainer maxWidth="wide">
      <PageShell
        title="Help management"
        subtitle="Manage public Help articles and categories"
        backTo="/admin"
      />

      {/* Categories Config Block — compact, low visual weight */}
      <section className="mb-6">
        <div 
          className="flex items-center justify-between py-2.5 px-3 rounded"
          style={{
            backgroundColor: 'transparent',
            border: '1px solid var(--platform-border)',
          }}
        >
          <p 
            className="text-[12px]"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            {categories.length === 0 
              ? "No categories configured yet." 
              : `${categories.length} ${categories.length === 1 ? 'category' : 'categories'} configured`
            }
          </p>
          <InstitutionalButton 
            variant="tertiary" 
            size="xs"
            onClick={() => navigate("/admin/help/categories")}
          >
            Manage
          </InstitutionalButton>
        </div>
      </section>

      {/* Articles Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 
              className="text-[15px] font-medium"
              style={{ color: 'var(--platform-text)' }}
            >
              Articles
            </h2>
            <p 
              className="text-[12px] mt-0.5"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              {sortedArticles.length} {sortedArticles.length === 1 ? 'article' : 'articles'}
            </p>
          </div>
          <InstitutionalButton onClick={() => navigate("/admin/help/articles/new")}>
            <Plus className="h-3.5 w-3.5" />
            New article
          </InstitutionalButton>
        </div>

        {/* Filters Row — institutional density, uniform height */}
        <div className="flex flex-col md:flex-row gap-2 mb-3">
          <div className="relative flex-1">
            <Search 
              className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" 
              style={{ color: 'var(--platform-text-muted)' }} 
            />
            <input
              type="text"
              placeholder="Search title or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-full pl-8 pr-3 text-[13px] rounded transition-colors duration-100 focus:outline-none"
              style={{
                backgroundColor: 'var(--platform-surface-2)',
                border: '1px solid var(--platform-border)',
                color: 'var(--platform-text)',
              }}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-8 px-2.5 text-[12px] rounded appearance-none cursor-pointer transition-colors duration-100 focus:outline-none"
            style={{
              backgroundColor: 'var(--platform-surface-2)',
              border: '1px solid var(--platform-border)',
              color: 'var(--platform-text-secondary)',
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
            className="h-8 px-2.5 text-[12px] rounded appearance-none cursor-pointer transition-colors duration-100 focus:outline-none"
            style={{
              backgroundColor: 'var(--platform-surface-2)',
              border: '1px solid var(--platform-border)',
              color: 'var(--platform-text-secondary)',
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
            className="h-8 px-2.5 text-[12px] rounded appearance-none cursor-pointer transition-colors duration-100 focus:outline-none"
            style={{
              backgroundColor: 'var(--platform-surface-2)',
              border: '1px solid var(--platform-border)',
              color: 'var(--platform-text-secondary)',
              minWidth: '120px',
            }}
          >
            {VISIBILITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Table Container — stronger border, clear separation */}
        {articlesLoading ? (
          <InstitutionalLoadingState message="Loading articles" />
        ) : (
          <div 
            className="rounded overflow-hidden"
            style={{ 
              backgroundColor: 'var(--platform-surface)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Table density="compact">
              <TableHeader>
                <TableRow 
                  style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                >
                  <TableHead className="min-w-[200px]">
                    <button 
                      onClick={() => handleSort("title")}
                      className="flex items-center hover:opacity-80 transition-opacity text-[11px] font-medium uppercase tracking-wider"
                      style={{ color: 'var(--platform-text-secondary)' }}
                    >
                      Title
                      {getSortIcon("title")}
                    </button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell text-[11px] font-medium uppercase tracking-wider">
                    Category
                  </TableHead>
                  <TableHead status className="text-[11px] font-medium uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    <button 
                      onClick={() => handleSort("updated_at")}
                      className="flex items-center hover:opacity-80 transition-opacity text-[11px] font-medium uppercase tracking-wider"
                      style={{ color: 'var(--platform-text-secondary)' }}
                    >
                      Updated
                      {getSortIcon("updated_at")}
                    </button>
                  </TableHead>
                  <TableHead className="w-[44px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedArticles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8">
                      <p 
                        className="text-[13px]"
                        style={{ color: 'var(--platform-text-secondary)' }}
                      >
                        {hasFilters ? "No articles match your search." : "No articles yet."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedArticles.map((article) => (
                    <TableRow 
                      key={article.id} 
                      clickable
                      onClick={() => navigate(`/admin/help/articles/${article.id}`)}
                    >
                      <TableCell>
                        <div className="min-w-0">
                          <p className="truncate font-medium" style={{ color: 'var(--platform-text)' }}>
                            {article.title || "Untitled"}
                          </p>
                          <p 
                            className="text-[11px] truncate mt-0.5"
                            style={{ color: 'var(--platform-text-muted)', opacity: 0.7 }}
                          >
                            /{article.slug}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell muted className="hidden md:table-cell">
                        {article.category?.name || "—"}
                      </TableCell>
                      <TableCell status>
                        {getStatusBadge(article.status)}
                      </TableCell>
                      <TableCell muted className="hidden lg:table-cell">
                        {format(new Date(article.updated_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <InstitutionalButton variant="ghost" size="icon">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </InstitutionalButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent 
                            align="end"
                            className="min-w-[140px]"
                            style={{
                              backgroundColor: '#1a1d21',
                              border: '1px solid rgba(255,255,255,0.1)',
                            }}
                          >
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/help/articles/${article.id}`);
                              }}
                              className="text-[13px] focus:bg-white/5"
                              style={{ color: 'var(--platform-text-secondary)' }}
                            >
                              <Pencil className="h-3.5 w-3.5 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {article.status === "published" && (
                              <DropdownMenuItem 
                                onClick={(e) => e.stopPropagation()}
                                className="text-[13px] focus:bg-white/5"
                                style={{ color: 'var(--platform-text-secondary)' }}
                              >
                                <Eye className="h-3.5 w-3.5 mr-2" />
                                View published
                              </DropdownMenuItem>
                            )}
                            {article.status !== "archived" && (
                              <>
                                <DropdownMenuSeparator 
                                  style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                                />
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleArchive(article);
                                  }}
                                  className="text-[13px] focus:bg-white/5"
                                  style={{ color: 'rgb(239, 68, 68)' }}
                                >
                                  <Archive className="h-3.5 w-3.5 mr-2" />
                                  Archive
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-3">
            <p 
              className="text-[11px]"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, sortedArticles.length)} of {sortedArticles.length}
            </p>
            <div className="flex items-center gap-1.5">
              <InstitutionalButton
                variant="tertiary"
                size="xs"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </InstitutionalButton>
              <InstitutionalButton
                variant="tertiary"
                size="xs"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </InstitutionalButton>
            </div>
          </div>
        )}
      </section>
    </PageContainer>
  );
}

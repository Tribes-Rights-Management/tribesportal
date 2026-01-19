import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Archive, Eye, Pencil, FolderOpen } from "lucide-react";
import { format } from "date-fns";
import { useHelpManagement, HelpArticle, HelpArticleStatus, HelpVisibility } from "@/hooks/useHelpManagement";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InstitutionalLoadingState } from "@/components/ui/institutional-states";
import { PageShell } from "@/components/ui/page-shell";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeader } from "@/components/ui/page-header";

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
  const styles: Record<HelpArticleStatus, { borderColor: string; color: string }> = {
    published: { borderColor: 'rgba(74, 222, 128, 0.3)', color: 'rgb(74, 222, 128)' },
    draft: { borderColor: 'rgba(250, 204, 21, 0.3)', color: 'rgb(250, 204, 21)' },
    archived: { borderColor: 'rgba(156, 163, 175, 0.3)', color: 'rgb(156, 163, 175)' },
  };
  const labels: Record<HelpArticleStatus, string> = {
    published: "Published",
    draft: "Draft",
    archived: "Archived",
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant="outline" 
          className="text-[10px] cursor-default"
          style={styles[status]}
        >
          {labels[status]}
        </Badge>
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
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "sm" | "icon";
  disabled?: boolean;
  className?: string;
}) {
  const baseStyles = "inline-flex items-center justify-center gap-1.5 font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeStyles = {
    default: "h-9 px-4 text-[13px] rounded-md",
    sm: "h-8 px-3 text-[12px] rounded-md",
    icon: "h-8 w-8 rounded-md",
  };
  
  const variantStyles = {
    primary: {
      backgroundColor: 'var(--platform-text)',
      color: 'var(--platform-canvas)',
      border: 'none',
    },
    secondary: {
      backgroundColor: 'var(--platform-surface-2)',
      borderColor: 'var(--platform-border)',
      color: 'var(--platform-text)',
      border: '1px solid var(--platform-border)',
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

      {/* Categories Section */}
      <section className="mb-8">
        <SectionHeader title="Categories" description="Organize Help Center content">
          <InstitutionalButton 
            variant="secondary" 
            size="sm"
            onClick={() => navigate("/admin/help/categories")}
          >
            <FolderOpen className="h-3.5 w-3.5" />
            Manage categories
          </InstitutionalButton>
        </SectionHeader>
        
        <div 
          className="rounded-md p-4"
          style={{
            backgroundColor: 'var(--platform-surface-2)',
            border: '1px solid var(--platform-border)',
          }}
        >
          <p 
            className="text-[13px]"
            style={{ color: 'var(--platform-text-secondary)' }}
          >
            {categories.length} {categories.length === 1 ? 'category' : 'categories'} configured
          </p>
        </div>
      </section>

      {/* Articles Section */}
      <section>
        <SectionHeader title="Articles" description="Create and maintain public documentation">
          <InstitutionalButton onClick={() => navigate("/admin/help/articles/new")}>
            <Plus className="h-3.5 w-3.5" />
            New article
          </InstitutionalButton>
        </SectionHeader>

        {/* Filters Row */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--platform-text-muted)' }} />
            <Input
              placeholder="Search title or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              style={{
                backgroundColor: 'var(--platform-surface-2)',
                borderColor: 'var(--platform-border)',
                color: 'var(--platform-text)',
              }}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger 
              className="w-full md:w-[160px]"
              style={{
                backgroundColor: 'var(--platform-surface-2)',
                borderColor: 'var(--platform-border)',
                color: 'var(--platform-text)',
              }}
            >
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger 
              className="w-full md:w-[140px]"
              style={{
                backgroundColor: 'var(--platform-surface-2)',
                borderColor: 'var(--platform-border)',
                color: 'var(--platform-text)',
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={visibilityFilter} onValueChange={(v) => setVisibilityFilter(v as any)}>
            <SelectTrigger 
              className="w-full md:w-[140px]"
              style={{
                backgroundColor: 'var(--platform-surface-2)',
                borderColor: 'var(--platform-border)',
                color: 'var(--platform-text)',
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VISIBILITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {articlesLoading ? (
          <InstitutionalLoadingState message="Loading articles" />
        ) : (
          <div 
            className="rounded-md overflow-hidden"
            style={{ 
              backgroundColor: 'var(--platform-surface-2)',
              border: '1px solid var(--platform-border)',
            }}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">
                    <button 
                      onClick={() => handleSort("title")}
                      className="flex items-center hover:opacity-80 transition-opacity"
                      style={{ color: 'var(--platform-text-muted)' }}
                    >
                      Title
                      {getSortIcon("title")}
                    </button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead status>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    <button 
                      onClick={() => handleSort("updated_at")}
                      className="flex items-center hover:opacity-80 transition-opacity"
                      style={{ color: 'var(--platform-text-muted)' }}
                    >
                      Updated
                      {getSortIcon("updated_at")}
                    </button>
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedArticles.length === 0 ? (
                  <TableEmptyRow 
                    colSpan={5}
                    title={hasFilters ? "No results" : "No articles yet"}
                    description={hasFilters 
                      ? "No articles match your search." 
                      : "Create your first Help article to get started."}
                  />
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
                              <MoreHorizontal className="h-4 w-4" />
                            </InstitutionalButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/help/articles/${article.id}`);
                            }}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {article.status === "published" && (
                              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                <Eye className="h-4 w-4 mr-2" />
                                View published
                              </DropdownMenuItem>
                            )}
                            {article.status !== "archived" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleArchive(article);
                                  }}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Archive className="h-4 w-4 mr-2" />
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
          <div className="flex items-center justify-between mt-4 px-1">
            <p 
              className="text-[12px]"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, sortedArticles.length)} of {sortedArticles.length}
            </p>
            <div className="flex items-center gap-2">
              <InstitutionalButton
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </InstitutionalButton>
              <InstitutionalButton
                variant="secondary"
                size="sm"
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

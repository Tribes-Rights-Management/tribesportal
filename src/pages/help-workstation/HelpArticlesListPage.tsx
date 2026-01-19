import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search, ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Archive, Eye, Pencil, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { useHelpManagement, HelpArticle, HelpArticleStatus, HelpVisibility } from "@/hooks/useHelpManagement";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { InstitutionalLoadingState } from "@/components/ui/institutional-states";
import { PageContainer } from "@/components/ui/page-container";
import { 
  AppButton, 
  AppChip, 
  AppSectionHeader 
} from "@/components/app-ui";

/**
 * HELP ARTICLES LIST — HELP WORKSTATION
 * 
 * Scalable table-based article management with:
 * - Search, filters (status/category/visibility)
 * - Sortable columns
 * - Pagination
 * - Bulk actions
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

  // Filters (initialize from URL params)
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

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Load data on mount
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
    setSelectedIds(new Set());
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

  const handleRestore = async (article: HelpArticle) => {
    await restoreArticle(article.id);
    fetchArticles();
  };

  // Bulk selection
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedArticles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedArticles.map(a => a.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // Bulk actions
  const handleBulkArchive = async () => {
    for (const id of selectedIds) {
      await archiveArticle(id);
    }
    setSelectedIds(new Set());
    fetchArticles();
  };

  const hasFilters = search || statusFilter !== "all" || visibilityFilter !== "all" || categoryFilter !== "all";

  return (
    <PageContainer maxWidth="wide">
      <AppSectionHeader
        title="Articles"
        subtitle={`${sortedArticles.length} ${sortedArticles.length === 1 ? 'article' : 'articles'}`}
        actions={
          <AppButton 
            intent="primary"
            onClick={() => navigate("/help-workstation/articles/new")}
            icon={<Plus className="h-4 w-4" />}
          >
            New Article
          </AppButton>
        }
      />

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" 
            style={{ color: 'hsl(var(--muted-foreground))' }} 
          />
          <input
            type="text"
            placeholder="Search title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full pl-10 pr-4 text-sm rounded-lg transition-colors duration-100 focus:outline-none"
            style={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))',
            }}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 px-3 text-sm rounded-lg appearance-none cursor-pointer transition-colors duration-100 focus:outline-none"
          style={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
            minWidth: '150px',
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
          className="h-10 px-3 text-sm rounded-lg appearance-none cursor-pointer transition-colors duration-100 focus:outline-none"
          style={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
            minWidth: '130px',
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={visibilityFilter}
          onChange={(e) => setVisibilityFilter(e.target.value as any)}
          className="h-10 px-3 text-sm rounded-lg appearance-none cursor-pointer transition-colors duration-100 focus:outline-none"
          style={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
            minWidth: '130px',
          }}
        >
          {VISIBILITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div 
          className="flex items-center gap-3 p-3 mb-4 rounded-lg"
          style={{
            backgroundColor: 'hsl(var(--muted) / 0.5)',
            border: '1px solid hsl(var(--border))',
          }}
        >
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <AppButton 
            intent="secondary" 
            size="sm"
            onClick={handleBulkArchive}
          >
            Archive Selected
          </AppButton>
          <AppButton 
            intent="ghost" 
            size="sm"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear Selection
          </AppButton>
        </div>
      )}

      {/* Table */}
      {articlesLoading ? (
        <InstitutionalLoadingState message="Loading articles" />
      ) : (
        <div 
          className="rounded-lg overflow-hidden"
          style={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
          }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[44px]">
                  <Checkbox 
                    checked={selectedIds.size === paginatedArticles.length && paginatedArticles.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="min-w-[200px]">
                  <button 
                    onClick={() => handleSort("title")}
                    className="flex items-center hover:opacity-80 transition-opacity text-xs font-medium uppercase tracking-wider"
                  >
                    Title
                    {getSortIcon("title")}
                  </button>
                </TableHead>
                <TableHead className="hidden md:table-cell text-xs font-medium uppercase tracking-wider">
                  Category
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="hidden md:table-cell text-xs font-medium uppercase tracking-wider">
                  Visibility
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  <button 
                    onClick={() => handleSort("updated_at")}
                    className="flex items-center hover:opacity-80 transition-opacity text-xs font-medium uppercase tracking-wider"
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
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      {hasFilters ? "No articles match your search." : "No articles yet."}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedArticles.map((article) => (
                  <TableRow 
                    key={article.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/help-workstation/articles/${article.id}`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={selectedIds.has(article.id)}
                        onCheckedChange={() => toggleSelect(article.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {article.title || "Untitled"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          /{article.slug}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {article.category?.name || "—"}
                    </TableCell>
                    <TableCell>
                      <AppChip 
                        status={getStatusChipStatus(article.status)} 
                        label={article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                      />
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground capitalize">
                      {article.visibility || "public"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {format(new Date(article.updated_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <AppButton intent="ghost" size="xs">
                            <MoreHorizontal className="h-4 w-4" />
                          </AppButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/help-workstation/articles/${article.id}`)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {article.status === "published" && (
                            <DropdownMenuItem onClick={() => window.open(`/help/articles/${article.slug}`, '_blank')}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Live
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {article.status === "archived" ? (
                            <DropdownMenuItem onClick={() => handleRestore(article)}>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Restore
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => handleArchive(article)}
                              className="text-destructive"
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
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
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <AppButton 
              intent="secondary" 
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              Previous
            </AppButton>
            <AppButton 
              intent="secondary" 
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next
            </AppButton>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

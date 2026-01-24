import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { format } from "date-fns";
import { useHelpManagement, HelpArticle, HelpArticleStatus, HelpVisibility } from "@/hooks/useHelpManagement";
import { useDebounce } from "@/hooks/useDebounce";

// Import from unified app-ui kit
import {
  AppButton,
  AppPageHeader,
  AppSearchInput,
  AppSelect,
  AppAlert,
  AppEmptyState,
  AppTable,
  AppTableHeader,
  AppTableBody,
  AppTableRow,
  AppTableHead,
  AppTableCell,
  AppTableEmpty,
  AppTableBadge,
  AppTableTag,
  AppPagination,
} from "@/components/app-ui";

/**
 * HELP ARTICLES LIST — UNIFIED DESIGN SYSTEM
 *
 * Uses canonical app-ui components for consistency.
 * No hardcoded colors - all styling via CSS variables.
 */

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const VISIBILITY_OPTIONS = [
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
      <mark className="bg-info/30 text-foreground px-0.5 rounded">{match}</mark>
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

  const start = Math.max(0, index - 50);
  const end = Math.min(body.length, index + search.length + 100);

  let snippet = body.slice(start, end);
  snippet = snippet.replace(/<[^>]*>/g, '');

  if (start > 0) snippet = '...' + snippet;
  if (end < body.length) snippet = snippet + '...';

  return snippet;
}

export default function HelpArticlesListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    articles,
    articlesLoading,
    articlesError,
    fetchArticles,
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

  const showSearching = search !== debouncedSearch || isSearching;

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

  const getSortDirection = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder;
  };

  const clearSearch = useCallback(() => {
    setSearch("");
  }, []);

  const hasBodyMatch = useCallback((article: HelpArticle, searchTerm: string): boolean => {
    if (!searchTerm) return false;
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = article.title?.toLowerCase().includes(searchLower);
    const bodyMatch = article.body_md?.toLowerCase().includes(searchLower);
    return !titleMatch && !!bodyMatch;
  }, []);

  const categoryOptions = [
    { value: "all", label: "All categories" },
    ...categories.map(cat => ({ value: cat.id, label: cat.name })),
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "published": return "success";
      case "archived": return "error";
      default: return "default";
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8">
      {/* Page Header */}
      <AppPageHeader
        eyebrow="Help Workstation"
        title="Articles"
        description={`${sortedArticles.length} articles`}
        action={
          <AppButton
            variant="primary"
            size="sm"
            onClick={() => navigate("/help-workstation/articles/new")}
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            New Article
          </AppButton>
        }
      />

      {/* Error Alert */}
      {articlesError && (
        <div className="mb-6">
          <AppAlert
            variant="error"
            message={articlesError}
            onRetry={() => fetchArticles()}
          />
        </div>
      )}

      {/* Search */}
      <div className="mb-6 max-w-md">
        <AppSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search articles..."
          variant="underline"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <AppSelect
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={categoryOptions}
        />
        <AppSelect
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as any)}
          options={STATUS_OPTIONS}
        />
        <AppSelect
          value={visibilityFilter}
          onChange={(v) => setVisibilityFilter(v as any)}
          options={VISIBILITY_OPTIONS}
        />
      </div>

      {/* Table */}
      <AppTable>
        <AppTableHeader>
          <AppTableRow header>
            <AppTableHead
              sortable
              sortDirection={getSortDirection("title")}
              onSort={() => handleSort("title")}
              width="35%"
            >
              Title
            </AppTableHead>
            <AppTableHead width="20%">Category</AppTableHead>
            <AppTableHead width="15%">Status</AppTableHead>
            <AppTableHead width="15%">Visibility</AppTableHead>
            <AppTableHead
              sortable
              sortDirection={getSortDirection("updated_at")}
              onSort={() => handleSort("updated_at")}
              align="right"
              width="15%"
            >
              Updated
            </AppTableHead>
          </AppTableRow>
        </AppTableHeader>
        <AppTableBody>
          {articlesLoading && !showSearching ? (
            <AppTableEmpty colSpan={5}>
              <p className="text-[13px] text-muted-foreground">Loading articles...</p>
            </AppTableEmpty>
          ) : paginatedArticles.length === 0 ? (
            <AppTableEmpty colSpan={5}>
              {debouncedSearch ? (
                <AppEmptyState
                  icon="search"
                  message={`No articles found for "${debouncedSearch}"`}
                  action={
                    <AppButton variant="ghost" size="sm" onClick={clearSearch}>
                      Clear search
                    </AppButton>
                  }
                />
              ) : (
                <AppEmptyState
                  icon="file"
                  message="No articles yet"
                />
              )}
            </AppTableEmpty>
          ) : (
            paginatedArticles.map(article => {
              const bodyMatch = hasBodyMatch(article, debouncedSearch);
              const bodySnippet = bodyMatch ? getBodySnippet(article.body_md, debouncedSearch) : null;

              return (
                <AppTableRow
                  key={article.id}
                  clickable
                  onClick={() => navigate(`/help-workstation/articles/${article.id}`)}
                >
                  <AppTableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground font-medium">
                          {debouncedSearch
                            ? highlightMatch(article.title || "Untitled", debouncedSearch)
                            : (article.title || "Untitled")
                          }
                        </span>
                        {article.status === 'draft' && (
                          <AppTableTag>DRAFT</AppTableTag>
                        )}
                      </div>
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {article.tags.slice(0, 3).map(tag => (
                            <AppTableTag key={tag}>{tag}</AppTableTag>
                          ))}
                          {article.tags.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{article.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      {bodySnippet && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {highlightMatch(bodySnippet, debouncedSearch)}
                        </p>
                      )}
                    </div>
                  </AppTableCell>
                  <AppTableCell muted>{article.category?.name || "—"}</AppTableCell>
                  <AppTableCell>
                    <AppTableBadge variant={getStatusVariant(article.status)}>
                      {article.status}
                    </AppTableBadge>
                  </AppTableCell>
                  <AppTableCell muted>{article.visibility || "public"}</AppTableCell>
                  <AppTableCell align="right" muted>
                    {format(new Date(article.updated_at), "MMM d, yyyy")}
                  </AppTableCell>
                </AppTableRow>
              );
            })
          )}
        </AppTableBody>
      </AppTable>

      {/* Pagination */}
      <AppPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, AlertCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { supabase } from "@/integrations/supabase/client";
import { useHelpManagement, HelpArticle, HelpArticleStatus } from "@/hooks/useHelpManagement";
import { useArticleOrderByCategory } from "@/hooks/useArticleOrderByCategory";
import { useDebounce } from "@/hooks/useDebounce";
import {
  AppButton,
  AppChip,
  AppTable,
  AppTableHeader,
  AppTableBody,
  AppTableRow,
  AppTableHead,
  AppTableCell,
  AppTableEmpty,
  AppPageLayout,
  AppAlert,
  AppEmptyState,
} from "@/components/app-ui";
import { SortableArticleCard } from "@/components/help/SortableArticleCard";
import { SearchInput } from "@/components/ui/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * HELP ARTICLES LIST — INSTITUTIONAL DESIGN
 * Single filter row with search, category, and status dropdowns.
 * Selecting a specific category switches to drag-drop reorder view.
 */

const PAGE_SIZE = 20;

type SortField = "title" | "updated_at";
type SortOrder = "asc" | "desc";

export default function HelpArticlesListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const {
    articles,
    articlesLoading,
    articlesError,
    fetchArticles,
    categories,
    fetchCategories,
    audiences,
    fetchAudiences,
  } = useHelpManagement();

  const {
    articles: orderedArticles,
    loading: orderLoading,
    fetchArticlesForCategory,
    updatePositions,
  } = useArticleOrderByCategory();

  // Filters - category "all" = table view, specific category = drag-drop view
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  const [sortField, setSortField] = useState<SortField>("updated_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Article-audience mappings for display
  const [articleAudienceMap, setArticleAudienceMap] = useState<Record<string, string[]>>({});

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const selectedCategory = categories.find(c => c.id === categoryFilter);
  const isTableView = categoryFilter === "all";

  useEffect(() => {
    fetchArticles();
    fetchCategories();
    fetchAudiences();
  }, [fetchArticles, fetchCategories, fetchAudiences]);

  // Fetch all article-audience relationships for display
  useEffect(() => {
    async function loadArticleAudiences() {
      const { data, error } = await supabase
        .from("help_article_audiences")
        .select("article_id, audience_id");

      if (!error && data) {
        const map: Record<string, string[]> = {};
        data.forEach(row => {
          if (!map[row.article_id]) {
            map[row.article_id] = [];
          }
          if (!map[row.article_id].includes(row.audience_id)) {
            map[row.article_id].push(row.audience_id);
          }
        });
        setArticleAudienceMap(map);
      }
    }
    loadArticleAudiences();
  }, [articles]);

  // Load articles when a specific category is selected
  useEffect(() => {
    if (categoryFilter !== "all") {
      fetchArticlesForCategory(categoryFilter);
    }
  }, [categoryFilter, fetchArticlesForCategory]);

  // Filter and sort articles
  const filteredArticles = useMemo(() => {
    let result = [...articles];

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(a => a.status === statusFilter);
    }

    // Search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      result = result.filter(a =>
        a.title?.toLowerCase().includes(searchLower) ||
        a.slug.toLowerCase().includes(searchLower) ||
        a.content?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      if (sortField === "title") {
        aVal = a.title?.toLowerCase() || "";
        bVal = b.title?.toLowerCase() || "";
      } else {
        aVal = new Date(a.updated_at).getTime();
        bVal = new Date(b.updated_at).getTime();
      }

      if (sortOrder === "asc") {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return result;
  }, [articles, statusFilter, debouncedSearch, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredArticles.length / PAGE_SIZE);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && categoryFilter !== "all") {
      const oldIndex = orderedArticles.findIndex(a => a.id === active.id);
      const newIndex = orderedArticles.findIndex(a => a.id === over.id);

      const reordered = arrayMove(orderedArticles, oldIndex, newIndex);
      await updatePositions(categoryFilter, reordered);
    }
  };

  const getStatusChip = (status: HelpArticleStatus) => {
    switch (status) {
      case "published":
        return <AppChip status="pass" label="Published" />;
      case "draft":
        return <AppChip status="pending" label="Draft" />;
      case "archived":
        return <AppChip status="fail" label="Archived" />;
      default:
        return <AppChip status="pending" label={status} />;
    }
  };

  // Get audience name by ID
  const getAudienceName = (audienceId: string) => {
    return audiences.find(a => a.id === audienceId)?.name || "Unknown";
  };

  // Get audience names for an article
  const getArticleAudiences = (articleId: string): string => {
    const audienceIds = articleAudienceMap[articleId] || [];
    if (audienceIds.length === 0) return "";
    return audienceIds.map(id => getAudienceName(id)).join(", ");
  };

  const isLoading = articlesLoading || (!isTableView && orderLoading);
  const displayCount = isTableView ? filteredArticles.length : orderedArticles.length;

  return (
    <AppPageLayout
      title="Articles"
      backLink={{ to: "/help", label: "Overview" }}
      action={
        <AppButton intent="primary" size="sm" onClick={() => navigate("/help/articles/new")}>
          <Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />
          New Article
        </AppButton>
      }
    >
      {/* Error */}
      {articlesError && (
        <div className="mb-6">
          <AppAlert
            variant="error"
            message={articlesError}
            onRetry={() => fetchArticles()}
          />
        </div>
      )}

      {/* Single Filter Row - responsive stacking */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        {/* Search input - standardized component */}
        <SearchInput
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          wrapperClassName="w-full sm:flex-1 sm:max-w-xs"
        />

        {/* Filters row on mobile */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Category filter */}
          <Select value={categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger className="h-9 flex-1 sm:flex-none sm:w-[180px] text-[13px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent className="min-w-[180px]">
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="h-9 flex-1 sm:flex-none sm:w-[180px] text-[13px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="min-w-[180px]">
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <AppEmptyState message="Loading articles..." size="lg" />
      ) : !isTableView ? (
        /* Category View - Sortable Cards */
        orderedArticles.length === 0 ? (
          <AppEmptyState
            icon="file"
            message={`No articles in ${selectedCategory?.name || "this category"} yet.`}
            description="Create an article and assign it to this category."
            size="lg"
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedArticles.map(a => a.id)}
              strategy={verticalListSortingStrategy}
            >
              {orderedArticles.map((article, index) => (
                <SortableArticleCard
                  key={article.id}
                  article={article}
                  index={index}
                  onClick={() => navigate(`/help/articles/${article.id}`)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )
      ) : (
        /* All Articles View - Table */
        <>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-[600px] px-4 sm:px-0">
              <AppTable columns="name-meta-status-date">
                <AppTableHeader>
                  <AppTableRow header>
                    <AppTableHead
                      sortable
                      sortDirection={sortField === "title" ? sortOrder : null}
                      onSort={() => handleSort("title")}
                    >
                      Title
                    </AppTableHead>
                    <AppTableHead className="hidden sm:table-cell">Audiences</AppTableHead>
                    <AppTableHead>Status</AppTableHead>
                    <AppTableHead
                      align="right"
                      sortable
                      sortDirection={sortField === "updated_at" ? sortOrder : null}
                      onSort={() => handleSort("updated_at")}
                    >
                      Updated
                    </AppTableHead>
                  </AppTableRow>
                </AppTableHeader>
                <AppTableBody>
                  {paginatedArticles.length === 0 ? (
                    <AppTableEmpty colSpan={4}>
                      <p className="text-[13px] text-muted-foreground">
                        {debouncedSearch || statusFilter !== "all" ? "No articles match your filters" : "No articles yet"}
                      </p>
                    </AppTableEmpty>
                  ) : (
                    paginatedArticles.map(article => (
                      <AppTableRow
                        key={article.id}
                        clickable
                        onClick={() => navigate(`/help/articles/${article.id}`)}
                      >
                        <AppTableCell>{article.title || "Untitled"}</AppTableCell>
                        <AppTableCell muted className="hidden sm:table-cell">
                          {getArticleAudiences(article.id) || <span className="italic">No audiences</span>}
                        </AppTableCell>
                        <AppTableCell>
                          {getStatusChip(article.status)}
                        </AppTableCell>
                        <AppTableCell align="right" muted>
                          {format(new Date(article.updated_at), "MMM d, yyyy")}
                        </AppTableCell>
                      </AppTableRow>
                    ))
                  )}
                </AppTableBody>
              </AppTable>
            </div>
          </div>

          {/* Pagination - responsive */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
              <p className="text-[12px] text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <AppButton
                  intent="secondary"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="flex-1 sm:flex-none"
                >
                  Previous
                </AppButton>
                <AppButton
                  intent="secondary"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="flex-1 sm:flex-none"
                >
                  Next
                </AppButton>
              </div>
            </div>
          )}
        </>
      )}
    </AppPageLayout>
  );
}

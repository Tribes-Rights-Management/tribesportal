import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, AlertCircle, RefreshCw, ChevronUp, ChevronDown } from "lucide-react";
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
import { AppButton, AppChip } from "@/components/app-ui";
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
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
            HELP WORKSTATION
          </p>
          <h1 className="text-[20px] font-medium text-foreground mb-1">Articles</h1>
          <p className="text-[13px] text-muted-foreground">
            {selectedCategory
              ? `${displayCount} articles in ${selectedCategory.name}`
              : `${displayCount} articles`
            }
          </p>
        </div>
        <AppButton intent="primary" size="sm" onClick={() => navigate("/help-workstation/articles/new")}>
          <Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />
          New Article
        </AppButton>
      </div>

      {/* Error */}
      {articlesError && (
        <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-destructive/10 border-l-2 border-destructive rounded-r">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-[12px] text-foreground">{articlesError}</p>
            <AppButton 
              intent="tertiary" 
              size="xs"
              onClick={() => fetchArticles()} 
              className="text-[11px] text-destructive hover:text-destructive/80 mt-1"
              icon={<RefreshCw className="h-3 w-3" strokeWidth={1.5} />}
            >
              Try again
            </AppButton>
          </div>
        </div>
      )}

      {/* Single Filter Row */}
      <div className="flex items-center gap-3 mb-6">
        {/* Search input - standardized component */}
        <SearchInput
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          wrapperClassName="flex-1 max-w-xs"
        />

        {/* Category filter */}
        <Select value={categoryFilter} onValueChange={handleCategoryChange}>
          <SelectTrigger className="h-9 w-[180px] text-[13px]">
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
          <SelectTrigger className="h-9 w-[180px] text-[13px]">
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

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-20">
          <p className="text-[13px] text-muted-foreground">Loading articles...</p>
        </div>
      ) : !isTableView ? (
        /* Category View - Sortable Cards */
        orderedArticles.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded">
            <p className="text-[13px] text-muted-foreground">
              No articles in {selectedCategory?.name || "this category"} yet.
            </p>
            <p className="text-[12px] text-muted-foreground mt-1">
              Create an article and assign it to this category.
            </p>
          </div>
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
                  onClick={() => navigate(`/help-workstation/articles/${article.id}`)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )
      ) : (
        /* All Articles View - Table */
        <>
          <div className="bg-card border border-border rounded">
            <table className="w-full">
              <colgroup>
                <col className="w-[35%]" />
                <col className="w-[35%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-border">
                  <th
                    className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground font-medium cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center gap-1">
                      Title
                      {sortField === "title" && (
                        sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    Audiences
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    Status
                  </th>
                  <th
                    className="text-right py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground font-medium cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("updated_at")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Updated
                      {sortField === "updated_at" && (
                        sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedArticles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-20">
                      <p className="text-[13px] text-muted-foreground">
                        {debouncedSearch || statusFilter !== "all" ? "No articles match your filters" : "No articles yet"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedArticles.map(article => (
                    <tr
                      key={article.id}
                      onClick={() => navigate(`/help-workstation/articles/${article.id}`)}
                      className="border-b border-border/30 row-hover cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <p className="text-[13px] text-foreground">{article.title || "Untitled"}</p>
                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">/{article.slug}</p>
                      </td>
                      <td className="py-3 px-4 text-[12px] text-muted-foreground">
                        {getArticleAudiences(article.id) || <span className="italic">No audiences</span>}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusChip(article.status)}
                      </td>
                      <td className="py-3 px-4 text-right text-[12px] text-muted-foreground">
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
              <p className="text-[12px] text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
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
        </>
      )}
    </div>
  );
}

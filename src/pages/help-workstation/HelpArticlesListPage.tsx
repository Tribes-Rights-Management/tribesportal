import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, AlertCircle, RefreshCw, ChevronUp, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { useHelpManagement, HelpArticle, HelpArticleStatus } from "@/hooks/useHelpManagement";
import { useDebounce } from "@/hooks/useDebounce";
import { AppButton, AppChip, AppSearchInput, AppSelect } from "@/components/app-ui";

/**
 * HELP ARTICLES LIST — INSTITUTIONAL DESIGN
 * Simplified to match actual database schema.
 */

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

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
  } = useHelpManagement();

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("updated_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

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

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
            HELP WORKSTATION
          </p>
          <h1 className="text-[20px] font-medium text-foreground mb-1">Articles</h1>
          <p className="text-[13px] text-muted-foreground">{filteredArticles.length} articles</p>
        </div>
        <AppButton intent="secondary" size="sm" onClick={() => navigate("/help-workstation/articles/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Article
        </AppButton>
      </div>

      {/* Error */}
      {articlesError && (
        <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-destructive/10 border-l-2 border-destructive rounded-r">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-[12px] text-foreground">{articlesError}</p>
            <button onClick={() => fetchArticles()} className="text-[11px] text-destructive hover:text-destructive/80 underline mt-1 flex items-center gap-1">
              <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <AppSearchInput
          value={searchQuery}
          onChange={(v) => { setSearchQuery(v); setCurrentPage(1); }}
          placeholder="Search articles..."
          className="flex-1 max-w-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="h-9 px-3 bg-muted/40 border border-transparent hover:border-border rounded-md text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded">
        <table className="w-full">
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
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground font-medium w-[120px]">
                Status
              </th>
              <th
                className="text-right py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground font-medium w-[150px] cursor-pointer hover:text-foreground"
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
            {articlesLoading ? (
              <tr>
                <td colSpan={3} className="text-center py-20">
                  <p className="text-[13px] text-muted-foreground">Loading articles...</p>
                </td>
              </tr>
            ) : paginatedArticles.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-20">
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
                  className="border-b border-border/30 row-hover"
                >
                  <td className="py-3 px-4">
                    <p className="text-[13px] text-foreground">{article.title || "Untitled"}</p>
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5">/{article.slug}</p>
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
    </div>
  );
}

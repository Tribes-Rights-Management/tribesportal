import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { useHelpManagement, HelpArticleStatus, HelpVisibility } from "@/hooks/useHelpManagement";
import { AdminSection, AdminListRow } from "@/components/admin/AdminListRow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InstitutionalLoadingState } from "@/components/ui/institutional-states";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * HELP ARTICLES PAGE — SYSTEM CONSOLE
 * 
 * Company-scoped article management for Help backend.
 * Access requires can_manage_help capability or platform_admin.
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

function getStatusBadge(status: HelpArticleStatus) {
  switch (status) {
    case "published":
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className="text-[10px] cursor-default"
              style={{ 
                borderColor: 'rgba(74, 222, 128, 0.3)',
                color: 'rgb(74, 222, 128)',
              }}
            >
              Published
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{STATUS_TOOLTIPS.published}</p>
          </TooltipContent>
        </Tooltip>
      );
    case "draft":
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className="text-[10px] cursor-default"
              style={{ 
                borderColor: 'rgba(250, 204, 21, 0.3)',
                color: 'rgb(250, 204, 21)',
              }}
            >
              Draft
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{STATUS_TOOLTIPS.draft}</p>
          </TooltipContent>
        </Tooltip>
      );
    case "archived":
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className="text-[10px] cursor-default"
              style={{ 
                borderColor: 'rgba(156, 163, 175, 0.3)',
                color: 'rgb(156, 163, 175)',
              }}
            >
              Archived
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{STATUS_TOOLTIPS.archived}</p>
          </TooltipContent>
        </Tooltip>
      );
  }
}

export default function HelpArticlesPage() {
  const navigate = useNavigate();
  const {
    articles,
    articlesLoading,
    fetchArticles,
    categories,
    fetchCategories,
  } = useHelpManagement();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<HelpArticleStatus | "all">("all");
  const [visibilityFilter, setVisibilityFilter] = useState<HelpVisibility | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

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
  }, [search, statusFilter, visibilityFilter, categoryFilter, fetchArticles]);

  const hasFilters = search || statusFilter !== "all" || visibilityFilter !== "all" || categoryFilter !== "all";

  return (
    <div 
      className="min-h-full py-8 md:py-12 px-4 md:px-6"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <div 
        className="max-w-[960px] mx-auto rounded-lg"
        style={{
          backgroundColor: 'var(--platform-surface)',
          border: '1px solid var(--platform-border)',
        }}
      >
        <div className="p-6 md:p-8">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 
                  className="text-[20px] md:text-[24px] font-medium tracking-[-0.01em]"
                  style={{ color: 'var(--platform-text)' }}
                >
                  Help articles
                </h1>
                <p 
                  className="text-[13px] mt-1"
                  style={{ color: 'var(--platform-text-muted)' }}
                >
                  Create and maintain public documentation for Tribes users.
                </p>
              </div>
              <Button
                onClick={() => navigate("/admin/help/articles/new")}
                size="sm"
                className="shrink-0"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                New article
              </Button>
            </div>
          </header>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search title or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-full md:w-[140px]">
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
              <SelectTrigger className="w-full md:w-[140px]">
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[160px]">
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
          </div>

          {/* Content */}
          {articlesLoading ? (
            <InstitutionalLoadingState message="Loading articles" />
          ) : articles.length === 0 ? (
            <div className="py-12 text-center">
              <p 
                className="text-[14px] font-medium mb-1"
                style={{ color: 'var(--platform-text)' }}
              >
                {hasFilters ? "No results" : "No articles yet"}
              </p>
              <p 
                className="text-[13px]"
                style={{ color: 'var(--platform-text-muted)' }}
              >
                {hasFilters 
                  ? "No articles match your search." 
                  : "Create your first Help article to get started."}
              </p>
              {!hasFilters && (
                <Button
                  onClick={() => navigate("/admin/help/articles/new")}
                  size="sm"
                  className="mt-4"
                >
                  New article
                </Button>
              )}
            </div>
          ) : (
            <div 
              className="rounded-md overflow-hidden"
              style={{ 
                backgroundColor: 'var(--platform-surface-2)',
                border: '1px solid var(--platform-border)',
              }}
            >
              {articles.map((article) => (
                <AdminListRow
                  key={article.id}
                  to={`/admin/help/articles/${article.id}`}
                  title={article.title}
                  description={article.category?.name || "Uncategorized"}
                  trailing={
                    <div className="flex items-center gap-2">
                      {getStatusBadge(article.status)}
                      <span 
                        className="text-[11px] tabular-nums hidden md:inline"
                        style={{ color: 'var(--platform-text-muted)' }}
                      >
                        {format(new Date(article.updated_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
import { InstitutionalLoadingState, InstitutionalEmptyState } from "@/components/ui/institutional-states";
import { Badge } from "@/components/ui/badge";

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

function getStatusBadge(status: HelpArticleStatus) {
  switch (status) {
    case "published":
      return (
        <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">
          Published
        </Badge>
      );
    case "draft":
      return (
        <Badge variant="outline" className="text-[10px] border-yellow-500/30 text-yellow-400">
          Draft
        </Badge>
      );
    case "archived":
      return (
        <Badge variant="outline" className="text-[10px] border-gray-500/30 text-gray-400">
          Archived
        </Badge>
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
                  Articles
                </h1>
                <p 
                  className="text-[13px] mt-1"
                  style={{ color: 'var(--platform-text-muted)' }}
                >
                  Manage Help Center content
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
            <InstitutionalEmptyState
              title="No articles"
              description={search || statusFilter !== "all" || visibilityFilter !== "all" || categoryFilter !== "all" 
                ? "No articles match your filters." 
                : "Create your first article to get started."}
            />
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

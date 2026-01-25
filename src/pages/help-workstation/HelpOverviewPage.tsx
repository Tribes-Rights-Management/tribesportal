import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { useDebounce } from "@/hooks/useDebounce";

// Import from unified app-ui kit
import {
  AppButton,
  AppPageHeader,
  AppStatCard,
  AppStatCardGrid,
  AppListCard,
  AppListRow,
  AppListAction,
  AppEmptyState,
  AppSearchInput,
  AppAlert,
  AppSectionGrid,
} from "@/components/app-ui";

/**
 * HELP WORKSTATION OVERVIEW — UNIFIED DESIGN SYSTEM
 * 
 * Uses canonical app-ui components for consistency across the application.
 * No hardcoded colors - all styling via CSS variables.
 */

interface ArticleStats {
  total: number;
  published: number;
  draft: number;
}

interface RecentArticle {
  id: string;
  title: string;
  slug: string;
  status: string;
  updated_at: string;
}

export default function HelpOverviewPage() {
  const navigate = useNavigate();

  const [articleStats, setArticleStats] = useState<ArticleStats>({ total: 0, published: 0, draft: 0 });
  const [categoryCount, setCategoryCount] = useState(0);
  const [audienceCount, setAudienceCount] = useState(0);
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);
  const [draftsToReview, setDraftsToReview] = useState<RecentArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch article stats
      const { data: articles } = await supabase
        .from("help_articles")
        .select("id, title, slug, status, updated_at");

      if (articles) {
        const published = articles.filter(a => a.status === "published").length;
        const draft = articles.filter(a => a.status === "draft").length;
        setArticleStats({ total: articles.length, published, draft });

        // Recent articles
        const sorted = [...articles].sort((a, b) => 
          new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
        );
        setRecentArticles(sorted.slice(0, 5).map(a => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          status: a.status,
          updated_at: a.updated_at || new Date().toISOString(),
        })));

        // Drafts
        setDraftsToReview(
          sorted.filter(a => a.status === "draft").slice(0, 5).map(a => ({
            id: a.id,
            title: a.title,
            slug: a.slug,
            status: a.status,
            updated_at: a.updated_at || new Date().toISOString(),
          }))
        );
      }

      // Category count
      const { count: catCount } = await supabase
        .from("help_categories")
        .select("*", { count: "exact", head: true });
      setCategoryCount(catCount ?? 0);

      // Audience count
      const { count: audCount } = await supabase
        .from("help_audiences")
        .select("*", { count: "exact", head: true });
      setAudienceCount(audCount ?? 0);

      setLoading(false);
    } catch (err) {
      console.error("Error loading stats:", err);
      setError("Unable to load data");
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (debouncedSearch.trim()) {
      navigate(`/help-workstation/articles?search=${encodeURIComponent(debouncedSearch)}`);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8">
      {/* Page Header */}
      <AppPageHeader
        eyebrow="Help Workstation"
        title="Overview"
        description="Manage Help Center content"
        action={
          <AppButton
            intent="secondary"
            size="sm"
            onClick={() => navigate("/help-workstation/articles/new")}
          >
            <Plus className="h-4 w-4" />
            New Article
          </AppButton>
        }
      />

      {/* Error Alert */}
      {error && (
        <div className="mb-6">
          <AppAlert
            variant="error"
            message={error}
            onRetry={loadStats}
          />
        </div>
      )}

      {/* Search */}
      <div className="mb-8 max-w-md">
        <AppSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={handleSearch}
          placeholder="Search articles..."
        />
      </div>

      {/* Stats Cards */}
      <div className="mb-8">
        <AppStatCardGrid columns={4}>
          <AppStatCard
            label="Articles"
            value={articleStats.total}
            subtitle={`${articleStats.published} published, ${articleStats.draft} draft`}
            loading={loading}
            onClick={() => navigate("/help-workstation/articles")}
          />
          <AppStatCard
            label="Categories"
            value={categoryCount}
            loading={loading}
            onClick={() => navigate("/help-workstation/categories")}
          />
          <AppStatCard
            label="Audiences"
            value={audienceCount}
            loading={loading}
            onClick={() => navigate("/help-workstation/audiences")}
          />
          <AppStatCard
            label="Messages"
            value="—"
            loading={loading}
            onClick={() => navigate("/help-workstation/messages")}
          />
        </AppStatCardGrid>
      </div>

      {/* Recent Articles & Drafts */}
      <AppSectionGrid columns={2}>
        {/* Recent Articles */}
        <AppListCard
          title="Recent Articles"
          action={
            <AppListAction onClick={() => navigate("/help-workstation/articles")}>
              View all
            </AppListAction>
          }
        >
          {recentArticles.length === 0 ? (
            <AppEmptyState
              icon="file"
              message="No articles yet"
              size="sm"
            />
          ) : (
            recentArticles.map(article => (
              <AppListRow
                key={article.id}
                title={article.title}
                subtitle={format(new Date(article.updated_at), "MMM d, yyyy")}
                onClick={() => navigate(`/help-workstation/articles/${article.id}`)}
              />
            ))
          )}
        </AppListCard>

        {/* Drafts to Review */}
        <AppListCard title="Drafts to Review">
          {draftsToReview.length === 0 ? (
            <AppEmptyState
              icon="file"
              message="No drafts"
              size="sm"
            />
          ) : (
            draftsToReview.map(article => (
              <AppListRow
                key={article.id}
                title={article.title}
                subtitle={format(new Date(article.updated_at), "MMM d, yyyy")}
                onClick={() => navigate(`/help-workstation/articles/${article.id}`)}
              />
            ))
          )}
        </AppListCard>
      </AppSectionGrid>
    </div>
  );
}

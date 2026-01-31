import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Plus, TrendingUp } from "lucide-react";
import { format } from "date-fns";

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
  view_count?: number;
}

const formatViewCount = (count: number) => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

export default function HelpOverviewPage() {
  const navigate = useNavigate();

  const [articleStats, setArticleStats] = useState<ArticleStats>({ total: 0, published: 0, draft: 0 });
  const [categoryCount, setCategoryCount] = useState(0);
  const [audienceCount, setAudienceCount] = useState(0);
  const [topArticles, setTopArticles] = useState<RecentArticle[]>([]);
  const [draftsToReview, setDraftsToReview] = useState<RecentArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // Top performing articles by view count
        const { data: topData } = await supabase
          .from("help_articles")
          .select("id, title, slug, status, view_count, updated_at")
          .eq("status", "published")
          .order("view_count", { ascending: false })
          .limit(5);

        setTopArticles((topData || []).map(a => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          status: a.status,
          updated_at: a.updated_at || new Date().toISOString(),
          view_count: a.view_count || 0,
        })));

        // Drafts
        const sorted = [...articles].sort((a, b) => 
          new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
        );
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
            onClick={() => navigate("/help/articles/new")}
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


      {/* Stats Cards */}
      <div className="mb-8">
        <AppStatCardGrid columns={3}>
          <AppStatCard
            label="Articles"
            value={articleStats.total}
            subtitle={`${articleStats.published} published, ${articleStats.draft} draft`}
            loading={loading}
            onClick={() => navigate("/help/articles")}
          />
          <AppStatCard
            label="Categories"
            value={categoryCount}
            loading={loading}
            onClick={() => navigate("/help/categories")}
          />
          <AppStatCard
            label="Audiences"
            value={audienceCount}
            loading={loading}
            onClick={() => navigate("/help/audiences")}
          />
        </AppStatCardGrid>
      </div>

      {/* Recent Articles & Drafts */}
      <AppSectionGrid columns={2}>
        {/* Top Performing Articles */}
        <AppListCard
          title="Top Performing Articles"
          className="h-full"
          action={
            <AppListAction onClick={() => navigate("/help/articles")}>
              View all
            </AppListAction>
          }
        >
          {topArticles.length === 0 ? (
            <AppEmptyState
              customIcon={<TrendingUp className="h-5 w-5" />}
              message="No published articles yet"
              size="sm"
            />
          ) : (
            topArticles.map(article => (
              <AppListRow
                key={article.id}
                title={article.title}
                subtitle={`${formatViewCount(article.view_count || 0)} views`}
                onClick={() => navigate(`/help/articles/${article.id}`)}
              />
            ))
          )}
        </AppListCard>

        {/* Drafts to Review */}
        <AppListCard title="Drafts to Review" className="h-full">
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
                onClick={() => navigate(`/help/articles/${article.id}`)}
              />
            ))
          )}
        </AppListCard>
      </AppSectionGrid>
    </div>
  );
}

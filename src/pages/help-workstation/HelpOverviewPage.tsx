import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, ChevronRight, TrendingUp, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppPageHeader } from "@/components/app-ui/AppPageHeader";
import { AppButton } from "@/components/app-ui/AppButton";
import { AppStatCard, AppStatCardGrid } from "@/components/app-ui/AppStatCard";
import { AppListCard, AppListAction, AppListItem } from "@/components/app-ui/AppListCard";
import { AppSectionGrid } from "@/components/app-ui/AppSectionGrid";
import { AppAlert } from "@/components/app-ui/AppAlert";

interface Article {
  id: string;
  title: string;
  status: string;
  view_count: number;
  updated_at: string;
  category?: {
    name: string;
  };
}

export default function HelpOverviewPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Stats
  const [articleStats, setArticleStats] = useState({ total: 0, published: 0, draft: 0 });
  const [categoryCount, setCategoryCount] = useState(0);
  const [audienceCount, setAudienceCount] = useState(0);
  
  // Articles lists
  const [topArticles, setTopArticles] = useState<Article[]>([]);
  const [draftArticles, setDraftArticles] = useState<Article[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Article stats
      const { data: articles, error: articlesError } = await supabase
        .from("help_articles")
        .select("id, status");
      
      if (articlesError) throw articlesError;
      
      const total = articles?.length ?? 0;
      const published = articles?.filter(a => a.status === "published").length ?? 0;
      const draft = articles?.filter(a => a.status === "draft").length ?? 0;
      setArticleStats({ total, published, draft });

      // Category count
      const { count: catCount, error: catError } = await supabase
        .from("help_categories")
        .select("*", { count: "exact", head: true });
      
      if (catError) throw catError;
      setCategoryCount(catCount ?? 0);

      // Audience count
      const { count: audCount, error: audError } = await supabase
        .from("help_audiences")
        .select("*", { count: "exact", head: true });
      
      if (audError) throw audError;
      setAudienceCount(audCount ?? 0);

      // Top performing articles (by view count)
      const { data: topData, error: topError } = await supabase
        .from("help_articles")
        .select(`
          id,
          title,
          status,
          view_count,
          updated_at,
          category:help_categories(name)
        `)
        .eq("status", "published")
        .order("view_count", { ascending: false })
        .limit(5);
      
      if (topError) throw topError;
      setTopArticles(topData ?? []);

      // Draft articles for review
      const { data: draftData, error: draftError } = await supabase
        .from("help_articles")
        .select(`
          id,
          title,
          status,
          view_count,
          updated_at
        `)
        .eq("status", "draft")
        .order("updated_at", { ascending: false })
        .limit(5);
      
      if (draftError) throw draftError;
      setDraftArticles(draftData ?? []);

      setLoading(false);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Unable to load data");
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
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
      {error && (
        <div className="mb-6">
          <AppAlert
            variant="error"
            message={error}
            onRetry={loadData}
          />
        </div>
      )}

      {/* Stats Cards - 3 columns now */}
      <div className="mb-8">
        <AppStatCardGrid columns={3}>
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
        </AppStatCardGrid>
      </div>

      {/* Top Articles & Drafts */}
      <AppSectionGrid columns={2}>
        {/* Top Performing Articles */}
        <AppListCard
          title="Top Performing Articles"
          action={
            <AppListAction onClick={() => navigate("/help-workstation/articles")}>
              View all
            </AppListAction>
          }
        >
          {topArticles.length === 0 ? (
            <div className="py-8 text-center">
              <TrendingUp className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" strokeWidth={1} />
              <p className="text-[13px] text-muted-foreground">No published articles yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {topArticles.map((article) => (
                <AppListItem
                  key={article.id}
                  onClick={() => navigate(`/help-workstation/articles/${article.id}/edit`)}
                >
                  <div className="flex items-start justify-between gap-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-foreground truncate">
                        {article.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[12px] text-muted-foreground flex items-center gap-1">
                          <Eye className="h-3 w-3" strokeWidth={1.5} />
                          {formatViewCount(article.view_count || 0)} views
                        </span>
                        {article.category?.name && (
                          <>
                            <span className="text-muted-foreground/50">·</span>
                            <span className="text-[12px] text-muted-foreground">
                              {article.category.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5" strokeWidth={1.5} />
                  </div>
                </AppListItem>
              ))}
            </div>
          )}
        </AppListCard>

        {/* Drafts to Review */}
        <AppListCard
          title="Drafts to Review"
          action={
            <AppListAction onClick={() => navigate("/help-workstation/articles?status=draft")}>
              View all
            </AppListAction>
          }
        >
          {draftArticles.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" strokeWidth={1} />
              <p className="text-[13px] text-muted-foreground">No drafts</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {draftArticles.map((article) => (
                <AppListItem
                  key={article.id}
                  onClick={() => navigate(`/help-workstation/articles/${article.id}/edit`)}
                >
                  <div className="flex items-start justify-between gap-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-foreground truncate">
                        {article.title}
                      </p>
                      <p className="text-[12px] text-muted-foreground mt-1">
                        Updated {formatDate(article.updated_at)}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5" strokeWidth={1.5} />
                  </div>
                </AppListItem>
              ))}
            </div>
          )}
        </AppListCard>
      </AppSectionGrid>
    </div>
  );
}

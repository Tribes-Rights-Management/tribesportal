import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { 
  AppCard, 
  AppCardHeader, 
  AppCardTitle, 
  AppCardBody,
  AppButton,
  AppChip
} from "@/components/app-ui";
import { 
  FileText, 
  FolderOpen, 
  MessageSquare, 
  TrendingUp,
  Plus,
  Search,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";

/**
 * HELP WORKSTATION OVERVIEW — DASHBOARD
 * 
 * Quick stats and actions for Help content management.
 * Shows drafts needing review, recent articles, messages, analytics snapshot.
 */

interface ArticleStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
}

interface MessageStats {
  total: number;
  newCount: number;
  open: number;
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
  const [articleStats, setArticleStats] = useState<ArticleStats>({ 
    total: 0, published: 0, draft: 0, archived: 0 
  });
  const [messageStats, setMessageStats] = useState<MessageStats>({ 
    total: 0, newCount: 0, open: 0 
  });
  const [categoryCount, setCategoryCount] = useState(0);
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);
  const [draftsToReview, setDraftsToReview] = useState<RecentArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      
      // Fetch article stats from help_articles table
      const { data: articles, error: articlesError } = await supabase
        .from("help_articles")
        .select("id, status, updated_at, current_version_id");
      
      if (!articlesError && articles) {
        const published = articles.filter(a => a.status === "published").length;
        const draft = articles.filter(a => a.status === "draft").length;
        const archived = articles.filter(a => a.status === "archived").length;
        setArticleStats({
          total: articles.length,
          published,
          draft,
          archived,
        });
      }
      
      // Fetch category count
      const { count: catCount } = await supabase
        .from("help_categories")
        .select("*", { count: "exact", head: true });
      
      setCategoryCount(catCount ?? 0);
      
      // Fetch messages stats
      const { data: messages } = await supabase
        .from("messages")
        .select("id, status");
      
      if (messages) {
        setMessageStats({
          total: messages.length,
          newCount: messages.filter(m => m.status === "new" || !m.status).length,
          open: messages.filter(m => m.status === "open").length,
        });
      }
      
      // Fetch recent articles with versions
      const { data: recentData } = await supabase
        .from("help_articles")
        .select(`
          id, 
          slug, 
          status, 
          updated_at,
          current_version_id
        `)
        .order("updated_at", { ascending: false })
        .limit(5);
      
      if (recentData) {
        // Fetch version titles
        const versionIds = recentData.map(a => a.current_version_id).filter(Boolean);
        let titlesMap: Record<string, string> = {};
        
        if (versionIds.length > 0) {
          const { data: versions } = await supabase
            .from("help_article_versions")
            .select("id, title")
            .in("id", versionIds);
          
          if (versions) {
            titlesMap = versions.reduce((acc, v) => {
              acc[v.id] = v.title;
              return acc;
            }, {} as Record<string, string>);
          }
        }
        
        setRecentArticles(recentData.map(a => ({
          id: a.id,
          title: a.current_version_id ? titlesMap[a.current_version_id] || "Untitled" : "Untitled",
          slug: a.slug,
          status: a.status,
          updated_at: a.updated_at,
        })));
      }
      
      // Fetch drafts needing review
      const { data: draftsData } = await supabase
        .from("help_articles")
        .select(`
          id, 
          slug, 
          status, 
          updated_at,
          current_version_id
        `)
        .eq("status", "draft")
        .order("updated_at", { ascending: false })
        .limit(5);
      
      if (draftsData) {
        const versionIds = draftsData.map(a => a.current_version_id).filter(Boolean);
        let titlesMap: Record<string, string> = {};
        
        if (versionIds.length > 0) {
          const { data: versions } = await supabase
            .from("help_article_versions")
            .select("id, title")
            .in("id", versionIds);
          
          if (versions) {
            titlesMap = versions.reduce((acc, v) => {
              acc[v.id] = v.title;
              return acc;
            }, {} as Record<string, string>);
          }
        }
        
        setDraftsToReview(draftsData.map(a => ({
          id: a.id,
          title: a.current_version_id ? titlesMap[a.current_version_id] || "Untitled" : "Untitled",
          slug: a.slug,
          status: a.status,
          updated_at: a.updated_at,
        })));
      }
      
      setLoading(false);
    }
    
    loadStats();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/help-workstation/articles?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getStatusChipStatus = (status: string) => {
    switch (status) {
      case "published": return "pass";
      case "draft": return "pending";
      case "archived": return "fail";
      default: return "pending";
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Help Workstation"
        description="Manage articles, categories, and support content"
      />
      
      {/* Global Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-xl">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" 
            style={{ color: 'var(--muted-foreground)' }} 
          />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full pl-10 pr-4 text-[14px] rounded-lg transition-colors duration-100 focus:outline-none"
            style={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))',
            }}
          />
        </div>
      </form>
      
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AppCard>
            <AppCardHeader>
              <AppCardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Articles
              </AppCardTitle>
            </AppCardHeader>
            <AppCardBody className="pt-0">
              <div className="text-2xl font-bold">{articleStats.total}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {articleStats.published} published · {articleStats.draft} draft
              </div>
            </AppCardBody>
          </AppCard>
          
          <AppCard>
            <AppCardHeader>
              <AppCardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Categories
              </AppCardTitle>
            </AppCardHeader>
            <AppCardBody className="pt-0">
              <div className="text-2xl font-bold">{categoryCount}</div>
            </AppCardBody>
          </AppCard>
          
          <AppCard>
            <AppCardHeader>
              <AppCardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Messages
              </AppCardTitle>
            </AppCardHeader>
            <AppCardBody className="pt-0">
              <div className="text-2xl font-bold">{messageStats.total}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {messageStats.newCount} new · {messageStats.open} open
              </div>
            </AppCardBody>
          </AppCard>
          
          <AppCard>
            <AppCardHeader>
              <AppCardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Analytics
              </AppCardTitle>
            </AppCardHeader>
            <AppCardBody className="pt-0">
              <p className="text-xs text-muted-foreground">
                View search trends and article performance
              </p>
              <AppButton 
                intent="tertiary" 
                size="sm" 
                className="mt-2"
                onClick={() => navigate("/help-workstation/analytics")}
              >
                View Analytics
              </AppButton>
            </AppCardBody>
          </AppCard>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <AppButton 
            intent="primary"
            onClick={() => navigate("/help-workstation/articles/new")}
            icon={<Plus className="h-4 w-4" />}
          >
            New Article
          </AppButton>
          <AppButton 
            intent="secondary"
            onClick={() => navigate("/help-workstation/categories")}
          >
            Manage Categories
          </AppButton>
          <AppButton 
            intent="secondary"
            onClick={() => navigate("/help-workstation/messages")}
          >
            View Messages
          </AppButton>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Drafts Needing Review */}
          <AppCard>
            <AppCardHeader className="flex flex-row items-center justify-between">
              <AppCardTitle>Drafts to Review</AppCardTitle>
              <AppButton 
                intent="ghost" 
                size="sm"
                onClick={() => navigate("/help-workstation/articles?status=draft")}
              >
                View all
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </AppButton>
            </AppCardHeader>
            <AppCardBody>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : draftsToReview.length === 0 ? (
                <p className="text-sm text-muted-foreground">No drafts pending review</p>
              ) : (
                <div className="space-y-3">
                  {draftsToReview.map((article) => (
                    <div 
                      key={article.id}
                      className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded transition-colors"
                      onClick={() => navigate(`/help-workstation/articles/${article.id}`)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{article.title}</div>
                        <div className="text-xs text-muted-foreground">
                          Updated {format(new Date(article.updated_at), "MMM d, yyyy")}
                        </div>
                      </div>
                      <AppChip status="pending" label="Draft" />
                    </div>
                  ))}
                </div>
              )}
            </AppCardBody>
          </AppCard>
          
          {/* Recent Articles */}
          <AppCard>
            <AppCardHeader className="flex flex-row items-center justify-between">
              <AppCardTitle>Recent Articles</AppCardTitle>
              <AppButton 
                intent="ghost" 
                size="sm"
                onClick={() => navigate("/help-workstation/articles")}
              >
                View all
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </AppButton>
            </AppCardHeader>
            <AppCardBody>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : recentArticles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No articles yet</p>
              ) : (
                <div className="space-y-3">
                  {recentArticles.map((article) => (
                    <div 
                      key={article.id}
                      className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded transition-colors"
                      onClick={() => navigate(`/help-workstation/articles/${article.id}`)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{article.title}</div>
                        <div className="text-xs text-muted-foreground">/{article.slug}</div>
                      </div>
                      <AppChip 
                        status={getStatusChipStatus(article.status)} 
                        label={article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </AppCardBody>
          </AppCard>
        </div>
        
        {/* Footer */}
        <div className="text-xs text-muted-foreground text-center py-4 border-t">
          Help Workstation · Company-level content management
        </div>
      </div>
    </PageContainer>
  );
}

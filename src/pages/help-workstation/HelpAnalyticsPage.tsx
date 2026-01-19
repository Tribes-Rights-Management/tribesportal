import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageContainer } from "@/components/ui/page-container";
import { 
  AppCard, 
  AppCardHeader, 
  AppCardTitle, 
  AppCardBody,
  AppSectionHeader,
  AppButton,
} from "@/components/app-ui";
import { InstitutionalLoadingState } from "@/components/ui/institutional-states";
import { Search, FileText, ThumbsUp, TrendingUp, BarChart3, AlertCircle } from "lucide-react";

/**
 * HELP ANALYTICS PAGE — HELP WORKSTATION
 * 
 * Analytics dashboard showing:
 * - Top searched queries
 * - Most viewed articles
 * - Feedback ratios
 * - Message volume trends
 * 
 * MVP: Shows available data or intentional empty states if not instrumented.
 */

interface SearchStat {
  query: string;
  count: number;
}

interface ArticleStat {
  id: string;
  title: string;
  slug: string;
  view_count: number;
  helpful_ratio: number;
}

type DateRange = "7" | "30" | "90";

export default function HelpAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>("30");
  const [topSearches, setTopSearches] = useState<SearchStat[]>([]);
  const [topArticles, setTopArticles] = useState<ArticleStat[]>([]);
  const [messageVolume, setMessageVolume] = useState({ total: 0, resolved: 0 });
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    
    // Calculate date range
    const daysAgo = parseInt(dateRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    
    // Fetch top searches from searches table
    const { data: searchesData, error: searchesError } = await supabase
      .from("searches")
      .select("query")
      .gte("created_at", startDate.toISOString());
    
    if (!searchesError && searchesData && searchesData.length > 0) {
      // Aggregate search queries
      const queryCount: Record<string, number> = {};
      searchesData.forEach(s => {
        if (s.query) {
          const q = s.query.toLowerCase().trim();
          queryCount[q] = (queryCount[q] || 0) + 1;
        }
      });
      
      const sortedSearches = Object.entries(queryCount)
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      setTopSearches(sortedSearches);
      if (sortedSearches.length > 0) setHasData(true);
    } else {
      setTopSearches([]);
    }
    
    // Fetch top articles from articles table (has view_count)
    const { data: articlesData, error: articlesError } = await supabase
      .from("articles")
      .select("id, title, slug, view_count, helpful_count, not_helpful_count")
      .order("view_count", { ascending: false })
      .limit(10);
    
    if (!articlesError && articlesData && articlesData.length > 0) {
      const mapped = articlesData.map(a => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        view_count: a.view_count || 0,
        helpful_ratio: a.helpful_count && a.not_helpful_count 
          ? Math.round((a.helpful_count / (a.helpful_count + a.not_helpful_count)) * 100)
          : 0,
      }));
      setTopArticles(mapped);
      if (mapped.some(a => a.view_count > 0)) setHasData(true);
    } else {
      setTopArticles([]);
    }
    
    // Fetch message volume
    const { data: messagesData, error: messagesError } = await supabase
      .from("messages")
      .select("id, status, created_at")
      .gte("created_at", startDate.toISOString());
    
    if (!messagesError && messagesData) {
      setMessageVolume({
        total: messagesData.length,
        resolved: messagesData.filter(m => m.status === "resolved").length,
      });
      if (messagesData.length > 0) setHasData(true);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <PageContainer>
        <InstitutionalLoadingState message="Loading analytics" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <AppSectionHeader
        title="Analytics"
        subtitle="Help content performance and trends"
        actions={
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="h-10 px-3 text-sm rounded-lg appearance-none cursor-pointer transition-colors duration-100 focus:outline-none"
            style={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))',
            }}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        }
      />

      {!hasData ? (
        /* Empty State */
        <AppCard>
          <AppCardBody className="py-12 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No analytics data yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Analytics data will appear here once users start searching and viewing Help articles.
              Make sure tracking is enabled in Settings.
            </p>
          </AppCardBody>
        </AppCard>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AppCard>
              <AppCardHeader>
                <AppCardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Total Searches
                </AppCardTitle>
              </AppCardHeader>
              <AppCardBody className="pt-0">
                <div className="text-2xl font-bold">
                  {topSearches.reduce((sum, s) => sum + s.count, 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last {dateRange} days
                </p>
              </AppCardBody>
            </AppCard>
            
            <AppCard>
              <AppCardHeader>
                <AppCardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Article Views
                </AppCardTitle>
              </AppCardHeader>
              <AppCardBody className="pt-0">
                <div className="text-2xl font-bold">
                  {topArticles.reduce((sum, a) => sum + a.view_count, 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  All time
                </p>
              </AppCardBody>
            </AppCard>
            
            <AppCard>
              <AppCardHeader>
                <AppCardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  Messages
                </AppCardTitle>
              </AppCardHeader>
              <AppCardBody className="pt-0">
                <div className="text-2xl font-bold">{messageVolume.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {messageVolume.resolved} resolved
                </p>
              </AppCardBody>
            </AppCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Searches */}
            <AppCard>
              <AppCardHeader>
                <AppCardTitle>Top Search Queries</AppCardTitle>
              </AppCardHeader>
              <AppCardBody>
                {topSearches.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No search data available</p>
                ) : (
                  <div className="space-y-3">
                    {topSearches.map((item, index) => (
                      <div 
                        key={item.query}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-sm text-muted-foreground w-5">{index + 1}.</span>
                          <span className="text-sm truncate">"{item.query}"</span>
                        </div>
                        <span className="text-sm font-medium tabular-nums">{item.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </AppCardBody>
            </AppCard>
            
            {/* Top Articles */}
            <AppCard>
              <AppCardHeader>
                <AppCardTitle>Most Viewed Articles</AppCardTitle>
              </AppCardHeader>
              <AppCardBody>
                {topArticles.filter(a => a.view_count > 0).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No view data available</p>
                ) : (
                  <div className="space-y-3">
                    {topArticles.filter(a => a.view_count > 0).map((article, index) => (
                      <div 
                        key={article.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-sm text-muted-foreground w-5">{index + 1}.</span>
                          <span className="text-sm truncate">{article.title}</span>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-sm font-medium tabular-nums">{article.view_count} views</span>
                          {article.helpful_ratio > 0 && (
                            <span className="text-xs text-muted-foreground">{article.helpful_ratio}% helpful</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AppCardBody>
            </AppCard>
          </div>

          {/* Instrumentation Notice */}
          <div 
            className="flex items-start gap-3 p-4 rounded-lg"
            style={{
              backgroundColor: 'hsl(var(--muted) / 0.3)',
              border: '1px solid hsl(var(--border))',
            }}
          >
            <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Analytics data collection</p>
              <p className="text-xs text-muted-foreground mt-1">
                Search queries and article views are tracked when users interact with the public Help Center.
                Ensure the Help Center is properly instrumented to capture complete analytics.
              </p>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

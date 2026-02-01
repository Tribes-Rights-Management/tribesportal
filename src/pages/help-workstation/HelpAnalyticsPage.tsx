import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw } from "lucide-react";
import {
  AppPageHeader,
  AppPageContainer,
  AppStatCard,
  AppStatCardGrid,
  AppCard,
  AppCardHeader,
  AppCardTitle,
  AppCardBody,
  AppListRow,
  AppEmptyState,
  AppAlert,
  AppSection,
} from "@/components/app-ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * HELP ANALYTICS PAGE — DESIGN SYSTEM COMPLIANT
 * 
 * Uses canonical app-ui components for consistency.
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
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>("30");
  const [topSearches, setTopSearches] = useState<SearchStat[]>([]);
  const [topArticles, setTopArticles] = useState<ArticleStat[]>([]);
  const [messageVolume, setMessageVolume] = useState({ total: 0, resolved: 0 });
  const [hasData, setHasData] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const daysAgo = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      
      // Fetch top searches (from searches table if exists)
      const { data: searchesData } = await supabase
        .from("messages")
        .select("search_query")
        .not("search_query", "is", null)
        .gte("created_at", startDate.toISOString());
      
      if (searchesData && searchesData.length > 0) {
        const queryCount: Record<string, number> = {};
        searchesData.forEach(s => {
          if (s.search_query) {
            const q = s.search_query.toLowerCase().trim();
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
      
      // Fetch top articles
      const { data: articlesData } = await supabase
        .from("articles")
        .select("id, title, slug, view_count, helpful_count, not_helpful_count")
        .order("view_count", { ascending: false })
        .limit(10);
      
      if (articlesData && articlesData.length > 0) {
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
      const { data: messagesData } = await supabase
        .from("messages")
        .select("id, status, created_at")
        .gte("created_at", startDate.toISOString());
      
      if (messagesData) {
        setMessageVolume({
          total: messagesData.length,
          resolved: messagesData.filter(m => m.status === "resolved").length,
        });
        if (messagesData.length > 0) setHasData(true);
      }
      
      setLoading(false);
    } catch (err) {
      setError("Unable to load analytics");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const totalSearches = topSearches.reduce((sum, s) => sum + s.count, 0);
  const totalViews = topArticles.reduce((sum, a) => sum + a.view_count, 0);

  return (
    <AppPageContainer maxWidth="xl">
      {/* Header */}
      <AppPageHeader
        backLink={{ to: "/help", label: "Overview" }}
        title="Analytics"
        action={
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
            <SelectTrigger className="h-10 w-full sm:w-[140px] px-3 text-[14px] bg-card border border-border rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {/* Error */}
      {error && (
        <div className="mb-6">
          <AppAlert
            variant="error"
            message={error}
            onRetry={fetchAnalytics}
          />
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center">
          <p className="text-[13px] text-muted-foreground">Loading analytics...</p>
        </div>
      ) : !hasData ? (
        <AppCard>
          <AppCardBody className="py-16">
            <AppEmptyState
              icon="search"
              message="No analytics data yet"
              description="Analytics data will appear here once users start searching and viewing Help articles."
            />
          </AppCardBody>
        </AppCard>
      ) : (
        <>
          {/* Summary Stats */}
          <AppSection spacing="md">
            <AppStatCardGrid columns={3}>
              <AppStatCard
                label="Total Searches"
                value={totalSearches}
                subtitle={`Last ${dateRange} days`}
              />
              <AppStatCard
                label="Article Views"
                value={totalViews}
                subtitle="All time"
              />
              <AppStatCard
                label="Messages"
                value={messageVolume.total}
                subtitle={`${messageVolume.resolved} resolved`}
              />
            </AppStatCardGrid>
          </AppSection>

          {/* Top Searches & Articles */}
          <AppSection spacing="md">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Top Searches */}
              <AppCard>
                <AppCardHeader>
                  <AppCardTitle>Top Search Queries</AppCardTitle>
                </AppCardHeader>
                <AppCardBody className="p-0">
                  {topSearches.length === 0 ? (
                    <div className="py-6 px-4">
                      <p className="text-[12px] text-muted-foreground text-center">No search data available</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/40">
                      {topSearches.map((item, index) => (
                        <AppListRow
                          key={item.query}
                          title={`${index + 1}. "${item.query}"`}
                          value={<span className="font-medium tabular-nums">{item.count}</span>}
                        />
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
                <AppCardBody className="p-0">
                  {topArticles.filter(a => a.view_count > 0).length === 0 ? (
                    <div className="py-6 px-4">
                      <p className="text-[12px] text-muted-foreground text-center">No view data available</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/40">
                      {topArticles.filter(a => a.view_count > 0).map((article, index) => (
                        <AppListRow
                          key={article.id}
                          title={`${index + 1}. ${article.title}`}
                          value={
                            <div className="flex items-center gap-3">
                              <span className="font-medium tabular-nums">{article.view_count}</span>
                              {article.helpful_ratio > 0 && (
                                <span className="text-[11px] text-muted-foreground">{article.helpful_ratio}%</span>
                              )}
                            </div>
                          }
                        />
                      ))}
                    </div>
                  )}
                </AppCardBody>
              </AppCard>
            </div>
          </AppSection>

          {/* Note */}
          <AppSection spacing="none">
            <AppAlert
              variant="info"
              message="Search queries and article views are tracked when users interact with the public Help Center."
            />
          </AppSection>
        </>
      )}
    </AppPageContainer>
  );
}

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, RefreshCw, ChevronDown } from "lucide-react";

/**
 * HELP ANALYTICS PAGE — INSTITUTIONAL DESIGN
 * 
 * No decorative icons
 * Text-only empty states
 * Inline errors
 * All icons: strokeWidth={1.5}
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
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
            HELP WORKSTATION
          </p>
          <h1 className="text-[20px] font-medium text-foreground mb-1">Analytics</h1>
          <p className="text-[13px] text-muted-foreground">Help content performance and trends</p>
        </div>
        
        <div className="relative">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="h-9 pl-3 pr-8 bg-transparent border-0 border-b border-border text-[12px] text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" strokeWidth={1.5} />
        </div>
      </div>

      {/* Inline Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-destructive/10 border-l-2 border-destructive rounded-r">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-[12px] text-foreground">{error}</p>
            <button 
              onClick={fetchAnalytics} 
              className="text-[11px] text-destructive hover:text-destructive/80 underline mt-1 flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
              Try again
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center">
          <p className="text-[13px] text-muted-foreground">Loading analytics...</p>
        </div>
      ) : !hasData ? (
        <div className="bg-card border border-border rounded py-16 text-center">
          <p className="text-[14px] text-muted-foreground mb-2">No analytics data yet</p>
          <p className="text-[12px] text-muted-foreground max-w-md mx-auto">
            Analytics data will appear here once users start searching and viewing Help articles.
            Make sure tracking is enabled in Settings.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Total Searches</p>
              <p className="text-[28px] font-medium text-foreground tabular-nums">{totalSearches}</p>
              <p className="text-[11px] text-muted-foreground mt-1.5">Last {dateRange} days</p>
            </div>
            
            <div className="bg-card border border-border rounded p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Article Views</p>
              <p className="text-[28px] font-medium text-foreground tabular-nums">{totalViews}</p>
              <p className="text-[11px] text-muted-foreground mt-1.5">All time</p>
            </div>
            
            <div className="bg-card border border-border rounded p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Messages</p>
              <p className="text-[28px] font-medium text-foreground tabular-nums">{messageVolume.total}</p>
              <p className="text-[11px] text-muted-foreground mt-1.5">{messageVolume.resolved} resolved</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Searches */}
            <div className="bg-card border border-border rounded p-5">
              <h3 className="text-[15px] font-medium text-foreground mb-4">Top Search Queries</h3>
              
              {topSearches.length === 0 ? (
                <p className="text-[12px] text-muted-foreground py-6 text-center">No search data available</p>
              ) : (
                <div className="space-y-0">
                  {topSearches.map((item, index) => (
                    <div 
                      key={item.query}
                      className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[12px] w-5 text-muted-foreground">{index + 1}.</span>
                        <span className="text-[13px] text-muted-foreground truncate">"{item.query}"</span>
                      </div>
                      <span className="text-[13px] font-medium text-foreground tabular-nums">{item.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Top Articles */}
            <div className="bg-card border border-border rounded p-5">
              <h3 className="text-[15px] font-medium text-foreground mb-4">Most Viewed Articles</h3>
              
              {topArticles.filter(a => a.view_count > 0).length === 0 ? (
                <p className="text-[12px] text-muted-foreground py-6 text-center">No view data available</p>
              ) : (
                <div className="space-y-0">
                  {topArticles.filter(a => a.view_count > 0).map((article, index) => (
                    <div 
                      key={article.id}
                      className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-[12px] w-5 text-muted-foreground">{index + 1}.</span>
                        <span className="text-[13px] text-muted-foreground truncate">{article.title}</span>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-[13px] font-medium text-foreground tabular-nums">{article.view_count}</span>
                        {article.helpful_ratio > 0 && (
                          <span className="text-[11px] text-muted-foreground">{article.helpful_ratio}%</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Note */}
          <div className="p-4 bg-muted border border-border rounded">
            <p className="text-[13px] text-muted-foreground font-medium">Analytics data collection</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Search queries and article views are tracked when users interact with the public Help Center.
              Ensure the Help Center is properly instrumented to capture complete analytics.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

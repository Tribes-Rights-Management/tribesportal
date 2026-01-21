import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * HELP ANALYTICS PAGE — INSTITUTIONAL DESIGN
 * 
 * Analytics dashboard showing:
 * - NO decorative icons (search, chart, etc.)
 * - Text-only empty states
 * - Sharp corners (rounded-md)
 * - Dense, data-focused layout
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
    
    const daysAgo = parseInt(dateRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    
    // Fetch top searches
    const { data: searchesData, error: searchesError } = await supabase
      .from("searches")
      .select("query")
      .gte("created_at", startDate.toISOString());
    
    if (!searchesError && searchesData && searchesData.length > 0) {
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
    
    // Fetch top articles
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

  const totalSearches = topSearches.reduce((sum, s) => sum + s.count, 0);
  const totalViews = topArticles.reduce((sum, a) => sum + a.view_count, 0);

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p 
            className="text-[10px] uppercase tracking-wider font-medium mb-1"
            style={{ color: '#6B6B6B' }}
          >
            Help Workstation
          </p>
          <h1 
            className="text-[20px] font-medium leading-tight"
            style={{ color: 'var(--platform-text)' }}
          >
            Analytics
          </h1>
          <p 
            className="text-[13px] mt-1"
            style={{ color: '#AAAAAA' }}
          >
            Help content performance and trends
          </p>
        </div>
        
        {/* Date Range Selector */}
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as DateRange)}
          className="h-9 px-3 text-[13px] rounded-md appearance-none cursor-pointer transition-colors duration-100 focus:outline-none"
          style={{
            backgroundColor: '#1A1A1A',
            border: '1px solid #303030',
            color: 'white',
          }}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <p className="text-[13px]" style={{ color: '#6B6B6B' }}>Loading analytics...</p>
        </div>
      ) : !hasData ? (
        /* Empty State - No icons */
        <div 
          className="rounded-md py-16 text-center"
          style={{ 
            backgroundColor: '#1A1A1A',
            border: '1px solid #303030'
          }}
        >
          <p 
            className="text-[14px] mb-2"
            style={{ color: '#8F8F8F' }}
          >
            No analytics data yet
          </p>
          <p 
            className="text-[12px] max-w-md mx-auto"
            style={{ color: '#6B6B6B' }}
          >
            Analytics data will appear here once users start searching and viewing Help articles.
            Make sure tracking is enabled in Settings.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div 
              className="rounded-md p-4"
              style={{ 
                backgroundColor: '#1A1A1A',
                border: '1px solid #303030'
              }}
            >
              <p 
                className="text-[10px] uppercase tracking-wider font-medium mb-1.5"
                style={{ color: '#6B6B6B' }}
              >
                Total Searches
              </p>
              <p 
                className="text-[28px] font-medium tabular-nums leading-none"
                style={{ color: 'white' }}
              >
                {totalSearches}
              </p>
              <p 
                className="text-[11px] mt-1.5"
                style={{ color: '#8F8F8F' }}
              >
                Last {dateRange} days
              </p>
            </div>
            
            <div 
              className="rounded-md p-4"
              style={{ 
                backgroundColor: '#1A1A1A',
                border: '1px solid #303030'
              }}
            >
              <p 
                className="text-[10px] uppercase tracking-wider font-medium mb-1.5"
                style={{ color: '#6B6B6B' }}
              >
                Article Views
              </p>
              <p 
                className="text-[28px] font-medium tabular-nums leading-none"
                style={{ color: 'white' }}
              >
                {totalViews}
              </p>
              <p 
                className="text-[11px] mt-1.5"
                style={{ color: '#8F8F8F' }}
              >
                All time
              </p>
            </div>
            
            <div 
              className="rounded-md p-4"
              style={{ 
                backgroundColor: '#1A1A1A',
                border: '1px solid #303030'
              }}
            >
              <p 
                className="text-[10px] uppercase tracking-wider font-medium mb-1.5"
                style={{ color: '#6B6B6B' }}
              >
                Messages
              </p>
              <p 
                className="text-[28px] font-medium tabular-nums leading-none"
                style={{ color: 'white' }}
              >
                {messageVolume.total}
              </p>
              <p 
                className="text-[11px] mt-1.5"
                style={{ color: '#8F8F8F' }}
              >
                {messageVolume.resolved} resolved
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Top Searches */}
            <div 
              className="rounded-md p-5"
              style={{ 
                backgroundColor: '#1A1A1A',
                border: '1px solid #303030'
              }}
            >
              <h3 
                className="text-[14px] font-medium mb-4"
                style={{ color: 'white' }}
              >
                Top Search Queries
              </h3>
              
              {topSearches.length === 0 ? (
                <p className="text-[12px] py-6 text-center" style={{ color: '#6B6B6B' }}>
                  No search data available
                </p>
              ) : (
                <div className="space-y-0">
                  {topSearches.map((item, index) => (
                    <div 
                      key={item.query}
                      className="flex items-center justify-between py-2"
                      style={{ 
                        borderBottom: index < topSearches.length - 1 ? '1px solid rgba(48,48,48,0.5)' : 'none'
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[12px] w-5" style={{ color: '#6B6B6B' }}>{index + 1}.</span>
                        <span className="text-[13px] truncate" style={{ color: '#AAAAAA' }}>"{item.query}"</span>
                      </div>
                      <span className="text-[13px] font-medium tabular-nums" style={{ color: 'white' }}>{item.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Top Articles */}
            <div 
              className="rounded-md p-5"
              style={{ 
                backgroundColor: '#1A1A1A',
                border: '1px solid #303030'
              }}
            >
              <h3 
                className="text-[14px] font-medium mb-4"
                style={{ color: 'white' }}
              >
                Most Viewed Articles
              </h3>
              
              {topArticles.filter(a => a.view_count > 0).length === 0 ? (
                <p className="text-[12px] py-6 text-center" style={{ color: '#6B6B6B' }}>
                  No view data available
                </p>
              ) : (
                <div className="space-y-0">
                  {topArticles.filter(a => a.view_count > 0).map((article, index) => (
                    <div 
                      key={article.id}
                      className="flex items-center justify-between py-2"
                      style={{ 
                        borderBottom: index < topArticles.filter(a => a.view_count > 0).length - 1 ? '1px solid rgba(48,48,48,0.5)' : 'none'
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-[12px] w-5" style={{ color: '#6B6B6B' }}>{index + 1}.</span>
                        <span className="text-[13px] truncate" style={{ color: '#AAAAAA' }}>{article.title}</span>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-[13px] font-medium tabular-nums" style={{ color: 'white' }}>{article.view_count}</span>
                        {article.helpful_ratio > 0 && (
                          <span className="text-[11px]" style={{ color: '#6B6B6B' }}>{article.helpful_ratio}%</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Note - No icon */}
          <div 
            className="p-4 rounded-md"
            style={{
              backgroundColor: '#141414',
              border: '1px solid #303030',
            }}
          >
            <p className="text-[13px] font-medium" style={{ color: '#AAAAAA' }}>
              Analytics data collection
            </p>
            <p className="text-[11px] mt-1" style={{ color: '#6B6B6B' }}>
              Search queries and article views are tracked when users interact with the public Help Center.
              Ensure the Help Center is properly instrumented to capture complete analytics.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

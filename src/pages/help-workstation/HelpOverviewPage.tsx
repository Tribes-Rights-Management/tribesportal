import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AppChip } from "@/components/app-ui";
import { 
  Plus,
  Search,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";

/**
 * HELP WORKSTATION OVERVIEW — INSTITUTIONAL DASHBOARD
 * 
 * Dense, data-focused dashboard with:
 * - Sharp corners (rounded-md max)
 * - Tight spacing (p-4, gap-3)
 * - Smaller typography (10-28px scale)
 * - High information density
 * - Bloomberg Terminal aesthetic
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
  const [tagCount, setTagCount] = useState(0);
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
      
      // Fetch tag count (aggregate unique tags from articles)
      const { data: allArticles } = await supabase
        .from("help_articles")
        .select("tags");
      
      const uniqueTags = new Set<string>();
      allArticles?.forEach(article => {
        if (article.tags && Array.isArray(article.tags)) {
          article.tags.forEach((tag: string) => uniqueTags.add(tag.toLowerCase().trim()));
        }
      });
      setTagCount(uniqueTags.size);
      
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
    <div className="p-6 max-w-5xl">
      {/* Header - Tighter spacing */}
      <div className="mb-6">
        <p 
          className="text-[10px] uppercase tracking-wider font-medium mb-1"
          style={{ color: '#6B6B6B' }}
        >
          Help Workstation
        </p>
        <h1 
          className="text-[22px] font-medium leading-tight"
          style={{ color: 'var(--platform-text)' }}
        >
          Overview
        </h1>
        <p 
          className="text-[13px] mt-1"
          style={{ color: '#AAAAAA' }}
        >
          Manage articles, categories, and support content
        </p>
      </div>
      
      {/* Search Bar - Compact, sharp corners */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-2xl">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" 
            strokeWidth={1.5}
            style={{ color: '#6B6B6B' }} 
          />
          <input
            type="search"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full pl-10 pr-4 text-[13px] rounded-md transition-colors duration-100 focus:outline-none"
            style={{
              backgroundColor: '#1A1A1A',
              border: '1px solid #303030',
              color: 'white',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#505050'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#303030'}
          />
        </div>
      </form>
      
      <div className="space-y-6">
        {/* Stats Cards - Dense, sharp corners, smaller numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Articles Card */}
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
              Articles
            </p>
            <p 
              className="text-[28px] font-medium tabular-nums leading-none mb-1.5"
              style={{ color: 'white' }}
            >
              {articleStats.total}
            </p>
            <p 
              className="text-[11px]"
              style={{ color: '#8F8F8F' }}
            >
              {articleStats.published} published · {articleStats.draft} draft
            </p>
          </div>
          
          {/* Categories Card */}
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
              Categories
            </p>
            <p 
              className="text-[28px] font-medium tabular-nums leading-none"
              style={{ color: 'white' }}
            >
              {categoryCount}
            </p>
          </div>
          
          {/* Tags Card */}
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
              Tags
            </p>
            <p 
              className="text-[28px] font-medium tabular-nums leading-none"
              style={{ color: 'white' }}
            >
              {tagCount}
            </p>
          </div>
          
          {/* Messages Card */}
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
              className="text-[28px] font-medium tabular-nums leading-none mb-1.5"
              style={{ color: 'white' }}
            >
              {messageStats.total}
            </p>
            <p 
              className="text-[11px]"
              style={{ color: '#8F8F8F' }}
            >
              {messageStats.newCount} new · {messageStats.open} open
            </p>
          </div>
        </div>
        
        {/* Quick Actions - Compact buttons */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="default"
            size="sm"
            onClick={() => navigate("/help-workstation/articles/new")}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            New Article
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => navigate("/help-workstation/categories")}
          >
            Manage Categories
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => navigate("/help-workstation/tags")}
          >
            Manage Tags
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => navigate("/help-workstation/messages")}
          >
            View Messages
          </Button>
        </div>
        
        {/* Bottom sections - Dense, sharp corners */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Drafts Needing Review */}
          <div 
            className="rounded-md p-5"
            style={{ 
              backgroundColor: '#1A1A1A',
              border: '1px solid #303030'
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 
                className="text-[14px] font-medium"
                style={{ color: 'white' }}
              >
                Drafts to Review
              </h3>
              <button 
                onClick={() => navigate("/help-workstation/articles?status=draft")}
                className="text-[12px] flex items-center gap-1 transition-colors"
                style={{ color: '#AAAAAA' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#AAAAAA'}
              >
                View all
                <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
              </button>
            </div>
            
            {loading ? (
              <p className="text-[12px] text-center py-6" style={{ color: '#6B6B6B' }}>
                Loading...
              </p>
            ) : draftsToReview.length === 0 ? (
              <p className="text-[12px] text-center py-6" style={{ color: '#6B6B6B' }}>
                No drafts to review
              </p>
            ) : (
              <div className="space-y-0">
                {draftsToReview.map((article, index) => (
                  <div 
                    key={article.id}
                    className="flex items-center justify-between py-2 cursor-pointer transition-colors"
                    style={{ 
                      borderBottom: index < draftsToReview.length - 1 ? '1px solid rgba(48,48,48,0.5)' : 'none'
                    }}
                    onClick={() => navigate(`/help-workstation/articles/${article.id}`)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div 
                        className="text-[13px] font-medium truncate"
                        style={{ color: 'white' }}
                      >
                        {article.title}
                      </div>
                      <div 
                        className="text-[11px] mt-0.5"
                        style={{ color: '#8F8F8F' }}
                      >
                        Updated {format(new Date(article.updated_at), "MMM d, yyyy")}
                      </div>
                    </div>
                    <AppChip status="pending" label="Draft" />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Recent Articles */}
          <div 
            className="rounded-md p-5"
            style={{ 
              backgroundColor: '#1A1A1A',
              border: '1px solid #303030'
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 
                className="text-[14px] font-medium"
                style={{ color: 'white' }}
              >
                Recent Articles
              </h3>
              <button 
                onClick={() => navigate("/help-workstation/articles")}
                className="text-[12px] flex items-center gap-1 transition-colors"
                style={{ color: '#AAAAAA' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#AAAAAA'}
              >
                View all
                <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
              </button>
            </div>
            
            {loading ? (
              <p className="text-[12px] text-center py-6" style={{ color: '#6B6B6B' }}>
                Loading...
              </p>
            ) : recentArticles.length === 0 ? (
              <p className="text-[12px] text-center py-6" style={{ color: '#6B6B6B' }}>
                No articles yet
              </p>
            ) : (
              <div className="space-y-0">
                {recentArticles.map((article, index) => (
                  <div 
                    key={article.id}
                    className="flex items-center justify-between py-2 cursor-pointer transition-colors"
                    style={{ 
                      borderBottom: index < recentArticles.length - 1 ? '1px solid rgba(48,48,48,0.5)' : 'none'
                    }}
                    onClick={() => navigate(`/help-workstation/articles/${article.id}`)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div 
                        className="text-[13px] font-medium truncate"
                        style={{ color: 'white' }}
                      >
                        {article.title}
                      </div>
                      <div 
                        className="text-[11px] mt-0.5"
                        style={{ color: '#717171' }}
                      >
                        /{article.slug}
                      </div>
                    </div>
                    <AppChip 
                      status={getStatusChipStatus(article.status)} 
                      label={article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Minimal footer */}
        <div 
          className="text-[10px] text-center pt-6 uppercase tracking-wider"
          style={{ color: '#4A4A4A' }}
        >
          Help Workstation
        </div>
      </div>
    </div>
  );
}

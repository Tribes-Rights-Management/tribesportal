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
 * Clean, data-focused dashboard with:
 * - No icons in metric cards (numbers are the hero)
 * - Subtle search styling
 * - Institutional typography (uppercase labels, tabular figures)
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
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <p 
          className="text-[11px] uppercase tracking-wider font-medium mb-1"
          style={{ color: '#6B6B6B' }}
        >
          Help Workstation
        </p>
        <h1 
          className="text-[24px] font-medium"
          style={{ color: 'var(--platform-text)' }}
        >
          Overview
        </h1>
        <p 
          className="text-[14px] mt-1"
          style={{ color: '#AAAAAA' }}
        >
          Manage articles, categories, and support content
        </p>
      </div>
      
      {/* Search Bar - Institutional styling */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative max-w-xl">
          <Search 
            className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" 
            strokeWidth={1.5}
            style={{ color: '#6B6B6B' }} 
          />
          <input
            type="search"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 w-full pl-11 pr-4 text-[14px] rounded-md transition-colors duration-100 focus:outline-none"
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
      
      <div className="space-y-8">
        {/* Stats Cards - No icons, numbers are the hero */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Articles Card */}
          <div 
            className="rounded-lg p-5"
            style={{ 
              backgroundColor: '#1A1A1A',
              border: '1px solid #303030'
            }}
          >
            <div className="space-y-1">
              <p 
                className="text-[11px] uppercase tracking-wider font-medium"
                style={{ color: '#6B6B6B' }}
              >
                Articles
              </p>
              <p 
                className="text-[32px] font-medium tabular-nums"
                style={{ color: 'white' }}
              >
                {articleStats.total}
              </p>
              <p 
                className="text-[12px]"
                style={{ color: '#8F8F8F' }}
              >
                {articleStats.published} published · {articleStats.draft} draft
              </p>
            </div>
          </div>
          
          {/* Categories Card */}
          <div 
            className="rounded-lg p-5"
            style={{ 
              backgroundColor: '#1A1A1A',
              border: '1px solid #303030'
            }}
          >
            <div className="space-y-1">
              <p 
                className="text-[11px] uppercase tracking-wider font-medium"
                style={{ color: '#6B6B6B' }}
              >
                Categories
              </p>
              <p 
                className="text-[32px] font-medium tabular-nums"
                style={{ color: 'white' }}
              >
                {categoryCount}
              </p>
            </div>
          </div>
          
          {/* Messages Card */}
          <div 
            className="rounded-lg p-5"
            style={{ 
              backgroundColor: '#1A1A1A',
              border: '1px solid #303030'
            }}
          >
            <div className="space-y-1">
              <p 
                className="text-[11px] uppercase tracking-wider font-medium"
                style={{ color: '#6B6B6B' }}
              >
                Messages
              </p>
              <p 
                className="text-[32px] font-medium tabular-nums"
                style={{ color: 'white' }}
              >
                {messageStats.total}
              </p>
              <p 
                className="text-[12px]"
                style={{ color: '#8F8F8F' }}
              >
                {messageStats.newCount} new · {messageStats.open} open
              </p>
            </div>
          </div>
          
          {/* Analytics Card - Clickable */}
          <button 
            onClick={() => navigate("/help-workstation/analytics")}
            className="rounded-lg p-5 text-left transition-colors"
            style={{ 
              backgroundColor: '#1A1A1A',
              border: '1px solid #303030'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#505050'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#303030'}
          >
            <div className="space-y-1">
              <p 
                className="text-[11px] uppercase tracking-wider font-medium"
                style={{ color: '#6B6B6B' }}
              >
                Analytics
              </p>
              <p 
                className="text-[13px] mt-3"
                style={{ color: '#AAAAAA' }}
              >
                View search trends and article performance
              </p>
              <p 
                className="text-[13px] mt-2"
                style={{ color: 'white' }}
              >
                View Analytics →
              </p>
            </div>
          </button>
        </div>
        
        {/* Quick Actions - Institutional buttons */}
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="default"
            onClick={() => navigate("/help-workstation/articles/new")}
            className="gap-2"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            New Article
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/help-workstation/categories")}
          >
            Manage Categories
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/help-workstation/messages")}
          >
            View Messages
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Drafts Needing Review */}
          <div 
            className="rounded-lg p-6"
            style={{ 
              backgroundColor: '#1A1A1A',
              border: '1px solid #303030'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 
                className="text-[15px] font-medium"
                style={{ color: 'white' }}
              >
                Drafts to Review
              </h3>
              <button 
                onClick={() => navigate("/help-workstation/articles?status=draft")}
                className="text-[13px] flex items-center gap-1 transition-colors"
                style={{ color: '#AAAAAA' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#AAAAAA'}
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>
            
            {loading ? (
              <p className="text-[13px] text-center py-8" style={{ color: '#6B6B6B' }}>
                Loading...
              </p>
            ) : draftsToReview.length === 0 ? (
              <p className="text-[13px] text-center py-8" style={{ color: '#6B6B6B' }}>
                No drafts to review
              </p>
            ) : (
              <div className="space-y-0">
                {draftsToReview.map((article, index) => (
                  <div 
                    key={article.id}
                    className="flex items-center justify-between py-3 cursor-pointer transition-colors"
                    style={{ 
                      borderBottom: index < draftsToReview.length - 1 ? '1px solid #303030' : 'none'
                    }}
                    onClick={() => navigate(`/help-workstation/articles/${article.id}`)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="min-w-0 flex-1 pr-4">
                      <div 
                        className="text-[14px] font-medium truncate"
                        style={{ color: 'white' }}
                      >
                        {article.title}
                      </div>
                      <div 
                        className="text-[12px] mt-0.5"
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
            className="rounded-lg p-6"
            style={{ 
              backgroundColor: '#1A1A1A',
              border: '1px solid #303030'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 
                className="text-[15px] font-medium"
                style={{ color: 'white' }}
              >
                Recent Articles
              </h3>
              <button 
                onClick={() => navigate("/help-workstation/articles")}
                className="text-[13px] flex items-center gap-1 transition-colors"
                style={{ color: '#AAAAAA' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#AAAAAA'}
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>
            
            {loading ? (
              <p className="text-[13px] text-center py-8" style={{ color: '#6B6B6B' }}>
                Loading...
              </p>
            ) : recentArticles.length === 0 ? (
              <p className="text-[13px] text-center py-8" style={{ color: '#6B6B6B' }}>
                No articles yet
              </p>
            ) : (
              <div className="space-y-0">
                {recentArticles.map((article, index) => (
                  <div 
                    key={article.id}
                    className="flex items-center justify-between py-3 cursor-pointer transition-colors"
                    style={{ 
                      borderBottom: index < recentArticles.length - 1 ? '1px solid #303030' : 'none'
                    }}
                    onClick={() => navigate(`/help-workstation/articles/${article.id}`)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="min-w-0 flex-1 pr-4">
                      <div 
                        className="text-[14px] font-medium truncate"
                        style={{ color: 'white' }}
                      >
                        {article.title}
                      </div>
                      <div 
                        className="text-[12px] mt-0.5"
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
        
        {/* Footer */}
        <div 
          className="text-[11px] text-center py-4 uppercase tracking-wider"
          style={{ 
            borderTop: '1px solid #303030',
            color: '#6B6B6B'
          }}
        >
          Help Workstation · Company-level content management
        </div>
      </div>
    </div>
  );
}

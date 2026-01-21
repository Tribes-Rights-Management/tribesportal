import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";

/**
 * HELP WORKSTATION OVERVIEW — INSTITUTIONAL DESIGN
 * 
 * Typography:
 * - Page titles: text-[20px] font-medium text-white
 * - Section titles: text-[15px] font-medium text-white
 * - Body text: text-[13px]
 * - Column headers: text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium
 * - Helper text: text-[11px] text-[#6B6B6B]
 * - Metrics: text-[28px] font-medium text-white tabular-nums
 * 
 * Spacing:
 * - Page padding: p-8
 * - Section margins: mb-8
 * - Element spacing: gap-4 or mb-4
 */

interface ArticleStats {
  total: number;
  published: number;
  draft: number;
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
    total: 0, published: 0, draft: 0 
  });
  const [messageStats, setMessageStats] = useState<MessageStats>({ 
    total: 0, newCount: 0, open: 0 
  });
  const [categoryCount, setCategoryCount] = useState(0);
  const [tagCount, setTagCount] = useState(0);
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);
  const [draftsToReview, setDraftsToReview] = useState<RecentArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch article stats
      const { data: articles, error: articlesError } = await supabase
        .from("help_articles")
        .select("id, status, updated_at, current_version_id");
      
      if (articlesError) throw articlesError;
      
      if (articles) {
        const published = articles.filter(a => a.status === "published").length;
        const draft = articles.filter(a => a.status === "draft").length;
        setArticleStats({ total: articles.length, published, draft });
      }
      
      // Fetch category count
      const { count: catCount } = await supabase
        .from("help_categories")
        .select("*", { count: "exact", head: true });
      
      setCategoryCount(catCount ?? 0);
      
      // Fetch tag count
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
        .select("id, slug, status, updated_at, current_version_id")
        .order("updated_at", { ascending: false })
        .limit(5);
      
      if (recentData) {
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
        .select("id, slug, status, updated_at, current_version_id")
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
    } catch (err) {
      console.error("Error loading stats:", err);
      setError("Unable to load data");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/help-workstation/articles?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium mb-2">
          HELP WORKSTATION
        </p>
        <h1 className="text-[20px] font-medium text-white mb-2">
          Overview
        </h1>
        <p className="text-[13px] text-[#AAAAAA]">
          Manage articles, categories, and support content
        </p>
      </div>

      {/* Inline Error */}
      {error && (
        <div className="mb-8 flex items-start gap-3 px-4 py-3 bg-[#2A1A1A] border-l-2 border-[#7F1D1D] rounded-r">
          <AlertCircle className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-[12px] text-[#E5E5E5]">{error}</p>
            <button 
              onClick={loadStats} 
              className="text-[11px] text-[#DC2626] hover:text-[#EF4444] underline mt-1 flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
              Try again
            </button>
          </div>
        </div>
      )}
      
      {/* Search Bar - No icon */}
      <div className="mb-8 max-w-xl">
        <form onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 px-3 bg-[#1A1A1A] border border-[#303030] rounded text-[12px] text-white placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#505050]"
          />
        </form>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1A1A1A] border border-[#303030] rounded p-4">
          <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium mb-2">Articles</p>
          <p className="text-[28px] font-medium text-white tabular-nums mb-1.5">{articleStats.total}</p>
          <p className="text-[11px] text-[#8F8F8F]">{articleStats.published} published · {articleStats.draft} draft</p>
        </div>
        
        <div className="bg-[#1A1A1A] border border-[#303030] rounded p-4">
          <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium mb-2">Categories</p>
          <p className="text-[28px] font-medium text-white tabular-nums">{categoryCount}</p>
        </div>
        
        <div className="bg-[#1A1A1A] border border-[#303030] rounded p-4">
          <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium mb-2">Tags</p>
          <p className="text-[28px] font-medium text-white tabular-nums">{tagCount}</p>
        </div>
        
        <div className="bg-[#1A1A1A] border border-[#303030] rounded p-4">
          <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium mb-2">Messages</p>
          <p className="text-[28px] font-medium text-white tabular-nums mb-1.5">{messageStats.total}</p>
          <p className="text-[11px] text-[#8F8F8F]">{messageStats.newCount} new · {messageStats.open} open</p>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="flex gap-2 mb-8">
        <Button variant="default" size="sm" onClick={() => navigate('/help-workstation/articles/new')}>
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
          New Article
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate('/help-workstation/categories')}>
          Manage Categories
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate('/help-workstation/tags')}>
          Manage Tags
        </Button>
      </div>
      
      {/* Bottom Sections */}
      <div className="grid grid-cols-2 gap-4">
        {/* Drafts to Review */}
        <div className="bg-[#1A1A1A] border border-[#303030] rounded p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-medium text-white">Drafts to Review</h3>
            <button 
              onClick={() => navigate('/help-workstation/articles?filter=draft')} 
              className="text-[12px] text-[#AAAAAA] hover:text-white flex items-center gap-1"
            >
              View all
              <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-[13px] text-[#6B6B6B]">Loading...</p>
            </div>
          ) : draftsToReview.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[13px] text-[#6B6B6B]">No drafts to review</p>
            </div>
          ) : (
            <div className="space-y-2">
              {draftsToReview.map(draft => (
                <div 
                  key={draft.id} 
                  className="flex items-start justify-between py-2 border-b border-[#303030]/30 last:border-0 cursor-pointer hover:bg-white/[0.02] transition-colors -mx-2 px-2 rounded"
                  onClick={() => navigate(`/help-workstation/articles/${draft.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-white truncate hover:underline">{draft.title}</p>
                    <p className="text-[11px] text-[#8F8F8F] mt-0.5">
                      {format(new Date(draft.updated_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-[#6B6B6B] ml-2 shrink-0" strokeWidth={1.5} />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Recent Articles */}
        <div className="bg-[#1A1A1A] border border-[#303030] rounded p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-medium text-white">Recent Articles</h3>
            <button 
              onClick={() => navigate('/help-workstation/articles')} 
              className="text-[12px] text-[#AAAAAA] hover:text-white flex items-center gap-1"
            >
              View all
              <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-[13px] text-[#6B6B6B]">Loading...</p>
            </div>
          ) : recentArticles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[13px] text-[#6B6B6B]">No articles yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentArticles.map(article => (
                <div 
                  key={article.id} 
                  className="flex items-start justify-between py-2 border-b border-[#303030]/30 last:border-0 cursor-pointer hover:bg-white/[0.02] transition-colors -mx-2 px-2 rounded"
                  onClick={() => navigate(`/help-workstation/articles/${article.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-white truncate hover:underline">{article.title}</p>
                    <p className="text-[11px] text-[#8F8F8F] mt-0.5">
                      {format(new Date(article.updated_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-[#6B6B6B] ml-2 shrink-0" strokeWidth={1.5} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

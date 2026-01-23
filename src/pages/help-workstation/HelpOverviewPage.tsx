import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, AlertCircle, RefreshCw, Search } from "lucide-react";
import { format } from "date-fns";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * HELP WORKSTATION OVERVIEW — INSTITUTIONAL DESIGN
 * Simplified to match actual database schema.
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
}

export default function HelpOverviewPage() {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [articleStats, setArticleStats] = useState<ArticleStats>({ total: 0, published: 0, draft: 0 });
  const [categoryCount, setCategoryCount] = useState(0);
  const [audienceCount, setAudienceCount] = useState(0);
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);
  const [draftsToReview, setDraftsToReview] = useState<RecentArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

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

        // Recent articles
        const sorted = [...articles].sort((a, b) => 
          new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
        );
        setRecentArticles(sorted.slice(0, 5).map(a => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          status: a.status,
          updated_at: a.updated_at || new Date().toISOString(),
        })));

        // Drafts
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

  const handleSearch = () => {
    if (debouncedSearch.trim()) {
      navigate(`/help-workstation/articles?search=${encodeURIComponent(debouncedSearch)}`);
    }
  };

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium mb-2">
            HELP WORKSTATION
          </p>
          <h1 className="text-[20px] font-medium text-white mb-1">Overview</h1>
          <p className="text-[13px] text-[#AAAAAA]">Manage Help Center content</p>
        </div>
        <Button variant="default" size="sm" onClick={() => navigate("/help-workstation/articles/new")}>
          <Plus className="h-2 w-2" strokeWidth={1} />
          New Article
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-[#2A1A1A] border-l-2 border-[#7F1D1D] rounded-r">
          <AlertCircle className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-[12px] text-[#E5E5E5]">{error}</p>
            <button onClick={loadStats} className="text-[11px] text-[#DC2626] hover:text-[#EF4444] underline mt-1 flex items-center gap-1">
              <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-8 max-w-md relative">
        <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#505050]" strokeWidth={1} />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="w-full h-9 pl-7 pr-3 bg-transparent border-0 border-b border-[#303030] text-[12px] text-[#E5E5E5] placeholder:text-[#505050] focus:outline-none focus:border-[#505050]"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1A1A1A] border border-[#303030] rounded p-4 cursor-pointer hover:bg-white/[0.02]" onClick={() => navigate("/help-workstation/articles")}>
          <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B] mb-1">Articles</p>
          <p className="text-[24px] font-medium text-white">{loading ? "—" : articleStats.total}</p>
          <p className="text-[11px] text-[#8F8F8F] mt-1">{articleStats.published} published, {articleStats.draft} draft</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#303030] rounded p-4 cursor-pointer hover:bg-white/[0.02]" onClick={() => navigate("/help-workstation/categories")}>
          <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B] mb-1">Categories</p>
          <p className="text-[24px] font-medium text-white">{loading ? "—" : categoryCount}</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#303030] rounded p-4 cursor-pointer hover:bg-white/[0.02]" onClick={() => navigate("/help-workstation/audiences")}>
          <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B] mb-1">Audiences</p>
          <p className="text-[24px] font-medium text-white">{loading ? "—" : audienceCount}</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#303030] rounded p-4 cursor-pointer hover:bg-white/[0.02]" onClick={() => navigate("/help-workstation/messages")}>
          <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B] mb-1">Messages</p>
          <p className="text-[24px] font-medium text-white">—</p>
        </div>
      </div>

      {/* Recent & Drafts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] border border-[#303030] rounded">
          <div className="px-4 py-3 border-b border-[#303030] flex items-center justify-between">
            <h3 className="text-[13px] font-medium text-white">Recent Articles</h3>
            <button onClick={() => navigate("/help-workstation/articles")} className="text-[11px] text-[#8F8F8F] hover:text-white flex items-center gap-1">
              View all <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
            </button>
          </div>
          <div className="divide-y divide-[#303030]/30">
            {recentArticles.length === 0 ? (
              <p className="px-4 py-8 text-[12px] text-[#6B6B6B] text-center">No articles yet</p>
            ) : (
              recentArticles.map(article => (
                <div key={article.id} onClick={() => navigate(`/help-workstation/articles/${article.id}`)} className="px-4 py-3 hover:bg-white/[0.02] cursor-pointer">
                  <p className="text-[13px] text-white truncate">{article.title}</p>
                  <p className="text-[11px] text-[#6B6B6B] mt-0.5">{format(new Date(article.updated_at), "MMM d, yyyy")}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-[#303030] rounded">
          <div className="px-4 py-3 border-b border-[#303030]">
            <h3 className="text-[13px] font-medium text-white">Drafts to Review</h3>
          </div>
          <div className="divide-y divide-[#303030]/30">
            {draftsToReview.length === 0 ? (
              <p className="px-4 py-8 text-[12px] text-[#6B6B6B] text-center">No drafts</p>
            ) : (
              draftsToReview.map(article => (
                <div key={article.id} onClick={() => navigate(`/help-workstation/articles/${article.id}`)} className="px-4 py-3 hover:bg-white/[0.02] cursor-pointer">
                  <p className="text-[13px] text-white truncate">{article.title}</p>
                  <p className="text-[11px] text-[#6B6B6B] mt-0.5">{format(new Date(article.updated_at), "MMM d, yyyy")}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

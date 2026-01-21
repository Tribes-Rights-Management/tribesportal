import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, AlertCircle, RefreshCw, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * HELP WORKSTATION OVERVIEW — INSTITUTIONAL DESIGN
 *
 * Features:
 * - Live search with instant results dropdown
 * - Keyboard navigation (arrows, Enter, Escape)
 * - Stats cards for articles, categories, tags, messages
 * - Quick actions and recent content lists
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

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  status: string;
  category_name?: string;
  body_snippet?: string;
}

// Highlight matching text in search results
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query || !text) return text;

  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  const index = textLower.indexOf(queryLower);

  if (index === -1) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return (
    <>
      {before}
      <mark className="bg-[#60A5FA]/30 text-white px-0.5 rounded">{match}</mark>
      {after}
    </>
  );
}

export default function HelpOverviewPage() {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Perform search when debounced query changes
  useEffect(() => {
    async function performSearch() {
      if (!debouncedSearch.trim()) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      setShowDropdown(true);

      try {
        // Fetch articles with versions
        const { data: articles, error: articlesError } = await supabase
          .from("help_articles")
          .select(`
            id,
            slug,
            status,
            current_version_id,
            category:help_categories(name)
          `)
          .neq("status", "archived")
          .order("updated_at", { ascending: false });

        if (articlesError) throw articlesError;

        if (!articles || articles.length === 0) {
          setSearchResults([]);
          setIsSearching(false);
          return;
        }

        // Fetch versions for title and body
        const versionIds = articles.map(a => a.current_version_id).filter(Boolean);
        let versionsMap: Record<string, { title: string; body_md: string }> = {};

        if (versionIds.length > 0) {
          const { data: versions } = await supabase
            .from("help_article_versions")
            .select("id, title, body_md")
            .in("id", versionIds);

          if (versions) {
            versionsMap = versions.reduce((acc, v) => {
              acc[v.id] = { title: v.title, body_md: v.body_md };
              return acc;
            }, {} as Record<string, { title: string; body_md: string }>);
          }
        }

        // Filter and map results
        const searchLower = debouncedSearch.toLowerCase();
        const results: SearchResult[] = [];

        for (const article of articles) {
          const version = article.current_version_id ? versionsMap[article.current_version_id] : null;
          const title = version?.title || "Untitled";
          const body = version?.body_md || "";

          const titleMatch = title.toLowerCase().includes(searchLower);
          const bodyMatch = body.toLowerCase().includes(searchLower);

          if (titleMatch || bodyMatch) {
            let bodySnippet: string | undefined;

            if (bodyMatch && !titleMatch) {
              // Extract snippet around match
              const index = body.toLowerCase().indexOf(searchLower);
              const start = Math.max(0, index - 30);
              const end = Math.min(body.length, index + searchLower.length + 50);
              bodySnippet = body.slice(start, end).replace(/<[^>]*>/g, '');
              if (start > 0) bodySnippet = '...' + bodySnippet;
              if (end < body.length) bodySnippet = bodySnippet + '...';
            }

            results.push({
              id: article.id,
              title,
              slug: article.slug,
              status: article.status,
              category_name: (article.category as any)?.name,
              body_snippet: bodySnippet,
            });

            if (results.length >= 8) break;
          }
        }

        setSearchResults(results);
        setSelectedIndex(-1);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      }

      setIsSearching(false);
    }

    performSearch();
  }, [debouncedSearch]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          navigate(`/help-workstation/articles/${searchResults[selectedIndex].id}`);
          setShowDropdown(false);
        } else if (searchResults.length > 0) {
          navigate(`/help-workstation/articles/${searchResults[0].id}`);
          setShowDropdown(false);
        } else if (searchQuery.trim()) {
          navigate(`/help-workstation/articles?search=${encodeURIComponent(searchQuery)}`);
          setShowDropdown(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowDropdown(false);
        searchInputRef.current?.blur();
        break;
    }
  }, [showDropdown, selectedIndex, searchResults, searchQuery, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/help-workstation/articles?search=${encodeURIComponent(searchQuery)}`);
      setShowDropdown(false);
    }
  };

  const selectResult = (result: SearchResult) => {
    navigate(`/help-workstation/articles/${result.id}`);
    setShowDropdown(false);
    setSearchQuery("");
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

      {/* Search Bar with Live Results */}
      <div className="mb-8 max-w-xl relative">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6B]" strokeWidth={1.5} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim()) {
                  setShowDropdown(true);
                }
              }}
              onFocus={() => {
                if (searchQuery.trim() && (searchResults.length > 0 || isSearching)) {
                  setShowDropdown(true);
                }
              }}
              onKeyDown={handleKeyDown}
              className="w-full h-10 pl-10 pr-10 bg-[#1A1A1A] border border-[#303030] rounded-lg text-[13px] text-[#E5E5E5] placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#505050] focus:ring-1 focus:ring-[#505050]"
            />
            {isSearching && searchQuery && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6B] animate-spin" strokeWidth={1.5} />
            )}
          </div>
        </form>

        {/* Search Results Dropdown */}
        {showDropdown && searchQuery.trim() && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A] border border-[#404040] rounded-lg shadow-xl z-50 overflow-hidden"
          >
            {isSearching ? (
              <div className="px-4 py-6 text-center">
                <Loader2 className="h-5 w-5 text-[#6B6B6B] animate-spin mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-[12px] text-[#6B6B6B]">Searching...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <Search className="h-5 w-5 text-[#404040] mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-[12px] text-[#6B6B6B]">No results found for "{searchQuery}"</p>
              </div>
            ) : (
              <div className="py-1">
                {searchResults.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => selectResult(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full px-4 py-3 text-left transition-colors ${
                      index === selectedIndex
                        ? "bg-[#303030]"
                        : "hover:bg-[#252525]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-[#E5E5E5] truncate">
                          {highlightMatch(result.title, searchQuery)}
                        </p>
                        {result.body_snippet && (
                          <p className="text-[11px] text-[#6B6B6B] truncate mt-0.5">
                            {highlightMatch(result.body_snippet, searchQuery)}
                          </p>
                        )}
                        {result.category_name && (
                          <p className="text-[10px] text-[#505050] mt-1">
                            {result.category_name}
                          </p>
                        )}
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                        result.status === "published"
                          ? "bg-[#059669]/20 text-[#34D399]"
                          : "bg-[#303030] text-[#8F8F8F]"
                      }`}>
                        {result.status}
                      </span>
                    </div>
                  </button>
                ))}
                {searchResults.length > 0 && (
                  <div className="px-4 py-2 border-t border-[#303030]">
                    <button
                      onClick={() => {
                        navigate(`/help-workstation/articles?search=${encodeURIComponent(searchQuery)}`);
                        setShowDropdown(false);
                      }}
                      className="text-[11px] text-[#60A5FA] hover:text-[#93C5FD]"
                    >
                      View all results →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div
          onClick={() => navigate('/help-workstation/articles')}
          className="bg-[#1A1A1A] border border-[#303030] rounded p-4 cursor-pointer transition-colors duration-150 hover:bg-[#222222] hover:border-[#404040]"
        >
          <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium mb-2">Articles</p>
          <p className="text-[28px] font-medium text-white tabular-nums mb-1.5">{articleStats.total}</p>
          <p className="text-[11px] text-[#8F8F8F]">{articleStats.published} published · {articleStats.draft} draft</p>
        </div>

        <div
          onClick={() => navigate('/help-workstation/categories')}
          className="bg-[#1A1A1A] border border-[#303030] rounded p-4 cursor-pointer transition-colors duration-150 hover:bg-[#222222] hover:border-[#404040]"
        >
          <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium mb-2">Categories</p>
          <p className="text-[28px] font-medium text-white tabular-nums">{categoryCount}</p>
        </div>

        <div
          onClick={() => navigate('/help-workstation/tags')}
          className="bg-[#1A1A1A] border border-[#303030] rounded p-4 cursor-pointer transition-colors duration-150 hover:bg-[#222222] hover:border-[#404040]"
        >
          <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium mb-2">Tags</p>
          <p className="text-[28px] font-medium text-white tabular-nums">{tagCount}</p>
        </div>

        <div
          onClick={() => navigate('/help-workstation/messages')}
          className="bg-[#1A1A1A] border border-[#303030] rounded p-4 cursor-pointer transition-colors duration-150 hover:bg-[#222222] hover:border-[#404040]"
        >
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

import { useState, useEffect } from "react";
import { FileText, MessageSquare, Search, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminListRow, AdminSection } from "@/components/admin/AdminListRow";
import { format } from "date-fns";

interface HelpMetrics {
  totalArticles: number;
  publishedArticles: number;
  newMessages: number;
  todaySearches: number;
}

interface RecentMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  status: string | null;
  created_at: string | null;
}

interface TopSearch {
  query: string;
  count: number;
}

interface TopArticle {
  id: string;
  title: string;
  view_count: number | null;
}

export default function HelpCenterOverview() {
  const [metrics, setMetrics] = useState<HelpMetrics>({
    totalArticles: 0,
    publishedArticles: 0,
    newMessages: 0,
    todaySearches: 0,
  });
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [topSearches, setTopSearches] = useState<TopSearch[]>([]);
  const [topArticles, setTopArticles] = useState<TopArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        totalArticlesRes,
        publishedArticlesRes,
        newMessagesRes,
        todaySearchesRes,
        recentMessagesRes,
        searchesRes,
        topArticlesRes,
      ] = await Promise.all([
        supabase.from("articles").select("id", { count: "exact", head: true }),
        supabase
          .from("articles")
          .select("id", { count: "exact", head: true })
          .eq("published", true),
        supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("status", "new"),
        supabase
          .from("searches")
          .select("id", { count: "exact", head: true })
          .gte("created_at", today.toISOString()),
        supabase
          .from("messages")
          .select("id, name, email, subject, status, created_at")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("searches")
          .select("query")
          .gte(
            "created_at",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          ),
        supabase
          .from("articles")
          .select("id, title, view_count")
          .eq("published", true)
          .order("view_count", { ascending: false, nullsFirst: false })
          .limit(5),
      ]);

      setMetrics({
        totalArticles: totalArticlesRes.count ?? 0,
        publishedArticles: publishedArticlesRes.count ?? 0,
        newMessages: newMessagesRes.count ?? 0,
        todaySearches: todaySearchesRes.count ?? 0,
      });

      setRecentMessages((recentMessagesRes.data as RecentMessage[]) ?? []);
      setTopArticles((topArticlesRes.data as TopArticle[]) ?? []);

      // Aggregate search queries
      const searchCounts: Record<string, number> = {};
      (searchesRes.data ?? []).forEach((s: { query: string }) => {
        const q = s.query.toLowerCase().trim();
        searchCounts[q] = (searchCounts[q] || 0) + 1;
      });
      const sorted = Object.entries(searchCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([query, count]) => ({ query, count }));
      setTopSearches(sorted);

      setLoading(false);
    }

    fetchData();
  }, []);

  return (
    <div
      className="min-h-full py-12 md:py-16 px-4 md:px-6"
      style={{ backgroundColor: "var(--platform-canvas)" }}
    >
      <div
        className="max-w-[860px] mx-auto rounded-lg"
        style={{
          backgroundColor: "var(--platform-surface)",
          border: "1px solid var(--platform-border)",
        }}
      >
        <div className="p-6 md:p-8 lg:p-10">
          <header className="mb-12 md:mb-16">
            <h1
              className="text-[22px] md:text-[26px] font-medium tracking-[-0.01em]"
              style={{ color: "var(--platform-text)" }}
            >
              Help Center Overview
            </h1>
            <p
              className="text-[13px] md:text-[14px] mt-2"
              style={{ color: "var(--platform-text-muted)" }}
            >
              Metrics, recent activity, and popular content
            </p>
          </header>

          {/* Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <MetricCard
              icon={<FileText className="h-4 w-4" />}
              label="Total Articles"
              value={loading ? "—" : metrics.totalArticles.toString()}
            />
            <MetricCard
              icon={<Eye className="h-4 w-4" />}
              label="Published"
              value={loading ? "—" : metrics.publishedArticles.toString()}
            />
            <MetricCard
              icon={<MessageSquare className="h-4 w-4" />}
              label="New Messages"
              value={loading ? "—" : metrics.newMessages.toString()}
              highlight={metrics.newMessages > 0}
            />
            <MetricCard
              icon={<Search className="h-4 w-4" />}
              label="Today's Searches"
              value={loading ? "—" : metrics.todaySearches.toString()}
            />
          </div>

          {/* Recent Messages */}
          <AdminSection label="Recent Messages">
            {recentMessages.length === 0 ? (
              <div
                className="py-8 text-center text-[13px]"
                style={{ color: "var(--platform-text-muted)" }}
              >
                No messages
              </div>
            ) : (
              recentMessages.map((msg) => (
                <AdminListRow
                  key={msg.id}
                  to={`/admin/help-center/messages?id=${msg.id}`}
                  title={msg.subject || "(No subject)"}
                  description={`${msg.name} • ${msg.email}`}
                  trailing={
                    msg.created_at
                      ? format(new Date(msg.created_at), "MMM d")
                      : ""
                  }
                />
              ))
            )}
          </AdminSection>

          {/* Popular Searches */}
          <AdminSection label="Popular Searches (Last 7 Days)">
            {topSearches.length === 0 ? (
              <div
                className="py-8 text-center text-[13px]"
                style={{ color: "var(--platform-text-muted)" }}
              >
                No search data
              </div>
            ) : (
              <div className="space-y-2">
                {topSearches.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 px-1"
                  >
                    <span
                      className="text-[13px] truncate"
                      style={{ color: "var(--platform-text)" }}
                    >
                      {s.query}
                    </span>
                    <span
                      className="text-[12px] tabular-nums"
                      style={{ color: "var(--platform-text-muted)" }}
                    >
                      {s.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </AdminSection>

          {/* Top Articles */}
          <AdminSection label="Most Viewed Articles">
            {topArticles.length === 0 ? (
              <div
                className="py-8 text-center text-[13px]"
                style={{ color: "var(--platform-text-muted)" }}
              >
                No articles
              </div>
            ) : (
              topArticles.map((article) => (
                <AdminListRow
                  key={article.id}
                  to={`/admin/help-center/articles/${article.id}/edit`}
                  title={article.title}
                  trailing={`${article.view_count ?? 0} views`}
                />
              ))
            )}
          </AdminSection>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="p-4 rounded-lg"
      style={{
        backgroundColor: "rgba(255,255,255,0.02)",
        border: "1px solid var(--platform-border)",
      }}
    >
      <div
        className="flex items-center gap-2 mb-2"
        style={{ color: "var(--platform-text-muted)" }}
      >
        {icon}
        <span className="text-[11px] uppercase tracking-wide">{label}</span>
      </div>
      <div
        className="text-[20px] font-medium tabular-nums"
        style={{
          color: highlight
            ? "hsl(var(--primary))"
            : "var(--platform-text)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

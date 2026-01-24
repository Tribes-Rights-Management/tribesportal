import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminSection } from "@/components/admin/AdminListRow";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";

interface SearchQuery {
  query: string;
  count: number;
}

interface ArticleAnalytic {
  id: string;
  title: string;
  view_count: number;
  helpful_percent: number;
}

interface MessageTrend {
  date: string;
  count: number;
}

interface MessageStatus {
  status: string;
  count: number;
}

type DateRange = "7" | "30" | "90";

const COLORS = ["#3b82f6", "#22c55e", "#6b7280", "#f59e0b"];

export default function HelpCenterAnalytics() {
  const [dateRange, setDateRange] = useState<DateRange>("30");
  const [loading, setLoading] = useState(true);
  const [topSearches, setTopSearches] = useState<SearchQuery[]>([]);
  const [zeroResultSearches, setZeroResultSearches] = useState<SearchQuery[]>([]);
  const [conversionRate, setConversionRate] = useState<number>(0);
  const [topArticles, setTopArticles] = useState<ArticleAnalytic[]>([]);
  const [messageTrend, setMessageTrend] = useState<MessageTrend[]>([]);
  const [messagesByStatus, setMessagesByStatus] = useState<MessageStatus[]>([]);
  const [avgResponseTime, setAvgResponseTime] = useState<string>("—");

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  async function fetchAnalytics() {
    setLoading(true);
    const days = parseInt(dateRange);
    const startDate = startOfDay(subDays(new Date(), days)).toISOString();

    // Fetch searches
    const { data: searches } = await supabase
      .from("searches")
      .select("query, results_count, converted_to_message")
      .gte("created_at", startDate);

    if (searches) {
      // Top searches
      const searchCounts: Record<string, number> = {};
      const zeroResults: Record<string, number> = {};
      let converted = 0;

      searches.forEach((s) => {
        const q = s.query.toLowerCase().trim();
        searchCounts[q] = (searchCounts[q] || 0) + 1;

        if (s.results_count === 0) {
          zeroResults[q] = (zeroResults[q] || 0) + 1;
        }

        if (s.converted_to_message) {
          converted++;
        }
      });

      setTopSearches(
        Object.entries(searchCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([query, count]) => ({ query, count }))
      );

      setZeroResultSearches(
        Object.entries(zeroResults)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([query, count]) => ({ query, count }))
      );

      setConversionRate(
        searches.length > 0 ? (converted / searches.length) * 100 : 0
      );
    }

    // Fetch articles
    const { data: articles } = await supabase
      .from("articles")
      .select("id, title, view_count, helpful_count, not_helpful_count")
      .eq("published", true)
      .order("view_count", { ascending: false, nullsFirst: false })
      .limit(10);

    if (articles) {
      setTopArticles(
        articles.map((a) => {
          const helpful = a.helpful_count ?? 0;
          const notHelpful = a.not_helpful_count ?? 0;
          const total = helpful + notHelpful;
          return {
            id: a.id,
            title: a.title,
            view_count: a.view_count ?? 0,
            helpful_percent: total > 0 ? (helpful / total) * 100 : 0,
          };
        })
      );
    }

    // Fetch messages for trend
    const { data: messages } = await supabase
      .from("messages")
      .select("created_at, status, responded_at")
      .gte("created_at", startDate);

    if (messages) {
      // Group by date
      const trendMap: Record<string, number> = {};
      const statusMap: Record<string, number> = {};
      let totalResponseTime = 0;
      let respondedCount = 0;

      messages.forEach((m) => {
        if (m.created_at) {
          const date = format(new Date(m.created_at), "MMM d");
          trendMap[date] = (trendMap[date] || 0) + 1;
        }

        const status = m.status || "new";
        statusMap[status] = (statusMap[status] || 0) + 1;

        if (m.responded_at && m.created_at) {
          const responseTime =
            new Date(m.responded_at).getTime() -
            new Date(m.created_at).getTime();
          totalResponseTime += responseTime;
          respondedCount++;
        }
      });

      // Create trend data for last N days
      const trendData: MessageTrend[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = format(subDays(new Date(), i), "MMM d");
        trendData.push({ date, count: trendMap[date] || 0 });
      }
      setMessageTrend(trendData.slice(-14)); // Show last 14 data points

      setMessagesByStatus(
        Object.entries(statusMap).map(([status, count]) => ({ status, count }))
      );

      if (respondedCount > 0) {
        const avgMs = totalResponseTime / respondedCount;
        const avgHours = Math.round(avgMs / (1000 * 60 * 60));
        setAvgResponseTime(avgHours < 24 ? `${avgHours}h` : `${Math.round(avgHours / 24)}d`);
      } else {
        setAvgResponseTime("—");
      }
    }

    setLoading(false);
  }

  return (
    <div
      className="min-h-full py-12 md:py-16 px-4 md:px-6"
      style={{ backgroundColor: "var(--platform-canvas)" }}
    >
      <div
        className="max-w-[960px] mx-auto rounded-lg"
        style={{
          backgroundColor: "var(--platform-surface)",
          border: "1px solid var(--platform-border)",
        }}
      >
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1
                className="text-[22px] md:text-[26px] font-medium tracking-[-0.01em]"
                style={{ color: "var(--platform-text)" }}
              >
                Analytics
              </h1>
              <p
                className="text-[13px] mt-1"
                style={{ color: "var(--platform-text-muted)" }}
              >
                Help center performance and insights
              </p>
            </div>
            <Select
              value={dateRange}
              onValueChange={(v) => setDateRange(v as DateRange)}
            >
              <SelectTrigger
                className="w-[140px]"
                style={{
                  backgroundColor: "rgba(255,255,255,0.02)",
                  borderColor: "var(--platform-border)",
                  color: "var(--platform-text)",
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div
              className="py-20 text-center text-[13px]"
              style={{ color: "var(--platform-text-muted)" }}
            >
              Loading analytics...
            </div>
          ) : (
            <>
              {/* Search Analytics */}
              <AdminSection label="Search Analytics">
                <div className="grid md:grid-cols-3 gap-6 p-4">
                  {/* Top Searches */}
                  <div>
                    <h4
                      className="text-[11px] uppercase tracking-wide mb-3"
                      style={{ color: "var(--platform-text-muted)" }}
                    >
                      Top Searches
                    </h4>
                    {topSearches.length === 0 ? (
                      <span
                        className="text-[13px]"
                        style={{ color: "var(--platform-text-muted)" }}
                      >
                        No search data
                      </span>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {topSearches.slice(0, 10).map((s, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-[13px]"
                          >
                            <span
                              className="truncate max-w-[150px]"
                              style={{ color: "var(--platform-text)" }}
                            >
                              {s.query}
                            </span>
                            <span
                              className="tabular-nums"
                              style={{ color: "var(--platform-text-muted)" }}
                            >
                              {s.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Zero Results */}
                  <div>
                    <h4
                      className="text-[11px] uppercase tracking-wide mb-3"
                      style={{ color: "var(--platform-text-muted)" }}
                    >
                      Zero-Result Searches
                    </h4>
                    {zeroResultSearches.length === 0 ? (
                      <span
                        className="text-[13px]"
                        style={{ color: "var(--platform-text-muted)" }}
                      >
                        No failed searches
                      </span>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {zeroResultSearches.map((s, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-[13px]"
                          >
                            <span
                              className="truncate max-w-[150px]"
                              style={{ color: "var(--platform-text)" }}
                            >
                              {s.query}
                            </span>
                            <span
                              className="tabular-nums"
                              style={{ color: "var(--platform-text-muted)" }}
                            >
                              {s.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Conversion Rate */}
                  <div>
                    <h4
                      className="text-[11px] uppercase tracking-wide mb-3"
                      style={{ color: "var(--platform-text-muted)" }}
                    >
                      Search → Message Rate
                    </h4>
                    <div
                      className="text-[28px] font-medium tabular-nums"
                      style={{ color: "var(--platform-text)" }}
                    >
                      {conversionRate.toFixed(1)}%
                    </div>
                    <span
                      className="text-[12px]"
                      style={{ color: "var(--platform-text-muted)" }}
                    >
                      Searches resulting in contact
                    </span>
                  </div>
                </div>
              </AdminSection>

              {/* Article Analytics */}
              <AdminSection label="Article Analytics">
                <div className="p-4">
                  <h4
                    className="text-[11px] uppercase tracking-wide mb-4"
                    style={{ color: "var(--platform-text-muted)" }}
                  >
                    Most Viewed Articles
                  </h4>
                  {topArticles.length === 0 ? (
                    <span
                      className="text-[13px]"
                      style={{ color: "var(--platform-text-muted)" }}
                    >
                      No article data
                    </span>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr
                          className="text-left text-[11px] uppercase tracking-wide"
                          style={{ color: "var(--platform-text-muted)" }}
                        >
                          <th className="pb-2">Title</th>
                          <th className="pb-2 text-right">Views</th>
                          <th className="pb-2 text-right">Helpful</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topArticles.map((a) => (
                          <tr
                            key={a.id}
                            style={{
                              borderTop: "1px solid var(--platform-border)",
                            }}
                          >
                            <td
                              className="py-2 text-[13px] truncate max-w-[300px]"
                              style={{ color: "var(--platform-text)" }}
                            >
                              {a.title}
                            </td>
                            <td
                              className="py-2 text-right text-[13px] tabular-nums"
                              style={{ color: "var(--platform-text-muted)" }}
                            >
                              {a.view_count}
                            </td>
                            <td
                              className="py-2 text-right text-[13px] tabular-nums"
                              style={{
                                color:
                                  a.helpful_percent >= 70
                                    ? "rgb(34, 197, 94)"
                                    : a.helpful_percent >= 50
                                    ? "var(--platform-text)"
                                    : "rgb(239, 68, 68)",
                              }}
                            >
                              {a.helpful_percent > 0
                                ? `${a.helpful_percent.toFixed(0)}%`
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </AdminSection>

              {/* Message Analytics */}
              <AdminSection label="Message Analytics">
                <div className="grid md:grid-cols-2 gap-6 p-4">
                  {/* Trend Chart */}
                  <div>
                    <h4
                      className="text-[11px] uppercase tracking-wide mb-4"
                      style={{ color: "var(--platform-text-muted)" }}
                    >
                      Messages Over Time
                    </h4>
                    {messageTrend.length === 0 ||
                    messageTrend.every((t) => t.count === 0) ? (
                      <div
                        className="h-[200px] flex items-center justify-center text-[13px]"
                        style={{ color: "var(--platform-text-muted)" }}
                      >
                        No message data
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={messageTrend}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--muted) / 0.5)"
                          />
                          <XAxis
                            dataKey="date"
                            tick={{ fill: "var(--platform-text-muted)", fontSize: 11 }}
                            axisLine={{ stroke: "var(--platform-border)" }}
                          />
                          <YAxis
                            tick={{ fill: "var(--platform-text-muted)", fontSize: 11 }}
                            axisLine={{ stroke: "var(--platform-border)" }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "var(--platform-surface)",
                              border: "1px solid var(--platform-border)",
                              borderRadius: "8px",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Status Breakdown */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4
                        className="text-[11px] uppercase tracking-wide"
                        style={{ color: "var(--platform-text-muted)" }}
                      >
                        Messages by Status
                      </h4>
                      <div className="text-right">
                        <span
                          className="text-[11px] uppercase tracking-wide block"
                          style={{ color: "var(--platform-text-muted)" }}
                        >
                          Avg Response Time
                        </span>
                        <span
                          className="text-[18px] font-medium"
                          style={{ color: "var(--platform-text)" }}
                        >
                          {avgResponseTime}
                        </span>
                      </div>
                    </div>
                    {messagesByStatus.length === 0 ? (
                      <div
                        className="h-[160px] flex items-center justify-center text-[13px]"
                        style={{ color: "var(--platform-text-muted)" }}
                      >
                        No message data
                      </div>
                    ) : (
                      <div className="flex items-center gap-6">
                        <ResponsiveContainer width={120} height={120}>
                          <PieChart>
                            <Pie
                              data={messagesByStatus}
                              dataKey="count"
                              nameKey="status"
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={50}
                            >
                              {messagesByStatus.map((_, i) => (
                                <Cell
                                  key={i}
                                  fill={COLORS[i % COLORS.length]}
                                />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2">
                          {messagesByStatus.map((s, i) => (
                            <div
                              key={s.status}
                              className="flex items-center gap-2 text-[13px]"
                            >
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: COLORS[i % COLORS.length],
                                }}
                              />
                              <span
                                className="capitalize"
                                style={{ color: "var(--platform-text)" }}
                              >
                                {s.status}
                              </span>
                              <span
                                className="tabular-nums"
                                style={{ color: "var(--platform-text-muted)" }}
                              >
                                ({s.count})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </AdminSection>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

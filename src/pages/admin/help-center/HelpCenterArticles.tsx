import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Trash2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppButton } from "@/components/app-ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  published: boolean | null;
  view_count: number | null;
  helpful_count: number | null;
  not_helpful_count: number | null;
  created_at: string | null;
  category: Category | null;
}

const PAGE_SIZE = 20;

export default function HelpCenterArticles() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [search, categoryFilter, statusFilter, page]);

  async function fetchCategories() {
    const { data } = await supabase
      .from("categories")
      .select("id, name")
      .order("name");
    setCategories(data ?? []);
  }

  async function fetchArticles() {
    setLoading(true);

    let query = supabase
      .from("articles")
      .select("id, title, slug, published, view_count, helpful_count, not_helpful_count, created_at, category:categories(id, name)", { count: "exact" });

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }
    if (categoryFilter !== "all") {
      query = query.eq("category_id", categoryFilter);
    }
    if (statusFilter === "published") {
      query = query.eq("published", true);
    } else if (statusFilter === "draft") {
      query = query.eq("published", false);
    }

    query = query
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    const { data, count } = await query;

    setArticles((data as unknown as Article[]) ?? []);
    setTotalCount(count ?? 0);
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    const { error } = await supabase.from("articles").delete().eq("id", deleteId);
    if (error) {
      toast.error("Failed to delete article");
    } else {
      toast.success("Article deleted");
      fetchArticles();
    }
    setDeleteId(null);
  }

  function getHelpfulPercent(article: Article): string {
    const helpful = article.helpful_count ?? 0;
    const notHelpful = article.not_helpful_count ?? 0;
    const total = helpful + notHelpful;
    if (total === 0) return "—";
    return `${Math.round((helpful / total) * 100)}%`;
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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
                Articles
              </h1>
              <p
                className="text-[13px] mt-1"
                style={{ color: "var(--platform-text-muted)" }}
              >
                {totalCount} article{totalCount !== 1 ? "s" : ""}
              </p>
            </div>
            <AppButton
              intent="primary"
              onClick={() => navigate("/admin/help-center/articles/new")}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </AppButton>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: "var(--platform-text-muted)" }}
              />
              <Input
                placeholder="Search articles..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="pl-9"
                style={{
                  backgroundColor: "rgba(255,255,255,0.02)",
                  borderColor: "var(--platform-border)",
                  color: "var(--platform-text)",
                }}
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={(v) => {
                setCategoryFilter(v);
                setPage(0);
              }}
            >
              <SelectTrigger
                className="w-full md:w-[180px]"
                style={{
                  backgroundColor: "rgba(255,255,255,0.02)",
                  borderColor: "var(--platform-border)",
                  color: "var(--platform-text)",
                }}
              >
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(0);
              }}
            >
              <SelectTrigger
                className="w-full md:w-[140px]"
                style={{
                  backgroundColor: "rgba(255,255,255,0.02)",
                  borderColor: "var(--platform-border)",
                  color: "var(--platform-text)",
                }}
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className="text-left text-[11px] uppercase tracking-wide"
                  style={{
                    color: "var(--platform-text-muted)",
                    borderBottom: "1px solid var(--platform-border)",
                  }}
                >
                  <th className="pb-3 pr-4">Title</th>
                  <th className="pb-3 pr-4 hidden md:table-cell">Category</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4 hidden md:table-cell text-right">Views</th>
                  <th className="pb-3 pr-4 hidden md:table-cell text-right">Helpful</th>
                  <th className="pb-3 w-[80px]"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-[13px]"
                      style={{ color: "var(--platform-text-muted)" }}
                    >
                      Loading...
                    </td>
                  </tr>
                ) : articles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-[13px]"
                      style={{ color: "var(--platform-text-muted)" }}
                    >
                      No articles
                    </td>
                  </tr>
                ) : (
                  articles.map((article, i) => (
                    <tr
                      key={article.id}
                      className="group"
                      style={{
                        backgroundColor:
                          i % 2 === 1 ? "rgba(255,255,255,0.01)" : "transparent",
                        borderBottom: "1px solid var(--platform-border)",
                      }}
                    >
                      <td className="py-3 pr-4">
                        <span
                          className="text-[13px] font-medium truncate block max-w-[200px] md:max-w-[300px]"
                          style={{ color: "var(--platform-text)" }}
                        >
                          {article.title}
                        </span>
                      </td>
                      <td
                        className="py-3 pr-4 hidden md:table-cell text-[13px]"
                        style={{ color: "var(--platform-text-muted)" }}
                      >
                        {article.category?.name ?? "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge published={article.published ?? false} />
                      </td>
                      <td
                        className="py-3 pr-4 hidden md:table-cell text-right text-[13px] tabular-nums"
                        style={{ color: "var(--platform-text-muted)" }}
                      >
                        {article.view_count ?? 0}
                      </td>
                      <td
                        className="py-3 pr-4 hidden md:table-cell text-right text-[13px] tabular-nums"
                        style={{ color: "var(--platform-text-muted)" }}
                      >
                        {getHelpfulPercent(article)}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() =>
                              navigate(`/admin/help-center/articles/${article.id}/edit`)
                            }
                            className="p-2 rounded hover:bg-white/5"
                            style={{ color: "var(--platform-text-muted)" }}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(article.id)}
                            className="p-2 rounded hover:bg-white/5"
                            style={{ color: "var(--platform-text-muted)" }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: "1px solid var(--platform-border)" }}>
              <span
                className="text-[12px]"
                style={{ color: "var(--platform-text-muted)" }}
              >
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex gap-2">
                <AppButton
                  intent="secondary"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </AppButton>
                <AppButton
                  intent="secondary"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </AppButton>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The article will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium"
      style={{
        backgroundColor: published
          ? "rgba(34, 197, 94, 0.1)"
          : "rgba(255, 255, 255, 0.05)",
        color: published ? "rgb(34, 197, 94)" : "var(--platform-text-muted)",
      }}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}

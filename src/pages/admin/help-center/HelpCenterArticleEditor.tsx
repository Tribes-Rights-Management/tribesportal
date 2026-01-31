import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Archive, Pencil, Check, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppButton } from "@/components/app-ui";
import { toast } from "sonner";
import { useArticleAudience } from "@/hooks/useArticleAudience";
import { useCategoriesByAudience } from "@/hooks/useCategoriesByAudience";

interface Category {
  id: string;
  name: string;
}

interface Audience {
  id: string;
  name: string;
  slug: string;
}

interface ArticleForm {
  title: string;
  slug: string;
  body: string;
  meta_description: string;
  category_id: string;
  published: boolean;
}

const AUTOSAVE_KEY = "help-article-draft";

export default function HelpCenterArticleEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id && id !== "new";

  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [selectedAudienceId, setSelectedAudienceId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slugEditing, setSlugEditing] = useState(false);
  const [tempSlug, setTempSlug] = useState("");

  const { fetchAssignment, saveAssignment } = useArticleAudience();
  const { categories: audienceCategories, fetchCategoriesByAudience } = useCategoriesByAudience();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isDirty },
  } = useForm<ArticleForm>({
    defaultValues: {
      title: "",
      slug: "",
      body: "",
      meta_description: "",
      category_id: "",
      published: false,
    },
  });

  const title = watch("title");
  const slug = watch("slug");
  const published = watch("published");

  const selectedAudience = audiences.find(a => a.id === selectedAudienceId);

  // Generate slug from title
  useEffect(() => {
    if (!isEditing && title && !slugEditing) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", generatedSlug);
    }
  }, [title, isEditing, slugEditing, setValue]);

  // Load audiences
  useEffect(() => {
    async function fetchAudiences() {
      const { data } = await supabase
        .from("help_audiences")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("position");
      setAudiences(data ?? []);
    }
    fetchAudiences();
  }, []);

  // Load categories when audience changes
  useEffect(() => {
    if (selectedAudienceId) {
      fetchCategoriesByAudience(selectedAudienceId);
    }
  }, [selectedAudienceId, fetchCategoriesByAudience]);

  // Load existing audience assignment when editing
  useEffect(() => {
    async function loadAssignment() {
      if (isEditing && id) {
        const assignment = await fetchAssignment(id);
        if (assignment) {
          setSelectedAudienceId(assignment.audience_id);
          setSelectedCategoryId(assignment.category_id);
          setDisplayOrder(assignment.position);
        }
      }
    }
    loadAssignment();
  }, [id, isEditing, fetchAssignment]);

  // Load article if editing
  useEffect(() => {
    async function fetchArticle() {
      if (!isEditing) {
        const saved = localStorage.getItem(AUTOSAVE_KEY);
        if (saved) {
          try {
            const draft = JSON.parse(saved);
            reset(draft);
          } catch {
            // ignore
          }
        }
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast.error("Article not found");
        navigate("/admin/help-center/articles");
        return;
      }

      reset({
        title: data.title,
        slug: data.slug,
        body: data.body,
        meta_description: data.meta_description ?? "",
        category_id: data.category_id ?? "",
        published: data.published ?? false,
      });
      setLoading(false);
    }

    fetchArticle();
  }, [id, isEditing, navigate, reset]);

  // Autosave to localStorage
  const formValues = watch();
  const autosave = useCallback(() => {
    if (!isEditing && isDirty) {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(formValues));
    }
  }, [formValues, isEditing, isDirty]);

  useEffect(() => {
    const interval = setInterval(autosave, 30000);
    return () => clearInterval(interval);
  }, [autosave]);

  async function onSubmit(data: ArticleForm) {
    setSaving(true);

    const payload = {
      title: data.title,
      slug: data.slug,
      body: data.body,
      meta_description: data.meta_description || null,
      category_id: data.category_id || null,
      published: data.published,
    };

    let articleId = id;

    if (isEditing) {
      const { error } = await supabase
        .from("articles")
        .update(payload)
        .eq("id", id);

      if (error) {
        toast.error("Failed to update article");
        setSaving(false);
        return;
      }
    } else {
      const { data: insertedData, error } = await supabase
        .from("articles")
        .insert(payload)
        .select("id")
        .single();

      if (error || !insertedData) {
        toast.error("Failed to create article");
        setSaving(false);
        return;
      }
      articleId = insertedData.id;
      localStorage.removeItem(AUTOSAVE_KEY);
    }

    // Save audience/category assignment if selected
    if (articleId && selectedAudienceId && selectedCategoryId) {
      const saved = await saveAssignment(articleId, selectedAudienceId, selectedCategoryId, displayOrder);
      if (!saved) {
        toast.error("Article saved but audience assignment failed");
        setSaving(false);
        navigate("/admin/help-center/articles");
        return;
      }
    }

    toast.success(isEditing ? "Article updated" : "Article created");
    setSaving(false);
    navigate("/admin/help-center/articles");
  }

  async function handleSaveDraft() {
    const data = watch();
    setSaving(true);

    const payload = {
      title: data.title || "Untitled",
      slug: data.slug || `draft-${Date.now()}`,
      body: data.body,
      meta_description: data.meta_description || null,
      category_id: data.category_id || null,
      published: false,
    };

    let articleId = id;

    if (isEditing) {
      const { error } = await supabase
        .from("articles")
        .update({ ...payload, published: false })
        .eq("id", id);

      if (error) {
        toast.error("Failed to save draft");
        setSaving(false);
        return;
      }
    } else {
      const { data: insertedData, error } = await supabase
        .from("articles")
        .insert(payload)
        .select("id")
        .single();

      if (error || !insertedData) {
        toast.error("Failed to save draft");
        setSaving(false);
        return;
      }
      articleId = insertedData.id;
      localStorage.removeItem(AUTOSAVE_KEY);
    }

    // Save audience/category assignment if selected
    if (articleId && selectedAudienceId && selectedCategoryId) {
      await saveAssignment(articleId, selectedAudienceId, selectedCategoryId, displayOrder);
    }

    toast.success("Draft saved");
    setSaving(false);
    navigate("/admin/help-center/articles");
  }

  const startSlugEdit = () => {
    setTempSlug(slug);
    setSlugEditing(true);
  };

  const confirmSlugEdit = () => {
    setValue("slug", tempSlug);
    setSlugEditing(false);
  };

  const cancelSlugEdit = () => {
    setTempSlug("");
    setSlugEditing(false);
  };

  if (loading) {
    return (
      <div
        className="min-h-full flex items-center justify-center"
        style={{ backgroundColor: "var(--platform-canvas)" }}
      >
        <span style={{ color: "var(--platform-text-muted)" }}>Loading...</span>
      </div>
    );
  }

  return (
    <div
      className="min-h-full flex flex-col"
      style={{ backgroundColor: "var(--platform-canvas)" }}
    >
      {/* TOP BAR */}
      <div
        className="flex-shrink-0 px-4 md:px-6 py-3"
        style={{
          backgroundColor: "var(--platform-surface)",
          borderBottom: "1px solid var(--platform-border)",
        }}
      >
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/admin/help-center/articles")}
            className="flex items-center gap-1.5 text-[13px] hover:opacity-70 transition-opacity"
            style={{ color: "var(--platform-text-muted)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Articles
          </button>

          <div className="flex items-center gap-2">
            <AppButton
              type="button"
              intent="secondary"
              size="sm"
              onClick={handleSaveDraft}
              disabled={saving}
            >
              <Archive className="h-3.5 w-3.5 mr-1.5" />
              Draft
            </AppButton>
            <AppButton
              type="button"
              intent="primary"
              size="sm"
              onClick={handleSubmit(onSubmit)}
              disabled={saving}
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {published ? "Publish" : "Save"}
            </AppButton>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 px-4 md:px-6 py-5">
        <div className="max-w-[1200px] mx-auto space-y-4">
          {/* HEADER ROW - Title + Status */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <Input
              {...register("title", { required: true })}
              placeholder="Article title"
              className="w-full md:flex-1 text-[18px] font-medium h-11"
              style={{
                backgroundColor: "var(--platform-surface)",
                borderColor: "var(--platform-border)",
                color: "var(--platform-text)",
              }}
            />
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-medium uppercase tracking-wide whitespace-nowrap"
                style={{
                  backgroundColor: published
                    ? "rgba(34, 197, 94, 0.1)"
                    : "rgba(156, 163, 175, 0.15)",
                  color: published ? "#16a34a" : "var(--platform-text-muted)",
                }}
              >
                {published ? "Published" : "Draft"}
              </span>
              <Switch
                checked={published}
                onCheckedChange={(v) => setValue("published", v)}
                className="scale-90"
              />
            </div>
          </div>

          {/* SLUG ROW - Compact inline */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded"
            style={{
              backgroundColor: "var(--platform-surface)",
              border: "1px solid var(--platform-border)",
            }}
          >
            <span
              className="text-[12px] font-medium shrink-0"
              style={{ color: "var(--platform-text-muted)" }}
            >
              URL:
            </span>
            <span
              className="text-[12px]"
              style={{ color: "var(--platform-text-muted)" }}
            >
              /help/{selectedAudience?.slug || "[audience]"}/articles/
            </span>
            {slugEditing ? (
              <div className="flex items-center gap-1 flex-1">
                <Input
                  value={tempSlug}
                  onChange={(e) => setTempSlug(e.target.value)}
                  className="h-7 text-[12px] flex-1 max-w-[200px]"
                  style={{
                    backgroundColor: "var(--platform-canvas)",
                    borderColor: "var(--platform-border)",
                    color: "var(--platform-text)",
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={confirmSlugEdit}
                  className="p-1 rounded hover:bg-[var(--platform-border)]"
                  style={{ color: "#16a34a" }}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={cancelSlugEdit}
                  className="p-1 rounded hover:bg-[var(--platform-border)]"
                  style={{ color: "var(--platform-text-muted)" }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 flex-1">
                <span
                  className="text-[12px] font-medium"
                  style={{ color: "var(--platform-text)" }}
                >
                  {slug || "article-slug"}
                </span>
                <button
                  type="button"
                  onClick={startSlugEdit}
                  className="p-0.5 rounded hover:bg-[var(--platform-border)]"
                  style={{ color: "var(--platform-text-muted)" }}
                >
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* PUBLISHING SETTINGS - Vertical on mobile, horizontal on desktop */}
          <div
            className="flex flex-col gap-3 px-4 py-3 rounded md:flex-row md:items-end"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.02)",
              border: "1px solid var(--platform-border)",
            }}
          >
            <div className="w-full md:flex-1">
              <Label
                className="text-[10px] uppercase tracking-wider mb-1 block font-medium"
                style={{ color: "var(--platform-text-muted)" }}
              >
                Audience
              </Label>
              <Select
                value={selectedAudienceId}
                onValueChange={(v) => {
                  setSelectedAudienceId(v);
                  setSelectedCategoryId("");
                }}
              >
                <SelectTrigger
                  className="w-full h-9"
                  style={{
                    backgroundColor: "var(--platform-surface)",
                    borderColor: "var(--platform-border)",
                    color: "var(--platform-text)",
                  }}
                >
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  {audiences.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:flex-1">
              <Label
                className="text-[10px] uppercase tracking-wider mb-1 block font-medium"
                style={{ color: "var(--platform-text-muted)" }}
              >
                Category
              </Label>
              {selectedAudienceId && audienceCategories.length === 0 ? (
                <div
                  className="text-[12px] h-9 flex items-center px-3 rounded"
                  style={{
                    backgroundColor: "var(--platform-surface)",
                    border: "1px solid var(--platform-border)",
                    color: "var(--platform-text-muted)",
                  }}
                >
                  None available.{" "}
                  <Link
                    to="/help/categories"
                    className="ml-1 hover:underline"
                    style={{ color: "var(--platform-accent)" }}
                  >
                    Create →
                  </Link>
                </div>
              ) : (
                <Select
                  value={selectedCategoryId}
                  onValueChange={setSelectedCategoryId}
                  disabled={!selectedAudienceId}
                >
                  <SelectTrigger
                    className="w-full h-9"
                    style={{
                      backgroundColor: "var(--platform-surface)",
                      borderColor: "var(--platform-border)",
                      color: !selectedAudienceId
                        ? "var(--platform-text-muted)"
                        : "var(--platform-text)",
                    }}
                  >
                    <SelectValue
                      placeholder={!selectedAudienceId ? "Select audience first" : "Select category"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {audienceCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="w-full md:w-24">
              <Label
                className="text-[10px] uppercase tracking-wider mb-1 block font-medium"
                style={{ color: "var(--platform-text-muted)" }}
              >
                Order
              </Label>
              <Input
                type="number"
                min={0}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                className="w-full h-9"
                style={{
                  backgroundColor: "var(--platform-surface)",
                  borderColor: "var(--platform-border)",
                  color: "var(--platform-text)",
                }}
              />
            </div>
          </div>

          {/* Mobile separator before content */}
          <div
            className="md:hidden h-px"
            style={{ backgroundColor: "var(--platform-border)" }}
          />

          {/* CONTENT - Main editor */}
          <div className="flex-1">
            <Label
              className="text-[10px] uppercase tracking-wider mb-1.5 block font-medium"
              style={{ color: "var(--platform-text-muted)" }}
            >
              Content
            </Label>
            <Textarea
              {...register("body", { required: true })}
              placeholder="Article content (supports Markdown)"
              className="font-mono text-[13px] w-full"
              style={{
                backgroundColor: "var(--platform-surface)",
                borderColor: "var(--platform-border)",
                color: "var(--platform-text)",
                minHeight: "calc(100vh - 380px)",
              }}
            />
          </div>
        </div>
      </form>
    </div>
  );
}

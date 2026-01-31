import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Archive } from "lucide-react";
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
import { format } from "date-fns";

interface Category {
  id: string;
  name: string;
}

interface Audience {
  id: string;
  name: string;
}

interface ArticleForm {
  title: string;
  slug: string;
  body: string;
  meta_description: string;
  category_id: string;
  published: boolean;
}

interface ArticleMeta {
  created_at: string | null;
  updated_at: string | null;
}

const AUTOSAVE_KEY = "help-article-draft";

export default function HelpCenterArticleEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id && id !== "new";

  const [categories, setCategories] = useState<Category[]>([]);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [selectedAudienceId, setSelectedAudienceId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [articleMeta, setArticleMeta] = useState<ArticleMeta>({ created_at: null, updated_at: null });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
  const published = watch("published");

  // Generate slug from title
  useEffect(() => {
    if (!isEditing && title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", slug);
    }
  }, [title, isEditing, setValue]);

  // Load categories (legacy)
  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");
      setCategories(data ?? []);
    }
    fetchCategories();
  }, []);

  // Load audiences
  useEffect(() => {
    async function fetchAudiences() {
      const { data } = await supabase
        .from("help_audiences")
        .select("id, name")
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
      setArticleMeta({
        created_at: data.created_at,
        updated_at: data.updated_at,
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch {
      return "—";
    }
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
      className="min-h-full"
      style={{ backgroundColor: "var(--platform-canvas)" }}
    >
      {/* Top Bar */}
      <div
        className="sticky top-0 z-10 px-6 py-4"
        style={{
          backgroundColor: "var(--platform-canvas)",
          borderBottom: "1px solid var(--platform-border)",
        }}
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/admin/help-center/articles")}
            className="flex items-center gap-2 text-[13px] hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] rounded"
            style={{ color: "var(--platform-text-muted)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Articles
          </button>

          <div className="flex items-center gap-3">
            <AppButton
              type="button"
              intent="secondary"
              size="sm"
              onClick={handleSaveDraft}
              disabled={saving}
            >
              <Archive className="h-4 w-4 mr-1.5" />
              Save Draft
            </AppButton>
            <AppButton
              type="button"
              intent="primary"
              size="sm"
              onClick={handleSubmit(onSubmit)}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-1.5" />
              {published ? "Publish" : "Save"}
            </AppButton>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* LEFT COLUMN - Content Editing */}
            <div className="flex-1 lg:w-[65%] space-y-6">
              {/* Title Row with Status */}
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <Label
                    htmlFor="title"
                    className="text-[12px] uppercase tracking-wider mb-2 block font-medium"
                    style={{ color: "var(--platform-text-muted)" }}
                  >
                    Title
                  </Label>
                  <Input
                    id="title"
                    {...register("title", { required: true })}
                    placeholder="Article title"
                    className="text-[16px]"
                    style={{
                      backgroundColor: "var(--platform-surface)",
                      borderColor: "var(--platform-border)",
                      color: "var(--platform-text)",
                    }}
                  />
                </div>
                <div className="pt-7">
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-medium uppercase tracking-wide"
                    style={{
                      backgroundColor: published
                        ? "rgba(34, 197, 94, 0.1)"
                        : "rgba(156, 163, 175, 0.1)",
                      color: published ? "#16a34a" : "var(--platform-text-muted)",
                    }}
                  >
                    {published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>

              {/* Slug */}
              <div>
                <Label
                  htmlFor="slug"
                  className="text-[12px] uppercase tracking-wider mb-2 block font-medium"
                  style={{ color: "var(--platform-text-muted)" }}
                >
                  Slug
                </Label>
                <Input
                  id="slug"
                  {...register("slug", { required: true })}
                  placeholder="article-slug"
                  style={{
                    backgroundColor: "var(--platform-surface)",
                    borderColor: "var(--platform-border)",
                    color: "var(--platform-text)",
                  }}
                />
              </div>

              {/* Meta Description */}
              <div>
                <Label
                  htmlFor="meta_description"
                  className="text-[12px] uppercase tracking-wider mb-2 block font-medium"
                  style={{ color: "var(--platform-text-muted)" }}
                >
                  Meta Description
                </Label>
                <Textarea
                  id="meta_description"
                  {...register("meta_description")}
                  placeholder="Brief description for search results"
                  rows={2}
                  style={{
                    backgroundColor: "var(--platform-surface)",
                    borderColor: "var(--platform-border)",
                    color: "var(--platform-text)",
                  }}
                />
              </div>

              {/* Content */}
              <div>
                <Label
                  htmlFor="body"
                  className="text-[12px] uppercase tracking-wider mb-2 block font-medium"
                  style={{ color: "var(--platform-text-muted)" }}
                >
                  Content
                </Label>
                <Textarea
                  id="body"
                  {...register("body", { required: true })}
                  placeholder="Article content (supports Markdown)"
                  rows={20}
                  className="font-mono text-[13px]"
                  style={{
                    backgroundColor: "var(--platform-surface)",
                    borderColor: "var(--platform-border)",
                    color: "var(--platform-text)",
                    minHeight: "400px",
                  }}
                />
              </div>
            </div>

            {/* RIGHT COLUMN - Metadata Sidebar */}
            <div className="lg:w-[35%]">
              <div className="lg:sticky lg:top-24 space-y-6">
                {/* Publishing Settings Card */}
                <div
                  className="rounded-lg p-5"
                  style={{
                    backgroundColor: "var(--platform-surface)",
                    border: "1px solid var(--platform-border)",
                  }}
                >
                  <h3
                    className="text-[12px] uppercase tracking-wider font-medium mb-4"
                    style={{ color: "var(--platform-text-muted)" }}
                  >
                    Publishing Settings
                  </h3>

                  <div className="space-y-4">
                    {/* Audience */}
                    <div>
                      <Label
                        htmlFor="audience"
                        className="text-[12px] uppercase tracking-wider mb-2 block font-medium"
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
                          className="w-full"
                          style={{
                            backgroundColor: "var(--platform-canvas)",
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

                    {/* Category */}
                    <div>
                      <Label
                        htmlFor="audienceCategory"
                        className="text-[12px] uppercase tracking-wider mb-2 block font-medium"
                        style={{ color: "var(--platform-text-muted)" }}
                      >
                        Category
                      </Label>
                      <Select
                        value={selectedCategoryId}
                        onValueChange={setSelectedCategoryId}
                        disabled={!selectedAudienceId}
                      >
                        <SelectTrigger
                          className="w-full"
                          style={{
                            backgroundColor: "var(--platform-canvas)",
                            borderColor: "var(--platform-border)",
                            color: !selectedAudienceId
                              ? "var(--platform-text-muted)"
                              : "var(--platform-text)",
                          }}
                        >
                          <SelectValue
                            placeholder={
                              !selectedAudienceId
                                ? "Select audience first"
                                : audienceCategories.length === 0
                                ? "No categories available"
                                : "Select category"
                            }
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
                    </div>

                    {/* Display Order */}
                    <div>
                      <Label
                        htmlFor="displayOrder"
                        className="text-[12px] uppercase tracking-wider mb-2 block font-medium"
                        style={{ color: "var(--platform-text-muted)" }}
                      >
                        Display Order
                      </Label>
                      <Input
                        id="displayOrder"
                        type="number"
                        min={0}
                        value={displayOrder}
                        onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                        className="w-24"
                        style={{
                          backgroundColor: "var(--platform-canvas)",
                          borderColor: "var(--platform-border)",
                          color: "var(--platform-text)",
                        }}
                      />
                    </div>

                    {/* Status Toggle */}
                    <div
                      className="pt-4 mt-4"
                      style={{ borderTop: "1px solid var(--platform-border)" }}
                    >
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="published"
                          className="text-[13px] font-medium"
                          style={{ color: "var(--platform-text)" }}
                        >
                          Published
                        </Label>
                        <Switch
                          id="published"
                          checked={published}
                          onCheckedChange={(v) => setValue("published", v)}
                        />
                      </div>
                      <p
                        className="text-[12px] mt-1"
                        style={{ color: "var(--platform-text-muted)" }}
                      >
                        Make this article visible in the Help Center
                      </p>
                    </div>
                  </div>
                </div>

                {/* Article Info Card */}
                {isEditing && (
                  <div
                    className="rounded-lg p-5"
                    style={{
                      backgroundColor: "var(--platform-surface)",
                      border: "1px solid var(--platform-border)",
                    }}
                  >
                    <h3
                      className="text-[12px] uppercase tracking-wider font-medium mb-4"
                      style={{ color: "var(--platform-text-muted)" }}
                    >
                      Article Info
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <span
                          className="text-[12px] block"
                          style={{ color: "var(--platform-text-muted)" }}
                        >
                          Created
                        </span>
                        <span
                          className="text-[13px]"
                          style={{ color: "var(--platform-text)" }}
                        >
                          {formatDate(articleMeta.created_at)}
                        </span>
                      </div>
                      <div>
                        <span
                          className="text-[12px] block"
                          style={{ color: "var(--platform-text-muted)" }}
                        >
                          Last Updated
                        </span>
                        <span
                          className="text-[13px]"
                          style={{ color: "var(--platform-text)" }}
                        >
                          {formatDate(articleMeta.updated_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Help Text */}
                <p
                  className="text-[12px] px-1"
                  style={{ color: "var(--platform-text-muted)" }}
                >
                  Assign an audience and category for this article to appear in the public Help Center.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

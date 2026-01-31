import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Eye } from "lucide-react";
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

  const [categories, setCategories] = useState<Category[]>([]);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [selectedAudienceId, setSelectedAudienceId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
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
        }
      }
    }
    loadAssignment();
  }, [id, isEditing, fetchAssignment]);

  // Load article if editing
  useEffect(() => {
    async function fetchArticle() {
      if (!isEditing) {
        // Check for autosaved draft
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
      const saved = await saveAssignment(articleId, selectedAudienceId, selectedCategoryId, 0);
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
      const { error } = await supabase.from("articles").insert(payload);

      if (error) {
        toast.error("Failed to save draft");
        setSaving(false);
        return;
      }
      localStorage.removeItem(AUTOSAVE_KEY);
    }

    toast.success("Draft saved");
    setSaving(false);
    navigate("/admin/help-center/articles");
  }

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
      className="min-h-full py-12 md:py-16 px-4 md:px-6"
      style={{ backgroundColor: "var(--platform-canvas)" }}
    >
      <div
        className="max-w-[760px] mx-auto rounded-lg"
        style={{
          backgroundColor: "var(--platform-surface)",
          border: "1px solid var(--platform-border)",
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              type="button"
              onClick={() => navigate("/admin/help-center/articles")}
              className="p-2 rounded-md hover:bg-[var(--muted-wash)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]"
              style={{ color: "var(--platform-text-muted)" }}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1
              className="text-[20px] font-medium"
              style={{ color: "var(--platform-text)" }}
            >
              {isEditing ? "Edit Article" : "New Article"}
            </h1>
          </div>

          {/* Form fields */}
          <div className="space-y-6">
            <div>
              <Label
                htmlFor="title"
                className="text-[12px] uppercase tracking-wide mb-2 block"
                style={{ color: "var(--platform-text-muted)" }}
              >
                Title
              </Label>
              <Input
                id="title"
                {...register("title", { required: true })}
                placeholder="Article title"
                style={{
                  backgroundColor: "rgba(255,255,255,0.02)",
                  borderColor: "var(--platform-border)",
                  color: "var(--platform-text)",
                }}
              />
            </div>

            <div>
              <Label
                htmlFor="slug"
                className="text-[12px] uppercase tracking-wide mb-2 block"
                style={{ color: "var(--platform-text-muted)" }}
              >
                Slug
              </Label>
              <Input
                id="slug"
                {...register("slug", { required: true })}
                placeholder="article-slug"
                style={{
                  backgroundColor: "rgba(255,255,255,0.02)",
                  borderColor: "var(--platform-border)",
                  color: "var(--platform-text)",
                }}
              />
            </div>

            <div>
              <Label
                htmlFor="category"
                className="text-[12px] uppercase tracking-wide mb-2 block"
                style={{ color: "var(--platform-text-muted)" }}
              >
                Category
              </Label>
              <Select
                value={watch("category_id")}
                onValueChange={(v) => setValue("category_id", v)}
              >
                <SelectTrigger
                  style={{
                    backgroundColor: "rgba(255,255,255,0.02)",
                    borderColor: "var(--platform-border)",
                    color: "var(--platform-text)",
                  }}
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                htmlFor="meta_description"
                className="text-[12px] uppercase tracking-wide mb-2 block"
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
                  backgroundColor: "rgba(255,255,255,0.02)",
                  borderColor: "var(--platform-border)",
                  color: "var(--platform-text)",
                }}
              />
            </div>

            <div>
              <Label
                htmlFor="body"
                className="text-[12px] uppercase tracking-wide mb-2 block"
                style={{ color: "var(--platform-text-muted)" }}
              >
                Content
              </Label>
              <Textarea
                id="body"
                {...register("body", { required: true })}
                placeholder="Article content (supports Markdown)"
                rows={16}
                className="font-mono text-[13px]"
                style={{
                  backgroundColor: "rgba(255,255,255,0.02)",
                  borderColor: "var(--platform-border)",
                  color: "var(--platform-text)",
                }}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="published"
                checked={published}
                onCheckedChange={(v) => setValue("published", v)}
              />
              <Label
                htmlFor="published"
                className="text-[13px]"
                style={{ color: "var(--platform-text)" }}
              >
                Published
              </Label>
            </div>

            {/* Publishing Settings Section */}
            <div
              className="mt-8 pt-6"
              style={{ borderTop: "1px solid var(--platform-border)" }}
            >
              <h3
                className="text-[13px] uppercase tracking-wider font-medium mb-4"
                style={{ color: "var(--platform-text-muted)" }}
              >
                Publishing Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="audience"
                    className="text-[13px] uppercase tracking-wider mb-2 block"
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
                      style={{
                        backgroundColor: "rgba(255,255,255,0.02)",
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

                <div>
                  <Label
                    htmlFor="audienceCategory"
                    className="text-[13px] uppercase tracking-wider mb-2 block"
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
                      style={{
                        backgroundColor: "rgba(255,255,255,0.02)",
                        borderColor: "var(--platform-border)",
                        color: !selectedAudienceId ? "var(--platform-text-muted)" : "var(--platform-text)",
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
              </div>
              <p
                className="text-[12px] mt-2"
                style={{ color: "var(--platform-text-muted)" }}
              >
                Assign an audience and category for this article to appear in the Help Center.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 mt-10 pt-6"
            style={{ borderTop: "1px solid var(--platform-border)" }}
          >
            <AppButton
              type="button"
              intent="secondary"
              onClick={handleSaveDraft}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </AppButton>
            <AppButton type="submit" intent="primary" disabled={saving}>
              <Eye className="h-4 w-4 mr-2" />
              {published ? "Publish" : "Save"}
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  );
}

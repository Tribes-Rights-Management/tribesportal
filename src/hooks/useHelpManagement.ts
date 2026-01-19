import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

/**
 * HELP MANAGEMENT HOOK
 * 
 * Company-scoped hook for managing Help articles and categories.
 * Uses platform_user_capabilities.can_manage_help or platform_admin for access.
 */

export type HelpArticleStatus = "draft" | "published" | "archived";
export type HelpVisibility = "public" | "internal";

export interface HelpCategory {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

export interface HelpArticle {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body_md: string;
  category_id: string | null;
  tags: string[];
  status: HelpArticleStatus;
  visibility: HelpVisibility;
  version: number;
  published_at: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  // Joined category
  category?: HelpCategory;
}

export interface HelpArticleRevision {
  id: string;
  article_id: string;
  version: number;
  title: string;
  summary: string | null;
  body_md: string;
  status: HelpArticleStatus;
  visibility: HelpVisibility;
  actor_user_id: string | null;
  created_at: string;
}

interface UseHelpManagementResult {
  // Access
  canManageHelp: boolean;
  accessLoading: boolean;
  
  // Articles
  articles: HelpArticle[];
  articlesLoading: boolean;
  fetchArticles: (filters?: ArticleFilters) => Promise<void>;
  createArticle: (article: CreateArticleInput) => Promise<HelpArticle | null>;
  updateArticle: (id: string, updates: UpdateArticleInput) => Promise<HelpArticle | null>;
  deleteArticle: (id: string) => Promise<boolean>;
  publishArticle: (id: string) => Promise<boolean>;
  archiveArticle: (id: string) => Promise<boolean>;
  
  // Categories
  categories: HelpCategory[];
  categoriesLoading: boolean;
  fetchCategories: () => Promise<void>;
  createCategory: (category: CreateCategoryInput) => Promise<HelpCategory | null>;
  updateCategory: (id: string, updates: UpdateCategoryInput) => Promise<HelpCategory | null>;
  deleteCategory: (id: string) => Promise<boolean>;
  
  // Revisions
  fetchRevisions: (articleId: string) => Promise<HelpArticleRevision[]>;
}

export interface ArticleFilters {
  status?: HelpArticleStatus;
  visibility?: HelpVisibility;
  category_id?: string;
  search?: string;
}

interface CreateArticleInput {
  title: string;
  slug: string;
  summary?: string;
  body_md: string;
  category_id?: string;
  tags?: string[];
  visibility?: HelpVisibility;
}

interface UpdateArticleInput {
  title?: string;
  slug?: string;
  summary?: string;
  body_md?: string;
  category_id?: string | null;
  tags?: string[];
  status?: HelpArticleStatus;
  visibility?: HelpVisibility;
}

interface CreateCategoryInput {
  name: string;
  slug: string;
  sort_order?: number;
}

interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  sort_order?: number;
}

export function useHelpManagement(): UseHelpManagementResult {
  const { user, isPlatformAdmin } = useAuth();
  
  const [canManageHelp, setCanManageHelp] = useState(false);
  const [accessLoading, setAccessLoading] = useState(true);
  
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Check access on mount
  useEffect(() => {
    async function checkAccess() {
      if (isPlatformAdmin) {
        setCanManageHelp(true);
        setAccessLoading(false);
        return;
      }

      if (!user?.id) {
        setCanManageHelp(false);
        setAccessLoading(false);
        return;
      }

      // Check via RPC
      const { data, error } = await supabase.rpc("can_manage_help", {
        _user_id: user.id,
      });

      if (error) {
        console.error("Error checking help access:", error);
        setCanManageHelp(false);
      } else {
        setCanManageHelp(data === true);
      }

      setAccessLoading(false);
    }

    checkAccess();
  }, [user?.id, isPlatformAdmin]);

  // Fetch articles
  const fetchArticles = useCallback(async (filters?: ArticleFilters) => {
    setArticlesLoading(true);
    
    let query = supabase
      .from("help_articles")
      .select("*, category:help_categories(id, name, slug)")
      .order("updated_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.visibility) {
      query = query.eq("visibility", filters.visibility);
    }
    if (filters?.category_id) {
      query = query.eq("category_id", filters.category_id);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching articles:", error);
      toast({ description: "Failed to load articles", variant: "destructive" });
    } else {
      setArticles((data as HelpArticle[]) || []);
    }

    setArticlesLoading(false);
  }, []);

  // Create article
  const createArticle = useCallback(async (input: CreateArticleInput): Promise<HelpArticle | null> => {
    const { data, error } = await supabase
      .from("help_articles")
      .insert({
        title: input.title,
        slug: input.slug,
        summary: input.summary || null,
        body_md: input.body_md,
        category_id: input.category_id || null,
        tags: input.tags || [],
        visibility: input.visibility || "public",
        status: "draft",
        created_by: user?.id,
        updated_by: user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating article:", error);
      toast({ description: "Failed to create article", variant: "destructive" });
      return null;
    }

    toast({ description: "Article created" });
    return data as HelpArticle;
  }, [user?.id]);

  // Update article
  const updateArticle = useCallback(async (id: string, updates: UpdateArticleInput): Promise<HelpArticle | null> => {
    const { data, error } = await supabase
      .from("help_articles")
      .update({
        ...updates,
        updated_by: user?.id,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating article:", error);
      toast({ description: "Failed to save changes", variant: "destructive" });
      return null;
    }

    toast({ description: "Changes saved" });
    return data as HelpArticle;
  }, [user?.id]);

  // Delete article
  const deleteArticle = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from("help_articles")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting article:", error);
      toast({ description: "Failed to delete article", variant: "destructive" });
      return false;
    }

    toast({ description: "Article deleted" });
    return true;
  }, []);

  // Publish article
  const publishArticle = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from("help_articles")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        updated_by: user?.id,
      })
      .eq("id", id);

    if (error) {
      console.error("Error publishing article:", error);
      toast({ description: "Failed to publish", variant: "destructive" });
      return false;
    }

    toast({ description: "Article published" });
    return true;
  }, [user?.id]);

  // Archive article
  const archiveArticle = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from("help_articles")
      .update({
        status: "archived",
        updated_by: user?.id,
      })
      .eq("id", id);

    if (error) {
      console.error("Error archiving article:", error);
      toast({ description: "Failed to archive", variant: "destructive" });
      return false;
    }

    toast({ description: "Article archived" });
    return true;
  }, [user?.id]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    
    const { data, error } = await supabase
      .from("help_categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      toast({ description: "Failed to load categories", variant: "destructive" });
    } else {
      setCategories((data as HelpCategory[]) || []);
    }

    setCategoriesLoading(false);
  }, []);

  // Create category
  const createCategory = useCallback(async (input: CreateCategoryInput): Promise<HelpCategory | null> => {
    const { data, error } = await supabase
      .from("help_categories")
      .insert({
        name: input.name,
        slug: input.slug,
        sort_order: input.sort_order ?? 100,
        created_by: user?.id,
        updated_by: user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
      toast({ description: "Failed to create category", variant: "destructive" });
      return null;
    }

    toast({ description: "Category created" });
    return data as HelpCategory;
  }, [user?.id]);

  // Update category
  const updateCategory = useCallback(async (id: string, updates: UpdateCategoryInput): Promise<HelpCategory | null> => {
    const { data, error } = await supabase
      .from("help_categories")
      .update({
        ...updates,
        updated_by: user?.id,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating category:", error);
      toast({ description: "Failed to save changes", variant: "destructive" });
      return null;
    }

    toast({ description: "Changes saved" });
    return data as HelpCategory;
  }, [user?.id]);

  // Delete category
  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from("help_categories")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting category:", error);
      toast({ description: "Failed to delete category", variant: "destructive" });
      return false;
    }

    toast({ description: "Category deleted" });
    return true;
  }, []);

  // Fetch revisions for an article
  const fetchRevisions = useCallback(async (articleId: string): Promise<HelpArticleRevision[]> => {
    const { data, error } = await supabase
      .from("help_article_revisions")
      .select("*")
      .eq("article_id", articleId)
      .order("version", { ascending: false });

    if (error) {
      console.error("Error fetching revisions:", error);
      return [];
    }

    return (data as HelpArticleRevision[]) || [];
  }, []);

  return {
    canManageHelp,
    accessLoading,
    articles,
    articlesLoading,
    fetchArticles,
    createArticle,
    updateArticle,
    deleteArticle,
    publishArticle,
    archiveArticle,
    categories,
    categoriesLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchRevisions,
  };
}

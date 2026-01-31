import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * HELP MANAGEMENT HOOK
 * 
 * INSTITUTIONAL ERROR HANDLING:
 * - No toast notifications - pages handle errors inline
 * - Functions return null/false on error
 * - Console logs preserved for debugging
 *
 * Company-scoped hook for managing Help articles and categories.
 * Uses platform_user_capabilities.can_manage_help or platform_admin for access.
 * 
 * Simplified to match actual database schema:
 * - help_articles: id, title, slug, content, status, created_at, updated_at, published_at
 * - help_categories: id, name, slug, description, icon, created_at, updated_at
 * - help_audiences: id, name, slug, description, position, is_active
 * - help_category_audiences: junction table
 * - help_article_audiences: junction table with overrides
 */

export type HelpArticleStatus = "draft" | "internal" | "published" | "archived";
export type HelpVisibility = "public" | "internal";

export interface HelpCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface HelpAudience {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HelpArticle {
  id: string;
  slug: string;
  title: string;
  content: string;
  status: HelpArticleStatus;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  // For UI compatibility
  body_md?: string;
  visibility?: HelpVisibility;
  category_id?: string | null;
  category?: Pick<HelpCategory, 'id' | 'name' | 'slug'>;
  // Audience assignments
  help_article_audiences?: HelpArticleAudience[];
}

export interface HelpArticleAudience {
  id: string;
  article_id: string;
  audience_id: string;
  category_id: string;
  position: number;
  title_override: string | null;
  content_override: string | null;
  created_at: string;
  // Joined
  help_audiences?: HelpAudience;
  help_categories?: HelpCategory;
}

export interface HelpCategoryAudience {
  id: string;
  category_id: string;
  audience_id: string;
  position: number;
  created_at: string;
  // Joined
  help_audiences?: HelpAudience;
}

// Legacy revision interface for backward compatibility
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

// Legacy version interface
export interface HelpArticleVersion {
  id: string;
  article_id: string;
  title: string;
  summary: string | null;
  body_md: string;
  category_id: string | null;
  visibility: HelpVisibility;
  status: HelpArticleStatus;
  created_at: string;
  created_by: string | null;
  requires_approval: boolean;
  approved_at: string | null;
  approved_by: string | null;
  approval_notes: string | null;
}

interface UseHelpManagementResult {
  // Access
  canManageHelp: boolean;
  accessLoading: boolean;
  
  // Articles
  articles: HelpArticle[];
  articlesLoading: boolean;
  articlesError: string | null;
  fetchArticles: (filters?: ArticleFilters) => Promise<void>;
  fetchArticleWithVersion: (id: string) => Promise<HelpArticle | null>;
  createArticle: (article: CreateArticleInput) => Promise<HelpArticle | null>;
  createVersion: (articleId: string, content: CreateVersionInput) => Promise<string | null>;
  publishVersion: (articleId: string, versionId: string) => Promise<boolean>;
  archiveArticle: (id: string) => Promise<boolean>;
  restoreArticle: (id: string) => Promise<boolean>;
  
  // Categories
  categories: HelpCategory[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (category: CreateCategoryInput) => Promise<HelpCategory | null>;
  updateCategory: (id: string, updates: UpdateCategoryInput) => Promise<HelpCategory | null>;
  deleteCategory: (id: string) => Promise<boolean>;
  
  // Audiences
  audiences: HelpAudience[];
  audiencesLoading: boolean;
  audiencesError: string | null;
  fetchAudiences: () => Promise<void>;
  
  // Versions (legacy compatibility)
  fetchVersions: (articleId: string) => Promise<HelpArticleVersion[]>;
  
  // Legacy (deprecated)
  updateArticle: (id: string, updates: UpdateArticleInput) => Promise<HelpArticle | null>;
  deleteArticle: (id: string) => Promise<boolean>;
  publishArticle: (id: string) => Promise<boolean>;
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
  visibility?: HelpVisibility;
}

interface CreateVersionInput {
  title: string;
  slug?: string;
  summary?: string;
  body_md: string;
  category_id?: string | null;
  visibility?: HelpVisibility;
}

interface UpdateArticleInput {
  title?: string;
  slug?: string;
  summary?: string;
  body_md?: string;
  category_id?: string | null;
  status?: HelpArticleStatus;
  visibility?: HelpVisibility;
}

interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
}

export function useHelpManagement(): UseHelpManagementResult {
  const { user, isPlatformAdmin } = useAuth();
  
  const [canManageHelp, setCanManageHelp] = useState(false);
  const [accessLoading, setAccessLoading] = useState(true);
  
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesError, setArticlesError] = useState<string | null>(null);
  
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  
  const [audiences, setAudiences] = useState<HelpAudience[]>([]);
  const [audiencesLoading, setAudiencesLoading] = useState(false);
  const [audiencesError, setAudiencesError] = useState<string | null>(null);

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
    setArticlesError(null);
    
    let query = supabase
      .from("help_articles")
      .select("*")
      .order("updated_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching articles:", error);
      setArticlesError("Unable to load articles");
      setArticlesLoading(false);
      return;
    }

    // Map to our interface with compatibility fields
    let mappedArticles: HelpArticle[] = (data || []).map(a => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      content: a.content,
      status: a.status as HelpArticleStatus,
      created_at: a.created_at || new Date().toISOString(),
      updated_at: a.updated_at || new Date().toISOString(),
      published_at: a.published_at,
      // Compatibility fields
      body_md: a.content,
      visibility: "public" as HelpVisibility,
    }));

    // Apply search filter
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      mappedArticles = mappedArticles.filter(a =>
        a.title?.toLowerCase().includes(searchLower) ||
        a.slug.toLowerCase().includes(searchLower) ||
        a.content?.toLowerCase().includes(searchLower)
      );
    }

    setArticles(mappedArticles);
    setArticlesLoading(false);
  }, []);

  // Fetch single article
  const fetchArticleWithVersion = useCallback(async (id: string): Promise<HelpArticle | null> => {
    const { data, error } = await supabase
      .from("help_articles")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("Error fetching article:", error);
      return null;
    }

    return {
      id: data.id,
      slug: data.slug,
      title: data.title,
      content: data.content,
      status: data.status as HelpArticleStatus,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
      published_at: data.published_at,
      body_md: data.content,
      visibility: "public",
    };
  }, []);

  // Create article
  const createArticle = useCallback(async (input: CreateArticleInput): Promise<HelpArticle | null> => {
    const { data, error } = await supabase
      .from("help_articles")
      .insert({
        slug: input.slug,
        title: input.title,
        content: input.body_md,
        status: "draft" as const,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating article:", error);
      return null;
    }

    return {
      id: data.id,
      slug: data.slug,
      title: data.title,
      content: data.content,
      status: data.status as HelpArticleStatus,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
      published_at: data.published_at,
      body_md: data.content,
    };
  }, []);

  // Create version (simplified - just update the article)
  const createVersion = useCallback(async (articleId: string, content: CreateVersionInput): Promise<string | null> => {
    const updateData: Record<string, unknown> = {
      title: content.title,
      content: content.body_md,
      updated_at: new Date().toISOString(),
    };

    // Update slug if provided
    if (content.slug) {
      updateData.slug = content.slug;
    }

    const { data, error } = await supabase
      .from("help_articles")
      .update(updateData)
      .eq("id", articleId)
      .select()
      .single();

    if (error) {
      console.error("Error updating article:", error);
      return null;
    }

    return data.id;
  }, []);

  // Publish version (set status to published)
  const publishVersion = useCallback(async (articleId: string, _versionId: string): Promise<boolean> => {
    const { error } = await supabase
      .from("help_articles")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", articleId);

    if (error) {
      console.error("Error publishing article:", error);
      return false;
    }

    return true;
  }, []);

  // Archive article
  const archiveArticle = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from("help_articles")
      .update({
        status: "archived",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error archiving article:", error);
      return false;
    }

    return true;
  }, []);

  // Restore article
  const restoreArticle = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from("help_articles")
      .update({
        status: "draft",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error restoring article:", error);
      return false;
    }

    return true;
  }, []);

  // Fetch versions (legacy - returns empty for now)
  const fetchVersions = useCallback(async (_articleId: string): Promise<HelpArticleVersion[]> => {
    return [];
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    
    const { data, error } = await supabase
      .from("help_categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      setCategoriesError("Unable to load categories");
    } else {
      setCategories((data || []).map(c => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        icon: c.icon,
        created_at: c.created_at || new Date().toISOString(),
        updated_at: c.updated_at || new Date().toISOString(),
      })));
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
        description: input.description || null,
        icon: input.icon || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
      return null;
    }

    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      description: data.description,
      icon: data.icon,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
    };
  }, []);

  // Update category
  const updateCategory = useCallback(async (id: string, updates: UpdateCategoryInput): Promise<HelpCategory | null> => {
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.slug !== undefined) updateData.slug = updates.slug;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.icon !== undefined) updateData.icon = updates.icon;

    const { data, error } = await supabase
      .from("help_categories")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating category:", error);
      return null;
    }

    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      description: data.description,
      icon: data.icon,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
    };
  }, []);

  // Delete category
  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from("help_categories")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting category:", error);
      return false;
    }

    return true;
  }, []);

  // Fetch audiences
  const fetchAudiences = useCallback(async () => {
    setAudiencesLoading(true);
    setAudiencesError(null);
    
    const { data, error } = await supabase
      .from("help_audiences")
      .select("*")
      .order("position", { ascending: true });

    if (error) {
      console.error("Error fetching audiences:", error);
      setAudiencesError("Unable to load audiences");
    } else {
      setAudiences((data || []).map(a => ({
        id: a.id,
        slug: a.slug,
        name: a.name,
        description: a.description,
        position: a.position,
        is_active: a.is_active,
        created_at: a.created_at || new Date().toISOString(),
        updated_at: a.updated_at || new Date().toISOString(),
      })));
    }

    setAudiencesLoading(false);
  }, []);

  // Legacy: Update article
  const updateArticle = useCallback(async (id: string, updates: UpdateArticleInput): Promise<HelpArticle | null> => {
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.slug !== undefined) updateData.slug = updates.slug;
    if (updates.body_md !== undefined) updateData.content = updates.body_md;
    if (updates.status !== undefined) updateData.status = updates.status;

    const { data, error } = await supabase
      .from("help_articles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating article:", error);
      return null;
    }

    return {
      id: data.id,
      slug: data.slug,
      title: data.title,
      content: data.content,
      status: data.status as HelpArticleStatus,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
      published_at: data.published_at,
      body_md: data.content,
    };
  }, []);

  // Legacy: Delete article
  const deleteArticle = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from("help_articles")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting article:", error);
      return false;
    }

    return true;
  }, []);

  // Legacy: Publish article
  const publishArticle = useCallback(async (id: string): Promise<boolean> => {
    return publishVersion(id, "");
  }, [publishVersion]);

  // Legacy: Fetch revisions
  const fetchRevisions = useCallback(async (_articleId: string): Promise<HelpArticleRevision[]> => {
    return [];
  }, []);

  return {
    canManageHelp,
    accessLoading,
    articles,
    articlesLoading,
    articlesError,
    fetchArticles,
    fetchArticleWithVersion,
    createArticle,
    createVersion,
    publishVersion,
    archiveArticle,
    restoreArticle,
    categories,
    categoriesLoading,
    categoriesError,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    audiences,
    audiencesLoading,
    audiencesError,
    fetchAudiences,
    fetchVersions,
    // Legacy
    updateArticle,
    deleteArticle,
    publishArticle,
    fetchRevisions,
  };
}

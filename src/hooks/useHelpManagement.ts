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
 * APPEND-ONLY VERSIONING:
 * - All edits create new versions
 * - No in-place updates to content
 * - Versions are immutable and auditable
 * 
 * Institutional tone: authoritative, neutral, calm.
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

/**
 * HELP ARTICLE VERSION
 * 
 * Immutable version record. All edits create new versions.
 * 
 * APPROVAL FIELDS (DORMANT):
 * - requires_approval, approved_at, approved_by, approval_notes
 * - These fields exist for future approval workflow
 * - NOT ENFORCED — publishing proceeds immediately regardless
 * - Do not activate without explicit instruction
 * 
 * AUTHORITY MODEL (when activated):
 * - Platform Executives are approvers
 * - Tribes Admins are authors
 * - No cross-org approvals
 */
export interface HelpArticleVersion {
  id: string;
  article_id: string;
  title: string;
  summary: string | null;
  body_md: string;
  category_id: string | null;
  visibility: HelpVisibility;
  tags: string[];
  status: HelpArticleStatus;
  created_at: string;
  created_by: string | null;
  // DORMANT: Approval metadata — NOT ENFORCED
  requires_approval: boolean;
  approved_at: string | null;
  approved_by: string | null;
  approval_notes: string | null;
}

export interface HelpArticle {
  id: string;
  slug: string;
  status: HelpArticleStatus;
  current_version_id: string | null;
  published_version_id: string | null;
  created_at: string;
  published_at: string | null;
  updated_at: string;
  updated_by: string | null;
  // Current version data (joined/loaded separately)
  title?: string;
  summary?: string | null;
  body_md?: string;
  category_id?: string | null;
  visibility?: HelpVisibility;
  tags?: string[];
  version?: HelpArticleVersion;
  // Joined category
  category?: Pick<HelpCategory, 'id' | 'name' | 'slug'>;
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
  
  // Versions
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
  tags?: string[];
  visibility?: HelpVisibility;
}

interface CreateVersionInput {
  title: string;
  summary?: string;
  body_md: string;
  category_id?: string | null;
  visibility?: HelpVisibility;
  tags?: string[];
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
  const [articlesError, setArticlesError] = useState<string | null>(null);
  
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

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

  // Fetch articles with current version data
  const fetchArticles = useCallback(async (filters?: ArticleFilters) => {
    setArticlesLoading(true);
    setArticlesError(null);
    
    // First fetch articles
    let query = supabase
      .from("help_articles")
      .select(`
        id,
        slug,
        status,
        current_version_id,
        published_version_id,
        created_at,
        published_at,
        updated_at,
        updated_by,
        category:help_categories(id, name, slug)
      `)
      .order("updated_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const { data: articlesData, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching articles:", fetchError);
      setArticlesError("Unable to load articles");
      setArticlesLoading(false);
      return;
    }

    // Fetch current versions for all articles
    const versionIds = articlesData
      ?.map(a => a.current_version_id)
      .filter(Boolean) as string[] || [];

    let versionsMap: Record<string, HelpArticleVersion> = {};
    
    if (versionIds.length > 0) {
      const { data: versionsData, error: versionsError } = await supabase
        .from("help_article_versions")
        .select("*")
        .in("id", versionIds);

      if (!versionsError && versionsData) {
        versionsMap = versionsData.reduce((acc, v) => {
          acc[v.id] = v as HelpArticleVersion;
          return acc;
        }, {} as Record<string, HelpArticleVersion>);
      }
    }

    // Merge articles with version data
    const mergedArticles: HelpArticle[] = (articlesData || []).map(a => {
      const version = a.current_version_id ? versionsMap[a.current_version_id] : null;
      return {
        id: a.id,
        slug: a.slug,
        status: a.status,
        current_version_id: a.current_version_id,
        published_version_id: a.published_version_id,
        created_at: a.created_at,
        published_at: a.published_at,
        updated_at: a.updated_at,
        updated_by: a.updated_by,
        title: version?.title,
        summary: version?.summary,
        body_md: version?.body_md,
        category_id: version?.category_id,
        visibility: version?.visibility,
        tags: version?.tags,
        category: a.category as Pick<HelpCategory, 'id' | 'name' | 'slug'> | undefined,
      };
    });

    // Apply filters on merged data
    let filteredArticles = mergedArticles;
    if (filters?.visibility) {
      filteredArticles = filteredArticles.filter(a => a.visibility === filters.visibility);
    }
    if (filters?.category_id) {
      filteredArticles = filteredArticles.filter(a => a.category_id === filters.category_id);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredArticles = filteredArticles.filter(a =>
        a.title?.toLowerCase().includes(searchLower) ||
        a.slug.toLowerCase().includes(searchLower) ||
        a.body_md?.toLowerCase().includes(searchLower) ||
        a.summary?.toLowerCase().includes(searchLower)
      );
    }

    setArticles(filteredArticles);
    setArticlesLoading(false);
  }, []);

  // Fetch single article with current version data
  const fetchArticleWithVersion = useCallback(async (id: string): Promise<HelpArticle | null> => {
    // Try to use the RPC function first
    const { data, error } = await supabase.rpc("get_help_article_with_version", {
      _article_id: id,
    });

    if (error) {
      console.error("Error fetching article with version:", error);
      
      // Fallback: manual join
      const { data: articleData, error: articleError } = await supabase
        .from("help_articles")
        .select("*")
        .eq("id", id)
        .single();

      if (articleError || !articleData) {
        console.error("Error loading article:", articleError);
        return null;
      }

      // Fetch current version
      let version: HelpArticleVersion | null = null;
      if (articleData.current_version_id) {
        const { data: versionData } = await supabase
          .from("help_article_versions")
          .select("*")
          .eq("id", articleData.current_version_id)
          .single();
        version = versionData as HelpArticleVersion;
      }

      return {
        id: articleData.id,
        slug: articleData.slug,
        status: articleData.status,
        current_version_id: articleData.current_version_id,
        published_version_id: articleData.published_version_id,
        created_at: articleData.created_at,
        published_at: articleData.published_at,
        updated_at: articleData.updated_at,
        updated_by: articleData.updated_by,
        title: version?.title,
        summary: version?.summary,
        body_md: version?.body_md,
        category_id: version?.category_id,
        visibility: version?.visibility,
        tags: version?.tags,
        version,
      };
    }

    if (!data || data.length === 0) {
      return null;
    }

    const row = data[0];
    return {
      id: row.id,
      slug: row.slug,
      status: row.status,
      current_version_id: row.current_version_id,
      published_version_id: row.published_version_id,
      created_at: row.created_at,
      published_at: row.published_at,
      updated_at: row.updated_at,
      updated_by: row.updated_by,
      title: row.title,
      summary: row.summary,
      body_md: row.body_md,
      category_id: row.category_id,
      visibility: row.visibility,
      tags: row.tags,
    };
  }, []);

  // Create new article with initial version
  const createArticle = useCallback(async (input: CreateArticleInput): Promise<HelpArticle | null> => {
    // First create the article shell
    const { data: articleData, error: articleError } = await supabase
      .from("help_articles")
      .insert({
        slug: input.slug,
        status: "draft" as const,
        created_by: user?.id,
        updated_by: user?.id,
        // Legacy fields still in table until fully migrated
        title: input.title,
        body_md: input.body_md,
        summary: input.summary || null,
        category_id: input.category_id || null,
        visibility: input.visibility || "public",
        tags: input.tags || [],
      })
      .select()
      .single();

    if (articleError) {
      console.error("Error creating article:", articleError);
      return null;
    }

    // Create initial version using RPC
    const { data: versionId, error: versionError } = await supabase.rpc("create_help_article_version", {
      _article_id: articleData.id,
      _title: input.title,
      _summary: input.summary || null,
      _body_md: input.body_md,
      _category_id: input.category_id || null,
      _visibility: input.visibility || "public",
      _tags: input.tags || [],
      _status: "draft",
    });

    if (versionError) {
      console.error("Error creating version:", versionError);
      // Rollback: delete the article
      await supabase.from("help_articles").delete().eq("id", articleData.id);
      return null;
    }

    return {
      id: articleData.id,
      slug: articleData.slug,
      status: "draft",
      current_version_id: versionId,
      published_version_id: null,
      created_at: articleData.created_at,
      published_at: null,
      updated_at: articleData.updated_at,
      updated_by: articleData.updated_by,
      title: input.title,
      summary: input.summary,
      body_md: input.body_md,
      category_id: input.category_id,
      visibility: input.visibility || "public",
      tags: input.tags || [],
    };
  }, [user?.id]);

  // Create new version (append-only)
  const createVersion = useCallback(async (articleId: string, content: CreateVersionInput): Promise<string | null> => {
    const { data: versionId, error } = await supabase.rpc("create_help_article_version", {
      _article_id: articleId,
      _title: content.title,
      _summary: content.summary || null,
      _body_md: content.body_md,
      _category_id: content.category_id || null,
      _visibility: content.visibility || "public",
      _tags: content.tags || [],
      _status: "draft",
    });

    if (error) {
      console.error("Error creating version:", error);
      return null;
    }

    return versionId;
  }, []);

  // Publish a specific version
  const publishVersion = useCallback(async (articleId: string, versionId: string): Promise<boolean> => {
    const { error } = await supabase.rpc("publish_help_article_version", {
      _article_id: articleId,
      _version_id: versionId,
    });

    if (error) {
      console.error("Error publishing version:", error);
      return false;
    }

    return true;
  }, []);

  // Archive article (not versions)
  const archiveArticle = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase.rpc("archive_help_article", {
      _article_id: id,
    });

    if (error) {
      console.error("Error archiving article:", error);
      return false;
    }

    return true;
  }, []);

  // Restore article from archived
  const restoreArticle = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from("help_articles")
      .update({
        status: "draft",
        updated_by: user?.id,
      })
      .eq("id", id);

    if (error) {
      console.error("Error restoring article:", error);
      return false;
    }

    return true;
  }, [user?.id]);

  // Fetch all versions for an article
  const fetchVersions = useCallback(async (articleId: string): Promise<HelpArticleVersion[]> => {
    const { data, error } = await supabase
      .from("help_article_versions")
      .select("*")
      .eq("article_id", articleId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching versions:", error);
      return [];
    }

    return (data as HelpArticleVersion[]) || [];
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    
    const { data, error } = await supabase
      .from("help_categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      setCategoriesError("Unable to load categories");
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
      return null;
    }

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
      return null;
    }

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
      return false;
    }

    return true;
  }, []);

  // ============ LEGACY METHODS (deprecated, for backward compatibility) ============

  // Legacy: Update article (now creates a version)
  const updateArticle = useCallback(async (id: string, updates: UpdateArticleInput): Promise<HelpArticle | null> => {
    // Create a new version instead of updating in place
    const versionId = await createVersion(id, {
      title: updates.title || "",
      summary: updates.summary,
      body_md: updates.body_md || "",
      category_id: updates.category_id,
      visibility: updates.visibility,
      tags: updates.tags,
    });

    if (!versionId) {
      return null;
    }

    // Fetch updated article
    return fetchArticleWithVersion(id);
  }, [createVersion, fetchArticleWithVersion]);

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

  // Legacy: Publish article (publishes current version)
  const publishArticle = useCallback(async (id: string): Promise<boolean> => {
    // Fetch current version ID
    const { data: article } = await supabase
      .from("help_articles")
      .select("current_version_id")
      .eq("id", id)
      .single();

    if (!article?.current_version_id) {
      return false;
    }

    return publishVersion(id, article.current_version_id);
  }, [publishVersion]);

  // Legacy: Fetch revisions (now fetches versions)
  const fetchRevisions = useCallback(async (articleId: string): Promise<HelpArticleRevision[]> => {
    const versions = await fetchVersions(articleId);
    // Map to legacy format
    return versions.map((v, index) => ({
      id: v.id,
      article_id: v.article_id,
      version: versions.length - index,
      title: v.title,
      summary: v.summary,
      body_md: v.body_md,
      status: v.status,
      visibility: v.visibility,
      actor_user_id: v.created_by,
      created_at: v.created_at,
    }));
  }, [fetchVersions]);

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
    fetchVersions,
    // Legacy
    updateArticle,
    deleteArticle,
    publishArticle,
    fetchRevisions,
  };
}
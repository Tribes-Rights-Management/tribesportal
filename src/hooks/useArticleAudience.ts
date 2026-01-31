import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * HOOK: useArticleAudience
 * 
 * Manages article-audience-category assignments via the 
 * help_article_audiences junction table.
 */

export interface ArticleAudienceAssignment {
  id: string;
  article_id: string;
  audience_id: string;
  category_id: string;
  position: number;
}

interface UseArticleAudienceResult {
  assignment: ArticleAudienceAssignment | null;
  loading: boolean;
  error: string | null;
  fetchAssignment: (articleId: string) => Promise<ArticleAudienceAssignment | null>;
  saveAssignment: (
    articleId: string, 
    audienceId: string, 
    categoryId: string, 
    position?: number
  ) => Promise<boolean>;
  removeAssignment: (articleId: string) => Promise<boolean>;
}

export function useArticleAudience(): UseArticleAudienceResult {
  const [assignment, setAssignment] = useState<ArticleAudienceAssignment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch the current audience assignment for an article
   * (Currently supports single assignment per article)
   */
  const fetchAssignment = useCallback(async (articleId: string): Promise<ArticleAudienceAssignment | null> => {
    if (!articleId) return null;

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("help_article_audiences")
      .select("*")
      .eq("article_id", articleId)
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching article audience:", fetchError);
      setError("Unable to load audience assignment");
      setLoading(false);
      return null;
    }

    if (data) {
      const mapped: ArticleAudienceAssignment = {
        id: data.id,
        article_id: data.article_id,
        audience_id: data.audience_id,
        category_id: data.category_id,
        position: data.position,
      };
      setAssignment(mapped);
      setLoading(false);
      return mapped;
    }

    setAssignment(null);
    setLoading(false);
    return null;
  }, []);

  /**
   * Save or update the article's audience assignment
   * Uses upsert pattern based on article_id + audience_id
   */
  const saveAssignment = useCallback(async (
    articleId: string,
    audienceId: string,
    categoryId: string,
    position: number = 0
  ): Promise<boolean> => {
    if (!articleId || !audienceId || !categoryId) {
      setError("Article, audience, and category are required");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // First, delete any existing assignments for this article
      // (enforces single assignment per article for now)
      await supabase
        .from("help_article_audiences")
        .delete()
        .eq("article_id", articleId);

      // Insert new assignment
      const { error: insertError } = await supabase
        .from("help_article_audiences")
        .insert({
          article_id: articleId,
          audience_id: audienceId,
          category_id: categoryId,
          position: position,
        });

      if (insertError) {
        throw insertError;
      }

      setLoading(false);
      return true;
    } catch (err) {
      console.error("Error saving article audience:", err);
      setError("Unable to save audience assignment");
      setLoading(false);
      return false;
    }
  }, []);

  /**
   * Remove all audience assignments for an article
   */
  const removeAssignment = useCallback(async (articleId: string): Promise<boolean> => {
    if (!articleId) return false;

    setLoading(true);
    setError(null);

    const { error: deleteError } = await supabase
      .from("help_article_audiences")
      .delete()
      .eq("article_id", articleId);

    if (deleteError) {
      console.error("Error removing article audience:", deleteError);
      setError("Unable to remove audience assignment");
      setLoading(false);
      return false;
    }

    setAssignment(null);
    setLoading(false);
    return true;
  }, []);

  return {
    assignment,
    loading,
    error,
    fetchAssignment,
    saveAssignment,
    removeAssignment,
  };
}

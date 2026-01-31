import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * HOOK: useArticleOrderByCategory
 * 
 * Manages article ordering within a specific category.
 * Articles are linked via help_article_audiences junction table.
 */

export interface ArticleWithPosition {
  id: string;
  title: string;
  slug: string;
  position: number;
  audience_id: string;
}

interface UseArticleOrderByCategoryResult {
  articles: ArticleWithPosition[];
  loading: boolean;
  error: string | null;
  fetchArticlesForCategory: (categoryId: string) => Promise<void>;
  updatePositions: (categoryId: string, reorderedArticles: ArticleWithPosition[]) => Promise<boolean>;
}

export function useArticleOrderByCategory(): UseArticleOrderByCategoryResult {
  const [articles, setArticles] = useState<ArticleWithPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all articles linked to a category via help_article_audiences
   * Ordered by position ASC
   */
  const fetchArticlesForCategory = useCallback(async (categoryId: string) => {
    if (!categoryId) {
      setArticles([]);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("help_article_audiences")
      .select(`
        article_id,
        audience_id,
        position,
        help_articles!inner (
          id,
          title,
          slug
        )
      `)
      .eq("category_id", categoryId)
      .order("position", { ascending: true });

    if (fetchError) {
      console.error("Error fetching articles for category:", fetchError);
      setError("Unable to load articles for this category");
      setLoading(false);
      return;
    }

    // Map to our interface
    const mapped: ArticleWithPosition[] = (data || []).map((row: any) => ({
      id: row.help_articles.id,
      title: row.help_articles.title,
      slug: row.help_articles.slug,
      position: row.position,
      audience_id: row.audience_id,
    }));

    setArticles(mapped);
    setLoading(false);
  }, []);

  /**
   * Update positions for all articles in a category after drag-drop
   */
  const updatePositions = useCallback(async (
    categoryId: string,
    reorderedArticles: ArticleWithPosition[]
  ): Promise<boolean> => {
    if (!categoryId || reorderedArticles.length === 0) return false;

    try {
      // Update each article's position in the junction table
      for (let i = 0; i < reorderedArticles.length; i++) {
        const article = reorderedArticles[i];
        const newPosition = i + 1;

        const { error: updateError } = await supabase
          .from("help_article_audiences")
          .update({ position: newPosition })
          .eq("article_id", article.id)
          .eq("category_id", categoryId);

        if (updateError) {
          console.error("Error updating article position:", updateError);
          throw updateError;
        }
      }

      // Update local state with new positions
      setArticles(reorderedArticles.map((a, i) => ({ ...a, position: i + 1 })));

      toast({
        title: "Saved",
        description: "Article order updated",
      });

      return true;
    } catch (err) {
      console.error("Error updating positions:", err);
      toast({
        title: "Error",
        description: "Unable to save article order",
        variant: "destructive",
      });
      return false;
    }
  }, []);

  return {
    articles,
    loading,
    error,
    fetchArticlesForCategory,
    updatePositions,
  };
}

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from './useDebounce';

interface ArticleSuggestion {
  id: string;
  title: string;
  slug: string;
  category_name: string | null;
}

/**
 * Hook to search published help articles for suggestions
 * Used in Contact Support form to help users find answers before submitting tickets
 */
export function useHelpArticleSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<ArticleSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Debounce the search query to avoid too many API calls
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const searchArticles = async () => {
      // Only search if query is 3+ characters
      if (debouncedQuery.trim().length < 3) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);

      try {
        // Search published help articles by title and content
        const searchTerm = `%${debouncedQuery.trim()}%`;
        
        const { data, error } = await supabase
          .from('help_articles')
          .select(`
            id,
            title,
            slug,
            help_article_audiences (
              help_categories (
                name
              )
            )
          `)
          .eq('status', 'published')
          .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
          .limit(4);

        if (error) {
          console.error('Error searching help articles:', error);
          setSuggestions([]);
          return;
        }

        // Transform the data to a simpler format
        const formattedSuggestions: ArticleSuggestion[] = (data || []).map(article => {
          // Get the first category name if available
          const categoryName = article.help_article_audiences?.[0]?.help_categories?.name || null;
          
          return {
            id: article.id,
            title: article.title,
            slug: article.slug,
            category_name: categoryName,
          };
        });

        setSuggestions(formattedSuggestions);
      } catch (err) {
        console.error('Error in article search:', err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchArticles();
  }, [debouncedQuery]);

  return { suggestions, isLoading };
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, FolderOpen, Plus, Eye, EyeOff } from "lucide-react";

/**
 * HELP ADMIN DASHBOARD — INTERNAL COMPANY TOOL
 * 
 * Overview of Help content with quick stats and management actions.
 * Company-scoped (not workspace-scoped).
 */

interface ArticleStats {
  total: number;
  published: number;
  draft: number;
}

interface CategoryStats {
  total: number;
}

export default function HelpAdminDashboard() {
  const navigate = useNavigate();
  const [articleStats, setArticleStats] = useState<ArticleStats>({ total: 0, published: 0, draft: 0 });
  const [categoryStats, setCategoryStats] = useState<CategoryStats>({ total: 0 });
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      
      // Fetch article stats
      const { data: articles, error: articlesError } = await supabase
        .from("articles")
        .select("id, published");
      
      if (!articlesError && articles) {
        const published = articles.filter(a => a.published).length;
        setArticleStats({
          total: articles.length,
          published,
          draft: articles.length - published,
        });
      }
      
      // Fetch category count
      const { count: categoryCount } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: true });
      
      setCategoryStats({ total: categoryCount ?? 0 });
      
      // Fetch recent articles
      const { data: recent } = await supabase
        .from("articles")
        .select("id, title, slug, published, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5);
      
      setRecentArticles(recent ?? []);
      setLoading(false);
    }
    
    loadStats();
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Help Backend"
        description="Manage articles and categories for the public help center"
      />
      
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Total Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{articleStats.total}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {articleStats.published} published · {articleStats.draft} draft
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categoryStats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => navigate("/help-admin/articles/new")}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Article
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => navigate("/help-admin/categories")}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Manage Categories
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Articles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Articles</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/help-admin/articles")}
            >
              View all
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : recentArticles.length === 0 ? (
              <div className="text-sm text-muted-foreground">No articles yet</div>
            ) : (
              <div className="space-y-3">
                {recentArticles.map((article) => (
                  <div 
                    key={article.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      {article.published ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <div className="text-sm font-medium">{article.title}</div>
                        <div className="text-xs text-muted-foreground">/{article.slug}</div>
                      </div>
                    </div>
                    <Badge variant={article.published ? "default" : "secondary"}>
                      {article.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Internal Tool Notice */}
        <div className="text-xs text-muted-foreground text-center py-4 border-t">
          Internal company tool · Changes publish to help.tribesrightsmanagement.com
        </div>
      </div>
    </PageContainer>
  );
}

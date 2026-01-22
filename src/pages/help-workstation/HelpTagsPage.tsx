import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUpDown, X, Search } from "lucide-react";
import { format } from "date-fns";

/**
 * HELP TAGS PAGE — INSTITUTIONAL DESIGN
 * 
 * Right-side panel for create/edit
 * Inline errors (not toasts)
 * All icons: strokeWidth={1.5}
 */

interface HelpTag {
  id: string;
  name: string;
  slug: string;
  article_count?: number;
  created_at: string;
  updated_at: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function HelpTagsPage() {
  const [tags, setTags] = useState<HelpTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"name" | "article_count" | "updated_at">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  // Panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<HelpTag | null>(null);

  // Delete confirmation
  const [deleteTag, setDeleteTag] = useState<HelpTag | null>(null);

  useEffect(() => {
    loadTags();
  }, []);

  async function loadTags() {
    setLoading(true);
    
    const { data: articles, error } = await supabase
      .from("help_articles")
      .select("tags");
    
    if (error) {
      console.error("Error loading tags:", error);
      setLoading(false);
      return;
    }
    
    const tagCounts: Record<string, number> = {};
    articles?.forEach(article => {
      if (article.tags && Array.isArray(article.tags)) {
        article.tags.forEach((tag: string) => {
          const normalizedTag = tag.toLowerCase().trim();
          tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
        });
      }
    });
    
    const tagsArray: HelpTag[] = Object.entries(tagCounts).map(([name, count]) => ({
      id: name,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      slug: slugify(name),
      article_count: count,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    
    setTags(tagsArray);
    setLoading(false);
  }

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedTags = [...tags]
    .filter(tag => 
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.slug.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "article_count") {
        comparison = (a.article_count || 0) - (b.article_count || 0);
      } else if (sortField === "updated_at") {
        comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const openDetailsPanel = (tag: HelpTag) => {
    setEditingTag(tag);
    setPanelOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTag) return;

    // Tags with articles cannot be deleted
    if ((deleteTag.article_count || 0) > 0) {
      setDeleteTag(null);
      return;
    }

    // Since tags are derived from article.tags arrays,
    // a tag with 0 articles doesn't need database cleanup.
    // Simply remove it from local state.
    setTags(prev => prev.filter(t => t.id !== deleteTag.id));
    setDeleteTag(null);
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => (
    <ArrowUpDown 
      className={`h-3 w-3 ml-1 inline ${sortField === field ? 'opacity-100' : 'opacity-40'}`}
      strokeWidth={1.5}
    />
  );

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium mb-2">
            HELP WORKSTATION
          </p>
          <h1 className="text-[20px] font-medium text-white mb-1">Tags</h1>
          <p className="text-[13px] text-[#AAAAAA]">{tags.length} tags</p>
          <p className="text-[12px] text-[#6B6B6B] mt-1">
            Tags are created automatically when added to articles.
          </p>
        </div>
      </div>
      
      {/* Search */}
      <div className="mb-6 max-w-md relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6B]" strokeWidth={1} />
        <input
          type="search"
          placeholder="Search tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-9 pl-12 pr-3 bg-[#1A1A1A] border border-[#303030] rounded text-[12px] text-white placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#505050]"
        />
      </div>
      
      {/* Table */}
      <div className="bg-[#1A1A1A] border border-[#303030] rounded">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#303030]">
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium w-[35%]">
                <button onClick={() => handleSort("name")} className="flex items-center hover:text-white transition-colors">
                  Name <SortIcon field="name" />
                </button>
              </th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium w-[30%]">Slug</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium w-[15%]">
                <button onClick={() => handleSort("article_count")} className="flex items-center hover:text-white transition-colors">
                  Articles <SortIcon field="article_count" />
                </button>
              </th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium w-[20%]">Updated</th>
              <th className="w-[50px]"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-20">
                  <p className="text-[13px] text-[#6B6B6B]">Loading tags...</p>
                </td>
              </tr>
            ) : sortedTags.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-20">
                  <p className="text-[13px] text-[#8F8F8F]">
                    {searchQuery ? "No tags match your search" : "No tags yet"}
                  </p>
                  <p className="text-[12px] text-[#6B6B6B] mt-1">
                    Add tags to articles to see them here
                  </p>
                </td>
              </tr>
            ) : (
              sortedTags.map(tag => (
                <tr
                  key={tag.id}
                  onClick={() => openDetailsPanel(tag)}
                  className="border-b border-[#303030]/30 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 text-[13px] text-white">{tag.name}</td>
                  <td className="py-3 px-4 text-[12px] text-[#8F8F8F]">{tag.slug}</td>
                  <td className="py-3 px-4 text-[12px] text-[#AAAAAA] tabular-nums">{tag.article_count || 0}</td>
                  <td className="py-3 px-4 text-right text-[12px] text-[#8F8F8F]">
                    {format(new Date(tag.updated_at), "MMM d, yyyy")}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {(tag.article_count || 0) === 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTag(tag);
                        }}
                        className="p-1 text-[#6B6B6B] hover:text-[#DC2626] transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete tag"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Right-side Panel - Tag Details (View Only) */}
      {panelOpen && editingTag && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setPanelOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-[400px] bg-[#0A0A0A] border-l border-[#303030] shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#303030]">
              <div>
                <h2 className="text-[15px] font-medium text-white">Tag details</h2>
                <p className="text-[11px] text-[#8F8F8F] mt-1">View tag information</p>
              </div>
              <button onClick={() => setPanelOpen(false)} className="text-[#6B6B6B] hover:text-white transition-colors">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B] mb-1">Name</p>
                <p className="text-[14px] text-white">{editingTag.name}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B] mb-1">Slug</p>
                <p className="text-[13px] text-[#AAAAAA]">{editingTag.slug}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B] mb-1">Articles using this tag</p>
                <p className="text-[14px] text-white">{editingTag.article_count || 0}</p>
              </div>

              <div className="pt-4 border-t border-[#303030]">
                <p className="text-[11px] text-[#6B6B6B]">
                  To rename or remove this tag, edit the articles that use it.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end px-6 py-5 border-t border-[#303030]">
              <Button variant="outline" size="sm" onClick={() => setPanelOpen(false)}>Close</Button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Panel */}
      {deleteTag && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setDeleteTag(null)} />
          <div className="fixed inset-y-0 right-0 w-[400px] bg-[#0A0A0A] border-l border-[#303030] shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#303030]">
              <h2 className="text-[15px] font-medium text-white">Delete tag?</h2>
              <button onClick={() => setDeleteTag(null)} className="text-[#6B6B6B] hover:text-white transition-colors">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 px-6 py-6">
              <p className="text-[13px] text-[#8F8F8F]">
                {(deleteTag.article_count || 0) > 0 ? (
                  <>
                    This tag is used by <strong className="text-white">{deleteTag.article_count} article{(deleteTag.article_count || 0) > 1 ? 's' : ''}</strong>.
                    You must remove the tag from all articles before deleting it.
                  </>
                ) : (
                  <>Are you sure you want to delete "{deleteTag.name}"? This action cannot be undone.</>
                )}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-5 border-t border-[#303030]">
              <Button variant="outline" size="sm" onClick={() => setDeleteTag(null)}>Cancel</Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={(deleteTag.article_count || 0) > 0}
              >
                Delete
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

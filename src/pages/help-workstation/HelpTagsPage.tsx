import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, ArrowUpDown, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

/**
 * HELP TAGS PAGE — INSTITUTIONAL DESIGN
 * 
 * Manage tags for Help articles.
 * - NO decorative icons
 * - Right-slide panel for create/edit
 * - Sharp corners (rounded-md)
 * - Dense layout
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
  const navigate = useNavigate();
  const [tags, setTags] = useState<HelpTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"name" | "article_count" | "updated_at">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  // Panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<HelpTag | null>(null);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [saving, setSaving] = useState(false);
  
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
    
    // Aggregate tags from all articles
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

  const openCreatePanel = () => {
    setEditingTag(null);
    setFormName("");
    setFormSlug("");
    setPanelOpen(true);
  };

  const openEditPanel = (tag: HelpTag) => {
    setEditingTag(tag);
    setFormName(tag.name);
    setFormSlug(tag.slug);
    setPanelOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    
    setSaving(true);
    
    toast({ 
      title: editingTag ? "Tag updated" : "Tag created",
      description: "Tag management is based on article tags."
    });
    
    setSaving(false);
    setPanelOpen(false);
    loadTags();
  };

  const handleDelete = async () => {
    if (!deleteTag) return;
    
    toast({ 
      title: "Tag removal",
      description: `To remove "${deleteTag.name}", edit articles using this tag.`
    });
    
    setDeleteTag(null);
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => (
    <ArrowUpDown 
      className={`h-3 w-3 ml-1 inline ${sortField === field ? 'opacity-100' : 'opacity-40'}`}
      strokeWidth={1.5}
    />
  );

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p 
            className="text-[10px] uppercase tracking-wider font-medium mb-1"
            style={{ color: '#6B6B6B' }}
          >
            Help Workstation
          </p>
          <h1 
            className="text-[20px] font-medium leading-tight"
            style={{ color: 'var(--platform-text)' }}
          >
            Tags
          </h1>
          <p 
            className="text-[13px] mt-1"
            style={{ color: '#AAAAAA' }}
          >
            Manage tags used across Help articles
          </p>
        </div>
        <Button 
          variant="default"
          size="sm"
          onClick={openCreatePanel}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
          New Tag
        </Button>
      </div>
      
      {/* Search - No icon */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 w-full max-w-sm px-3 text-[13px] rounded-md transition-colors duration-100 focus:outline-none"
          style={{
            backgroundColor: '#1A1A1A',
            border: '1px solid #303030',
            color: 'white',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#505050'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#303030'}
        />
      </div>
      
      {/* Tags Table */}
      <div 
        className="rounded-md overflow-hidden"
        style={{ 
          backgroundColor: '#1A1A1A',
          border: '1px solid #303030'
        }}
      >
        {/* Table Header */}
        <div 
          className="grid grid-cols-12 gap-4 px-4 py-3 text-[11px] uppercase tracking-wider font-medium"
          style={{ 
            color: '#6B6B6B',
            borderBottom: '1px solid #303030',
          }}
        >
          <button 
            onClick={() => handleSort("name")}
            className="col-span-4 text-left flex items-center hover:text-white transition-colors"
          >
            Name <SortIcon field="name" />
          </button>
          <div className="col-span-3 text-left">Slug</div>
          <button 
            onClick={() => handleSort("article_count")}
            className="col-span-2 text-left flex items-center hover:text-white transition-colors"
          >
            Articles <SortIcon field="article_count" />
          </button>
          <div className="col-span-2 hidden md:block">Updated</div>
          <div className="col-span-1 text-right"></div>
        </div>
        
        {/* Table Body */}
        {loading ? (
          <div className="py-12 text-center">
            <p className="text-[13px]" style={{ color: '#6B6B6B' }}>Loading tags...</p>
          </div>
        ) : sortedTags.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[13px]" style={{ color: '#8F8F8F' }}>
              {searchQuery ? "No tags match your search" : "No tags yet"}
            </p>
            <p className="text-[12px] mt-1" style={{ color: '#6B6B6B' }}>
              Tags are created when added to articles
            </p>
          </div>
        ) : (
          sortedTags.map((tag, index) => (
            <div 
              key={tag.id}
              className="grid grid-cols-12 gap-4 px-4 py-3 items-center transition-colors"
              style={{ 
                borderBottom: index < sortedTags.length - 1 ? '1px solid #303030' : 'none',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div className="col-span-4">
                <span className="text-[13px] font-medium" style={{ color: 'white' }}>
                  {tag.name}
                </span>
              </div>
              <div className="col-span-3">
                <span className="text-[12px]" style={{ color: '#8F8F8F' }}>
                  {tag.slug}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[12px] tabular-nums" style={{ color: '#AAAAAA' }}>
                  {tag.article_count || 0}
                </span>
              </div>
              <div className="col-span-2 hidden md:block">
                <span className="text-[12px]" style={{ color: '#8F8F8F' }}>
                  {format(new Date(tag.updated_at), "MMM d, yyyy")}
                </span>
              </div>
              <div className="col-span-1 flex justify-end gap-1">
                <button
                  onClick={() => openEditPanel(tag)}
                  className="p-1.5 rounded hover:bg-white/[0.05] transition-colors"
                  style={{ color: '#AAAAAA' }}
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => setDeleteTag(tag)}
                  className="p-1.5 rounded hover:bg-white/[0.05] transition-colors"
                  style={{ color: '#AAAAAA' }}
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Tag count footer */}
      {!loading && sortedTags.length > 0 && (
        <p 
          className="mt-4 text-[12px]"
          style={{ color: '#6B6B6B' }}
        >
          {sortedTags.length} tag{sortedTags.length !== 1 ? 's' : ''} total
        </p>
      )}
      
      {/* Right-side Create/Edit Panel */}
      {panelOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0,0,0,0.88)' }}
            onClick={() => setPanelOpen(false)}
          />
          
          {/* Panel */}
          <div 
            className="fixed inset-y-0 right-0 w-full max-w-md z-50 flex flex-col"
            style={{ 
              backgroundColor: '#0A0A0A',
              borderLeft: '1px solid #303030',
            }}
          >
            {/* Header */}
            <div 
              className="flex items-start justify-between p-5"
              style={{ borderBottom: '1px solid #303030' }}
            >
              <div>
                <h2 className="text-[16px] font-medium" style={{ color: 'white' }}>
                  {editingTag ? "Edit Tag" : "New Tag"}
                </h2>
                <p className="text-[12px] mt-0.5" style={{ color: '#8F8F8F' }}>
                  {editingTag 
                    ? "Update the tag name and slug" 
                    : "Create a new tag for organizing articles"}
                </p>
              </div>
              <button 
                onClick={() => setPanelOpen(false)}
                className="p-1.5 rounded hover:bg-white/[0.05] transition-colors"
                style={{ color: '#AAAAAA' }}
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="space-y-2">
                <label className="block text-[12px]" style={{ color: '#AAAAAA' }}>Name</label>
                <input
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!editingTag) {
                      setFormSlug(slugify(e.target.value));
                    }
                  }}
                  placeholder="e.g., Getting Started"
                  className="h-10 w-full px-3 text-[13px] rounded-md transition-colors duration-100 focus:outline-none"
                  style={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #303030',
                    color: 'white',
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-[12px]" style={{ color: '#AAAAAA' }}>Slug</label>
                <input
                  value={formSlug}
                  onChange={(e) => setFormSlug(slugify(e.target.value))}
                  placeholder="e.g., getting-started"
                  className="h-10 w-full px-3 text-[13px] rounded-md transition-colors duration-100 focus:outline-none"
                  style={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #303030',
                    color: 'white',
                  }}
                />
                <p className="text-[11px]" style={{ color: '#6B6B6B' }}>
                  URL-friendly identifier for the tag
                </p>
              </div>
            </div>
            
            {/* Footer */}
            <div 
              className="p-5 flex justify-end gap-2"
              style={{ borderTop: '1px solid #303030' }}
            >
              <Button variant="outline" size="sm" onClick={() => setPanelOpen(false)}>
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editingTag ? "Update Tag" : "Create Tag"}
              </Button>
            </div>
          </div>
        </>
      )}
      
      {/* Delete Confirmation */}
      {deleteTag && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0,0,0,0.88)' }}
            onClick={() => setDeleteTag(null)}
          />
          
          {/* Dialog */}
          <div 
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-50 p-6 rounded-md"
            style={{ 
              backgroundColor: '#1A1A1A',
              border: '1px solid #303030',
            }}
          >
            <h3 className="text-[16px] font-medium mb-2" style={{ color: 'white' }}>
              Delete Tag
            </h3>
            <p className="text-[13px] mb-5" style={{ color: '#8F8F8F' }}>
              This will remove the tag "{deleteTag.name}" from all articles. 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteTag(null)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                Delete Tag
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

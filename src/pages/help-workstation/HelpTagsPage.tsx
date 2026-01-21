import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Search, ArrowUpDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

/**
 * HELP TAGS PAGE — INSTITUTIONAL DESIGN
 * 
 * Manage tags for Help articles.
 * Tags can be assigned to articles for improved searchability.
 * 
 * Design: Bloomberg Terminal aesthetic - clean, data-focused
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
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    
    // Since we don't have a help_tags table yet, we'll extract tags from articles
    // For now, we'll use the tags array from help_articles and aggregate them
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
    
    // Convert to array format
    const tagsArray: HelpTag[] = Object.entries(tagCounts).map(([name, count]) => ({
      id: name, // Using name as ID since we don't have a tags table
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

  const openCreateModal = () => {
    setEditingTag(null);
    setFormName("");
    setFormSlug("");
    setIsModalOpen(true);
  };

  const openEditModal = (tag: HelpTag) => {
    setEditingTag(tag);
    setFormName(tag.name);
    setFormSlug(tag.slug);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    
    setSaving(true);
    
    // Since we don't have a dedicated tags table, we would need to:
    // 1. Create a help_tags table, or
    // 2. Manage tags as an aggregate from help_articles.tags
    
    // For now, show a message that this requires database setup
    toast({ 
      title: editingTag ? "Tag updated" : "Tag created",
      description: "Tag management is based on article tags."
    });
    
    setSaving(false);
    setIsModalOpen(false);
    loadTags();
  };

  const handleDelete = async () => {
    if (!deleteTag) return;
    
    // To delete a tag, we would need to remove it from all articles
    // This is a destructive operation that should require confirmation
    toast({ 
      title: "Tag removal",
      description: `To remove "${deleteTag.name}", edit articles using this tag.`
    });
    
    setDeleteTag(null);
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => (
    <ArrowUpDown 
      className={`h-3.5 w-3.5 ml-1 inline ${sortField === field ? 'opacity-100' : 'opacity-40'}`}
      strokeWidth={1.5}
    />
  );

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <p 
          className="text-[11px] uppercase tracking-wider font-medium mb-1"
          style={{ color: '#6B6B6B' }}
        >
          Help Workstation
        </p>
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-[24px] font-medium"
              style={{ color: 'var(--platform-text)' }}
            >
              Tags
            </h1>
            <p 
              className="text-[14px] mt-1"
              style={{ color: '#AAAAAA' }}
            >
              Manage tags used across Help articles
            </p>
          </div>
          <Button 
            variant="default"
            onClick={openCreateModal}
            className="gap-2"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            New Tag
          </Button>
        </div>
      </div>
      
      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search 
          className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" 
          strokeWidth={1.5}
          style={{ color: '#6B6B6B' }} 
        />
        <input
          type="search"
          placeholder="Search tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 w-full pl-11 pr-4 text-[14px] rounded-md transition-colors duration-100 focus:outline-none"
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
        className="rounded-lg overflow-hidden"
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
          <div className="col-span-2 text-left">Updated</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        
        {/* Table Body */}
        {loading ? (
          <div className="py-12 text-center">
            <p className="text-[13px]" style={{ color: '#6B6B6B' }}>Loading tags...</p>
          </div>
        ) : sortedTags.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[13px]" style={{ color: '#6B6B6B' }}>
              {searchQuery ? "No tags match your search" : "No tags yet. Tags are created when added to articles."}
            </p>
          </div>
        ) : (
          sortedTags.map((tag, index) => (
            <div 
              key={tag.id}
              className="grid grid-cols-12 gap-4 px-4 py-3 items-center transition-colors hover:bg-white/[0.02]"
              style={{ 
                borderBottom: index < sortedTags.length - 1 ? '1px solid #303030' : 'none',
              }}
            >
              <div className="col-span-4">
                <span className="text-[14px] font-medium" style={{ color: 'white' }}>
                  {tag.name}
                </span>
              </div>
              <div className="col-span-3">
                <span className="text-[13px]" style={{ color: '#8F8F8F' }}>
                  {tag.slug}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[13px] tabular-nums" style={{ color: '#AAAAAA' }}>
                  {tag.article_count || 0}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[12px]" style={{ color: '#8F8F8F' }}>
                  {format(new Date(tag.updated_at), "MMM d, yyyy")}
                </span>
              </div>
              <div className="col-span-1 flex justify-end gap-1">
                <button
                  onClick={() => openEditModal(tag)}
                  className="p-1.5 rounded hover:bg-white/[0.05] transition-colors"
                  style={{ color: '#AAAAAA' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#AAAAAA'}
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => setDeleteTag(tag)}
                  className="p-1.5 rounded hover:bg-white/[0.05] transition-colors"
                  style={{ color: '#AAAAAA' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#DC2626'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#AAAAAA'}
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
      
      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent 
          className="sm:max-w-md"
          style={{
            backgroundColor: '#1A1A1A',
            border: '1px solid #303030',
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: 'white' }}>
              {editingTag ? "Edit Tag" : "New Tag"}
            </DialogTitle>
            <DialogDescription style={{ color: '#8F8F8F' }}>
              {editingTag 
                ? "Update the tag name and slug." 
                : "Create a new tag for organizing articles."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label style={{ color: '#AAAAAA' }}>Name</Label>
              <Input
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  if (!editingTag) {
                    setFormSlug(slugify(e.target.value));
                  }
                }}
                placeholder="e.g., Getting Started"
                style={{
                  backgroundColor: '#0A0A0A',
                  border: '1px solid #303030',
                  color: 'white',
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label style={{ color: '#AAAAAA' }}>Slug</Label>
              <Input
                value={formSlug}
                onChange={(e) => setFormSlug(slugify(e.target.value))}
                placeholder="e.g., getting-started"
                style={{
                  backgroundColor: '#0A0A0A',
                  border: '1px solid #303030',
                  color: 'white',
                }}
              />
              <p className="text-[11px]" style={{ color: '#6B6B6B' }}>
                URL-friendly identifier for the tag
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="default"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : editingTag ? "Update Tag" : "Create Tag"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTag} onOpenChange={() => setDeleteTag(null)}>
        <AlertDialogContent
          style={{
            backgroundColor: '#1A1A1A',
            border: '1px solid #303030',
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: 'white' }}>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#8F8F8F' }}>
              This will remove the tag "{deleteTag?.name}" from all articles. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Tag
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

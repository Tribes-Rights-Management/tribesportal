import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppButton } from "@/components/app-ui";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number | null;
  parent_id: string | null;
  article_count?: number;
}

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  icon: string;
  parent_id: string;
}

export default function HelpCenterCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<CategoryForm>({
    name: "",
    slug: "",
    description: "",
    icon: "",
    parent_id: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);

    // Get categories with article counts
    const { data: cats } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true, nullsFirst: false });

    if (cats) {
      // Get article counts
      const counts: Record<string, number> = {};
      for (const c of cats) {
        const { count } = await supabase
          .from("articles")
          .select("id", { count: "exact", head: true })
          .eq("category_id", c.id);
        counts[c.id] = count ?? 0;
      }

      setCategories(
        cats.map((c) => ({ ...c, article_count: counts[c.id] ?? 0 }))
      );
    }

    setLoading(false);
  }

  function openModal(category?: Category) {
    if (category) {
      setEditingCategory(category);
      setForm({
        name: category.name,
        slug: category.slug,
        description: category.description ?? "",
        icon: category.icon ?? "",
        parent_id: category.parent_id ?? "",
      });
    } else {
      setEditingCategory(null);
      setForm({ name: "", slug: "", description: "", icon: "", parent_id: "" });
    }
    setModalOpen(true);
  }

  function handleNameChange(name: string) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setForm((f) => ({ ...f, name, slug }));
  }

  async function handleSave() {
    if (!form.name || !form.slug) {
      toast.error("Name and slug are required");
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      icon: form.icon || null,
      parent_id: form.parent_id || null,
    };

    if (editingCategory) {
      const { error } = await supabase
        .from("categories")
        .update(payload)
        .eq("id", editingCategory.id);

      if (error) {
        toast.error("Failed to update category");
        setSaving(false);
        return;
      }
      toast.success("Category updated");
    } else {
      const maxOrder =
        categories.length > 0
          ? Math.max(...categories.map((c) => c.display_order ?? 0))
          : 0;

      const { error } = await supabase.from("categories").insert({
        ...payload,
        display_order: maxOrder + 1,
      });

      if (error) {
        toast.error("Failed to create category");
        setSaving(false);
        return;
      }
      toast.success("Category created");
    }

    setSaving(false);
    setModalOpen(false);
    fetchCategories();
  }

  async function handleDelete() {
    if (!deleteId) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", deleteId);

    if (error) {
      toast.error("Failed to delete category");
    } else {
      toast.success("Category deleted");
      fetchCategories();
    }
    setDeleteId(null);
  }

  async function moveCategory(index: number, direction: "up" | "down") {
    const newCategories = [...categories];
    const swapIndex = direction === "up" ? index - 1 : index + 1;

    if (swapIndex < 0 || swapIndex >= newCategories.length) return;

    [newCategories[index], newCategories[swapIndex]] = [
      newCategories[swapIndex],
      newCategories[index],
    ];

    setCategories(newCategories);

    // Update display orders in database
    for (let i = 0; i < newCategories.length; i++) {
      await supabase
        .from("categories")
        .update({ display_order: i })
        .eq("id", newCategories[i].id);
    }
  }

  return (
    <div
      className="min-h-full py-12 md:py-16 px-4 md:px-6"
      style={{ backgroundColor: "var(--platform-canvas)" }}
    >
      <div
        className="max-w-[860px] mx-auto rounded-lg"
        style={{
          backgroundColor: "var(--platform-surface)",
          border: "1px solid var(--platform-border)",
        }}
      >
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <h1
                className="text-[22px] md:text-[26px] font-medium tracking-[-0.01em]"
                style={{ color: "var(--platform-text)" }}
              >
                Categories
              </h1>
              <p
                className="text-[13px] mt-1"
                style={{ color: "var(--platform-text-muted)" }}
              >
                {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
              </p>
            </div>
            <AppButton intent="primary" onClick={() => openModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </AppButton>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className="text-left text-[11px] uppercase tracking-wide"
                  style={{
                    color: "var(--platform-text-muted)",
                    borderBottom: "1px solid var(--platform-border)",
                  }}
                >
                  <th className="pb-3 pr-4 w-[40px]"></th>
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4 hidden md:table-cell">Slug</th>
                  <th className="pb-3 pr-4 text-right">Articles</th>
                  <th className="pb-3 w-[80px]"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-[13px]"
                      style={{ color: "var(--platform-text-muted)" }}
                    >
                      Loading...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-[13px]"
                      style={{ color: "var(--platform-text-muted)" }}
                    >
                      No categories
                    </td>
                  </tr>
                ) : (
                  categories.map((category, i) => (
                    <tr
                      key={category.id}
                      className="group"
                      style={{
                        backgroundColor:
                          i % 2 === 1 ? "rgba(255,255,255,0.01)" : "transparent",
                        borderBottom: "1px solid var(--platform-border)",
                      }}
                    >
                      <td className="py-3 pr-2">
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => moveCategory(i, "up")}
                            disabled={i === 0}
                            className="p-1 rounded hover:bg-white/5 disabled:opacity-30"
                            style={{ color: "var(--platform-text-muted)" }}
                          >
                            <GripVertical className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          {category.icon && (
                            <span className="text-[14px]">{category.icon}</span>
                          )}
                          <span
                            className="text-[13px] font-medium"
                            style={{ color: "var(--platform-text)" }}
                          >
                            {category.name}
                          </span>
                        </div>
                      </td>
                      <td
                        className="py-3 pr-4 hidden md:table-cell text-[13px]"
                        style={{ color: "var(--platform-text-muted)" }}
                      >
                        {category.slug}
                      </td>
                      <td
                        className="py-3 pr-4 text-right text-[13px] tabular-nums"
                        style={{ color: "var(--platform-text-muted)" }}
                      >
                        {category.article_count ?? 0}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openModal(category)}
                            className="p-2 rounded hover:bg-white/5"
                            style={{ color: "var(--platform-text-muted)" }}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(category.id)}
                            className="p-2 rounded hover:bg-white/5"
                            style={{ color: "var(--platform-text-muted)" }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          style={{
            backgroundColor: "var(--platform-surface)",
            border: "1px solid var(--platform-border)",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "var(--platform-text)" }}>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label
                className="text-[12px] uppercase tracking-wide mb-2 block"
                style={{ color: "var(--platform-text-muted)" }}
              >
                Name
              </Label>
              <Input
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Category name"
                style={{
                  backgroundColor: "rgba(255,255,255,0.02)",
                  borderColor: "var(--platform-border)",
                  color: "var(--platform-text)",
                }}
              />
            </div>

            <div>
              <Label
                className="text-[12px] uppercase tracking-wide mb-2 block"
                style={{ color: "var(--platform-text-muted)" }}
              >
                Slug
              </Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="category-slug"
                style={{
                  backgroundColor: "rgba(255,255,255,0.02)",
                  borderColor: "var(--platform-border)",
                  color: "var(--platform-text)",
                }}
              />
            </div>

            <div>
              <Label
                className="text-[12px] uppercase tracking-wide mb-2 block"
                style={{ color: "var(--platform-text-muted)" }}
              >
                Description
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Brief description"
                rows={2}
                style={{
                  backgroundColor: "rgba(255,255,255,0.02)",
                  borderColor: "var(--platform-border)",
                  color: "var(--platform-text)",
                }}
              />
            </div>

            <div>
              <Label
                className="text-[12px] uppercase tracking-wide mb-2 block"
                style={{ color: "var(--platform-text-muted)" }}
              >
                Icon (emoji)
              </Label>
              <Input
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                placeholder="📚"
                style={{
                  backgroundColor: "rgba(255,255,255,0.02)",
                  borderColor: "var(--platform-border)",
                  color: "var(--platform-text)",
                }}
              />
            </div>

            <div>
              <Label
                className="text-[12px] uppercase tracking-wide mb-2 block"
                style={{ color: "var(--platform-text-muted)" }}
              >
                Parent Category
              </Label>
              <Select
                value={form.parent_id}
                onValueChange={(v) => setForm((f) => ({ ...f, parent_id: v }))}
              >
                <SelectTrigger
                  style={{
                    backgroundColor: "rgba(255,255,255,0.02)",
                    borderColor: "var(--platform-border)",
                    color: "var(--platform-text)",
                  }}
                >
                  <SelectValue placeholder="None (top level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (top level)</SelectItem>
                  {categories
                    .filter((c) => c.id !== editingCategory?.id)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <AppButton
              intent="secondary"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </AppButton>
            <AppButton intent="primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </AppButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Articles in this category will become
              uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

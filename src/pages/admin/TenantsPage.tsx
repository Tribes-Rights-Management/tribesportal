import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  member_count?: number;
}

/**
 * TENANTS PAGE — ORGANIZATIONS (CANONICAL)
 * 
 * Design Rules:
 * - Flat table layout, no card wrappers
 * - Dense, institutional spacing
 * - Explicit actions, no hover-only affordances
 */
export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "" });

  const fetchTenants = async () => {
    setLoading(true);
    
    const { data: tenantsData, error: tenantsError } = await supabase
      .from("tenants")
      .select("id, name, slug, created_at")
      .order("name");

    if (tenantsError) {
      console.error("Error fetching tenants:", tenantsError);
      toast({
        title: "Operation failed",
        description: "Unable to retrieve organizations",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { data: memberCounts } = await supabase
      .from("tenant_memberships")
      .select("tenant_id")
      .eq("status", "active");

    const countMap = new Map<string, number>();
    memberCounts?.forEach((m) => {
      countMap.set(m.tenant_id, (countMap.get(m.tenant_id) || 0) + 1);
    });

    const tenantsWithCounts: Tenant[] = (tenantsData || []).map((t) => ({
      ...t,
      member_count: countMap.get(t.id) || 0,
    }));

    setTenants(tenantsWithCounts);
    setLoading(false);
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50);
  };

  const handleNameChange = (value: string) => {
    setFormData({
      name: value,
      slug: editingTenant ? formData.slug : generateSlug(value),
    });
  };

  const openCreateDialog = () => {
    setEditingTenant(null);
    setFormData({ name: "", slug: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({ name: tenant.name, slug: tenant.slug });
    setDialogOpen(true);
  };

  const saveTenant = async () => {
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast({
        title: "Validation error",
        description: "Name and slug required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      if (editingTenant) {
        const { error } = await supabase
          .from("tenants")
          .update({
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingTenant.id);

        if (error) throw error;

        toast({ title: "Organization updated" });
      } else {
        const { error } = await supabase
          .from("tenants")
          .insert({
            name: formData.name.trim(),
            slug: formData.slug.trim(),
          });

        if (error) throw error;

        toast({ title: "Organization created" });
      }

      setDialogOpen(false);
      fetchTenants();
    } catch (error: any) {
      console.error("Save tenant error:", error);
      toast({
        title: "Operation failed",
        description: error.message?.includes("duplicate")
          ? "Slug already exists"
          : "Unable to save organization",
        variant: "destructive",
      });
    }

    setSaving(false);
  };

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link 
            to="/admin" 
            className="h-8 w-8 rounded flex items-center justify-center hover:bg-black/5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-[#6B6B6B]" />
          </Link>
          <div>
            <h1 className="text-[20px] font-medium tracking-[-0.01em] text-[#111]">
              Organizations
            </h1>
            <p className="text-[13px] text-[#6B6B6B]">
              {tenants.length} organization(s)
            </p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button 
              onClick={openCreateDialog}
              className="h-8 px-3 rounded text-[13px] font-medium bg-[#111] text-white hover:bg-[#222] flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Add organization
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-[16px] font-medium">
                {editingTenant ? "Edit organization" : "Add organization"}
              </DialogTitle>
              <DialogDescription className="text-[13px]">
                {editingTenant
                  ? "Update organization details."
                  : "Create a new organization."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[13px]">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Acme Publishing"
                  className="h-9 text-[14px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-[13px]">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="acme-publishing"
                  className="h-9 text-[14px] font-mono"
                />
                <p className="text-[12px] text-[#8A8A8A]">
                  URL-friendly identifier. Must be unique.
                </p>
              </div>
            </div>
            <DialogFooter>
              <button
                onClick={() => setDialogOpen(false)}
                disabled={saving}
                className="h-8 px-3 rounded text-[13px] font-medium border border-[#E5E5E5] text-[#6B6B6B] hover:border-[#D4D4D4] hover:text-[#111]"
              >
                Cancel
              </button>
              <button 
                onClick={saveTenant} 
                disabled={saving}
                className="h-8 px-3 rounded text-[13px] font-medium bg-[#111] text-white hover:bg-[#222] disabled:opacity-40"
              >
                {saving ? "Saving" : editingTenant ? "Update" : "Create"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table - flat, no card wrapper */}
      <div className="border border-[#E5E5E5] rounded-md bg-white overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-[14px] text-[#6B6B6B]">
            Retrieving records
          </div>
        ) : tenants.length === 0 ? (
          <div className="py-12 text-center text-[14px] text-[#6B6B6B]">
            No organizations.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">
                    {tenant.name}
                  </TableCell>
                  <TableCell className="text-[#6B6B6B] font-mono text-[13px]">
                    {tenant.slug}
                  </TableCell>
                  <TableCell>{tenant.member_count}</TableCell>
                  <TableCell className="text-[#6B6B6B]">
                    {new Date(tenant.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => openEditDialog(tenant)}
                      className="h-7 w-7 rounded flex items-center justify-center hover:bg-black/5 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5 text-[#6B6B6B]" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

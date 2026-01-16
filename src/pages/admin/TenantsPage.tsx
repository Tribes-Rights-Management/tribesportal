import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus } from "lucide-react";
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
 * TENANTS PAGE — ORGANIZATIONS (INSTITUTIONAL STANDARD)
 * 
 * Design Rules:
 * - Dark canvas, flat panels with hairline borders
 * - Table sits within centered content column
 * - No shadows, no cards, no elevation
 * - Plain text values, no badges or pills
 * - Restrained hover states
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
    <div 
      className="min-h-full py-10 px-6"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <div className="max-w-[960px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link 
              to="/admin" 
              className="h-8 w-8 rounded flex items-center justify-center transition-colors"
              style={{ color: 'var(--platform-text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 
                className="text-[28px] font-semibold tracking-[-0.02em]"
                style={{ color: 'var(--platform-text)' }}
              >
                Organizations
              </h1>
              <p 
                className="text-[15px] mt-0.5"
                style={{ color: 'var(--platform-text-secondary)' }}
              >
                {tenants.length} organization(s)
              </p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button 
                onClick={openCreateDialog}
                className="h-8 px-3 rounded text-[13px] font-medium flex items-center gap-1.5 transition-colors"
                style={{ 
                  backgroundColor: 'var(--platform-text)',
                  color: 'var(--platform-canvas)'
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                Add organization
              </button>
            </DialogTrigger>
            <DialogContent 
              className="sm:max-w-[400px]"
              style={{
                backgroundColor: 'var(--platform-surface)',
                border: '1px solid var(--platform-border)',
                color: 'var(--platform-text)'
              }}
            >
              <DialogHeader>
                <DialogTitle 
                  className="text-[16px] font-medium"
                  style={{ color: 'var(--platform-text)' }}
                >
                  {editingTenant ? "Edit organization" : "Add organization"}
                </DialogTitle>
                <DialogDescription 
                  className="text-[13px]"
                  style={{ color: 'var(--platform-text-secondary)' }}
                >
                  {editingTenant
                    ? "Update organization details."
                    : "Create a new organization."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label 
                    htmlFor="name" 
                    className="text-[13px]"
                    style={{ color: 'var(--platform-text-secondary)' }}
                  >
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Acme Publishing"
                    className="h-9 text-[14px] bg-transparent border-white/10 text-white placeholder:text-white/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label 
                    htmlFor="slug" 
                    className="text-[13px]"
                    style={{ color: 'var(--platform-text-secondary)' }}
                  >
                    Slug
                  </Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="acme-publishing"
                    className="h-9 text-[14px] font-mono bg-transparent border-white/10 text-white placeholder:text-white/30"
                  />
                  <p 
                    className="text-[12px]"
                    style={{ color: 'var(--platform-text-muted)' }}
                  >
                    URL-friendly identifier. Must be unique.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <button
                  onClick={() => setDialogOpen(false)}
                  disabled={saving}
                  className="h-8 px-3 rounded text-[13px] font-medium transition-colors"
                  style={{ 
                    border: '1px solid var(--platform-border)',
                    color: 'var(--platform-text-secondary)'
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={saveTenant} 
                  disabled={saving}
                  className="h-8 px-3 rounded text-[13px] font-medium disabled:opacity-40 transition-colors"
                  style={{ 
                    backgroundColor: 'var(--platform-text)',
                    color: 'var(--platform-canvas)'
                  }}
                >
                  {saving ? "Saving" : editingTenant ? "Update" : "Create"}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table Panel */}
        <div 
          className="rounded overflow-hidden"
          style={{ 
            backgroundColor: 'var(--platform-surface)',
            border: '1px solid var(--platform-border)'
          }}
        >
          {loading ? (
            <div 
              className="py-16 text-center text-[14px]"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              Retrieving records
            </div>
          ) : tenants.length === 0 ? (
            <div 
              className="py-16 text-center"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              <p className="text-[14px]">No organizations.</p>
              <p className="text-[13px] mt-1" style={{ color: 'var(--platform-text-muted)' }}>
                Records will appear once organizations are created.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Members</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">
                      {tenant.name}
                    </TableCell>
                    <TableCell 
                      className="font-mono text-[12px]"
                      style={{ color: 'var(--platform-text-secondary)' }}
                    >
                      {tenant.slug}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {tenant.member_count}
                    </TableCell>
                    <TableCell style={{ color: 'var(--platform-text-secondary)' }}>
                      {new Date(tenant.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => openEditDialog(tenant)}
                        className="text-[13px] transition-colors"
                        style={{ color: 'var(--platform-text-secondary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--platform-text)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--platform-text-secondary)'}
                      >
                        Edit
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}

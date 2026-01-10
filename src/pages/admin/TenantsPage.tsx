import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, RefreshCw, Plus, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { writeAuditLog, AuditActions, ResourceTypes } from "@/lib/audit";

interface Tenant {
  id: string;
  legal_name: string;
  slug: string;
  status: string;
  created_at: string;
  member_count?: number;
}

export default function TenantsPage() {
  const { profile: currentProfile } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState({ legal_name: "", slug: "" });

  const fetchTenants = async () => {
    setLoading(true);
    
    const { data: tenantsData, error: tenantsError } = await supabase
      .from("tenants")
      .select("id, legal_name, slug, status, created_at")
      .is("deleted_at", null)
      .order("legal_name");

    if (tenantsError) {
      console.error("Error fetching tenants:", tenantsError);
      toast({
        title: "Error",
        description: "Failed to load tenants",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Fetch member counts
    const { data: memberCounts } = await supabase
      .from("tenant_memberships")
      .select("tenant_id")
      .eq("status", "active")
      .is("deleted_at", null);

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
      legal_name: value,
      slug: editingTenant ? formData.slug : generateSlug(value),
    });
  };

  const openCreateDialog = () => {
    setEditingTenant(null);
    setFormData({ legal_name: "", slug: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({ legal_name: tenant.legal_name, slug: tenant.slug });
    setDialogOpen(true);
  };

  const saveTenant = async () => {
    if (!formData.legal_name.trim() || !formData.slug.trim()) {
      toast({
        title: "Error",
        description: "Name and slug are required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      if (editingTenant) {
        // Update existing tenant
        const { error } = await supabase
          .from("tenants")
          .update({
            legal_name: formData.legal_name.trim(),
            slug: formData.slug.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingTenant.id);

        if (error) throw error;

        await writeAuditLog({
          userId: currentProfile?.id,
          tenantId: editingTenant.id,
          action: AuditActions.TENANT_UPDATED,
          resourceType: ResourceTypes.TENANT,
          resourceId: editingTenant.id,
          details: {
            old_name: editingTenant.legal_name,
            new_name: formData.legal_name.trim(),
          },
        });

        toast({ title: "Tenant updated" });
      } else {
        // Create new tenant
        const { data, error } = await supabase
          .from("tenants")
          .insert({
            legal_name: formData.legal_name.trim(),
            slug: formData.slug.trim(),
          })
          .select("id")
          .single();

        if (error) throw error;

        await writeAuditLog({
          userId: currentProfile?.id,
          tenantId: data.id,
          action: AuditActions.TENANT_CREATED,
          resourceType: ResourceTypes.TENANT,
          resourceId: data.id,
          details: {
            name: formData.legal_name.trim(),
            slug: formData.slug.trim(),
          },
        });

        toast({ title: "Tenant created" });
      }

      setDialogOpen(false);
      fetchTenants();
    } catch (error: any) {
      console.error("Save tenant error:", error);
      toast({
        title: "Error",
        description: error.message?.includes("duplicate")
          ? "A tenant with this slug already exists"
          : "Failed to save tenant",
        variant: "destructive",
      });
    }

    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-semibold">Tenants</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchTenants} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Tenant
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingTenant ? "Edit Tenant" : "Create Tenant"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingTenant
                      ? "Update the tenant details."
                      : "Add a new organization to the platform."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="legal_name">Legal Name</Label>
                    <Input
                      id="legal_name"
                      value={formData.legal_name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Acme Publishing Inc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      placeholder="acme-publishing"
                    />
                    <p className="text-xs text-muted-foreground">
                      URL-friendly identifier. Must be unique.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button onClick={saveTenant} disabled={saving}>
                    {saving ? "Saving..." : editingTenant ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Tenants</CardTitle>
            <CardDescription>
              {tenants.length} organization(s) on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading...
              </div>
            ) : tenants.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">No tenants yet</p>
                <p className="text-sm mt-1">Create your first tenant to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">
                        {tenant.legal_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {tenant.slug}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            tenant.status === "active" ? "default" : "secondary"
                          }
                        >
                          {tenant.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{tenant.member_count}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(tenant.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(tenant)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

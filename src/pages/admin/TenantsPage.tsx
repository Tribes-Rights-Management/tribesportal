import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { OrganizationFormModal } from "@/components/admin/OrganizationFormModal";
import { PageContainer } from "@/components/ui/page-container";
import { PageShell, ContentPanel, EmptyState, LoadingState } from "@/components/ui/page-shell";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  member_count?: number;
}

/**
 * TENANTS PAGE — ORGANIZATIONS
 * 
 * Uses PageContainer + PageShell for consistent layout.
 * Mobile: stacked list rows, Desktop: table
 */
export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  const fetchTenants = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const openCreateDialog = () => {
    setEditingTenant(null);
    setDialogOpen(true);
  };

  const openEditDialog = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: { name: string; slug: string }) => {
    try {
      if (editingTenant) {
        const { error } = await supabase
          .from("tenants")
          .update({
            name: data.name,
            slug: data.slug,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingTenant.id);

        if (error) throw error;

        toast({ title: "Organization updated" });
      } else {
        const { error } = await supabase
          .from("tenants")
          .insert({
            name: data.name,
            slug: data.slug,
          });

        if (error) throw error;

        toast({ title: "Organization created" });
      }

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
      throw error; // Re-throw so modal knows submission failed
    }
  };

  const subtitleText = loading ? "Loading..." : `${tenants.length} organization${tenants.length !== 1 ? 's' : ''}`;

  return (
    <PageContainer>
      <PageShell
        title="Organizations"
        subtitle={subtitleText}
        backTo="/admin"
        backLabel="System Console"
      >
        {/* Add button */}
        <button 
          onClick={openCreateDialog}
          className="h-11 w-11 sm:h-9 sm:w-auto sm:px-3 rounded-lg sm:rounded text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors shrink-0"
          style={{ 
            backgroundColor: 'var(--platform-text)',
            color: 'var(--platform-canvas)'
          }}
          aria-label="Add organization"
        >
          <Plus className="h-5 w-5 sm:h-3.5 sm:w-3.5" />
          <span className="hidden sm:inline">Add organization</span>
        </button>
      </PageShell>

      <ContentPanel>
        {loading ? (
          <LoadingState />
        ) : tenants.length === 0 ? (
          <EmptyState
            title="No organizations."
            description="Records will appear once organizations are created."
          />
        ) : (
          <>
            {/* Mobile: Stacked list rows */}
            <div className="block md:hidden">
              {tenants.map((tenant, index) => (
                <button
                  key={tenant.id}
                  onClick={() => openEditDialog(tenant)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors group hover:bg-white/[0.02]"
                  style={{ 
                    borderBottom: index < tenants.length - 1 ? '1px solid var(--platform-border)' : undefined
                  }}
                >
                  {/* Left: Name + Slug */}
                  <div className="min-w-0 flex-1">
                    <p 
                      className="text-[14px] font-medium truncate"
                      style={{ color: 'var(--platform-text)' }}
                    >
                      {tenant.name}
                    </p>
                    <p 
                      className="text-[12px] font-mono mt-0.5 line-clamp-2 break-all"
                      style={{ 
                        color: 'var(--platform-text-muted)', 
                        opacity: 0.7,
                        lineHeight: '1.45',
                      }}
                    >
                      {tenant.slug}
                    </p>
                  </div>

                  {/* Right: Member count + Chevron */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span 
                      className="text-[13px] font-medium tabular-nums"
                      style={{ color: 'var(--platform-text-secondary)' }}
                    >
                      {tenant.member_count}
                    </span>
                    <ChevronRight 
                      className="h-4 w-4 shrink-0 opacity-30 group-hover:opacity-50 transition-opacity"
                      style={{ color: 'var(--platform-text-muted)' }}
                    />
                  </div>
                </button>
              ))}
            </div>

            {/* Desktop: Table layout */}
            <div className="hidden md:block">
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
            </div>
          </>
        )}
      </ContentPanel>

      {/* Organization Form Modal */}
      <OrganizationFormModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={editingTenant ? { name: editingTenant.name, slug: editingTenant.slug } : null}
        mode={editingTenant ? "edit" : "create"}
      />
    </PageContainer>
  );
}

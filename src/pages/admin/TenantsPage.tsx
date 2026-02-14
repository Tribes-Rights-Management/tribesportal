import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppTable, AppTableHeader, AppTableBody, AppTableHead, AppTableRow, AppTableCell } from "@/components/app-ui/AppTable";
import { ConsoleButton } from "@/components/console";
import { Plus, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { OrganizationFormModal } from "@/components/admin/OrganizationFormModal";
import { AppPageLayout, AppButton } from "@/components/app-ui";
import { ContentPanel, EmptyState, LoadingState } from "@/components/ui/page-shell";

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
    <AppPageLayout
      title="Organizations"
      backLink={{ to: "/console", label: "System Console" }}
      action={
        <ConsoleButton 
          intent="primary"
          size="sm"
          onClick={openCreateDialog}
          className="shrink-0"
          aria-label="Add organization"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Add organization</span>
        </ConsoleButton>
      }
    >

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
                  className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left row-hover group"
                  style={{ 
                    borderBottom: index < tenants.length - 1 ? '1px solid var(--platform-border)' : undefined,
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
              <AppTable columns={["30%", "25%", "15%", "20%", "10%"]}>
                <AppTableHeader>
                  <AppTableRow header>
                    <AppTableHead>Name</AppTableHead>
                    <AppTableHead>Slug</AppTableHead>
                    <AppTableHead align="right">Members</AppTableHead>
                    <AppTableHead>Created</AppTableHead>
                    <AppTableHead></AppTableHead>
                  </AppTableRow>
                </AppTableHeader>
                <AppTableBody>
                  {tenants.map((tenant) => (
                    <AppTableRow 
                      key={tenant.id}
                      clickable
                      onClick={() => openEditDialog(tenant)}
                    >
                      <AppTableCell className="font-medium">
                        {tenant.name}
                      </AppTableCell>
                      <AppTableCell mono muted>
                        {tenant.slug}
                      </AppTableCell>
                      <AppTableCell align="right">
                        {tenant.member_count}
                      </AppTableCell>
                      <AppTableCell muted>
                        {new Date(tenant.created_at).toLocaleDateString()}
                      </AppTableCell>
                      <AppTableCell>
                        <span
                          className="text-[13px]"
                          style={{ color: 'var(--platform-text-secondary)' }}
                        >
                          Edit
                        </span>
                      </AppTableCell>
                    </AppTableRow>
                  ))}
                </AppTableBody>
              </AppTable>
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
    </AppPageLayout>
  );
}

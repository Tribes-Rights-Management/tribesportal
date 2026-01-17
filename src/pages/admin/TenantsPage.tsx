import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { OrganizationFormModal } from "@/components/admin/OrganizationFormModal";

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
 * - Mobile-first: stacked list rows on mobile, table on desktop
 * - Dark canvas, flat panels with hairline borders
 * - No shadows, no cards, no elevation
 * - Plain text values, no badges or pills
 * - Restrained hover states
 * - Title block: back button | centered title | action button
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

  return (
    <div 
      className="min-h-full py-6 md:py-10 px-4 md:px-6"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <div className="max-w-[960px] mx-auto">
        {/* Header - Mobile-first with centered title */}
        <div className="relative flex items-center justify-between mb-6 md:mb-8 min-h-[56px]">
          {/* Left: Back button (44px tap target) */}
          <Link 
            to="/admin" 
            className="h-11 w-11 rounded-lg flex items-center justify-center transition-colors shrink-0 -ml-2"
            style={{ color: 'var(--platform-text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            aria-label="Back to System Console"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          {/* Center: Title stack (truly centered on mobile) */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <h1 
              className="text-[20px] md:text-[28px] font-semibold tracking-[-0.02em] whitespace-nowrap"
              style={{ color: 'var(--platform-text)' }}
            >
              Organizations
            </h1>
            <p 
              className="text-[12px] md:text-[14px] mt-0.5"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              {loading ? "Loading..." : `${tenants.length} organization${tenants.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Right: Add button (icon-only on mobile, text+icon on desktop) */}
          <button 
            onClick={openCreateDialog}
            className="h-11 w-11 md:h-9 md:w-auto md:px-3 rounded-lg md:rounded text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors shrink-0"
            style={{ 
              backgroundColor: 'var(--platform-text)',
              color: 'var(--platform-canvas)'
            }}
            aria-label="Add organization"
          >
            <Plus className="h-5 w-5 md:h-3.5 md:w-3.5" />
            <span className="hidden md:inline">Add organization</span>
          </button>
        </div>

        {/* Content Panel */}
        <div 
          className="rounded-lg md:rounded overflow-hidden"
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
              className="py-16 text-center px-4"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              <p className="text-[14px]">No organizations.</p>
              <p className="text-[13px] mt-1" style={{ color: 'var(--platform-text-muted)' }}>
                Records will appear once organizations are created.
              </p>
            </div>
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
        </div>
      </div>

      {/* Organization Form Modal */}
      <OrganizationFormModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={editingTenant ? { name: editingTenant.name, slug: editingTenant.slug } : null}
        mode={editingTenant ? "edit" : "create"}
      />
    </div>
  );
}

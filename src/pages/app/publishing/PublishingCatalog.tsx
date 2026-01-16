import { PageHeader } from "@/components/ui/page-header";
import { InstitutionalEmptyPanel } from "@/components/ui/institutional-states";

/**
 * PUBLISHING CATALOG — INSTITUTIONAL MODE
 */
export default function PublishingCatalog() {
  return (
    <div 
      className="p-6"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <div className="max-w-[960px]">
        <PageHeader 
          title="Catalog"
          description="Full catalog access and management"
        />

        <InstitutionalEmptyPanel
          title="No catalog entries available."
          description="Catalog items will appear once added to your account."
        />
      </div>
    </div>
  );
}

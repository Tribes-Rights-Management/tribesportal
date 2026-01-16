import { PageHeader } from "@/components/ui/page-header";
import { InstitutionalEmptyPanel } from "@/components/ui/institutional-states";

export default function LicensingCatalog() {
  return (
    <div className="p-6" style={{ backgroundColor: 'var(--platform-canvas)' }}>
      <div className="max-w-[960px]">
        <PageHeader title="Catalog" description="Licensed works and assets" />
        <InstitutionalEmptyPanel title="No catalog entries available." description="Catalog items will appear once added." />
      </div>
    </div>
  );
}

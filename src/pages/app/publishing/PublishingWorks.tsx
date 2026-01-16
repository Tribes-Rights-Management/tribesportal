import { PageHeader } from "@/components/ui/page-header";
import { InstitutionalEmptyPanel } from "@/components/ui/institutional-states";

/**
 * PUBLISHING WORKS — INSTITUTIONAL MODE
 * Dark theme, institutional empty state
 */
export default function PublishingWorks() {
  return (
    <div 
      className="p-6"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <div className="max-w-[960px]">
        <PageHeader 
          title="Works"
          description="Works, compositions, and metadata"
        />

        <InstitutionalEmptyPanel
          title="No works available."
          description="Works will appear once added to your catalog."
        />
      </div>
    </div>
  );
}

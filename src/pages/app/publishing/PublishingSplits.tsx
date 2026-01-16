import { PageHeader } from "@/components/ui/page-header";
import { InstitutionalEmptyPanel } from "@/components/ui/institutional-states";

/**
 * PUBLISHING SPLITS — INSTITUTIONAL MODE
 */
export default function PublishingSplits() {
  return (
    <div 
      className="p-6"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <div className="max-w-[960px]">
        <PageHeader 
          title="Splits"
          description="Ownership splits and rights allocation"
        />

        <InstitutionalEmptyPanel
          title="No splits available."
          description="Ownership splits will appear once configured for your works."
        />
      </div>
    </div>
  );
}

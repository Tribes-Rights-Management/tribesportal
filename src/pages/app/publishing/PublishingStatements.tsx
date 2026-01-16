import { PageHeader } from "@/components/ui/page-header";
import { InstitutionalEmptyPanel } from "@/components/ui/institutional-states";

/**
 * PUBLISHING STATEMENTS — INSTITUTIONAL MODE
 */
export default function PublishingStatements() {
  return (
    <div 
      className="p-6"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <div className="max-w-[960px]">
        <PageHeader 
          title="Statements"
          description="Royalty statements and earnings reports"
        />

        <InstitutionalEmptyPanel
          title="No statements available."
          description="Royalty statements will appear once processed."
        />
      </div>
    </div>
  );
}

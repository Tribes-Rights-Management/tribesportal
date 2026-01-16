import { PageHeader } from "@/components/ui/page-header";
import { InstitutionalEmptyPanel } from "@/components/ui/institutional-states";

/**
 * PUBLISHING REGISTRATIONS — INSTITUTIONAL MODE
 */
export default function PublishingRegistrations() {
  return (
    <div 
      className="p-6"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <div className="max-w-[960px]">
        <PageHeader 
          title="Registrations"
          description="Registration status across societies and territories"
        />

        <InstitutionalEmptyPanel
          title="No registrations available."
          description="Registration records will appear once works are submitted."
        />
      </div>
    </div>
  );
}

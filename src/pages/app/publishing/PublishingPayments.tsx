import { PageHeader } from "@/components/ui/page-header";
import { InstitutionalEmptyPanel } from "@/components/ui/institutional-states";

/**
 * PUBLISHING PAYMENTS — INSTITUTIONAL MODE
 */
export default function PublishingPayments() {
  return (
    <div 
      className="p-6"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <div className="max-w-[960px]">
        <PageHeader 
          title="Payments"
          description="Payment history and tax documentation"
        />

        <InstitutionalEmptyPanel
          title="No payments available."
          description="Payment records will appear once transactions are processed."
        />
      </div>
    </div>
  );
}

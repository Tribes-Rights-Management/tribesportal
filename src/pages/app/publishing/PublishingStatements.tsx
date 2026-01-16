import { PageHeader } from "@/components/ui/page-header";

/**
 * Publishing Statements - Institutional mode
 */
export default function PublishingStatements() {
  return (
    <div className="p-6 max-w-5xl">
      <PageHeader 
        title="Statements"
        description="Royalty statements and earnings reports"
      />

      <div className="bg-white border border-[#E8E8E8] rounded-md p-6 text-center">
        <p className="text-[14px] text-[#6B6B6B]">
          No records available.
        </p>
      </div>
    </div>
  );
}

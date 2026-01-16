import { PageHeader } from "@/components/ui/page-header";

/**
 * Licensing Catalog - Institutional mode
 */
export default function LicensingCatalog() {
  return (
    <div className="p-6 max-w-5xl">
      <PageHeader 
        title="Catalog"
        description="Licensed works and assets"
      />

      <div className="bg-white border border-[#E8E8E8] rounded-md p-6 text-center">
        <p className="text-[14px] text-[#6B6B6B]">
          No records available.
        </p>
      </div>
    </div>
  );
}

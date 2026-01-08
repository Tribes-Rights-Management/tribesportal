import { WizardFormData } from "@/types";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { format } from "date-fns";

interface ReviewStepProps {
  data: WizardFormData;
  onEditStep: (step: number) => void;
}

export function ReviewStep({ data, onEditStep }: ReviewStepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Review Your Request</h2>
        <p className="text-sm text-muted-foreground">
          Please review your information before submitting.
        </p>
      </div>

      {/* License Types */}
      <Section title="License Types" onEdit={() => onEditStep(2)}>
        <p className="text-sm">
          {data.selected_license_types.length > 0 
            ? data.selected_license_types.join(", ")
            : "No license types selected"}
        </p>
      </Section>

      {/* Your Information */}
      <Section title="Your Information" onEdit={() => onEditStep(3)}>
        <div className="space-y-2 text-sm">
          <p><strong>Name:</strong> {data.first_name} {data.last_name}</p>
          {data.organization && <p><strong>Organization:</strong> {data.organization}</p>}
          <p><strong>Email:</strong> {data.licensee_email}</p>
          <p><strong>Address:</strong> {[
            data.address_street,
            data.address_city,
            data.address_state,
            data.address_zip,
            data.address_country
          ].filter(Boolean).join(", ")}</p>
        </div>
      </Section>

      {/* Product Details */}
      <Section title="Product Details" onEdit={() => onEditStep(4)}>
        <div className="space-y-2 text-sm">
          <p><strong>Label / Master Owner:</strong> {data.label_master_owner}</p>
          <p><strong>Distributor:</strong> {data.distributor}</p>
          <p><strong>Recording Artist:</strong> {data.recording_artist}</p>
          <p><strong>Release Title:</strong> {data.release_title}</p>
          <p><strong>Release Date:</strong> {data.release_date ? format(new Date(data.release_date), "PPP") : "—"}</p>
          <p><strong>UPC:</strong> {data.product_upc}</p>
          {data.additional_product_info && (
            <p><strong>Additional Info:</strong> {data.additional_product_info}</p>
          )}
        </div>
      </Section>

      {/* Track Details */}
      <Section title="Track Details" onEdit={() => onEditStep(5)}>
        <div className="space-y-2 text-sm">
          <p><strong>Track Title:</strong> {data.track_title}</p>
          <p><strong>Track Artist:</strong> {data.track_artist}</p>
          <p><strong>ISRC:</strong> {data.track_isrc}</p>
          <p><strong>Runtime:</strong> {data.runtime}</p>
          <p><strong>Multiple Appearances:</strong> {data.appears_multiple_times ? `Yes (${data.times_count || "—"} times)` : "No"}</p>
          {data.additional_track_info && (
            <p><strong>Additional Info:</strong> {data.additional_track_info}</p>
          )}
        </div>
      </Section>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  onEdit: () => void;
}

function Section({ title, children, onEdit }: SectionProps) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">{title}</h3>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="w-3 h-3 mr-1" />
          Edit
        </Button>
      </div>
      {children}
    </div>
  );
}

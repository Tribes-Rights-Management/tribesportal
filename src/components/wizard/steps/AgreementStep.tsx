import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AgreementStepProps {
  agreementAccounting: boolean;
  agreementTerms: boolean;
  onUpdate: (field: string, value: boolean) => void;
  errors: Record<string, string>;
}

export function AgreementStep({ agreementAccounting, agreementTerms, onUpdate, errors }: AgreementStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Agreement</h2>
        <p className="text-sm text-muted-foreground">
          Please review and accept the following terms before proceeding.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="agreement_accounting"
            checked={agreementAccounting}
            onCheckedChange={(checked) => onUpdate("agreement_accounting", !!checked)}
          />
          <div className="space-y-1">
            <Label htmlFor="agreement_accounting" className="text-sm cursor-pointer">
              I agree to provide accurate accounting information
            </Label>
            <p className="text-xs text-muted-foreground">
              You certify that all financial and usage data provided will be accurate and complete.
            </p>
            {errors.agreement_accounting && (
              <p className="text-xs text-destructive">{errors.agreement_accounting}</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="agreement_terms"
            checked={agreementTerms}
            onCheckedChange={(checked) => onUpdate("agreement_terms", !!checked)}
          />
          <div className="space-y-1">
            <Label htmlFor="agreement_terms" className="text-sm cursor-pointer">
              I agree to the license terms and conditions
            </Label>
            <p className="text-xs text-muted-foreground">
              You agree to abide by the terms of the license agreement once executed.
            </p>
            {errors.agreement_terms && (
              <p className="text-xs text-destructive">{errors.agreement_terms}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

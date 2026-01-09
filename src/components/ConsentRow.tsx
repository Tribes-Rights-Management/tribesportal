import { Link } from "react-router-dom";
import { TribesCheckbox } from "@/components/ui/tribes-checkbox";

/**
 * CONSENT ROW — GLOBAL UI STANDARD (LOCKED)
 * 
 * Single source of truth for "I agree to Privacy Policy and Terms" consent.
 * 
 * Spacing rules (explicit margins, NOT inherited gaps):
 * - 20px margin ABOVE the consent row (mt-5)
 * - NO margin below — the CTA button wrapper must apply its own mt-5
 * - Checkbox aligns to first line of label text (via TribesCheckbox)
 * - Same left edge as form inputs (no extra left padding)
 */

interface ConsentRowProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function ConsentRow({
  id = "consent-terms",
  checked,
  onCheckedChange,
  disabled = false,
}: ConsentRowProps) {
  return (
    <div className="mt-5">
      <TribesCheckbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      >
        I agree to the{" "}
        <Link
          to="/privacy"
          className="text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          Privacy Policy
        </Link>
        {" "}and{" "}
        <Link
          to="/terms"
          className="text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          Terms of Use
        </Link>.
      </TribesCheckbox>
    </div>
  );
}

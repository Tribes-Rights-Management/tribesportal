import { Link } from "react-router-dom";
import { TribesCheckbox } from "@/components/ui/tribes-checkbox";

/**
 * CONSENT ROW — GLOBAL UI STANDARD (LOCKED)
 * 
 * Single source of truth for "I agree to Privacy Policy and Terms" consent.
 * 
 * Spacing rules (enforced via explicit margins, not inherited gaps):
 * - 20px margin ABOVE the consent row (mt-5)
 * - 20px margin BELOW the consent row (mb-5)
 * - Checkbox aligns to first line of label text (top-aligned)
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
    <div className="mt-5 mb-5">
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
          target="_blank"
          onClick={(e) => e.stopPropagation()}
        >
          Privacy Policy
        </Link>
        {" "}and{" "}
        <Link
          to="/terms"
          className="text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity duration-150"
          target="_blank"
          onClick={(e) => e.stopPropagation()}
        >
          Terms of Use
        </Link>.
      </TribesCheckbox>
    </div>
  );
}

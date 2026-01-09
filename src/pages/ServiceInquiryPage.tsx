import { useState } from "react";
import { Link } from "react-router-dom";
import { FormPageLayout, FormSuccessLayout } from "@/components/FormPageLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConsentRow } from "@/components/ConsentRow";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { COUNTRIES } from "@/lib/countries";
import { z } from "zod";

/**
 * SERVICE INQUIRY PAGE — Uses global FormPageLayout standard
 * NO page-specific typography or spacing overrides.
 * 
 * PURPOSE: For companies, rights holders, and creators exploring a potential 
 * ongoing relationship with Tribes Rights Management.
 * 
 * THIS PAGE DOES NOT:
 * - Create a portal account
 * - Grant licensing access
 * - Imply acceptance or onboarding
 * 
 * This is a RELATIONSHIP inquiry, not a transactional request.
 */

const inquirySchema = z.object({
  fullName: z.string().trim().min(1, "This field is required.").max(200),
  company: z.string().trim().min(1, "This field is required.").max(200),
  email: z.string().trim().email("Enter a valid email address.").max(255),
  country: z.string().min(1, "This field is required."),
  roleType: z.string().min(1, "This field is required."),
  catalogDescription: z.string().trim().min(1, "This field is required.").max(2000),
  lookingFor: z.string().trim().min(1, "This field is required.").max(2000),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "This information is required to proceed." }),
  }),
});

export default function ServiceInquiryPage() {
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [roleType, setRoleType] = useState("");
  const [catalogDescription, setCatalogDescription] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = inquirySchema.safeParse({
      fullName,
      company,
      email,
      country,
      roleType,
      catalogDescription,
      lookingFor,
      agreeToTerms,
    });

    if (!result.success) {
      toast({
        title: "Please complete all required fields",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
  }

  // Post-submission confirmation
  if (isSubmitted) {
    return (
      <FormSuccessLayout
        title="Inquiry received"
        message="We'll review your inquiry and follow up if there's a fit."
      >
        <Link 
          to="/" 
          className="text-[14px] text-muted-foreground hover:text-foreground transition-colors duration-150 underline underline-offset-4"
        >
          Return to site
        </Link>
      </FormSuccessLayout>
    );
  }

  return (
    <FormPageLayout
      title="Inquire About Services"
      lede="For publishing administration, rights management, or catalog support."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ============================================
            SECTION 1: IDENTITY FIELDS
            ============================================ */}
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">
              Full name
            </label>
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={isSubmitting}
              aria-label="Full name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">
              Company / Organization
            </label>
            <Input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              disabled={isSubmitting}
              aria-label="Company or organization"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">
              Email address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              aria-label="Email address"
            />
          </div>
        </div>

        {/* ============================================
            SECTION 2: CONTEXT FIELDS
            ============================================ */}
        <div className="pt-2 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">
              Country or territory
            </label>
            <Select value={country} onValueChange={setCountry} disabled={isSubmitting}>
              <SelectTrigger aria-label="Select your location">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">
              Your role
            </label>
            <Select value={roleType} onValueChange={setRoleType} disabled={isSubmitting}>
              <SelectTrigger aria-label="Your role">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="songwriter_creator">Songwriter / Creator</SelectItem>
                <SelectItem value="publisher_rights_holder">Publisher / Rights Holder</SelectItem>
                <SelectItem value="brand_agency">Brand / Agency</SelectItem>
                <SelectItem value="media_company">Media Company</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ============================================
            SECTION 3: INTENT FIELDS
            ============================================ */}
        <div className="pt-2 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">
              Catalog or scope
            </label>
            <Textarea
              placeholder="Size, type of rights, geographic reach, etc."
              value={catalogDescription}
              onChange={(e) => setCatalogDescription(e.target.value)}
              required
              disabled={isSubmitting}
              rows={3}
              aria-label="Catalog or scope description"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">
              What you're looking for
            </label>
            <Textarea
              placeholder="Administration, licensing, catalog oversight, etc."
              value={lookingFor}
              onChange={(e) => setLookingFor(e.target.value)}
              required
              disabled={isSubmitting}
              rows={3}
              aria-label="What you're looking for"
            />
          </div>
        </div>

        {/* ============================================
            SECTION 4: CONSENT + SUBMISSION
            Spacing: 20px above/below consent (via ConsentRow)
            ============================================ */}
        <ConsentRow
          id="terms"
          checked={agreeToTerms}
          onCheckedChange={setAgreeToTerms}
          disabled={isSubmitting}
        />

        <Button
          type="submit"
          disabled={isSubmitting || !agreeToTerms}
          size="lg"
          className="w-full"
        >
          {isSubmitting ? "Submitting…" : "Submit Inquiry"}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-[14px] text-muted-foreground">
          Need licensing access?{" "}
          <Link to="/licensing-account" className="text-foreground font-medium hover:opacity-70 transition-opacity duration-150">
            Request an account
          </Link>
        </p>
      </div>
    </FormPageLayout>
  );
}

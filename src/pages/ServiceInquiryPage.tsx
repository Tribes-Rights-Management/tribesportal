import { useState } from "react";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/PublicLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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

/* ═══════════════════════════════════════════════════════════════════════════════════
   SERVICE INQUIRY PAGE
   
   PURPOSE: For companies, rights holders, and creators exploring a potential 
   ongoing relationship with Tribes Rights Management.
   
   THIS PAGE DOES NOT:
   - Create a portal account
   - Grant licensing access
   - Imply acceptance or onboarding
   
   This is a RELATIONSHIP inquiry, not a transactional request.
   ═══════════════════════════════════════════════════════════════════════════════════ */

const inquirySchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(200),
  company: z.string().trim().min(1, "Company or organization is required").max(200),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  country: z.string().min(1, "Country is required"),
  roleType: z.string().min(1, "Please select your role"),
  catalogDescription: z.string().trim().min(1, "Please describe your catalog or scope").max(2000),
  lookingFor: z.string().trim().min(1, "Please describe what you're looking for").max(2000),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the Privacy Policy and Terms of Use" }),
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
      <PublicLayout>
        <section className="pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12">
            <div className="max-w-[560px]">
              <h1 className="text-[28px] md:text-[32px] font-semibold text-foreground mb-3">
                Inquiry received
              </h1>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We'll review your inquiry and follow up if there's a fit.
              </p>
              <Link 
                to="/" 
                className="text-[14px] text-muted-foreground hover:text-foreground transition-colors duration-150 underline underline-offset-4"
              >
                Return to home
              </Link>
            </div>
          </div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Header */}
      <section className="pt-20 pb-6 md:pt-28 md:pb-8">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="max-w-[560px]">
            <h1 className="text-[28px] md:text-[32px] font-semibold text-foreground mb-3">
              Inquire About Services
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              For publishing administration, rights management, or catalog support.
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="max-w-[560px]">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isSubmitting}
                aria-label="Full name"
                className="h-14 px-4 text-[15px] rounded-xl border-border/60 bg-background"
              />

              <Input
                type="text"
                placeholder="Company / Organization"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                disabled={isSubmitting}
                aria-label="Company or organization"
                className="h-14 px-4 text-[15px] rounded-xl border-border/60 bg-background"
              />

              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                aria-label="Email address"
                className="h-14 px-4 text-[15px] rounded-xl border-border/60 bg-background"
              />

              <Select value={country} onValueChange={setCountry} disabled={isSubmitting}>
                <SelectTrigger 
                  aria-label="Select your location"
                  className="h-14 px-4 text-[15px] rounded-xl border-border/60 bg-background"
                >
                  <SelectValue placeholder="Country or territory" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={roleType} onValueChange={setRoleType} disabled={isSubmitting}>
                <SelectTrigger 
                  aria-label="Your role"
                  className="h-14 px-4 text-[15px] rounded-xl border-border/60 bg-background"
                >
                  <SelectValue placeholder="Your role" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  <SelectItem value="songwriter_creator">Songwriter / Creator</SelectItem>
                  <SelectItem value="publisher_rights_holder">Publisher / Rights Holder</SelectItem>
                  <SelectItem value="brand_agency">Brand / Agency</SelectItem>
                  <SelectItem value="media_company">Media Company</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <div className="pt-2">
                <label className="text-[14px] text-muted-foreground mb-2 block">
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
                  className="px-4 py-3 text-[15px] rounded-xl border-border/60 bg-background resize-none"
                />
              </div>

              <div className="pt-2">
                <label className="text-[14px] text-muted-foreground mb-2 block">
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
                  className="px-4 py-3 text-[15px] rounded-xl border-border/60 bg-background resize-none"
                />
              </div>

              {/* Consent */}
              <div className="pt-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                    disabled={isSubmitting}
                    aria-label="Agree to terms"
                    className="shrink-0 mt-0.5 h-5 w-5 rounded border-border/60"
                  />
                  <label 
                    htmlFor="terms" 
                    className="text-[14px] text-muted-foreground leading-relaxed cursor-pointer"
                  >
                    I agree to the{" "}
                    <Link 
                      to="/privacy" 
                      className="text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                      target="_blank"
                    >
                      Privacy Policy
                    </Link>
                    {" "}and{" "}
                    <Link 
                      to="/terms" 
                      className="text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                      target="_blank"
                    >
                      Terms of Use
                    </Link>.
                  </label>
                </div>
              </div>

              <div className="pt-6 flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting || !agreeToTerms}
                  className="h-14 px-12 text-[15px] font-medium rounded-xl transition-all duration-150 bg-muted-foreground/80 text-background hover:bg-muted-foreground disabled:bg-muted-foreground/40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting…" : "Submit Inquiry"}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[14px] text-muted-foreground">
                Need licensing access?{" "}
                <Link to="/licensing-account" className="text-foreground font-medium hover:underline">
                  Request an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

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
import { supabase } from "@/integrations/supabase/client";
import { COUNTRIES } from "@/lib/countries";
import { getSignInUrl, isPreviewEnvironment } from "@/lib/domains";
import { z } from "zod";

const licensingAccountSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(200),
  company: z.string().trim().min(1, "Company or organization is required").max(200),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  country: z.string().min(1, "Country is required"),
  organizationType: z.string().min(1, "Organization type is required"),
  intendedUse: z.string().trim().min(1, "Please describe your intended use").max(2000),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the Privacy Policy and Terms of Use" }),
  }),
});

type ViewState = "form" | "pending" | "submitted" | "exists";

export default function LicensingAccountPage() {
  const [viewState, setViewState] = useState<ViewState>("form");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [intendedUse, setIntendedUse] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = licensingAccountSchema.safeParse({
      fullName,
      company,
      email,
      country,
      organizationType,
      intendedUse,
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

    try {
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const { data, error } = await supabase.functions.invoke("auth-check", {
        body: {
          email: email.trim().toLowerCase(),
          firstName: firstName,
          lastName: lastName,
          company: company.trim(),
          country,
          companyType: `licensing_${organizationType}`,
          companyDescription: intendedUse.trim(),
          isRequestAccess: true,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to process request");
      }

      const status = data?.status;

      if (status === "active") {
        setViewState("exists");
      } else if (status === "pending") {
        setViewState("pending");
      } else if (status === "new_request") {
        setViewState("submitted");
      } else {
        throw new Error("Unexpected response");
      }
    } catch (error: any) {
      console.error("Request error:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Submitted successfully
  if (viewState === "submitted") {
    return (
      <PublicLayout footerVariant="minimal">
        <section className="pt-28 pb-24 md:pt-36 md:pb-32">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12">
            <div className="max-w-[560px]">
              <h1 className="text-foreground mb-3">
                Request submitted
              </h1>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We'll review your request and send access instructions if approved.
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

  // Already pending
  if (viewState === "pending") {
    return (
      <PublicLayout footerVariant="minimal">
        <section className="pt-28 pb-24 md:pt-36 md:pb-32">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12">
            <div className="max-w-[560px]">
              <h1 className="text-foreground mb-3">
                Already pending
              </h1>
              <p className="text-muted-foreground leading-relaxed mb-6">
                A request for this email is already under review.
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

  // Account already exists
  if (viewState === "exists") {
    return (
      <PublicLayout footerVariant="minimal">
        <section className="pt-28 pb-24 md:pt-36 md:pb-32">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12">
            <div className="max-w-[560px]">
              <h1 className="text-foreground mb-3">
                Account exists
              </h1>
              <p className="text-muted-foreground leading-relaxed mb-6">
                An account with this email already exists.
              </p>
              {isPreviewEnvironment() ? (
                <Link 
                  to="/auth" 
                  className="text-[14px] text-foreground hover:text-muted-foreground transition-colors duration-150 underline underline-offset-4"
                >
                  Client Sign In
                </Link>
              ) : (
                <a 
                  href={getSignInUrl("/portal")} 
                  className="text-[14px] text-foreground hover:text-muted-foreground transition-colors duration-150 underline underline-offset-4"
                >
                  Client Sign In
                </a>
              )}
            </div>
          </div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout footerVariant="minimal">
      {/* Header */}
      <section className="pt-28 pb-8 md:pt-36 md:pb-10">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="max-w-[560px]">
            <h1 className="text-foreground mb-2">
              Request Licensing Access
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Account approval required before submitting license requests.
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="pb-24 md:pb-32">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="max-w-[560px]">
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isSubmitting}
                aria-label="Full name"
              />

              <div>
                <Input
                  type="text"
                  placeholder="Company / Organization"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  disabled={isSubmitting}
                  aria-label="Company or organization"
                />
                <p className="text-[11px] text-muted-foreground/50 mt-1 leading-snug">
                  Individuals may use an artist or professional name.
                </p>
              </div>

              <div>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  aria-label="Email address"
                />
                <p className="text-[11px] text-muted-foreground/50 mt-1 leading-snug">
                  Used for account access.
                </p>
              </div>

              <Select value={country} onValueChange={setCountry} disabled={isSubmitting}>
                <SelectTrigger aria-label="Select your location">
                  <SelectValue placeholder="Country or territory" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={organizationType} onValueChange={setOrganizationType} disabled={isSubmitting}>
                <SelectTrigger aria-label="Organization type">
                  <SelectValue placeholder="Organization type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial_brand">Commercial / Brand</SelectItem>
                  <SelectItem value="broadcast_media">Broadcast / Media</SelectItem>
                  <SelectItem value="church_ministry">Church / Ministry</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                  <SelectItem value="independent_creator">Independent Creator</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <div className="pt-2">
                <label className="text-[12px] text-muted-foreground/70 mb-1.5 block">
                  Intended use
                </label>
                <Textarea
                  placeholder="Advertising, broadcast, livestream, film, venue playback, etc."
                  value={intendedUse}
                  onChange={(e) => setIntendedUse(e.target.value)}
                  required
                  disabled={isSubmitting}
                  rows={3}
                  aria-label="Intended use"
                />
                <p className="text-[11px] text-muted-foreground/50 mt-1 leading-snug">
                  Reviewed as part of account approval.
                </p>
              </div>

              {/* Consent */}
              <div className="pt-3">
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                    disabled={isSubmitting}
                    aria-label="Agree to terms"
                    className="shrink-0 mt-0.5"
                  />
                  <label 
                    htmlFor="terms" 
                    className="text-[12px] text-muted-foreground/60 leading-relaxed cursor-pointer"
                  >
                    I agree to the{" "}
                    <Link 
                      to="/privacy" 
                      className="text-muted-foreground/60 underline underline-offset-2 hover:text-foreground transition-colors"
                      target="_blank"
                    >
                      Privacy Policy
                    </Link>
                    {" "}and{" "}
                    <Link 
                      to="/terms" 
                      className="text-muted-foreground/60 underline underline-offset-2 hover:text-foreground transition-colors"
                      target="_blank"
                    >
                      Terms of Use
                    </Link>.
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full h-12 text-[14px] font-medium rounded-md transition-all duration-150 ${
                    agreeToTerms && !isSubmitting
                      ? "bg-foreground text-background hover:bg-foreground/90"
                      : "bg-muted text-muted-foreground/60 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? "Submitting…" : "Submit Request"}
                </button>
              </div>
            </form>

            <div className="flex flex-col gap-2 mt-6 text-center md:text-left">
              <p className="text-[13px] text-muted-foreground/60">
                {isPreviewEnvironment() ? (
                  <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                    Client Sign In
                  </Link>
                ) : (
                  <a href={getSignInUrl("/portal")} className="text-muted-foreground hover:text-foreground transition-colors">
                    Client Sign In
                  </a>
                )}
              </p>
              <p className="text-[12px] text-muted-foreground/40">
                <Link 
                  to="/how-publishing-administration-works" 
                  className="text-muted-foreground/40 hover:text-muted-foreground transition-colors underline underline-offset-2"
                >
                  How publishing administration works
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

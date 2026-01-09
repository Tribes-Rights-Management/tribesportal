import { useState } from "react";
import { Link } from "react-router-dom";
import { FormPageLayout, FormSuccessLayout } from "@/components/FormPageLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
import { z } from "zod";

/**
 * CONTACT PAGE — Uses global FormPageLayout standard
 * NO page-specific typography or spacing overrides.
 */

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  location: z.string().min(1, "Location is required"),
  message: z.string().trim().min(1, "Message is required").max(5000),
});

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const result = contactSchema.safeParse({
      name,
      email,
      location,
      message,
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
      const { data, error } = await supabase.functions.invoke("submit-contact", {
        body: {
          full_name: name.trim(),
          email: email.trim().toLowerCase(),
          location: location.trim(),
          message: message.trim(),
          source_page: "contact",
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to submit");
      }

      if (data?.error) {
        toast({
          title: "Unable to submit",
          description: data.error,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // INSTITUTIONAL SUCCESS STATE (LOCKED)
  if (isSubmitted) {
    return (
      <FormSuccessLayout
        title="Submission received."
        message="Your information has been received and will be reviewed. If additional information is required, you will be contacted."
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
      title="Contact"
      lede="Submit an inquiry below. All messages are reviewed."
    >
      {/* Intent clarification — institutional tone */}
      <p className="text-[14px] text-muted-foreground leading-relaxed mb-8 -mt-4">
        This form is intended for licensing, administration, and general business inquiries.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full name */}
        <div className="space-y-2">
          <label htmlFor="contact-name" className="text-[13px] font-medium text-foreground">
            Full name
          </label>
          <Input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Email address */}
        <div className="space-y-2">
          <label htmlFor="contact-email" className="text-[13px] font-medium text-foreground">
            Email address
          </label>
          <Input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Country or territory */}
        <div className="space-y-2">
          <label htmlFor="contact-location" className="text-[13px] font-medium text-foreground">
            Country or territory
          </label>
          <Select value={location} onValueChange={setLocation} disabled={isSubmitting}>
            <SelectTrigger id="contact-location">
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

        {/* Your message */}
        <div className="space-y-2">
          <label htmlFor="contact-message" className="text-[13px] font-medium text-foreground">
            Your message
          </label>
          <Textarea
            id="contact-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            disabled={isSubmitting}
            rows={4}
          />
        </div>

        {/* Full-width submit button — institutional standard (LOCKED) */}
        <div className="pt-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="w-full"
          >
            {isSubmitting ? "Submitting…" : "Submit"}
          </Button>
        </div>

        {/* Post-form expectation note — institutional tone */}
        <p className="text-[13px] text-muted-foreground text-center pt-2">
          Submissions are reviewed in order received.
        </p>
      </form>
    </FormPageLayout>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/PublicLayout";
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
import { CONTENT_CONTAINER_CLASS } from "@/lib/layout";
import { z } from "zod";

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
  // - No celebratory language or icons
  // - Neutral confirmation copy
  // - Single CTA to return
  if (isSubmitted) {
    return (
      <PublicLayout>
        <section className="pt-12 pb-16 md:pt-16 md:pb-20">
          <div className={CONTENT_CONTAINER_CLASS}>
            <div className="max-w-[480px]">
              <h1 className="text-[26px] md:text-[30px] font-semibold text-foreground mb-3">
                Submission received.
              </h1>
              <p className="text-[15px] text-muted-foreground leading-relaxed mb-6">
                Your information has been received and will be reviewed.<br />
                If additional information is required, you will be contacted.
              </p>
              <Link 
                to="/" 
                className="text-[14px] text-muted-foreground hover:text-foreground transition-colors duration-150 underline underline-offset-4"
              >
                Return to site
              </Link>
            </div>
          </div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Header - Institutional spacing: tight gap after header (LOCKED) */}
      <section className="pt-12 pb-6 md:pt-16 md:pb-8">
        <div className={CONTENT_CONTAINER_CLASS}>
          <div className="max-w-[480px]">
            <h1 className="text-[26px] md:text-[30px] font-semibold text-foreground mb-2">
              Contact
            </h1>
            <p className="text-[15px] text-muted-foreground leading-relaxed">
              Questions or general inquiries.
            </p>
          </div>
        </div>
      </section>

      {/* Form - Institutional layout: contained column, document-like spacing */}
      <section className="pb-16 md:pb-24">
        <div className={CONTENT_CONTAINER_CLASS}>
          <div className="max-w-[480px]">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
                aria-label="Name"
              />

              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                aria-label="Email"
              />

              <Select value={location} onValueChange={setLocation} disabled={isSubmitting}>
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

              <Textarea
                placeholder="Your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                disabled={isSubmitting}
                rows={4}
                aria-label="Message"
              />

              {/* Full-width submit button - institutional standard (LOCKED) */}
              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full"
                >
                  {isSubmitting ? "Sending…" : "Send Message"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

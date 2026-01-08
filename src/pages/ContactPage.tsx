import { useState } from "react";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/PublicLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

  if (isSubmitted) {
    return (
      <PublicLayout>
        <section className="pt-20 pb-24 md:pt-28 md:pb-32">
          <div className={CONTENT_CONTAINER_CLASS}>
            <div className="max-w-[560px]">
              <h1 className="text-[28px] md:text-[32px] font-semibold text-foreground mb-3">
                Message received
              </h1>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We'll review and respond if there's a fit.
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
        <div className={CONTENT_CONTAINER_CLASS}>
          <div className="max-w-[560px]">
            <h1 className="text-[28px] md:text-[32px] font-semibold text-foreground mb-3">
              Contact
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Questions or general inquiries.
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="pb-16 md:pb-24">
        <div className={CONTENT_CONTAINER_CLASS}>
          <div className="max-w-[560px]">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
                aria-label="Name"
                className="h-14 px-4 text-[15px] rounded-xl border-border/60 bg-background"
              />

              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                aria-label="Email"
                className="h-14 px-4 text-[15px] rounded-xl border-border/60 bg-background"
              />

              <Select value={location} onValueChange={setLocation} disabled={isSubmitting}>
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

              <div className="pt-2">
                <Textarea
                  placeholder="Your message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  disabled={isSubmitting}
                  rows={4}
                  aria-label="Message"
                  className="px-4 py-3 text-[15px] rounded-xl border-border/60 bg-background resize-none"
                />
              </div>

              <div className="pt-4 flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-14 px-12 text-[15px] font-medium rounded-xl transition-all duration-150 bg-muted-foreground/80 text-background hover:bg-muted-foreground disabled:bg-muted-foreground/40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending…" : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

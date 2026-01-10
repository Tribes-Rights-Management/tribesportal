import { supabase } from "@/integrations/supabase/client";

interface ContactSubmission {
  name: string;
  email: string;
  company?: string;
  message: string;
  source?: string;
}

interface SubmitResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Submit a contact form via the secure Edge Function.
 * This ensures proper validation, rate limiting, and audit logging.
 */
export async function submitContactForm(submission: ContactSubmission): Promise<SubmitResult> {
  try {
    const { data, error } = await supabase.functions.invoke("contact-submit", {
      body: submission,
    });

    if (error) {
      console.error("Contact submission error:", error);
      return { success: false, error: error.message || "Failed to submit" };
    }

    if (data?.error) {
      return { success: false, error: data.error };
    }

    return { success: true, message: data?.message || "Thank you for your message." };
  } catch (err) {
    console.error("Contact submission exception:", err);
    return { success: false, error: "Failed to submit. Please try again later." };
  }
}

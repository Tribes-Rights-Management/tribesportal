import { useState } from "react";
import { CircleHelp, X, Search, ExternalLink, FileText, MessageSquare, ArrowLeft, Check, AlertCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

/**
 * HELP ASSISTANT LAUNCHER — MERCURY-STYLE FLOATING BUTTON + POPOVER
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * A globally-mounted floating button in the bottom-right corner.
 * Opens a compact popover panel (not a drawer) with:
 * - Home view: search + suggested articles + contact/help actions
 * - Contact view: in-panel form with back navigation (no modal)
 * ═══════════════════════════════════════════════════════════════════════════
 */

type ViewState = "home" | "contact" | "success";

const SUGGESTED_ARTICLES = [
  { id: "1", title: "Getting started with Tribes", excerpt: "Learn the basics of navigating the platform" },
  { id: "2", title: "Managing payments & royalties", excerpt: "Understand how payments are processed" },
  { id: "3", title: "Permissions & access levels", excerpt: "Configure user roles and capabilities" },
  { id: "4", title: "API access & integrations", excerpt: "Connect external services to your account" },
];

const CATEGORIES = [
  { value: "account", label: "Account" },
  { value: "access", label: "Access" },
  { value: "royalties", label: "Royalties" },
  { value: "licensing", label: "Licensing" },
  { value: "bug", label: "Bug" },
  { value: "other", label: "Other" },
];



export function HelpAssistantLauncher() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<ViewState>("home");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Contact form state
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = category && description.trim().length > 0;

  const handleViewHelpCenter = () => {
    window.open("/help", "_blank");
    setOpen(false);
  };

  const handleContactUs = () => {
    setView("contact");
  };

  const handleBackToHome = () => {
    setView("home");
    // Reset form state
    setCategory("");
    setDescription("");
    setError(null);
  };

  const handleArticleClick = (articleId: string) => {
    window.open(`/help?article=${articleId}`, "_blank");
    setOpen(false);
  };

  const getCurrentModuleName = (): string => {
    const pathname = window.location.pathname;
    if (pathname.startsWith("/workspaces")) return "Workspaces";
    if (pathname.startsWith("/console")) return "System Console";
    if (pathname.startsWith("/help")) return "Help";
    if (pathname.startsWith("/licensing")) return "Licensing";
    if (pathname.startsWith("/admin")) return "Admin";
    return "App";
  };

  const handleSubmitContact = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);

    const categoryLabel = CATEGORIES.find(c => c.value === category)?.label || category;
    const moduleName = getCurrentModuleName();

    try {
      // Get current session for auth header and user info
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        setError("Please sign in again to contact support.");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(
        "https://rsdjfnsbimcdrxlhognv.supabase.co/functions/v1/support-form",
        {
          method: "POST",
          credentials: "omit",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZGpmbnNiaW1jZHJ4bGhvZ252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNzkyNDYsImV4cCI6MjA4MzY1NTI0Nn0.GKH6n-FRQENIeijikbF6nzBkiKmPddA-A9_X9wXJH1I",
          },
          body: JSON.stringify({
            category: categoryLabel,
            message: description,
            workspace: moduleName,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        // Store ticket ID and show success view
        setTicketId(result.ticketId);
        setView("success");
        // Reset form fields (but keep success view open)
        setCategory("");
        setDescription("");
        setError(null);
      } else {
        setError("Unable to submit request. Please try again.");
      }
    } catch (err) {
      console.error("Support form submission error:", err);
      setError("Unable to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear error when user interacts with form
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setError(null);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    setError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset to home view when closing
      setView("home");
      setCategory("");
      setDescription("");
      setSearchQuery("");
      setTicketId(null);
      setError(null);
    }
  };

  const handleDone = () => {
    setOpen(false);
  };

  const filteredArticles = searchQuery
    ? SUGGESTED_ARTICLES.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : SUGGESTED_ARTICLES;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "fixed z-40",
                "bottom-6 right-6",
                "max-sm:bottom-5 max-sm:right-5",
                "w-12 h-12 rounded-full",
                "bg-white",
                "border border-border/60",
                "shadow-md",
                "hover:bg-muted/40",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-muted-foreground/20",
                "transition-all duration-150",
                "flex items-center justify-center"
              )}
              aria-label={open ? "Close help" : "Help & Resources"}
            >
              {open ? (
                <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
              ) : (
                <CircleHelp className="h-[18px] w-[18px]" strokeWidth={1.5} />
              )}
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        {!open && (
          <TooltipContent side="left" sideOffset={8}>
            <p className="text-[12px]">Help & Resources</p>
          </TooltipContent>
        )}
      </Tooltip>

      {/* Popover panel - Mercury-like anchoring with max-height */}
      <PopoverContent
        side="top"
        align="end"
        sideOffset={12}
        alignOffset={0}
        className={cn(
          "w-[420px] max-sm:w-[calc(100vw-40px)] max-sm:max-w-[420px]",
          "p-0 rounded-2xl",
          "border border-border/60",
          "shadow-lg",
          "bg-white",
          "flex flex-col overflow-hidden",
          "max-h-[calc(100vh-140px)]"
        )}
      >
        {view === "home" ? (
          /* ═══════════════════════════════════════════════════════════════
             HOME VIEW - Search + Suggested Articles + Footer Actions
             ═══════════════════════════════════════════════════════════════ */
          <>
            {/* Header - fixed, always visible */}
            <div className="px-5 pt-5 pb-3 border-b border-border/60 shrink-0">
              <h2 className="text-base font-medium text-foreground">
                How can we help?
              </h2>
            </div>

            {/* Search - fixed */}
            <div className="px-5 py-3 shrink-0">
              <div className="relative">
                <Search
                  className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none",
                    "h-3.5 w-3.5 text-muted-foreground/60 shrink-0"
                  )}
                  strokeWidth={1.5}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className={cn(
                    "w-full h-10 pl-9 pr-4 text-sm",
                    "rounded-lg bg-muted/40",
                    "border border-[var(--border-subtle)]",
                    "placeholder:text-muted-foreground/60",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-muted-foreground/15",
                    "transition-all"
                  )}
                />
              </div>
            </div>

            {/* Suggested articles - scrollable region */}
            <div className="flex-1 overflow-auto px-2 pb-2">
              <div className="px-3 py-1.5">
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Suggested articles
                </span>
              </div>
              <div className="space-y-0.5">
                {filteredArticles.length > 0 ? (
                  filteredArticles.map((article) => (
                    <button
                      key={article.id}
                      onClick={() => handleArticleClick(article.id)}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg",
                        "flex items-start gap-3",
                        "text-left",
                        "hover:bg-muted/40",
                        "transition-colors"
                      )}
                    >
                      <FileText
                        className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground"
                        strokeWidth={1.5}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {article.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {article.excerpt}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      No articles found for "{searchQuery}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer actions - fixed */}
            <div className="px-5 py-4 border-t border-border/60 shrink-0 flex items-center justify-between">
              <button
                onClick={handleContactUs}
                className={cn(
                  "h-9 px-4 rounded-lg text-sm font-medium",
                  "flex items-center gap-2",
                  "bg-transparent text-foreground",
                  "hover:bg-muted/40",
                  "transition-colors"
                )}
              >
                <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
                Contact us
              </button>
              <button
                onClick={handleViewHelpCenter}
                className={cn(
                  "h-9 px-3 rounded-lg text-sm font-medium",
                  "flex items-center gap-1.5",
                  "text-muted-foreground hover:text-foreground",
                  "transition-colors"
                )}
              >
                View Help Center
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </>
        ) : view === "contact" ? (
          /* ═══════════════════════════════════════════════════════════════
             CONTACT VIEW - In-panel form with back navigation
             ═══════════════════════════════════════════════════════════════ */
          <>
            {/* Header with back arrow */}
            <div className="px-5 pt-5 pb-3 border-b border-border/60 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToHome}
                  className={cn(
                    "h-7 w-7 flex items-center justify-center rounded-md",
                    "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                    "transition-colors"
                  )}
                  aria-label="Back"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <h2 className="text-base font-medium text-foreground">
                  Contact support
                </h2>
              </div>
            </div>

            {/* Form body - scrollable */}
            <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-foreground">
                  Category
                </label>
                <Select value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger 
                    className={cn(
                      "h-10 text-sm",
                      "border-border bg-transparent",
                      "focus:ring-2 focus:ring-muted-foreground/20 focus:ring-offset-0"
                    )}
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="text-sm">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-foreground">
                  Describe the issue
                </label>
                <Textarea
                  value={description}
                  onChange={handleDescriptionChange}
                  placeholder="E.g., My payout is missing…"
                  className={cn(
                    "min-h-[100px] text-sm resize-none",
                    "border-border bg-transparent",
                    "placeholder:text-muted-foreground/60",
                    "focus-visible:ring-2 focus-visible:ring-muted-foreground/20 focus-visible:ring-offset-0"
                  )}
                />
              </div>

            </div>

            {/* Footer action with inline error */}
            <div className="px-5 py-4 border-t border-border/60 shrink-0">
              {error && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-[#FEF2F2] border border-[#FECACA] rounded">
                  <AlertCircle className="h-3.5 w-3.5 text-[#DC2626] shrink-0" strokeWidth={1.5} />
                  <p className="text-[12px] text-[#7F1D1D]">
                    {error}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-end">
                <Button
                  onClick={handleSubmitContact}
                  disabled={!canSubmit || isSubmitting}
                  variant="default"
                  size="sm"
                >
                  Send message
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* ═══════════════════════════════════════════════════════════════
             SUCCESS VIEW - Mercury/institutional confirmation
             ═══════════════════════════════════════════════════════════════ */
          <div className="flex flex-col items-center justify-center py-12">
            <div className="max-w-sm text-center space-y-4">
              {/* Subtle checkmark */}
              <div className="flex justify-center">
                <div className="h-10 w-10 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center">
                  <Check className="h-4 w-4 text-[#16A34A]" strokeWidth={1.5} />
                </div>
              </div>
              
              {/* Confirmation text */}
              <div className="space-y-1">
                <p className="text-[14px] font-medium text-[#1A1A1A]">
                  Request submitted
                </p>
                {ticketId && (
                  <p className="text-[12px] text-[#6B6B6B] font-mono tracking-wide">
                    {ticketId}
                  </p>
                )}
              </div>
              
              {/* SLA commitment */}
              <p className="text-[11px] text-[#8F8F8F]">
                We'll respond within 24 hours.
              </p>
              
              {/* Return action */}
              <button 
                onClick={handleBackToHome}
                className="text-[12px] text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors mt-2"
              >
                Submit another request
              </button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

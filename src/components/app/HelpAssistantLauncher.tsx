import { useState } from "react";
import { CircleHelp, X, Search, ExternalLink, FileText, MessageSquare } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { ContactSupportModal } from "./ContactSupportModal";

/**
 * HELP ASSISTANT LAUNCHER — MERCURY-STYLE FLOATING BUTTON + POPOVER
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * A globally-mounted floating button in the bottom-right corner.
 * Opens a compact popover panel (not a drawer) with:
 * - Search input
 * - Suggested articles
 * - Contact us action
 * - View Help Center link
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SUGGESTED_ARTICLES = [
  { id: "1", title: "Getting started with Tribes", excerpt: "Learn the basics of navigating the platform" },
  { id: "2", title: "Managing payments & royalties", excerpt: "Understand how payments are processed" },
  { id: "3", title: "Permissions & access levels", excerpt: "Configure user roles and capabilities" },
  { id: "4", title: "API access & integrations", excerpt: "Connect external services to your account" },
];

export function HelpAssistantLauncher() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [contactOpen, setContactOpen] = useState(false);

  const handleViewHelpCenter = () => {
    window.open("/help", "_blank");
    setOpen(false);
  };

  const handleContactUs = () => {
    setContactOpen(true);
    setOpen(false);
  };

  const handleArticleClick = (articleId: string) => {
    // Navigate to help center with article query
    window.open(`/help?article=${articleId}`, "_blank");
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
    <>
      {/* Floating button - fixed bottom-right */}
      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "fixed z-40",
                  // Position - Mercury-like anchored low
                  "bottom-6 right-6",
                  // Mobile adjustments
                  "max-sm:bottom-5 max-sm:right-5",
                  // Size & shape
                  "w-12 h-12 rounded-full",
                  // Colors - white surface
                  "bg-white",
                  "border border-border/60",
                  "shadow-md",
                  // Hover
                  "hover:bg-muted/40",
                  // Focus - subtle, no bright rings
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-muted-foreground/20",
                  // Transition
                  "transition-all duration-150",
                  // Flex center
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
            // Flex layout for fixed header/footer + scrollable content
            "flex flex-col overflow-hidden",
            // Max height to never touch top of screen
            "max-h-[calc(100vh-140px)]"
          )}
        >
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

          {/* Footer actions - fixed, Mercury-like subtle styling */}
          <div className="px-5 py-4 border-t border-border/60 shrink-0 flex items-center justify-between">
            <button
              onClick={handleContactUs}
              className={cn(
                "h-9 px-4 rounded-lg text-sm font-medium",
                "flex items-center gap-2",
                // Ghost/subtle style - NOT black button
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
        </PopoverContent>
      </Popover>

      {/* Contact Support Modal */}
      <ContactSupportModal open={contactOpen} onOpenChange={setContactOpen} />
    </>
  );
}

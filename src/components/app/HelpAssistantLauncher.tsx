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
import { iconClass, iconStroke } from "@/components/ui/Icon";
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
                  "fixed z-50",
                  // Position
                  "bottom-6 right-6",
                  // Mobile adjustments
                  "max-sm:bottom-5 max-sm:right-5",
                  // Size & shape
                  "w-12 h-12 rounded-full",
                  // Colors
                  "bg-white",
                  "border border-border/60",
                  "shadow-md",
                  // Hover
                  "hover:bg-muted/40",
                  // Focus
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-muted-foreground/20",
                  // Transition
                  "transition-all duration-150",
                  // Flex center
                  "flex items-center justify-center"
                )}
                aria-label={open ? "Close help" : "Help & Resources"}
              >
                {open ? (
                  <X className={iconClass("md")} strokeWidth={iconStroke("default")} />
                ) : (
                  <CircleHelp className={iconClass("md")} strokeWidth={iconStroke("default")} />
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

        {/* Popover panel */}
        <PopoverContent
          side="top"
          align="end"
          sideOffset={12}
          className={cn(
            "w-[420px] max-sm:w-[calc(100vw-40px)] max-sm:max-w-[420px]",
            "p-0 rounded-xl",
            "border border-border/70",
            "shadow-lg",
            "bg-white"
          )}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-medium text-foreground">
                How can we help?
              </h2>
              <button
                onClick={() => setOpen(false)}
                className={cn(
                  "h-7 w-7 flex items-center justify-center rounded-md",
                  "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  "transition-colors"
                )}
                aria-label="Close"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="px-5 py-3">
            <div className="relative">
              <Search
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none",
                  "h-4 w-4 text-muted-foreground"
                )}
                strokeWidth={1.5}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className={cn(
                  "w-full h-10 pl-10 pr-4 text-[13px]",
                  "rounded-lg bg-muted/40",
                  "border border-[var(--border-subtle)]",
                  "placeholder:text-muted-foreground/60",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-muted-foreground/20",
                  "transition-all"
                )}
              />
            </div>
          </div>

          {/* Suggested articles */}
          <div className="px-2 pb-2">
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
                      "w-full px-3 py-2.5 rounded-lg",
                      "flex items-start gap-3",
                      "text-left",
                      "hover:bg-muted/40",
                      "transition-colors"
                    )}
                  >
                    <FileText
                      className={cn("h-4 w-4 mt-0.5 shrink-0 text-muted-foreground")}
                      strokeWidth={1.5}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-foreground truncate">
                        {article.title}
                      </p>
                      <p className="text-[12px] text-muted-foreground truncate">
                        {article.excerpt}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-center">
                  <p className="text-[13px] text-muted-foreground">
                    No articles found for "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-5 py-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <button
              onClick={handleContactUs}
              className={cn(
                "h-9 px-4 rounded-lg text-[13px] font-medium",
                "flex items-center gap-2",
                "bg-foreground text-background",
                "hover:opacity-90",
                "transition-opacity"
              )}
            >
              <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
              Contact us
            </button>
            <button
              onClick={handleViewHelpCenter}
              className={cn(
                "h-9 px-3 rounded-lg text-[13px] font-medium",
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

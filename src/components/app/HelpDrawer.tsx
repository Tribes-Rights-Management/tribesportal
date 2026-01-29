import { useState } from "react";
import { Search, MessageSquare, X, Mail, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { iconClass, iconStroke } from "@/components/ui/Icon";

/**
 * ASSISTANT DRAWER — STRIPE-LIKE HELP/SUPPORT UI (CANONICAL)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * A right-side drawer for help and support access.
 * Stripe-inspired design: clean, tight spacing, subtle shadows.
 * 
 * Contents:
 * 1. "What do you need help with?" prompt
 * 2. Search input (neutral focus, no loud blue)
 * 3. Suggested topic chips (static placeholders)
 * 4. Contact support block
 * 5. Optional "Start chat" button
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface HelpDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SUGGESTED_TOPICS = [
  "Getting started",
  "Billing & payments",
  "Permissions",
  "API access",
];

export function HelpDrawer({ open, onOpenChange }: HelpDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showChat, setShowChat] = useState(false);

  const handleClose = () => {
    setShowChat(false);
    setSearchQuery("");
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <>
      {/* Subtle overlay */}
      <div 
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[1px]"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div 
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-full max-w-[420px]",
          "flex flex-col",
          "bg-white shadow-2xl",
          "animate-in slide-in-from-right duration-200"
        )}
      >
        {/* Header */}
        <header 
          className="shrink-0 flex items-center justify-between px-6 h-14"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2">
            <Sparkles 
              className={cn(iconClass("sm"), "text-muted-foreground")}
              strokeWidth={iconStroke("default")}
            />
            <span className="text-[15px] font-semibold text-foreground">
              Assistant
            </span>
          </div>
          <button
            onClick={handleClose}
            className={cn(
              "h-8 w-8 flex items-center justify-center rounded-md",
              "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              "transition-colors"
            )}
            aria-label="Close"
          >
            <X className={iconClass("sm")} strokeWidth={iconStroke("default")} />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {showChat ? (
            // Chat placeholder view
            <div className="flex flex-col h-full">
              <div 
                className="px-6 py-3"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <button 
                  onClick={() => setShowChat(false)}
                  className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center px-6">
                <div className="text-center">
                  <MessageSquare 
                    className="h-10 w-10 mx-auto mb-4 text-muted-foreground/30" 
                    strokeWidth={1} 
                  />
                  <p className="text-[14px] font-medium text-foreground mb-2">
                    Chat coming soon
                  </p>
                  <p className="text-[13px] text-muted-foreground max-w-[240px]">
                    In the meantime, please email us for assistance.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Main assistant view
            <div className="p-6 space-y-6">
              {/* Prompt */}
              <div>
                <h2 className="text-[15px] font-medium text-foreground mb-1">
                  What do you need help with?
                </h2>
                <p className="text-[13px] text-muted-foreground">
                  Search our docs or contact support directly.
                </p>
              </div>

              {/* Search input — neutral focus */}
              <div className="relative">
                <Search 
                  className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none",
                    iconClass("sm"),
                    "text-muted-foreground"
                  )}
                  strokeWidth={iconStroke("default")}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documentation..."
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

              {/* Suggested topics */}
              <div className="space-y-2">
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Suggested topics
                </span>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TOPICS.map((topic) => (
                    <button
                      key={topic}
                      className={cn(
                        "px-3 py-1.5 text-[12px] rounded-full",
                        "bg-muted/50 border border-[var(--border-subtle)]",
                        "text-foreground hover:bg-muted transition-colors"
                      )}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search results placeholder */}
              {searchQuery && (
                <div 
                  className="py-6 text-center rounded-lg"
                  style={{ backgroundColor: 'var(--muted)' }}
                >
                  <p className="text-[13px] text-muted-foreground">
                    No results found for "{searchQuery}"
                  </p>
                </div>
              )}

              {/* Divider */}
              <div 
                className="h-px w-full"
                style={{ backgroundColor: 'var(--border-subtle)' }}
              />

              {/* Contact support section */}
              <div 
                className="p-4 rounded-lg"
                style={{ backgroundColor: 'var(--muted)' }}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--background)' }}
                  >
                    <Mail 
                      className={cn(iconClass("sm"), "text-muted-foreground")}
                      strokeWidth={iconStroke("default")}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-foreground mb-0.5">
                      Contact support
                    </p>
                    <a
                      href="mailto:support@tribesrightsmanagement.com"
                      className="text-[13px] text-muted-foreground hover:text-foreground transition-colors break-all"
                    >
                      support@tribesrightsmanagement.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Start chat button */}
              <button
                onClick={() => setShowChat(true)}
                className={cn(
                  "w-full h-10 flex items-center justify-center gap-2",
                  "rounded-lg text-[13px] font-medium",
                  "bg-foreground text-background",
                  "hover:opacity-90 transition-opacity"
                )}
              >
                <MessageSquare 
                  className={iconClass("sm")} 
                  strokeWidth={iconStroke("default")} 
                />
                Start chat
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer 
          className="shrink-0 px-6 py-3"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <p className="text-[11px] text-muted-foreground">
            Support hours: Monday–Friday, 9am–5pm ET
          </p>
        </footer>
      </div>
    </>
  );
}

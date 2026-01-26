import { useState } from "react";
import { Search, MessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * HELP DRAWER — SUPPORT SHELL (UI ONLY)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * A right-side drawer for help and support access.
 * This is a UI shell only - no backend integration yet.
 * 
 * Contents:
 * 1. Search input for help articles (placeholder)
 * 2. Email support link (mailto)
 * 3. Start chat button (opens placeholder panel)
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface HelpDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDrawer({ open, onOpenChange }: HelpDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showChat, setShowChat] = useState(false);

  const handleClose = () => {
    setShowChat(false);
    setSearchQuery("");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-md p-0 flex flex-col"
        style={{ backgroundColor: 'var(--background)' }}
      >
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between">
            <SheetTitle className="text-[15px] font-semibold">Help</SheetTitle>
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {showChat ? (
            // Chat placeholder view
            <div className="flex-1 flex flex-col">
              <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <button 
                  onClick={() => setShowChat(false)}
                  className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to Help
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center px-6">
                <div className="text-center">
                  <MessageSquare 
                    className="h-10 w-10 mx-auto mb-4 opacity-30" 
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
            // Main help view
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {/* Search input */}
                <div className="relative">
                  <Search 
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" 
                    strokeWidth={1.5} 
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search help articles..."
                    className={cn(
                      "w-full h-10 pl-10 pr-4 text-[13px]",
                      "rounded-lg border bg-muted/30",
                      "placeholder:text-muted-foreground/60",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]",
                      "transition-colors"
                    )}
                    style={{ borderColor: 'var(--border)' }}
                  />
                </div>

                {/* Search results placeholder */}
                {searchQuery && (
                  <div className="py-8 text-center">
                    <p className="text-[13px] text-muted-foreground">
                      No results found for "{searchQuery}"
                    </p>
                  </div>
                )}

                {/* Email support section */}
                <div 
                  className="p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: 'var(--muted)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <p className="text-[13px] text-foreground mb-2">
                    Need assistance?
                  </p>
                  <a
                    href="mailto:support@tribesrightsmanagement.com"
                    className="text-[13px] text-[#0071E3] hover:underline"
                  >
                    support@tribesrightsmanagement.com
                  </a>
                </div>

                {/* Start chat button */}
                <Button
                  onClick={() => setShowChat(true)}
                  className="w-full h-11"
                  variant="default"
                >
                  <MessageSquare className="h-4 w-4 mr-2" strokeWidth={1.5} />
                  Start chat
                </Button>
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Footer */}
        <div 
          className="px-6 py-3 border-t shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <p className="text-[11px] text-muted-foreground">
            Support hours: Monday–Friday, 9am–5pm ET
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

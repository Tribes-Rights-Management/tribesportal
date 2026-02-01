import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleHelp, BookOpen, MessageSquare, FileText, X } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { HeaderIconButton } from "./HeaderIconButton";
import { cn } from "@/lib/utils";

/**
 * HELP BOTTOM SHEET — MOBILE HELP ACCESS
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * A bottom sheet drawer for mobile that provides quick access to help resources:
 * - Help Center (browse articles)
 * - Submit Support Ticket
 * - Documentation
 * 
 * Opens from the header help icon on mobile devices.
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface HelpLinkProps {
  icon: typeof BookOpen;
  label: string;
  description: string;
  onClick: () => void;
}

function HelpLink({ icon: Icon, label, description, onClick }: HelpLinkProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-4 p-4 rounded-xl",
        "text-left transition-colors",
        "hover:bg-muted/50 active:bg-muted"
      )}
    >
      <div className="shrink-0 w-10 h-10 rounded-lg bg-muted/80 flex items-center justify-center">
        <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-foreground">{label}</p>
        <p className="text-[13px] text-muted-foreground mt-0.5">{description}</p>
      </div>
    </button>
  );
}

export function HelpBottomSheet() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleNavigate = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const handleContactSupport = () => {
    setOpen(false);
    // Navigate to help with contact form intent
    navigate("/help?contact=true");
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <HeaderIconButton
          icon={CircleHelp}
          aria-label="Help & Resources"
        />
      </DrawerTrigger>
      
      {/* Custom overlay with lighter opacity */}
      <DrawerContent 
        className="max-h-[85vh] bg-background border-t border-x border-border rounded-t-xl"
        style={{
          backgroundColor: 'hsl(var(--background))',
          boxShadow: '0 -8px 30px rgba(0, 0, 0, 0.25)',
        }}
      >
        <DrawerHeader className="pb-2 border-b border-border">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-semibold text-foreground">
              Help & Support
            </DrawerTitle>
            <DrawerClose asChild>
              <button 
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              </button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="px-5 py-4 space-y-1 bg-background">
          <HelpLink
            icon={BookOpen}
            label="Help Center"
            description="Browse help articles and guides"
            onClick={() => handleNavigate("/help")}
          />
          
          <HelpLink
            icon={MessageSquare}
            label="Contact Support"
            description="Submit a support request"
            onClick={handleContactSupport}
          />
          
          <HelpLink
            icon={FileText}
            label="Documentation"
            description="Technical guides and references"
            onClick={() => handleNavigate("/help")}
          />
        </div>
        
        {/* Safe area padding for bottom */}
        <div className="h-6 bg-background" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
      </DrawerContent>
    </Drawer>
  );
}

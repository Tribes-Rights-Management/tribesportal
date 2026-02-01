import { useState, useCallback } from "react";
import { 
  CircleHelp, 
  BookOpen, 
  MessageSquare, 
  FileText, 
  X, 
  ChevronRight,
  ArrowLeft,
  Send,
  ExternalLink,
  Search
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/**
 * HELP BOTTOM SHEET — MOBILE HELP ACCESS
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * A self-contained bottom sheet drawer for mobile that provides:
 * - Help Center (browse articles inline)
 * - Contact Support (submit ticket inline)
 * - Documentation (view docs inline)
 * 
 * All content loads inside the drawer without navigation.
 * ═══════════════════════════════════════════════════════════════════════════
 */

type DrawerView = 'home' | 'help-center' | 'contact' | 'documentation';

interface HelpLinkProps {
  icon: typeof BookOpen;
  label: string;
  description: string;
  onPress: () => void;
}

function HelpLink({ icon: Icon, label, description, onPress }: HelpLinkProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPress}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPress();
        }
      }}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-xl cursor-pointer",
        "text-left transition-colors select-none",
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
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOME VIEW - Main menu
// ─────────────────────────────────────────────────────────────────────────────
function HomeView({ onNavigate }: { onNavigate: (view: DrawerView) => void }) {
  return (
    <div className="px-5 py-4 space-y-1">
      <HelpLink
        icon={BookOpen}
        label="Help Center"
        description="Browse help articles and guides"
        onPress={() => onNavigate('help-center')}
      />
      
      <HelpLink
        icon={MessageSquare}
        label="Contact Support"
        description="Submit a support request"
        onPress={() => onNavigate('contact')}
      />
      
      <HelpLink
        icon={FileText}
        label="Documentation"
        description="Technical guides and references"
        onPress={() => onNavigate('documentation')}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELP CENTER VIEW - Browse articles
// ─────────────────────────────────────────────────────────────────────────────
const SAMPLE_ARTICLES = [
  { id: '1', title: 'Getting Started', category: 'Basics' },
  { id: '2', title: 'Account Settings', category: 'Account' },
  { id: '3', title: 'Managing Workspaces', category: 'Workspaces' },
  { id: '4', title: 'Permissions & Access', category: 'Security' },
  { id: '5', title: 'Billing & Payments', category: 'Billing' },
];

function HelpCenterView() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredArticles = SAMPLE_ARTICLES.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-5 py-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-muted/50 border-0"
          />
        </div>
      </div>

      {/* Articles list */}
      <div className="flex-1 overflow-y-auto px-5 py-3">
        {filteredArticles.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">
            No articles found
          </p>
        ) : (
          <div className="space-y-2">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <p className="text-[14px] font-medium text-foreground">{article.title}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">{article.category}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT SUPPORT VIEW - Submit a ticket
// ─────────────────────────────────────────────────────────────────────────────
function ContactSupportView() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
          <Send className="h-5 w-5 text-emerald-600" />
        </div>
        <h3 className="text-[17px] font-semibold text-foreground mb-2">
          Request Submitted
        </h3>
        <p className="text-[14px] text-muted-foreground max-w-[260px]">
          We'll respond within 24 hours. Check your email for confirmation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
      <div>
        <label className="text-[13px] font-medium text-foreground mb-1.5 block">
          Name
        </label>
        <Input
          placeholder="Your name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
          className="h-10"
        />
      </div>

      <div>
        <label className="text-[13px] font-medium text-foreground mb-1.5 block">
          Email
        </label>
        <Input
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
          className="h-10"
        />
      </div>

      <div>
        <label className="text-[13px] font-medium text-foreground mb-1.5 block">
          Message
        </label>
        <Textarea
          placeholder="Describe your issue or question..."
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          required
          rows={4}
          className="resize-none"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full h-11"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Request'}
      </Button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTATION VIEW - Links to docs
// ─────────────────────────────────────────────────────────────────────────────
const DOC_LINKS = [
  { id: '1', title: 'API Reference', description: 'Endpoints, authentication, and examples' },
  { id: '2', title: 'User Guide', description: 'Step-by-step instructions for common tasks' },
  { id: '3', title: 'Admin Guide', description: 'Configuration and management documentation' },
  { id: '4', title: 'Integration Guide', description: 'Connect with third-party services' },
  { id: '5', title: 'Release Notes', description: 'Latest updates and changes' },
];

function DocumentationView() {
  return (
    <div className="px-5 py-4 space-y-2">
      {DOC_LINKS.map((doc) => (
        <div
          key={doc.id}
          className="p-4 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors flex items-center gap-3"
        >
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-medium text-foreground">{doc.title}</p>
            <p className="text-[13px] text-muted-foreground mt-0.5">{doc.description}</p>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const VIEW_TITLES: Record<DrawerView, string> = {
  'home': 'Help & Support',
  'help-center': 'Help Center',
  'contact': 'Contact Support',
  'documentation': 'Documentation',
};

export function HelpBottomSheet() {
  const [open, setOpen] = useState(false);
  const [currentView, setCurrentView] = useState<DrawerView>('home');

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    // Reset to home view when drawer closes
    if (!isOpen) {
      setTimeout(() => setCurrentView('home'), 300);
    }
  }, []);

  const handleBack = () => {
    setCurrentView('home');
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        <HeaderIconButton
          icon={CircleHelp}
          aria-label="Help & Resources"
        />
      </DrawerTrigger>
      
      <DrawerContent 
        className="max-h-[85vh] bg-background border-t border-x border-border rounded-t-xl"
        style={{
          backgroundColor: 'hsl(var(--background))',
          boxShadow: '0 -8px 30px rgba(0, 0, 0, 0.25)',
        }}
      >
        <DrawerHeader className="pb-2 border-b border-border">
          <div className="flex items-center gap-3">
            {/* Back button - only shown on sub-views */}
            {currentView !== 'home' && (
              <button
                type="button"
                onClick={handleBack}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors -ml-1"
                aria-label="Back"
              >
                <ArrowLeft className="h-4 w-4 text-foreground" strokeWidth={1.5} />
              </button>
            )}
            
            <DrawerTitle className="text-lg font-semibold text-foreground flex-1">
              {VIEW_TITLES[currentView]}
            </DrawerTitle>
            
            <DrawerClose asChild>
              <button 
                type="button"
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              </button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* Content area */}
        <div className="bg-background min-h-[200px] max-h-[60vh] overflow-y-auto">
          {currentView === 'home' && (
            <HomeView onNavigate={setCurrentView} />
          )}
          {currentView === 'help-center' && (
            <HelpCenterView />
          )}
          {currentView === 'contact' && (
            <ContactSupportView />
          )}
          {currentView === 'documentation' && (
            <DocumentationView />
          )}
        </div>
        
        {/* Safe area padding for bottom */}
        <div className="h-4 bg-background" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
      </DrawerContent>
    </Drawer>
  );
}

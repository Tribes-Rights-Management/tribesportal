import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CircleHelp, 
  BookOpen, 
  FileText, 
  X, 
  ChevronRight,
  Send,
  Search,
  ChevronDown,
  ChevronUp
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
import { Textarea } from "@/components/ui/textarea";

/**
 * HELP BOTTOM SHEET — QUICK ACTIONS DRAWER
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * A streamlined help drawer for quick actions:
 * - Search bar → results navigate to full article page
 * - Quick links → navigate to full pages (/help, /docs)
 * - Contact form → submits within drawer
 * 
 * Only the contact form stays within the drawer. All content browsing
 * navigates to full-page experiences.
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Sample searchable articles
const SEARCHABLE_ARTICLES = [
  { id: 'getting-started', title: 'Getting Started', path: '/help/getting-started' },
  { id: 'account-settings', title: 'Account Settings', path: '/help/account-settings' },
  { id: 'managing-workspaces', title: 'Managing Workspaces', path: '/help/workspaces' },
  { id: 'permissions', title: 'Permissions & Access', path: '/help/permissions' },
  { id: 'billing', title: 'Billing & Payments', path: '/help/billing' },
  { id: 'two-factor', title: 'Two-Factor Authentication', path: '/help/2fa' },
  { id: 'inviting-members', title: 'Inviting Team Members', path: '/help/inviting-members' },
  { id: 'api-reference', title: 'API Reference', path: '/docs/api' },
  { id: 'integrations', title: 'Integrations Guide', path: '/docs/integrations' },
];

export function HelpBottomSheet() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [contactExpanded, setContactExpanded] = useState(false);
  const [formData, setFormData] = useState({ subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Filter articles based on search
  const searchResults = searchQuery.trim().length > 1
    ? SEARCHABLE_ARTICLES.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    // Reset state when drawer closes
    if (!isOpen) {
      setTimeout(() => {
        setSearchQuery('');
        setContactExpanded(false);
        setIsSubmitted(false);
        setFormData({ subject: '', message: '' });
      }, 300);
    }
  }, []);

  const handleNavigate = (path: string) => {
    setOpen(false);
    setTimeout(() => {
      navigate(path);
    }, 150);
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
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
        <DrawerHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-semibold text-foreground">
              Help & Support
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

        <div className="bg-background overflow-y-auto max-h-[70vh]">
          {/* ─────────────────────────────────────────────────────────────── */}
          {/* SEARCH SECTION */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <div className="px-4 pt-3 pb-2">
            <div className="relative">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-6 pr-3 text-base md:text-[13px] text-foreground placeholder:text-muted-foreground/60 bg-transparent border-b border-border/60 focus:outline-none focus:border-foreground/30 transition-colors"
              />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 space-y-0.5">
                {searchResults.map((article) => (
                  <div
                    key={article.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleNavigate(article.path)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNavigate(article.path);
                      }
                    }}
                    className={cn(
                      "py-2 px-1 flex items-center justify-between cursor-pointer rounded-md",
                      "hover:bg-muted/40 active:bg-muted/60 transition-colors"
                    )}
                  >
                    <span className="text-[13px] text-foreground">{article.title}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                  </div>
                ))}
              </div>
            )}

            {searchQuery.trim().length > 1 && searchResults.length === 0 && (
              <p className="mt-2 text-[11px] text-muted-foreground text-center py-1">
                No articles found for "{searchQuery}"
              </p>
            )}
          </div>

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* QUICK LINKS SECTION */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <div className="px-4 pb-2">
            <div className="space-y-0.5">
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleNavigate('/help')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNavigate('/help');
                  }
                }}
                className={cn(
                  "flex items-center gap-3 py-2.5 px-1 rounded-md cursor-pointer",
                  "hover:bg-muted/40 active:bg-muted/60 transition-colors"
                )}
              >
                <BookOpen className="h-[18px] w-[18px] text-muted-foreground/70" strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground">Help Center</p>
                  <p className="text-[11px] text-muted-foreground">Browse all articles</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => handleNavigate('/docs')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNavigate('/docs');
                  }
                }}
                className={cn(
                  "flex items-center gap-3 py-2.5 px-1 rounded-md cursor-pointer",
                  "hover:bg-muted/40 active:bg-muted/60 transition-colors"
                )}
              >
                <FileText className="h-[18px] w-[18px] text-muted-foreground/70" strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground">Documentation</p>
                  <p className="text-[11px] text-muted-foreground">Technical guides & API</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* CONTACT SUPPORT SECTION (Expandable) */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <div className="px-4 pb-4">
            <div className="border-t border-border/60 pt-2">
              <button
                type="button"
                onClick={() => setContactExpanded(!contactExpanded)}
                className={cn(
                  "w-full flex items-center gap-3 py-2.5 px-1 rounded-md",
                  "hover:bg-muted/40 transition-colors text-left"
                )}
              >
                <Send className="h-[18px] w-[18px] text-muted-foreground/70" strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground">Contact Support</p>
                  <p className="text-[11px] text-muted-foreground">Submit a request</p>
                </div>
                {contactExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground/50" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground/50" />
                )}
              </button>

              {/* Contact Form */}
              {contactExpanded && (
                <div className="mt-2 pt-3 border-t border-border/40 ml-7">
                  {isSubmitted ? (
                    <div className="text-center py-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                        <Send className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.5} />
                      </div>
                      <p className="text-[13px] font-medium text-foreground mb-0.5">
                        Request Submitted
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        We'll respond within 24 hours.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitContact} className="space-y-2.5">
                      <input
                        type="text"
                        placeholder="Subject"
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        required
                        className="w-full h-9 px-3 text-base md:text-[13px] text-foreground placeholder:text-muted-foreground/60 bg-transparent border border-border/60 rounded-md focus:outline-none focus:border-foreground/30 transition-colors"
                      />
                      <Textarea
                        placeholder="How can we help?"
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        required
                        rows={3}
                        className="resize-none text-base md:text-[13px] border-border/60 focus:border-foreground/30"
                      />
                      <Button 
                        type="submit" 
                        className="w-full h-9 text-[13px]"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                      </Button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Safe area padding */}
        <div className="h-2 bg-background" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
      </DrawerContent>
    </Drawer>
  );
}

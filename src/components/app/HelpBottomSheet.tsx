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
import { Input } from "@/components/ui/input";
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
          <div className="px-5 pt-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-muted/50 border-border text-base md:text-[13px]"
              />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 border border-border rounded-lg overflow-hidden">
                {searchResults.map((article, index) => (
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
                      "px-4 py-3 flex items-center justify-between cursor-pointer",
                      "hover:bg-muted/50 active:bg-muted transition-colors",
                      index !== searchResults.length - 1 && "border-b border-border"
                    )}
                  >
                    <span className="text-[14px] text-foreground">{article.title}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                ))}
              </div>
            )}

            {searchQuery.trim().length > 1 && searchResults.length === 0 && (
              <p className="mt-3 text-[13px] text-muted-foreground text-center py-2">
                No articles found for "{searchQuery}"
              </p>
            )}
          </div>

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* QUICK LINKS SECTION */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <div className="px-5 pb-3">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Quick Links
            </p>
            <div className="space-y-1">
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
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer",
                  "hover:bg-muted/50 active:bg-muted transition-colors"
                )}
              >
                <div className="w-8 h-8 rounded-md bg-muted/80 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-foreground">Help Center</p>
                  <p className="text-[12px] text-muted-foreground">Browse all articles</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer",
                  "hover:bg-muted/50 active:bg-muted transition-colors"
                )}
              >
                <div className="w-8 h-8 rounded-md bg-muted/80 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-foreground">Documentation</p>
                  <p className="text-[12px] text-muted-foreground">Technical guides & API</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* CONTACT SUPPORT SECTION (Expandable) */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <div className="px-5 pb-5">
            <button
              type="button"
              onClick={() => setContactExpanded(!contactExpanded)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-lg",
                "hover:bg-muted/50 transition-colors",
                contactExpanded && "bg-muted/30"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <Send className="h-4 w-4 text-primary" strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <p className="text-[14px] font-medium text-foreground">Contact Support</p>
                  <p className="text-[12px] text-muted-foreground">Submit a request</p>
                </div>
              </div>
              {contactExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {/* Contact Form */}
            {contactExpanded && (
              <div className="mt-3 pt-3 border-t border-border">
                {isSubmitted ? (
                  <div className="text-center py-6">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                      <Send className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-[15px] font-medium text-foreground mb-1">
                      Request Submitted
                    </p>
                    <p className="text-[13px] text-muted-foreground">
                      We'll respond within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitContact} className="space-y-3">
                    <div>
                      <Input
                        placeholder="Subject"
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        required
                        className="h-10 text-base md:text-[13px]"
                      />
                    </div>
                    <div>
                      <Textarea
                        placeholder="How can we help?"
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        required
                        rows={3}
                        className="resize-none text-base md:text-[13px]"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-10"
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
        
        {/* Safe area padding */}
        <div className="h-2 bg-background" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
      </DrawerContent>
    </Drawer>
  );
}

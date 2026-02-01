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
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check
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
import { useHelpArticleSuggestions } from "@/hooks/useHelpArticleSuggestions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * HELP BOTTOM SHEET — QUICK ACTIONS DRAWER
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * A streamlined help drawer for quick actions:
 * - Search bar → queries help_articles table, results navigate to full article page
 * - Quick links → navigate to full pages (/help, /docs)
 * - Contact form → calls support-form edge function with smart article suggestions
 * ═══════════════════════════════════════════════════════════════════════════
 */

type DrawerView = 'home' | 'contact';

export function HelpBottomSheet() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [currentView, setCurrentView] = useState<DrawerView>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Get real-time article suggestions from database based on subject input (contact form)
  const { suggestions: articleSuggestions } = useHelpArticleSuggestions(formData.subject);
  
  // Get real-time article suggestions from database for home search
  const { suggestions: searchResults, isLoading: isSearching } = useHelpArticleSuggestions(searchQuery);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    // Reset state when drawer closes
    if (!isOpen) {
      setTimeout(() => {
        setCurrentView('home');
        setSearchQuery('');
        setIsSubmitted(false);
        setSubmittedTicketId(null);
        setIsCopied(false);
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

  const handleBack = () => {
    setCurrentView('home');
    setIsSubmitted(false);
    setSubmittedTicketId(null);
    setIsCopied(false);
    setFormData({ subject: '', message: '' });
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to submit a support request.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Call the existing support-form edge function
      const { data, error } = await supabase.functions.invoke('support-form', {
        body: {
          category: formData.subject,
          message: formData.message,
          workspace: null, // Can be enhanced to pass current workspace if available
        },
      });

      if (error) {
        console.error('Support form error:', error);
        toast({
          title: "Submission failed",
          description: error.message || "Unable to submit your request. Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Success - show confirmation with ticket ID
      setSubmittedTicketId(data?.ticketId || null);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Support form error:', err);
      toast({
        title: "Submission failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get header title based on current view
  const getHeaderTitle = () => {
    switch (currentView) {
      case 'contact':
        return 'Contact Support';
      default:
        return 'Help & Support';
    }
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
        className="h-[70vh] max-h-[70vh] bg-background border-t border-x border-border rounded-t-xl flex flex-col overflow-hidden"
        style={{
          backgroundColor: 'hsl(var(--background))',
          boxShadow: '0 -8px 30px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Sticky Header - always visible */}
        <DrawerHeader className="shrink-0 pb-3 border-b border-border bg-background sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentView !== 'home' && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="h-8 w-8 -ml-1 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                  aria-label="Back"
                >
                  <ArrowLeft className="h-4 w-4 text-foreground" strokeWidth={1.5} />
                </button>
              )}
              <DrawerTitle className="text-lg font-semibold text-foreground">
                {getHeaderTitle()}
              </DrawerTitle>
            </div>
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

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-background pb-6">
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* HOME VIEW */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {currentView === 'home' && (
            <>
              {/* Search Section */}
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

                {/* Search Results from Database */}
                {searchResults.length > 0 && (
                  <div className="mt-2 space-y-0.5">
                    {searchResults.map((article) => (
                      <div
                        key={article.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleNavigate(`/help/article/${article.slug}`)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleNavigate(`/help/article/${article.slug}`);
                          }
                        }}
                        className={cn(
                          "py-2 px-1 flex items-center justify-between cursor-pointer rounded-md",
                          "hover:bg-muted/40 active:bg-muted/60 transition-colors"
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-[13px] text-foreground block truncate">{article.title}</span>
                          {article.category_name && (
                            <span className="text-[10px] text-muted-foreground">{article.category_name}</span>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery.trim().length >= 3 && searchResults.length === 0 && !isSearching && (
                  <p className="mt-2 text-[11px] text-muted-foreground text-center py-1">
                    No articles found for "{searchQuery}"
                  </p>
                )}
              </div>

              {/* Quick Links Section */}
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

              {/* Contact Support Link */}
              <div className="px-4 pb-4">
                <div className="border-t border-border/60 pt-2">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setCurrentView('contact')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setCurrentView('contact');
                      }
                    }}
                    className={cn(
                      "flex items-center gap-3 py-2.5 px-1 rounded-md cursor-pointer",
                      "hover:bg-muted/40 active:bg-muted/60 transition-colors"
                    )}
                  >
                    <Send className="h-[18px] w-[18px] text-muted-foreground/70" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-foreground">Contact Support</p>
                      <p className="text-[11px] text-muted-foreground">Submit a request</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* CONTACT SUPPORT VIEW */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {currentView === 'contact' && (
            <div className="px-4 py-4">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" strokeWidth={1.5} />
                  </div>
                  <p className="text-[15px] font-medium text-foreground mb-3">
                    Request submitted
                  </p>
                  {submittedTicketId && (
                    <div className="mb-4">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                        Ticket ID
                      </p>
                      <div className="inline-flex items-center gap-1.5">
                        <span className="text-[12px] font-mono text-muted-foreground">
                          {submittedTicketId}
                        </span>
                        <button
                          type="button"
                          onClick={async () => {
                            await navigator.clipboard.writeText(submittedTicketId);
                            setIsCopied(true);
                            setTimeout(() => setIsCopied(false), 2000);
                          }}
                          className="p-1 rounded hover:bg-muted/50 transition-colors"
                          aria-label="Copy ticket ID"
                        >
                          {isCopied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.5} />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="text-[13px] text-muted-foreground mb-6">
                    We'll follow up within a couple of business days.
                  </p>
                  <Button 
                    onClick={handleBack}
                    variant="outline"
                    className="h-9 px-6 text-[13px]"
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitContact} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="What do you need help with?"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      required
                      className="w-full h-10 px-3 text-base md:text-[13px] text-foreground placeholder:text-muted-foreground/60 bg-transparent border border-border/60 rounded-md focus:outline-none focus:border-foreground/30 transition-colors"
                    />
                    
                    {/* Smart Article Suggestions from Database */}
                    {articleSuggestions.length > 0 && (
                      <div className="mt-2 bg-muted/30 border border-border/40 rounded-md overflow-hidden">
                        <p className="px-3 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide border-b border-border/40">
                          Suggested articles
                        </p>
                        <div className="divide-y divide-border/30">
                          {articleSuggestions.map((article) => (
                            <div
                              key={article.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => handleNavigate(`/help/article/${article.slug}`)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleNavigate(`/help/article/${article.slug}`);
                                }
                              }}
                              className="px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-muted/50 active:bg-muted transition-colors"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-[12px] font-medium text-foreground truncate">{article.title}</p>
                                {article.category_name && (
                                  <p className="text-[10px] text-muted-foreground">{article.category_name}</p>
                                )}
                              </div>
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 ml-2" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">
                      Message
                    </label>
                    <Textarea
                      placeholder="Describe your issue or question..."
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      required
                      rows={4}
                      className="resize-none text-base md:text-[13px] border-border/60 focus:border-foreground/30"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-10 text-[13px]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
        
        {/* Safe area padding for mobile keyboards and bottom notch */}
        <div 
          className="shrink-0 h-4 bg-background" 
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }} 
        />
      </DrawerContent>
    </Drawer>
  );
}

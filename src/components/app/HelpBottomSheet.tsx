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
  Search,
  FolderOpen
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
 * A self-contained bottom sheet drawer for mobile with internal navigation:
 * - Help Center (categories → articles → article content)
 * - Contact Support (submit ticket inline)
 * - Documentation (view docs inline)
 * 
 * Navigation stack: Home → Section → Subsection → Content
 * Only X button or overlay tap closes the drawer.
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Navigation state type
interface NavState {
  view: 'home' | 'help-center' | 'help-category' | 'help-article' | 'contact' | 'documentation';
  categoryId?: string;
  articleId?: string;
}

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
// SAMPLE DATA
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'getting-started', name: 'Getting Started', description: 'New user guides and basics', articleCount: 5 },
  { id: 'account', name: 'Account Settings', description: 'Profile, security, and preferences', articleCount: 4 },
  { id: 'workspaces', name: 'Managing Workspaces', description: 'Create, configure, and manage', articleCount: 3 },
  { id: 'security', name: 'Permissions & Access', description: 'Roles, permissions, and security', articleCount: 6 },
  { id: 'billing', name: 'Billing & Payments', description: 'Invoices, subscriptions, and payments', articleCount: 4 },
];

const ARTICLES: Record<string, Array<{ id: string; title: string; summary: string; content: string }>> = {
  'getting-started': [
    { id: 'gs-1', title: 'Welcome to the Platform', summary: 'An introduction to getting started', content: 'Welcome to our platform! This guide will help you understand the basics and get you up and running quickly.\n\nFirst, take a moment to explore the dashboard. You\'ll find your main navigation on the left side, with quick access to all major features.\n\nThe header contains your notifications, search, and account settings. Use the search function to quickly find anything across the platform.' },
    { id: 'gs-2', title: 'Creating Your First Project', summary: 'Step-by-step project creation', content: 'Creating a project is simple. Navigate to your workspace and click the "New Project" button.\n\n1. Enter a project name\n2. Select a template or start blank\n3. Configure initial settings\n4. Invite team members\n\nOnce created, you can customize your project settings and start adding content.' },
    { id: 'gs-3', title: 'Navigating the Dashboard', summary: 'Learn the main interface', content: 'The dashboard is your central hub for all activities. Here\'s what you\'ll find:\n\n• Overview cards showing key metrics\n• Recent activity feed\n• Quick actions for common tasks\n• Navigation to all platform sections\n\nCustomize your dashboard by rearranging widgets to suit your workflow.' },
    { id: 'gs-4', title: 'Setting Up Notifications', summary: 'Configure your alerts', content: 'Stay informed with customizable notifications. Access notification settings from your profile menu.\n\nYou can configure:\n• Email notifications\n• In-app alerts\n• Mobile push notifications\n• Digest frequency\n\nChoose what matters most to you and reduce noise from less important updates.' },
    { id: 'gs-5', title: 'Getting Help', summary: 'Find support when you need it', content: 'We\'re here to help! You have several options:\n\n• Search our Help Center for articles\n• Contact support through the help menu\n• Check documentation for technical details\n• Join our community forums\n\nMost questions can be answered through our comprehensive help articles.' },
  ],
  'account': [
    { id: 'acc-1', title: 'Updating Your Profile', summary: 'Edit your personal information', content: 'Keep your profile up to date by visiting Account Settings.\n\nYou can update:\n• Display name\n• Profile picture\n• Contact information\n• Time zone and language preferences\n\nChanges are saved automatically and reflected across the platform.' },
    { id: 'acc-2', title: 'Changing Your Password', summary: 'Security and password management', content: 'To change your password:\n\n1. Go to Account Settings > Security\n2. Click "Change Password"\n3. Enter your current password\n4. Enter and confirm your new password\n5. Click Save\n\nUse a strong, unique password with at least 12 characters.' },
    { id: 'acc-3', title: 'Two-Factor Authentication', summary: 'Add an extra layer of security', content: 'Enable 2FA for enhanced account security.\n\n1. Navigate to Security settings\n2. Click "Enable 2FA"\n3. Scan the QR code with your authenticator app\n4. Enter the verification code\n5. Save your backup codes\n\nWe recommend using apps like Google Authenticator or Authy.' },
    { id: 'acc-4', title: 'Managing Sessions', summary: 'View and control active sessions', content: 'Monitor your active sessions from Security settings.\n\nYou can:\n• View all active sessions\n• See device and location info\n• Revoke sessions remotely\n• Set session timeout preferences\n\nRegularly review sessions to ensure account security.' },
  ],
  'workspaces': [
    { id: 'ws-1', title: 'Creating a Workspace', summary: 'Set up a new workspace', content: 'Workspaces help organize your projects and team.\n\nTo create a workspace:\n1. Click the workspace switcher\n2. Select "Create Workspace"\n3. Enter a name and description\n4. Choose visibility settings\n5. Invite initial members\n\nYou can create multiple workspaces for different teams or purposes.' },
    { id: 'ws-2', title: 'Inviting Team Members', summary: 'Add people to your workspace', content: 'Invite team members to collaborate:\n\n1. Open Workspace Settings\n2. Go to Members\n3. Click "Invite"\n4. Enter email addresses\n5. Assign roles\n6. Send invitations\n\nInvited members will receive an email with instructions to join.' },
    { id: 'ws-3', title: 'Workspace Settings', summary: 'Configure workspace options', content: 'Customize your workspace from Settings:\n\n• General: Name, description, logo\n• Members: Manage team access\n• Permissions: Configure role abilities\n• Integrations: Connect external tools\n• Billing: Subscription and usage\n\nOnly workspace admins can modify settings.' },
  ],
  'security': [
    { id: 'sec-1', title: 'Understanding Roles', summary: 'Role types and capabilities', content: 'The platform uses role-based access control:\n\n• Owner: Full control, billing access\n• Admin: Manage members, settings\n• Editor: Create and modify content\n• Viewer: Read-only access\n\nRoles can be assigned at workspace or project level.' },
    { id: 'sec-2', title: 'Permission Levels', summary: 'How permissions work', content: 'Permissions control what users can do:\n\n• Read: View content\n• Write: Create and edit\n• Delete: Remove content\n• Admin: Manage settings\n\nPermissions cascade from workspace to project level unless overridden.' },
    { id: 'sec-3', title: 'Access Logs', summary: 'Monitor account activity', content: 'Review access logs to track activity:\n\n• Login attempts\n• Permission changes\n• Content modifications\n• API access\n\nLogs are retained for 90 days and can be exported for compliance.' },
    { id: 'sec-4', title: 'Security Best Practices', summary: 'Keep your account safe', content: 'Follow these security best practices:\n\n1. Use strong, unique passwords\n2. Enable two-factor authentication\n3. Review active sessions regularly\n4. Don\'t share login credentials\n5. Report suspicious activity\n\nContact support immediately if you suspect unauthorized access.' },
    { id: 'sec-5', title: 'Data Privacy', summary: 'How we protect your data', content: 'Your data privacy is our priority:\n\n• End-to-end encryption\n• Regular security audits\n• GDPR compliance\n• Data export options\n• Deletion policies\n\nRead our full privacy policy for complete details.' },
    { id: 'sec-6', title: 'API Security', summary: 'Secure API access', content: 'When using our API:\n\n• Keep tokens secret\n• Use environment variables\n• Rotate tokens regularly\n• Limit token scopes\n• Monitor API usage\n\nRevoke compromised tokens immediately from Settings.' },
  ],
  'billing': [
    { id: 'bill-1', title: 'Understanding Your Plan', summary: 'Plan features and limits', content: 'Your plan determines available features:\n\n• Free: Basic features, limited users\n• Pro: Advanced features, more storage\n• Enterprise: Custom limits, priority support\n\nView your current plan in Billing settings.' },
    { id: 'bill-2', title: 'Managing Subscriptions', summary: 'Upgrade, downgrade, or cancel', content: 'Manage your subscription from Billing:\n\n• Upgrade anytime (prorated)\n• Downgrade at cycle end\n• Cancel with data export\n• Pause if needed\n\nChanges take effect based on your billing cycle.' },
    { id: 'bill-3', title: 'Viewing Invoices', summary: 'Access billing history', content: 'View and download invoices:\n\n1. Go to Billing settings\n2. Click "Invoices"\n3. Select a period\n4. Download PDF or CSV\n\nInvoices are sent to your billing email automatically.' },
    { id: 'bill-4', title: 'Payment Methods', summary: 'Update billing information', content: 'Manage payment methods in Billing:\n\n• Add credit/debit cards\n• Set default payment\n• Update billing address\n• View payment history\n\nWe support major credit cards and some regional payment methods.' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// HOME VIEW - Main menu
// ─────────────────────────────────────────────────────────────────────────────
function HomeView({ onNavigate }: { onNavigate: (state: NavState) => void }) {
  return (
    <div className="px-5 py-4 space-y-1">
      <HelpLink
        icon={BookOpen}
        label="Help Center"
        description="Browse help articles and guides"
        onPress={() => onNavigate({ view: 'help-center' })}
      />
      
      <HelpLink
        icon={MessageSquare}
        label="Contact Support"
        description="Submit a support request"
        onPress={() => onNavigate({ view: 'contact' })}
      />
      
      <HelpLink
        icon={FileText}
        label="Documentation"
        description="Technical guides and references"
        onPress={() => onNavigate({ view: 'documentation' })}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELP CENTER VIEW - Category list
// ─────────────────────────────────────────────────────────────────────────────
function HelpCenterView({ onNavigate }: { onNavigate: (state: NavState) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredCategories = CATEGORIES.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-5 py-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-muted/50 border-0"
          />
        </div>
      </div>

      {/* Categories list */}
      <div className="flex-1 overflow-y-auto px-5 py-3">
        {filteredCategories.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">
            No categories found
          </p>
        ) : (
          <div className="space-y-2">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                role="button"
                tabIndex={0}
                onClick={() => onNavigate({ view: 'help-category', categoryId: category.id })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNavigate({ view: 'help-category', categoryId: category.id });
                  }
                }}
                className="p-4 rounded-xl hover:bg-muted/50 active:bg-muted cursor-pointer transition-colors flex items-center gap-3"
              >
                <div className="shrink-0 w-9 h-9 rounded-lg bg-muted/80 flex items-center justify-center">
                  <FolderOpen className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-foreground">{category.name}</p>
                  <p className="text-[13px] text-muted-foreground mt-0.5">{category.articleCount} articles</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY VIEW - Articles in a category
// ─────────────────────────────────────────────────────────────────────────────
function CategoryView({ 
  categoryId, 
  onNavigate 
}: { 
  categoryId: string; 
  onNavigate: (state: NavState) => void;
}) {
  const articles = ARTICLES[categoryId] || [];

  return (
    <div className="flex-1 overflow-y-auto px-5 py-3">
      {articles.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8">
          No articles in this category
        </p>
      ) : (
        <div className="space-y-2">
          {articles.map((article) => (
            <div
              key={article.id}
              role="button"
              tabIndex={0}
              onClick={() => onNavigate({ view: 'help-article', categoryId, articleId: article.id })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigate({ view: 'help-article', categoryId, articleId: article.id });
                }
              }}
              className="p-4 rounded-xl hover:bg-muted/50 active:bg-muted cursor-pointer transition-colors"
            >
              <p className="text-[15px] font-medium text-foreground">{article.title}</p>
              <p className="text-[13px] text-muted-foreground mt-1 line-clamp-2">{article.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ARTICLE VIEW - Full article content
// ─────────────────────────────────────────────────────────────────────────────
function ArticleView({ categoryId, articleId }: { categoryId: string; articleId: string }) {
  const articles = ARTICLES[categoryId] || [];
  const article = articles.find(a => a.id === articleId);

  if (!article) {
    return (
      <div className="px-5 py-8 text-center">
        <p className="text-muted-foreground">Article not found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4">
      <article className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-[13px] text-muted-foreground mb-3">{article.summary}</p>
        <div className="text-[14px] text-foreground leading-relaxed whitespace-pre-line">
          {article.content}
        </div>
      </article>
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
function getTitle(navState: NavState): string {
  switch (navState.view) {
    case 'home':
      return 'Help & Support';
    case 'help-center':
      return 'Help Center';
    case 'help-category': {
      const category = CATEGORIES.find(c => c.id === navState.categoryId);
      return category?.name || 'Category';
    }
    case 'help-article': {
      const articles = ARTICLES[navState.categoryId || ''] || [];
      const article = articles.find(a => a.id === navState.articleId);
      return article?.title || 'Article';
    }
    case 'contact':
      return 'Contact Support';
    case 'documentation':
      return 'Documentation';
    default:
      return 'Help & Support';
  }
}

function getBackState(navState: NavState): NavState | null {
  switch (navState.view) {
    case 'home':
      return null;
    case 'help-center':
      return { view: 'home' };
    case 'help-category':
      return { view: 'help-center' };
    case 'help-article':
      return { view: 'help-category', categoryId: navState.categoryId };
    case 'contact':
      return { view: 'home' };
    case 'documentation':
      return { view: 'home' };
    default:
      return { view: 'home' };
  }
}

export function HelpBottomSheet() {
  const [open, setOpen] = useState(false);
  const [navState, setNavState] = useState<NavState>({ view: 'home' });

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    // Reset to home view when drawer closes
    if (!isOpen) {
      setTimeout(() => setNavState({ view: 'home' }), 300);
    }
  }, []);

  const backState = getBackState(navState);

  const handleBack = () => {
    if (backState) {
      setNavState(backState);
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
        className="max-h-[85vh] bg-background border-t border-x border-border rounded-t-xl"
        style={{
          backgroundColor: 'hsl(var(--background))',
          boxShadow: '0 -8px 30px rgba(0, 0, 0, 0.25)',
        }}
      >
        <DrawerHeader className="pb-2 border-b border-border">
          <div className="flex items-center gap-3">
            {/* Back button - only shown on sub-views */}
            {backState && (
              <button
                type="button"
                onClick={handleBack}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors -ml-1"
                aria-label="Back"
              >
                <ArrowLeft className="h-4 w-4 text-foreground" strokeWidth={1.5} />
              </button>
            )}
            
            <DrawerTitle className="text-lg font-semibold text-foreground flex-1 truncate">
              {getTitle(navState)}
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
          {navState.view === 'home' && (
            <HomeView onNavigate={setNavState} />
          )}
          {navState.view === 'help-center' && (
            <HelpCenterView onNavigate={setNavState} />
          )}
          {navState.view === 'help-category' && navState.categoryId && (
            <CategoryView categoryId={navState.categoryId} onNavigate={setNavState} />
          )}
          {navState.view === 'help-article' && navState.categoryId && navState.articleId && (
            <ArticleView categoryId={navState.categoryId} articleId={navState.articleId} />
          )}
          {navState.view === 'contact' && (
            <ContactSupportView />
          )}
          {navState.view === 'documentation' && (
            <DocumentationView />
          )}
        </div>
        
        {/* Safe area padding for bottom */}
        <div className="h-4 bg-background" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
      </DrawerContent>
    </Drawer>
  );
}

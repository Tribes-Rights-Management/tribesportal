import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import { SessionGuard } from "@/components/session";
import { AppProtectedRoute } from "@/components/app/AppProtectedRoute";
import { AppLayout } from "@/layouts/AppLayout";
import { SystemConsoleLayout } from "@/layouts/SystemConsoleLayout";
import { ModuleLayout } from "@/layouts/ModuleLayout";
import { ModuleProtectedRoute } from "@/components/modules/ModuleProtectedRoute";
import { AppIndexRedirect } from "@/components/app/AppIndexRedirect";
import AppUiBoot from "@/components/AppUiBoot";

// Auth pages
import SignInPage from "@/pages/auth/SignInPage";
import CheckEmailPage from "@/pages/auth/CheckEmailPage";
import AuthErrorPage from "@/pages/auth/AuthErrorPage";
import AuthCallbackPage from "@/pages/auth/AuthCallbackPage";
import LinkExpiredPage from "@/pages/auth/LinkExpiredPage";
import UnauthorizedPage from "@/pages/auth/UnauthorizedPage";

// App pages - Licensing (legacy /app/licensing routes)
import LicensingDashboard from "@/pages/app/licensing/LicensingDashboard";
import LicensingCatalog from "@/pages/app/licensing/LicensingCatalog";
import LicensingRequests from "@/pages/app/licensing/LicensingRequests";
import LicensingLicenses from "@/pages/app/licensing/LicensingLicenses";
import LicensingReports from "@/pages/app/licensing/LicensingReports";
import LicensingDocuments from "@/pages/app/licensing/LicensingDocuments";
import LicensingSettings from "@/pages/app/licensing/LicensingSettings";

// App pages - Publishing (legacy /app/publishing routes)
import PublishingDashboard from "@/pages/app/publishing/PublishingDashboard";
import PublishingCatalog from "@/pages/app/publishing/PublishingCatalog";
import PublishingWorks from "@/pages/app/publishing/PublishingWorks";
import PublishingSplits from "@/pages/app/publishing/PublishingSplits";
import PublishingRegistrations from "@/pages/app/publishing/PublishingRegistrations";
import PublishingStatements from "@/pages/app/publishing/PublishingStatements";
import PublishingPayments from "@/pages/app/publishing/PublishingPayments";
import PublishingDocuments from "@/pages/app/publishing/PublishingDocuments";
import AccessRequestsPage from "@/pages/app/publishing/AccessRequestsPage";
import PublishingSettings from "@/pages/app/publishing/PublishingSettings";

// First-class module pages - Licensing (/licensing) - ORGANIZATION-SCOPED
import LicensingOverview from "@/pages/modules/licensing/LicensingOverview";
import LicensingRequestsPage from "@/pages/modules/licensing/LicensingRequestsPage";
import LicensingAgreementsPage from "@/pages/modules/licensing/LicensingAgreementsPage";
import LicensingPaymentsPage from "@/pages/modules/licensing/LicensingPaymentsPage";
import LicensingFeesPage from "@/pages/modules/licensing/LicensingFeesPage";
import LicensingReceiptsPage from "@/pages/modules/licensing/LicensingReceiptsPage";

// First-class module pages - Tribes Admin (/admin) - ORGANIZATION-SCOPED
import PortalOverview from "@/pages/modules/portal/PortalOverview";
import PortalAgreementsPage from "@/pages/modules/portal/PortalAgreementsPage";
import PortalStatementsPage from "@/pages/modules/portal/PortalStatementsPage";
import PortalDocumentsPage from "@/pages/modules/portal/PortalDocumentsPage";
import PortalPaymentsPage from "@/pages/modules/portal/PortalPaymentsPage";
import PortalInvoicesPage from "@/pages/modules/portal/PortalInvoicesPage";
import PortalPaymentMethodsPage from "@/pages/modules/portal/PortalPaymentMethodsPage";
import PortalPaymentHistoryPage from "@/pages/modules/portal/PortalPaymentHistoryPage";

// App pages - Access states
import PendingApprovalPage from "@/pages/app/PendingApprovalPage";
import NoAccessPage from "@/pages/app/NoAccessPage";
import AccessSuspendedPage from "@/pages/app/AccessSuspendedPage";

// System Console pages - COMPANY-LEVEL (executive only)
// NO product navigation, NO workspace selector
// Scoped to: governance, audit oversight, compliance, security
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ApprovalsPage from "@/pages/admin/ApprovalsPage";
import TenantsPage from "@/pages/admin/TenantsPage";
import UserDirectoryPage from "@/pages/admin/UserDirectoryPage";
import PermissionsPage from "@/pages/admin/PermissionsPage";
import AccountSettingsPage from "@/pages/admin/AccountSettingsPage";
import RLSAuditPage from "@/pages/admin/RLSAuditPage";
import AuthAccessReviewPage from "@/pages/admin/AuthAccessReviewPage";
import DisclosuresPage from "@/pages/admin/DisclosuresPage";
import CorrelationChainPage from "@/pages/admin/CorrelationChainPage";
import DataRoomPage from "@/pages/admin/DataRoomPage";

// Help Protected Route — gates access to Help Workstation
import { HelpProtectedRoute } from "@/components/help/HelpProtectedRoute";

// Help Workstation — FIRST-CLASS WORKSTATION (company-scoped)
import { HelpWorkstationLayout } from "@/layouts/HelpWorkstationLayout";
import {
  HelpOverviewPage,
  HelpAudiencesPage,
  HelpArticlesListPage,
  HelpArticleEditorPage as HelpWorkstationArticleEditorPage,
  HelpCategoriesPage as HelpWorkstationCategoriesPage,
  HelpTagsPage,
  HelpMessagesPage,
  HelpAnalyticsPage,
  HelpSettingsPage,
} from "@/pages/help-workstation";

// System Console - Help Center Management
import {
  HelpCenterOverview,
  HelpCenterArticles,
  HelpCenterArticleEditor,
  HelpCenterCategories,
  HelpCenterMessages,
  HelpCenterAnalytics,
} from "@/pages/admin/help-center";

// System Console - Executive Reporting (Platform Executives only)
import ExecutiveReportingPage from "@/pages/admin/reporting/ExecutiveReportingPage";
import BoardSummariesPage from "@/pages/admin/reporting/BoardSummariesPage";
import ComplianceMappingPage from "@/pages/admin/reporting/ComplianceMappingPage";

// System Console Billing pages - FINANCIAL GOVERNANCE (executive only)
import BillingGovernancePage from "@/pages/admin/billing/BillingGovernancePage";
import RevenueOverviewPage from "@/pages/admin/billing/RevenueOverviewPage";
import PlansConfigurationPage from "@/pages/admin/billing/PlansConfigurationPage";
import AllInvoicesPage from "@/pages/admin/billing/AllInvoicesPage";
import PaymentProvidersPage from "@/pages/admin/billing/PaymentProvidersPage";
import RefundsPage from "@/pages/admin/billing/RefundsPage";

// Auditor pages - READ-ONLY external access
import AuditorLanding from "@/pages/auditor/AuditorLanding";
import AuditorActivityLogPage from "@/pages/auditor/AuditorActivityLogPage";
import AuditorLicensingPage from "@/pages/auditor/AuditorLicensingPage";
import AuditorAccessLogPage from "@/pages/auditor/AuditorAccessLogPage";
import AuditorChainPage from "@/pages/auditor/AuditorChainPage";

// Account pages
import AccountLayout from "@/layouts/AccountLayout";
import AccountProfilePage from "@/pages/account/AccountProfilePage";
import AccountSecurityPage from "@/pages/account/AccountSecurityPage";
import AccountPreferencesPage from "@/pages/account/AccountPreferencesPage";

// Access state pages
import AccessRestrictedPage from "@/pages/app/AccessRestrictedPage";

// Error pages
import NotFoundPage from "@/pages/NotFoundPage";

// Root redirect component
import RootRedirect from "@/components/RootRedirect";

// Modules Home — landing page for all authenticated users
import WorkstationsHomePage from "@/pages/workstations/WorkstationsHomePage";

// Invitation acceptance page
import InviteAcceptPage from "@/pages/invite/InviteAcceptPage";

// Organization management pages
import OrganizationUsersPage from "@/pages/admin/OrganizationUsersPage";

const queryClient = new QueryClient();

/**
 * PATH PRESERVING REDIRECT COMPONENT
 * Redirects from legacy paths while preserving sub-paths
 * e.g., /help-workstation/articles → /help/articles
 */
function PathPreservingRedirect({ from, to }: { from: string; to: string }) {
  const location = useLocation();
  const subPath = location.pathname.replace(from, "");
  return <Navigate to={`${to}${subPath}`} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* iOS Safari underlay - prevents white bleed during bounce/overscroll */}
      <div
        id="ios-underlay"
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          background: "var(--tribes-bg)",
          pointerEvents: "none",
        }}
      />
      <Toaster />
      <Sonner />
      {/* Global UI boot - applies density preference and workspace policy overrides */}
      <AppUiBoot />
      {/* Session timeout guard - manages inactivity logout, warning modal, cross-tab sync */}
      <SessionGuard>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* ═══════════════════════════════════════════════════════════════════════
            CANONICAL AUTH ROUTES (/sign-in)
        ═══════════════════════════════════════════════════════════════════════ */}
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/check-email" element={<CheckEmailPage />} />
        
        {/* Legacy auth redirects → /sign-in */}
        <Route path="/auth" element={<Navigate to="/sign-in" replace />} />
        <Route path="/auth/sign-in" element={<Navigate to="/sign-in" replace />} />
        <Route path="/auth/login" element={<Navigate to="/sign-in" replace />} />
        <Route path="/login" element={<Navigate to="/sign-in" replace />} />
        <Route path="/auth/check-email" element={<Navigate to="/check-email" replace />} />
        <Route path="/auth/error" element={<AuthErrorPage />} />
        <Route path="/auth/link-expired" element={<LinkExpiredPage />} />
        <Route path="/auth/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* ═══════════════════════════════════════════════════════════════════════
            INVITATION ACCEPTANCE (/invite/accept)
            Public route - validates token and accepts invitation
        ═══════════════════════════════════════════════════════════════════════ */}
        <Route path="/invite/accept" element={<InviteAcceptPage />} />

        {/* ═══════════════════════════════════════════════════════════════════════
            MODULES HOME (/workspaces) — LANDING PAGE FOR ALL AUTHENTICATED USERS
            Shows module tiles based on user permissions
        ═══════════════════════════════════════════════════════════════════════ */}
        <Route path="/workspaces" element={
          <AppProtectedRoute>
            <WorkstationsHomePage />
          </AppProtectedRoute>
        } />
        
        {/* Legacy redirects → /workspaces */}
        <Route path="/workstations" element={<Navigate to="/workspaces" replace />} />
        <Route path="/home" element={<Navigate to="/workspaces" replace />} />
        <Route path="/dashboard" element={<Navigate to="/workspaces" replace />} />

        {/* App access state pages (outside protected layout) */}
        <Route path="/app/pending" element={<PendingApprovalPage />} />
        <Route path="/app/no-access" element={<NoAccessPage />} />
        <Route path="/app/suspended" element={<AccessSuspendedPage />} />
        <Route path="/app/restricted" element={<AccessRestrictedPage />} />

        {/* ═══════════════════════════════════════════════════════════════════════
            FIRST-CLASS MODULE: LICENSING (/licensing)
            Permission: licensing.view, licensing.manage, licensing.approve
        ═══════════════════════════════════════════════════════════════════════ */}
        <Route path="/licensing" element={
          <ModuleProtectedRoute requiredPermission="licensing.view">
            <ModuleLayout />
          </ModuleProtectedRoute>
        }>
          <Route index element={<LicensingOverview />} />
          <Route path="requests" element={<LicensingRequestsPage />} />
          <Route path="agreements" element={<LicensingAgreementsPage />} />
          <Route path="payments" element={<LicensingPaymentsPage />} />
          <Route path="payments/fees" element={<LicensingFeesPage />} />
          <Route path="payments/receipts" element={<LicensingReceiptsPage />} />
        </Route>
        
        {/* Legacy licensing redirects */}
        <Route path="/tribes-licensing/*" element={<PathPreservingRedirect from="/tribes-licensing" to="/licensing" />} />

        {/* ═══════════════════════════════════════════════════════════════════════
            FIRST-CLASS MODULE: TRIBES ADMIN (/admin) — ORGANIZATION-SCOPED
            Permission: portal.view, portal.download, portal.submit
        ═══════════════════════════════════════════════════════════════════════ */}
        <Route path="/admin" element={
          <ModuleProtectedRoute requiredPermission="portal.view">
            <ModuleLayout />
          </ModuleProtectedRoute>
        }>
          <Route index element={<PortalOverview />} />
          <Route path="agreements" element={<PortalAgreementsPage />} />
          <Route path="statements" element={<PortalStatementsPage />} />
          <Route path="documents" element={<PortalDocumentsPage />} />
          <Route path="payments" element={<PortalPaymentsPage />} />
          <Route path="payments/invoices" element={<PortalInvoicesPage />} />
          <Route path="payments/methods" element={<PortalPaymentMethodsPage />} />
          <Route path="payments/history" element={<PortalPaymentHistoryPage />} />
        </Route>
        
        {/* Legacy Tribes Admin redirects */}
        <Route path="/tribes-admin/*" element={<PathPreservingRedirect from="/tribes-admin" to="/admin" />} />
        <Route path="/portal/*" element={<PathPreservingRedirect from="/portal" to="/admin" />} />

        {/* ═══════════════════════════════════════════════════════════════════════
            LEGACY APP ROUTES (/app)
            These remain for backward compatibility with existing context system
        ═══════════════════════════════════════════════════════════════════════ */}
        <Route path="/app" element={<AppProtectedRoute><AppLayout /></AppProtectedRoute>}>
          {/* Index route - redirects to active context */}
          <Route index element={<AppIndexRedirect />} />

          {/* Licensing context routes */}
          <Route path="licensing" element={<AppProtectedRoute requiredContext="licensing"><LicensingDashboard /></AppProtectedRoute>} />
          <Route path="licensing/catalog" element={<AppProtectedRoute requiredContext="licensing"><LicensingCatalog /></AppProtectedRoute>} />
          <Route path="licensing/requests" element={<AppProtectedRoute requiredContext="licensing"><LicensingRequests /></AppProtectedRoute>} />
          <Route path="licensing/licenses" element={<AppProtectedRoute requiredContext="licensing"><LicensingLicenses /></AppProtectedRoute>} />
          <Route path="licensing/reports" element={<AppProtectedRoute requiredContext="licensing"><LicensingReports /></AppProtectedRoute>} />
          <Route path="licensing/documents" element={<AppProtectedRoute requiredContext="licensing"><LicensingDocuments /></AppProtectedRoute>} />
          <Route path="licensing/settings" element={<AppProtectedRoute requiredContext="licensing"><LicensingSettings /></AppProtectedRoute>} />

          {/* Publishing context routes */}
          <Route path="publishing" element={<AppProtectedRoute requiredContext="publishing"><PublishingDashboard /></AppProtectedRoute>} />
          <Route path="publishing/catalog" element={<AppProtectedRoute requiredContext="publishing"><PublishingCatalog /></AppProtectedRoute>} />
          <Route path="publishing/works" element={<AppProtectedRoute requiredContext="publishing"><PublishingWorks /></AppProtectedRoute>} />
          <Route path="publishing/splits" element={<AppProtectedRoute requiredContext="publishing"><PublishingSplits /></AppProtectedRoute>} />
          <Route path="publishing/registrations" element={<AppProtectedRoute requiredContext="publishing"><PublishingRegistrations /></AppProtectedRoute>} />
          <Route path="publishing/statements" element={<AppProtectedRoute requiredContext="publishing"><PublishingStatements /></AppProtectedRoute>} />
          <Route path="publishing/payments" element={<AppProtectedRoute requiredContext="publishing"><PublishingPayments /></AppProtectedRoute>} />
          <Route path="publishing/documents" element={<AppProtectedRoute requiredContext="publishing"><PublishingDocuments /></AppProtectedRoute>} />
          <Route path="publishing/access-requests" element={<AppProtectedRoute requiredContext="publishing"><AccessRequestsPage /></AppProtectedRoute>} />
          <Route path="publishing/settings" element={<AppProtectedRoute requiredContext="publishing"><PublishingSettings /></AppProtectedRoute>} />
        </Route>

        {/* ═══════════════════════════════════════════════════════════════════════
            SYSTEM CONSOLE (/console) — COMPANY-LEVEL GOVERNANCE
            Access: platform_admin only (executive roles)
            Scope: governance, audit oversight, compliance, security
            NO product navigation, NO workspace selector
        ═══════════════════════════════════════════════════════════════════════ */}
        <Route path="/console" element={<RoleProtectedRoute allowedRoles={["admin"]}><SystemConsoleLayout /></RoleProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="approvals" element={<ApprovalsPage />} />
          <Route path="tenants" element={<TenantsPage />} />
          <Route path="tenants/:tenantId/users" element={<OrganizationUsersPage />} />
          <Route path="users" element={<UserDirectoryPage />} />
          <Route path="users/:userId/permissions" element={<PermissionsPage />} />
          <Route path="settings" element={<AccountSettingsPage />} />
          <Route path="rls-audit" element={<RLSAuditPage />} />
          <Route path="security" element={<AuthAccessReviewPage />} />
          <Route path="security/rls" element={<RLSAuditPage />} />
          <Route path="security/auth" element={<AuthAccessReviewPage />} />
          <Route path="security/sessions" element={<AccountSettingsPage />} />
          <Route path="disclosures" element={<DisclosuresPage />} />
          <Route path="data-room" element={<DataRoomPage />} />
          <Route path="chain" element={<CorrelationChainPage />} />
          {/* Executive Reporting Routes */}
          <Route path="reporting" element={<ExecutiveReportingPage />} />
          <Route path="reporting/summaries" element={<BoardSummariesPage />} />
          <Route path="reporting/compliance" element={<ComplianceMappingPage />} />
          {/* Financial Governance Routes */}
          <Route path="billing" element={<BillingGovernancePage />} />
          <Route path="billing/revenue" element={<RevenueOverviewPage />} />
          <Route path="billing/plans" element={<PlansConfigurationPage />} />
          <Route path="billing/invoices" element={<AllInvoicesPage />} />
          <Route path="billing/providers" element={<PaymentProvidersPage />} />
          <Route path="billing/refunds" element={<RefundsPage />} />
          {/* Help Center Management Routes */}
          <Route path="help-center" element={<HelpCenterOverview />} />
          <Route path="help-center/articles" element={<HelpCenterArticles />} />
          <Route path="help-center/articles/new" element={<HelpCenterArticleEditor />} />
          <Route path="help-center/articles/:id/edit" element={<HelpCenterArticleEditor />} />
          <Route path="help-center/categories" element={<HelpCenterCategories />} />
          <Route path="help-center/messages" element={<HelpCenterMessages />} />
          <Route path="help-center/analytics" element={<HelpCenterAnalytics />} />
        </Route>
        
        {/* Legacy System Console redirects → /console */}
        <Route path="/system-console/*" element={<PathPreservingRedirect from="/system-console" to="/console" />} />
        <Route path="/system_console/*" element={<PathPreservingRedirect from="/system_console" to="/console" />} />
        <Route path="/systemconsole/*" element={<PathPreservingRedirect from="/systemconsole" to="/console" />} />

        {/* ═══════════════════════════════════════════════════════════════════════
            EXTERNAL AUDITOR ROUTES (/auditor)
            Permission: external_auditor role - read-only access
        ═══════════════════════════════════════════════════════════════════════ */}
        <Route path="/auditor" element={<RoleProtectedRoute allowedRoles={["auditor"]}><AuditorLanding /></RoleProtectedRoute>} />
        <Route path="/auditor/activity" element={<RoleProtectedRoute allowedRoles={["auditor"]}><AuditorActivityLogPage /></RoleProtectedRoute>} />
        <Route path="/auditor/licensing" element={<RoleProtectedRoute allowedRoles={["auditor"]}><AuditorLicensingPage /></RoleProtectedRoute>} />
        <Route path="/auditor/access" element={<RoleProtectedRoute allowedRoles={["auditor"]}><AuditorAccessLogPage /></RoleProtectedRoute>} />
        <Route path="/auditor/chain" element={<RoleProtectedRoute allowedRoles={["auditor"]}><AuditorChainPage /></RoleProtectedRoute>} />

        {/* ═══════════════════════════════════════════════════════════════════════
            HELP WORKSTATION (/help) — FIRST-CLASS WORKSTATION
            Permission: platform_admin OR (platform_user + can_manage_help)
            NOT accessible to external auditors, licensing, or portal users
            Has its own layout, sidebar nav, and full management capabilities
        ═══════════════════════════════════════════════════════════════════════ */}
        <Route path="/help" element={<HelpProtectedRoute><HelpWorkstationLayout /></HelpProtectedRoute>}>
          <Route index element={<HelpOverviewPage />} />
          <Route path="audiences" element={<HelpAudiencesPage />} />
          <Route path="categories" element={<HelpWorkstationCategoriesPage />} />
          <Route path="articles" element={<HelpArticlesListPage />} />
          <Route path="articles/new" element={<HelpWorkstationArticleEditorPage />} />
          <Route path="articles/:id" element={<HelpWorkstationArticleEditorPage />} />
          <Route path="tags" element={<HelpTagsPage />} />
          <Route path="messages" element={<HelpMessagesPage />} />
          <Route path="analytics" element={<HelpAnalyticsPage />} />
          <Route path="settings" element={<HelpSettingsPage />} />
        </Route>
        
        {/* Legacy Help Workstation redirects → /help */}
        <Route path="/help-workstation/*" element={<PathPreservingRedirect from="/help-workstation" to="/help" />} />
        <Route path="/help_workstation/*" element={<PathPreservingRedirect from="/help_workstation" to="/help" />} />
        <Route path="/helpcenter/*" element={<PathPreservingRedirect from="/helpcenter" to="/help" />} />

        {/* ═══════════════════════════════════════════════════════════════════════
            ACCOUNT SETTINGS HUB (/account)
            Available to all authenticated users
        ═══════════════════════════════════════════════════════════════════════ */}
        <Route path="/account" element={<AccountLayout />}>
          <Route index element={null} />
          <Route path="profile" element={<AccountProfilePage />} />
          <Route path="security" element={<AccountSecurityPage />} />
          <Route path="preferences" element={<AccountPreferencesPage />} />
        </Route>

        {/* Access restricted page - for permission issues (NOT a 404) */}
        <Route path="/restricted" element={<AccessRestrictedPage />} />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </SessionGuard>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

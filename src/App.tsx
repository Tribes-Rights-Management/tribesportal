import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import { AppProtectedRoute } from "@/components/app/AppProtectedRoute";
import { AppLayout } from "@/layouts/AppLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ModuleLayout } from "@/layouts/ModuleLayout";
import { ModuleProtectedRoute } from "@/components/modules/ModuleProtectedRoute";
import { AppIndexRedirect } from "@/components/app/AppIndexRedirect";

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

// First-class module pages - Licensing (/licensing)
import LicensingOverview from "@/pages/modules/licensing/LicensingOverview";
import LicensingRequestsPage from "@/pages/modules/licensing/LicensingRequestsPage";
import LicensingAgreementsPage from "@/pages/modules/licensing/LicensingAgreementsPage";

// First-class module pages - Client Portal (/portal)
import PortalOverview from "@/pages/modules/portal/PortalOverview";
import PortalAgreementsPage from "@/pages/modules/portal/PortalAgreementsPage";
import PortalStatementsPage from "@/pages/modules/portal/PortalStatementsPage";
import PortalDocumentsPage from "@/pages/modules/portal/PortalDocumentsPage";

// App pages - Access states
import PendingApprovalPage from "@/pages/app/PendingApprovalPage";
import NoAccessPage from "@/pages/app/NoAccessPage";
import AccessSuspendedPage from "@/pages/app/AccessSuspendedPage";

// Admin pages
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

// Auditor pages
import AuditorLanding from "@/pages/auditor/AuditorLanding";
import AuditorActivityLogPage from "@/pages/auditor/AuditorActivityLogPage";
import AuditorLicensingPage from "@/pages/auditor/AuditorLicensingPage";
import AuditorAccessLogPage from "@/pages/auditor/AuditorAccessLogPage";
import AuditorChainPage from "@/pages/auditor/AuditorChainPage";

// Account pages
import AccountPage from "@/pages/account/AccountPage";
import AccountProfilePage from "@/pages/account/AccountProfilePage";
import AccountSecurityPage from "@/pages/account/AccountSecurityPage";
import AccountPreferencesPage from "@/pages/account/AccountPreferencesPage";

// Access state pages
import AccessRestrictedPage from "@/pages/app/AccessRestrictedPage";

// Error pages
import NotFoundPage from "@/pages/NotFoundPage";

// Root redirect component
import RootRedirect from "@/components/RootRedirect";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Auth routes */}
        <Route path="/auth" element={<Navigate to="/auth/sign-in" replace />} />
        <Route path="/auth/sign-in" element={<SignInPage />} />
        <Route path="/auth/check-email" element={<CheckEmailPage />} />
        <Route path="/auth/error" element={<AuthErrorPage />} />
        <Route path="/auth/link-expired" element={<LinkExpiredPage />} />
        <Route path="/auth/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

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
        </Route>

        {/* ═══════════════════════════════════════════════════════════════════════
            FIRST-CLASS MODULE: CLIENT PORTAL (/portal)
            Permission: portal.view, portal.download, portal.submit
        ═══════════════════════════════════════════════════════════════════════ */}
        <Route path="/portal" element={
          <ModuleProtectedRoute requiredPermission="portal.view">
            <ModuleLayout />
          </ModuleProtectedRoute>
        }>
          <Route index element={<PortalOverview />} />
          <Route path="agreements" element={<PortalAgreementsPage />} />
          <Route path="statements" element={<PortalStatementsPage />} />
          <Route path="documents" element={<PortalDocumentsPage />} />
        </Route>

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

        {/* Admin routes with layout */}
        <Route path="/admin" element={<RoleProtectedRoute allowedRoles={["admin"]}><AdminLayout /></RoleProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="approvals" element={<ApprovalsPage />} />
          <Route path="tenants" element={<TenantsPage />} />
          <Route path="users" element={<UserDirectoryPage />} />
          <Route path="users/:userId/permissions" element={<PermissionsPage />} />
          <Route path="settings" element={<AccountSettingsPage />} />
          <Route path="rls-audit" element={<RLSAuditPage />} />
          <Route path="security" element={<AuthAccessReviewPage />} />
          <Route path="security/rls" element={<RLSAuditPage />} />
          <Route path="security/auth" element={<AuthAccessReviewPage />} />
          <Route path="security/sessions" element={<AccountSettingsPage />} />
          <Route path="disclosures" element={<DisclosuresPage />} />
          <Route path="chain" element={<CorrelationChainPage />} />
        </Route>

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
            ACCOUNT SETTINGS HUB (/account)
            Available to all authenticated users
        ═══════════════════════════════════════════════════════════════════════ */}
        <Route path="/account" element={<AccountPage />}>
          <Route path="profile" element={<AccountProfilePage />} />
          <Route path="security" element={<AccountSecurityPage />} />
          <Route path="preferences" element={<AccountPreferencesPage />} />
        </Route>

        {/* Access restricted page - for permission issues (NOT a 404) */}
        <Route path="/restricted" element={<AccessRestrictedPage />} />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
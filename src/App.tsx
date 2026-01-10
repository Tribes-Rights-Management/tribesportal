import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import { AppProtectedRoute } from "@/components/app/AppProtectedRoute";
import { AppLayout } from "@/layouts/AppLayout";
import { AppIndexRedirect } from "@/components/app/AppIndexRedirect";

// Auth pages
import SignInPage from "@/pages/auth/SignInPage";
import CheckEmailPage from "@/pages/auth/CheckEmailPage";
import AuthErrorPage from "@/pages/auth/AuthErrorPage";
import AuthCallbackPage from "@/pages/auth/AuthCallbackPage";
import LinkExpiredPage from "@/pages/auth/LinkExpiredPage";
import UnauthorizedPage from "@/pages/auth/UnauthorizedPage";

// App pages - Licensing
import LicensingDashboard from "@/pages/app/licensing/LicensingDashboard";
import LicensingCatalog from "@/pages/app/licensing/LicensingCatalog";
import LicensingRequests from "@/pages/app/licensing/LicensingRequests";
import LicensingLicenses from "@/pages/app/licensing/LicensingLicenses";
import LicensingReports from "@/pages/app/licensing/LicensingReports";
import LicensingDocuments from "@/pages/app/licensing/LicensingDocuments";
import LicensingSettings from "@/pages/app/licensing/LicensingSettings";

// App pages - Publishing
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

// App pages - Access states
import PendingApprovalPage from "@/pages/app/PendingApprovalPage";
import NoAccessPage from "@/pages/app/NoAccessPage";
import AccessSuspendedPage from "@/pages/app/AccessSuspendedPage";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ApprovalsPage from "@/pages/admin/ApprovalsPage";
import TenantsPage from "@/pages/admin/TenantsPage";
import UserDirectoryPage from "@/pages/admin/UserDirectoryPage";
import RLSAuditPage from "@/pages/admin/RLSAuditPage";
import SecurityVerificationPage from "@/pages/admin/SecurityVerificationPage";

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

        {/* App routes with layout */}
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

        {/* Admin routes */}
        <Route path="/admin" element={<RoleProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></RoleProtectedRoute>} />
        <Route path="/admin/approvals" element={<RoleProtectedRoute allowedRoles={["admin"]}><ApprovalsPage /></RoleProtectedRoute>} />
        <Route path="/admin/tenants" element={<RoleProtectedRoute allowedRoles={["admin"]}><TenantsPage /></RoleProtectedRoute>} />
        <Route path="/admin/users" element={<RoleProtectedRoute allowedRoles={["admin"]}><UserDirectoryPage /></RoleProtectedRoute>} />
        <Route path="/admin/rls-audit" element={<RoleProtectedRoute allowedRoles={["admin"]}><RLSAuditPage /></RoleProtectedRoute>} />
        <Route path="/admin/security" element={<RoleProtectedRoute allowedRoles={["admin"]}><SecurityVerificationPage /></RoleProtectedRoute>} />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
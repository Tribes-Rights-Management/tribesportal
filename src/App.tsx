import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import AuthPage from "./pages/AuthPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import NotFound from "./pages/NotFound";

// Portal pages (protected)
import PortalPage from "./pages/PortalPage";
import PortalDashboard from "./pages/PortalDashboard";
import PortalLicensesPage from "./pages/PortalLicensesPage";
import RequestFormPage from "./pages/RequestFormPage";
import RequestDetailPage from "./pages/RequestDetailPage";
import AgreementHandoffPage from "./pages/AgreementHandoffPage";
import MyAccountPage from "./pages/MyAccountPage";
import SettingsPage from "./pages/SettingsPage";
import DataRetentionPage from "./pages/DataRetentionPage";

// Admin pages (protected)
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLicensesPage from "./pages/AdminLicensesPage";
import AdminRequestDetailPage from "./pages/AdminRequestDetailPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminAccessRequestsPage from "./pages/AdminAccessRequestsPage";
import AdminAccessRequestDetailPage from "./pages/AdminAccessRequestDetailPage";
import AdminContactSubmissionsPage from "./pages/AdminContactSubmissionsPage";
import AdminGuidelinesPage from "./pages/AdminGuidelinesPage";
import AdminConductPolicyPage from "./pages/AdminConductPolicyPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<AuthPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Portal routes (protected) */}
            <Route path="/portal" element={<ProtectedRoute><PortalPage /></ProtectedRoute>} />
            <Route path="/portal/dashboard" element={<ProtectedRoute><PortalDashboard /></ProtectedRoute>} />
            <Route path="/portal/licenses" element={<ProtectedRoute><PortalLicensesPage /></ProtectedRoute>} />
            <Route path="/portal/request/new" element={<ProtectedRoute><RequestFormPage /></ProtectedRoute>} />
            <Route path="/portal/request/:id" element={<ProtectedRoute><RequestDetailPage /></ProtectedRoute>} />
            <Route path="/portal/agreement/:id" element={<ProtectedRoute><AgreementHandoffPage /></ProtectedRoute>} />
            <Route path="/portal/account" element={<ProtectedRoute><MyAccountPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/data-retention" element={<ProtectedRoute><DataRetentionPage /></ProtectedRoute>} />

            {/* Admin routes (protected) */}
            <Route path="/admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/licenses" element={<ProtectedRoute><AdminLicensesPage /></ProtectedRoute>} />
            <Route path="/admin/licenses/:id" element={<ProtectedRoute><AdminRequestDetailPage /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><AdminUsersPage /></ProtectedRoute>} />
            <Route path="/admin/access-requests" element={<ProtectedRoute><AdminAccessRequestsPage /></ProtectedRoute>} />
            <Route path="/admin/access-requests/:id" element={<ProtectedRoute><AdminAccessRequestDetailPage /></ProtectedRoute>} />
            <Route path="/admin/contact-submissions" element={<ProtectedRoute><AdminContactSubmissionsPage /></ProtectedRoute>} />
            <Route path="/admin/guidelines" element={<ProtectedRoute><AdminGuidelinesPage /></ProtectedRoute>} />
            <Route path="/admin/conduct-policy" element={<ProtectedRoute><AdminConductPolicyPage /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

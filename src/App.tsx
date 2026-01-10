import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import RootRedirect from "@/components/RootRedirect";

// Auth pages
import SignInPage from "@/pages/auth/SignInPage";
import CheckEmailPage from "@/pages/auth/CheckEmailPage";
import AuthErrorPage from "@/pages/auth/AuthErrorPage";
import AuthCallbackPage from "@/pages/auth/AuthCallbackPage";

// Protected pages
import DashboardPage from "@/pages/DashboardPage";
import LicensingPage from "@/pages/LicensingPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserDirectoryPage from "@/pages/admin/UserDirectoryPage";

// Error pages
import NotFoundPage from "@/pages/NotFoundPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        {/* Root redirect - smart routing based on auth/role */}
        <Route path="/" element={<RootRedirect />} />

        {/* Auth redirect */}
        <Route path="/auth" element={<Navigate to="/auth/sign-in" replace />} />

        {/* Public auth routes */}
        <Route path="/auth/sign-in" element={<SignInPage />} />
        <Route path="/auth/check-email" element={<CheckEmailPage />} />
        <Route path="/auth/error" element={<AuthErrorPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Protected routes - Client */}
        <Route
          path="/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={["client"]}>
              <DashboardPage />
            </RoleProtectedRoute>
          }
        />

        {/* Protected routes - Licensing */}
        <Route
          path="/licensing"
          element={
            <RoleProtectedRoute allowedRoles={["licensing"]}>
              <LicensingPage />
            </RoleProtectedRoute>
          }
        />

        {/* Protected routes - Admin */}
        <Route
          path="/admin"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <UserDirectoryPage />
            </RoleProtectedRoute>
          }
        />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
